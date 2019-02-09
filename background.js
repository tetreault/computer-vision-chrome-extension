// connect to the port created in our content script
chrome.extension.onConnect.addListener(port => {
  // listen for our browerAction to be clicked
  chrome.browserAction.onClicked.addListener(tab => {
    port.postMessage({
      type: "DEFAULT",
      context: "background",
      payload: "start"
    });
  });

  // catch messages passed from content script
  port.onMessage.addListener(msg => {});
});
