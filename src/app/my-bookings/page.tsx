'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
  startDate: string
  endDate: string
  status: string
  totalPrice: number
  pet: {
    name: string
    type: string
    breed?: string
  }
  roomType: string
}

export default function MyBookingsPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/bookings/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Ошибка при отправке кода')
      }

      setStep('code')
    } catch (err) {
      setError('Ошибка при отправке кода. Пожалуйста, проверьте email и попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/bookings/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      })

      if (!response.ok) {
        throw new Error('Неверный код')
      }

      const data = await response.json()
      setBookings(data.bookings)
    } catch (err) {
      setError('Неверный код. Пожалуйста, попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Мои бронирования</h1>

      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="max-w-md">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Отправка...' : 'Получить код'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="max-w-md">
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Код подтверждения
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Проверка...' : 'Подтвердить'}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Ваши бронирования</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">{booking.pet.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'Подтверждено' :
                     booking.status === 'pending' ? 'Ожидает' : 'Отменено'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {booking.pet.type} • {booking.pet.breed || 'Порода не указана'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Заезд: {new Date(booking.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Выезд: {new Date(booking.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium">
                  Стоимость: {booking.totalPrice} ₽
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 