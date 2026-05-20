const slug = (label) => {
  const s = String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // special cases for nicer routes
  if (s === 'file') return 'files'
  if (s === 'teamhub') return 'teamhub'

  return s
}

export const routeForApp = (label) => `/${slug(label)}`
