// entry point to content script
window.addEventListener('beforeunload', onUnload)
window.addEventListener('message', onMessageFromPage)

function onUnload() {
  chrome.runtime.sendMessage({
    type: 'PAGE_UNLOADED'
  })
}

// Communicate with the devtool
function onMessageFromPage(event) {
  if (event && event.source !== window) {
    return
  }

  const message = event.data

  if (typeof message !== 'object' || message === null || message.source !== 'alt-devtools') {
    return
  }

  chrome.runtime.sendMessage(message)
}

// Communicate with the alt interface from the devtool
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  window.postMessage({
    payload: request,
    source: 'alt-hook',
    fromAltDevToolsWithWebWorker: true
  }, '*')
})
