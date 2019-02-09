"use script";

/*
 * Set up port and listener
 */
window.port = chrome.runtime.connect({ name: "port" });

window.port.onMessage.addListener(function(msg) {
  // if background js sends "start" from browserAction.onClicked, init everything
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
  const constraints = { video: true };

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
    /* Prepare the detector once the video dimensions are known */
    if (!detector) {
      const width = ~~((80 * videoEl.videoWidth) / videoEl.videoHeight);
      const height = 80;
      detector = new objectdetect.detector(
        width,
        height,
        1.1,
        objectdetect.handfist
      );
    }

    /* Draw video overlay: */
    // canvasEl.width = ~~((100 * video.videoWidth) / video.videoHeight);
    // canvasEl.height = 100;
    context.drawImage(
      videoEl,
      0,
      0,
      canvasEl.clientWidth,
      canvasEl.clientHeight
    );

    let coords = detector.detect(videoEl, 1);
    if (coords[0]) {
      let coord = coords[0];

      /* Rescale coordinates from detector to video coordinate space */
      coord[0] *= videoEl.videoWidth / detector.canvas.width;
      coord[1] *= videoEl.videoHeight / detector.canvas.height;
      coord[2] *= videoEl.videoWidth / detector.canvas.width;
      coord[3] *= videoEl.videoHeight / detector.canvas.height;

      /* Find coordinates with maximum confidence */
      for (let i = coords.length - 1; i >= 0; --i) {
        if (coords[i][4] > coord[4]) {
          coord = coords[i];
        }
      }

      /* Scroll window */
      const fist_pos = [coord[0] + coord[2] / 2, coord[1] + coord[3] / 2];
      if (fist_pos_old) {
        const dx = (fist_pos[0] - fist_pos_old[0]) / video.videoWidth;
        const dy = (fist_pos[1] - fist_pos_old[1]) / video.videoHeight;
        window.scrollBy(dx * 200, dy * 200);
      } else {
        fist_pos_old = fist_pos;
      }

      /* Draw coordinates on video overlay */
      context.beginPath();
      context.lineWidth = "2";
      context.fillStyle = "rgba(0, 255, 255, 0.5)";
      context.fillRect(
        (coord[0] / videoEl.videoWidth) * canvasEl.clientWidth,
        (coord[1] / videoEl.videoHeight) * canvasEl.clientHeight,
        (coord[2] / videoEl.videoWidth) * canvasEl.clientWidth,
        (coord[3] / videoEl.videoHeight) * canvasEl.clientHeight
      );
      context.stroke();
    } else {
      fist_pos_old = null;
    }
  }
};
