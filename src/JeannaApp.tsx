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
type Language = 'fr' | 'en' | 'ru'

const works = [
  { id: 1, src: '/images/nails-1.jpg', title: 'Base laiteuse', tag: 'minimal', likes: 128 },
  { id: 2, src: '/images/nails-2.jpg', title: 'French sombre', tag: 'french', likes: 94 },
  { id: 3, src: '/images/nails-3.jpg', title: 'Détail chrome', tag: 'chrome', likes: 76 },
  { id: 4, src: '/images/nails-4.jpg', title: 'Carré doux', tag: 'nude', likes: 112 },
]

const services = [
  { id: 'manicure', name: 'Manucure + gel', time: '2 h', price: 4200, accent: '01' },
  { id: 'lashes', name: 'Rehaussement de cils', time: '1 h 30', price: 3500, accent: '02' },
  { id: 'express', name: 'Manucure express', time: '1 h', price: 2500, accent: '03' },
]

const appointments = [
  { id: 1, time: '10:00', client: 'Aline S.', service: 'Manucure + gel', duration: '2 h', color: 'lime' },
  { id: 2, time: '12:30', client: 'Marie K.', service: 'Rehaussement de cils', duration: '1 h 30', color: 'pink' },
  { id: 3, time: '15:00', client: 'Sacha V.', service: 'Manucure + design', duration: '2 h 30', color: 'blue' },
]

const stock = [
  { name: 'Base Luxio', value: 68, use: '8% / rendez-vous' },
  { name: 'Top coat', value: 34, use: '5% / rendez-vous' },
  { name: 'Patchs pour cils', value: 22, use: '1 pièce / rendez-vous' },
]

