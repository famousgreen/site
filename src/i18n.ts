export type Lang = 'fr' | 'en' | 'uk' | 'ru'
export type ShootType = 'portrait' | 'wedding' | 'commercial'

export const LANGS: Array<{ id: Lang; short: string; name: string }> = [
  { id: 'fr', short: 'FR', name: 'Français' },
  { id: 'en', short: 'EN', name: 'English' },
  { id: 'uk', short: 'УКР', name: 'Українська' },
  { id: 'ru', short: 'РУС', name: 'Русский' },
]

export const STORAGE_KEY = 'hc-lang'

const isLang = (value: string | null): value is Lang =>
  value === 'fr' || value === 'en' || value === 'uk' || value === 'ru'

export function detectLanguage(): Lang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    // storage can be blocked; fall back to browser locale
  }
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const locale of preferred) {
    const code = String(locale).toLowerCase().split('-')[0]
    if (isLang(code)) return code
  }
  return 'en'
}

export function saveLanguage(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // ignore blocked storage
  }
}

type ShootCopy = { name: string; short: string; desc: string }

export type Dict = {
  title: string
  description: string
  skip: string
  langLabel: string
  nav: { work: string; book: string }
  menu: { open: string; close: string }
  hero: {
    role: string
    place: string
    year: string
    manifest: string
    cta: string
    alts: [string, string, string, string]
  }
  workLabel: string
  shoots: Record<ShootType, ShootCopy>
  closing: { title: string; cta: string }
  footer: { rights: string }
  modal: {
    eyebrow: string
    title: string
    subtitle: string
    name: string
    namePh: string
    type: string
    reply: string
    date: string
    send: string
    sending: string
    consent: string
    error: string
    successEyebrow: string
    successTitle: string
    back: string
    close: string
  }
}

