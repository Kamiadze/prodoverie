import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function migrate() {
  try {
    // Проверяем, существует ли таблица _prisma_migrations
    const result = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' AND name='_prisma_migrations'
    `
    
    if (!result || result.length === 0) {
      // Если таблица не существует, выполняем миграции
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS _prisma_migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          checksum TEXT NOT NULL,
          finished_at DATETIME,
          migration_name TEXT NOT NULL,
          logs TEXT,
          rolled_back_at DATETIME,
          started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          applied_steps_count INTEGER NOT NULL DEFAULT 0
        )
      `
      
      // Добавляем поле totalPrice в таблицу Booking, если его нет
      await prisma.$executeRaw`
        ALTER TABLE Booking ADD COLUMN totalPrice REAL DEFAULT 0
      `
      
      console.log('Database migration completed successfully')
    }
  } catch (error) {
    console.error('Error during migration:', error)
  }
} 