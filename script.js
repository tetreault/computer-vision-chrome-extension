"use script";

/*
 * Set up port and listener
 */
window.port = chrome.runtime.connect({ name: "port" });

window.port.onMessage.addListener(function(msg) {
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
};

// inject computer vision scripts
const injectScripts = () => {
  const scripts = ["libs/objectdetect.js", "libs/objectdetect.handfist.js"];

  scripts.forEach(script => {
    // timeout prevents handfist model from throwing error
    // about objectdetect dependency after injection
    setTimeout(() => {
      const scriptEl = document.createElement("script");
      scriptEl.src = chrome.extension.getURL(script);
      (document.head || document.documentElement).appendChild(scriptEl);
    }, 50);
  });
};

const injectCameraMarkup = () => {
  
};
