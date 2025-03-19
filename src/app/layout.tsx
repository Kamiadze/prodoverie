import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Providers } from '@/components/Providers'
import { AdminKeyHandler } from '@/components/AdminKeyHandler'
import { ToastProvider } from '@/components/ui/use-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZooHotel - Отель для животных',
  description: 'Комфортный отель для ваших питомцев',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ToastProvider>
          <Providers>
            <Navigation />
            <AdminKeyHandler />
            <main className="min-h-screen bg-accent-light">
              {children}
            </main>
            <footer className="bg-primary text-white py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">
                      <span className="text-secondary">pro</span>Доверие
                    </h3>
                    <p className="text-accent-light">Забота о ваших питомцах - наша работа</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-secondary">Контакты</h4>
                    <div className="space-y-2 text-accent-light">
                      <p>Телефон: +7 (999) 123-45-67</p>
                      <p>Email: info@prodoverie.ru</p>
                      <p>Адрес: ул. Примерная, д. 123</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-secondary">Режим работы</h4>
                    <div className="space-y-2 text-accent-light">
                      <p>Пн-Вс: 24/7</p>
                      <p>Работаем без выходных</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-accent/20">
                  <div className="text-center text-accent-light">
                    <p>© 2024 proДоверие. Все права защищены</p>
                  </div>
                </div>
              </div>
            </footer>
          </Providers>
        </ToastProvider>
      </body>
    </html>
  )
} 