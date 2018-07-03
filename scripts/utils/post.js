function post(type, payload) {
  postMessage({
    type: type,
    payload: payload,
    source: 'alt-devtools',
    fromAltDevToolsWithWebWorker: true,
  })
}

export default post
