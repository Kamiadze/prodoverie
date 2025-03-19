'use client'
import React, { useState, useEffect } from 'react'

interface RoomAvailability {
  total: number
  available: number
  price: number
}

interface AvailableRooms {
  [key: string]: RoomAvailability
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AvailableRooms>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        setRooms(data.availableRooms)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching rooms:', err)
        setError('Ошибка при загрузке информации о комнатах')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Загрузка...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Управление комнатами</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(rooms).map(([type, room]) => (
          <div key={type} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {type === 'cat' ? 'Комнаты для кошек' :
               type === 'dog' ? 'Комнаты для собак' :
               'Комнаты для других питомцев'}
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Всего мест:</span> {room.total}
              </p>
              <p>
                <span className="font-medium">Свободно мест:</span> {room.available}
              </p>
              <p>
                <span className="font-medium">Стоимость за сутки:</span> {room.price} ₽
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 