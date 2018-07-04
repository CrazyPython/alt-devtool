# Alt Devtool for React Native & Web Workers

> A chrome extension for debugging your Alt React Native/Web Worker apps

It's possible to create an Alt Devtool that works for both React Native and React, but that doesn't exist yet

Tip: You can create a new chrome profile for debugging and install the extension in that new profile. That way, the
extension is only loaded when it needs to be.

## Install
### Chrome Extension
```
git clone https://github.com/crazypython/alt-devtool.git
```
Open [chrome://extensions](chrome://extensions). Flip the switch at the top right that says "Developer mode." Click "load
unpacked extension." Find the folder the repository was cloned into, and select it. You can ignore the warnings under the
"Errors" panel.
### Registering your Alt instance
```js
var Alt = require('alt');            // <-- the Alt package's default export
var myAltInstance = new Alt();       // <-- your Alt instance
if(__DEV__) {
    Alt.debug('alt', myAltInstance, self);
}
```
### Activating the agent
We cannot rely on the chrome extension itself to inject the agent script into your web worker. Instead you must manually
inject the agent script in the worker code.

#### React Native Chrome Debugging
Run this:
```bash
npm install --save-dev alt-devtool@crazypython/alt-devtool
```
The package includes a `postinstall` script in its package.json. If debugging breaks after installing a new module, you should add `node node_modules/alt-devtool/postinstall.js` to your own postinstall.

> Extra Info: The script patches React Native chrome debugging's frontend. Note that this script can easily break if
`node_modules/react-native/local-cli/server/util/debugger-ui/index.html` is modified in a React Native update. All it
does is use a primitive regular expression to insert code into the correct locations.

The script was tested on 0.56.0-rc.4. If you're having trouble getting it working, try the instructions in "Other Web Workers",
remembering that the web worker is `node_modules/react-native/local-cli/server/util/debugger-ui/debuggerWorker.js` and
the webpage code is at `node_modules/react-native/local-cli/server/util/debugger-ui/index.html`.

Run the postinstall script now. The shell script will run automatically every time the package is installed from npm.
`npm run postinstall`

#### Other Web Workers
Include `dist/altifWithWrapper.js` inside your web worker, or paste it in at the top. You'll need to call wrapWorkerOnMessageForDevTool() on your onmessage handler. It is a built file created by `npm run build-background`.

Alternatively you can add `"alt-devtool": "crazypython/alt-devtool"` to your devDependencies and attempt to `require()`
or `import` `alt-devtool/scripts/utils/altInterface.js`. That file is the entry point to Alt Devtool's agent.

Make these changes to the webpage the web worker is instantiated by:

```
let worker
// start alt forwarding agent
function ADTWW_onPossibleMessageFromContentScript(event) {
  if (event.data.source == 'alt-hook') {
    // forward message to worker
    let newObject = Object.assign(event.data)
    newObject.fromAltDevToolsWithWebWorker = true
    worker.postMessage(event.data)
  }
}
window.addEventListener('message', ADTWW_onPossibleMessageFromContentScript)
// end alt forwarding agent
// later on in your code...
worker = new Worker('myWorkerScript.js');
worker.onmessage = function() {
    // <- insert this code here
    if (message.data.fromAltDevToolsWithWebWorker === true) {
      // forward message to content script
      window.postMessage(message.data, '*')
      return
    }
    // the rest of your handler function
}
```
I have not tested the instructions for other web workers, however they should work.

## Permissions

This extension requires the ability to "Read and change all your data on the websites you visit" according to Google.

This extension just needs some JavaScript to detect whether Alt exists on the page or not. Having access to all data on websites you visit is way more power than this extension actually needs to work. Ideally, the extension would just have access to Alt if it exists or not.

The source code will always be included here and the extension as well should you wish to inspect it.


## Feedback

If you have feedback or issues then please [file an issue](https://github.com/crazypython/alt-devtool/issues).


## Screenshots

All dispatches. Search. Rollback. Time Travel debugging.

![Dispatches](screenshots/1.png)

Viewing stores. Snapshots. Bootstrap. Flush.

![Stores](screenshots/2.png)


## Contributing
This repository is currently a botchy fork of the original Alt Devtool. It works by using the webpage as a bridge between
the chrome extension and the web worker.

The entry point to the chrome extension is `src/index.js`, and the entry point to the agent is `scripts/altInterface.js`.
### Features that don't exist yet
* Creating and replaying recordings in the app. 

## License
MIT
