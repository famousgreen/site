import { useEffect, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import './App.css'

type ShootType = 'portrait' | 'wedding' | 'commercial'
type ContactMethod = 'instagram' | 'email' | 'telegram' | 'whatsapp'

const shoots: Array<{
  id: ShootType
  index: string
  title: string
  subtitle: string
  place: string
  image: string
  description: string
}> = [
  {
    id: 'portrait',
    index: '01',
    title: 'Обычная съёмка',
    subtitle: 'Прогулка, история, портрет',
    place: '48.8566° N · Paris',
    image: '/images/portfolio/portrait-paris.jpg',
    description:
      'Для тех, кто хочет увидеть себя без придуманной роли. Два часа, выбранный вместе маршрут и кадры, в которых остаётся ваш ритм.',
  },
  {
    id: 'wedding',
    index: '02',
    title: 'Свадебная',
    subtitle: 'От тихого утра до последнего танца',
    place: '49.7072° N · Normandie',
    image: '/images/portfolio/wedding-normandy.jpg',
    description:
      'Не режиссирую чувства — замечаю их. Собираю день в живую последовательность: ветер, объятия, детали и людей рядом.',
  },
  {
    id: 'commercial',
    index: '03',
    title: 'Коммерческая',
    subtitle: 'Кампейны, предметы, люди',
    place: '48.8589° N · Île-de-France',
    image: '/images/portfolio/commercial-france.jpg',
    description:
      'Перевожу характер бренда в визуальный язык. От идеи и мудборда до готовой серии для сайта, кампейна и социальных сетей.',
  },
]

const methods: Array<{ id: ContactMethod; label: string; placeholder: string }> = [
  { id: 'instagram', label: 'Instagram', placeholder: '@username' },
  { id: 'email', label: 'Email', placeholder: 'name@example.com' },
  { id: 'telegram', label: 'Telegram', placeholder: '@username или телефон' },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: '+33 6 00 00 00 00' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeShoot, setActiveShoot] = useState<ShootType>('portrait')
  const [bookingOpen, setBookingOpen] = useState(false)

  const openBooking = (shoot: ShootType = activeShoot) => {
    setActiveShoot(shoot)
    setBookingOpen(true)
  }

  return (
    <div className="portfolio">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Наверх">
          <span>Alina</span>
          <span>Moreau</span>
        </a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <a href="#stories">Истории</a>
          <a href="#approach">Подход</a>
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
          <a href="#stories" onClick={() => setMenuOpen(false)}>Истории</a>
          <a href="#approach" onClick={() => setMenuOpen(false)}>Подход</a>
          <button type="button" onClick={() => { setMenuOpen(false); openBooking() }}>
            Забронировать <ArrowRight />
          </button>
        </nav>
      )}

      <main>
        <section className="hero-section" id="top">
          <img
            className="hero-image"
            src="/images/portfolio/hero-paris.jpg"
            alt="Прогулочная фотосессия в утреннем Париже"
          />
          <div className="hero-shade" />
          <div className="hero-meta">
            <span>Paris · Normandie</span>
            <span>Photographe documentaire</span>
          </div>
          <div className="hero-copy">
            <p className="coordinate">48.8566° N · 2.3522° E</p>
            <h1>Сохраняю<br />ваш способ <span>быть</span></h1>
            <div className="hero-bottom">
              <p>Живые фотографии о людях, близости и брендах — во Франции и там, где начинается ваша история</p>
              <button type="button" className="round-action" onClick={() => openBooking()} aria-label="Открыть бронирование">
                <ArrowDownRight />
              </button>
            </div>
          </div>
          <a className="scroll-note" href="#approach">Смотреть дальше <ArrowDownRight /></a>
        </section>

        <section className="intro-section" id="approach">
          <p className="section-number">[ 00 — Подход ]</p>
          <div className="intro-copy">
            <p>Я не прошу вас «вести себя естественно»</p>
            <h2>Создаю пространство,<br />в котором можно <span>не играть</span></h2>
          </div>
          <div className="intro-notes">
            <p>Подсказываю, когда это нужно, и отхожу в сторону, когда момент говорит сам за себя.</p>
            <p>Снимаю на цифру и плёнку. Готовая серия выглядит как цельная история, а не набор удачных кадров.</p>
          </div>
        </section>

        <section className="stories-section" id="stories">
          <div className="stories-heading">
            <p className="section-number">[ 01 — Форматы ]</p>
            <h2>Выберите<br />свою историю</h2>
            <span>Три направления · один внимательный взгляд</span>
          </div>

          <div className="story-tabs" role="tablist" aria-label="Типы съёмок">
            {shoots.map((shoot) => (
              <button
                key={shoot.id}
                type="button"
                role="tab"
                aria-selected={activeShoot === shoot.id}
                className={activeShoot === shoot.id ? 'active' : ''}
                onClick={() => setActiveShoot(shoot.id)}
              >
                <span>{shoot.index}</span>
                {shoot.title}
              </button>
            ))}
          </div>

          {shoots.map((shoot) => (
            <article
              className={`story-panel ${activeShoot === shoot.id ? 'active' : ''}`}
              key={shoot.id}
              hidden={activeShoot !== shoot.id}
            >
              <div className="story-visual">
                <img src={shoot.image} alt={shoot.subtitle} />
                <span className="image-coordinate">{shoot.place}</span>
              </div>
              <div className="story-copy">
                <div>
                  <span>{shoot.subtitle}</span>
                  <h3>{shoot.title}</h3>
                </div>
                <p>{shoot.description}</p>
                <button type="button" onClick={() => openBooking(shoot.id)}>
                  Обсудить съёмку <ArrowRight />
                </button>
              </div>
            </article>
          ))}

          <div className="story-controls" aria-hidden="true">
            <button
              type="button"
              onClick={() => {
                const index = shoots.findIndex((shoot) => shoot.id === activeShoot)
                setActiveShoot(shoots[(index + shoots.length - 1) % shoots.length].id)
              }}
              aria-label="Предыдущая история"
            >
              <ChevronLeft />
            </button>
            <span>{shoots.findIndex((shoot) => shoot.id === activeShoot) + 1} / {shoots.length}</span>
            <button
              type="button"
              onClick={() => {
                const index = shoots.findIndex((shoot) => shoot.id === activeShoot)
                setActiveShoot(shoots[(index + 1) % shoots.length].id)
              }}
              aria-label="Следующая история"
            >
              <ChevronRight />
            </button>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-mark">AM</div>
          <p>Paris · Normandie · Europe</p>
          <h2>История уже происходит.<br /><span>Давайте её сохраним</span></h2>
          <button type="button" onClick={() => openBooking()}>
            Выбрать дату <CalendarDays />
          </button>
        </section>
      </main>

      <footer>
        <div className="wordmark"><span>Alina</span><span>Moreau</span></div>
        <div>
          <a href="https://instagram.com" target="_blank" rel="noreferrer"><ArrowRight /> Instagram</a>
          <a href="mailto:hello@alinamoreau.fr">hello@alinamoreau.fr</a>
        </div>
        <small>© 2026 · Paris / Normandie</small>
      </footer>

      {bookingOpen && (
        <BookingModal
          onClose={() => setBookingOpen(false)}
          initialShoot={activeShoot}
        />
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
