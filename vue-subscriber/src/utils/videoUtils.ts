export const MIME_CODEC = 'video/mp4; codecs="avc1.64001f"';

export const isNewInitStream = (dataView: DataView) => {
  const ftypBoxType = String.fromCharCode(
    dataView.getUint8(4),
    dataView.getUint8(5),
    dataView.getUint8(6),
    dataView.getUint8(7)
  );

  const isNewInitStream = ftypBoxType === "ftyp";

  return isNewInitStream;
};

export const getMediaSource = () => {
  if (window.MediaSource) {
    return window.MediaSource;
  }

  if ((window as any).ManagedMediaSource) {
    return (window as any).ManagedMediaSource;
  }

  throw Error("No MediaSource API available");
};

export const initMediaSource = async (onReady: (sb: SourceBuffer) => void) => {
  let sourceBuffer: SourceBuffer;

  const mediaSourceObj = getMediaSource();
  const mediaSource = new mediaSourceObj();

  mediaSource.addEventListener("sourceopen", () => {
    // console.log("sourceopen"); // eslint-disable-line no-console

    try {
      sourceBuffer = mediaSource.addSourceBuffer(MIME_CODEC);
      sourceBuffer.mode = "sequence";

      onReady(sourceBuffer);

      sourceBuffer.addEventListener("updatestart", () => {
        // console.log("sourceBuffer.updatestart");
      });

      sourceBuffer.addEventListener("updateend", () => {
        // console.log("sourceBuffer.updateend");
      });

      sourceBuffer.addEventListener("error", () => {
        // console.log("sourceBuffer.error", e);
      });
    } catch (error) {
      console.error("Error creating source buffer:", error);
    }
  });

  return mediaSource;
};

export const getParsedDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = minutes > 0 ? duration - minutes * 60 : duration;
  const parsedSeconds =
    seconds.toString().length === 1 ? `0${seconds}` : seconds;

  return `${minutes}:${parsedSeconds}`;
};
