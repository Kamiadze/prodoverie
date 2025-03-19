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

  // Создаем комнаты
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { id: 'cat_small' },
      update: {},
      create: {
        id: 'cat_small',
        type: 'cat_small',
        price: 1000,
        capacity: 1,
        available: 5,
        total: 5,
        petType: 'cat',
      },
    }),
    prisma.room.upsert({
      where: { id: 'cat_medium' },
      update: {},
      create: {
        id: 'cat_medium',
        type: 'cat_medium',
        price: 1500,
        capacity: 2,
        available: 3,
        total: 3,
        petType: 'cat',
      },
    }),
    prisma.room.upsert({
      where: { id: 'dog_small' },
      update: {},
      create: {
        id: 'dog_small',
        type: 'dog_small',
        price: 1200,
        capacity: 1,
        available: 4,
        total: 4,
        petType: 'dog',
      },
    }),
    prisma.room.upsert({
      where: { id: 'dog_medium' },
      update: {},
      create: {
        id: 'dog_medium',
        type: 'dog_medium',
        price: 1800,
        capacity: 2,
        available: 3,
        total: 3,
        petType: 'dog',
      },
    }),
    prisma.room.upsert({
      where: { id: 'other' },
      update: {},
      create: {
        id: 'other',
        type: 'other',
        price: 800,
        capacity: 1,
        available: 2,
        total: 2,
        petType: 'other',
      },
    }),
  ])

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