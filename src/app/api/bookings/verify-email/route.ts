import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmailNotification } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Проверяем, есть ли пользователь с таким email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 минут

    // Сохраняем код в базе данных
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationCodeExpires: expiresAt,
      }
    })

    // Отправляем код на email
    await sendEmailNotification({
      to: email,
      subject: 'Код подтверждения для просмотра бронирований',
      text: `Ваш код подтверждения: ${code}. Код действителен в течение 15 минут.`,
    })

    return NextResponse.json({ message: 'Код отправлен на email' })
  } catch (error) {
    console.error('Error sending verification code:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 