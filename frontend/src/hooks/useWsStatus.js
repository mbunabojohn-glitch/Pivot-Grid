import { useStore } from '../state/store.jsx'

export default function useWsStatus() {
  const { state } = useStore()
  return state.connection.status
}
