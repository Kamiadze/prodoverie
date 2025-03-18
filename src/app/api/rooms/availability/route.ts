import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Booking } from '@prisma/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const petType = searchParams.get('petType')
  
  if (!petType) {
    return NextResponse.json({ error: 'Pet type is required' }, { status: 400 })
  }

  try {
    // Get all bookings for the specified pet type
    const bookings = await prisma.booking.findMany({
      where: {
        pet: {
          type: petType
        },
        // Only consider active and pending bookings
        status: {
          in: ['active', 'pending']
        }
      },
      select: {
        startDate: true,
        endDate: true
      }
    })

    // Get room capacity for the pet type
    const roomCapacity = petType === 'cat' ? 4 : petType === 'dog' ? 6 : 4

    // Create a map of dates and their booking counts
    const dateBookings = new Map<string, number>()
    
    bookings.forEach((booking: { startDate: Date; endDate: Date }) => {
      const start = new Date(booking.startDate)
      const end = new Date(booking.endDate)
      
      // For each day of the booking
      for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0]
        dateBookings.set(dateStr, (dateBookings.get(dateStr) || 0) + 1)
      }
    })

    // Find dates that are fully booked
    const unavailableDates = Array.from(dateBookings.entries())
      .filter(([_, count]) => count >= roomCapacity)
      .map(([date]) => date)

    return NextResponse.json({ unavailableDates })
  } catch (error) {
    console.error('Error getting room availability:', error)
    return NextResponse.json(
      { error: 'Error getting room availability' },
      { status: 500 }
    )
  }
} 