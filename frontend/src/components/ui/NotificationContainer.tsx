import React from 'react'
import { useUIStore } from '../../stores'
import NotificationToast from './NotificationToast'

const NotificationContainer: React.FC = () => {
  const { notifications, clearNotifications } = useUIStore()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-h-screen overflow-y-auto">
      {/* En-tête avec bouton de nettoyage */}
      <div className="flex items-center justify-between mb-3 p-2 bg-white rounded-lg shadow-md border">
        <h3 className="text-sm font-medium text-gray-700">
          Notifications ({notifications.length})
        </h3>
        <button
          onClick={clearNotifications}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Tout effacer
        </button>
      </div>
      
      {/* Liste des notifications */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
          />
        ))}
      </div>
    </div>
  )
}

export default NotificationContainer
