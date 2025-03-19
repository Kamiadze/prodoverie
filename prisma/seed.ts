import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Создаем администратора
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
      phone: '+7 (000) 000-00-00'
    },
  })

  // Создаем комнаты для разных типов питомцев
  const rooms = [
    {
      type: 'cat',
      petType: 'cat',
      total: 5,
      available: 5,
      price: 300
    },
    {
      type: 'dog',
      petType: 'dog',
      total: 5,
      available: 5,
      price: 500
    },
    {
      type: 'other',
      petType: 'other',
      total: 3,
      available: 3,
      price: 100
    }
  ]

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { type: room.type },
      update: room,
      create: room
    })
  }

  console.log({ admin, rooms })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 