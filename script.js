// set up a long-living channel via .connect()
window.port = chrome.runtime.connect({
  name: "toDont"
});

// Listener for messages coming thru port from background page
window.port.onMessage.addListener(function(msg) {
  console.log(msg);
  if (msg.payload === "start") {
    const scripts = ["libs/objectdetect.js", "libs/objectdetect.handfist.js"];

    scripts.forEach(script => {
      // tiny timeout, prevents handfist model from throwing error
      // about objectdetect dependency
      setTimeout(() => {
        const scriptEl = document.createElement("script");
        scriptEl.src = chrome.extension.getURL(script);
        (document.head || document.documentElement).appendChild(scriptEl);
      }, 50);
    });
  }
});
