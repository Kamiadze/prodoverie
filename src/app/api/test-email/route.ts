import { NextResponse } from 'next/server';
import { sendEmailNotification } from '@/utils/notifications';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Создаем тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'test-password',
        name: 'Test User',
        phone: '1234567890',
        role: 'user'
      }
    });

    // Создаем тестового питомца
    const testPet = await prisma.pet.create({
      data: {
        name: 'Test Pet',
        type: 'dog',
        breed: 'Test Breed',
        age: 3,
        ownerId: testUser.id
      }
    });

    // Создаем тестовое бронирование
    const testBooking = await prisma.booking.create({
      data: {
        startDate: new Date(),
        endDate: new Date(),
        status: 'pending',
        notes: 'Test booking',
        roomType: 'Standard',
        userId: testUser.id,
        petId: testPet.id
      },
      include: {
        pet: true,
        user: true
      }
    });

    const testData = {
      type: 'booking_status_update' as const,
      booking: testBooking
    };

    const result = await sendEmailNotification('test@example.com', testData);

    // Очищаем тестовые данные
    await prisma.booking.delete({ where: { id: testBooking.id } });
    await prisma.pet.delete({ where: { id: testPet.id } });
    await prisma.user.delete({ where: { id: testUser.id } });

    if (result) {
      return NextResponse.json({ success: true, message: "Тестовое письмо отправлено" });
    } else {
      return NextResponse.json({ success: false, message: "Не удалось отправить тестовое письмо" });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { success: false, message: "Ошибка при отправке тестового письма" },
      { status: 500 }
    );
  }
} 