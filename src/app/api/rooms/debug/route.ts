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

    return NextResponse.json({
      rooms,
      activeBookings,
      message: 'Debug information retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching debug information:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при получении отладочной информации' },
      { status: 500 }
    )
  }
} 