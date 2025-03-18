'use client'
import { useRouter } from 'next/navigation'

export default function AuthError() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Ошибка авторизации
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Произошла ошибка при попытке входа в систему
          </p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/auth/signin')}
            className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Вернуться к форме входа
          </button>
        </div>
      </div>
    </div>
  )
} 