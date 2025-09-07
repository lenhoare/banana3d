let cvReady = false;
let onReadyCallbacks = [];

export const initOpenCV = () => {
  return new Promise((resolve) => {
    if (cvReady) {
      resolve();
      return;
    }

    onReadyCallbacks.push(resolve);

    if (typeof window !== 'undefined' && window.cv) {
      if (window.cv.onRuntimeInitialized) {
        window.cv.onRuntimeInitialized = () => {
          cvReady = true;
          onReadyCallbacks.forEach(callback => callback());
          onReadyCallbacks = [];
        };
      } else {
        // OpenCV is already ready
        cvReady = true;
        onReadyCallbacks.forEach(callback => callback());
        onReadyCallbacks = [];
      }
    } else {
      // Wait for OpenCV to load
      const checkCV = () => {
        if (typeof window !== 'undefined' && window.cv) {
          if (window.cv.onRuntimeInitialized) {
            window.cv.onRuntimeInitialized = () => {
              cvReady = true;
              onReadyCallbacks.forEach(callback => callback());
              onReadyCallbacks = [];
            };
          } else {
            cvReady = true;
            onReadyCallbacks.forEach(callback => callback());
            onReadyCallbacks = [];
          }
        } else {
          setTimeout(checkCV, 100);
        }
      };
      checkCV();
    }
  });
};

export const isOpenCVReady = () => cvReady;

export const getCV = () => {
  if (typeof window !== 'undefined') {
    return window.cv;
  }
  return null;
};