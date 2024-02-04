const { exec } = require("child_process");
const path = require("path");

const inputFilePath = path.join(__dirname, "public", "video-1.mp4");
const outputFilePath = path.join(__dirname, "public", "video-1-frag.mp4");

const command = `ffmpeg -i ${inputFilePath} -c copy -f mp4 -movflags frag_keyframe+empty_moov ${outputFilePath}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(`Fragmentation complete. Fragments saved to: ${outputFilePath}`);
});
