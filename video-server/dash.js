const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const assetsRootDir = path.join(__dirname, "assets");
const outputBaseDir = path.join(__dirname, "public");

console.log(`

██████╗ ██╗   ██╗██████╗ ██████╗ ██████╗  █████╗ ██████╗ ███████╗███████╗██████╗ 
██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗
██████╔╝██║   ██║██████╔╝██████╔╝██████╔╝███████║██████╔╝███████╗█████╗  ██████╔╝
██╔═══╝ ██║   ██║██╔══██╗██╔══██╗██╔═══╝ ██╔══██║██╔══██╗╚════██║██╔══╝  ██╔══██╗
██║     ╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║██║  ██║███████║███████╗██║  ██║
╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
                                                                                 
`);

console.log("Starting video parser");
console.log("");

const segmentDuration = 3;
const thumbnailWidth = 320;
const thumbnailHeight = 180;

rimraf.sync(outputBaseDir);
fs.mkdirSync(outputBaseDir);

fs.readdir(assetsRootDir, (err, dirs) => {
  dirs.map((dir) => {
    const assetRootDir = path.join(assetsRootDir, dir);

    fs.readdir(assetRootDir, (err, files) => {
      if (err) {
        console.error(`Error reading assets directory: ${err.message}`);
        return;
      }

      files.forEach((file) => {
        const inputFilePath = path.join(assetRootDir, file);
        const outputDir = path.join(
          path.join(outputBaseDir, dir),
          path.basename(file, path.extname(file))
        );

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const ffmpegCommand = `ffmpeg -i ${inputFilePath} \
          -map 0:v -c:v libx264 -x264opts keyint=60 -b:v 1500k -f dash -seg_duration ${segmentDuration} -an ${outputDir}/video.mpd \
          -map 0:v -ss 00:00:01 -vframes 1 -vf scale=${thumbnailWidth}:${thumbnailHeight} -f image2pipe -vcodec png -`;

        exec(
          ffmpegCommand,
          { encoding: "buffer", maxBuffer: 1024 * 1024 * 10 },
          (error, stdout, stderr) => {
            if (error) {
              console.error(`Error processing file: ${error.message}`);
              return;
            }

            const base64Image = `data:image/png;base64,${stdout.toString(
              "base64"
            )}`;

            const jsonObject = {
              thumbnail: base64Image,
            };

            fs.writeFile(
              `${outputDir}/metadata.json`,
              JSON.stringify(jsonObject, null, 2),
              (err) => {
                if (err) {
                  console.error(`Error writing to JSON file: ${err.message}`);
                  return;
                }
              }
            );

            console.log(
              `MPEG-DASH segments created and screenshot captured for ${inputFilePath}`
            );
          }
        );
      });
    });
  });
});
