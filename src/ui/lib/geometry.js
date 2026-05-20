export const getDockCenterForKey = (key) => {
  const el = document.querySelector(`[data-dock-key="${key}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}
