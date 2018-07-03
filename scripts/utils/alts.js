// globalContext is the global variable. Since we're operating in a web worker, we'll be using `self`.
const globalContext = self
let idx = 0

const alts = {
  switch(i) {
    idx = i
  },

  all() {
    return self['goatslacker.github.io/alt/'] || self['alt.js.org']
  },

  map(f) {
    const all = alts.all()
    return (Array.isArray(all) ? all : [{ alt: all, name: 'Alt' }]).map(f)
  },

  get() {
    const all = alts.all()
    if (all) {
      return Array.isArray(all) ? all[idx].alt : all
    }

    return null
  }
}

export default alts
