import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Получаем все комнаты
    const rooms = await prisma.room.findMany()
    
    // Получаем активные и ожидающие бронирования
    const activeBookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['active', 'pending']
        }
      }
    })

    // Подсчитываем занятые места для каждого типа животных
    const occupiedSpots = activeBookings.reduce((acc, booking) => {
      const room = rooms.find(r => r.type === booking.roomType)
      if (room) {
        acc[room.petType] = (acc[room.petType] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Подсчитываем свободные места для каждого типа животных
    const availableRooms = rooms.reduce((acc, room) => {
      acc[room.petType] = {
        total: room.total,
        available: room.total - (occupiedSpots[room.petType] || 0)
      }
      return acc
    }, {} as Record<string, { total: number; available: number }>)

    return NextResponse.json({ availableRooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при получении информации о комнатах' },
      { status: 500 }
    )
  }
} 