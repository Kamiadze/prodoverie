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

type NotificationData = {
  type: 'booking_status_update' | 'booking_confirmation' | 'temporary_password'
  booking?: Booking & {
    pet: any
    user: any
  }
  password?: string
}

export async function sendEmailNotification(email: string, data: NotificationData) {
  try {
    let subject = '';
    let text = '';
    let html = '';

    switch (data.type) {
      case 'booking_status_update':
        if (!data.booking) throw new Error('Booking data is required for status update notification');
        subject = `Обновление статуса бронирования - ${data.booking.pet.name}`;
        text = `Уважаемый(ая) ${data.booking.user.name},\n\n` +
               `Статус бронирования для вашего питомца "${data.booking.pet.name}" был обновлен.\n` +
               `Новый статус: ${data.booking.status}\n` +
               `Даты: ${new Date(data.booking.startDate).toLocaleDateString()} - ${new Date(data.booking.endDate).toLocaleDateString()}\n\n` +
               `С уважением,\nКоманда ZooHotel`;
        
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Обновление статуса бронирования</h2>
            <p>Уважаемый(ая) ${data.booking.user.name},</p>
            <p>Статус бронирования для вашего питомца "${data.booking.pet.name}" был обновлен.</p>
            <p><strong>Новый статус:</strong> ${data.booking.status}</p>
            <p><strong>Даты:</strong> ${new Date(data.booking.startDate).toLocaleDateString()} - ${new Date(data.booking.endDate).toLocaleDateString()}</p>
            <p>С уважением,<br>Команда ZooHotel</p>
          </div>
        `;
        break;

      case 'booking_confirmation':
        if (!data.booking) throw new Error('Booking data is required for confirmation notification');
        subject = `Подтверждение бронирования - ZooHotel`;
        text = `Уважаемый(ая) ${data.booking.user.name},\n\n` +
               `Спасибо за бронирование в ZooHotel!\n\n` +
               `Детали бронирования:\n` +
               `Питомец: ${data.booking.pet.name}\n` +
               `Тип комнаты: ${data.booking.roomType}\n` +
               `Даты: ${new Date(data.booking.startDate).toLocaleDateString()} - ${new Date(data.booking.endDate).toLocaleDateString()}\n\n` +
               `Статус бронирования: ${data.booking.status}\n\n` +
               `Мы свяжемся с вами для подтверждения бронирования.\n\n` +
               `С уважением,\nКоманда ZooHotel`;
        
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Подтверждение бронирования</h2>
            <p>Уважаемый(ая) ${data.booking.user.name},</p>
            <p>Спасибо за бронирование в ZooHotel!</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Детали бронирования:</h3>
              <p><strong>Питомец:</strong> ${data.booking.pet.name}</p>
              <p><strong>Тип комнаты:</strong> ${data.booking.roomType}</p>
              <p><strong>Даты:</strong> ${new Date(data.booking.startDate).toLocaleDateString()} - ${new Date(data.booking.endDate).toLocaleDateString()}</p>
              <p><strong>Статус:</strong> ${data.booking.status}</p>
            </div>
            <p>Мы свяжемся с вами для подтверждения бронирования.</p>
            <p>С уважением,<br>Команда ZooHotel</p>
          </div>
        `;
        break;

      case 'temporary_password':
        if (!data.password) throw new Error('Password is required for temporary password notification');
        subject = `Доступ к личному кабинету - ZooHotel`;
        text = `Здравствуйте!\n\n` +
               `Для вас был создан аккаунт в системе ZooHotel.\n\n` +
               `Ваш временный пароль: ${data.password}\n\n` +
               `Пожалуйста, измените пароль при первом входе в систему.\n\n` +
               `С уважением,\nКоманда ZooHotel`;
        
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Доступ к личному кабинету</h2>
            <p>Здравствуйте!</p>
            <p>Для вас был создан аккаунт в системе ZooHotel.</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Ваш временный пароль:</strong> ${data.password}</p>
            </div>
            <p>Пожалуйста, измените пароль при первом входе в систему.</p>
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