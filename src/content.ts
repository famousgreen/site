import type { Lang, ShootType } from './i18n'

export type CaseId = 'seine' | 'etretat' | 'rouge' | 'orsay'

type CaseCopy = {
  category: string
  location: string
  context: string
  result: string
  deliverable: string
}

type ShootPanel = { outcome: string; details: [string, string, string]; cta: string }

export type Extra = {
  nav: { about: string; cases: string; shoots: string }
  about: {
    label: string
    title: string
    lead: string
    paragraphs: [string, string]
    alt: string
    geoLabel: string
    geo: [{ place: string; text: string }, { place: string; text: string }]
    factsLabel: string
    facts: [string, string, string, string]
    factLabels: [string, string, string, string]
    pressLabel: string
    cta: string
  }
  cases: {
    label: string
    title: string
    open: string
    year: string
    category: string
    location: string
    context: string
    result: string
    deliverable: string
  }
  caseItems: Record<CaseId, CaseCopy>
  shoots: {
    title: string
    outcomeLabel: string
    detailsLabel: string
    ribbonLabel: (name: string) => string
    ribbonHint: string
    prev: string
    next: string
    photoAlt: (name: string, n: number, total: number) => string
    panels: Record<ShootType, ShootPanel>
  }
  viewer: {
    close: string
    back: string
    prev: string
    next: string
    book: string
    label: (name: string) => string
    counter: (n: number, total: number) => string
    photoAlt: (name: string, n: number) => string
    collage: string
  }
}

export const caseMeta: Array<{ id: CaseId; title: string; year: string; cover: string; coverPosition: string }> = [
  { id: 'seine', title: 'Seine, Slowly', year: '2027', cover: '/images/portfolio/portrait-paris.jpg', coverPosition: '50% 35%' },
  { id: 'etretat', title: 'Étretat, Late September', year: '2027', cover: '/images/portfolio/normandy-coast.jpg', coverPosition: '50% 55%' },
  { id: 'rouge', title: 'Maison Rouge', year: '2025', cover: '/images/portfolio/commercial-still.jpg', coverPosition: '50% 50%' },
  { id: 'orsay', title: 'Quai Nº 7', year: '2024', cover: '/images/portfolio/paris-dusk.jpg', coverPosition: '50% 40%' },
]

export const caseImages: Record<CaseId, Array<{ src: string; position: string }>> = {
  seine: [
    { src: '/images/portfolio/portrait-paris.jpg', position: '50% 30%' },
    { src: '/images/portfolio/hero-paris.jpg', position: '60% 50%' },
    { src: '/images/portfolio/paris-dusk.jpg', position: '50% 70%' },
    { src: '/images/portfolio/portrait-paris.jpg', position: '40% 85%' },
    { src: '/images/portfolio/about-hanna.jpg', position: '50% 30%' },
  ],
  etretat: [
    { src: '/images/portfolio/normandy-coast.jpg', position: '50% 50%' },
    { src: '/images/portfolio/wedding-normandy.jpg', position: '40% 50%' },
    { src: '/images/portfolio/wedding-detail.jpg', position: '50% 50%' },
    { src: '/images/portfolio/wedding-normandy.jpg', position: '85% 60%' },
    { src: '/images/portfolio/normandy-coast.jpg', position: '10% 60%' },
  ],
  rouge: [
    { src: '/images/portfolio/commercial-still.jpg', position: '50% 50%' },
    { src: '/images/portfolio/commercial-france.jpg', position: '50% 50%' },
    { src: '/images/portfolio/commercial-still.jpg', position: '90% 40%' },
    { src: '/images/portfolio/commercial-france.jpg', position: '70% 75%' },
    { src: '/images/portfolio/normandy-coast.jpg', position: '85% 40%' },
  ],
  orsay: [
    { src: '/images/portfolio/paris-dusk.jpg', position: '50% 40%' },
    { src: '/images/portfolio/hero-paris.jpg', position: '70% 30%' },
    { src: '/images/portfolio/paris-dusk.jpg', position: '50% 90%' },
    { src: '/images/portfolio/portrait-paris.jpg', position: '60% 60%' },
    { src: '/images/portfolio/hero-paris.jpg', position: '20% 50%' },
  ],
}

