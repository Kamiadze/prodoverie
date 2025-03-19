'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

interface RoomAvailability {
  total: number
  available: number
  price: number
}

interface AvailableRooms {
  [key: string]: RoomAvailability
}

interface BookingForm {
  name: string
  email: string
  phone: string
  startDate: string
  endDate: string
  pets: {
    name: string
    type: string
    age: number
    breed?: string
  }[]
  notes?: string
  sharedWithPetId?: string
}

const ROOM_PRICES = {
  'cat': 1000,
  'dog': 1200,
  'bird': 800,
  'other': 900
}

export default function BookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableRooms, setAvailableRooms] = useState<AvailableRooms>({})
  const [totalPrice, setTotalPrice] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<BookingForm>({
    defaultValues: {
      pets: [{ name: '', type: '', age: 0 }]
    }
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const petType = watch('pets.0.type')

  useEffect(() => {
    // Загружаем информацию о доступных комнатах
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        console.log('Received rooms data:', data.availableRooms)
        setAvailableRooms(data.availableRooms)
      })
      .catch(err => {
        console.error('Error fetching rooms:', err)
        setError('Ошибка при загрузке информации о комнатах')
      })
  }, [])

  useEffect(() => {
    // Рассчитываем общую стоимость
    if (startDate && endDate && petType) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const roomType = getRoomType(petType)
      const pricePerDay = availableRooms[roomType]?.price || 0
      setTotalPrice(days * pricePerDay)
    }
  }, [startDate, endDate, petType, availableRooms])

  const getRoomType = (petType: string) => {
    const type = petType.toLowerCase()
    if (type === 'cat') return 'cat'
    if (type === 'dog') return 'dog'
    return 'other'
  }

  const onSubmit = async (data: BookingForm) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при создании бронирования')
      }

      router.push('/booking/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при бронировании. Пожалуйста, попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-accent-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-3xl font-bold text-center mb-8">Забронировать номер</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ваше имя</label>
              <input
                type="text"
                {...register('name', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.name && <span className="text-red-500 text-sm">Это поле обязательно</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register('email', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.email && <span className="text-red-500 text-sm">Это поле обязательно</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Телефон</label>
              <input
                type="tel"
                {...register('phone', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.phone && <span className="text-red-500 text-sm">Это поле обязательно</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Дата заезда</label>
                <input
                  type="date"
                  {...register('startDate', { required: true })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                {errors.startDate && <span className="text-red-500 text-sm">Это поле обязательно</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Дата выезда</label>
                <input
                  type="date"
                  {...register('endDate', { required: true })}
                  min={startDate}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                {errors.endDate && <span className="text-red-500 text-sm">Это поле обязательно</span>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о питомце</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Кличка питомца</label>
                  <input
                    type="text"
                    {...register('pets.0.name', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                  {errors.pets?.[0]?.name && <span className="text-red-500 text-sm">Это поле обязательно</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Тип питомца</label>
                  <select
                    {...register('pets.0.type', { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="">Выберите тип</option>
                    <option value="cat">Кошка</option>
                    <option value="dog">Собака</option>
                    <option value="bird">Птица</option>
                    <option value="other">Другое</option>
                  </select>
                  {errors.pets?.[0]?.type && <span className="text-red-500 text-sm">Это поле обязательно</span>}
                </div>

                {petType && availableRooms[getRoomType(petType)] && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-700">
                      Свободно мест: {availableRooms[getRoomType(petType)].available} из {availableRooms[getRoomType(petType)].total}
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      Стоимость: {availableRooms[getRoomType(petType)].price} ₽/сутки
                    </p>
                    {totalPrice > 0 && (
                      <p className="text-sm font-medium text-blue-700 mt-2">
                        Общая стоимость: {totalPrice} ₽
                      </p>
                    )}
                  </div>
                )}

                {petType === 'dog' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Совместное размещение</label>
                    <div className="mt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          {...register('sharedWithPetId')}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Разместить с другим питомцем (при наличии свободного места)
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Возраст питомца</label>
                  <input
                    type="number"
                    {...register('pets.0.age', { required: true, min: 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                  {errors.pets?.[0]?.age && <span className="text-red-500 text-sm">Укажите корректный возраст</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Порода (если есть)</label>
                  <input
                    type="text"
                    {...register('pets.0.breed')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Дополнительные пожелания</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? 'Отправка...' : 'Забронировать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 