const ui = {
  fr: {
    clientMode: 'Côté client',
    proMode: 'Espace professionnel',
    home: 'Accueil',
    references: 'Inspirations',
    booking: 'Réserver',
    account: 'Mon compte',
    open: 'Créneaux ouverts cette semaine',
    heroTitle: 'Votre beauté,',
    heroAccent: 'sans compromis.',
    heroText: 'Manucure, regard et deux heures rien que pour vous.',
    bookNow: 'Réserver maintenant',
    seeGallery: 'Voir les inspirations',
    bookingCardTag: 'Réservation en ligne',
    bookingCardTitle: 'Votre rendez-vous en quelques gestes',
    bookingCardText: 'Choisissez votre soin, partagez une photo si vous le souhaitez, puis confirmez.',
    start: 'Commencer',
    saved: 'Inspirations enregistrées',
    forYou: 'Sélection pour vous',
    allGallery: 'Toute la galerie',
    careTag: 'Votre confort',
    careTitle: 'Chaque détail compte',
    careText: 'Votre boisson, votre moyen de paiement et vos préférences sont mémorisés.',
    configure: 'Configurer',
    galleryKicker: 'Galerie Jeanna',
    galleryTitle: 'Gardez les idées',
    galleryAccent: 'que vous aimez.',
    galleryText: 'Ajoutez un cœur : Jeanna verra vos inspirations avant le rendez-vous.',
    all: 'Tout',
    nude: 'Nude',
    french: 'French',
    design: 'Design',
    lashes: 'Cils',
    bookReference: 'Réserver avec cette inspiration',
    chooseVisit: 'Choisissez',
    idealVisit: 'votre rendez-vous.',
    preparation: 'Un parcours simple',
    preparationTitle: 'Tout se fait pendant la réservation',
    preparationText: 'Les photos sont facultatives et peuvent être prises directement depuis votre téléphone.',
    clientSince: 'Cliente depuis mars 2025',
    comfort: 'Confort du rendez-vous',
    savedNext: 'Mémorisé pour vos prochaines visites',
    favoriteDrink: 'Boisson préférée',
    paymentMethod: 'Moyen de paiement',
    save: 'Enregistrer',
    savedToast: 'Préférences enregistrées',
    history: 'Historique',
    visits: '8 rendez-vous',
    totalYear: 'sur l’année',
    nextAppointment: 'Prochain rendez-vous',
    repeat: 'Reprendre rendez-vous',
    galleryLike: 'Enregistrer cette inspiration',
    uploadAdded: 'Photo ajoutée',
    replace: 'Touchez pour remplacer',
    chooseLanguage: 'Choisissez votre langue',
    languageHelp: 'Vous pourrez la modifier à tout moment dans l’en-tête.',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    instagram: 'Instagram',
    location: 'Studio privé · sur rendez-vous',
    notifications: 'Notifications',
    menu: 'Ouvrir le menu',
    bookingTitle: 'Réservation',
    selectService: 'Quel soin souhaitez-vous ?',
    serviceHelp: 'Choisissez une prestation. Vous pourrez ajuster les détails avec Jeanna.',
    next: 'Continuer',
    back: 'Retour',
    photoTitle: 'Ajoutez une photo',
    photoHelp: 'Facultatif : photographiez vos ongles ou vos cils, ou ajoutez une inspiration.',
    currentPhoto: 'Photo actuelle',
    currentPhotoHint: 'Prendre une photo',
    referencePhoto: 'Inspiration',
    referencePhotoHint: 'Choisir dans la galerie',
    skip: 'Passer cette étape',
    drinkTitle: 'Que souhaitez-vous boire ?',
    drinkHelp: 'Choisissez une option. Elle vous attendra au studio.',
    paymentTitle: 'Créneau et paiement',
    paymentHelp: 'Sélectionnez l’heure puis votre moyen de paiement préféré.',
    card: 'Carte',
    cash: 'Espèces',
    transfer: 'Virement instantané',
    addOns: 'Ajouter au rendez-vous',
    removal: 'Dépose',
    strengthening: 'Renforcement',
    nailArt: 'Nail art',
    confirmTitle: 'Tout est prêt',
    confirmHelp: 'Le paiement se fera après la prestation. Annulation possible jusqu’à 24 h avant.',
    service: 'Prestation',
    when: 'Date et heure',
    photos: 'Photos',
    noPhotos: 'Aucune — ce n’est pas obligatoire',
    drink: 'Boisson',
    payment: 'Paiement',
    extras: 'Options',
    none: 'Aucune',
    total: 'Total',
    confirm: 'Confirmer le rendez-vous',
    edit: 'Modifier les détails',
    success: 'Rendez-vous confirmé pour le 28 septembre',
  },
  en: {
    clientMode: 'For clients', proMode: 'Professional area', home: 'Home', references: 'Inspiration', booking: 'Book', account: 'My account',
    open: 'Appointments available this week', heroTitle: 'Beauty care,', heroAccent: 'made effortless.', heroText: 'Nails, lashes and time that is entirely yours.',
    bookNow: 'Book now', seeGallery: 'Browse inspiration', bookingCardTag: 'Online booking', bookingCardTitle: 'Your appointment in a few taps',
    bookingCardText: 'Choose a service, share an optional photo, then confirm.', start: 'Start booking', saved: 'Saved inspiration', forYou: 'Selected for you',
    allGallery: 'Full gallery', careTag: 'Your comfort', careTitle: 'Every detail matters', careText: 'Your drink, payment method and preferences are remembered.',
    configure: 'Edit', galleryKicker: 'Jeanna gallery', galleryTitle: 'Save the looks', galleryAccent: 'you love.', galleryText: 'Tap the heart and Jeanna will see your ideas before the visit.',
    all: 'All', nude: 'Nude', french: 'French', design: 'Design', lashes: 'Lashes', bookReference: 'Book with this reference', chooseVisit: 'Choose', idealVisit: 'your perfect visit.',
    preparation: 'One simple flow', preparationTitle: 'Everything happens while booking', preparationText: 'Photos are optional and can be taken directly from your phone.',
    clientSince: 'Client since March 2025', comfort: 'Visit comfort', savedNext: 'Saved for future visits', favoriteDrink: 'Favourite drink', paymentMethod: 'Payment method',
    save: 'Save', savedToast: 'Preferences saved', history: 'History', visits: '8 visits', totalYear: 'spent this year', nextAppointment: 'Next appointment', repeat: 'Book again',
    galleryLike: 'Save this inspiration', uploadAdded: 'Photo added', replace: 'Tap to replace', chooseLanguage: 'Choose your language', languageHelp: 'You can change it any time in the header.',
    privacy: 'Privacy', terms: 'Terms', instagram: 'Instagram', location: 'Private studio · by appointment', notifications: 'Notifications', menu: 'Open menu',
    bookingTitle: 'Booking', selectService: 'Which service would you like?', serviceHelp: 'Choose a service. You can fine-tune the details with Jeanna.', next: 'Continue', back: 'Back',
    photoTitle: 'Add a photo', photoHelp: 'Optional: photograph your nails or lashes, or add an inspiration.', currentPhoto: 'Current look', currentPhotoHint: 'Take a photo',
    referencePhoto: 'Inspiration', referencePhotoHint: 'Choose from gallery', skip: 'Skip this step', drinkTitle: 'What would you like to drink?', drinkHelp: 'Choose one and it will be ready at the studio.',
    paymentTitle: 'Time and payment', paymentHelp: 'Select a time, then your preferred payment method.', card: 'Card', cash: 'Cash', transfer: 'Instant transfer',
    addOns: 'Add to appointment', removal: 'Removal', strengthening: 'Strengthening', nailArt: 'Nail art', confirmTitle: 'Everything is ready',
    confirmHelp: 'Pay after the service. You can cancel up to 24 hours before.', service: 'Service', when: 'Date and time', photos: 'Photos', noPhotos: 'None — they are optional',
    drink: 'Drink', payment: 'Payment', extras: 'Add-ons', none: 'None', total: 'Total', confirm: 'Confirm appointment', edit: 'Edit details', success: 'Appointment confirmed for 28 September',
  },
  ru: {
    clientMode: 'Для клиента', proMode: 'Кабинет мастера', home: 'Главная', references: 'Референсы', booking: 'Запись', account: 'Профиль',
    open: 'Есть окна на этой неделе', heroTitle: 'Красота,', heroAccent: 'без компромиссов.', heroText: 'Маникюр, ресницы и время только для себя.',
    bookNow: 'Записаться', seeGallery: 'Смотреть референсы', bookingCardTag: 'Онлайн-запись', bookingCardTitle: 'Запись в несколько касаний',
    bookingCardText: 'Выберите услугу, при желании добавьте фото и подтвердите визит.', start: 'Начать запись', saved: 'Сохранённые референсы', forYou: 'Подобрано для вас',
    allGallery: 'Вся галерея', careTag: 'Ваш комфорт', careTitle: 'Важна каждая деталь', careText: 'Напиток, оплата и предпочтения сохраняются.',
    configure: 'Настроить', galleryKicker: 'Галерея Jeanna', galleryTitle: 'Сохраняйте то,', galleryAccent: 'что нравится.', galleryText: 'Поставьте лайк — Jeanna увидит идею до встречи.',
    all: 'Все', nude: 'Нюд', french: 'Френч', design: 'Дизайн', lashes: 'Ресницы', bookReference: 'Записаться с референсом', chooseVisit: 'Выберите', idealVisit: 'идеальный визит.',
    preparation: 'Простой путь', preparationTitle: 'Всё внутри записи', preparationText: 'Фото необязательно, его можно снять прямо с телефона.',
    clientSince: 'Клиент с марта 2025', comfort: 'Комфорт на визите', savedNext: 'Сохраняется для следующих визитов', favoriteDrink: 'Любимый напиток', paymentMethod: 'Способ оплаты',
    save: 'Сохранить', savedToast: 'Предпочтения сохранены', history: 'История', visits: '8 визитов', totalYear: 'за год', nextAppointment: 'Ближайшая запись', repeat: 'Повторить запись',
    galleryLike: 'Сохранить референс', uploadAdded: 'Фото добавлено', replace: 'Нажмите, чтобы заменить', chooseLanguage: 'Выберите язык', languageHelp: 'Его можно изменить в шапке в любой момент.',
    privacy: 'Конфиденциальность', terms: 'Условия', instagram: 'Instagram', location: 'Частная студия · по записи', notifications: 'Уведомления', menu: 'Открыть меню',
    bookingTitle: 'Онлайн-запись', selectService: 'Что будем делать?', serviceHelp: 'Выберите услугу. Детали можно уточнить с Jeanna.', next: 'Продолжить', back: 'Назад',
    photoTitle: 'Добавьте фото', photoHelp: 'Необязательно: сфотографируйте ногти или ресницы либо добавьте референс.', currentPhoto: 'Текущее состояние', currentPhotoHint: 'Снять фото',
    referencePhoto: 'Референс', referencePhotoHint: 'Выбрать из галереи', skip: 'Пропустить', drinkTitle: 'Что будете пить?', drinkHelp: 'Выберите один вариант — он будет ждать в студии.',
    paymentTitle: 'Время и оплата', paymentHelp: 'Выберите время и предпочтительный способ оплаты.', card: 'Карта', cash: 'Наличные', transfer: 'Быстрый перевод',
    addOns: 'Добавить к записи', removal: 'Снятие', strengthening: 'Укрепление', nailArt: 'Дизайн', confirmTitle: 'Всё готово',
    confirmHelp: 'Оплата после визита. Отмена доступна за 24 часа.', service: 'Услуга', when: 'Дата и время', photos: 'Фото', noPhotos: 'Нет — это необязательно',
    drink: 'Напиток', payment: 'Оплата', extras: 'Дополнительно', none: 'Нет', total: 'Итого', confirm: 'Подтвердить запись', edit: 'Изменить детали', success: 'Запись подтверждена на 28 сентября',
  },
}

