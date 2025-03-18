import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Страница не найдена</h2>
      <p>Запрашиваемая страница не существует</p>
      <Link href="/">
        <Button>
          Вернуться на главную
        </Button>
      </Link>
    </div>
  )
} 