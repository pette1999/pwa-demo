const arrayBufferToString = (buf: ArrayBuffer) => {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

export default arrayBufferToString;