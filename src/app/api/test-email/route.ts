import { NextResponse } from 'next/server';
import { sendEmailNotification } from '@/utils/notifications';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Получаем существующее бронирование с включенными данными о питомце и пользователе
    const booking = await prisma.booking.findFirst({
      include: {
        pet: true,
        user: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Нет доступных бронирований для тестирования" },
        { status: 404 }
      );
    }

    const testData = {
      type: 'booking_status_update' as const,
      booking: booking
    };

    await sendEmailNotification(booking.user.email, testData);

    return NextResponse.json({ success: true, message: "Тестовое письмо отправлено" });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { success: false, message: "Ошибка при отправке тестового письма" },
      { status: 500 }
    );
  }
} 