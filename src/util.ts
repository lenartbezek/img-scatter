import { Vector3 } from "three";

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  let d: number;
  if (max === min) {
    h = s = 0;
  } else {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h, s, l];
}

export function getVectorFromBuffer(buffer: Float32Array, index: number) {
  const offset = index * 3;
  return new Vector3(
    buffer[offset],
    buffer[offset + 1],
    buffer[offset + 2],
  );
}

export function setBufferFromVector(buffer: Float32Array, index: number, vector: Vector3) {
  const offset = index * 3;
  buffer[offset] = vector.x;
  buffer[offset + 1] = vector.y;
  buffer[offset + 2] = vector.z;
}

export function applyToBuffer(
  sourceBuffer: Float32Array,
  targetBuffer: Float32Array,
  fn: (v: Vector3, i: number) => Vector3,
  range?: number) {
  if (typeof range === "undefined") { range = sourceBuffer.length / 3; }
  for (let i = 0; i < range; i += 1) {
    const v = fn(getVectorFromBuffer(sourceBuffer, i), i);
    setBufferFromVector(targetBuffer, i, v);
  }
}

export enum PixelSortMethod {
  Hue = "h",
  Saturation = "s",
  Luminosity = "l",
}

/**
 * Returns a value in range [-1, 1].
 * @param pixel
 * @param method
 */
export function sortPixel(
  h: number, s: number, l: number,
  method: PixelSortMethod = PixelSortMethod.Hue,
) {
  switch (method) {
    case PixelSortMethod.Luminosity:
      return (s - 0.5) * 2;
    case PixelSortMethod.Saturation:
      return (l - 0.5) * 2;
    case PixelSortMethod.Hue:
    default:
      return h / Math.PI - 1;

  }
}
