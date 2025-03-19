import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Очищаем существующие комнаты
  await prisma.room.deleteMany()

  // Создаем комнаты с правильным количеством мест
  const rooms = [
    {
      type: 'cat',
      price: 1000,
      capacity: 1,
      available: 4,
      total: 4,
      petType: 'cat'
    },
    {
      type: 'dog',
      price: 1200,
      capacity: 1,
      available: 6,
      total: 6,
      petType: 'dog'
    },
    {
      type: 'other',
      price: 900,
      capacity: 1,
      available: 4,
      total: 4,
      petType: 'other'
    }
  ]

  for (const room of rooms) {
    await prisma.room.create({
      data: room
    })
  }

  console.log('Rooms initialized successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 