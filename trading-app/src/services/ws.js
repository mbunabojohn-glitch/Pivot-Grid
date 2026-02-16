import { wsUrl } from "../config/api";

export function connectWS(dispatch) {
  let ws
  let timer
  function open() {
    const url = wsUrl()
    ws = new WebSocket(url)
    ws.onopen = () => dispatch({ type: 'connection_open' })
    ws.onmessage = (e) => {
      try {
        const { event, payload } = JSON.parse(e.data)
        if (event) dispatch({ type: event, payload })
      } catch {}
    }
    ws.onclose = () => {
      dispatch({ type: 'connection_close' })
      timer = setTimeout(open, 3000)
    }
    ws.onerror = () => {}
  }
  open()
  return () => {
    if (timer) clearTimeout(timer)
    if (ws && ws.readyState < 2) ws.close()
  }
}
