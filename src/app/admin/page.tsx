'use client'
import React, { useEffect, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
  startDate: string
  endDate: string
  status: string
  notes?: string
  pet: {
    name: string
    type: string
    age: number
    breed?: string | null
  }
  user: {
    name: string
    email: string
    phone: string | null
  }
  roomType: string
  createdAt: string
  updatedAt: string
  checkInTime: string
  totalPrice: number | null
  sharedWithPetId?: string | null
}

interface AvailableRooms {
  [key: string]: {
    total: number
    available: number
  }
}

type Tab = 'bookings' | 'calendar'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableRooms, setAvailableRooms] = useState<AvailableRooms>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('bookings')
  const [collapsedOwners, setCollapsedOwners] = useState<string[]>([])
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showLogoutWarning, setShowLogoutWarning] = useState(false)
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null)

  const handleLogout = useCallback(() => {
    signOut({ redirect: true, callbackUrl: '/auth/signin' })
  }, [])

  // Обработчик активности пользователя
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now())
      setShowLogoutWarning(false)
      
      if (logoutTimer) {
        clearTimeout(logoutTimer)
        setLogoutTimer(null)
      }
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)
    window.addEventListener('touchstart', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
    }
  }, [logoutTimer])

  // Проверка неактивности и автоматический выход
  useEffect(() => {
    const checkInactivity = () => {
      const currentTime = Date.now()
      const inactiveTime = currentTime - lastActivity
      
      if (inactiveTime > 150000 && !showLogoutWarning) {
        setShowLogoutWarning(true)
        
        const timer = setTimeout(() => {
          handleLogout()
        }, 30000)
        
        setLogoutTimer(timer)
      }
    }

    const interval = setInterval(checkInactivity, 30000)

    return () => {
      clearInterval(interval)
      if (logoutTimer) {
        clearTimeout(logoutTimer)
      }
    }
  }, [lastActivity, showLogoutWarning, handleLogout, logoutTimer])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchBookings()
      fetchAvailableRooms()
      const interval = setInterval(checkCompletedBookings, 60000)
      return () => clearInterval(interval)
    }
  }, [status, session, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err) {
      setError('Failed to load bookings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      if (!response.ok) throw new Error('Failed to fetch available rooms')
      const data = await response.json()
      setAvailableRooms(data.availableRooms || {})
    } catch (err) {
      console.error('Error fetching available rooms:', err)
    }
  }

  const checkCompletedBookings = () => {
    const now = new Date()
    bookings.forEach(booking => {
      if (booking.status === 'active' && new Date(booking.endDate) < now) {
        updateBookingStatus(booking.id, 'completed')
      }
    })
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdating(bookingId)
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      const data = await response.json()
      
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId ? data.booking : booking
        )
      )
      
      setUpdating(null)
    } catch (err) {
      console.error('Error updating booking:', err)
      setError('Failed to update booking')
      setUpdating(null)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      setUpdating(bookingId)
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      const updatedBooking = await response.json()
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? updatedBooking.booking : booking
      ))
    } catch (error) {
      console.error('Error updating booking status:', error)
      setError('Failed to update booking status')
    } finally {
      setUpdating(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.role || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-light">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Доступ запрещен</h2>
          <p className="mt-2 text-gray-600">У вас нет прав для доступа к этой странице</p>
        </div>
      </div>
    )
  }

  const activeBookings = bookings.filter(b => b.status === 'active').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)

  const renderStatistics = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Активные бронирования</h3>
          <p className="text-3xl font-bold text-primary">{activeBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Ожидают подтверждения</h3>
          <p className="text-3xl font-bold text-secondary">{pendingBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Общая выручка</h3>
          <p className="text-3xl font-bold text-green-600">{totalRevenue} ₽</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Свободные места</h3>
          <div className="space-y-2">
            {Object.entries(availableRooms).map(([type, data]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600">{type}:</span>
                <span className="font-medium">{data.available}/{data.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const calendarEvents = bookings
    .filter(booking => ['active', 'pending'].includes(booking.status))
    .map(booking => ({
      id: booking.id,
      title: `${booking.pet?.name || 'Без питомца'} (${booking.roomType})`,
      start: booking.startDate,
      end: booking.endDate,
      backgroundColor: booking.status === 'active' ? '#10B981' : '#F59E0B',
      borderColor: booking.status === 'active' ? '#059669' : '#D97706',
      extendedProps: {
        pet: booking.pet,
        user: booking.user,
        status: booking.status,
        roomType: booking.roomType
      }
    }))

  const groupedBookings = bookings
    .filter(booking => ['active', 'pending'].includes(booking.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .reduce((groups, booking) => {
      const email = booking.user.email
      if (!groups[email]) {
        groups[email] = {
          user: booking.user,
          bookings: []
        }
      }
      groups[email].bookings.push(booking)
      return groups
    }, {} as Record<string, { user: Booking['user']; bookings: Booking[] }>)

  const toggleOwnerCollapse = (email: string) => {
    setCollapsedOwners(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    )
  }

  return (
    <div className="min-h-screen bg-accent-light p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Панель администратора
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Выйти
          </button>
        </div>

        {showLogoutWarning && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
            <p>
              Вы будете автоматически выйти из системы через 30 секунд из-за отсутствия активности.
              Пожалуйста, сделайте что-нибудь, чтобы остаться в системе.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {renderStatistics()}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded ${
                activeTab === 'bookings'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Список бронирований
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded ${
                activeTab === 'calendar'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Календарь
            </button>
          </div>

          {activeTab === 'bookings' ? (
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Загрузка бронирований...</p>
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-center py-12 text-gray-500">Нет бронирований</p>
              ) : (
                bookings.map(booking => (
                  <div
                    key={booking.id}
                    className="bg-gray-50 rounded-lg p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Питомец: {booking.pet.name}
                        </h3>
                        <p className="text-gray-600">
                          Тип: {booking.pet.type}, Возраст: {booking.pet.age}
                          {booking.pet.breed && `, Порода: ${booking.pet.breed}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Создано:{' '}
                          {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {booking.id}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Информация о владельце:
                        </h4>
                        <p>Имя: {booking.user.name}</p>
                        <p>Email: {booking.user.email}</p>
                        {booking.user.phone && <p>Телефон: {booking.user.phone}</p>}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Детали бронирования:
                        </h4>
                        <p>
                          Даты: {new Date(booking.startDate).toLocaleDateString('ru-RU')} -{' '}
                          {new Date(booking.endDate).toLocaleDateString('ru-RU')}
                        </p>
                        <p>Тип комнаты: {booking.roomType}</p>
                        {booking.totalPrice && (
                          <p>Стоимость: {booking.totalPrice} ₽</p>
                        )}
                      </div>
                    </div>

                    {booking.notes && (
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Дополнительные заметки:
                        </h4>
                        <p className="text-gray-600">{booking.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status === 'pending'
                            ? 'Ожидает'
                            : booking.status === 'active'
                            ? 'Активно'
                            : booking.status === 'completed'
                            ? 'Завершено'
                            : booking.status === 'cancelled'
                            ? 'Отменено'
                            : booking.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking.id, 'active')
                              }
                              disabled={updating === booking.id}
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                              {updating === booking.id
                                ? 'Обновление...'
                                : 'Подтвердить'}
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking.id, 'cancelled')
                              }
                              disabled={updating === booking.id}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                              {updating === booking.id
                                ? 'Обновление...'
                                : 'Отменить'}
                            </button>
                          </>
                        )}
                        {booking.status === 'active' && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, 'completed')
                            }
                            disabled={updating === booking.id}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                          >
                            {updating === booking.id
                              ? 'Обновление...'
                              : 'Завершить'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={ruLocale}
                events={bookings.map(booking => ({
                  title: `${booking.pet.name} (${booking.roomType})`,
                  start: booking.startDate,
                  end: booking.endDate,
                  backgroundColor:
                    booking.status === 'pending'
                      ? '#FCD34D'
                      : booking.status === 'active'
                      ? '#34D399'
                      : booking.status === 'completed'
                      ? '#60A5FA'
                      : '#F87171',
                }))}
                height="auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 