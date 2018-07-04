function wrapWorkerOnMessageForAltDevTool(toWrap) {
    return function(message) {
        if (message.data.fromAltDevToolsWithWebWorker === true) {
            if(self.onMessageFromHook !== undefined) {
                self.onMessageFromHook(message)
            } else {
                // Worker not ready to receive Alt-DevTool messages.
            }
        } else {
            return toWrap(message)
        }
    }
}
/*
 * Use it like this. You can include this function in your production build if you wish. Don't include altif.js in your
 * production build.
onmessage = wrapWorkerOnMessageForAltDevTool(<your onMessage handler>)
 * The function filters out messages from the Alt Devtool, and forwards the rest to your callback.
 * If altif,js is not active, nothing will happen.
 */
