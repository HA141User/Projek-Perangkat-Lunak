
import { useNavigate } from 'react-router'
import { useWarehouse } from '../context/WarehouseContext'

export default function useNotificationActions() {
  const navigate = useNavigate()
  const { markNotificationRead, approveReport } = useWarehouse()

  return function handleNotificationAction(item) {
    if (item.id === 'n1') {
      markNotificationRead('n1')
      if (document.getElementById('stok-kritis')) {
        document.getElementById('stok-kritis').scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        return
      }
      navigate('/kepala-gudang')
      return
    }

    if (item.id === 'n2') {
      approveReport('a1')
    }
  }
}
