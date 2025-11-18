// Simple proxy function for Netlify to forward client API requests to a backend.
// Configure the target backend by setting the Netlify environment variable `API_PROXY_TARGET`.
// Usage: set VITE_API_BASE_URL=/.netlify/functions/api in Netlify build env.

exports.handler = async function (event, context) {
  const TARGET = process.env.API_PROXY_TARGET
  if (!TARGET) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API_PROXY_TARGET is not configured on Netlify' }),
    }
  }

  // Support preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-user-id',
      },
      body: '',
    }
  }

  try {
    // Derive proxied path: remove the function prefix
    // event.path looks like '/.netlify/functions/api/products' -> we want '/products'
    const prefix = '/.netlify/functions/api'
    let proxiedPath = event.path.startsWith(prefix) ? event.path.slice(prefix.length) : event.path
    if (!proxiedPath) proxiedPath = '/'

    const url = TARGET.replace(/\/$/, '') + proxiedPath + (event.rawQueryString ? ('?' + event.rawQueryString) : '')

    const fetchOptions = {
      method: event.httpMethod,
      headers: Object.assign({}, event.headers || {}),
      // event.body is stringified for POST/PUT; pass it through
      body: event.body || undefined,
      redirect: 'manual',
    }

    // Remove host headers to avoid host mismatches
    delete fetchOptions.headers.host

    const res = await fetch(url, fetchOptions)
    const contentType = res.headers.get('content-type') || ''
    const body = contentType.includes('application/json') ? await res.text() : await res.text()

    // Proxy response headers (limited set)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': contentType,
    }

    return {
      statusCode: res.status,
      headers,
      body,
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err) }),
    }
  }
}
