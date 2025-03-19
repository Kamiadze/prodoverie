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
    console.log('Received booking request:', body)
    
    // Определяем тип комнаты на основе типа питомца
    let roomType = 'other'
    const petType = body.pets?.[0]?.type?.toLowerCase()
    console.log('Pet type:', petType)
    
    if (petType === 'cat') {
      roomType = 'cat'
    } else if (petType === 'dog') {
      roomType = 'dog'
    }
    console.log('Room type:', roomType)

    // Проверяем доступность комнаты
    const room = await prisma.room.findFirst({
      where: {
        type: roomType,
        available: {
          gt: 0
        }
      }
    })
    console.log('Found room:', room)

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
    console.log('Found user:', user)

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
      console.log('Created new user:', user)

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
      console.log('Updated user:', user)
    }

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
    console.log('Created pet:', pet)

    // Форматируем даты в ISO-8601 формат
    const startDate = new Date(body.startDate).toISOString()
    const endDate = new Date(body.endDate).toISOString()
    console.log('Dates:', { startDate, endDate })

    // Рассчитываем общую стоимость
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = days * room.price
    console.log('Price calculation:', { days, totalPrice })

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
    console.log('Created booking:', booking)

    // Обновляем количество доступных мест
    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: {
        available: room.available - 1
      }
    })
    console.log('Updated room availability:', updatedRoom)

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
    console.error('Detailed error creating booking:', error)
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
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