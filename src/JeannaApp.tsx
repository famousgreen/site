import { useRef, useState } from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  CreditCard,
  Heart,
  Home,
  Image as ImagesIcon,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  Package,
  Plus,
  Repeat2,
  Scissors,
  Settings2,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import './jeanna.css'

type Mode = 'client' | 'admin'
type ClientTab = 'home' | 'gallery' | 'booking' | 'profile'
type AdminTab = 'overview' | 'calendar' | 'clients' | 'services' | 'stock' | 'settings'

const works = [
  { id: 1, src: '/images/nails-1.jpg', title: 'Молочная база', tag: 'minimal', likes: 128 },
  { id: 2, src: '/images/nails-2.jpg', title: 'Тёмный френч', tag: 'french', likes: 94 },
  { id: 3, src: '/images/nails-3.jpg', title: 'Chrome detail', tag: 'chrome', likes: 76 },
  { id: 4, src: '/images/nails-4.jpg', title: 'Soft square', tag: 'nude', likes: 112 },
]

const services = [
  { id: 'manicure', name: 'Маникюр + гель', time: '2 ч', price: 4200, accent: '01' },
  { id: 'lashes', name: 'Ламинирование ресниц', time: '1 ч 30 мин', price: 3500, accent: '02' },
  { id: 'express', name: 'Экспресс-маникюр', time: '1 ч', price: 2500, accent: '03' },
]

const appointments = [
  { id: 1, time: '10:00', client: 'Алина С.', service: 'Маникюр + гель', duration: '2 ч', color: 'lime' },
  { id: 2, time: '12:30', client: 'Мария К.', service: 'Ламинирование ресниц', duration: '1,5 ч', color: 'pink' },
  { id: 3, time: '15:00', client: 'Саша В.', service: 'Маникюр + дизайн', duration: '2,5 ч', color: 'blue' },
]

const stock = [
  { name: 'База Luxio', value: 68, use: '8% / запись' },
  { name: 'Топ без липкости', value: 34, use: '5% / запись' },
  { name: 'Патчи для ресниц', value: 22, use: '1 шт / запись' },
]

