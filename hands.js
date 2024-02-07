import {
  HandLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";


let handLandmarker = undefined;
let runningMode = "IMAGE";

const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numHands: 2
  });
};
createHandLandmarker();

export async function handleClick(event, barbarMode) {
  console.log("tess")
  if (!handLandmarker) {
    console.log("Wait for handLandmarker to load before clicking!");
    return;
  }

  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await handLandmarker.setOptions({ runningMode: "IMAGE" });
  }

  const allCanvas = event.target.getElementsByClassName("canvas");
  for (let i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }

  const handLandmarkerResult = await handLandmarker.detect(event.target);
  console.log(handLandmarkerResult.landmarks[0])
  let fingers = countFingers(handLandmarkerResult.landmarks[0])
  localStorage.setItem('fingers', fingers);
  loadTwibbon(fingers, barbarMode, 1);
}

export function loadTwibbon(fingers, barbarMode, index) {
  localStorage.setItem('index', index)
  let wording = "gak niat bjir";
  let downloadBtn = document.getElementById("downloadBtn");
  let twibbonImage = new Image();
  if (fingers == 1) {
    twibbonImage.src = `amin-twibbon-${index}.png`;
    wording = "Buzzer janji manies kh ?";
  }

  if (fingers == 2) {
    twibbonImage.src = `praban-twibbon-${index}.png`;
    wording = "Pendukung dinasti bjir";
  }

  if (fingers == 3) {
    twibbonImage.src = `gama-twibbon-${index}.png`;
    wording = "Skip petugas partai";
  }

  if (fingers == 4) {
    wording = "Lu temen gw";
  }
  twibbonImage.onload = function () {
    // Now that the image is loaded, you can draw it onto the canvas
    let canvas = document.getElementById("canvas");
    let video = document.getElementById("video");
    let capturedImage = document.getElementById("capturedImage");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(capturedImage, 0, 0, canvas.width, canvas.height);
    context.drawImage(twibbonImage, 0, 0, canvas.width, canvas.height);
    capturedImage.style.display = "none";
    canvas.style.display = "block";
    downloadBtn.style.display = "block";
    if (barbarMode) {
      alert(wording);
    }
  };
}

function countFingers(handLandmarks) {
  const fingerLandmarks = [
    [4, 3, 2, 1],  // Thumb (using the tip of the thumb)
    [8, 7, 6, 5],  // Index finger
    [12, 11, 10, 9],  // Middle finger
    [16, 15, 14, 13],  // Ring finger
    [20, 19, 18, 17],  // Little finger
  ];

  let fingerCount = 0;

  // Loop through each finger
  for (const finger of fingerLandmarks) {
    // Check if the finger is extended (the tip is above the base)
    if (handLandmarks[finger[0]].y < handLandmarks[finger[3]].y) {
      fingerCount++;
    }
  }

  return fingerCount - 1
}