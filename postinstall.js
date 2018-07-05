const fs = require('fs');
const path = require('path');
const WEB_WORKER_AGENT_PATH = 'node_modules/alt-devtool/dist/altifWithWrapper.js'
const WEB_WORKER_PATH = path.resolve('node_modules/react-native/local-cli/server/util/debugger-ui/debuggerWorker.js')
const DEBUGGED_PAGE_PATH = path.resolve('node_modules/react-native/local-cli/server/util/debugger-ui/index.html')

function appendAfterMatch(path, regex, newText) {
    let fileContent = fs.readFileSync(path, 'utf8');
    fileContent = fileContent.replace(regex, (match) => match + '\n' + newText);
    fs.writeFileSync(path, fileContent);
}

// make sure we don't insert the same code twice on different postinstalls
const JS_FLAG = '/* @MODIFIED_BY_ADTWW_SCRIPT_V01 */'
wasNotModifiedBefore = path => !fs.readFileSync(path, 'utf8').includes('MODIFIED_BY_ADTWW_SCRIPT_V01')

if (wasNotModifiedBefore(DEBUGGED_PAGE_PATH)) {
    appendAfterMatch(DEBUGGED_PAGE_PATH, /let worker;$/gm, '' +
      'window.addEventListener(\'message\', function(event) {' +
      'if (event.data.source == \'alt-hook\') {' +
      '/* forward message to worker from content script*/' +
      'let newObject = Object.assign(event.data);' +
      'newObject.fromAltDevToolsWithWebWorker = true;' +
      'worker.postMessage(event.data)}})')
    appendAfterMatch(DEBUGGED_PAGE_PATH, /worker\.onmessage = function.message. {/gm,
      'if (message.data.fromAltDevToolsWithWebWorker === true) {' +
      '/* forward message to content script from web worker*/' +
      'window.postMessage(message.data, \'*\');' +
      'return;' +
      '}')
    appendAfterMatch(DEBUGGED_PAGE_PATH, /<script>/gm, JS_FLAG)
}

if (wasNotModifiedBefore(WEB_WORKER_PATH)) {
    const fileContent = fs.readFileSync(WEB_WORKER_PATH, 'utf8');
    newFileContent = JS_FLAG +
      fs.readFileSync(WEB_WORKER_AGENT_PATH, 'utf8') +
      fileContent.replace(/onmessage = .+$/gm, 'onmessage = wrapWorkerOnMessageForAltDevTool((function() {')
    // replace the last non-empty line so that we add a end parenthesis and move the semicolon to the end of the statement
    newFileContent = newFileContent.replace(/[^\r\n]+(?=[\r\n]+$)/, '})());')
    fs.writeFileSync(WEB_WORKER_PATH, newFileContent)
}
