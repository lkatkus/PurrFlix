const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const assetsDir = path.join(__dirname, "assets");
const outputBaseDir = path.join(__dirname, "public");

// Set the desired segment duration in seconds
const segmentDuration = 3;

// Clear outputBaseDir before processing
rimraf.sync(outputBaseDir);
fs.mkdirSync(outputBaseDir);

// Read all files from the assets directory
fs.readdir(assetsDir, (err, files) => {
  if (err) {
    console.error(`Error reading assets directory: ${err.message}`);
    return;
  }

  // Process each file
  files.forEach((file) => {
    const inputFilePath = path.join(assetsDir, file);
    const outputDir = path.join(
      outputBaseDir,
      path.basename(file, path.extname(file))
    );

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Use FFmpeg to create MPEG-DASH segments with the specified segment duration
    const command = `ffmpeg -i ${inputFilePath} -c:v libx264 -x264opts keyint=60 -b:v 1500k -c:a aac -b:a 128k -f dash -seg_duration ${segmentDuration} -an ${outputDir}/video.mpd`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Error creating MPEG-DASH segments for ${file}: ${error.message}`
        );
        return;
      }
      console.log(
        `MPEG-DASH segments created for ${file}. Manifest saved to: ${outputDir}/video.mpd`
      );
    });
  });
});
