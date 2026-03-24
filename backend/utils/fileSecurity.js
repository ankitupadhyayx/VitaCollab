const EICAR_SIGNATURE = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";

const toHex = (buffer, length) => buffer.subarray(0, length).toString("hex").toLowerCase();

const detectFileTypeFromSignature = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
    return {
      valid: false,
      reason: "File appears to be empty or unreadable."
    };
  }

  const first4 = toHex(buffer, 4);
  const first8 = toHex(buffer, 8);

  if (first4 === "25504446") {
    return {
      valid: true,
      mimeType: "application/pdf",
      extensions: new Set([".pdf"]),
      type: "pdf"
    };
  }

  if (first8 === "89504e470d0a1a0a") {
    return {
      valid: true,
      mimeType: "image/png",
      extensions: new Set([".png"]),
      type: "png"
    };
  }

  if (first4.startsWith("ffd8ff")) {
    return {
      valid: true,
      mimeType: "image/jpeg",
      extensions: new Set([".jpg", ".jpeg"]),
      type: "jpeg"
    };
  }

  return {
    valid: false,
    reason: "Unsupported or unsafe file content detected. Please upload a PDF, JPG, or PNG file."
  };
};

const hasExecutableSignature = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 2) {
    return false;
  }

  const first2 = toHex(buffer, 2);
  const first4 = toHex(buffer, 4);
  const first6Ascii = buffer.subarray(0, 6).toString("ascii").toLowerCase();

  if (first2 === "4d5a") {
    return true;
  }

  if (first4 === "7f454c46") {
    return true;
  }

  if (first2 === "2321") {
    return true;
  }

  if (first6Ascii.includes("<script")) {
    return true;
  }

  return false;
};

const runMockMalwareScan = (buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    return {
      clean: false,
      reason: "Unable to scan file content."
    };
  }

  const fileText = buffer.toString("utf8");
  if (fileText.includes(EICAR_SIGNATURE)) {
    return {
      clean: false,
      reason: "Malware signature detected in uploaded file."
    };
  }

  return {
    clean: true,
    reason: null
  };
};

module.exports = {
  detectFileTypeFromSignature,
  hasExecutableSignature,
  runMockMalwareScan
};
