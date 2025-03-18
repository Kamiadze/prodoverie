import nodemailer from 'nodemailer';
import { Booking } from '@prisma/client'

// Конфигурация для nodemailer
const transporter = nodemailer.createTransport({
  service: 'yandex',
  auth: {
    user: 'tiunoff.ivashka@yandex.ru',
    pass: 'drahttpajjxkexwn'
  }
});

// Проверяем подключение при инициализации
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transport error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Конфигурация для Twilio (опционально)
let twilioClient: any = null;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio client initialized successfully');
  }
} catch (error) {
  console.log('Twilio is not available:', error);
}

interface NotificationData {
  type: 'booking_status_update'
  booking: Booking & {
    pet: any
    user: any
  }
}

export async function sendEmailNotification(email: string, data: NotificationData) {
  try {
    let subject = '';
    let text = '';
    let html = '';

    switch (data.type) {
      case 'booking_status_update':
        subject = `Обновление статуса бронирования - ${data.booking.pet.name}`;
        text = `Уважаемый(ая) ${data.booking.user.name},\n\n` +
               `Статус бронирования для вашего питомца "${data.booking.pet.name}" был обновлен.\n` +
               `Новый статус: ${data.booking.status}\n` +
               `Даты: ${data.booking.startDate.toLocaleDateString()} - ${data.booking.endDate.toLocaleDateString()}\n\n` +
               `С уважением,\nКоманда ZooHotel`;
        
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Обновление статуса бронирования</h2>
            <p>Уважаемый(ая) ${data.booking.user.name},</p>
            <p>Статус бронирования для вашего питомца "${data.booking.pet.name}" был обновлен.</p>
            <p><strong>Новый статус:</strong> ${data.booking.status}</p>
            <p><strong>Даты:</strong> ${data.booking.startDate.toLocaleDateString()} - ${data.booking.endDate.toLocaleDateString()}</p>
            <p>С уважением,<br>Команда ZooHotel</p>
          </div>
        `;
        break;
    }

    await transporter.sendMail({
      from: 'tiunoff.ivashka@yandex.ru',
      to: email,
      subject: subject,
      text: text,
      html: html
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendSMSNotification(phone: string, message: string) {
  if (!twilioClient) {
    console.log('SMS notifications are not available (Twilio is not configured)');
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
} 