package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"
	datahandlers "github.com/lkatkus/PurrFlix/go-publisher/dataHandlers"
	"github.com/lkatkus/PurrFlix/go-publisher/nats"
)

type DataSource struct {
	subjectName string
	src         string
}

const LIVE_SERVICE_SUBJECT_NAME = "laimonas.purrflix-publisher.live"

var ASSETS_FOLDER []DataSource = []DataSource{
	{subjectName: "laimonas.purrflix-publisher.cats", src: "../video-server/public/cats"},
	{subjectName: "laimonas.purrflix-publisher.dogs", src: "../video-server/public/dogs"},
	{subjectName: "laimonas.purrflix-publisher.birds", src: "../video-server/public/birds"},
	{subjectName: "laimonas.purrflix-publisher.reptiles", src: "../video-server/public/reptiles"},
	{subjectName: "laimonas.purrflix-publisher.horses", src: "../video-server/public/horses"},
	{subjectName: "laimonas.purrflix-publisher.fishes", src: "../video-server/public/fishes"},
	{subjectName: "laimonas.purrflix-publisher.spiders", src: "../video-server/public/spiders"},
	{subjectName: "laimonas.purrflix-publisher.rocks", src: "../video-server/public/rocks"},
	{subjectName: "laimonas.purrflix-publisher.debug", src: "../video-server/public/debug"},
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	ctx, cancel := context.WithCancel(context.Background())

	connection := nats.CreateConnection()
	dataChan := make(chan datahandlers.DataMessage)

	go datahandlers.DataPublisher(dataChan, ctx, connection, LIVE_SERVICE_SUBJECT_NAME)

	for _, a := range ASSETS_FOLDER {
		go datahandlers.DataReader(dataChan, a.subjectName, a.src)
	}

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)

	<-signalChan

	cancel()
	connection.CloseConnection()

	fmt.Println("Shutting down...")
}
