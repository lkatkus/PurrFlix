package datahandlers

import (
	"bytes"
	"context"
	"encoding/binary"
	"encoding/json"
	"log"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/SyntropyNet/pubsub-go/pubsub"
	"github.com/lkatkus/PurrFlix/go-publisher/nats"
)

type DataMetadata struct {
	SubjectName string `json:"subjectName"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Duration    int    `json:"duration"`
	Thumbnail   string `json:"thumbnail"`
}

type DataSource struct {
	Init   []byte `json:"init"`
	Source []byte `json:"source"`
}

type DataSourceTx struct {
	Init   string `json:"init"`
	Source string `json:"source"`
}

type DataMessage struct {
	SubjectName string
	Data        DataSource
	Metadata    DataMetadata
}

func joinWithLengthPrefixes(a, b []byte) []byte {
	buffer := new(bytes.Buffer)

	lengthA := uint32(len(a))
	binary.Write(buffer, binary.BigEndian, lengthA)
	buffer.Write(a)

	lengthB := uint32(len(b))
	binary.Write(buffer, binary.BigEndian, lengthB)
	buffer.Write(b)

	return buffer.Bytes()
}

func ReadFolder(dirPath string, onFileRead func(DataMessage), root bool) {
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		log.Fatalf("Failed to read directory contents: %v", err)
	}

	if !root {
		sort.Slice(entries, func(i, j int) bool {
			var currentEntryName = entries[i].Name()
			var nextEntryName = entries[j].Name()

			return strings.HasSuffix(currentEntryName, ".json") || strings.HasPrefix(currentEntryName, "init-") || currentEntryName < nextEntryName
		})
	}

	var initData []byte
	var metadataData DataMetadata

	for _, e := range entries {
		var entryName = e.Name()
		s := []string{dirPath, entryName}
		var entryPath = strings.Join(s, "/")

		if e.IsDir() {
			ReadFolder(entryPath, onFileRead, false)
		} else {
			if strings.HasSuffix(entryName, ".m4s") {
				data, err := os.ReadFile(entryPath)
				if err != nil {
					log.Fatalf("Failed to read file: %v", err)
				}

				var timeOffset time.Duration = 3000

				if strings.HasPrefix(entryName, "init-") {
					initData = data
				} else {
					log.Println(entryName)

					onFileRead(DataMessage{
						Data: DataSource{
							Init:   initData,
							Source: data,
						},
						Metadata: metadataData,
					})
					time.Sleep(timeOffset * time.Millisecond)
				}
			} else if strings.HasSuffix(entryName, ".json") {
				data, err := os.ReadFile(entryPath)
				if err != nil {
					log.Fatalf("Failed to read file: %v", err)
				}

				var jsonData DataMetadata

				json.Unmarshal(data, &jsonData)

				metadataData = DataMetadata{
					Name:        dirPath,
					Description: "Some relevant description",
					Duration:    9000,
					Thumbnail:   jsonData.Thumbnail,
				}
			}
		}
	}

	if root {
		ReadFolder(dirPath, onFileRead, true)
	}
}

func DataReader(ch chan<- DataMessage, rootSubjectName string, src string) {
	handleFileRead := func(src DataMessage) {
		data := DataMessage{
			SubjectName: rootSubjectName,
			Data:        src.Data,
			Metadata:    src.Metadata,
		}

		ch <- data
	}

	ReadFolder(src, handleFileRead, true)
}

func DataPublisher(ch <-chan DataMessage, ctx context.Context, connection *pubsub.NatsService, liveServiceSubjectName string) {
	for data := range ch {
		jsonData, err := json.Marshal(DataMetadata{
			SubjectName: data.SubjectName,
			Name:        data.Metadata.Name,
			Description: data.Metadata.Description,
			Duration:    data.Metadata.Duration,
			Thumbnail:   data.Metadata.Thumbnail,
		})
		if err != nil {
			log.Fatalf("Error marshaling struct: %v", err)
		} else {
			nats.PublishData(ctx, connection, liveServiceSubjectName, jsonData)
		}

		chunkData := joinWithLengthPrefixes(data.Data.Init, data.Data.Source)

		nats.PublishData(ctx, connection, data.SubjectName, chunkData)
	}
}
