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
	DataType    string
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
			return strings.HasPrefix(entries[i].Name(), "init-") || entries[i].Name() < entries[j].Name()
		})
	}

	var initData []byte

	for i, e := range entries {
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

				var dataType string
				var timeOffset time.Duration

				if i == 0 {
					initData = data
					dataType = "init"
					timeOffset = 0
				} else {
					dataType = "data"
					timeOffset = 3000
				}

				log.Println(entryName)

				onFileRead(DataMessage{
					DataType: dataType,
					Data: DataSource{
						Init:   initData,
						Source: data,
					},
					Metadata: DataMetadata{
						Name:      dirPath,
						Duration:  9000,
						Thumbnail: "",
					},
				})

				time.Sleep(timeOffset * time.Millisecond)
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
			DataType:    src.DataType,
			Data:        src.Data,
			Metadata:    src.Metadata,
		}

		ch <- data
	}

	ReadFolder(src, handleFileRead, true)
}

func DataPublisher(ch <-chan DataMessage, ctx context.Context, connection *pubsub.NatsService, liveServiceSubjectName string) {
	for data := range ch {
		if data.DataType == "init" {
			jsonData, err := json.Marshal(DataMetadata{
				SubjectName: data.SubjectName,
				Name:        data.Metadata.Name,
				Duration:    data.Metadata.Duration,
				Thumbnail:   data.Metadata.Thumbnail,
			})
			if err != nil {
				log.Fatalf("Error marshaling struct: %v", err)
			} else {
				nats.PublishData(ctx, connection, liveServiceSubjectName, jsonData)
			}
		} else {
			chunkData := joinWithLengthPrefixes(data.Data.Init, data.Data.Source)

			nats.PublishData(ctx, connection, data.SubjectName, chunkData)
		}
	}
}
