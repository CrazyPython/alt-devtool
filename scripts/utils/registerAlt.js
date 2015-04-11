import ALT from './altKey'
import makeFinalStore from './finalStore'
import post from './post'
import parseStores from './parseStores'
import uid from './uid'

const snapshots = {}

// handle messages from the hook
function onMessageFromHook(event) {
  if (event && event.source !== window) {
    return
  }

  const message = event.data

  if (typeof message !== 'object' || message === null || message.source !== 'alt-hook') {
    return
  }

  const { action, data } = message.payload

  switch (action) {
    case 'SNAPSHOT':
      console.log(window[ALT].takeSnapshot())
    return
    case 'FLUSH':
      console.log(window[ALT].flush())
      post('STORES', {
        stores: parseStores()
      })
    return
    case 'RECYCLE_STORE':
      window[ALT].recycle(data.storeName)
      post('STORES', {
        stores: parseStores()
      })
    return
    case 'REVERT':
      if (snapshots[data.id]) {
        window[ALT].bootstrap(snapshots[data.id])
        post('STORES', {
          stores: parseStores()
        })
      }
    case 'BOOTSTRAP':
      if (data.bootstrapData) {
        window[ALT].bootstrap(data.bootstrapData)
      }
    return
    return
    case 'START_RECORDING':
      // XXX start recording
      // if we're recording let the dispatch now that it was recorded...
    case 'CLEAR_RECORDING':
      // XXX I guess we need to retroactively clear all the dispatches. This should be handled in the store
    case 'STOP_RECORDING':
      // XXX we stop the recording and let the post dispatches know.
    case 'REPLAY_RECORDING':
      // XXX straight-forward, just replay them in a standard way.
    case 'LOAD_RECORDING':
      // XXX I wish this used the file system API
    case 'SAVE_RECORDING':
      // XXX I wish this used the file system API
  }
}

window.addEventListener('message', onMessageFromHook)

function registerAlt() {
  post('STORES', {
    stores: parseStores()
  })

  const finalStore = makeFinalStore(window[ALT])

  finalStore.listen(function ({ payload }) {
    const id = uid()

    post('STORES', {
      stores: parseStores()
    })

    post('DISPATCH', {
      id: id,
      action: Symbol.keyFor(payload.action),
      data: payload.data
    })

    snapshots[id] = window[ALT].takeSnapshot()
  })
}

export default registerAlt
