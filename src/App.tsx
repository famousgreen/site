import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, Check, Menu, X } from 'lucide-react'
import './App.css'

type ShootType = 'portrait' | 'wedding' | 'commercial'
type ContactMethod = 'instagram' | 'email' | 'telegram' | 'whatsapp'

const shoots: Array<{
  id: ShootType
  index: string
  title: string
  word: string
  place: string
  image: string
  detail: string
  description: string
  points: string[]
}> = [
  {
    id: 'portrait',
    index: '01',
    title: 'Обычная съёмка',
    word: 'Портрет',
    place: 'Paris · 48.8566° N',
    image: '/images/portfolio/portrait-paris.jpg',
    detail: '/images/portfolio/hero-paris.jpg',
    description:
      'Для тех, кто хочет увидеть себя без придуманной роли. Выбираем маршрут вместе и снимаем так, чтобы в кадре остался ваш ритм.',
    points: ['2 часа в городе', 'Подбор локаций и света', 'Готовая серия в галерее'],
  },
  {
    id: 'wedding',
    index: '02',
    title: 'Свадебная съёмка',
    word: 'Свадьба',
    place: 'Normandie · 49.7072° N',
    image: '/images/portfolio/wedding-normandy.jpg',
    detail: '/images/portfolio/portrait-paris.jpg',
    description:
      'Не режиссирую чувства — замечаю их. Собираю день в живую последовательность: ветер, объятия, детали и люди рядом.',
    points: ['От утра до первого танца', 'Репортаж и портреты пары', 'Единая история, а не набор кадров'],
  },
  {
    id: 'commercial',
    index: '03',
    title: 'Коммерческая съёмка',
    word: 'Бренд',
    place: 'Île-de-France · 48.8589° N',
    image: '/images/portfolio/commercial-france.jpg',
    detail: '/images/portfolio/wedding-normandy.jpg',
    description:
      'Перевожу характер бренда в визуальный язык: от идеи и референсов до серии для сайта, кампании и соцсетей.',
    points: ['Бриф и визуальная концепция', 'Предметная и людская съёмка', 'Файлы под сайт и печать'],
  },
]

const steps = [
  ['01', 'Пишете мне', 'Короткая заявка: формат, дата и удобный мессенджер'],
  ['02', 'Обсуждаем', 'Уточняем идею, место и настроение, подбираем время'],
  ['03', 'Снимаем', 'Работаю спокойно и без постановочных поз'],
]

