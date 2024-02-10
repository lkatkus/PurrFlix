import "dotenv/config";
import fs from "fs";
import path from "path";
import { NatsService } from "pubsub-js";
import { generateVideoData, getNextVideo } from "./publisher.utils";
import {
  NATS_BROKER_URL,
  PUBLISHER_NATS_CREDS_FILE,
  SUBJECT,
} from "./publisher.constants";

const SHOULD_AUTO_PLAY = true;
const CHUNK_SIZE = 1024 * 1024; // 1 MB chunks (adjust as needed)

const streamVideo = (
  service: NatsService,
  videoData: string[],
  onFinish: () => void
) => {
  console.log("");

  const sendChunk = (index: number) => {
    const filePath = path.join(__dirname, videoData[index]);

    const fileStream = fs.createReadStream(filePath, {
      highWaterMark: CHUNK_SIZE,
    });

    const currentPath = filePath.split("/").pop()!;

    fileStream.on("data", (chunk) => {
      const chunkBuffer = Buffer.from(chunk);

      console.log("SENDING", videoData[index]);

      service.publish(SUBJECT, chunkBuffer);
    });

    fileStream.on("end", () => {
      const nextIndex = index + 1;
      const timeout = currentPath.includes("init") ? 500 : 4000;

      setTimeout(() => {
        if (nextIndex >= videoData.length) {
          onFinish();
        } else {
          sendChunk(nextIndex);
        }
      }, timeout);
    });
  };

  sendChunk(0);
};

async function main() {
  console.log(`

██████╗ ██╗   ██╗██████╗ ██████╗ ███████╗██╗     ██╗██╗  ██╗
██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔════╝██║     ██║╚██╗██╔╝
██████╔╝██║   ██║██████╔╝██████╔╝█████╗  ██║     ██║ ╚███╔╝ 
██╔═══╝ ██║   ██║██╔══██╗██╔══██╗██╔══╝  ██║     ██║ ██╔██╗ 
██║     ╚██████╔╝██║  ██║██║  ██║██║     ███████╗██║██╔╝ ██╗
╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝╚═╝  ╚═╝

`);

  const availableVideos = generateVideoData();

  const service = new NatsService({
    url: NATS_BROKER_URL,
    natsCredsFile: PUBLISHER_NATS_CREDS_FILE,
  });

  console.log("Connecting to NATS server...");
  console.log("");

  await service.waitForConnection();

  console.log("Connected to NATS server.");
  console.log("");

  let videoIndex = 0;

  const onConfirm = () => {
    streamVideo(service, availableVideos[videoIndex], () => {
      const nextVideoIndex = videoIndex + 1;

      videoIndex =
        nextVideoIndex + 1 > availableVideos.length ? 0 : nextVideoIndex;

      getNextVideo(service, onConfirm, onDecline, SHOULD_AUTO_PLAY);
    });
  };

  const onDecline = () => {
    console.log("");
    console.log("K. Thnx. Bye.");
    console.log("");

    service.close();
    process.exit(0);
  };

  getNextVideo(service, onConfirm, onDecline);
}

main().catch((err) => {
  console.error("Error:", err);

  process.exit(1);
});
