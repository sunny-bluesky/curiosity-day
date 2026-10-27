// iOS only raises the keyboard when a field gets focus synchronously inside a tap.
// The editor opens on the next render, so on tap we focus a hidden input first
// (keyboard goes up), and the editor then moves the focus to its title field.
let primed: HTMLInputElement | null = null

export function releasePrimedKeyboard() {
  primed?.remove()
  primed = null
}

export function primeKeyboard() {
  releasePrimedKeyboard()
  const el = document.createElement('input')
  el.setAttribute('aria-hidden', 'true')
  el.tabIndex = -1
  el.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;border:0;padding:0;font-size:16px;'
  document.body.appendChild(el)
  el.focus()
  primed = el
  // Safety: never leave the helper behind if the editor does not open.
  window.setTimeout(releasePrimedKeyboard, 3000)
}
