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

  if (!config) {
    return (
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <input
          required
          type="text"
          name="accessToken"
          placeholder="Access token"
        />
        <input required type="text" name="serverUrl" placeholder="Server URL" />
        <button type="submit">Connect</button>
      </form>
    );
  }

  return (
    <div>
      <VideoStream connectionConfig={config} />
    </div>
  );
}

export default App;
