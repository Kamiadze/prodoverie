import nodemailer from 'nodemailer';
import twilio from 'twilio';
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

// Конфигурация для Twilio
let twilioClient: twilio.Twilio | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
  }
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
          <h2>Уважаемый(ая) ${data.booking.user.name},</h2>
          <p>Статус бронирования для вашего питомца "${data.booking.pet.name}" был обновлен.</p>
          <p><strong>Новый статус:</strong> ${data.booking.status}</p>
          <p><strong>Даты:</strong> ${data.booking.startDate.toLocaleDateString()} - ${data.booking.endDate.toLocaleDateString()}</p>
          <p>С уважением,<br>Команда ZooHotel</p>
        `;
        break;
    }

    const mailOptions = {
      from: 'tiunoff.ivashka@yandex.ru',
      to: email,
      subject: subject,
      text: text,
      html: html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

export async function sendSMSNotification(phone: string, data: NotificationData) {
  try {
    // Здесь будет логика отправки SMS
    console.log('Sending SMS notification:', { phone, data })
  } catch (error) {
    console.error('Error sending SMS notification:', error)
  }
} 