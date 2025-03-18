import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Проверяем, существует ли администратор
    const admin = await prisma.user.findUnique({
      where: {
        email: 'admin@zoohotel.com'
      }
    })

    if (!admin) {
      // Создаем администратора, если его нет
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@zoohotel.com',
          password: hashedPassword,
          name: 'Administrator',
          phone: '+7 (000) 000-00-00',
          role: 'admin'
        }
      })

      return NextResponse.json({
        message: 'Administrator created successfully',
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role
        }
      })
    }

    return NextResponse.json({
      message: 'Administrator already exists',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup administrator' },
      { status: 500 }
    )
  }
} 