export const getObjectFromBuffer = (arrayBuffer: ArrayBuffer) => {
  const uint8Array = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder("utf-8");
  const jsonString = textDecoder.decode(uint8Array);
  const jsonObject = JSON.parse(jsonString);

  return jsonObject;
};

export function splitWithLengthPrefixes(data: ArrayBuffer, lengthSize = 4) {
  const uint8Array = new Uint8Array(data);
  const chunks = [];
  const view = new DataView(data);

  let offset = 0;

  while (offset < uint8Array.length) {
    // Read the length of the next segment
    if (offset + lengthSize > uint8Array.length) {
      throw new Error("Unexpected end of data while reading length prefix.");
    }
    const length = view.getUint32(offset);
    offset += lengthSize;

    // Extract the segment based on the length
    if (offset + length > uint8Array.length) {
      throw new Error("Unexpected end of data while reading segment.");
    }
    const segment = uint8Array.slice(offset, offset + length);
    chunks.push(segment);

    // Move to the next segment
    offset += length;
  }

  return chunks;
}

export function compareArrayBuffers(a: ArrayBuffer, b: ArrayBuffer) {
  // Convert ArrayBuffers to Uint8Arrays
  const view1 = new Uint8Array(a);
  const view2 = new Uint8Array(b);

  // Check if they are the same length
  if (view1.byteLength !== view2.byteLength) {
    return false;
  }

  // Compare byte-by-byte
  for (let i = 0; i < view1.byteLength; i++) {
    if (view1[i] !== view2[i]) {
      return false;
    }
  }

  return true;
}

export function concatArrayBuffers(a: ArrayBuffer, b: ArrayBuffer) {
  // Create a new ArrayBuffer with the combined length of buffer1 and buffer2
  const combinedBuffer = new ArrayBuffer(a.byteLength + b.byteLength);

  // Create a Uint8Array view for the combined buffer
  const combinedView = new Uint8Array(combinedBuffer);

  // Copy buffer1 to the beginning of the combined buffer
  combinedView.set(new Uint8Array(a), 0);

  // Copy buffer2 right after buffer1
  combinedView.set(new Uint8Array(b), a.byteLength);

  return combinedBuffer;
}