export const shootRibbons: Record<ShootType, Array<{ src: string; position: string; ratio: string }>> = {
  portrait: [
    { src: '/images/portfolio/portrait-paris.jpg', position: '50% 35%', ratio: '3 / 4' },
    { src: '/images/portfolio/hero-paris.jpg', position: '60% 50%', ratio: '4 / 5' },
    { src: '/images/portfolio/paris-dusk.jpg', position: '50% 45%', ratio: '2 / 3' },
    { src: '/images/portfolio/about-hanna.jpg', position: '50% 30%', ratio: '1 / 1' },
    { src: '/images/portfolio/portrait-paris.jpg', position: '40% 80%', ratio: '4 / 3' },
  ],
  wedding: [
    { src: '/images/portfolio/wedding-normandy.jpg', position: '40% 50%', ratio: '4 / 5' },
    { src: '/images/portfolio/wedding-detail.jpg', position: '50% 50%', ratio: '4 / 3' },
    { src: '/images/portfolio/normandy-coast.jpg', position: '50% 55%', ratio: '16 / 10' },
    { src: '/images/portfolio/wedding-normandy.jpg', position: '85% 60%', ratio: '3 / 4' },
    { src: '/images/portfolio/wedding-detail.jpg', position: '20% 60%', ratio: '1 / 1' },
  ],
  commercial: [
    { src: '/images/portfolio/commercial-france.jpg', position: '50% 50%', ratio: '4 / 5' },
    { src: '/images/portfolio/commercial-still.jpg', position: '50% 50%', ratio: '4 / 3' },
    { src: '/images/portfolio/commercial-still.jpg', position: '95% 40%', ratio: '3 / 4' },
    { src: '/images/portfolio/commercial-france.jpg', position: '70% 75%', ratio: '1 / 1' },
    { src: '/images/portfolio/paris-dusk.jpg', position: '50% 30%', ratio: '2 / 3' },
  ],
}

export const press = ['Cahiers de Lumière — 2025', 'Atelier Revue — 2025', 'Normandie Mariage — 2024', 'Paris Noir & Blanc — 2023']

export const slugs: CaseId[] = caseMeta.map((item) => item.id)

