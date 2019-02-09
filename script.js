"use script";

// set up port between background.js and script.js
window.port = chrome.runtime.connect({ name: "port" });

// add port listener
window.port.onMessage.addListener(function(msg) {
  // "start" from browserAction.onClicked in background.js
  if (msg.payload === "start") {
    init();
  }
});

/*
 * Functions
 */
// init all functionality
const init = () => {
  injectCanvasMarkup();
  injectVideoMarkup();
  getMedia();
};

// create and inject canvas on to page
const injectCanvasMarkup = () => {
  const canvasEl = document.createElement("canvas");
  canvasEl.id = "hands-free__canvas";
  canvasEl.width = 150;
  canvasEl.height = 150;
  canvasEl.style.position = "fixed";
  canvasEl.style.top = 0;
  canvasEl.style.right = 0;
  canvasEl.style.margin = 0;
  canvasEl.style.zIndex = 1000;
  canvasEl.style.backgroundColor = "black";
  document.body.appendChild(canvasEl);
};

// create and inject video on to page
const injectVideoMarkup = () => {
  const videoEl = document.createElement("video");
  videoEl.id = "hands-free__video";
  videoEl.muted = true;
  videoEl.autoplay = true;
  videoEl.playsinline = true;
  videoEl.controls = false;
  videoEl.width = 150;
  videoEl.height = 150;
  videoEl.style.position = "fixed";
  videoEl.style.top = 0;
  videoEl.style.right = 0;
  videoEl.style.margin = 0;
  videoEl.style.zIndex = 999;
  document.body.appendChild(videoEl);
};

// request access to the users webcam
const getMedia = () => {
  const videoEl = document.getElementById("hands-free__video");
  const constraints = { audio: false, video: true };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      videoEl.srcObject = stream;
      window.requestAnimationFrame(reqAnimLoop);
    })
    .catch(error => {
      console.error(error);
    });
};

// object detection that runs on requestAnimationFrame loop
const reqAnimLoop = () => {
  const videoEl = document.getElementById("hands-free__video");
  const canvasEl = document.getElementById("hands-free__canvas");
  const context = canvasEl.getContext("2d");
  let fist_pos_old;
  let detector;

  window.requestAnimationFrame(reqAnimLoop);

  if (videoEl.paused) {
    videoEl.play();
  }

  if (
    videoEl.readyState === videoEl.HAVE_ENOUGH_DATA &&
    videoEl.videoWidth > 0
  ) {
    // prepare detector if it doesn't exist yet
    if (!detector) {
      detector = initObjectDetect(videoEl);
    }

    // draw video frame on canvas
    context.drawImage(
      videoEl,
      0,
      0,
      canvasEl.clientWidth,
      canvasEl.clientHeight
    );

    let coords = detector.detect(videoEl, 1);
    if (coords[0]) {
      let coord = rescaleAndSetMaxConfidence(coords[0], videoEl, detector);

      drawObjectCoordinates(context, coord, videoEl, canvasEl);

      // Scroll window
      const fist_pos = [coord[0] + coord[2] / 2, coord[1] + coord[3] / 2];
      if (fist_pos_old) {
        const dx = (fist_pos[0] - fist_pos_old[0]) / video.videoWidth;
        const dy = (fist_pos[1] - fist_pos_old[1]) / video.videoHeight;
        window.scrollBy(dx * 200, dy * 200);
      } else {
        fist_pos_old = fist_pos;
      }
    } else {
      fist_pos_old = null;
    }
  }
};

// initialize object detect library
const initObjectDetect = video => {
  const width = ~~((80 * video.videoWidth) / video.videoHeight);
  const height = 80;
  return new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
};

// rescale coordinates from detector to video coordinate space
// and find coordinates with maximum confidence
const rescaleAndSetMaxConfidence = (coord, video, detector) => {
  coord[0] *= video.videoWidth / detector.canvas.width;
  coord[1] *= video.videoHeight / detector.canvas.height;
  coord[2] *= video.videoWidth / detector.canvas.width;
  coord[3] *= video.videoHeight / detector.canvas.height;

  for (let i = coord.length - 1; i >= 0; --i) {
    if (coord[i][4] > coord[4]) {
      coord = coord[i];
    }
  }

  return coord;
};

// draw coordinates on video overlay
const drawObjectCoordinates = (context, coord, video, canvas) => {
  context.beginPath();
  context.lineWidth = "2";
  context.fillStyle = "rgba(0, 255, 255, 0.5)";
  context.fillRect(
    (coord[0] / video.videoWidth) * canvas.clientWidth,
    (coord[1] / video.videoHeight) * canvas.clientHeight,
    (coord[2] / video.videoWidth) * canvas.clientWidth,
    (coord[3] / video.videoHeight) * canvas.clientHeight
  );
  context.stroke();
};
