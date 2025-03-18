import { NextResponse } from 'next/server';
import { sendEmailNotification } from '@/utils/notifications';

export async function GET() {
  try {
    const testData = {
      userName: "Тестовый Пользователь",
      petName: "Барсик",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
      status: "active",
      email: "alanceeder@gmail.com",
      phone: "+1234567890"
    };

    const result = await sendEmailNotification(testData);

    if (result) {
      return NextResponse.json({ success: true, message: "Тестовое письмо отправлено" });
    } else {
      return NextResponse.json(
        { success: false, message: "Ошибка при отправке письма" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { success: false, message: "Ошибка при отправке письма", error },
      { status: 500 }
    );
  }
} 