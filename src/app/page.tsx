import React from 'react'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Pattern */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-primary">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="text-white max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Уютный дом для ваших
                <span className="text-warm"> питомцев</span>
              </h1>
              <p className="text-xl mb-8 text-accent">
                Доверьте своего любимца профессионалам. Индивидуальный подход и забота гарантированы.
              </p>
              <div className="space-x-4">
                <a
                  href="/booking"
                  className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
                >
                  Забронировать
                </a>
                <a
                  href="/services"
                  className="inline-block bg-transparent border-2 border-accent hover:bg-accent hover:text-primary text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
                >
                  Узнать больше
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Design */}
      <section className="py-20 bg-accent-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-primary text-center mb-16">
            Почему выбирают <span className="text-secondary">нас</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-xl transform transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-nature rounded-2xl flex items-center justify-center mb-6 transform -rotate-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Профессиональный уход</h3>
              <p className="text-gray-600 leading-relaxed">Наши специалисты имеют многолетний опыт работы с животными и обеспечат вашему питомцу максимальный комфорт</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl transform transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 transform rotate-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Круглосуточное наблюдение</h3>
              <p className="text-gray-600 leading-relaxed">Мы следим за состоянием и самочувствием вашего питомца 24 часа в сутки, 7 дней в неделю</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl transform transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-warm rounded-2xl flex items-center justify-center mb-6 transform -rotate-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Индивидуальный подход</h3>
              <p className="text-gray-600 leading-relaxed">Мы учитываем особенности характера и привычки каждого питомца для создания максимально комфортных условий</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-nature relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M0 0h100v100H0z'/%3E%3Cpath fill='%23000000' d='M0 0h50v50H0zM50 50h50v50H50z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-8">
            Готовы доверить нам своего питомца?
          </h2>
          <p className="text-xl text-accent mb-12 max-w-2xl mx-auto">
            Забронируйте место прямо сейчас и подарите своему питомцу незабываемый отдых в нашей гостинице
          </p>
          <a
            href="/booking"
            className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold py-4 px-12 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
          >
            Забронировать место
          </a>
        </div>
      </section>
    </div>
  )
} 