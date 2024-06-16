export const getObjectFromBuffer = (arrayBuffer: ArrayBuffer) => {
  const uint8Array = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder("utf-8");
  const jsonString = textDecoder.decode(uint8Array);
  const jsonObject = JSON.parse(jsonString);

  return jsonObject;
};
