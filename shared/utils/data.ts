export function getKilobyte(bytes: number): string {
  return (bytes / 1024).toFixed(1) + " KB";
}

export function getMegabyte(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

export function getReadableFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " B";
  }
  if (bytes < 1024 * 1024) {
    return getKilobyte(bytes);
  }
  return getMegabyte(bytes);
}
