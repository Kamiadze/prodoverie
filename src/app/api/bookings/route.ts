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
    const body = await request.json()
    
    // Определяем тип комнаты на основе типа питомца
    let roomType = 'other'
    const petType = body.petType?.toLowerCase()
    if (petType === 'cat') {
      roomType = 'cat'
    } else if (petType === 'dog') {
      roomType = 'dog'
    }

    // Проверяем доступность комнаты
    const room = await prisma.room.findFirst({
      where: {
        type: roomType,
        available: {
          gt: 0
        }
      }
    })

    if (!room) {
      return new NextResponse(
        JSON.stringify({ error: 'Нет свободных комнат данного типа' }),
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь с таким email
    let user = await prisma.user.findUnique({
      where: { email: body.email }
    })

    // Если пользователь не существует, создаем нового
    if (!user) {
      const temporaryPassword = Math.random().toString(36).slice(-8)
      user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          phone: body.phone,
          password: await bcryptjs.hash(temporaryPassword, 10)
        }
      })

      // Здесь можно отправить email с временным паролем пользователю
      try {
        await sendEmailNotification(body.email, {
          type: 'temporary_password',
          password: temporaryPassword
        })
      } catch (emailError) {
        console.error('Error sending temporary password email:', emailError)
      }
    } else {
      // Обновляем информацию существующего пользователя
      user = await prisma.user.update({
        where: { email: body.email },
        data: {
          name: body.name || user.name,
          phone: body.phone || user.phone
        }
      })
    }

    // Создаем питомца
    const pet = await prisma.pet.create({
      data: {
        name: body.petName,
        type: body.petType,
        age: body.petAge,
        breed: body.petBreed,
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

    // Рассчитываем общую стоимость
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = days * room.price

    // Создаем бронирование
    const booking = await prisma.booking.create({
      data: {
        startDate,
        endDate,
        status: 'pending',
        notes: body.notes || '',
        roomType,
        userId: user.id,
        petId: pet.id,
        totalPrice: totalPrice
      },
      include: {
        pet: true,
        user: true
      }
    })

    // Обновляем количество доступных мест
    await prisma.room.update({
      where: { id: room.id },
      data: {
        available: room.available - 1
      }
    })

    // Отправляем email-уведомление о бронировании
    try {
      await sendEmailNotification(user.email, {
        type: 'booking_confirmation',
        booking
      })
      console.log('Booking confirmation email sent successfully')
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError)
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