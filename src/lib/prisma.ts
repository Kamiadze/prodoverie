import { PrismaClient } from '@prisma/client'
import { migrate } from './migrate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Выполняем миграции при запуске приложения
migrate().catch(console.error) 