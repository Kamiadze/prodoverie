import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Авторизация | ZooHotel',
  description: 'Страница авторизации для панели администратора ZooHotel',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-accent-light">
      {children}
    </div>
  )
} 