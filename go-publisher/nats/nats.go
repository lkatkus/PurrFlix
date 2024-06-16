package nats

import (
	"context"
	"log"
	"os"

	"github.com/SyntropyNet/pubsub-go/pubsub"
	"github.com/nats-io/nats.go"
)

func CreateConnection() *pubsub.NatsService {
	natsServerUrl := os.Getenv("NATS_BROKER_URL")
	publisherAccessToken := os.Getenv("PUBLISHER_ACCESS_TOKEN")

	jwt, _ := pubsub.CreateAppJwt(publisherAccessToken)

	opts := []nats.Option{}
	opts = append(opts, nats.UserJWTAndSeed(jwt, publisherAccessToken))

	connection := pubsub.MustConnect(
		pubsub.Config{
			Opts: opts,
			URI:  natsServerUrl,
		})

	log.Println("Connected to NATS server.")

	return connection
}

func PublishData(ctx context.Context, connection *pubsub.NatsService, subjectName string, data []byte) error {
	err := connection.Publish(ctx, subjectName, data)
	if err != nil {
		return err
	}

	return nil
}