const serviceNames: Record<Language, Record<string, string>> = {
  fr: { manicure: 'Manucure + gel', lashes: 'Rehaussement de cils', express: 'Manucure express' },
  en: { manicure: 'Manicure + gel', lashes: 'Lash lift', express: 'Express manicure' },
  ru: { manicure: 'Маникюр + гель', lashes: 'Ламинирование ресниц', express: 'Экспресс-маникюр' },
}

const drinkOptions = [
  { id: 'cappuccino', image: '/images/drink-cappuccino.jpg', labels: { fr: 'Cappuccino', en: 'Cappuccino', ru: 'Капучино' } },
  { id: 'espresso', image: '/images/drink-cappuccino.jpg', labels: { fr: 'Espresso', en: 'Espresso', ru: 'Эспрессо' } },
  { id: 'tea', image: '/images/drink-tea.jpg', labels: { fr: 'Thé noir', en: 'Black tea', ru: 'Чёрный чай' } },
  { id: 'infusion', image: '/images/drink-tea.jpg', labels: { fr: 'Infusion', en: 'Herbal tea', ru: 'Травяной чай' } },
  { id: 'water', image: '/images/drink-water.jpg', labels: { fr: 'Eau plate', en: 'Still water', ru: 'Вода' } },
  { id: 'sparkling', image: '/images/drink-water.jpg', labels: { fr: 'Eau pétillante', en: 'Sparkling water', ru: 'Газированная вода' } },
]

