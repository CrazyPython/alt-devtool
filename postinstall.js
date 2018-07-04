const fs = require('fs');
const WEB_WORKER_AGENT_PATH = 'dist/altifWithWrapper.js'
const WEB_WORKER_PATH = '../react-native/local-cli/server/util/debugger-ui/debuggerWorker.js'
const DEBUGGED_PAGE_PATH = '../react-native/local-cli/server/util/debugger-ui/index.html'

function appendAfterMatch(path, regex, newText) {
    let fileContent = fs.readFileSync(path, 'utf8');
    fileContent = fileContent.replace(regex, (match) => match + '\n' + newText);
    fs.writeFileSync(path, fileContent);
}

// make sure we don't insert the same code twice on different postinstalls
const JS_FLAG = '/* @MODIFIED_BY_ADTWW_SCRIPT */'
wasNotModifiedBefore = path => !fs.readFileSync(path, 'utf8').includes('MODIFIED_BY_ADTWW_SCRIPT')

if (wasNotModifiedBefore(DEBUGGED_PAGE_PATH)) {
    appendAfterMatch(DEBUGGED_PAGE_PATH, /let worker;$/gm, 'function onPossibleMessageFromContentScript(event) {if (event.data.source == \'alt-hook\') {/* forward message to worker from content script*/let newObject = Object.assign(event.data);newObject.fromAltDevToolsWithWebWorker = true;worker.postMessage(event.data)}}')
    appendAfterMatch(DEBUGGED_PAGE_PATH, /worker\.onmessage = function.message. {/gm, 'if (message.data.fromAltDevToolsWithWebWorker === true) {/* forward message to content script from web worker*/window.postMessage(message.data, \'*\');return;}')
    appendAfterMatch(DEBUGGED_PAGE_PATH, /<script>/gm, JS_FLAG)
}

if (wasNotModifiedBefore(WEB_WORKER_PATH)) {
    appendAfterMatch(WEB_WORKER_PATH, /onmessage = .+$/gm, 'wrapWorkerOnMessageForAltDevTool(')
    fs.writeFileSync(WEB_WORKER_PATH,
      JS_FLAG + fs.readFileSync(WEB_WORKER_AGENT_PATH, 'utf8') + fs.readFileSync(WEB_WORKER_PATH, 'utf8') + ')'
    )
}
