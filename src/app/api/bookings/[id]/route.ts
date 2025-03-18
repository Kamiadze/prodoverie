import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmailNotification, sendSMSNotification } from '@/utils/notifications'
import { Booking } from '@prisma/client'

interface BookingWithRelations extends Booking {
  pet: {
    name: string;
    type: string;
    age: number;
    breed: string | null;
  };
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Updating booking:', params.id)
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body
    console.log('New status:', status)

    if (!status) {
      return new NextResponse(
        JSON.stringify({ error: 'Status is required' }),
        { status: 400 }
      )
    }

    // Сначала получаем текущие данные бронирования
    const currentBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        pet: {
          select: {
            name: true,
            type: true,
            age: true,
            breed: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Обновляем статус бронирования
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        pet: {
          select: {
            name: true,
            type: true,
            age: true,
            breed: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    }) as BookingWithRelations

    console.log('Booking updated:', JSON.stringify(booking, null, 2))

    // Отправляем уведомления
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

    if (booking.user.phone) {
      try {
        await sendSMSNotification(booking.user.phone, {
          type: 'booking_status_update',
          booking
        })
        console.log('SMS notification sent successfully')
      } catch (smsError) {
        console.error('Error sending SMS:', smsError)
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        pet: {
          name: booking.pet.name,
          type: booking.pet.type,
          age: booking.pet.age,
          breed: booking.pet.breed
        },
        user: {
          name: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phone
        }
      }
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking', details: error },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    await prisma.booking.delete({
      where: {
        id: params.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
} 