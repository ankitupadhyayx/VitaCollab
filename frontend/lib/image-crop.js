export const cropImageToSquareFile = async (file) => {
  if (!file) {
    return null;
  }

  const url = URL.createObjectURL(file);
  const image = new Image();

  const loaded = await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });

  if (!loaded) {
    URL.revokeObjectURL(url);
    return file;
  }

  const size = Math.min(image.width, image.height);
  const offsetX = Math.floor((image.width - size) / 2);
  const offsetY = Math.floor((image.height - size) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  context.drawImage(image, offsetX, offsetY, size, size, 0, 0, size, size);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  URL.revokeObjectURL(url);

  if (!blob) {
    return file;
  }

  const name = file.name.replace(/\.[^.]+$/, "") + "-cropped.jpg";
  return new File([blob], name, { type: "image/jpeg" });
};
