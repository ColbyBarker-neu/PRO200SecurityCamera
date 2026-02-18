const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const startCamBtn = document.getElementById("startCamBtn");
const stopCamBtn = document.getElementById("stopCamBtn");
const toggleCvBtn = document.getElementById("toggleCvBtn");
const cameraSelect = document.getElementById("cameraSelect");

const openFolderBtn = document.getElementById("openFolderBtn");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

function log(msg) {
  const ts = new Date().toLocaleTimeString();
  logEl.textContent += `[${ts}] ${msg}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

// ----------------------
// Placeholder buttons
// ----------------------
openFolderBtn.addEventListener("click", () => {
  log("Open Folder clicked (placeholder). Using a folder picker.");
  const input = document.createElement("input");
  input.type = "file";
  input.webkitdirectory = true; // Chromium browsers
  input.onchange = () => log(`Selected ${input.files.length} file(s) from folder.`);
  input.click();
});

loginBtn.addEventListener("click", () => {
  log("Login clicked (placeholder).");
  alert("Login placeholder");
});

signupBtn.addEventListener("click", () => {
  log("Sign Up clicked (placeholder).");
  alert("Sign Up placeholder");
});

// ----------------------
// OpenCV + Camera logic
// ----------------------
let cvReady = false;
let useFilter = true;

let stream = null;
let rafId = null;

function setStatus(text) {
  statusEl.textContent = text;
}

function humanCameraError(err) {

  const name = err?.name || "Error";
  const msg = err?.message || String(err);

  if (name === "NotAllowedError") return "Permission blocked. Allow camera for localhost.";
  if (name === "NotFoundError") return "No camera found.";
  if (name === "NotReadableError") return "Camera is in use by another app (OBS/Discord/Zoom).";
  if (name === "OverconstrainedError") return "Selected camera/constraints not supported.";
  return `${name}: ${msg}`;
}

async function populateCameraList() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter(d => d.kind === "videoinput");

    cameraSelect.innerHTML = `<option value="">(default)</option>`;

    cams.forEach((cam, i) => {
      const opt = document.createElement("option");
      opt.value = cam.deviceId;
      opt.textContent = cam.label || `Camera ${i + 1}`;
      cameraSelect.appendChild(opt);
    });

    log(`Detected ${cams.length} camera device(s).`);
  } catch (err) {
    log("Could not enumerate devices: " + err.message);
  }
}

async function startCamera() {
  try {
    stopCamera();

    const deviceId = cameraSelect.value;

    const constraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: "user" } 
    };

    setStatus("Starting camera…");
    log("Requesting camera access…");

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

    log(`Camera started: ${video.videoWidth}x${video.videoHeight}`);
    setStatus("Camera running ✅");

    await populateCameraList();

    startProcessingLoop();
  } catch (err) {
    const nice = humanCameraError(err);
    log("CAMERA ERROR: " + nice);
    setStatus("Camera error ❌");
  }
}

function stopCamera() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(t => t.stop());
    stream = null;
  }

  if (video.srcObject) {
    video.srcObject = null;
  }

  setStatus("Camera stopped.");
  log("Camera stopped.");
}

toggleCvBtn.addEventListener("click", () => {
  useFilter = !useFilter;
  log(`CV filter: ${useFilter ? "ON" : "OFF"}`);
});

startCamBtn.addEventListener("click", startCamera);
stopCamBtn.addEventListener("click", stopCamera);

function waitForCv() {
  setStatus("Loading OpenCV…");
  const t = setInterval(() => {
    if (window.cv && window.cv.Mat) {
      clearInterval(t);
      cvReady = true;
      setStatus("OpenCV loaded ✅ (click Start Camera)");
      log("OpenCV.js ready.");
    }
  }, 100);
}

function startProcessingLoop() {
  if (!cvReady) {
    log("OpenCV not ready yet—processing loop will still show raw video.");
  }

  const ctx = canvas.getContext("2d");

  const tick = () => {
    rafId = requestAnimationFrame(tick);

    if (!video || video.readyState < 2) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      log(`Canvas sized: ${canvas.width}x${canvas.height}`);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (!cvReady || !useFilter) return;

    const src = cv.imread(canvas);
    const dst = new cv.Mat();

    try {
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
      cv.Canny(dst, dst, 60, 120);
      cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
      cv.imshow(canvas, dst);
    } finally {
      src.delete();
      dst.delete();
    }
  };

  tick();
}

// Startup
log("Page loaded.");
log("Tip: Click Start Camera. If prompted, allow camera for localhost.");
populateCameraList();
waitForCv();
