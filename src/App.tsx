import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, Check, Menu, X } from 'lucide-react'
import { LANGS, dictionary, detectLanguage, saveLanguage } from './i18n'
import type { Dict, Lang, ShootType } from './i18n'
import './App.css'

type ContactMethod = 'instagram' | 'email' | 'telegram' | 'whatsapp'

const shootOrder: Array<{ id: ShootType; index: string; place: string }> = [
  { id: 'portrait', index: '01', place: '48.8566° N' },
  { id: 'wedding', index: '02', place: '49.7072° N' },
  { id: 'commercial', index: '03', place: '48.8589° N' },
]

const photos = [
  { src: '/images/portfolio/portrait-paris.jpg', caption: '48.8566° N · 2.3522° E', position: '50% 40%' },
  { src: '/images/portfolio/hero-paris.jpg', caption: 'Paris', position: '64% 50%' },
  { src: '/images/portfolio/commercial-france.jpg', caption: 'Normandie', position: '50% 50%' },
  { src: '/images/portfolio/wedding-normandy.jpg', caption: '49.7072° N · 0.2° E', position: '40% 50%' },
]

const methods: Array<{ id: ContactMethod; label: string; placeholder: string }> = [
  { id: 'instagram', label: 'Instagram', placeholder: '@username' },
  { id: 'email', label: 'Email', placeholder: 'name@example.com' },
  { id: 'telegram', label: 'Telegram', placeholder: '@username' },
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

function LanguageSwitch({ lang, label, onChange }: { lang: Lang; label: string; onChange: (lang: Lang) => void }) {
  return (
    <div className="lang-switch" role="group" aria-label={label}>
      {LANGS.map((item) => (
        <button
          key={item.id}
          type="button"
          lang={item.id}
          aria-label={item.name}
          aria-pressed={lang === item.id}
          className={lang === item.id ? 'active' : ''}
          onClick={() => onChange(item.id)}
        >
          {item.short}
        </button>
      ))}
    </div>
  )
}

function App() {
  const [lang, setLang] = useState<Lang>(detectLanguage)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingShoot, setBookingShoot] = useState<ShootType>('portrait')
  const t = dictionary[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.description)
  }, [lang, t])

  const changeLanguage = (next: Lang) => {
    saveLanguage(next)
    setLang(next)
  }

  const openBooking = (shoot: ShootType = 'portrait') => {
    setBookingShoot(shoot)
    setBookingOpen(true)
  }

  return (
    <div className="portfolio">
      <a className="skip-link" href="#main">{t.skip}</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Hanna Chauvat">
          H. Chauvat
        </a>
        <div className="header-tools">
          <LanguageSwitch lang={lang} label={t.langLabel} onChange={changeLanguage} />
          <nav className="desktop-nav" aria-label="Main">
            <a href="#work">{t.nav.work}</a>
            <button type="button" onClick={() => openBooking()}>
              {t.nav.book}
            </button>
          </nav>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.menu.close : t.menu.open}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="mobile-menu" id="mobile-menu" aria-label="Main">
          <a href="#work" onClick={() => setMenuOpen(false)}>{t.nav.work}</a>
          <button type="button" onClick={() => { setMenuOpen(false); openBooking() }}>
            {t.nav.book} <ArrowRight aria-hidden="true" />
          </button>
        </nav>
      )}

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-meta">
            <span>{t.hero.role}</span>
            <span>{t.hero.place}</span>
            <span>{t.hero.year}</span>
          </div>
          <h1 aria-label="Hanna Chauvat">
            <span className="line" aria-hidden="true"><span>Hanna</span></span>
            <span className="line" aria-hidden="true"><span>Chauvat</span></span>
          </h1>
          <div className="hero-intro">
            <h2>{t.hero.manifest}</h2>
            <button type="button" onClick={() => openBooking()}>
              {t.hero.cta} <ArrowUpRight aria-hidden="true" />
            </button>
          </div>
          <div className="photo-grid">
            {photos.map((photo, i) => (
              <figure className={`photo photo-${i + 1}`} key={photo.src}>
                <img src={photo.src} alt={t.hero.alts[i]} style={{ objectPosition: photo.position }} />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="work" id="work" aria-labelledby="work-title">
          <h2 className="label" id="work-title">{t.workLabel}</h2>
          <ul>
            {shootOrder.map((shoot) => (
              <li key={shoot.id}>
                <Reveal>
                  <button type="button" className="shoot-row" onClick={() => openBooking(shoot.id)}>
                    <span className="shoot-index">{shoot.index}</span>
                    <span className="shoot-title">{t.shoots[shoot.id].name}</span>
                    <span className="shoot-desc">{t.shoots[shoot.id].desc}</span>
                    <span className="shoot-place">{shoot.place}</span>
                    <ArrowUpRight className="shoot-arrow" aria-hidden="true" />
                  </button>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section className="closing">
          <Reveal>
            <h2>{t.closing.title}</h2>
            <button type="button" onClick={() => openBooking()}>
              {t.closing.cta} <ArrowUpRight aria-hidden="true" />
            </button>
          </Reveal>
        </section>
      </main>

      <footer>
        <strong>HANNA CHAUVAT</strong>
        <div>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="mailto:hello@hannachauvat.fr">hello@hannachauvat.fr</a>
        </div>
        <small>{t.footer.rights}</small>
      </footer>

      {bookingOpen && (
        <BookingModal t={t} lang={lang} onClose={() => setBookingOpen(false)} initialShoot={bookingShoot} />
      )}
    </div>
  )
}

function BookingModal({
  t,
  lang,
  onClose,
  initialShoot,
}: {
  t: Dict
  lang: Lang
  onClose: () => void
  initialShoot: ShootType
}) {
  const [shootType, setShootType] = useState<ShootType>(initialShoot)
  const [method, setMethod] = useState<ContactMethod>('instagram')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')
    dialogRef.current?.querySelector<HTMLElement>('input[name="name"]')?.focus()
    return () => {
      document.body.classList.remove('modal-open')
      previous?.focus()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])'),
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
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
  const m = t.modal

  return (
    <div
      className="booking-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        lang={lang}
        onKeyDown={trapFocus}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label={m.close}>
          <X aria-hidden="true" />
        </button>
        {status === 'success' ? (
          <div className="booking-success" role="status">
            <span><Check aria-hidden="true" /></span>
            <p>{m.successEyebrow}</p>
            <h2 id="booking-title">{m.successTitle}</h2>
            <button type="button" onClick={onClose}>{m.back}</button>
          </div>
        ) : (
          <>
            <div className="modal-heading">
              <p>{m.eyebrow}</p>
              <h2 id="booking-title">{m.title}</h2>
              <span>{m.subtitle}</span>
            </div>
            <form onSubmit={submit}>
              <label>
                <span>{m.name}</span>
                <input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder={m.namePh} />
              </label>

              <fieldset>
                <legend>{m.type}</legend>
                <div className="shoot-options">
                  {shootOrder.map((shoot) => (
                    <button
                      type="button"
                      key={shoot.id}
                      aria-pressed={shootType === shoot.id}
                      className={shootType === shoot.id ? 'selected' : ''}
                      onClick={() => setShootType(shoot.id)}
                    >
                      {t.shoots[shoot.id].short}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>{m.reply}</legend>
                <div className="method-options">
                  {methods.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      aria-pressed={method === item.id}
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
                <span>{m.date}</span>
                <input name="date" required type="date" min={new Date().toISOString().split('T')[0]} />
              </label>

              {status === 'error' && (
                <p className="form-error" role="alert">
                  {m.error}
                </p>
              )}

              <button className="submit-booking" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? m.sending : m.send} <ArrowRight aria-hidden="true" />
              </button>
              <small>{m.consent}</small>
            </form>
          </>
        )}
      </section>
    </div>
  )
}

export default App
