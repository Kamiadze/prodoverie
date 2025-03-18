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
    <div className="min-h-screen bg-accent-light py-12">
      {showLogoutWarning && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-400 text-yellow-700 px-4 py-3 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <p className="font-medium">Внимание!</p>
              <p className="text-sm">Вы будете автоматически выйдены из системы через 30 секунд из-за неактивности.</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowLogoutWarning(false)
                  setLastActivity(Date.now())
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                Остаться
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">
              Панель администратора
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'bookings'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Брони
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'calendar'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Календарь
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-8">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-primary/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">Активные брони</h3>
              <p className="text-3xl font-bold text-primary">{activeBookings}</p>
            </div>
            <div className="bg-secondary/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-2">Ожидают подтверждения</h3>
              <p className="text-3xl font-bold text-secondary">{pendingBookings}</p>
            </div>
            <div className="bg-nature/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-nature mb-2">Свободные места</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Для кошек:</span>
                  <span className="text-lg font-semibold">{availableRooms.cat?.available || 0} из {availableRooms.cat?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Для собак:</span>
                  <span className="text-lg font-semibold">{availableRooms.dog?.available || 0} из {availableRooms.dog?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Для других:</span>
                  <span className="text-lg font-semibold">{availableRooms.other?.available || 0} из {availableRooms.other?.total || 0}</span>
                </div>
              </div>
            </div>
            <div className="bg-accent/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-accent mb-2">Общая стоимость</h3>
              <p className="text-3xl font-bold text-accent">
                {bookings
                  .filter(b => b.status === 'active')
                  .reduce((sum, booking) => sum + (Number(booking.totalPrice) || 0), 0)
                  .toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>

          {activeTab === 'bookings' ? (
            <div className="overflow-x-auto mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">Активные и ожидающие брони</h2>
              {loading ? (
                <div className="text-center py-4">Загрузка...</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedBookings).map(([email, { user, bookings: ownerBookings }]) => (
                    <div key={email} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div 
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleOwnerCollapse(email)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-accent">
                              {ownerBookings.reduce((sum, booking) => sum + (Number(booking.totalPrice) || 0), 0).toLocaleString('ru-RU')} ₽
                            </p>
                            <p className="text-sm text-gray-600">
                              {ownerBookings.length} {ownerBookings.length === 1 ? 'бронирование' : 'бронирования'}
                            </p>
                          </div>
                        </div>
                      </div>
                      {!collapsedOwners.includes(email) && (
                        <div className="divide-y divide-gray-200">
                          {ownerBookings.map(booking => (
                            <div key={booking.id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      booking.status === 'active' 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {booking.status === 'active' ? 'Активное' : 'Ожидает'}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {new Date(booking.startDate).toLocaleDateString('ru-RU')} - 
                                      {new Date(booking.endDate).toLocaleDateString('ru-RU')}
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <p className="font-medium text-gray-900">{booking.pet.name}</p>
                                    <p className="text-gray-600">{booking.pet.type} • {booking.pet.breed || 'Порода не указана'}</p>
                                    <p className="text-gray-600">{booking.pet.age} лет</p>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <p>Тип номера: {booking.roomType}</p>
                                    <p>Время заезда: {booking.checkInTime}</p>
                                    {booking.notes && <p>Примечания: {booking.notes}</p>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-accent">
                                    {(Number(booking.totalPrice) || 0).toLocaleString('ru-RU')} ₽
                                  </p>
                                  <div className="mt-2 space-x-2">
                                    {booking.status === 'pending' && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleStatusUpdate(booking.id, 'active')}
                                          disabled={updating === booking.id}
                                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                        >
                                          {updating === booking.id ? 'Updating...' : 'Approve'}
                                        </button>
                                        <button
                                          onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                                          disabled={updating === booking.id}
                                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                        >
                                          {updating === booking.id ? 'Updating...' : 'Reject'}
                                        </button>
                                      </div>
                                    )}
                                    {booking.status === 'active' && (
                                      <button
                                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                        disabled={updating === booking.id}
                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                      >
                                        {updating === booking.id ? 'Updating...' : 'Complete'}
                                      </button>
                                    )}
                                    {(booking.status === 'pending' || booking.status === 'active') && (
                                      <button
                                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                        disabled={updating === booking.id}
                                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                                      >
                                        {updating === booking.id ? 'Updating...' : 'Cancel'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={calendarEvents}
                  locale={ruLocale}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek'
                  }}
                  eventContent={(eventInfo) => (
                    <div className="p-1">
                      <div className="font-semibold">{eventInfo.event.title}</div>
                      <div className="text-xs">
                        {eventInfo.event.extendedProps.user.name}
                      </div>
                    </div>
                  )}
                  eventDidMount={(info) => {
                    const tooltip = `
                      Питомец: ${info.event.extendedProps.pet?.name || 'Без питомца'}
                      Владелец: ${info.event.extendedProps.user.name}
                      Телефон: ${info.event.extendedProps.user.phone || 'Не указан'}
                      Тип номера: ${info.event.extendedProps.roomType}
                      Статус: ${info.event.extendedProps.status === 'active' ? 'Подтверждено' : 'Ожидает'}
                    `
                    info.el.title = tooltip
                  }}
                  height="auto"
                  aspectRatio={2}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 