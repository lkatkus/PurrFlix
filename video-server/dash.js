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

        const command = `ffmpeg -i ${inputFilePath} -c:v libx264 -x264opts keyint=60 -b:v 1500k -c:a aac -b:a 128k -f dash -seg_duration ${segmentDuration} -an ${outputDir}/video.mpd`;
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(
              `Error creating MPEG-DASH segments for ${file}: ${error.message}`
            );
            return;
          }
          console.log(`MPEG-DASH segments created for ${file}`);
          console.log("");
        });
      });
    });
  });
});
