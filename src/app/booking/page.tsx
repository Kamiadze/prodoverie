'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

interface Pet {
  name: string
  type: string
  age: string
  breed: string
  sharedWith?: string
}

export default function BookingPage() {
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([{ name: '', type: '', age: '', breed: '' }])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [checkInTime, setCheckInTime] = useState('12:00')
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [totalPrice, setTotalPrice] = useState(0)

  const getPriceByPetType = (type: string) => {
    switch (type) {
      case 'cat':
        return 300
      case 'dog':
        return 500
      case 'other':
        return 100
      default:
        return 0
    }
  }

  const getRoomTypeByPetType = (type: string) => {
    switch (type) {
      case 'cat':
        return 'Standard Cat Room'
      case 'dog':
        return 'Standard Dog Room'
      case 'other':
        return 'Other Pet Room'
      default:
        return ''
    }
  }

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    const processedPets = new Set()
    let total = 0

    // First process pairs of dogs
    pets.forEach((pet, index) => {
      if (pet.type === 'dog' && !processedPets.has(index) && pet.sharedWith) {
        const sharedIndex = pets.findIndex((p, i) => i.toString() === pet.sharedWith)
        if (sharedIndex !== -1) {
          // Apply 50% discount for each dog in the pair
          total += getPriceByPetType('dog') * days * 1.5 // 1.5 instead of 2 for the pair
          processedPets.add(index)
          processedPets.add(sharedIndex)
        }
      }
    })

    // Then process remaining pets
    pets.forEach((pet, index) => {
      if (!processedPets.has(index)) {
        total += getPriceByPetType(pet.type) * days
      }
    })

    return total
  }

  useEffect(() => {
    const total = calculateTotalPrice()
    setTotalPrice(total)
  }, [pets, startDate, endDate])

  const fetchUnavailableDates = async (type: string) => {
    if (!type) return
    try {
      const response = await fetch(`/api/rooms/availability?petType=${type}`)
      const data = await response.json()
      if (data.unavailableDates) {
        setUnavailableDates(data.unavailableDates)
        // Check if current dates are still valid with new unavailable dates
        if (startDate && data.unavailableDates.includes(startDate)) {
          setStartDate('')
        }
        if (endDate && data.unavailableDates.includes(endDate)) {
          setEndDate('')
        }
      }
    } catch (error) {
      console.error('Error fetching unavailable dates:', error)
    }
  }

  const handlePetTypeChange = (index: number, value: string) => {
    const newPets = [...pets]
    newPets[index].type = value
    newPets[index].sharedWith = undefined // Reset shared placement when type changes
    setPets(newPets)
    
    // Get unique pet types to fetch unavailable dates
    const uniquePetTypes = new Set(newPets.map(pet => pet.type))
    uniquePetTypes.forEach(type => {
      if (type) fetchUnavailableDates(type)
    })
  }

  const handleAddPet = () => {
    setPets([...pets, { name: '', type: '', age: '', breed: '' }])
  }

  const handleRemovePet = (index: number) => {
    const newPets = pets.filter((_, i) => i !== index)
    setPets(newPets)
  }

  const handlePetChange = (index: number, field: keyof Pet, value: string) => {
    const newPets = [...pets]
    newPets[index][field] = value
    setPets(newPets)
  }

  const handleSharedWithChange = (index: number, value: string) => {
    const newPets = [...pets]
    
    // Clear previous relationships
    newPets.forEach(pet => {
      if (pet.sharedWith === index.toString()) {
        pet.sharedWith = undefined
      }
    })
    
    // Update new relationship
    if (value) {
      newPets[index].sharedWith = value
      newPets[parseInt(value)].sharedWith = index.toString()
    } else {
      newPets[index].sharedWith = undefined
    }
    
    setPets(newPets)
  }

  const isDateAvailable = (date: string) => {
    if (!date) return true
    
    // Check if date is in unavailable dates
    if (unavailableDates.includes(date)) return false
    
    // If we have a start and end date selected, check if this date falls between them
    if (startDate && endDate) {
      const checkDate = new Date(date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      // If the date is between start and end, it's considered available
      if (checkDate >= start && checkDate <= end) return true
    }
    
    // For any other date, check if it's not in unavailable dates
    return !unavailableDates.includes(date)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    
    const bookingData = {
      name: formData.get('ownerName'),
      phone: formData.get('ownerPhone'),
      email: formData.get('ownerEmail'),
      pets: pets.map(pet => ({
        name: pet.name,
        type: pet.type,
        age: parseInt(pet.age),
        breed: pet.breed,
        sharedWithPetId: pet.sharedWith ? pets[parseInt(pet.sharedWith)].name : undefined
      })),
      startDate: `${startDate}T${checkInTime}`,
      endDate: endDate,
      totalPrice: totalPrice,
      notes: formData.get('notes'),
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Что-то пошло не так')
      }

      alert('Бронирование успешно создано!')
      router.push('/')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Произошла ошибка при создании бронирования')
    }
  }

  return (
    <div className="min-h-screen py-16 bg-accent-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Забронировать <span className="text-secondary">место</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Заполните форму ниже, и мы свяжемся с вами для подтверждения бронирования
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Owner Information */}
            <div className="bg-accent-light/30 rounded-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-primary">
                Информация о владельце
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                    minLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                    pattern="[+]?[0-9]{10,}"
                    title="Введите корректный номер телефона"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="ownerEmail"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pet Information */}
            {pets.map((pet, index) => (
              <div key={index} className="bg-accent-light/30 rounded-xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-primary">
                    Питомец {index + 1}
                  </h2>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePet(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Кличка питомца</label>
                    <input
                      type="text"
                      value={pet.name}
                      onChange={(e) => handlePetChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Вид животного</label>
                    <select
                      value={pet.type}
                      onChange={(e) => handlePetTypeChange(index, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      required
                    >
                      <option value="">Выберите вид</option>
                      <option value="cat">Кошка</option>
                      <option value="dog">Собака</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Возраст</label>
                    <input
                      type="number"
                      value={pet.age}
                      onChange={(e) => handlePetChange(index, 'age', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Порода</label>
                    <input
                      type="text"
                      value={pet.breed}
                      onChange={(e) => handlePetChange(index, 'breed', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                  {pet.type === 'dog' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Совместное размещение с</label>
                      <select
                        value={pet.sharedWith || ''}
                        onChange={(e) => handleSharedWithChange(index, e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      >
                        <option value="">Без совместного размещения</option>
                        {pets.map((otherPet, otherIndex) => {
                          if (otherIndex !== index && otherPet.type === 'dog' && (!otherPet.sharedWith || otherPet.sharedWith === index.toString())) {
                            return (
                              <option key={otherIndex} value={otherIndex}>
                                {otherPet.name || `Питомец ${otherIndex + 1}`}
                              </option>
                            )
                          }
                          return null
                        })}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddPet}
              className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Добавить питомца
            </button>

            {/* Booking Details */}
            <div className="bg-accent-light/30 rounded-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-primary">
                Даты проживания
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата заезда *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время заезда *
                  </label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата выезда *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="bg-accent-light/30 rounded-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-primary">
                Детали бронирования
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-white p-4 rounded-lg border-2 border-primary space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-primary">Итоговая стоимость</span>
                      <span className="text-2xl font-bold text-secondary">{totalPrice}₽</span>
                    </div>
                    <div className="space-y-2">
                      {pets.map((pet, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{pet.name || `Питомец ${index + 1}`} ({pet.type || 'не выбран'})</span>
                          <span>{getPriceByPetType(pet.type)}₽/сутки</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between text-sm">
                        <span>Количество дней</span>
                        <span>
                          {startDate && endDate ? Math.max(1, Math.ceil(
                            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )) : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дополнительные комментарии</label>
                  <textarea
                    name="notes"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    rows={4}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-light text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
              >
                Отправить заявку
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 