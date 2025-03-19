'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const error = searchParams.get('error')
    let message = 'Произошла ошибка при попытке входа в систему'

    switch (error) {
      case 'CredentialsSignin':
        message = 'Неверный email или пароль'
        break
      case 'AccessDenied':
        message = 'Доступ запрещен'
        break
      case 'Verification':
        message = 'Ошибка верификации'
        break
      case 'Default':
        message = 'Произошла неизвестная ошибка'
        break
    }

    setErrorMessage(message)
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Ошибка авторизации
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorMessage}
          </p>
        </div>
        <div className="flex flex-col space-y-4 items-center">
          <button
            onClick={() => router.push('/auth/signin')}
            className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Вернуться к форме входа
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-primary hover:text-primary-dark"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  )
} 