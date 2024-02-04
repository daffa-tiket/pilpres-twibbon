import {
  HandLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const demosSection = document.getElementById("demos");

let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;

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
  demosSection.classList.remove("invisible");
};
createHandLandmarker();

export function registerClickListeners() {
  const imageContainers = document.getElementsByClassName("detectOnClick");
  for (let i = 0; i < imageContainers.length; i++) {
    imageContainers[i].children[0].addEventListener("click", handleClick);
  }
}

async function handleClick(event) {
  if (!handLandmarker) {
    console.log("Wait for handLandmarker to load before clicking!");
    return;
  }

  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await handLandmarker.setOptions({ runningMode: "IMAGE" });
  }

  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (let i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }

  const handLandmarkerResult = await handLandmarker.detect(event.target);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("class", "canvas");
  canvas.setAttribute("width", event.target.naturalWidth + "px");
  canvas.setAttribute("height", event.target.naturalHeight + "px");
  canvas.style =
    "left: 0px;" +
    "top: 0px;" +
    "width: " +
    event.target.width +
    "px;" +
    "height: " +
    event.target.height +
    "px;";

  event.target.parentNode.appendChild(canvas);
  const cxt = canvas.getContext("2d");
  var twibbonImage = new Image();
  twibbonImage.src = 'amin-twibbon.png';
  twibbonImage.onload = function () {
    cxt.drawImage(twibbonImage, 0, 0, canvas.width, canvas.height);
    cxt.fillStyle = 'white';
    cxt.font = '20px Arial';
    cxt.fillText('Your Text Here', 10, 30);
  };
  console.log(handLandmarkerResult.landmarks[0])
  //detectPose(handLandmarkerResult.landmarks[0])
  let wording = "gak niat bjir"
  let fingers = countFingers(handLandmarkerResult.landmarks[0])

  if (fingers == 1) {
    wording = "Buzzer janji manies kh ?"
  }

  if (fingers == 2) {
    wording = "Pendukung dinasti bjir"
  }

  if (fingers == 3) {
    wording = "Skip wadas kocak"
  }

  if (fingers == 4) {
    wording = "Lu temen gw"
  }
  alert(wording)
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