import { FormEvent, useRef, useState } from "react";
import { VideoStream } from "./components";

function App() {
  const formRef = useRef<HTMLFormElement>(null);
  const [config, setConfig] = useState<{
    accessToken: string;
    serverUrl: string;
  } | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const formObject: { [key: string]: string } = {};

      formData.forEach((value, key) => {
        formObject[key] = value.toString();
      });

      setConfig({
        accessToken: formObject.accessToken,
        serverUrl: formObject.serverUrl,
      });
    }
  };

  const isReady = !!config;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <div>
        <h1>PurrFlix</h1>
      </div>

      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isReady ? (
          <VideoStream connectionConfig={config} />
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              width: 300,
            }}
          >
            <input
              required
              type="text"
              name="accessToken"
              placeholder="Access token"
            />
            <input
              required
              type="text"
              name="serverUrl"
              placeholder="Server URL"
            />
            <button type="submit">Connect</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
