export async function get(url) {
  // Placeholder REST client
  try {
    const res = await fetch(url)
    return await res.json()
  } catch (e) {
    return { error: 'network', detail: String(e) }
  }
}

export async function post(url, body) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch (e) {
    return { error: 'network', detail: String(e) }
  }
}