export default function JeannaApp() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem('jeanna-language')
    return saved === 'en' || saved === 'ru' || saved === 'fr' ? saved : 'fr'
  })
  const [languageOpen, setLanguageOpen] = useState(() => !window.localStorage.getItem('jeanna-language'))
  const [mode, setMode] = useState<Mode>('client')
  const [clientTab, setClientTab] = useState<ClientTab>('home')
  const [adminTab, setAdminTab] = useState<AdminTab>('overview')
  const [liked, setLiked] = useState<number[]>([2])
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(0)
  const [selectedService, setSelectedService] = useState(services[0].id)
  const [selectedTime, setSelectedTime] = useState('12:30')
  const [extras, setExtras] = useState<string[]>(['removal'])
  const [drink, setDrink] = useState('cappuccino')
  const [payment, setPayment] = useState('card')
  const [handPhoto, setHandPhoto] = useState<string | null>(null)
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null)
  const [emailReminder, setEmailReminder] = useState(true)
  const [blockedSlot, setBlockedSlot] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const copy = ui[language]

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

  const startBooking = (serviceId = services[0].id) => {
    setSelectedService(serviceId)
    setBookingStep(0)
    setBookingOpen(true)
  }

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    setMenuOpen(false)
  }

  const chooseLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage)
    window.localStorage.setItem('jeanna-language', nextLanguage)
    document.documentElement.setAttribute('lang', nextLanguage)
    setLanguageOpen(false)
  }

  return (
    <div className={`app-shell mode-${mode}`}>
      <div className="utility-bar">
        <span>{copy.location}</span>
        <nav aria-label="Liens utiles">
          <a href="#privacy">{copy.privacy}</a>
          <a href="#terms">{copy.terms}</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer"><span aria-hidden="true">@</span>{copy.instagram}</a>
        </nav>
      </div>
      <header className="topbar">
        <button className="brand" onClick={() => switchMode('client')} aria-label="Jeanna K">
          <span className="brand-mark">JK</span>
          <span>JEANNA K</span>
        </button>
        <div className="mode-switch" aria-label="Changer d’espace">
          <button className={mode === 'client' ? 'active' : ''} onClick={() => switchMode('client')}>{copy.clientMode}</button>
          <button className={mode === 'admin' ? 'active' : ''} onClick={() => switchMode('admin')}>{copy.proMode}</button>
        </div>
        <div className="topbar-actions">
          <div className="language-switch" aria-label="Langue">
            {(['fr', 'en', 'ru'] as Language[]).map((item) => <button key={item} className={language === item ? 'active' : ''} onClick={() => chooseLanguage(item)}>{item.toUpperCase()}</button>)}
          </div>
          <button className="icon-button" aria-label={copy.notifications}><Bell size={18} /><span className="notification-dot" /></button>
          <button className="profile-chip" onClick={() => mode === 'client' ? setClientTab('profile') : setAdminTab('settings')}>
            <img src="/images/jeanna.jpg" alt="" /><span>{mode === 'client' ? 'Anna' : 'Jeanna'}</span>
          </button>
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={copy.menu}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-mode-menu">
          <button onClick={() => switchMode('client')}>{copy.clientMode}</button>
          <button onClick={() => switchMode('admin')}>{copy.proMode}</button>
          <div className="mobile-languages">{(['fr', 'en', 'ru'] as Language[]).map((item) => <button key={item} onClick={() => chooseLanguage(item)}>{item.toUpperCase()}</button>)}</div>
        </div>
      )}

      {mode === 'client' ? (
        <ClientExperience
          language={language}
          copy={copy}
          tab={clientTab}
          setTab={setClientTab}
          liked={liked}
          toggleLike={toggleLike}
          startBooking={startBooking}
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

      <Dialog open={languageOpen} onOpenChange={() => undefined}>
        <DialogContent className="language-dialog" showCloseButton={false}>
          <div className="language-monogram">JK</div>
          <DialogHeader>
            <DialogTitle>{copy.chooseLanguage}</DialogTitle>
            <DialogDescription>{copy.languageHelp}</DialogDescription>
          </DialogHeader>
          <div className="language-choices">
            <button onClick={() => chooseLanguage('fr')}><strong>Français</strong><span>Langue principale</span><b>FR</b></button>
            <button onClick={() => chooseLanguage('en')}><strong>English</strong><span>International</span><b>EN</b></button>
            <button onClick={() => chooseLanguage('ru')}><strong>Русский</strong><span>Русская версия</span><b>RU</b></button>
          </div>
        </DialogContent>
      </Dialog>

      <BookingDialog
        language={language}
        copy={copy}
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
        setDrink={setDrink}
        payment={payment}
        setPayment={setPayment}
        handPhoto={handPhoto}
        referencePhoto={referencePhoto}
        setHandPhoto={setHandPhoto}
        setReferencePhoto={setReferencePhoto}
        finish={() => {
          setBookingOpen(false)
          setClientTab('profile')
          notify(copy.success)
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
  language,
  copy,
  tab,
  setTab,
  liked,
  toggleLike,
  startBooking,
  drink,
  setDrink,
  payment,
  setPayment,
  notify,
}: {
  language: Language
  copy: typeof ui.fr
  tab: ClientTab
  setTab: (tab: ClientTab) => void
  liked: number[]
  toggleLike: (id: number) => void
  startBooking: (service?: string) => void
  drink: string
  setDrink: (value: string) => void
  payment: string
  setPayment: (value: string) => void
  notify: (message: string) => void
}) {
  const selectedDrinkLabel = drinkOptions.find((item) => item.id === drink)?.labels[language] ?? drinkOptions[0].labels[language]
  const payments = [
    { id: 'card', label: copy.card },
    { id: 'cash', label: copy.cash },
    { id: 'transfer', label: copy.transfer },
  ]
  const selectedPaymentLabel = payments.find((item) => item.id === payment)?.label ?? payments[0].label

  return (
    <div className="client-layout">
      <main className="client-main">
        {tab === 'home' && (
          <>
            <section className="client-hero">
              <div>
                <div className="eyebrow"><span className="status-dot" /> {copy.open}</div>
                <h1>{copy.heroTitle}<br /><em>{copy.heroAccent}</em></h1>
                <p>{copy.heroText}</p>
                <div className="hero-actions">
                  <Button className="primary-button" onClick={() => startBooking()}>{copy.bookNow} <ArrowRight /></Button>
                  <button className="text-button" onClick={() => setTab('gallery')}>{copy.seeGallery}</button>
                </div>
              </div>
              <div className="hero-art">
                <img src="/images/nails-1.jpg" alt="Manucure Jeanna K" />
                <div className="floating-note"><Star size={15} fill="currentColor" /><div><strong>4.9</strong><span>87 avis</span></div></div>
                <div className="artist-badge"><img src="/images/jeanna.jpg" alt="" /><div><strong>Jeanna K</strong><span>nail & lash artist</span></div></div>
              </div>
            </section>

            <section className="booking-cta">
              <div className="booking-cta-number">01</div>
              <div>
                <span className="section-label">{copy.bookingCardTag}</span>
                <h2>{copy.bookingCardTitle}</h2>
                <p>{copy.bookingCardText}</p>
              </div>
              <Button className="booking-cta-button" onClick={() => startBooking()}>{copy.start}<ArrowRight /></Button>
            </section>

            <section className="section-block">
              <div className="section-heading">
                <div><span className="section-label">{copy.saved}</span><h2>{copy.forYou}</h2></div>
                <button onClick={() => setTab('gallery')}>{copy.allGallery} <ArrowRight /></button>
              </div>
              <GalleryGrid liked={liked} toggleLike={toggleLike} compact />
            </section>

            <section className="care-banner">
              <div><span className="section-label">{copy.careTag}</span><h2>{copy.careTitle}</h2><p>{copy.careText}</p></div>
              <button onClick={() => setTab('profile')}><Settings2 /> {copy.configure}</button>
            </section>
          </>
        )}

        {tab === 'gallery' && (
          <section className="page-section">
            <div className="page-intro">
              <div className="eyebrow"><Sparkles size={14} /> {copy.galleryKicker}</div>
              <h1>{copy.galleryTitle}<br /><em>{copy.galleryAccent}</em></h1>
              <p>{copy.galleryText}</p>
            </div>
            <div className="filter-row">{[copy.all, copy.nude, copy.french, copy.design, copy.lashes].map((filter, index) => <button key={filter} className={index === 0 ? 'active' : ''}>{filter}</button>)}</div>
            <GalleryGrid liked={liked} toggleLike={toggleLike} label={copy.galleryLike} />
            <Button className="floating-book" onClick={() => startBooking()}>{copy.bookReference} <ArrowRight /></Button>
          </section>
        )}

        {tab === 'booking' && (
          <section className="page-section booking-page">
            <div className="page-intro">
              <div className="eyebrow"><CalendarDays size={14} /> {copy.bookingCardTag}</div>
              <h1>{copy.chooseVisit}<br /><em>{copy.idealVisit}</em></h1>
            </div>
            <div className="service-grid">
              {services.map((service) => (
                <button key={service.id} className="service-card" onClick={() => startBooking(service.id)}>
                  <span>{service.accent}</span><div><h3>{serviceNames[language][service.id]}</h3><p>{service.time} · {service.price.toLocaleString('fr-FR')} ₽</p></div><ArrowRight />
                </button>
              ))}
            </div>
            <div className="upload-panel">
              <div><span className="section-label">{copy.preparation}</span><h2>{copy.preparationTitle}</h2><p>{copy.preparationText}</p></div>
              <Button className="primary-button" onClick={() => startBooking()}>{copy.start}<ArrowRight /></Button>
            </div>
          </section>
        )}

        {tab === 'profile' && (
          <section className="page-section profile-page">
            <div className="profile-heading">
              <div className="avatar-large">AM</div>
              <div><span className="section-label">{copy.clientSince}</span><h1>Anna Martin</h1><p>+33 6 24 18 04 22</p></div>
            </div>
            <section className="upcoming-card account-upcoming">
              <div className="date-tile"><strong>28</strong><span>sept</span></div>
              <div className="upcoming-info">
                <span className="section-label">{copy.nextAppointment}</span>
                <h3>{serviceNames[language].manicure}</h3>
                <p><Clock3 size={14} /> 12:30–14:30 · Studio Jeanna K</p>
              </div>
              <Button variant="outline" className="repeat-button" onClick={() => startBooking('manicure')}><Repeat2 /> {copy.repeat}</Button>
            </section>
            <div className="profile-grid">
              <div className="profile-card wide">
                <div className="card-title"><div><Coffee /><span><strong>{copy.comfort}</strong><small>{copy.savedNext}</small></span></div></div>
                <ChoiceGroup label={copy.favoriteDrink} values={drinkOptions.map((item) => item.labels[language])} selected={selectedDrinkLabel} onSelect={(value) => setDrink(drinkOptions.find((item) => item.labels[language] === value)?.id ?? 'cappuccino')} />
                <ChoiceGroup label={copy.paymentMethod} values={payments.map((item) => item.label)} selected={selectedPaymentLabel} onSelect={(value) => setPayment(payments.find((item) => item.label === value)?.id ?? 'card')} />
                <Button className="primary-button" onClick={() => notify(copy.savedToast)}>{copy.save}</Button>
              </div>
              <div className="profile-card">
                <div className="card-title"><div><Repeat2 /><span><strong>{copy.history}</strong><small>{copy.visits}</small></span></div><ChevronRight /></div>
                <div className="mini-stat"><strong>32 400 ₽</strong><span>{copy.totalYear}</span></div>
              </div>
              <div className="profile-card dark-card">
                <div className="card-title"><div><Heart /><span><strong>{copy.references}</strong><small>{liked.length}</small></span></div><ChevronRight /></div>
                <div className="reference-stack">{works.slice(0, 3).map((work) => <img key={work.id} src={work.src} alt="" />)}</div>
              </div>
            </div>
          </section>
        )}
        <footer className="site-footer">
          <div><span className="brand-mark">JK</span><strong>JEANNA K</strong></div>
          <nav>
            <a id="privacy" href="#privacy">{copy.privacy}</a>
            <a id="terms" href="#terms">{copy.terms}</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><span aria-hidden="true">@</span>{copy.instagram}</a>
          </nav>
          <small>© 2026 Jeanna K · Nail & lash studio</small>
        </footer>
      </main>

      <nav className="bottom-nav" aria-label="Navigation client">
        <ClientNavButton active={tab === 'home'} icon={<Home />} label={copy.home} onClick={() => setTab('home')} />
        <ClientNavButton active={tab === 'gallery'} icon={<Heart />} label={copy.references} onClick={() => setTab('gallery')} />
        <button className="nav-book" onClick={() => startBooking()} aria-label={copy.bookNow}><Plus /></button>
        <ClientNavButton active={tab === 'booking'} icon={<CalendarDays />} label={copy.booking} onClick={() => setTab('booking')} />
        <ClientNavButton active={tab === 'profile'} icon={<UserRound />} label={copy.account} onClick={() => setTab('profile')} />
      </nav>
    </div>
  )
}

function ClientNavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? 'active' : ''} onClick={onClick}>{icon}<span>{label}</span></button>
}

