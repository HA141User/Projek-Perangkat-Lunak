import { useNavigate } from 'react-router'
import { useWarehouse } from '../context/WarehouseContext'

export default function useNotificationActions() {
  const navigate = useNavigate()
  const { markNotificationRead } = useWarehouse()

  return function handleNotificationAction(item) {
    if (item?.id) {
      markNotificationRead(item.id)
    }

    if (item?.type === 'approval') {
      navigate('/kepala-gudang/persetujuan')
      return
    }
    if (item?.type === 'report') {
      navigate('/kepala-gudang/laporan')
      return
    }

    const kritisEl = document.getElementById('stok-kritis')
    if (kritisEl) {
      kritisEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    navigate('/kepala-gudang')
  }
}
