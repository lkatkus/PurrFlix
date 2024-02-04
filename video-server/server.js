const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
  const filePath = req.url === "/" ? "public/index.html" : `public${req.url}`;
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

const wss = new WebSocket.Server({ server });

const generateVideoData = () => {
  const publicDir = path.join(__dirname, "public");

  // Read subdirectories in ./public
  const subdirectories = fs.readdirSync(publicDir);

  // Create VIDEO_DATA array based on the subdirectory structure
  const videoData = [];
  subdirectories.forEach((subdirectory) => {
    const subdirectoryPath = path.join(publicDir, subdirectory);
    if (fs.statSync(subdirectoryPath).isDirectory()) {
      const files = fs.readdirSync(subdirectoryPath);

      // Separate "init-" and "chunk-" files
      const initFiles = files.filter((file) => file.startsWith("init-"));
      const chunkFiles = files.filter((file) => file.startsWith("chunk-"));

      // Sort "init-" files first, then "chunk-" files
      const sortedFiles = initFiles.concat(chunkFiles);

      // Include only files starting with "init-" or "chunk-"
      const validFiles = sortedFiles.filter((file) =>
        /^init-|^chunk-/.test(file)
      );

      videoData.push(
        ...validFiles.map((file) => path.join(subdirectory, file))
      );
    }
  });

  return videoData;
};

const VIDEO_DATA = generateVideoData();

console.log("VIDEO_DATA", VIDEO_DATA);

wss.on("connection", (ws) => {
  console.log("Client connected");

  const chunkSize = 1024 * 1024; // 1 MB chunks (adjust as needed)

  let offset = 0;

  const sendChunk = (index) => {
    const filePath = path.join(__dirname, "public", VIDEO_DATA[index]);
    const fileStream = fs.createReadStream(filePath, {
      highWaterMark: chunkSize,
    });

    const currentPath = filePath.split("/").pop();

    fileStream.on("data", (chunk) => {
      console.log("SENDING", currentPath);

      offset += 1;

      ws.send(chunk.buffer);
    });

    fileStream.on("end", () => {
      const timeout = currentPath.includes("init") ? 500 : 3000;
      offset = 0;

      setTimeout(() => {
        const nextIndex = index >= VIDEO_DATA.length - 1 ? 0 : index + 1;

        sendChunk(nextIndex);
      }, timeout);
    });
  };

  sendChunk(0);

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
