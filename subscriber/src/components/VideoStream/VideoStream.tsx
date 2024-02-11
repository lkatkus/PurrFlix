import { ChangeEvent, useEffect, useRef, useState } from "react";
import { initMediaSource, isNewInitStream } from "./VideoStream.utils";
import { MIME_CODEC } from "./VideoStream.constants";
import { connect } from "../../api";
import { Connection, Subscription } from "../../api/types";

const CATS_STREAM = "laimonas.test.1";
const DOGS_STREAM = "laimonas.test.2";

interface VideoStreamProps {
  connectionConfig: {
    accessToken: string;
    serverUrl: string;
  };
}

export const VideoStream = ({ connectionConfig }: VideoStreamProps) => {
  const isInitialized = useRef(false);
  const connectionRef = useRef<Connection | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const [currentChannel, setCurrentChannel] = useState(CATS_STREAM);
  const [nextChannel, setNextChannel] = useState<string | null>(null);

  const handleChannelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNextChannel(e.target.value);
  };

  const handleOnMessage = async (messages: any) => {
    const message = messages[0];
    const arrayBuffer = message.data;

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
  };

  const handleOnError = () => {
    alert("ERROR");
  };

  useEffect(() => {
    if (
      nextChannel &&
      nextChannel !== currentChannel &&
      subscriptionRef.current
    ) {
      subscriptionRef.current.unsubscribe();

      setCurrentChannel(nextChannel);
    }
  }, [nextChannel]);

  useEffect(() => {
    if (isInitialized.current && connectionRef.current) {
      subscriptionRef.current = connectionRef.current.subscribe({
        subject: currentChannel,
        onError: handleOnError,
        onMessages: handleOnMessage,
      });
    }
  }, [currentChannel]);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      const init = async () => {
        const { serverUrl, accessToken } = connectionConfig;

        connectionRef.current = await connect({
          url: serverUrl,
          accessToken,
        });

        subscriptionRef.current = await connectionRef.current.subscribe({
          subject: currentChannel,
          onError: handleOnError,
          onMessages: handleOnMessage,
        });
      };

      init();
    }
  }, []);

  return (
    <div>
      <div>
        <select onChange={handleChannelChange}>
          <option value={CATS_STREAM}>Cats</option>
          <option value={DOGS_STREAM}>Dogs</option>
        </select>
      </div>
      <video ref={videoRef} width={480} height={270} controls muted autoPlay />
    </div>
  );
};