export const extra: Record<Lang, Extra> = {
  en: {
    nav: { about: 'About', cases: 'Cases', shoots: 'Shoots' },
    about: {
      label: 'About',
      title: 'I photograph how people actually look when they stop performing.',
      lead: 'Born in Normandy, working between Paris and the Channel coast for nine years.',
      paragraphs: [
        'I started with a borrowed film camera on the quays of Rouen. Today I work with couples, brands and private clients who want pictures that feel calm, precise and a little unguarded.',
        'Every shoot begins with a conversation and a route. We choose light, places and pace together, so that on the day you are a person walking through a city, not a model on a set.',
      ],
      alt: 'Portrait of photographer Hanna Chauvat with a film camera',
      geoLabel: 'Geography',
      geo: [
        { place: 'Paris', text: 'Studio, streets and quays. Portraits, lookbooks, campaigns.' },
        { place: 'Normandy', text: 'Étretat, Honfleur, farmhouses. Weddings and quiet commissions.' },
      ],
      factsLabel: 'In numbers',
      facts: ['9', '140+', '2', '35'],
      factLabels: ['years behind the camera', 'weddings and sessions', 'bases: Paris and Normandy', 'brand projects'],
      pressLabel: 'Selected publications',
      cta: 'Book a conversation',
    },
    cases: {
      label: 'Cases',
      title: 'Selected projects',
      open: 'Open project',
      year: 'Year',
      category: 'Category',
      location: 'Location',
      context: 'Context',
      result: 'Result',
      deliverable: 'Delivered',
    },
    caseItems: {
      seine: {
        category: 'Portrait / editorial',
        location: 'Paris, France',
        context: 'A private client wanted to be photographed in her own city, without a studio and without posing.',
        result: 'Forty frames across two hours, a series she printed for her home and reused for a magazine feature.',
        deliverable: '40 retouched images, 6 prints',
      },
      etretat: {
        category: 'Wedding',
        location: 'Étretat, Normandy',
        context: 'A small September wedding on the cliffs with twenty guests and one hour of usable light.',
        result: 'A calm story from morning to dusk, published in a regional wedding magazine.',
        deliverable: '320 images, a 30-page album',
      },
      rouge: {
        category: 'Commercial / product',
        location: 'Paris and Normandy',
        context: 'An independent fragrance house needed a launch campaign that felt rooted in place, not in a studio.',
        result: 'One visual language for the website, packaging and social; the launch sold out in three weeks.',
        deliverable: '24 campaign images, short motion loops',
      },
      orsay: {
        category: 'Fashion / lookbook',
        location: 'Paris, quai de la Seine',
        context: 'A young label asked for a lookbook shot at dusk, on foot, with a team of three.',
        result: 'A lookbook that kept the label’s first collection in stores and press for the whole season.',
        deliverable: '30 images, cover and press selects',
      },
    },
    shoots: {
      title: 'Shoots',
      outcomeLabel: 'What you receive',
      detailsLabel: 'Details',
      ribbonLabel: (name) => `${name} examples, scroll horizontally`,
      ribbonHint: 'Drag, swipe or use the arrow keys',
      prev: 'Previous photos',
      next: 'Next photos',
      photoAlt: (name, n, total) => `${name}, photo ${n} of ${total}`,
      panels: {
        portrait: {
          outcome: 'A set of natural portraits that look like you on your best, calmest day, ready for print, profile and portfolio.',
          details: ['2 hours, a route chosen together', '30–40 retouched images', 'Delivery within 7 days'],
          cta: 'Book a portrait session',
        },
        wedding: {
          outcome: 'The whole day told as one story, so that years later you remember how it felt, not only how it looked.',
          details: ['Half or full day coverage', '300+ images and an optional album', 'Preview in 48 hours'],
          cta: 'Ask about your wedding date',
        },
        commercial: {
          outcome: 'A consistent set of images that gives your brand a recognisable voice across web, print and social.',
          details: ['Brief, moodboard and shot list', 'Licensed for web, print and social', 'Studio or on location'],
          cta: 'Discuss a project',
        },
      },
    },
    viewer: {
      close: 'Close project',
      back: 'Back to cases',
      prev: 'Previous project',
      next: 'Next project',
      book: 'Book a similar shoot',
      label: (name) => `Project: ${name}`,
      counter: (n, total) => `${n} / ${total}`,
      photoAlt: (name, n) => `${name}, frame ${n}`,
      collage: 'Photo collage',
    },
  },
  fr: {
    nav: { about: 'À propos', cases: 'Projets', shoots: 'Séances' },
    about: {
      label: 'À propos',
      title: 'Je photographie les gens tels qu’ils sont quand ils cessent de jouer un rôle.',
      lead: 'Née en Normandie, je travaille depuis neuf ans entre Paris et la côte de la Manche.',
      paragraphs: [
        'J’ai commencé avec un appareil argentique emprunté sur les quais de Rouen. Aujourd’hui je travaille avec des couples, des marques et des particuliers qui veulent des images calmes, précises et un peu spontanées.',
        'Chaque séance commence par une conversation et un itinéraire. Nous choisissons ensemble la lumière, les lieux et le rythme, pour que vous soyez une personne qui marche dans une ville, pas un modèle sur un plateau.',
      ],
      alt: 'Portrait de la photographe Hanna Chauvat avec un appareil argentique',
      geoLabel: 'Géographie',
      geo: [
        { place: 'Paris', text: 'Studio, rues et quais. Portraits, lookbooks, campagnes.' },
        { place: 'Normandie', text: 'Étretat, Honfleur, fermes. Mariages et commandes intimes.' },
      ],
      factsLabel: 'En chiffres',
      facts: ['9', '140+', '2', '35'],
      factLabels: ['ans derrière l’objectif', 'mariages et séances', 'bases : Paris et Normandie', 'projets de marque'],
      pressLabel: 'Publications choisies',
      cta: 'Prendre rendez-vous',
    },
    cases: {
      label: 'Projets',
      title: 'Projets choisis',
      open: 'Ouvrir le projet',
      year: 'Année',
      category: 'Catégorie',
      location: 'Lieu',
      context: 'Contexte',
      result: 'Résultat',
      deliverable: 'Livré',
    },
    caseItems: {
      seine: {
        category: 'Portrait / éditorial',
        location: 'Paris, France',
        context: 'Une cliente souhaitait être photographiée dans sa propre ville, sans studio et sans poser.',
        result: 'Quarante images en deux heures, une série qu’elle a imprimée chez elle puis reprise pour un magazine.',
        deliverable: '40 images retouchées, 6 tirages',
      },
      etretat: {
        category: 'Mariage',
        location: 'Étretat, Normandie',
        context: 'Un petit mariage de septembre sur les falaises, vingt invités et une heure de bonne lumière.',
        result: 'Une histoire calme du matin au crépuscule, publiée dans un magazine régional de mariage.',
        deliverable: '320 images, un album de 30 pages',
      },
      rouge: {
        category: 'Commercial / produit',
        location: 'Paris et Normandie',
        context: 'Une maison de parfum indépendante voulait une campagne de lancement ancrée dans un lieu, pas dans un studio.',
        result: 'Un seul langage visuel pour le site, l’emballage et les réseaux ; le lancement s’est écoulé en trois semaines.',
        deliverable: '24 images de campagne, courtes boucles vidéo',
      },
      orsay: {
        category: 'Mode / lookbook',
        location: 'Paris, quai de la Seine',
        context: 'Une jeune marque voulait un lookbook au crépuscule, à pied, avec une équipe de trois personnes.',
        result: 'Un lookbook qui a porté la première collection en boutique et dans la presse toute la saison.',
        deliverable: '30 images, couverture et sélection presse',
      },
    },
    shoots: {
      title: 'Séances',
      outcomeLabel: 'Ce que vous recevez',
      detailsLabel: 'Détails',
      ribbonLabel: (name) => `Exemples ${name}, défilement horizontal`,
      ribbonHint: 'Glissez, balayez ou utilisez les flèches',
      prev: 'Photos précédentes',
      next: 'Photos suivantes',
      photoAlt: (name, n, total) => `${name}, photo ${n} sur ${total}`,
      panels: {
        portrait: {
          outcome: 'Une série de portraits naturels où vous êtes à votre meilleur, prête pour l’impression, les profils et le portfolio.',
          details: ['2 heures, itinéraire choisi ensemble', '30 à 40 images retouchées', 'Livraison sous 7 jours'],
          cta: 'Réserver une séance portrait',
        },
        wedding: {
          outcome: 'Toute la journée racontée comme une seule histoire, pour se souvenir plus tard de ce que vous avez ressenti, pas seulement de ce que vous avez vu.',
          details: ['Demi-journée ou journée entière', 'Plus de 300 images et album en option', 'Aperçu sous 48 heures'],
          cta: 'Demander votre date de mariage',
        },
        commercial: {
          outcome: 'Un ensemble d’images cohérent qui donne à votre marque une voix reconnaissable sur le web, l’impression et les réseaux.',
          details: ['Brief, moodboard et shot list', 'Droits web, print et réseaux', 'Studio ou en extérieur'],
          cta: 'Discuter d’un projet',
        },
      },
    },
    viewer: {
      close: 'Fermer le projet',
      back: 'Retour aux projets',
      prev: 'Projet précédent',
      next: 'Projet suivant',
      book: 'Réserver une séance similaire',
      label: (name) => `Projet : ${name}`,
      counter: (n, total) => `${n} / ${total}`,
      photoAlt: (name, n) => `${name}, image ${n}`,
      collage: 'Collage de photos',
    },
  },
  uk: {
    nav: { about: 'Про мене', cases: 'Проєкти', shoots: 'Зйомки' },
    about: {
      label: 'Про мене',
      title: 'Я фотографую людей такими, якими вони стають, коли перестають грати роль.',
      lead: 'Народилася в Нормандії, дев’ять років працюю між Парижем і узбережжям Ла-Маншу.',
      paragraphs: [
        'Я почала з позиченої плівкової камери на набережних Руана. Сьогодні працюю з парами, брендами та приватними клієнтами, яким потрібні спокійні, точні й трохи невимушені кадри.',
        'Кожна зйомка починається з розмови та маршруту. Разом обираємо світло, місця й темп, щоб у кадрі ви були людиною, що йде містом, а не моделлю на майданчику.',
      ],
      alt: 'Портрет фотографині Hanna Chauvat із плівковою камерою',
      geoLabel: 'Географія',
      geo: [
        { place: 'Париж', text: 'Студія, вулиці й набережні. Портрети, лукбуки, кампанії.' },
        { place: 'Нормандія', text: 'Етрета, Онфлер, ферми. Весілля й камерні замовлення.' },
      ],
      factsLabel: 'У цифрах',
      facts: ['9', '140+', '2', '35'],
      factLabels: ['років за камерою', 'весіль і зйомок', 'бази: Париж і Нормандія', 'проєктів для брендів'],
      pressLabel: 'Обрані публікації',
      cta: 'Обговорити зйомку',
    },
    cases: {
      label: 'Проєкти',
      title: 'Обрані проєкти',
      open: 'Відкрити проєкт',
      year: 'Рік',
      category: 'Категорія',
      location: 'Локація',
      context: 'Контекст',
      result: 'Результат',
      deliverable: 'Передано',
    },
    caseItems: {
      seine: {
        category: 'Портрет / editorial',
        location: 'Париж, Франція',
        context: 'Клієнтка хотіла зйомку у власному місті, без студії та без постановочних поз.',
        result: 'Сорок кадрів за дві години, серія, яку вона роздрукувала вдома й використала для журналу.',
        deliverable: '40 оброблених фото, 6 принтів',
      },
      etretat: {
        category: 'Весілля',
        location: 'Етрета, Нормандія',
        context: 'Невелике вересневе весілля на скелях: двадцять гостей і година придатного світла.',
        result: 'Спокійна історія від ранку до сутінків, опублікована в регіональному весільному журналі.',
        deliverable: '320 фото, альбом на 30 сторінок',
      },
      rouge: {
        category: 'Комерційна / продукт',
        location: 'Париж і Нормандія',
        context: 'Незалежному парфумерному дому потрібна кампанія запуску, що пахне місцем, а не студією.',
        result: 'Єдина візуальна мова для сайту, упаковки й соцмереж; запуск розпродали за три тижні.',
        deliverable: '24 кадри кампанії, короткі відеолуп',
      },
      orsay: {
        category: 'Мода / лукбук',
        location: 'Париж, набережна Сени',
        context: 'Молодий бренд замовив лукбук у сутінках, пішки, командою з трьох людей.',
        result: 'Лукбук, який підтримав першу колекцію в магазинах і пресі протягом усього сезону.',
        deliverable: '30 фото, обкладинка й добірка для преси',
      },
    },
    shoots: {
      title: 'Зйомки',
      outcomeLabel: 'Що ви отримаєте',
      detailsLabel: 'Деталі',
      ribbonLabel: (name) => `Приклади: ${name}, горизонтальне прокручування`,
      ribbonHint: 'Перетягніть, свайпніть або користуйтеся стрілками',
      prev: 'Попередні фото',
      next: 'Наступні фото',
      photoAlt: (name, n, total) => `${name}, фото ${n} з ${total}`,
      panels: {
        portrait: {
          outcome: 'Серія природних портретів, де ви найспокійніші й найкращі, готова для друку, профілів і портфоліо.',
          details: ['2 години, маршрут обираємо разом', '30–40 оброблених фото', 'Передача протягом 7 днів'],
          cta: 'Забронювати портретну зйомку',
        },
        wedding: {
          outcome: 'Весь день як одна історія, щоб через роки ви згадували, що відчували, а не лише як усе виглядало.',
          details: ['Півдня або цілий день', '300+ фото та альбом за бажанням', 'Прев’ю за 48 годин'],
          cta: 'Запитати про дату весілля',
        },
        commercial: {
          outcome: 'Цілісний набір зображень, що дає бренду впізнаваний голос в інтернеті, друці та соцмережах.',
          details: ['Бриф, мудборд і шотліст', 'Ліцензія: веб, друк, соцмережі', 'Студія або локація'],
          cta: 'Обговорити проєкт',
        },
      },
    },
    viewer: {
      close: 'Закрити проєкт',
      back: 'Назад до проєктів',
      prev: 'Попередній проєкт',
      next: 'Наступний проєкт',
      book: 'Забронювати схожу зйомку',
      label: (name) => `Проєкт: ${name}`,
      counter: (n, total) => `${n} / ${total}`,
      photoAlt: (name, n) => `${name}, кадр ${n}`,
      collage: 'Колаж фото',
    },
  },
  ru: {
    nav: { about: 'Обо мне', cases: 'Проекты', shoots: 'Съёмки' },
    about: {
      label: 'Обо мне',
      title: 'Я снимаю людей такими, какими они становятся, когда перестают играть роль.',
      lead: 'Родилась в Нормандии, девять лет работаю между Парижем и побережьем Ла-Манша.',
      paragraphs: [
        'Я начала с одолженной плёночной камеры на набережных Руана. Сегодня работаю с парами, брендами и частными клиентами, которым нужны спокойные, точные и чуть непринуждённые кадры.',
        'Каждая съёмка начинается с разговора и маршрута. Вместе выбираем свет, места и темп, чтобы в кадре вы были человеком, идущим по городу, а не моделью на площадке.',
      ],
      alt: 'Портрет фотографа Hanna Chauvat с плёночной камерой',
      geoLabel: 'География',
      geo: [
        { place: 'Париж', text: 'Студия, улицы и набережные. Портреты, лукбуки, кампании.' },
        { place: 'Нормандия', text: 'Этрета, Онфлёр, фермы. Свадьбы и камерные заказы.' },
      ],
      factsLabel: 'В цифрах',
      facts: ['9', '140+', '2', '35'],
      factLabels: ['лет за камерой', 'свадеб и съёмок', 'базы: Париж и Нормандия', 'проектов для брендов'],
      pressLabel: 'Избранные публикации',
      cta: 'Обсудить съёмку',
    },
    cases: {
      label: 'Проекты',
      title: 'Избранные проекты',
      open: 'Открыть проект',
      year: 'Год',
      category: 'Категория',
      location: 'Локация',
      context: 'Контекст',
      result: 'Результат',
      deliverable: 'Передано',
    },
    caseItems: {
      seine: {
        category: 'Портрет / editorial',
        location: 'Париж, Франция',
        context: 'Клиентка хотела съёмку в своём городе, без студии и без постановочных поз.',
        result: 'Сорок кадров за два часа, серия, которую она распечатала дома и использовала для журнала.',
        deliverable: '40 обработанных фото, 6 принтов',
      },
      etretat: {
        category: 'Свадьба',
        location: 'Этрета, Нормандия',
        context: 'Небольшая сентябрьская свадьба на скалах: двадцать гостей и час пригодного света.',
        result: 'Спокойная история от утра до сумерек, опубликованная в региональном свадебном журнале.',
        deliverable: '320 фото, альбом на 30 страниц',
      },
      rouge: {
        category: 'Коммерческая / продукт',
        location: 'Париж и Нормандия',
        context: 'Независимому парфюмерному дому нужна была кампания запуска, которая пахнет местом, а не студией.',
        result: 'Единый визуальный язык для сайта, упаковки и соцсетей; запуск распродали за три недели.',
        deliverable: '24 кадра кампании, короткие видеолупы',
      },
      orsay: {
        category: 'Мода / лукбук',
        location: 'Париж, набережная Сены',
        context: 'Молодой бренд заказал лукбук в сумерках, пешком, командой из трёх человек.',
        result: 'Лукбук, который поддерживал первую коллекцию в магазинах и прессе весь сезон.',
        deliverable: '30 фото, обложка и подборка для прессы',
      },
    },
    shoots: {
      title: 'Съёмки',
      outcomeLabel: 'Что вы получите',
      detailsLabel: 'Детали',
      ribbonLabel: (name) => `Примеры: ${name}, горизонтальная прокрутка`,
      ribbonHint: 'Перетащите, свайпните или используйте стрелки',
      prev: 'Предыдущие фото',
      next: 'Следующие фото',
      photoAlt: (name, n, total) => `${name}, фото ${n} из ${total}`,
      panels: {
        portrait: {
          outcome: 'Серия естественных портретов, где вы самая спокойная и лучшая, готовая для печати, профилей и портфолио.',
          details: ['2 часа, маршрут выбираем вместе', '30–40 обработанных фото', 'Передача в течение 7 дней'],
          cta: 'Забронировать портретную съёмку',
        },
        wedding: {
          outcome: 'Весь день как одна история, чтобы спустя годы вы вспоминали, что чувствовали, а не только как всё выглядело.',
          details: ['Полдня или весь день', '300+ фото и альбом по желанию', 'Превью за 48 часов'],
          cta: 'Узнать про дату свадьбы',
        },
        commercial: {
          outcome: 'Цельный набор изображений, дающий бренду узнаваемый голос в вебе, печати и соцсетях.',
          details: ['Бриф, мудборд и шотлист', 'Лицензия: веб, печать, соцсети', 'Студия или локация'],
          cta: 'Обсудить проект',
        },
      },
    },
    viewer: {
      close: 'Закрыть проект',
      back: 'Назад к проектам',
      prev: 'Предыдущий проект',
      next: 'Следующий проект',
      book: 'Забронировать похожую съёмку',
      label: (name) => `Проект: ${name}`,
      counter: (n, total) => `${n} / ${total}`,
      photoAlt: (name, n) => `${name}, кадр ${n}`,
      collage: 'Коллаж фото',
    },
  },
}
