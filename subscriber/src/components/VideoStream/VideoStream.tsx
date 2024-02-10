import { useEffect, useRef } from "react";
import { initMediaSource, isNewInitStream } from "./VideoStream.utils";
import { MIME_CODEC } from "./VideoStream.constants";
import { connect } from "../../api";

export const SUBJECT = "laimonas.test.1";

interface VideoStreamProps {
  connectionConfig: {
    accessToken: string;
    serverUrl: string;
  };
}

export const VideoStream = ({ connectionConfig }: VideoStreamProps) => {
  const isInitialized = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      const init = async () => {
        const { serverUrl, accessToken } = connectionConfig;

        const connection = await connect({
          url: serverUrl,
          accessToken,
        });

        console.log("Connected to NATS server.");

        await connection.subscribe({
          subject: SUBJECT,
          onError: () => {
            console.log("ERROR"); // eslint-disable-line no-console
          },
          onMessages: async (messages) => {
            const message = messages[0];
            const arrayBuffer = message.data as any;

            const dataView = new DataView(arrayBuffer);
            const isNew = isNewInitStream(dataView);

            if (isNew) {
              if (!MediaSource.isTypeSupported(MIME_CODEC)) {
                throw new Error("Unsupported mime codec");
              }

              if (videoRef.current === null) {
                return;
              }

              const mediaSource = await initMediaSource((sb: SourceBuffer) => {
                sourceBufferRef.current = sb;

                sb.appendBuffer(arrayBuffer);
              });

              videoRef.current.src = URL.createObjectURL(mediaSource);
            } else {
              const sourceBuffer = sourceBufferRef.current;

              if (sourceBuffer) {
                sourceBuffer.appendBuffer(arrayBuffer);
              }
            }
          },
        });
      };

      init();
    }
  }, []);

  // useEffect(() => {
  //   if (socketRef.current === null) {
  //     const socket = new WebSocket(connectionConfig.serverUrl);

  //     socket.binaryType = "arraybuffer";

  //     socket.addEventListener("open", () => {
  //       socket.send("Ready");

  //       socketRef.current = socket;
  //     });

  //     socket.onmessage = async (event) => {
  //       try {
  //         const arrayBuffer = event.data;
  //         const dataView = new DataView(arrayBuffer);
  //         const isNew = isNewInitStream(dataView);

  //         if (isNew) {
  //           if (!MediaSource.isTypeSupported(MIME_CODEC)) {
  //             throw new Error("Unsupported mime codec");
  //           }

  //           if (videoRef.current === null) {
  //             return;
  //           }

  //           const mediaSource = await initMediaSource((sb: SourceBuffer) => {
  //             sourceBufferRef.current = sb;

  //             sb.appendBuffer(arrayBuffer);
  //           });

  //           videoRef.current.src = URL.createObjectURL(mediaSource);
  //         } else {
  //           const sourceBuffer = sourceBufferRef.current;

  //           if (sourceBuffer) {
  //             sourceBuffer.appendBuffer(arrayBuffer);
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Error on message:", error);
  //       }
  //     };
  //   }
  // }, []);

  return (
    <div>
      <video ref={videoRef} width={480} height={270} controls muted autoPlay />
    </div>
  );
};

// export const VideoStream = ({ connectionConfig }: VideoStreamProps) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const socketRef = useRef<WebSocket | null>(null);
//   const sourceBufferRef = useRef<SourceBuffer | null>(null);

//   useEffect(() => {
//     if (socketRef.current === null) {
//       const socket = new WebSocket(connectionConfig.serverUrl);

//       socket.binaryType = "arraybuffer";

//       socket.addEventListener("open", () => {
//         socket.send("Ready");

//         socketRef.current = socket;
//       });

//       socket.onmessage = async (event) => {
//         try {
//           const arrayBuffer = event.data;
//           const dataView = new DataView(arrayBuffer);
//           const isNew = isNewInitStream(dataView);

//           if (isNew) {
//             if (!MediaSource.isTypeSupported(MIME_CODEC)) {
//               throw new Error("Unsupported mime codec");
//             }

//             if (videoRef.current === null) {
//               return;
//             }

//             const mediaSource = await initMediaSource((sb: SourceBuffer) => {
//               sourceBufferRef.current = sb;

//               sb.appendBuffer(arrayBuffer);
//             });

//             videoRef.current.src = URL.createObjectURL(mediaSource);
//           } else {
//             const sourceBuffer = sourceBufferRef.current;

//             if (sourceBuffer) {
//               sourceBuffer.appendBuffer(arrayBuffer);
//             }
//           }
//         } catch (error) {
//           console.error("Error on message:", error);
//         }
//       };
//     }
//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} width={480} height={270} controls muted autoPlay />
//     </div>
//   );
// };
