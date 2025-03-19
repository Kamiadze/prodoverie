import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationCode: code,
        verificationCodeExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный код или код истек' },
        { status: 400 }
      );
    }

    // Получаем все бронирования пользователя
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
      },
      include: {
        pet: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Очищаем код верификации
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 