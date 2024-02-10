import { NatsService } from "pubsub-js";
import { createInterface } from "readline";
import fs from "fs";
import path from "path";

const PATH_TO_VIDEOS = "../video-server/public";

export const generateVideoData = () => {
  const publicDir = path.join(__dirname, PATH_TO_VIDEOS);

  // Read subdirectories in ./public
  const subdirectories = fs.readdirSync(publicDir);

  // Create VIDEO_DATA array based on the subdirectory structure
  const videoData: string[][] = [];

  subdirectories.forEach((subdirectory: any) => {
    const subdirectoryPath = path.join(publicDir, subdirectory);

    if (fs.statSync(subdirectoryPath).isDirectory()) {
      const files = fs.readdirSync(subdirectoryPath);

      // Separate "init-" and "chunk-" files
      const initFiles = files.filter((file: any) => file.startsWith("init-"));
      const chunkFiles = files.filter((file: any) => file.startsWith("chunk-"));

      // Sort "init-" files first, then "chunk-" files
      const sortedFiles = initFiles.concat(chunkFiles);

      // Include only files starting with "init-" or "chunk-"
      const validFiles = sortedFiles.filter((file: any) =>
        /^init-|^chunk-/.test(file)
      );

      videoData.push(
        validFiles.map((file: any) =>
          path.join(PATH_TO_VIDEOS, subdirectory, file)
        )
      );
    }
  });

  return videoData;
};

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const getNextVideo = (
  service: NatsService,
  onConfirm: () => void,
  onDecline: () => void,
  autoConfirm?: boolean
) => {
  if (autoConfirm) {
    onConfirm();

    return;
  }

  return readline.question("Send next video y/n? ", async (message: string) => {
    if (message === "n") {
      onDecline();
    }

    if (message === "y") {
      onConfirm();

      return;
    }

    getNextVideo(service, onConfirm, onDecline);
  });
};
