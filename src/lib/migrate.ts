import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function migrate() {
  try {
    // Проверяем, существует ли таблица _prisma_migrations
    const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations'
    `
    
    if (!result || result.length === 0) {
      // Если таблица не существует, выполняем миграции
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
          id SERIAL PRIMARY KEY,
          checksum TEXT NOT NULL,
          finished_at TIMESTAMP WITH TIME ZONE,
          migration_name TEXT NOT NULL,
          logs TEXT,
          rolled_back_at TIMESTAMP WITH TIME ZONE,
          started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          applied_steps_count INTEGER NOT NULL DEFAULT 0
        )
      `
      
      // Добавляем поле totalPrice в таблицу Booking, если его нет
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'Booking' 
            AND column_name = 'totalPrice'
          ) THEN
            ALTER TABLE "Booking" ADD COLUMN "totalPrice" DOUBLE PRECISION DEFAULT 0;
          END IF;
        END $$;
      `
      
      console.log('Database migration completed successfully')
    }
  } catch (error) {
    console.error('Error during migration:', error)
  }
} 