export const dictionary: Record<Lang, Dict> = {
  fr: {
    title: 'Hanna Chauvat — photographe, Paris et Normandie',
    description: 'Portfolio de Hanna Chauvat, photographe à Paris et en Normandie : portrait, mariage, commercial.',
    skip: 'Aller au contenu',
    langLabel: 'Langue',
    nav: { work: 'Travaux', book: 'Réserver' },
    menu: { open: 'Ouvrir le menu', close: 'Fermer le menu' },
    hero: {
      role: 'Photographe',
      place: 'Paris / Normandie',
      year: 'Portfolio 2027',
      manifest: 'Des images sincères de personnes, d’amour et de marques.',
      cta: 'Réserver une séance',
      alts: [
        'Portrait dans une rue haussmannienne à Paris',
        'Promenade au bord de la Seine dans la brume du matin',
        'Flacon de parfum rouge sur une roche de Normandie',
        'Couple de mariés face aux falaises d’Étretat',
      ],
    },
    workLabel: 'Séances',
    shoots: {
      portrait: {
        name: 'Séance portrait',
        short: 'Portrait',
        desc: 'Une balade en ville, photographiée à votre rythme. Deux heures et un parcours choisi ensemble.',
      },
      wedding: {
        name: 'Mariage',
        short: 'Mariage',
        desc: 'Du matin tranquille à la dernière danse, raconté comme une seule histoire vivante.',
      },
      commercial: {
        name: 'Commercial',
        short: 'Commercial',
        desc: 'Campagnes, produits et personnes pour les marques qui veulent une voix visuelle claire.',
      },
    },
    closing: { title: 'L’histoire a déjà commencé. Gardons-la.', cta: 'Réserver une séance' },
    footer: { rights: '© 2027 Hanna Chauvat' },
    modal: {
      eyebrow: 'Réservation',
      title: 'Parlez-moi de votre séance',
      subtitle: 'Je réponds en général sous un jour ouvré',
      name: 'Votre nom',
      namePh: 'Nom et prénom',
      type: 'Type de séance',
      reply: 'Où puis-je vous répondre ?',
      date: 'Date souhaitée',
      send: 'Envoyer la demande',
      sending: 'Envoi…',
      consent: 'En envoyant, vous acceptez l’utilisation de vos données pour répondre à cette demande',
      error: 'Envoi impossible. Écrivez directement à hello@hannachauvat.fr',
      successEyebrow: 'Demande envoyée',
      successTitle: 'Je vous contacterai pour discuter des détails',
      back: 'Retour au site',
      close: 'Fermer',
    },
  },
  en: {
    title: 'Hanna Chauvat — photographer, Paris and Normandy',
    description: 'Portfolio of Hanna Chauvat, photographer in Paris and Normandy: portrait, wedding, commercial.',
    skip: 'Skip to content',
    langLabel: 'Language',
    nav: { work: 'Work', book: 'Book' },
    menu: { open: 'Open menu', close: 'Close menu' },
    hero: {
      role: 'Photographer',
      place: 'Paris / Normandy',
      year: 'Portfolio 2027',
      manifest: 'Honest images of people, love and brands.',
      cta: 'Book a shoot',
      alts: [
        'Portrait on a Haussmann street in Paris',
        'A walk along the Seine in the morning haze',
        'Red perfume bottle on a Normandy rock',
        'Newlyweds facing the cliffs of Étretat',
      ],
    },
    workLabel: 'Shoots',
    shoots: {
      portrait: {
        name: 'Portrait session',
        short: 'Portrait',
        desc: 'A walk through the city, shot at your pace. Two hours and a route we choose together.',
      },
      wedding: {
        name: 'Wedding',
        short: 'Wedding',
        desc: 'From the quiet morning to the last dance, told as one living story.',
      },
      commercial: {
        name: 'Commercial',
        short: 'Commercial',
        desc: 'Campaigns, products and people for brands that want a clear visual voice.',
      },
    },
    closing: { title: 'The story is already happening. Let’s keep it.', cta: 'Book a shoot' },
    footer: { rights: '© 2027 Hanna Chauvat' },
    modal: {
      eyebrow: 'Booking',
      title: 'Tell me about your shoot',
      subtitle: 'I usually reply within one working day',
      name: 'Your name',
      namePh: 'Full name',
      type: 'Shoot type',
      reply: 'Where should I reply?',
      date: 'Preferred date',
      send: 'Send request',
      sending: 'Sending…',
      consent: 'By sending, you agree to the use of your data to reply to this request',
      error: 'Could not send the request. Write directly to hello@hannachauvat.fr',
      successEyebrow: 'Request sent',
      successTitle: 'I will contact you to discuss the details',
      back: 'Back to the site',
      close: 'Close',
    },
  },
  uk: {
    title: 'Hanna Chauvat — фотограф, Париж і Нормандія',
    description: 'Портфоліо Hanna Chauvat, фотографа в Парижі та Нормандії: портрет, весілля, комерційна зйомка.',
    skip: 'Перейти до вмісту',
    langLabel: 'Мова',
    nav: { work: 'Роботи', book: 'Забронювати' },
    menu: { open: 'Відкрити меню', close: 'Закрити меню' },
    hero: {
      role: 'Фотограф',
      place: 'Париж / Нормандія',
      year: 'Портфоліо 2027',
      manifest: 'Щирі кадри про людей, кохання та бренди.',
      cta: 'Забронювати зйомку',
      alts: [
        'Портрет на паризькій вулиці',
        'Прогулянка набережною Сени в ранковому серпанку',
        'Червоний флакон парфумів на нормандському камені',
        'Наречені перед скелями Етрета',
      ],
    },
    workLabel: 'Зйомки',
    shoots: {
      portrait: {
        name: 'Звичайна зйомка',
        short: 'Звичайна',
        desc: 'Прогулянка містом у вашому ритмі. Дві години й маршрут, який ми обираємо разом.',
      },
      wedding: {
        name: 'Весільна зйомка',
        short: 'Весільна',
        desc: 'Від тихого ранку до останнього танцю — як одна жива історія.',
      },
      commercial: {
        name: 'Комерційна зйомка',
        short: 'Комерційна',
        desc: 'Кампанії, продукти й люди для брендів, яким потрібен чіткий візуальний голос.',
      },
    },
    closing: { title: 'Історія вже відбувається. Збережімо її.', cta: 'Забронювати зйомку' },
    footer: { rights: '© 2027 Hanna Chauvat' },
    modal: {
      eyebrow: 'Бронювання',
      title: 'Розкажіть про вашу зйомку',
      subtitle: 'Зазвичай відповідаю протягом одного робочого дня',
      name: 'Ваше імʼя',
      namePh: 'Імʼя та прізвище',
      type: 'Тип зйомки',
      reply: 'Де вам зручно отримати відповідь?',
      date: 'Бажана дата',
      send: 'Надіслати заявку',
      sending: 'Надсилаю…',
      consent: 'Надсилаючи, ви погоджуєтеся на обробку даних для відповіді на заявку',
      error: 'Не вдалося надіслати заявку. Напишіть напряму на hello@hannachauvat.fr',
      successEyebrow: 'Заявку надіслано',
      successTitle: 'Я зв’яжуся з вами, щоб обговорити деталі',
      back: 'Повернутися на сайт',
      close: 'Закрити',
    },
  },
  ru: {
    title: 'Hanna Chauvat — фотограф, Париж и Нормандия',
    description: 'Портфолио Hanna Chauvat, фотографа в Париже и Нормандии: портрет, свадьба, коммерческая съёмка.',
    skip: 'Перейти к содержимому',
    langLabel: 'Язык',
    nav: { work: 'Работы', book: 'Забронировать' },
    menu: { open: 'Открыть меню', close: 'Закрыть меню' },
    hero: {
      role: 'Фотограф',
      place: 'Париж / Нормандия',
      year: 'Портфолио 2027',
      manifest: 'Честные кадры о людях, любви и брендах.',
      cta: 'Забронировать съёмку',
      alts: [
        'Портрет на парижской улице',
        'Прогулка по набережной Сены в утренней дымке',
        'Красный флакон духов на нормандском камне',
        'Молодожёны перед скалами Этрета',
      ],
    },
    workLabel: 'Съёмки',
    shoots: {
      portrait: {
        name: 'Обычная съёмка',
        short: 'Обычная',
        desc: 'Прогулка по городу в вашем ритме. Два часа и маршрут, который мы выбираем вместе.',
      },
      wedding: {
        name: 'Свадебная съёмка',
        short: 'Свадебная',
        desc: 'От тихого утра до последнего танца — как одна живая история.',
      },
      commercial: {
        name: 'Коммерческая съёмка',
        short: 'Коммерческая',
        desc: 'Кампании, предметы и люди для брендов, которым нужен чёткий визуальный голос.',
      },
    },
    closing: { title: 'История уже происходит. Давайте её сохраним.', cta: 'Забронировать съёмку' },
    footer: { rights: '© 2027 Hanna Chauvat' },
    modal: {
      eyebrow: 'Бронирование',
      title: 'Расскажите о вашей съёмке',
      subtitle: 'Обычно отвечаю в течение одного рабочего дня',
      name: 'Ваше имя',
      namePh: 'Имя и фамилия',
      type: 'Тип съёмки',
      reply: 'Где вам удобно получить ответ?',
      date: 'Желаемая дата',
      send: 'Отправить заявку',
      sending: 'Отправляю…',
      consent: 'Отправляя, вы соглашаетесь на обработку данных для ответа на заявку',
      error: 'Не удалось отправить заявку. Напишите напрямую на hello@hannachauvat.fr',
      successEyebrow: 'Заявка отправлена',
      successTitle: 'Я свяжусь с вами, чтобы обсудить детали',
      back: 'Вернуться на сайт',
      close: 'Закрыть',
    },
  },
}
