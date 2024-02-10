import { MIME_CODEC } from "./VideoStream.constants";

export function isNewInitStream(dataView: DataView) {
  const ftypBoxType = String.fromCharCode(
    dataView.getUint8(4),
    dataView.getUint8(5),
    dataView.getUint8(6),
    dataView.getUint8(7)
  );

  const isNewInitStream = ftypBoxType === "ftyp";

  return isNewInitStream;
}

export const initMediaSource = async (onReady: (sb: SourceBuffer) => void) => {
  let sourceBuffer: SourceBuffer;
  const mediaSource = new MediaSource();

  mediaSource.addEventListener("sourceopen", () => {
    console.log("sourceopen"); // eslint-disable-line no-console

    try {
      sourceBuffer = mediaSource.addSourceBuffer(MIME_CODEC);

      onReady(sourceBuffer);

      sourceBuffer.addEventListener("updatestart", () => {
        console.log("sourceBuffer.updatestart");
      });

      sourceBuffer.addEventListener("updateend", () => {
        console.log("sourceBuffer.updateend");
      });

      sourceBuffer.addEventListener("error", (e) => {
        console.log("sourceBuffer.error", e);
      });
    } catch (error) {
      console.error("Error creating source buffer:", error);
    }
  });

  return mediaSource;
};