function GalleryGrid({ liked, toggleLike, compact = false, label = 'Enregistrer cette inspiration' }: { liked: number[]; toggleLike: (id: number) => void; compact?: boolean; label?: string }) {
  return (
    <div className={`gallery-grid ${compact ? 'compact' : ''}`}>
      {works.map((work) => (
        <article className="work-card" key={work.id}>
          <img src={work.src} alt={work.title} />
          <button className={liked.includes(work.id) ? 'liked' : ''} onClick={() => toggleLike(work.id)} aria-label={label}><Heart fill={liked.includes(work.id) ? 'currentColor' : 'none'} /></button>
          <div><span>#{work.tag}</span><strong>{work.title}</strong><small>{work.likes + (liked.includes(work.id) ? 1 : 0)} ♥</small></div>
        </article>
      ))}
    </div>
  )
}

function UploadCard({ title, subtitle, preview, onClick, icon, addedLabel, replaceLabel }: { title: string; subtitle: string; preview: string | null; onClick: () => void; icon: React.ReactNode; addedLabel: string; replaceLabel: string }) {
  return (
    <button className={`upload-card ${preview ? 'has-preview' : ''}`} onClick={onClick}>
      {preview ? <img src={preview} alt="" /> : <span>{icon}</span>}
      <div><strong>{preview ? addedLabel : title}</strong><small>{preview ? replaceLabel : subtitle}</small></div><Plus />
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
          <span className="sidebar-label">Espace de travail</span>
          <AdminNav active={tab === 'overview'} icon={<LayoutDashboard />} label="Vue d’ensemble" onClick={() => setTab('overview')} />
          <AdminNav active={tab === 'calendar'} icon={<CalendarDays />} label="Agenda" badge="3" onClick={() => setTab('calendar')} />
          <AdminNav active={tab === 'clients'} icon={<UsersRound />} label="Clientes" onClick={() => setTab('clients')} />
          <AdminNav active={tab === 'services'} icon={<Scissors />} label="Prestations" onClick={() => setTab('services')} />
          <AdminNav active={tab === 'stock'} icon={<Package />} label="Stock" badge="2" onClick={() => setTab('stock')} />
        </div>
        <div>
          <AdminNav active={tab === 'settings'} icon={<Settings2 />} label="Réglages" onClick={() => setTab('settings')} />
          <div className="admin-profile"><img src="/images/jeanna.jpg" alt="" /><div><strong>Jeanna K</strong><span>Administratrice</span></div></div>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'overview' && (
          <>
            <div className="admin-heading"><div><span>Mercredi 23 septembre</span><h1>Bonjour, Jeanna</h1></div><Button className="primary-button" onClick={() => setTab('calendar')}><CalendarDays /> Ouvrir l’agenda</Button></div>
            <div className="stats-grid">
              <StatCard icon={<CalendarDays />} label="Rendez-vous aujourd’hui" value="3" note="+1 depuis mercredi dernier" />
              <StatCard icon={<CreditCard />} label="Chiffre de la semaine" value="48 600 ₽" note="+12% cette semaine" />
              <StatCard icon={<UsersRound />} label="Clientes fidèles" value="78%" note="24 clientes actives" />
              <StatCard icon={<Clock3 />} label="Taux d’occupation" value="84%" note="5 h 30 disponibles" />
            </div>
            <div className="admin-dashboard-grid">
              <section className="admin-panel schedule-panel">
                <div className="panel-heading"><div><span className="section-label">Aujourd’hui</span><h2>Planning</h2></div><button onClick={() => setTab('calendar')}>Voir la journée <ArrowRight /></button></div>
                <div className="appointment-list">
                  {appointments.map((appointment) => (
                    <button key={appointment.id} onClick={() => setSelectedAppointment(appointment)} className={selectedAppointment.id === appointment.id ? 'selected' : ''}>
                      <time>{appointment.time}</time><span className={`appointment-color ${appointment.color}`} /><div><strong>{appointment.client}</strong><small>{appointment.service} · {appointment.duration}</small></div><ChevronRight />
                    </button>
                  ))}
                </div>
              </section>
              <section className="admin-panel client-detail">
                <div className="client-detail-head"><div className="avatar-small">{selectedAppointment.client.slice(0, 2)}</div><div><span className="section-label">Fiche rendez-vous</span><h3>{selectedAppointment.client}</h3></div><button><X size={17} /></button></div>
                <div className="detail-row"><span>Prestation</span><strong>{selectedAppointment.service}</strong></div>
                <div className="detail-row"><span>Préférences</span><strong>Cappuccino · Carte</strong></div>
                <div className="detail-row"><span>Options</span><strong>Dépose · renforcement</strong></div>
                <div className="detail-note"><ImagesIcon /><span><strong>2 inspirations</strong><small>Ajoutées par la cliente</small></span><div className="reference-stack mini">{works.slice(0, 2).map((work) => <img src={work.src} key={work.id} alt="" />)}</div></div>
                <Textarea defaultValue="Aime l’ovale court, cuticules sensibles." aria-label="Note cliente" />
              </section>
            </div>
            <section className="admin-panel stock-overview">
              <div className="panel-heading"><div><span className="section-label">Produits</span><h2>À réapprovisionner</h2></div><button onClick={() => setTab('stock')}>Voir le stock <ArrowRight /></button></div>
              <div className="stock-mini-grid">{stock.map((item) => <StockBar key={item.name} {...item} />)}</div>
            </section>
          </>
        )}

        {tab === 'calendar' && (
          <section className="admin-page">
            <div className="admin-heading"><div><span>21–27 septembre</span><h1>Agenda</h1></div><div className="heading-actions"><Button variant="outline"><ChevronLeft /></Button><Button variant="outline">Aujourd’hui</Button><Button variant="outline"><ChevronRight /></Button></div></div>
            <div className="calendar-toolbar">
              <div className="week-days">{['Lun 21', 'Mar 22', 'Mer 23', 'Jeu 24', 'Ven 25', 'Sam 26', 'Dim 27'].map((day, index) => <button className={index === 2 ? 'active' : ''} key={day}>{day}</button>)}</div>
              <button className="block-slot-button" onClick={() => { setBlockedSlot(!blockedSlot); notify(blockedSlot ? 'Créneau de nouveau disponible' : 'Créneau 17:00–18:30 bloqué') }}><LockKeyhole />{blockedSlot ? 'Libérer 17:00' : 'Bloquer un créneau'}</button>
            </div>
            <div className="day-calendar">
              <div className="time-axis">{['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => <span key={time}>{time}</span>)}</div>
              <div className="calendar-track">
                {appointments.map((appointment, index) => <button key={appointment.id} className={`calendar-event ${appointment.color}`} style={{ top: `${42 + index * 150}px`, height: index === 1 ? 104 : 130 }}><strong>{appointment.time} · {appointment.client}</strong><span>{appointment.service}</span><small>{appointment.duration}</small></button>)}
                {blockedSlot && <div className="blocked-event"><LockKeyhole />17:00–18:30 · Temps personnel</div>}
              </div>
              <aside className="hours-card">
                <span className="section-label">Horaires de travail</span><h3>Aujourd’hui</h3>
                <label>Début<Input type="time" defaultValue="09:00" /></label>
                <label>Fin<Input type="time" defaultValue="19:00" /></label>
                <label className="switch-row"><span><strong>Pause</strong><small>13:30–14:00</small></span><Switch defaultChecked /></label>
                <Button className="primary-button" onClick={() => notify('Horaires enregistrés')}>Enregistrer</Button>
              </aside>
            </div>
          </section>
        )}

        {tab === 'clients' && (
          <section className="admin-page">
            <div className="admin-heading"><div><span>24 clientes actives</span><h1>Clientes</h1></div><Input className="search-input" placeholder="Rechercher par nom ou téléphone" /></div>
            <div className="client-table">
              <div className="table-head"><span>Cliente</span><span>Dernière visite</span><span>Visites</span><span>Total</span><span /></div>
              {['Anna Martin', 'Aline Simon', 'Marie Kim', 'Sacha Volkov'].map((name, index) => (
                <button key={name}><span className="client-name"><i>{name.split(' ').map((part) => part[0]).join('')}</i><b>{name}<small>+33 6 24 {index}8 04 2{index}</small></b></span><span>{index + 12} septembre</span><span>{8 - index}</span><span>{(32400 - index * 4200).toLocaleString('fr-FR')} ₽</span><ChevronRight /></button>
              ))}
            </div>
          </section>
        )}

        {tab === 'services' && (
          <section className="admin-page">
            <div className="admin-heading"><div><span>Prestations et durées</span><h1>Carte des soins</h1></div><Button className="primary-button" onClick={() => notify('Nouvelle prestation ajoutée au brouillon')}><Plus /> Ajouter</Button></div>
            <div className="service-admin-grid">{services.map((service, index) => <article key={service.id}><img src={works[index % works.length].src} alt="" /><div><span>Active</span><h3>{service.name}</h3><p>{service.time} · {service.price.toLocaleString('fr-FR')} ₽</p></div><button><Settings2 /></button></article>)}</div>
            <section className="admin-panel extras-panel"><div className="panel-heading"><div><span className="section-label">Options</span><h2>Prestations complémentaires</h2></div></div>{['Dépose extérieure · 500 ₽ · 30 min', 'Renforcement · 700 ₽ · 30 min', 'Nail art · 150 ₽ · 10 min'].map((extra) => <label key={extra}><span>{extra}</span><Switch defaultChecked /></label>)}</section>
          </section>
        )}

        {tab === 'stock' && (
          <section className="admin-page">
            <div className="admin-heading"><div><span>Suivi de consommation</span><h1>Produits</h1></div><Button className="primary-button" onClick={() => notify('Livraison ajoutée')}><Plus /> Ajouter une livraison</Button></div>
            <div className="stock-page-grid">
              {stock.concat([{ name: 'Primer', value: 88, use: '3% / rendez-vous' }]).map((item) => <article className="stock-card" key={item.name}><Package /><div><span className={item.value < 35 ? 'low' : ''}>{item.value < 35 ? 'À commander' : 'En stock'}</span><h3>{item.name}</h3><StockBar {...item} /><label>Consommation par prestation<Input defaultValue={item.use} /></label></div></article>)}
            </div>
          </section>
        )}

        {tab === 'settings' && (
          <section className="admin-page settings-page">
            <div className="admin-heading"><div><span>Paramètres professionnels</span><h1>Réglages</h1></div></div>
            <div className="settings-grid">
              <section className="admin-panel"><div className="settings-title"><CreditCard /><div><h3>Moyens de paiement</h3><p>Proposés pendant la réservation</p></div></div>{['Virement instantané', 'Carte bancaire', 'Espèces'].map((item) => <label className="switch-row" key={item}><span><strong>{item}</strong></span><Switch defaultChecked /></label>)}</section>
              <section className="admin-panel"><div className="settings-title"><Mail /><div><h3>Rappels par e-mail</h3><p>Messages automatiques aux clientes</p></div></div><label className="switch-row"><span><strong>Confirmation du rendez-vous</strong><small>Envoyée immédiatement</small></span><Switch checked={emailReminder} onCheckedChange={setEmailReminder} /></label><label className="switch-row"><span><strong>Rappel de visite</strong><small>24 heures avant</small></span><Switch defaultChecked /></label><label>Texte du rappel<Textarea defaultValue="Nous vous attendons demain chez Jeanna K. Si vos plans changent, répondez à cet e-mail." /></label></section>
              <section className="admin-panel full-settings"><div className="settings-title"><Clock3 /><div><h3>Durées par défaut</h3><p>Utilisées pour calculer les créneaux disponibles</p></div></div><div className="duration-grid">{services.map((service) => <label key={service.id}><span>{service.name}</span><Input defaultValue={service.time} /></label>)}</div></section>
            </div>
            <Button className="primary-button save-settings" onClick={() => notify('Réglages enregistrés')}>Enregistrer les réglages</Button>
          </section>
        )}
      </main>

      <nav className="admin-mobile-nav">
        <AdminNav active={tab === 'overview'} icon={<LayoutDashboard />} label="Aperçu" onClick={() => setTab('overview')} />
        <AdminNav active={tab === 'calendar'} icon={<CalendarDays />} label="Agenda" onClick={() => setTab('calendar')} />
        <AdminNav active={tab === 'clients'} icon={<UsersRound />} label="Clientes" onClick={() => setTab('clients')} />
        <AdminNav active={tab === 'services'} icon={<Scissors />} label="Services" onClick={() => setTab('services')} />
        <AdminNav active={tab === 'settings'} icon={<Settings2 />} label="Plus" onClick={() => setTab('settings')} />
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
  return <div className="stock-bar"><div><strong>{name}</strong><span>{value}%</span></div><div className="bar"><span style={{ width: `${value}%` }} /></div><small>Consommation : {use}</small></div>
}

function BookingDialog({
  language,
  copy,
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
  setDrink,
  payment,
  setPayment,
  handPhoto,
  referencePhoto,
  setHandPhoto,
  setReferencePhoto,
  finish,
}: {
  language: Language
  copy: typeof ui.fr
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
  setDrink: (drink: string) => void
  payment: string
  setPayment: (payment: string) => void
  handPhoto: string | null
  referencePhoto: string | null
  setHandPhoto: (photo: string) => void
  setReferencePhoto: (photo: string) => void
  finish: () => void
}) {
  const service = services.find((item) => item.id === selectedService) ?? services[0]
  const total = service.price + extras.length * 500
  const currentPhotoInput = useRef<HTMLInputElement>(null)
  const referenceInput = useRef<HTMLInputElement>(null)
  const drinkLabel = drinkOptions.find((item) => item.id === drink)?.labels[language] ?? drinkOptions[0].labels[language]
  const paymentLabels: Record<string, string> = { card: copy.card, cash: copy.cash, transfer: copy.transfer }
  const extrasLabels: Record<string, string> = { removal: copy.removal, strengthening: copy.strengthening, nailArt: copy.nailArt }

  const loadPhoto = (event: React.ChangeEvent<HTMLInputElement>, setter: (photo: string) => void) => {
    const file = event.target.files?.[0]
    if (file) setter(URL.createObjectURL(file))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="booking-dialog">
        <div className="dialog-topline"><span>{copy.bookingTitle}</span><span>{step + 1} / 5</span></div>
        <div className="progress-line"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
        {step === 0 && (
          <>
            <DialogHeader><DialogTitle>{copy.selectService}</DialogTitle><DialogDescription>{copy.serviceHelp}</DialogDescription></DialogHeader>
            <div className="booking-service-list">{services.map((item) => <button key={item.id} className={selectedService === item.id ? 'selected' : ''} onClick={() => setSelectedService(item.id)}><span>{item.accent}</span><div><strong>{serviceNames[language][item.id]}</strong><small>{item.time} · {item.price.toLocaleString('fr-FR')} ₽</small></div>{selectedService === item.id && <Check />}</button>)}</div>
            <div className="extras-select"><span>{copy.addOns}</span>{['removal', 'strengthening', 'nailArt'].map((extra) => <button className={extras.includes(extra) ? 'selected' : ''} onClick={() => toggleExtra(extra)} key={extra}>{extras.includes(extra) ? <Check /> : <Plus />}{extrasLabels[extra]}<small>+500 ₽</small></button>)}</div>
            <Button className="primary-button booking-next" onClick={() => setStep(1)}>{copy.next} <ArrowRight /></Button>
          </>
        )}
        {step === 1 && (
          <>
            <DialogHeader><DialogTitle>{copy.photoTitle}</DialogTitle><DialogDescription>{copy.photoHelp}</DialogDescription></DialogHeader>
            <div className="booking-photo-grid">
              <UploadCard title={copy.currentPhoto} subtitle={copy.currentPhotoHint} preview={handPhoto} onClick={() => currentPhotoInput.current?.click()} icon={<Camera />} addedLabel={copy.uploadAdded} replaceLabel={copy.replace} />
              <UploadCard title={copy.referencePhoto} subtitle={copy.referencePhotoHint} preview={referencePhoto} onClick={() => referenceInput.current?.click()} icon={<ImagesIcon />} addedLabel={copy.uploadAdded} replaceLabel={copy.replace} />
            </div>
            <input ref={currentPhotoInput} hidden type="file" accept="image/*" capture="environment" onChange={(event) => loadPhoto(event, setHandPhoto)} />
            <input ref={referenceInput} hidden type="file" accept="image/*" onChange={(event) => loadPhoto(event, setReferencePhoto)} />
            <button className="skip-link" onClick={() => setStep(2)}>{copy.skip}</button>
            <div className="dialog-actions"><Button variant="ghost" onClick={() => setStep(0)}><ChevronLeft />{copy.back}</Button><Button className="primary-button" onClick={() => setStep(2)}>{copy.next} <ArrowRight /></Button></div>
          </>
        )}
        {step === 2 && (
          <>
            <DialogHeader><DialogTitle>{copy.drinkTitle}</DialogTitle><DialogDescription>{copy.drinkHelp}</DialogDescription></DialogHeader>
            <div className="drink-grid">
              {drinkOptions.map((item) => <button key={item.id} className={drink === item.id ? 'selected' : ''} onClick={() => setDrink(item.id)}><img src={item.image} alt="" /><span>{item.labels[language]}</span>{drink === item.id && <Check />}</button>)}
            </div>
            <div className="dialog-actions"><Button variant="ghost" onClick={() => setStep(1)}><ChevronLeft />{copy.back}</Button><Button className="primary-button" onClick={() => setStep(3)}>{copy.next} <ArrowRight /></Button></div>
          </>
        )}
        {step === 3 && (
          <>
            <DialogHeader><DialogTitle>{copy.paymentTitle}</DialogTitle><DialogDescription>{copy.paymentHelp}</DialogDescription></DialogHeader>
            <div className="date-strip">{['27 dim', '28 lun', '29 mar', '30 mer'].map((date, index) => <button className={index === 1 ? 'selected' : ''} key={date}><strong>{date.split(' ')[0]}</strong><span>{date.split(' ')[1]}</span></button>)}</div>
            <div className="time-grid">{['10:00', '12:30', '15:00', '17:30'].map((time) => <button className={selectedTime === time ? 'selected' : ''} key={time} onClick={() => setSelectedTime(time)}>{time}<small>{service.time}</small></button>)}</div>
            <div className="payment-grid">
              {[['card', copy.card], ['cash', copy.cash], ['transfer', copy.transfer]].map(([id, label]) => <button key={id} className={payment === id ? 'selected' : ''} onClick={() => setPayment(id)}><CreditCard /><span>{label}</span>{payment === id && <Check />}</button>)}
            </div>
            <div className="dialog-actions"><Button variant="ghost" onClick={() => setStep(2)}><ChevronLeft />{copy.back}</Button><Button className="primary-button" onClick={() => setStep(4)}>{copy.next} <ArrowRight /></Button></div>
          </>
        )}
        {step === 4 && (
          <>
            <DialogHeader><div className="confirmation-icon"><Check /></div><DialogTitle>{copy.confirmTitle}</DialogTitle><DialogDescription>{copy.confirmHelp}</DialogDescription></DialogHeader>
            <div className="booking-summary">
              <div><span>{copy.service}</span><strong>{serviceNames[language][service.id]}</strong></div>
              <div><span>{copy.when}</span><strong>28 septembre · {selectedTime}</strong></div>
              <div><span>{copy.photos}</span><strong>{handPhoto || referencePhoto ? `${Number(Boolean(handPhoto)) + Number(Boolean(referencePhoto))}` : copy.noPhotos}</strong></div>
              <div><span>{copy.drink}</span><strong>{drinkLabel}</strong></div>
              <div><span>{copy.payment}</span><strong>{paymentLabels[payment]}</strong></div>
              <div><span>{copy.extras}</span><strong>{extras.length ? extras.map((item) => extrasLabels[item]).join(', ') : copy.none}</strong></div>
              <div className="summary-total"><span>{copy.total}</span><strong>{total.toLocaleString('fr-FR')} ₽</strong></div>
            </div>
            <Button className="primary-button booking-confirm" onClick={finish}>{copy.confirm} <Check /></Button>
            <button className="back-link" onClick={() => setStep(3)}>{copy.edit}</button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
