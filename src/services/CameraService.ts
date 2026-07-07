/**
 * CameraService
 * Manages webcam media streams, camera track lifecycle, and photo capturing.
 */
export const CameraService = {
  /**
   * Requests permission and starts the camera, attaching the stream to the provided video element.
   * @param videoElement The HTMLVideoElement to display the stream.
   * @returns A promise that resolves with the active MediaStream.
   */
  async startCamera(videoElement: HTMLVideoElement): Promise<MediaStream> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Webcam media devices are not supported in this browser.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });

    videoElement.srcObject = stream;
    return stream;
  },

  /**
   * Stops the active video tracks of a stream currently assigned to a video element.
   * @param videoElement The HTMLVideoElement containing the video stream.
   */
  stopCamera(videoElement: HTMLVideoElement | null): void {
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
      videoElement.srcObject = null;
    }
  },

  /**
   * Captures a JPEG photo from the active video stream of the video element.
   * @param videoElement The HTMLVideoElement rendering the stream.
   * @returns The base64 jpeg image data url, or null if capture failed.
   */
  capturePhoto(videoElement: HTMLVideoElement): string | null {
    if (!videoElement) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg');
    }
    
    return null;
  }
};
