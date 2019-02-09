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
  injectScripts();
  injectCanvasMarkup();
  injectVideoMarkup();
};

// inject computer vision scripts
const injectScripts = () => {
  const scripts = ["libs/objectdetect.js", "libs/objectdetect.handfist.js"];

  scripts.forEach(script => {
    // timeout stops model from throwing error about objectdetect dependency after injection
    setTimeout(() => {
      const scriptEl = document.createElement("script");
      scriptEl.src = chrome.extension.getURL(script);
      document.head.appendChild(scriptEl);
    }, 50);
  });
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

const injectVideoMarkup = () => {
  const videoEl = document.createElement("video");
  videoEl.muted = true;
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