const methods: Array<{ id: ContactMethod; label: string; placeholder: string }> = [
  { id: 'instagram', label: 'Instagram', placeholder: '@username' },
  { id: 'email', label: 'Email', placeholder: 'name@example.com' },
  { id: 'telegram', label: 'Telegram', placeholder: '@username или телефон' },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: '+33 6 00 00 00 00' },
]

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingShoot, setBookingShoot] = useState<ShootType>('portrait')

  const openBooking = (shoot: ShootType = 'portrait') => {
    setBookingShoot(shoot)
    setBookingOpen(true)
  }

  return (
    <div className="portfolio">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Наверх">
          A. Moreau
        </a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <a href="#work">Работы</a>
          <a href="#process">Процесс</a>
          <button type="button" onClick={() => openBooking()}>
            Забронировать
          </button>
        </nav>
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-menu" aria-label="Мобильная навигация">
          <a href="#work" onClick={() => setMenuOpen(false)}>Работы</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>Процесс</a>
          <button type="button" onClick={() => { setMenuOpen(false); openBooking() }}>
            Забронировать <ArrowRight />
          </button>
        </nav>
      )}

      <main>
        <section className="hero" id="top">
          <p className="hero-kicker">
            <span>Photographe</span>
            <span>Paris / Normandie</span>
          </p>
          <h1 aria-label="Alina Moreau">
            <span className="line"><span>Alina</span></span>
            <span className="line"><span>Moreau</span></span>
          </h1>
          <div className="hero-collage">
            <figure className="hero-photo hero-photo-main">
              <img src="/images/portfolio/portrait-paris.jpg" alt="Портрет на парижской улице" />
            </figure>
            <figure className="hero-photo hero-photo-wide">
              <img src="/images/portfolio/hero-paris.jpg" alt="Прогулка у набережной в утреннем Париже" />
            </figure>
            <div className="hero-note">
              <p>Живые фотографии о людях, близости и брендах — во Франции и там, где начинается ваша история</p>
              <button type="button" onClick={() => openBooking()}>
                Выбрать дату <ArrowUpRight />
              </button>
            </div>
            <span className="hero-index">N° 2026</span>
          </div>
        </section>

        <section className="statement" id="approach">
          <Reveal>
            <p className="label">[ Подход ]</p>
            <h2>
              Я не прошу вести себя естественно. Я создаю пространство, в котором{' '}
              <em>можно не играть</em>
            </h2>
          </Reveal>
        </section>

        <section className="work" id="work">
          <Reveal className="work-heading">
            <p className="label">[ Три формата ]</p>
            <h2>Выберите свою историю</h2>
          </Reveal>

          {shoots.map((shoot, i) => (
            <article className={`shoot ${i % 2 ? 'shoot-flip' : ''}`} key={shoot.id}>
              <Reveal className="shoot-visual">
                <figure className="shoot-main">
                  <img src={shoot.image} alt={shoot.title} loading="lazy" />
                </figure>
                <figure className="shoot-detail">
                  <img src={shoot.detail} alt="" loading="lazy" />
                </figure>
                <span className="shoot-place">{shoot.place}</span>
              </Reveal>
              <Reveal className="shoot-copy">
                <span className="shoot-index">{shoot.index}</span>
                <h3>{shoot.word}</h3>
                <p className="shoot-name">{shoot.title}</p>
                <p className="shoot-description">{shoot.description}</p>
                <ul>
                  {shoot.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => openBooking(shoot.id)}>
                  Обсудить съёмку <ArrowRight />
                </button>
              </Reveal>
            </article>
          ))}
        </section>

        <section className="frames" aria-label="Избранные кадры">
          <Reveal className="frames-grid">
            <img src="/images/portfolio/wedding-normandy.jpg" alt="" loading="lazy" />
            <img src="/images/portfolio/commercial-france.jpg" alt="" loading="lazy" />
            <img src="/images/portfolio/portrait-paris.jpg" alt="" loading="lazy" />
            <img src="/images/portfolio/hero-paris.jpg" alt="" loading="lazy" />
          </Reveal>
        </section>

        <section className="process" id="process">
          <Reveal>
            <p className="label">[ Как это работает ]</p>
            <h2>Три шага до съёмки</h2>
            <ol>
              {steps.map(([n, title, text]) => (
                <li key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section className="closing">
          <Reveal>
            <h2>
              История уже происходит.
              <br />
              <em>Давайте её сохраним</em>
            </h2>
            <button type="button" onClick={() => openBooking()}>
              Забронировать съёмку <ArrowUpRight />
            </button>
          </Reveal>
        </section>
      </main>

      <footer>
        <strong>ALINA MOREAU</strong>
        <div>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="mailto:hello@alinamoreau.fr">hello@alinamoreau.fr</a>
        </div>
        <small>© 2026 · Paris / Normandie</small>
      </footer>

      {bookingOpen && (
        <BookingModal onClose={() => setBookingOpen(false)} initialShoot={bookingShoot} />
      )}
    </div>
  )
}

function BookingModal({
  onClose,
  initialShoot,
}: {
  onClose: () => void
  initialShoot: ShootType
}) {
  const [shootType, setShootType] = useState<ShootType>(initialShoot)
  const [method, setMethod] = useState<ContactMethod>('instagram')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setStatus('sending')

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          shootType,
          contactMethod: method,
          contact: form.get('contact'),
          date: form.get('date'),
        }),
      })
      if (!response.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const selectedMethod = methods.find((item) => item.id === method) ?? methods[0]

  return (
    <div className="booking-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">
          <X />
        </button>
        {status === 'success' ? (
          <div className="booking-success">
            <span><Check /></span>
            <p>Заявка отправлена</p>
            <h2>Я свяжусь с вами,<br />чтобы обсудить детали</h2>
            <button type="button" onClick={onClose}>Вернуться к историям</button>
          </div>
        ) : (
          <>
            <div className="modal-heading">
              <p>[ Бронирование ]</p>
              <h2 id="booking-title">Расскажите<br />о вашей съёмке</h2>
              <span>Обычно отвечаю в течение одного рабочего дня</span>
            </div>
            <form onSubmit={submit}>
              <label>
                <span>Как вас зовут</span>
                <input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Ваше имя" />
              </label>

              <fieldset>
                <legend>Тип съёмки</legend>
                <div className="shoot-options">
                  {shoots.map((shoot) => (
                    <button
                      type="button"
                      key={shoot.id}
                      className={shootType === shoot.id ? 'selected' : ''}
                      onClick={() => setShootType(shoot.id)}
                    >
                      {shoot.title.replace(' съёмка', '')}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Где вам удобно получить ответ</legend>
                <div className="method-options">
                  {methods.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={method === item.id ? 'selected' : ''}
                      onClick={() => setMethod(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label>
                <span>{selectedMethod.label}</span>
                <input
                  key={method}
                  name="contact"
                  required
                  maxLength={160}
                  type={method === 'email' ? 'email' : 'text'}
                  inputMode={method === 'whatsapp' ? 'tel' : undefined}
                  placeholder={selectedMethod.placeholder}
                />
              </label>

              <label>
                <span>Желаемая дата</span>
                <input name="date" required type="date" min={new Date().toISOString().split('T')[0]} />
              </label>

              {status === 'error' && (
                <p className="form-error" role="alert">
                  Не удалось отправить заявку. Напишите напрямую на hello@alinamoreau.fr
                </p>
              )}

              <button className="submit-booking" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Отправляю…' : 'Отправить заявку'} <ArrowRight />
              </button>
              <small>Нажимая кнопку, вы соглашаетесь на обработку данных для ответа на заявку</small>
            </form>
          </>
        )}
      </section>
    </div>
  )
}

export default App
