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
    console.log('Email credentials:', {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD ? '***' : 'not set'
    });
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
    // Здесь будет логика отправки email
    console.log('Sending email notification:', { email, data })
  } catch (error) {
    console.error('Error sending email notification:', error)
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