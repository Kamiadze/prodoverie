import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Session } from 'next-auth'
import bcryptjs from 'bcryptjs'
import { sendEmailNotification } from '@/utils/notifications'

interface Pet {
  name: string
  type: string
  age: number
  breed?: string
  sharedWithPetId?: string
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Определяем тип комнаты на основе типа питомца
    let roomType = 'standard'
    if (body.pets && body.pets[0]) {
      const petType = body.pets[0].type.toLowerCase()
      if (petType === 'cat') {
        roomType = 'Cat Room'
      } else if (petType === 'dog') {
        roomType = 'Dog Room'
      } else if (petType === 'bird') {
        roomType = 'Bird Room'
      } else if (petType === 'other') {
        roomType = 'Other Pet Room'
      }
    }

    // Проверяем доступность комнаты
    const room = await prisma.room.findFirst({
      where: {
        type: roomType,
        available: 1
      }
    })

    if (!room) {
      return new NextResponse(
        JSON.stringify({ error: 'Нет свободных комнат данного типа' }),
        { status: 400 }
      )
    }

    // Используем существующего пользователя из сессии
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        phone: body.phone || undefined,
        name: body.name || undefined
      }
    })

    // Создаем питомца
    const pet = await prisma.pet.create({
      data: {
        name: body.pets[0].name,
        type: body.pets[0].type,
        age: body.pets[0].age,
        breed: body.pets[0].breed,
        owner: {
          connect: {
            id: user.id
          }
        }
      }
    })

    // Форматируем даты в ISO-8601 формат
    const startDate = new Date(body.startDate).toISOString()
    const endDate = new Date(body.endDate).toISOString()

    // Создаем бронирование
    const booking = await prisma.booking.create({
      data: {
        startDate,
        endDate,
        status: 'pending',
        notes: body.notes || '',
        roomType,
        userId: user.id,
        petId: pet.id
      },
      include: {
        pet: true,
        user: true
      }
    })

    // Отправляем email-уведомление
    if (booking.user.email) {
      try {
        await sendEmailNotification(booking.user.email, {
          type: 'booking_status_update',
          booking
        })
        console.log('Email notification sent successfully')
      } catch (emailError) {
        console.error('Error sending email:', emailError)
      }
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error creating booking:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Если пользователь не админ, показываем только его бронирования
    const where = session.user.role === 'admin' ? {} : { userId: session.user.id }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        pet: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
} 