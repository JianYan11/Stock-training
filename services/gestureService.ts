import { GestureType } from '../types';

let gestureRecognizer: any = null;
let initializationPromise: Promise<any> | null = null;
let runningMode = "VIDEO";

export const initializeGestureRecognizer = async () => {
  if (gestureRecognizer) return gestureRecognizer;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      console.log("Initializing MediaPipe GestureRecognizer...");
      
      const { GestureRecognizer, FilesetResolver } = await import(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/+esm"
      );

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
      );

      // --- Log Suppression Start ---
      const originalLog = console.log;
      const originalInfo = console.info;
      const originalWarn = console.warn;

      const shouldSuppress = (args: any[]) => {
        const msg = args[0];
        if (typeof msg !== 'string') return false;
        return (
          msg.includes('Created TensorFlow Lite XNNPACK delegate for CPU') ||
          msg.includes('WASM') || 
          msg.includes('delegate')
        );
      };

      console.log = (...args) => { if (!shouldSuppress(args)) originalLog(...args); };
      console.info = (...args) => { if (!shouldSuppress(args)) originalInfo(...args); };
      // Sometimes these come through warnings too
      console.warn = (...args) => { if (!shouldSuppress(args)) originalWarn(...args); };
      // --- Log Suppression End ---

      try {
        gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "CPU"
          },
          runningMode: runningMode,
          numHands: 1
        });
      } finally {
        // Restore logs immediately after creation attempt
        console.log = originalLog;
        console.info = originalInfo;
        console.warn = originalWarn;
      }

      console.log("MediaPipe GestureRecognizer initialized successfully");
      return gestureRecognizer;
    } catch (error) {
      console.error("Failed to initialize gesture recognizer:", error);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

export const predictGesture = (video: HTMLVideoElement): GestureType => {
  if (!gestureRecognizer) return GestureType.NONE;

  try {
    const results = gestureRecognizer.recognizeForVideo(video, Date.now());

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      // Index 9 is the middle finger MCP (base of finger), good central point for hand
      const x = landmarks[9].x; 

      // Logic assuming mirrored video (CSS transform: scaleX(-1)):
      // Raw X > 0.5 -> Left side of visual screen
      // Raw X < 0.5 -> Right side of visual screen
      
      if (x > 0.5) {
        return GestureType.HAND_LEFT;
      } else {
        return GestureType.HAND_RIGHT;
      }
    }
  } catch (e) {
    // Silent fail for prediction loop errors to keep console clean
    return GestureType.NONE;
  }

  return GestureType.NONE;
};