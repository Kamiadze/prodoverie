import React from 'react'

export default function ServicesPage() {
  const services = [
    {
      title: 'Стандартное размещение',
      price: 'от 1000₽/сутки',
      description: 'Комфортное размещение с индивидуальным пространством, регулярным питанием и ежедневными прогулками.',
      features: [
        'Индивидуальный вольер',
        'Трехразовое питание',
        'Ежедневные прогулки',
        'Постоянный присмотр',
      ],
      color: 'nature',
      popular: false,
    },
    {
      title: 'Люкс размещение',
      price: 'от 2000₽/сутки',
      description: 'Премиум условия для вашего питомца с расширенным пространством и дополнительными услугами.',
      features: [
        'Увеличенный вольер',
        'Премиум корм',
        'Расширенное время прогулок',
        'Ежедневный груминг',
        'Видеонаблюдение',
      ],
      color: 'secondary',
      popular: true,
    },
    {
      title: 'VIP размещение',
      price: 'от 3000₽/сутки',
      description: 'Максимальный комфорт и индивидуальный подход к каждому питомцу.',
      features: [
        'Отдельная комната',
        'Индивидуальное меню',
        'Неограниченные прогулки',
        'Спа-процедуры',
        'Круглосуточное видеонаблюдение',
        'Ежедневный отчет',
      ],
      color: 'primary',
      popular: false,
    },
  ]

  const additionalServices = [
    {
      title: 'Груминг',
      price: 'от 1500₽',
      description: 'Профессиональный уход за шерстью, стрижка и гигиенические процедуры',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      title: 'Ветеринарный осмотр',
      price: 'от 1000₽',
      description: 'Регулярный осмотр и контроль состояния здоровья питомца',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: 'Дрессировка',
      price: 'от 1200₽',
      description: 'Индивидуальные занятия с профессиональным кинологом',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Фотосессия',
      price: 'от 2000₽',
      description: 'Профессиональная фотосъемка вашего питомца',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-accent-light py-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Наши <span className="text-secondary">услуги</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Выберите идеальные условия для вашего питомца. Мы предлагаем различные варианты размещения и дополнительные услуги для максимального комфорта.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                service.popular ? 'ring-4 ring-secondary' : ''
              }`}
            >
              {service.popular && (
                <div className="absolute top-0 right-0 bg-secondary text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                  Популярное
                </div>
              )}
              <div className="p-8">
                <h3 className={`text-2xl font-bold text-${service.color} mb-4`}>{service.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-6">{service.price}</p>
                <p className="text-gray-600 mb-8">{service.description}</p>
                <ul className="space-y-4 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className={`w-5 h-5 text-${service.color} mr-3 mt-1`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-gray-50">
                <a
                  href="/booking"
                  className={`block w-full text-center bg-${service.color} hover:bg-${service.color}-light text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105`}
                >
                  Забронировать
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-20">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Дополнительные <span className="text-secondary">услуги</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => (
              <div
                key={index}
                className="bg-accent-light/50 p-6 rounded-xl transition-all duration-300 hover:bg-accent-light"
              >
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 transform -rotate-6">
                  <div className="text-white transform rotate-6">{service.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{service.title}</h3>
                <p className="text-secondary font-bold mb-4">{service.price}</p>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-nature text-white rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M0 0h100v100H0z'/%3E%3Cpath fill='%23000000' d='M0 0h50v50H0zM50 50h50v50H50z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Остались вопросы?</h2>
            <p className="text-xl text-accent mb-8 max-w-2xl mx-auto">
              Свяжитесь с нами любым удобным способом, и мы поможем подобрать оптимальный вариант размещения для вашего питомца
            </p>
            <a
              href="/contacts"
              className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
            >
              Связаться с нами
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 