import { APP_CONFIG } from '../config/index.js'

function trimTrailingSlash(value = '') {
  return value.replace(/\/+$/, '')
}

function trimLeadingSlash(value = '') {
  return value.replace(/^\/+/, '')
}

export function getApiBaseUrl() {
  return trimTrailingSlash(APP_CONFIG.API_BASE_URL)
}

export function getStaticBaseUrl() {
  return trimTrailingSlash(APP_CONFIG.STATIC_URL)
}

export function resolveAssetUrl(url) {
  if (!url) return url

  const normalizedUrl = url.replace(/\\/g, '/')
  if (/^https?:\/\//i.test(normalizedUrl)) {
    try {
      const parsedUrl = new URL(normalizedUrl)
      const normalizedPath = parsedUrl.pathname.replace(/^\/api\/static\//, '').replace(/^\/static\//, '')
      if (normalizedPath !== parsedUrl.pathname.replace(/^\/+/, '')) {
        return `${getStaticBaseUrl()}/${trimLeadingSlash(normalizedPath)}`
      }
    } catch (error) {
      return normalizedUrl
    }

    return normalizedUrl
  }

  return `${getStaticBaseUrl()}/${trimLeadingSlash(normalizedUrl.replace(/^\/?api\/static\//, '').replace(/^\/?static\//, ''))}`
}
