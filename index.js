try {
    chrome.devtools.panels.create('Alt', null, 'alt-devtool.html', function (panel) {})
} catch (error) {
    // We may be running in firefox. Trying this other argument list instead
    chrome.devtools.panels.create('Alt', 'assets/icon16.png', 'alt-devtool.html')
}
