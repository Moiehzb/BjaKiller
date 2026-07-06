// ─── Русский ──────────────────────────────────────────────────────
// Mirror of fr.js — keep the key structure identical across locales.
// Редакционный тон: сдержанный, посвятительный — Тайная Академия Счётчиков.
// Имена собственные НЕ переводятся: ранги (Cuivre…Adamantium), скины, достижения.

// Русское склонение слова «карта» по числу
const cards = (n) => {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 14) return 'карт';
  if (last === 1) return 'карта';
  if (last >= 2 && last <= 4) return 'карты';
  return 'карт';
};
const decks = (n) => {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 14) return 'колод';
  if (last === 1) return 'колода';
  if (last >= 2 && last <= 4) return 'колоды';
  return 'колод';
};
const games = (n) => {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 14) return 'игр';
  if (last === 1) return 'игра';
  if (last >= 2 && last <= 4) return 'игры';
  return 'игр';
};

const ru = {
  common: {
    back: 'Назад',
    menu: 'Меню',
    close: 'Закрыть',
    validate: 'Подтвердить',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    continue: 'Продолжить',
    equip: 'Надеть',
    equipped: '✓ Надето',
    buy: 'Получить',
    loading: 'Открытие архивов…',
    replay: 'Сыграть снова',
    restart: 'Начать заново',
    win: 'Победа',
    loss: 'Поражение',
    winShort: 'П',
    lossShort: 'Пр',
    on: 'ВКЛ',
    off: 'ВЫКЛ',
    gameN: ({ n }) => `Игра ${n}`,
  },

  langSelect: {
    title: 'Выберите язык',
    subtitle: 'Вы можете изменить его в любое время из зала.',
  },

  header: { tuto: 'Туториал', language: 'Язык' },

  crumbs: {
    home: 'Зал', ranked: 'Гильдия', training: 'Зал Обучения',
    casino: 'Испытание', game: 'Игра',
  },

  modeName: {
    training: 'Зал Обучения', ranked: 'Врата Гильдии', promo: 'Повышение',
    placement: 'Посвящение', casino: 'Испытание', daily: 'Ежедневный Ритуал',
  },

  ranks: {
    descShort: ({ decks: d, spc }) => `${d} ${decks(d)} · ${spc}с/карта`,
    finalRank: 'Финальный ранг',
  },

  placement: {
    recovery: 'Восстановление',
    gate: 'Врата',
    recoveryTag: 'Восстановление',
    gateTag: 'Врата',
    recoverySuffix: 'восстановление',
    terminated: 'Посвящение завершено',
  },

  lobby: {
    promoGame: 'ИГРА НА ПОВЫШЕНИЕ',
    promoLocked: 'Повышение заблокировано',
    currentRank: 'Ранг в Гильдии',
    winToRankUp: 'Одна победа приближает вас к следующему рангу.',
    mmrLocked: ({ mmr }) => `${mmr}/100 ОМР — наберите 100 для повторной попытки`,
    mmr: ({ mmr }) => `${mmr}/100 ОМР`,
    maxRank: 'Вершина Гильдии — Испытание ждёт.',
    placementTitle: 'Посвящение',
    placementDoneLabel: 'Завершено',
    placementProgress: ({ played, total, left }) =>
      `${played}/${total} сыграно · ${left} ${games(left)} осталось`,
    gameModes: 'Пути',
    account: 'Архивы',
    trainingSub: 'Свободная практика · счётчик виден · без ставок',
    rankedPlacement: 'Посвящение',
    rankedPromo: 'Игра на Повышение',
    rankedLocked: 'Заблокировано — сначала завершите сессию в Зале Обучения',
    rankedPlacementSub: ({ left }) =>
      `${left} ${games(left)} осталось · Выход = −ОМР`,
    rankedSub: ({ rank, desc }) => `${rank} · ${desc} · Выход = −25 ОМР`,
    casinoSub: 'Пять кругов · ноль ошибок',
    casinoLocked: 'Заблокировано — сначала приблизьтесь к Вратам Гильдии',
    achievements: 'Достижения',
    achievementsSub: ({ unlocked, total }) => `${unlocked}/${total} выполнено`,
    skins: 'Артефакты',
    skinsSub: ({ owned, total }) => `${owned}/${total} получено`,
    stats: 'Архивы',
    statsSub: ({ total }) => `${total} ${games(total)} записано`,
    statsNone: 'Записей пока нет',
    dailyTitle: 'Ежедневный Ритуал',
    dailySpecialTitle: 'Великий Ритуал',
    dailyReadySub: ({ decks: d, secs }) => `${d} ${decks(d)} · ~${secs}с · с учётом вашего ранга`,
    dailyDoneWin: ({ score }) => `✓ Выполнено · ${score} оч.`,
    dailyDoneLoss: '✗ Не выполнено',
    dailyComeBack: 'Возвращайтесь завтра',
    settings: 'Скрипторий',
    settingsSub: 'Параметры · Сброс',
    currentStreak: ({ streak }) => `Текущая серия: ${streak}`,
  },

  achievementsModal: {
    title: 'Достижения',
    sub: ({ unlocked, total }) =>
      `${unlocked}/${total} выполнено · Постоянные испытания, без ограничений по времени`,
    secretNameLocked: '???',
    secretNameUnlocked: 'The Architect',
    secretDescLocked: 'Скрытое достижение — Гильдия хранит свои секреты',
    secretDescUnlocked: '5/5 врат пройдено на Посвящении',
    toastLabel: 'Достижение',
    challengeDone: 'Испытание выполнено',
  },

  placementModal: {
    title: 'Посвящение в процессе',
    sub: ({ played, total }) => `${played}/${total} ${games(played)} · пять Врат нужно пройти`,
    decks: 'Колоды',
    penetration: 'Проникновение',
    limit: 'Лимит',
  },

  rankLadder: {
    title: 'Иерархия Гильдии',
    sub: ({ count, tiers }) => `${count} рангов · ${tiers} уровней всего`,
    you: 'Вы',
    reached: 'Достигнуто',
    locked: 'Заблокировано',
    tiers: '3 уровня: I · II · III',
    decksLabel: 'Колоды',
    penetration: 'Проникновение',
    speed: 'Скорость/карта',
    rankPerk: 'Больше колод, меньше времени на карту.',
    masterPerk: 'Финальный ранг — внутренний круг Гильдии.',
    footer: 'Проходите Врата Гильдии, чтобы подниматься по уровням.',
  },

  shop: {
    title: 'Зал Артефактов',
    coinsAvailable: ({ coins }) => `${coins} монет в вашем распоряжении`,
    boutiqueCoins: 'Артефакты · монеты',
    secretName: '???',
    secretDesc: 'Скрытый артефакт — оккультное условие',
    free: 'Выдан',
    priceCoins: ({ price }) => `${price}`,
    buyLocked: ({ price }) => `${price}`,
    warChest: 'Торговец',
    merchantSub: 'Проходящий торговец · редкие вещи',
    warChestDesc:
      'Счётчик… я слышал о вас. Эти артефакты не для всех — но для вас я сделаю исключение. €4,99 за штуку. Платите один раз, ваше навсегда. Без подписки — я никогда не хожу одним путём дважды.',
    preview: 'Изучить',
    price499: '€4,99',
    forge: 'Получить — {price}',
    restore: 'Восстановить покупки',
    tagline: {
      sp_steampunk: 'Стимпанк · шестерёнки и пар',
      sp_cyber: 'Киберпанк · hex 02-09, фигуры K Q J T',
      sp_vapor: 'Вэйпорвейв · полная ширина + VHS',
      sp_eldritch: 'Космический ужас · пульсирующий глаз',
      sp_norse: 'Викинг · чёткое значение + рунический акцент',
      sp_synth: 'Синтвейв · хром + неоновая сетка',
      sp_noir: 'Нуар · кровь уникальна для каждого ранга',
      sp_cosmos: 'Космос · уникальный фон для каждой масти',
      sp_bio: 'Биолюминесценция · зелёный против янтарного',
      sp_graffiti: 'Граффити · 4 неоновых цвета',
    },
  },

  stats: {
    title: 'Архивы',
    sub: 'Что Гильдия записала о вас',
    games: 'Игры',
    wins: 'Победы',
    losses: 'Поражения',
    accuracy: 'Точность',
    last20: 'Последние 20',
    bestTime: 'Лучшее время',
    currentStreak: 'Текущая серия',
    bestStreak: 'Лучшая серия',
    avgSpc: ({ spc }) => `${spc}с/карта в среднем`,
    totalCards: ({ cards: c }) => `${c} ${cards(c)} всего`,
    recentTitle: 'Последние 20 игр · нажмите на полосу для деталей',
    oldest: 'Самое старое',
    newest: 'Самое новое',
    detailWin: '✓ Победа',
    detailLoss: '✗ Поражение',
    decks: 'Колоды',
    penetration: 'Проникновение',
    spcLabel: 'с/карта',
    timeLabel: 'Время',
    rankedProgress: 'Положение в Гильдии',
    initialPlacement: 'Посвящение',
    architectSuffix: ' — 5/5 врат пройдено',
    topSkin: 'Самый надеваемый артефакт',
    topSkinGames: ({ n }) => `${n} ${games(n)}`,
    placementInProgress: 'Посвящение в процессе…',
    dailyTitle: 'Ежедневный Ритуал',
    dailyStreak: 'Текущая серия',
    dailyBestStreak: 'Лучшая серия',
    dailyBestScore: 'Лучший счёт',
    dailyRecap: ({ won, played, wr }) => `${won}/${played} выполнено · ${wr}% успеха`,
    dailyNever: 'Ритуалов пока не было — возвращайтесь каждый день за новой колодой.',
    byDeckTitle: 'Точность по колодам',
    deckLabel: ({ n }) => `${n} ${decks(n)}`,
    cardsCounted: 'Подсчитано карт',
    byModeTitle: 'Игры по путям',
  },

  settings: {
    title: 'Скрипторий',
    sound: 'Звук',
    music: "Музыка",
    haptics: "Вибрация",
    devRankTitle: 'Dev · установить ранг',
    devRankHint: 'Выберите ранг напрямую, минуя Посвящение.',
    reset: 'Удалить прогресс',
    resetTitle: 'Удаление архивов',
    resetWarnPre: 'Необратимо. Введите ',
    resetWarnPost: ' для подтверждения.',
    resetPlaceholder: 'Введите RESET здесь',
  },

  rankedConfig: {
    placementTitle: 'Посвящение',
    promoTitle: 'Повышение',
    rankedTitle: 'Врата Гильдии',
    placementSub: ({ n, total, type }) =>
      `Игра ${n}/${total} · ${type === 'recovery' ? 'Восстановление' : 'Врата Гильдии'}`,
    promoSub: ({ from, to }) => `Одна победа для перехода ${from} → ${to}`,
    rankedSub: ({ rank, win, loss }) =>
      `${rank} · +${win} ОМР · ${loss} ОМР · Выход −25 ОМР`,
    progress: ({ n, total }) => `Прогресс · ${n}/${total}`,
    decks: 'Колоды',
    penetration: 'Проникновение',
    limit: 'Лимит',
    spcCards: ({ spc, cards: c }) => `${spc}с/карта · ${c} ${cards(c)}`,
    winLabel: '✓ Победа',
    lossLabel: '✗ Поражение',
    nextGate: 'Следующие врата',
    placedAt: ({ rank }) => `Принят на ранг ${rank}`,
    retryGate: ({ gate }) => `Повторить врата ${gate}`,
    recoveryTo: ({ rank }) => `Восстановление ${rank}`,
    placementOver: 'Посвящение завершено',
    promoWarn:
      'Повышение: проникновение +10%. Только одна попытка — поражение возвращает к 100 ОМР.',
    configuration: 'Конфигурация',
    deckPen: ({ decks: d, pen }) => `${d} ${decks(d)} · ${pen}% проникновения`,
    timeSpcCards: ({ tl, spc, cards: c }) => `${tl}с · ${spc}с/карта · ${c} ${cards(c)}`,
    mmrCurrent: 'Текущий ОМР',
    promoLockedHint: 'Повышение заблокировано — наберите 100 ОМР для повторной попытки',
    launchRecovery: 'Восстановление',
    launchGate: ({ n, total }) => `Врата ${n}/${total}`,
    launchPromo: 'Попытка Повышения',
    launchRanked: '♠ К Вратам',
    abandonWarn: 'Выход из игры = −25 ОМР',
  },

  trainingConfig: {
    title: 'Зал Обучения',
    sub: 'Свободная практика · без влияния на ОМР · монеты зарабатываются как обычно',
    deckCount: 'Количество колод',
    deck: 'колода',
    decks: 'колоды',
    penetration: 'Проникновение',
    cardsOf: ({ cards: c, total }) => `${c} ${cards(c)} из ${total}`,
    duration: 'Длительность',
    options: 'Параметры',
    showCounter: 'Счётчик виден',
    showCounterSub: 'Показывает текущий счёт',
    start: 'Начать обучение',
  },

  casinoConfig: {
    title: 'Испытание',
    sub: 'Пять кругов · 0,40с/карта · 90% проникновения · счётчик закрыт',
    alreadyDone: 'Испытание уже пройдено — достижение "Casino Ready" ваше.',
    stepsTitle: 'Пять кругов, сцепленных без возврата',
    deckLabel: ({ decks: d }) => `${d} ${decks(d)}`,
    stepCards: ({ cards: c, tl }) => `${c} ${cards(c)} · ${tl}с`,
    penShort: ({ pen }) => `${pen}% пр.`,
    spcShort: ({ spc }) => `${spc}с/к`,
    warn:
      'Провал на круге отправляет на первый. Счётчик должен оставаться закрытым всё Испытание, чтобы получить достижение. 10с отдыха между кругами.',
    launch: 'Войти в Испытание',
  },

  game: {
    stepDoneNext: ({ n }) => `Круг ${n} пройден ✓ — следующий открывается через`,
    stepNext: ({ n, decks: d, tl }) => `Круг ${n}: ${d} ${decks(d)} · ${tl}с`,
    countdownCasino: ({ n }) => `ИСПЫТАНИЕ — КРУГ ${n}/5`,
    countdownPromo: 'ПОВЫШЕНИЕ',
    countdownPlacement: ({ n, total }) => `ПОСВЯЩЕНИЕ ${n}/${total}`,
    countdownTraining: 'ЗАЛ ОБУЧЕНИЯ',
    countdownRanked: 'ВРАТА ГИЛЬДИИ',
    go: 'СЧИТАТЬ',
    cardsTime: ({ cards: c, tl }) => `${c} ${cards(c)} · ${tl}с`,
    countQuestion: 'Каков счёт?',
    perfect: 'Точный счёт.',
    wasCount: ({ count }) => `Было ${count}`,
    resultStats: ({ time, tl, decks: d }) => `${time}с / ${tl}с · ${d}К`,
    promotion: 'ПОВЫШЕНИЕ',
    demotion: 'ПОНИЖЕНИЕ',
    mmrDelta: ({ delta }) => `${delta > 0 ? '+' : ''}${delta} ОМР`,
    promoLockedResult: 'Повышение заблокировано — вернитесь к 100',
    placementDoneTitle: 'Посвящение завершено.',
    startRankPre: 'Гильдия принимает вас на ранг: ',
    startMmr: ({ mmr }) => `${mmr} начальных ОМР`,
    architectWin: 'The Architect — 5/5 врат пройдено. Гильдия запомнит.',
    nextPre: 'Следующее: ',
    recoveryParen: ' (восстановление)',
    placementStats: ({ decks: d, pen, spc, tl }) => `${d}К · ${pen}% · ${spc}с/к · ${tl}с`,
    gamesPlayed: ({ played, total }) => `${played}/${total} ${games(played)} сыграно`,
    coinsEarned: ({ coins }) => `+${coins}`,
    casinoFail: 'Провал. Испытание начинается с первого круга.',
    casinoStepOk: ({ n, next }) => `✓ Круг ${n}/5 — следующий откроется через ${next}с`,
    casinoDone: 'Испытание пройдено. Немногие могут это сказать.',
    dailyScore: 'Очки ритуала',
    dailySpecial: 'Великий Ритуал · 8 колод',
    dailyStreakKept: ({ n }) => `Серия ${n} дн., сохранена.`,
    dailyStreakLost: 'Серия прервана.',
    dailyComeBack: 'Возвращайтесь завтра за новой колодой',
    infoCasino: ({ n }) => `ИСПЫТАНИЕ — Круг ${n}/5`,
    infoPromo: 'ПОВЫШЕНИЕ',
    infoPlacement: ({ n, total }) => `ПОСВЯЩЕНИЕ ${n}/${total}`,
    infoRank: ({ rank }) => `Гильдия · ${rank}`,
    limit: ({ tl }) => `Лимит: ${tl}с`,
    pause: 'Пауза',
    pauseHint: 'Нажмите ⏸ для продолжения',
    count: ({ value }) => `Счёт: ${value}`,
    abandonTitle: 'Покинуть игру?',
    abandonBody1: 'Выход засчитывается как поражение.',
    abandonMmr: '−25 ОМР',
    abandonBody2: ' будут вычтены немедленно.',
    abandon: 'Покинуть',
  },

  timePicker: {
    presets: ['Новичок', 'Ученик', 'Посвящённый', 'Переписчик', 'Подмастерье', 'Адепт', 'Учёный', 'Мастер', 'Архимастер', 'Легенда'],
    manual: 'Вручную',
    hint: 'Нажмите на время, чтобы открыть клавиатуру',
    keypadTitle: 'Время в секундах',
    keypadValidate: 'Подтвердить',
    spcCards: ({ spc, cards: c }) => `${spc}с / карта · ${c} ${cards(c)}`,
  },

  challenges: {
    frame_perfect: { name: 'Frame Perfect', desc: '1 колода — 0,40с/карта или сложнее — счётчик закрыт' },
    no_mercy: { name: 'No Mercy', desc: 'Пройдите врата Or → Émeraude с первой попытки — счётчик закрыт' },
    the_wall: { name: 'The Wall', desc: '6 колод — 90%+ проникновения — 0,50с/карта или меньше — счётчик закрыт' },
    blind_run: { name: 'Blind Run', desc: '8 колод — 0,45с/карта или сложнее — счётчик закрыт' },
    iron_streak: { name: 'Iron Streak', desc: '10 побед подряд — среднее 0,55с/карта или меньше — счётчик закрыт' },
    full_burn: { name: 'Full Burn', desc: '8 колод — 95%+ проникновения — счётчик закрыт' },
    casino_complete: { name: 'Casino Ready', desc: 'Пройдите Испытание полностью' },
  },

  tutorial: {
    skip: 'Пропустить',
    welcome: {
      logoSub: 'Академия Счётчиков',
      intro:
        'На протяжении поколений Академия передаёт искусство Hi-Lo тем, кто умеет смотреть. За пять минут вы узнаете, как отслеживать счёт через целый башмак.',
      start: 'Переступить порог',
      skipKnow: 'Я уже умею считать',
    },
    hilo: {
      groupLow: 'Низкие',
      groupNeutral: 'Нейтральные',
      groupHigh: 'Высокие',
      label: 'Система Hi-Lo',
      h1l1: 'Три группы.',
      h1l2: 'Три значения. И ничего больше.',
      p: 'Каждая сданная карта изменяет текущий счёт на −1, 0 или +1. Начинать всегда с 0.',
      tipTitle: 'Интуиция',
      tipBody:
        'Когда выходит низкая карта, высоких остаётся больше → преимущество для вас → +1. Когда выходит высокая, их остаётся меньше → −1. Высокий счёт предвещает, что следующие карты скорее всего будут сильными.',
      next: 'Понял — к упражнению',
    },
    quiz: {
      resultsLabel: 'Результаты',
      score: ({ score }) => `${score} / 8 правильных`,
      headPerfect: 'Безупречно. Hi-Lo — ваш.',
      headGood: 'Уверенно.',
      headOk: 'Привычка формируется.',
      headPoor: 'Практика сделает остальное.',
      bodyGood: 'Карты вы определяете без колебаний. К счёту.',
      bodyPoor: 'Игра закрепит эти рефлексы лучше любого урока. Продолжайте.',
      finalCount: 'Финальный счёт последовательности',
      restart: '↩ Начать заново',
      continueAnyway: 'Продолжить в любом случае',
      continue: 'Продолжить',
      nextCard: 'Дальше →',
      memoTitle: 'Памятка Hi-Lo',
      memoLow: 'Низкие',
      memoNeutral: 'Нейтральные',
      memoHigh: 'Высокие',
      identLabel: 'Определение — карта за картой',
      runningCount: 'Текущий счёт',
      ansHigh: 'Высокая',
      ansNeutral: 'Нейтральная',
      ansLow: 'Низкая',
      correctFb: ({ rank, val }) => `✓ Верно — ${rank} это ${val}`,
      wrongFb: ({ val, type }) => `✗ Было ${val} (${type})`,
      typeLow: 'низкая карта',
      typeNeutral: 'нейтральная',
      typeHigh: 'высокая карта',
      question: 'Каково значение Hi-Lo этой карты?',
      cardProgress: ({ n, total }) => `Карта ${n} / ${total}`,
    },
    count: {
      label: 'Текущий счёт',
      introH1l1: 'Теперь,',
      introH1l2: 'без подсказок.',
      introP:
        'Будут сданы шесть карт. Ведите счёт в голове, затем назовите итоговую сумму. Всегда начинать с 0.',
      tipTitle: 'Метод',
      tipBody:
        'Шепчите счёт на каждой карте: «один… ноль… минус один…» Не старайтесь запомнить каждую карту — следите только за нарастающей суммой.',
      see6: 'Посмотреть шесть карт',
      watching: 'Следите за счётом…',
      wrongTry: 'Не совсем. Ещё одна попытка.',
      correctTitle: ({ count }) => `✓ Точно. Счёт был +${count}.`,
      wrongTitle: ({ count }) => `Счёт был +${count}.`,
      correctDesc: 'Шесть карт отслежено без потери нити. Привычка есть.',
      wrongDesc: 'Посмотрите значения под каждой картой — складывайте с 0.',
      validate: 'Подтвердить',
      continue: 'Продолжить',
    },
    modes: {
      label: 'Три Пути',
      h1l1: 'Три пути,',
      h1l2: 'одно развитие.',
      p: 'Начните в Зале Обучения, чтобы выработать рефлексы. Когда будете готовы, явитесь на Посвящение, чтобы вступить в Гильдию.',
      trainingName: 'Зал Обучения',
      trainingSub: 'Свободная практика — начните здесь',
      trainingDesc:
        'Настройте всё по-своему: колоды (от 1 до 8), проникновение (50–95%), скорость. Пауза разрешена. Счётчик — опция. Место, где куются рефлексы.',
      rankedName: 'Врата Гильдии',
      rankedSub: 'Соревновательный путь — открывается после Посвящения',
      rankedDesc:
        'Поднимайтесь по рангам Cuivre → Argent → Or → Émeraude → Saphir → Adamantium. Фиксированная конфигурация на ранг, без паузы, счётчик закрыт.',
      casinoName: 'Испытание',
      casinoSub: 'Пять сцепленных кругов — финальный путь',
      casinoDesc:
        '1К → 2К → 4К → 6К → 8К, все при 90% проникновения и 0,40с/карта. Провал на круге отправляет на первый.',
      available: 'Открыто',
      calibTipTitle: 'Посвящение',
      calibTipBody:
        'Перед вступлением в Гильдию вы сыграете пять посвятительных игр, определяющих ваш начальный ранг. Пройдите все пять Врат — и тайный артефакт Obsidian Void станет вашим.',
      continue: 'Продолжить',
    },
    ready: {
      check1: 'Hi-Lo понят: 2–6 = +1, 7–9 = 0, 10–A = −1',
      check2: 'Текущий счёт отслежен на реальной последовательности',
      check3: 'Три Пути открыты — Зал Обучения доступен',
      title: 'Вы один из нас.',
      p: 'Остальное учится за столами. Откройте сессию в Зале Обучения, идите в своём темпе, наблюдайте за счётом.',
      firstGoalTitle: 'Ваше первое упражнение',
      firstGoalPre: 'Откройте учебную сессию: ',
      firstGoalStrong: '1 колода, 75% проникновения',
      firstGoalPost:
        ', неспешная скорость. Откройте счётчик, если потеряете нить — вердикт выносится в конце каждой сессии.',
      enterLobby: 'Войти в Зал',
    },
  },
};

export default ru;
