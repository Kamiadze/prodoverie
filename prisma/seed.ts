import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  // Создаем администратора
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zoohotel.com' },
    update: {},
    create: {
      email: 'admin@zoohotel.com',
      name: 'Administrator',
      password: hashedPassword,
      role: 'admin',
      phone: '+7 (000) 000-00-00'
    }
  })

  // Очищаем существующие комнаты
  await prisma.room.deleteMany({})

  // Создаем типы комнат
  const rooms = await prisma.room.createMany({
    data: [
      {
        type: 'Standard Cat Room',
        price: 300,
        capacity: 1,
        available: 4,
        total: 4,
        petType: 'cat'
      },
      {
        type: 'Standard Dog Room',
        price: 500,
        capacity: 1,
        available: 6,
        total: 6,
        petType: 'dog'
      },
      {
        type: 'Other Pet Room',
        price: 100,
        capacity: 1,
        available: 4,
        total: 4,
        petType: 'other'
      }
    ]
  })

  console.log({ admin, rooms })
  console.log('Database seeded with new rooms and prices!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 