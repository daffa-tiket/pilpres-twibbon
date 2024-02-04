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
  for (const landmarks of handLandmarkerResult.landmarks) {
    drawConnectors(cxt, landmarks, HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 5
    });
    drawLandmarks(cxt, landmarks, { color: "#FF0000", lineWidth: 1 });
  }
  console.log(handLandmarkerResult.landmarks[0])
  detectPose(handLandmarkerResult.landmarks[0])
}

function detectPose(landmarks) {

  let thumbsF = new Map();
  let indexF = new Map();
  let middleF = new Map();
  let ringF = new Map();
  let pinkyF = new Map();
  let countLinear = 0;

  for (const [index, value] of landmarks.entries()) {
    if (index >= 1 && index <= 4) {
      thumbsF.set(index.toString(), value)
    }
    if (index >= 5 && index <= 8) {
      indexF.set(index.toString(), value)
    }
    if (index >= 9 && index <= 12) {
      middleF.set(index.toString(), value)
    }
    if (index >= 13 && index <= 16) {
      ringF.set(index.toString(), value)
    }
    if (index >= 17 && index <= 20) {
      pinkyF.set(index.toString(), value)
    }
  }

  if (checkFinger(thumbsF, "thumbsF")) {
    console.log("thumbsF")
    countLinear++;
  }
  if (checkFinger(indexF, "indexF")) {
    console.log("indexF")
    countLinear++;
  }
  if (checkFinger(middleF, "middleF")) {
    console.log("middleF")
    countLinear++;
  }
  if (checkFinger(ringF, "ringF")) {
    console.log("ringF")
    countLinear++;
  }
  if (checkFinger(pinkyF, "pinkyF")) {
    console.log("pinkyF")
    countLinear++;
  }

  let wording = "gak niat milih bjir"

  if (countLinear == 1){
    wording = "Buzzer janji manies kh ?"
  }

  if (countLinear == 2){
    wording = "Pendukung dinasti bjir"
  }

  if (countLinear == 3){
    wording = "Skip wadas kocak"
  }

  if (countLinear == 4){
    wording = "Lu temen gw"
  }
  console.log(countLinear)
  alert(wording)
}

function checkFinger(fingers, fingerName) {
  let x1 = 0;
  let y1 = 0;
  let x2 = 0;
  let y2 = 0;
  let x3 = 0;
  let y3 = 0;
  let x4 = 0;
  let y4 = 0;
  for (const [index, value] of fingers.entries()) {
    if (index == 1 || index == 5 || index == 9 || index == 13 || index == 17) {
      x1 = value.x
      y1 = value.y
    }
    if (index == 2 || index == 6 || index == 10 || index == 14 || index == 18) {
      x2 = value.x
      y2 = value.y
    }
    if (index == 3 || index == 7 || index == 11 || index == 15 || index == 19) {
      x3 = value.x
      y3 = value.y
    }
    if (index == 4 || index == 8 || index == 12 || index == 16 || index == 20) {
      x4 = value.x
      y4 = value.y
    }
  }

  let isLinear = arePointsCollinear(x1, y1, x2, y2, x3, y3, x4, y4)

  console.log(fingerName, isLinear)
  return isLinear
}

function arePointsCollinear(x1, y1, x2, y2, x3, y3, x4, y4) {
  const slopeAB = (y2 - y1) / (x2 - x1);
  const slopeAC = (y3 - y1) / (x3 - x1);
  const slopeAD = (y4 - y1) / (x4 - x1);

  const tolerance = 3;
  if (Math.abs(slopeAB - slopeAC) >= tolerance) {
    return false;
  }

  return Math.abs(slopeAD - slopeAB) < tolerance;
}