export default function JeannaApp() {
  const [mode, setMode] = useState<Mode>('client')
  const [clientTab, setClientTab] = useState<ClientTab>('home')
  const [adminTab, setAdminTab] = useState<AdminTab>('overview')
  const [onboardingOpen, setOnboardingOpen] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [liked, setLiked] = useState<number[]>([2])
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(0)
  const [selectedService, setSelectedService] = useState(services[0].id)
  const [selectedTime, setSelectedTime] = useState('12:30')
  const [extras, setExtras] = useState<string[]>(['Снятие'])
  const [drink, setDrink] = useState('Капучино')
  const [payment, setPayment] = useState('СБП')
  const [handPhoto, setHandPhoto] = useState<string | null>(null)
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null)
  const [emailReminder, setEmailReminder] = useState(true)
  const [blockedSlot, setBlockedSlot] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const handInput = useRef<HTMLInputElement>(null)
  const refInput = useRef<HTMLInputElement>(null)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  const toggleLike = (id: number) => {
    setLiked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const toggleExtra = (extra: string) => {
    setExtras((current) =>
      current.includes(extra) ? current.filter((item) => item !== extra) : [...current, extra],
    )
  }

  const loadPhoto = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) => {
    const file = event.target.files?.[0]
    if (file) setter(URL.createObjectURL(file))
  }

  const startBooking = (serviceId = services[0].id) => {
    setSelectedService(serviceId)
    setBookingStep(0)
    setBookingOpen(true)
  }

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    setMenuOpen(false)
  }

  return (
    <div className={`app-shell mode-${mode}`}>
      <header className="topbar">
        <button className="brand" onClick={() => switchMode('client')} aria-label="Jeanna K, на главную">
          <span className="brand-mark">JK</span>
          <span>JEANNA K</span>
        </button>
        <div className="mode-switch" aria-label="Переключение режима">
          <button className={mode === 'client' ? 'active' : ''} onClick={() => switchMode('client')}>Для клиента</button>
          <button className={mode === 'admin' ? 'active' : ''} onClick={() => switchMode('admin')}>Кабинет мастера</button>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Уведомления"><Bell size={18} /><span className="notification-dot" /></button>
          <button className="profile-chip" onClick={() => mode === 'client' ? setClientTab('profile') : setAdminTab('settings')}>
            <img src="/images/jeanna.jpg" alt="" /><span>{mode === 'client' ? 'Аня' : 'Jeanna'}</span>
          </button>
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Открыть меню">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-mode-menu">
          <button onClick={() => switchMode('client')}>Клиентское приложение</button>
          <button onClick={() => switchMode('admin')}>Кабинет мастера</button>
        </div>
      )}

      {mode === 'client' ? (
        <ClientExperience
          tab={clientTab}
          setTab={setClientTab}
          liked={liked}
          toggleLike={toggleLike}
          startBooking={startBooking}
          handPhoto={handPhoto}
          referencePhoto={referencePhoto}
          handInput={handInput}
          refInput={refInput}
          loadPhoto={loadPhoto}
          setHandPhoto={setHandPhoto}
          setReferencePhoto={setReferencePhoto}
          drink={drink}
          setDrink={setDrink}
          payment={payment}
          setPayment={setPayment}
          notify={notify}
        />
      ) : (
        <AdminExperience
          tab={adminTab}
          setTab={setAdminTab}
          emailReminder={emailReminder}
          setEmailReminder={setEmailReminder}
          blockedSlot={blockedSlot}
          setBlockedSlot={setBlockedSlot}
          notify={notify}
        />
      )}

      <Dialog open={onboardingOpen} onOpenChange={setOnboardingOpen}>
        <DialogContent className="onboarding-dialog" showCloseButton={false}>
          <div className="dialog-topline"><span>Быстрый старт</span><span>{onboardingStep + 1} / 2</span></div>
          <div className="progress-line"><span style={{ width: `${(onboardingStep + 1) * 50}%` }} /></div>
          {onboardingStep === 0 ? (
            <>
              <DialogHeader>
                <div className="eyebrow"><Sparkles size={14} /> только нужное</div>
                <DialogTitle>Давайте знакомиться</DialogTitle>
                <DialogDescription>Оставьте контакт — подтверждение записи придёт сюда.</DialogDescription>
              </DialogHeader>
              <div className="form-stack">
                <label>Как вас зовут<Input defaultValue="Анна" aria-label="Имя" /></label>
                <label>Телефон<Input defaultValue="+7 999 240-18-04" aria-label="Телефон" /></label>
              </div>
              <Button className="primary-button" onClick={() => setOnboardingStep(1)}>Продолжить <ArrowRight /></Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="eyebrow"><Coffee size={14} /> заботимся заранее</div>
                <DialogTitle>Как вам будет комфортно?</DialogTitle>
                <DialogDescription>Сохраним выбор для следующих визитов. Всё можно изменить позже.</DialogDescription>
              </DialogHeader>
              <ChoiceGroup label="Напиток" values={['Капучино', 'Чай', 'Вода']} selected={drink} onSelect={setDrink} />
              <ChoiceGroup label="Оплата" values={['СБП', 'Карта', 'Наличные']} selected={payment} onSelect={setPayment} />
              <div className="dialog-actions">
                <Button variant="ghost" onClick={() => setOnboardingStep(0)}><ChevronLeft /> Назад</Button>
                <Button className="primary-button" onClick={() => { setOnboardingOpen(false); notify('Профиль готов — можно записываться') }}>Готово <Check /></Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BookingDialog
        open={bookingOpen}
        setOpen={setBookingOpen}
        step={bookingStep}
        setStep={setBookingStep}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        extras={extras}
        toggleExtra={toggleExtra}
        drink={drink}
        payment={payment}
        finish={() => {
          setBookingOpen(false)
          setClientTab('home')
          notify('Запись подтверждена на 28 сентября, 12:30')
        }}
      />
      {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
    </div>
  )
}

function ChoiceGroup({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string
  values: string[]
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="choice-group">
      <span>{label}</span>
      <div>
        {values.map((value) => (
          <button key={value} className={selected === value ? 'selected' : ''} onClick={() => onSelect(value)}>
            {value}{selected === value && <Check size={14} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function ClientExperience({
  tab,
  setTab,
  liked,
  toggleLike,
  startBooking,
  handPhoto,
  referencePhoto,
  handInput,
  refInput,
  loadPhoto,
  setHandPhoto,
  setReferencePhoto,
  drink,
  setDrink,
  payment,
  setPayment,
  notify,
}: {
  tab: ClientTab
  setTab: (tab: ClientTab) => void
  liked: number[]
  toggleLike: (id: number) => void
  startBooking: (service?: string) => void
  handPhoto: string | null
  referencePhoto: string | null
  handInput: React.RefObject<HTMLInputElement | null>
  refInput: React.RefObject<HTMLInputElement | null>
  loadPhoto: (event: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => void
  setHandPhoto: (value: string) => void
  setReferencePhoto: (value: string) => void
  drink: string
  setDrink: (value: string) => void
  payment: string
  setPayment: (value: string) => void
  notify: (message: string) => void
}) {
  return (
    <div className="client-layout">
      <main className="client-main">
        {tab === 'home' && (
          <>
            <section className="client-hero">
              <div>
                <div className="eyebrow"><span className="status-dot" /> запись открыта на сентябрь</div>
                <h1>Привет, Аня.<br /><em>Пора к себе.</em></h1>
                <p>Новый маникюр, любимый кофе и два часа без спешки.</p>
                <div className="hero-actions">
                  <Button className="primary-button" onClick={() => startBooking()}>Выбрать время <ArrowRight /></Button>
                  <button className="text-button" onClick={() => setTab('gallery')}>Сначала вдохновиться</button>
                </div>
              </div>
              <div className="hero-art">
                <img src="/images/nails-1.jpg" alt="Молочный маникюр Jeanna K" />
                <div className="floating-note"><Star size={15} fill="currentColor" /><div><strong>4.9</strong><span>87 отзывов</span></div></div>
                <div className="artist-badge"><img src="/images/jeanna.jpg" alt="" /><div><strong>Jeanna K</strong><span>nail & lash artist</span></div></div>
              </div>
            </section>

            <section className="upcoming-card">
              <div className="date-tile"><strong>24</strong><span>сент</span></div>
              <div className="upcoming-info">
                <span className="section-label">Ближайшая запись</span>
                <h3>Маникюр + гель</h3>
                <p><Clock3 size={14} /> 14:30–16:30 · Большая Никитская, 22</p>
              </div>
              <Button variant="outline" className="repeat-button" onClick={() => startBooking('manicure')}><Repeat2 /> Повторить</Button>
            </section>

            <section className="section-block">
              <div className="section-heading">
                <div><span className="section-label">Сохранённые референсы</span><h2>Вам может понравиться</h2></div>
                <button onClick={() => setTab('gallery')}>Вся галерея <ArrowRight /></button>
              </div>
              <GalleryGrid liked={liked} toggleLike={toggleLike} compact />
            </section>

            <section className="care-banner">
              <div><span className="section-label">Всё учтено</span><h2>Ваш визит — уже без вопросов</h2><p>{drink}, оплата через {payment}, овальная форма. Изменить предпочтения можно в профиле.</p></div>
              <button onClick={() => setTab('profile')}><Settings2 /> Настроить</button>
            </section>
          </>
        )}

        {tab === 'gallery' && (
          <section className="page-section">
            <div className="page-intro">
              <div className="eyebrow"><Sparkles size={14} /> галерея Jeanna</div>
              <h1>Сохраняйте то,<br /><em>что хочется повторить.</em></h1>
              <p>Лайкните работу — Jeanna увидит референсы до встречи.</p>
            </div>
            <div className="filter-row">{['Все', 'Нюд', 'Френч', 'Дизайн', 'Ресницы'].map((filter, index) => <button key={filter} className={index === 0 ? 'active' : ''}>{filter}</button>)}</div>
            <GalleryGrid liked={liked} toggleLike={toggleLike} />
            <Button className="floating-book" onClick={() => startBooking()}>Записаться по референсу <ArrowRight /></Button>
          </section>
        )}

        {tab === 'booking' && (
          <section className="page-section booking-page">
            <div className="page-intro">
              <div className="eyebrow"><CalendarDays size={14} /> запись онлайн</div>
              <h1>Выберите свой<br /><em>идеальный визит.</em></h1>
            </div>
            <div className="service-grid">
              {services.map((service) => (
                <button key={service.id} className="service-card" onClick={() => startBooking(service.id)}>
                  <span>{service.accent}</span><div><h3>{service.name}</h3><p>{service.time} · от {service.price.toLocaleString('ru-RU')} ₽</p></div><ArrowRight />
                </button>
              ))}
            </div>
            <div className="upload-panel">
              <div><span className="section-label">Подготовиться к записи</span><h2>Покажите руки и идею</h2><p>Фото поможет Jeanna заранее оценить время и материалы.</p></div>
              <div className="upload-grid">
                <UploadCard title="Фото рук сейчас" subtitle="Снять или загрузить" preview={handPhoto} onClick={() => handInput.current?.click()} icon={<Camera />} />
                <UploadCard title="Референс" subtitle="Желаемый результат" preview={referencePhoto} onClick={() => refInput.current?.click()} icon={<ImagesIcon />} />
              </div>
              <input ref={handInput} hidden type="file" accept="image/*" onChange={(event) => loadPhoto(event, setHandPhoto)} />
              <input ref={refInput} hidden type="file" accept="image/*" onChange={(event) => loadPhoto(event, setReferencePhoto)} />
            </div>
          </section>
        )}

        {tab === 'profile' && (
          <section className="page-section profile-page">
            <div className="profile-heading">
              <div className="avatar-large">АК</div>
              <div><span className="section-label">Клиент с марта 2025</span><h1>Анна Крылова</h1><p>+7 999 240-18-04</p></div>
            </div>
            <div className="profile-grid">
              <div className="profile-card wide">
                <div className="card-title"><div><Coffee /><span><strong>Комфорт на визите</strong><small>Сохраняется для новых записей</small></span></div></div>
                <ChoiceGroup label="Любимый напиток" values={['Капучино', 'Чай', 'Вода']} selected={drink} onSelect={setDrink} />
                <ChoiceGroup label="Способ оплаты" values={['СБП', 'Карта', 'Наличные']} selected={payment} onSelect={setPayment} />
                <Button className="primary-button" onClick={() => notify('Предпочтения сохранены')}>Сохранить</Button>
              </div>
              <div className="profile-card">
                <div className="card-title"><div><Repeat2 /><span><strong>История</strong><small>8 визитов</small></span></div><ChevronRight /></div>
                <div className="mini-stat"><strong>32 400 ₽</strong><span>всего за год</span></div>
              </div>
              <div className="profile-card dark-card">
                <div className="card-title"><div><Heart /><span><strong>Референсы</strong><small>{liked.length} сохранено</small></span></div><ChevronRight /></div>
                <div className="reference-stack">{works.slice(0, 3).map((work) => <img key={work.id} src={work.src} alt="" />)}</div>
              </div>
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Клиентская навигация">
        <ClientNavButton active={tab === 'home'} icon={<Home />} label="Главная" onClick={() => setTab('home')} />
        <ClientNavButton active={tab === 'gallery'} icon={<Heart />} label="Референсы" onClick={() => setTab('gallery')} />
        <button className="nav-book" onClick={() => startBooking()} aria-label="Записаться"><Plus /></button>
        <ClientNavButton active={tab === 'booking'} icon={<CalendarDays />} label="Запись" onClick={() => setTab('booking')} />
        <ClientNavButton active={tab === 'profile'} icon={<UserRound />} label="Профиль" onClick={() => setTab('profile')} />
      </nav>
    </div>
  )
}

function ClientNavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? 'active' : ''} onClick={onClick}>{icon}<span>{label}</span></button>
}

function GalleryGrid({ liked, toggleLike, compact = false }: { liked: number[]; toggleLike: (id: number) => void; compact?: boolean }) {
  return (
    <div className={`gallery-grid ${compact ? 'compact' : ''}`}>
      {works.map((work) => (
        <article className="work-card" key={work.id}>
          <img src={work.src} alt={work.title} />
          <button className={liked.includes(work.id) ? 'liked' : ''} onClick={() => toggleLike(work.id)} aria-label="Сохранить референс"><Heart fill={liked.includes(work.id) ? 'currentColor' : 'none'} /></button>
          <div><span>#{work.tag}</span><strong>{work.title}</strong><small>{work.likes + (liked.includes(work.id) ? 1 : 0)} ♥</small></div>
        </article>
      ))}
    </div>
  )
}

function UploadCard({ title, subtitle, preview, onClick, icon }: { title: string; subtitle: string; preview: string | null; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button className={`upload-card ${preview ? 'has-preview' : ''}`} onClick={onClick}>
      {preview ? <img src={preview} alt="" /> : <span>{icon}</span>}
      <div><strong>{preview ? 'Фото добавлено' : title}</strong><small>{preview ? 'Нажмите, чтобы заменить' : subtitle}</small></div><Plus />
    </button>
  )
}

function AdminExperience({
  tab,
  setTab,
  emailReminder,
  setEmailReminder,
  blockedSlot,
  setBlockedSlot,
  notify,
}: {
  tab: AdminTab
  setTab: (tab: AdminTab) => void
  emailReminder: boolean
  setEmailReminder: (value: boolean) => void
  blockedSlot: boolean
  setBlockedSlot: (value: boolean) => void
  notify: (message: string) => void
}) {
  const [selectedAppointment, setSelectedAppointment] = useState(appointments[0])

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <span className="sidebar-label">Рабочее пространство</span>
          <AdminNav active={tab === 'overview'} icon={<LayoutDashboard />} label="Обзор" onClick={() => setTab('overview')} />
          <AdminNav active={tab === 'calendar'} icon={<CalendarDays />} label="Календарь" badge="3" onClick={() => setTab('calendar')} />
          <AdminNav active={tab === 'clients'} icon={<UsersRound />} label="Клиенты" onClick={() => setTab('clients')} />
          <AdminNav active={tab === 'services'} icon={<Scissors />} label="Услуги" onClick={() => setTab('services')} />
          <AdminNav active={tab === 'stock'} icon={<Package />} label="Сток" badge="2" onClick={() => setTab('stock')} />
        </div>
        <div>
          <AdminNav active={tab === 'settings'} icon={<Settings2 />} label="Настройки" onClick={() => setTab('settings')} />
          <div className="admin-profile"><img src="/images/jeanna.jpg" alt="" /><div><strong>Jeanna K</strong><span>Администратор</span></div></div>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'overview' && (
          <>
            <div className="admin-heading"><div><span>Среда, 23 сентября</span><h1>Доброе утро, Jeanna</h1></div><Button className="primary-button" onClick={() => setTab('calendar')}><CalendarDays /> Открыть календарь</Button></div>
            <div className="stats-grid">
              <StatCard icon={<CalendarDays />} label="Записей сегодня" value="3" note="+1 к прошлой среде" />
              <StatCard icon={<CreditCard />} label="Выручка недели" value="48 600 ₽" note="+12% к прошлой" />
              <StatCard icon={<UsersRound />} label="Возвращаются" value="78%" note="24 активных клиента" />
              <StatCard icon={<Clock3 />} label="Загрузка" value="84%" note="5,5 ч свободно" />
            </div>
            <div className="admin-dashboard-grid">
              <section className="admin-panel schedule-panel">
                <div className="panel-heading"><div><span className="section-label">Сегодня</span><h2>Расписание</h2></div><button onClick={() => setTab('calendar')}>Весь день <ArrowRight /></button></div>
                <div className="appointment-list">
                  {appointments.map((appointment) => (
                    <button key={appointment.id} onClick={() => setSelectedAppointment(appointment)} className={selectedAppointment.id === appointment.id ? 'selected' : ''}>
                      <time>{appointment.time}</time><span className={`appointment-color ${appointment.color}`} /><div><strong>{appointment.client}</strong><small>{appointment.service} · {appointment.duration}</small></div><ChevronRight />
                    </button>
                  ))}
                </div>
              </section>
              <section className="admin-panel client-detail">
                <div className="client-detail-head"><div className="avatar-small">{selectedAppointment.client.slice(0, 2)}</div><div><span className="section-label">Карточка записи</span><h3>{selectedAppointment.client}</h3></div><button><X size={17} /></button></div>
                <div className="detail-row"><span>Услуга</span><strong>{selectedAppointment.service}</strong></div>
                <div className="detail-row"><span>Предпочтения</span><strong>Капучино · СБП</strong></div>
                <div className="detail-row"><span>Допы</span><strong>Снятие · укрепление</strong></div>
                <div className="detail-note"><ImagesIcon /><span><strong>2 референса</strong><small>Клиент добавил к записи</small></span><div className="reference-stack mini">{works.slice(0, 2).map((work) => <img src={work.src} key={work.id} alt="" />)}</div></div>
                <Textarea defaultValue="Любит короткий овал, чувствительная кутикула." aria-label="Заметка о клиенте" />
              </section>
            </div>
            <section className="admin-panel stock-overview">
              <div className="panel-heading"><div><span className="section-label">Материалы</span><h2>Что заканчивается</h2></div><button onClick={() => setTab('stock')}>Открыть сток <ArrowRight /></button></div>
              <div className="stock-mini-grid">{stock.map((item) => <StockBar key={item.name} {...item} />)}</div>
            </section>
          </>
        )}

        {tab === 'calendar' && (
          <section className="admin-page">
            <div className="admin-heading"><div><span>21–27 сентября</span><h1>Календарь</h1></div><div className="heading-actions"><Button variant="outline"><ChevronLeft /></Button><Button variant="outline">Сегодня</Button><Button variant="outline"><ChevronRight /></Button></div></div>
            <div className="calendar-toolbar">
              <div className="week-days">{['Пн 21', 'Вт 22', 'Ср 23', 'Чт 24', 'Пт 25', 'Сб 26', 'Вс 27'].map((day, index) => <button className={index === 2 ? 'active' : ''} key={day}>{day}</button>)}</div>
              <button className="block-slot-button" onClick={() => { setBlockedSlot(!blockedSlot); notify(blockedSlot ? 'Слот снова доступен' : 'Слот 17:00–18:30 заблокирован') }}><LockKeyhole />{blockedSlot ? 'Разблокировать 17:00' : 'Заблокировать слот'}</button>
            </div>
            <div className="day-calendar">
              <div className="time-axis">{['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => <span key={time}>{time}</span>)}</div>
              <div className="calendar-track">
                {appointments.map((appointment, index) => <button key={appointment.id} className={`calendar-event ${appointment.color}`} style={{ top: `${42 + index * 150}px`, height: index === 1 ? 104 : 130 }}><strong>{appointment.time} · {appointment.client}</strong><span>{appointment.service}</span><small>{appointment.duration}</small></button>)}
                {blockedSlot && <div className="blocked-event"><LockKeyhole />17:00–18:30 · Личное время</div>}
              </div>
              <aside className="hours-card">
                <span className="section-label">Рабочие часы</span><h3>Сегодня</h3>
                <label>Начало<Input type="time" defaultValue="09:00" /></label>
                <label>Конец<Input type="time" defaultValue="19:00" /></label>
                <label className="switch-row"><span><strong>Перерыв</strong><small>13:30–14:00</small></span><Switch defaultChecked /></label>
                <Button className="primary-button" onClick={() => notify('Рабочие часы сохранены')}>Сохранить</Button>
              </aside>
            </div>
          </section>
        )}

        {tab === 'clients' && (
          <section className="admin-page">
            <div className="admin-heading"><div><span>24 активных клиента</span><h1>Клиенты</h1></div><Input className="search-input" placeholder="Поиск по имени или телефону" /></div>
            <div className="client-table">
              <div className="table-head"><span>Клиент</span><span>Последний визит</span><span>Визитов</span><span>Сумма</span><span /></div>
              {['Анна Крылова', 'Алина Смирнова', 'Мария Ким', 'Саша Волкова'].map((name, index) => (
                <button key={name}><span className="client-name"><i>{name.split(' ').map((part) => part[0]).join('')}</i><b>{name}<small>+7 999 24{index}-18-0{index}</small></b></span><span>{index + 12} сентября</span><span>{8 - index}</span><span>{(32400 - index * 4200).toLocaleString('ru-RU')} ₽</span><ChevronRight /></button>
              ))}
            </div>
          </section>
        )}

        {tab === 'services' && (
          <section className="admin-page">
            <div className="admin-heading"><div><span>Услуги и длительность</span><h1>Прайс-лист</h1></div><Button className="primary-button" onClick={() => notify('Новая услуга добавлена в черновик')}><Plus /> Добавить услугу</Button></div>
            <div className="service-admin-grid">{services.map((service, index) => <article key={service.id}><img src={works[index % works.length].src} alt="" /><div><span>Активна</span><h3>{service.name}</h3><p>{service.time} · {service.price.toLocaleString('ru-RU')} ₽</p></div><button><Settings2 /></button></article>)}</div>
            <section className="admin-panel extras-panel"><div className="panel-heading"><div><span className="section-label">Допы к записи</span><h2>Дополнительные услуги</h2></div></div>{['Снятие чужого покрытия · 500 ₽ · 30 мин', 'Укрепление · 700 ₽ · 30 мин', 'Дизайн 1 ногтя · 150 ₽ · 10 мин'].map((extra) => <label key={extra}><span>{extra}</span><Switch defaultChecked /></label>)}</section>
          </section>
        )}

        {tab === 'stock' && (
          <section className="admin-page">
            <div className="admin-heading"><div><span>Учёт расхода</span><h1>Материалы</h1></div><Button className="primary-button" onClick={() => notify('Поставка добавлена')}><Plus /> Добавить поставку</Button></div>
            <div className="stock-page-grid">
              {stock.concat([{ name: 'Праймер', value: 88, use: '3% / запись' }]).map((item) => <article className="stock-card" key={item.name}><Package /><div><span className={item.value < 35 ? 'low' : ''}>{item.value < 35 ? 'Заканчивается' : 'В наличии'}</span><h3>{item.name}</h3><StockBar {...item} /><label>Расход на услугу<Input defaultValue={item.use} /></label></div></article>)}
            </div>
          </section>
        )}

        {tab === 'settings' && (
          <section className="admin-page settings-page">
            <div className="admin-heading"><div><span>Рабочие параметры</span><h1>Настройки</h1></div></div>
            <div className="settings-grid">
              <section className="admin-panel"><div className="settings-title"><CreditCard /><div><h3>Способы оплаты</h3><p>Доступны клиенту при записи</p></div></div>{['СБП по QR-коду', 'Банковская карта', 'Наличные'].map((item) => <label className="switch-row" key={item}><span><strong>{item}</strong></span><Switch defaultChecked /></label>)}</section>
              <section className="admin-panel"><div className="settings-title"><Mail /><div><h3>Почтовые напоминания</h3><p>Автоматические письма клиенту</p></div></div><label className="switch-row"><span><strong>Подтверждение записи</strong><small>Сразу после записи</small></span><Switch checked={emailReminder} onCheckedChange={setEmailReminder} /></label><label className="switch-row"><span><strong>Напомнить о визите</strong><small>За 24 часа</small></span><Switch defaultChecked /></label><label>Текст напоминания<Textarea defaultValue="Ждём вас завтра в Jeanna K. Если планы изменились, ответьте на это письмо." /></label></section>
              <section className="admin-panel full-settings"><div className="settings-title"><Clock3 /><div><h3>Длительности по умолчанию</h3><p>Используются для расчёта свободных слотов</p></div></div><div className="duration-grid">{services.map((service) => <label key={service.id}><span>{service.name}</span><Input defaultValue={service.time} /></label>)}</div></section>
            </div>
            <Button className="primary-button save-settings" onClick={() => notify('Настройки сохранены')}>Сохранить настройки</Button>
          </section>
        )}
      </main>

      <nav className="admin-mobile-nav">
        <AdminNav active={tab === 'overview'} icon={<LayoutDashboard />} label="Обзор" onClick={() => setTab('overview')} />
        <AdminNav active={tab === 'calendar'} icon={<CalendarDays />} label="Календарь" onClick={() => setTab('calendar')} />
        <AdminNav active={tab === 'clients'} icon={<UsersRound />} label="Клиенты" onClick={() => setTab('clients')} />
        <AdminNav active={tab === 'services'} icon={<Scissors />} label="Услуги" onClick={() => setTab('services')} />
        <AdminNav active={tab === 'settings'} icon={<Settings2 />} label="Ещё" onClick={() => setTab('settings')} />
      </nav>
    </div>
  )
}

function AdminNav({ active, icon, label, badge, onClick }: { active: boolean; icon: React.ReactNode; label: string; badge?: string; onClick: () => void }) {
  return <button className={`admin-nav-button ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{badge && <small>{badge}</small>}</button>
}

function StatCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <article className="stat-card"><div><span>{icon}</span><small>{label}</small></div><strong>{value}</strong><p><TrendingUp />{note}</p></article>
}

function StockBar({ name, value, use }: { name: string; value: number; use: string }) {
  return <div className="stock-bar"><div><strong>{name}</strong><span>{value}%</span></div><div className="bar"><span style={{ width: `${value}%` }} /></div><small>Расход: {use}</small></div>
}

function BookingDialog({
  open,
  setOpen,
  step,
  setStep,
  selectedService,
  setSelectedService,
  selectedTime,
  setSelectedTime,
  extras,
  toggleExtra,
  drink,
  payment,
  finish,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  step: number
  setStep: (step: number) => void
  selectedService: string
  setSelectedService: (service: string) => void
  selectedTime: string
  setSelectedTime: (time: string) => void
  extras: string[]
  toggleExtra: (extra: string) => void
  drink: string
  payment: string
  finish: () => void
}) {
  const service = services.find((item) => item.id === selectedService) ?? services[0]
  const total = service.price + extras.length * 500

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="booking-dialog">
        <div className="dialog-topline"><span>Онлайн-запись</span><span>{step + 1} / 3</span></div>
        <div className="progress-line"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
        {step === 0 && (
          <>
            <DialogHeader><DialogTitle>Что будем делать?</DialogTitle><DialogDescription>Время рассчитано с запасом, без спешки.</DialogDescription></DialogHeader>
            <div className="booking-service-list">{services.map((item) => <button key={item.id} className={selectedService === item.id ? 'selected' : ''} onClick={() => setSelectedService(item.id)}><span>{item.accent}</span><div><strong>{item.name}</strong><small>{item.time} · {item.price.toLocaleString('ru-RU')} ₽</small></div>{selectedService === item.id && <Check />}</button>)}</div>
            <Button className="primary-button" onClick={() => setStep(1)}>Выбрать время <ArrowRight /></Button>
          </>
        )}
        {step === 1 && (
          <>
            <DialogHeader><DialogTitle>28 сентября, понедельник</DialogTitle><DialogDescription>Ближайшие свободные окна.</DialogDescription></DialogHeader>
            <div className="date-strip">{['27 вс', '28 пн', '29 вт', '30 ср'].map((date, index) => <button className={index === 1 ? 'selected' : ''} key={date}><strong>{date.split(' ')[0]}</strong><span>{date.split(' ')[1]}</span></button>)}</div>
            <div className="time-grid">{['10:00', '12:30', '15:00', '17:30'].map((time) => <button className={selectedTime === time ? 'selected' : ''} key={time} onClick={() => setSelectedTime(time)}>{time}<small>{service.time}</small></button>)}</div>
            <div className="extras-select"><span>Добавить к записи</span>{['Снятие', 'Укрепление', 'Дизайн'].map((extra) => <button className={extras.includes(extra) ? 'selected' : ''} onClick={() => toggleExtra(extra)} key={extra}>{extras.includes(extra) ? <Check /> : <Plus />}{extra}<small>+500 ₽</small></button>)}</div>
            <div className="dialog-actions"><Button variant="ghost" onClick={() => setStep(0)}><ChevronLeft />Назад</Button><Button className="primary-button" onClick={() => setStep(2)}>Продолжить <ArrowRight /></Button></div>
          </>
        )}
        {step === 2 && (
          <>
            <DialogHeader><div className="confirmation-icon"><Check /></div><DialogTitle>Проверим детали</DialogTitle><DialogDescription>Оплата — после визита. Отменить запись можно за 24 часа.</DialogDescription></DialogHeader>
            <div className="booking-summary"><div><span>Услуга</span><strong>{service.name}</strong></div><div><span>Когда</span><strong>28 сентября · {selectedTime}</strong></div><div><span>Дополнительно</span><strong>{extras.join(', ') || 'Без дополнений'}</strong></div><div><span>На визите</span><strong>{drink} · {payment}</strong></div><div className="summary-total"><span>Итого</span><strong>{total.toLocaleString('ru-RU')} ₽</strong></div></div>
            <Button className="primary-button" onClick={finish}>Подтвердить запись <Check /></Button>
            <button className="back-link" onClick={() => setStep(1)}>Изменить детали</button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
