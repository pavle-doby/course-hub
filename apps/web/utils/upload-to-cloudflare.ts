/**
 * Uploads a file directly to Cloudflare Stream via a pre-signed upload URL.
 *
 * Uses XHR because `fetch` exposes no upload progress events.
 *
 * @param url Pre-signed Cloudflare upload URL.
 * @param file File to upload.
 * @param onProgress Callback receiving upload progress as a percentage (0-100).
 * @returns Resolves when the upload completes successfully.
 */
export function uploadToCloudflare(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Video upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Video upload failed"));
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}
