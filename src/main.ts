import './style.css';

// --- ИНТЕРФЕЙСЫ И ТИПЫ ДЛЯ TYPESCRIPT STRICT ---
interface HeroClass {
  id: 'guardian' | 'phantom' | 'technomancer';
  name: string;
  desc: string;
  price: number;
  hp: number;
  speed: number;
  startSkill: string;
  color: string;
}

interface MetaUpgrade {
  key: 'hp' | 'dmg' | 'magnet';
  name: string;
  desc: string;
  cost: number;
  max: number;
}

interface SkillInfo {
  name: string;
  desc: string;
  max: number;
  type: 'weapon' | 'passive';
  color: string;
  icon: string;
}

// --- СИНТЕЗАТОР ЗВУКОВ (WEB AUDIO API БЕЗ ВНЕШНИХ ФАЙЛОВ) ---
let audioCtx: AudioContext | null = null;
function playSound(type: 'levelup' | 'upgrade'): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;

    if (type === 'levelup') {
      // Мажорный перелив победы (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.16, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.32);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } else if (type === 'upgrade') {
      // Сочный футуристический щелчок подтверждения
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    // Безопасный fallback, если аудио заблокировано политикой браузера
  }
}

interface RunRecord {
  survivalSec: number;
  lvl: number;
  kills: number;
  hero: string;
}

interface TelemetryData {
  totalRuns: number;
  bestSurvivalSec: number;
  maxLevelReached: number;
  totalKills: number;
  classPicks: Record<string, number>;
  skillPickCounts: Record<string, number>;
  runsHistory: RunRecord[];
}

interface SaveData {
  gold: number;
  unlockedClasses: boolean[];
  selectedClass: number;
  meta: {
    hp: number;
    dmg: number;
    speed?: number;
    magnet: number;
  };
  telemetry: TelemetryData;
}

interface Player {
  x: number;
  y: number;
  r: number;
  angle: number;
  skinId: 'guardian' | 'phantom' | 'technomancer';
  isMoving: boolean;
  color: string;
  hp: number;
  maxHp: number;
  speed: number;
  dmgMult: number;
  magnetR: number;
  lvl: number;
  xp: number;
  nextXp: number;
  kills: number;
  runGold: number;
  skills: Record<string, number>;
  timers: {
    blaster: number;
    lightning: number;
    nova: number;
    chakram: number;
    bladeAngle: number;
  };
  invuln: number;
}

interface Enemy {
  type: 'normal' | 'runner' | 'tank' | 'boss';
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  speed: number;
  dmg: number;
  color: string;
  sides: number;
  xp: number;
  gold: number;
  pushX: number;
  pushY: number;
  bladeCd?: number;
}

interface Bullet {
  type: 'blaster' | 'chakram';
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  r: number;
  color: string;
  life: number;
  bounces: number;
  lastHit: Enemy | null;
}

interface Gem {
  x: number;
  y: number;
  xp: number;
  isBoss: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
}

interface NovaWave {
  x: number;
  y: number;
  r: number;
  maxR: number;
}

interface LightningArc {
  points: { x: number; y: number }[];
  life: number;
}

// --- DOM ЭЛЕМЕНТЫ ---
const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let W = (canvas.width = window.innerWidth);
let H = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

// --- СОХРАНЕНИЕ И ТЕЛЕМЕТРИЯ ---
const defaultSave: SaveData = {
  gold: 0,
  unlockedClasses: [true, false, false],
  selectedClass: 0,
  meta: { hp: 0, dmg: 0, magnet: 0 },
  telemetry: {
    totalRuns: 0,
    bestSurvivalSec: 0,
    maxLevelReached: 1,
    totalKills: 0,
    classPicks: { Страж: 0, Фантом: 0, Техномант: 0 },
    skillPickCounts: {},
    runsHistory: [],
  },
};

let save: SaveData = defaultSave;
try {
  const loaded = localStorage.getItem('cyber_survivors_save');
  if (loaded) {
    save = { ...defaultSave, ...JSON.parse(loaded) };
  }
} catch {
  save = defaultSave;
}

function saveGame(): void {
  localStorage.setItem('cyber_survivors_save', JSON.stringify(save));
}

// --- КЛАССЫ ГЕРОЕВ СО СКИНОМ ---
const CLASSES: HeroClass[] = [
  {
    id: 'guardian',
    name: 'Страж',
    desc: 'Тяжелый перехватчик с мощной броней. Старт: Авто-бластер',
    price: 0,
    hp: 100,
    speed: 3.1,
    startSkill: 'blaster',
    color: '#00ffcc',
  },
  {
    id: 'phantom',
    name: 'Фантом',
    desc: 'Скоростной стреловидный стелс-дрон. Старт: Кибер-клинки',
    price: 150,
    hp: 85,
    speed: 3.6,
    startSkill: 'blades',
    color: '#ff2a85',
  },
  {
    id: 'technomancer',
    name: 'Техномант',
    desc: 'Сингулярный тесла-крейсер. Старт: Цепная молния Теслы',
    price: 320,
    hp: 90,
    speed: 3.2,
    startSkill: 'lightning',
    color: '#b829ff',
  },
];

// --- ПОСТОЯННЫЕ АПГРЕЙДЫ В АНГАРЕ ---
const META_LIST: MetaUpgrade[] = [
  { key: 'hp', name: 'Титановая броня', desc: '+20 к макс. здоровью на старте', cost: 55, max: 5 },
  { key: 'dmg', name: 'Ядро перегрузки', desc: '+15% ко всему урону навсегда', cost: 70, max: 5 },
  { key: 'magnet', name: 'Грави-сборщик', desc: '+30% к радиусу сбора кристаллов', cost: 45, max: 5 },
];

// --- СПОСОБНОСТИ И ОРУЖИЕ ---
const SKILLS: Record<string, SkillInfo> = {
  blaster: {
    name: 'Авто-бластер',
    desc: 'Стреляет скоростным веером импульсов в ближайших врагов',
    max: 5,
    type: 'weapon',
    color: '#00ffcc',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="6"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
  },
  blades: {
    name: 'Кибер-клинки',
    desc: 'Вокруг героя вращаются смертоносные лезвия, разрезая врагов',
    max: 5,
    type: 'weapon',
    color: '#ff2a85',
    icon: '⚔',
  },
  lightning: {
    name: 'Цепная молния',
    desc: 'Бьет мощным дуговым разрядом Теслы сразу по группе врагов',
    max: 5,
    type: 'weapon',
    color: '#b829ff',
    icon: '⚡',
  },
  nova: {
    name: 'Сверхновая',
    desc: 'Взрывная волна: наносит колоссальный урон и отбрасывает толпу',
    max: 5,
    type: 'weapon',
    color: '#ff6600',
    icon: '💥',
  },
  chakram: {
    name: 'Рикошет-диск',
    desc: 'Запускает бумеранг-чакрам, многократно отскакивающий от целей',
    max: 5,
    type: 'weapon',
    color: '#ffd700',
    icon: '◆',
  },
  speed: {
    name: 'Турбо-тяга',
    desc: '+18% к скорости передвижения и мгновенный хил +25 HP',
    max: 4,
    type: 'passive',
    color: '#38bdf8',
    icon: '▲',
  },
  overclock: {
    name: 'Ядро урона',
    desc: '+25% к урону всех имеющихся орудий',
    max: 5,
    type: 'passive',
    color: '#ef4444',
    icon: '🔥',
  },
  magnet: {
    name: 'Супер-магнит',
    desc: '+45% к радиусу сбора кристаллов и +30 HP',
    max: 4,
    type: 'passive',
    color: '#a855f7',
    icon: '🧲',
  },
};

// --- ОТРИСОВКА СКИНОВ КОСМИЧЕСКИХ ДРОНОВ ---
function drawShip(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  angle: number,
  skinId: 'guardian' | 'phantom' | 'technomancer',
  color: string,
  engineThrust = false
): void {
  c.save();
  c.translate(x, y);
  c.rotate(angle);

  if (skinId === 'guardian') {
    // Двигатели (двойное сопло)
    if (engineThrust) {
      c.fillStyle = '#00ffcc';
      c.shadowColor = '#00ffcc';
      c.shadowBlur = 10;
      c.beginPath();
      c.moveTo(-r, -5);
      c.lineTo(-r - 9 - Math.random() * 5, -5);
      c.lineTo(-r + 1, -2);
      c.moveTo(-r, 2);
      c.lineTo(-r - 9 - Math.random() * 5, 5);
      c.lineTo(-r + 1, 5);
      c.fill();
    }

    // Корпус тяжелого истребителя
    c.fillStyle = '#10162a';
    c.strokeStyle = color;
    c.lineWidth = 2.4;
    c.shadowColor = color;
    c.shadowBlur = 14;

    c.beginPath();
    c.moveTo(r + 5, 0); // нос
    c.lineTo(r - 3, -7);
    c.lineTo(-3, -17); // левое крыло
    c.lineTo(-3, -12);
    c.lineTo(-r, -9); // корма лево
    c.lineTo(-r + 4, 0); // корма вырез
    c.lineTo(-r, 9); // корма право
    c.lineTo(-3, 12);
    c.lineTo(-3, 17); // правое крыло
    c.lineTo(r - 3, 7);
    c.closePath();
    c.fill();
    c.stroke();

    // Бластерные пушки на крыльях
    c.fillStyle = color;
    c.fillRect(0, -16, 7, 2.5);
    c.fillRect(0, 13.5, 7, 2.5);

    // Кабина пилота
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.ellipse(1, 0, 5, 3, 0, 0, Math.PI * 2);
    c.fill();
  } else if (skinId === 'phantom') {
    // Двигатели (розовое сопло)
    if (engineThrust) {
      c.fillStyle = '#ff2a85';
      c.shadowColor = '#ff2a85';
      c.shadowBlur = 12;
      c.beginPath();
      c.moveTo(-r, 0);
      c.lineTo(-r - 12 - Math.random() * 6, 0);
      c.lineTo(-r + 3, 3);
      c.lineTo(-r + 3, -3);
      c.closePath();
      c.fill();
    }

    // Острый стелс-перехватчик (форма Кинжал / Наконечник)
    c.fillStyle = '#180f26';
    c.strokeStyle = color;
    c.lineWidth = 2.2;
    c.shadowColor = color;
    c.shadowBlur = 16;

    c.beginPath();
    c.moveTo(r + 8, 0); // длинный острый нос
    c.lineTo(2, -6);
    c.lineTo(-r + 2, -18); // стреловидное левое крыло
    c.lineTo(-5, -3);
    c.lineTo(-r, 0); // хвост
    c.lineTo(-5, 3);
    c.lineTo(-r + 2, 18); // стреловидное правое крыло
    c.lineTo(2, 6);
    c.closePath();
    c.fill();
    c.stroke();

    // Неоновые линии лезвий
    c.strokeStyle = '#ffffff';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(r + 4, 0);
    c.lineTo(-3, 0);
    c.stroke();

    // Ядро
    c.fillStyle = color;
    c.beginPath();
    c.arc(-1, 0, 3, 0, Math.PI * 2);
    c.fill();
  } else {
    // technomancer (Тесла-крейсер)
    if (engineThrust) {
      c.strokeStyle = '#b829ff';
      c.shadowColor = '#00ffcc';
      c.shadowBlur = 8;
      c.lineWidth = 1.8;
      c.beginPath();
      c.arc(-r - 5, 0, 5 + Math.random() * 3, 0, Math.PI * 2);
      c.stroke();
    }

    c.fillStyle = '#120d28';
    c.strokeStyle = color;
    c.lineWidth = 2.4;
    c.shadowColor = color;
    c.shadowBlur = 16;

    // Ромб-монолит
    c.beginPath();
    c.moveTo(r + 6, 0); // нос
    c.lineTo(0, -11); // левый угол
    c.lineTo(-r, 0); // хвост
    c.lineTo(0, 11); // правый угол
    c.closePath();
    c.fill();
    c.stroke();

    // Парящие тесла-пилоны
    c.fillStyle = '#00ffcc';
    c.shadowColor = '#00ffcc';
    c.beginPath();
    c.arc(2, -15, 3.5, 0, Math.PI * 2);
    c.arc(2, 15, 3.5, 0, Math.PI * 2);
    c.fill();

    // Дуги энергии
    c.strokeStyle = 'rgba(0, 255, 204, 0.7)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, -7);
    c.lineTo(2, -15);
    c.moveTo(0, 7);
    c.lineTo(2, 15);
    c.stroke();

    // Ядро сингулярности
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(1, 0, 4, 0, Math.PI * 2);
    c.fill();
  }

  c.restore();
}

// --- МЕНЮ И ИНТЕРФЕЙС АНГАРА ---
function renderMenu(banner: string | null = null): void {
  const lastRunBanner = document.getElementById('lastRunBanner')!;
  if (banner) {
    lastRunBanner.innerHTML = `<span style="color:#00ffcc;font-weight:700">${banner}</span>`;
  }
  document.getElementById('bankEl')!.innerHTML = `БАНК: <span class="coin">C</span> ${save.gold} CR`;

  const cGrid = document.getElementById('classGrid')!;
  cGrid.innerHTML = '';
  CLASSES.forEach((c, i) => {
    const unlocked = save.unlockedClasses[i];
    const sel = save.selectedClass === i;
    const d = document.createElement('div');
    d.className = `card ${sel ? 'selected' : ''}`;
    d.innerHTML = `
      <div>
        <h3 style="color:${c.color}">${c.name}</h3>
        <div class="ship-preview-box">
          <canvas id="preview_${c.id}" width="90" height="55"></canvas>
        </div>
        <p>${c.desc}</p>
      </div>
      <div class="cost">${unlocked ? (sel ? '✓ ВЫБРАН' : 'ВЫБРАТЬ') : `<span>КУПИТЬ:</span> <span class="coin">C</span> <span>${c.price} CR</span>`}</div>
    `;
    d.onclick = () => {
      if (unlocked) {
        save.selectedClass = i;
        saveGame();
        renderMenu();
      } else if (save.gold >= c.price) {
        save.gold -= c.price;
        save.unlockedClasses[i] = true;
        save.selectedClass = i;
        saveGame();
        renderMenu();
      }
    };
    cGrid.appendChild(d);

    // Отрисовка превью скина корабля
    const previewCanvas = document.getElementById(`preview_${c.id}`) as HTMLCanvasElement;
    if (previewCanvas) {
      const pCtx = previewCanvas.getContext('2d');
      if (pCtx) {
        drawShip(pCtx, 45, 27, 13, 0, c.id, c.color, true);
      }
    }
  });

  const mGrid = document.getElementById('metaGrid')!;
  mGrid.innerHTML = '';
  META_LIST.forEach((m) => {
    const lvl = save.meta[m.key] || 0;
    const price = Math.round(m.cost * Math.pow(1.75, lvl));
    const isMax = lvl >= m.max;
    const d = document.createElement('div');
    d.className = 'card';
    d.innerHTML = `
      <div>
        <h3>${m.name} <span>${lvl}/${m.max}</span></h3>
        <p>${m.desc}</p>
      </div>
      <div class="cost">${isMax ? 'МАКСИМУМ' : `<span>УЛУЧШИТЬ:</span> <span class="coin">C</span> <span>${price} CR</span>`}</div>
    `;
    d.onclick = () => {
      if (!isMax && save.gold >= price) {
        save.gold -= price;
        save.meta[m.key] = lvl + 1;
        saveGame();
        renderMenu();
      }
    };
    mGrid.appendChild(d);
  });
}

// --- ПЕРЕМЕННЫЕ ИГРОВОГО МИРА ---
let state: 'MENU' | 'PLAYING' | 'LEVEL_UP' = 'MENU';
let lastTime = performance.now();
let elapsed = 0;
let spawnTimer = 0;
let nextBossTime = 45;

let player!: Player;
let bullets: Bullet[] = [];
let enemies: Enemy[] = [];
let gems: Gem[] = [];
let floatTexts: FloatText[] = [];
let particles: Particle[] = [];
let lightningArcs: LightningArc[] = [];
let novaWaves: NovaWave[] = [];

const keys: Record<string, boolean> = {};
const joy = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, dx: 0, dy: 0 };

window.addEventListener('keydown', (e) => (keys[e.code] = true));
window.addEventListener('keyup', (e) => (keys[e.code] = false));

window.addEventListener('pointerdown', (e) => {
  if ((e.target as HTMLElement).closest('.modal')) return;
  joy.active = true;
  joy.startX = joy.curX = e.clientX;
  joy.startY = joy.curY = e.clientY;
  joy.dx = joy.dy = 0;
});

window.addEventListener('pointermove', (e) => {
  if (!joy.active) return;
  joy.curX = e.clientX;
  joy.curY = e.clientY;
  const vx = joy.curX - joy.startX;
  const vy = joy.curY - joy.startY;
  const dist = Math.hypot(vx, vy);
  if (dist > 6) {
    joy.dx = vx / dist;
    joy.dy = vy / dist;
  } else {
    joy.dx = joy.dy = 0;
  }
});

window.addEventListener('pointerup', () => {
  joy.active = false;
  joy.dx = joy.dy = 0;
});

function startGame(): void {
  document.getElementById('menuModal')!.style.display = 'none';
  const cls = CLASSES[save.selectedClass];
  const maxHp = cls.hp + (save.meta.hp || 0) * 20;

  player = {
    x: 0,
    y: 0,
    r: 16,
    angle: 0,
    skinId: cls.id,
    isMoving: false,
    color: cls.color,
    hp: maxHp,
    maxHp,
    speed: cls.speed,
    dmgMult: 1 + (save.meta.dmg || 0) * 0.15,
    magnetR: 120 * (1 + (save.meta.magnet || 0) * 0.3),
    lvl: 1,
    xp: 0,
    nextXp: 5,
    kills: 0,
    runGold: 0,
    skills: { [cls.startSkill]: 1 },
    timers: { blaster: 0, lightning: 0, nova: 0, chakram: 0, bladeAngle: 0 },
    invuln: 0,
  };

  bullets = [];
  enemies = [];
  gems = [];
  floatTexts = [];
  particles = [];
  lightningArcs = [];
  novaWaves = [];
  elapsed = 0;
  spawnTimer = 1.0;
  nextBossTime = 45;
  state = 'PLAYING';
  lastTime = performance.now();

  save.telemetry.totalRuns++;
  save.telemetry.classPicks[cls.name] = (save.telemetry.classPicks[cls.name] || 0) + 1;
  saveGame();
  updateHud();
}

function addFloatText(x: number, y: number, text: string, color = '#fff', size = 14): void {
  floatTexts.push({
    x: x + (Math.random() - 0.5) * 14,
    y: y - 10,
    text,
    color,
    size,
    life: 1,
  });
}

function addParticles(x: number, y: number, color: string, count = 10, speed = 3.5): void {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * speed + 0.8;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color });
  }
}

function openLevelUp(): void {
  state = 'LEVEL_UP';
  joy.active = false;
  joy.dx = joy.dy = 0;
  playSound('levelup');

  const box = document.getElementById('upgradeChoices')!;
  box.innerHTML = '';

  const available = Object.keys(SKILLS).filter((k) => (player.skills[k] || 0) < SKILLS[k].max);
  const picks = available.sort(() => Math.random() - 0.5).slice(0, 3);

  picks.forEach((k) => {
    const curLvl = player.skills[k] || 0;
    const nextLvl = curLvl + 1;
    const sk = SKILLS[k];
    const isNew = curLvl === 0;

    let starsHtml = '';
    for (let s = 1; s <= sk.max; s++) {
      if (s <= curLvl) {
        starsHtml += `<span class="star active">★</span>`;
      } else if (s === nextLvl) {
        starsHtml += `<span class="star next">★</span>`;
      } else {
        starsHtml += `<span class="star">☆</span>`;
      }
    }

    const div = document.createElement('div');
    div.className = 'card lvl-card';
    div.style.setProperty('--accent', sk.color);
    div.style.setProperty('--accent-glow', `${sk.color}66`);

    div.innerHTML = `
      <div>
        <div class="lvl-card-top">
          <div class="skill-icon-wrap" style="color:${sk.color}">${sk.icon}</div>
          <span class="lvl-card-badge ${isNew ? 'new' : 'upgrade'}">
            ${isNew ? '★ НОВОЕ' : `УРОВЕНЬ ${nextLvl}`}
          </span>
        </div>
        <h3 style="color:${sk.color}">${sk.name}</h3>
        <p>${sk.desc}</p>
      </div>
      <div class="lvl-stars-row">
        ${starsHtml}
        <span style="font-size:11px; font-weight:700; color:#94a3b8; margin-left:auto;">
          УР ${nextLvl}/${sk.max}
        </span>
      </div>
    `;

    div.onclick = () => {
      playSound('upgrade');
      player.skills[k] = nextLvl;
      if (k === 'speed') {
        player.speed *= 1.18;
        player.hp = Math.min(player.maxHp, player.hp + 25);
      }
      if (k === 'overclock') {
        player.dmgMult *= 1.25;
      }
      if (k === 'magnet') {
        player.magnetR *= 1.45;
        player.hp = Math.min(player.maxHp, player.hp + 30);
      }

      save.telemetry.skillPickCounts[sk.name] = (save.telemetry.skillPickCounts[sk.name] || 0) + 1;
      saveGame();

      document.getElementById('levelModal')!.style.display = 'none';

      // Если после улучшения еще остался опыт на следующий уровень
      if (player.xp >= player.nextXp) {
        player.xp -= player.nextXp;
        player.lvl++;
        player.nextXp = Math.floor(player.nextXp * 1.32 + 4);
        openLevelUp();
      } else {
        state = 'PLAYING';
        lastTime = performance.now();
        updateHud();
      }
    };
    box.appendChild(div);
  });

  document.getElementById('levelModal')!.style.display = 'flex';
}

function spawnEnemy(type: 'normal' | 'runner' | 'tank' | 'boss' = 'normal'): void {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.max(W, H) * 0.58 + 60;
  const x = player.x + Math.cos(angle) * dist;
  const y = player.y + Math.sin(angle) * dist;

  if (type === 'boss') {
    const hp = 180 + elapsed * 3.5;
    enemies.push({
      type: 'boss',
      x,
      y,
      r: 32,
      hp,
      maxHp: hp,
      speed: 1.25,
      dmg: 22,
      color: '#ff0055',
      sides: 6,
      xp: 12,
      gold: 20,
      pushX: 0,
      pushY: 0,
    });
  } else if (type === 'tank') {
    const hp = 32 + elapsed * 0.9;
    enemies.push({
      type: 'tank',
      x,
      y,
      r: 20,
      hp,
      maxHp: hp,
      speed: 0.95,
      dmg: 14,
      color: '#ff8800',
      sides: 5,
      xp: 3,
      gold: 3,
      pushX: 0,
      pushY: 0,
    });
  } else if (type === 'runner') {
    const hp = 10 + elapsed * 0.35;
    enemies.push({
      type: 'runner',
      x,
      y,
      r: 12,
      hp,
      maxHp: hp,
      speed: 2.05,
      dmg: 8,
      color: '#ff2a85',
      sides: 4,
      xp: 1,
      gold: 1,
      pushX: 0,
      pushY: 0,
    });
  } else {
    const hp = 14 + elapsed * 0.5;
    enemies.push({
      type: 'normal',
      x,
      y,
      r: 14,
      hp,
      maxHp: hp,
      speed: 1.35,
      dmg: 10,
      color: '#ff4422',
      sides: 3,
      xp: 1,
      gold: 1,
      pushX: 0,
      pushY: 0,
    });
  }
}

function damageEnemy(e: Enemy, dmg: number): void {
  const finalDmg = Math.round(dmg * player.dmgMult);
  e.hp -= finalDmg;
  addFloatText(e.x, e.y - e.r, `${finalDmg}`, finalDmg > 25 ? '#ffea00' : '#ffffff', finalDmg > 25 ? 16 : 13);
}

function findNearestEnemy(fromX: number, fromY: number, excludeSet: Set<Enemy> | null = null): Enemy | null {
  let best: Enemy | null = null;
  let minDist = 700;
  for (const e of enemies) {
    if (excludeSet && excludeSet.has(e)) continue;
    const d = Math.hypot(e.x - fromX, e.y - fromY);
    if (d < minDist) {
      minDist = d;
      best = e;
    }
  }
  return best;
}

function updateHud(): void {
  document.getElementById('hpEl')!.textContent = `HP: ${Math.max(0, Math.ceil(player.hp))} / ${player.maxHp}`;
  document.getElementById('lvlEl')!.textContent = `УР: ${player.lvl}`;
  document.getElementById('killsEl')!.textContent = `FRAGS: ${player.kills}`;
  document.getElementById('goldEl')!.innerHTML = `<span class="coin">C</span> +${player.runGold} CR`;

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(Math.floor(elapsed % 60)).padStart(2, '0');
  document.getElementById('timeEl')!.textContent = `${mins}:${secs}`;
  document.getElementById('xpFill')!.style.width = `${Math.min(100, (player.xp / player.nextXp) * 100)}%`;

  const sb = document.getElementById('skillsBar')!;
  sb.innerHTML = Object.entries(player.skills)
    .map(([k, lvl]) => `<span class="skill-tag">${SKILLS[k].name} Ур.${lvl}</span>`)
    .join('');
}

function update(dt: number): void {
  if (state !== 'PLAYING') return;
  elapsed += dt / 60;
  updateHud();
  if (player.invuln > 0) player.invuln -= dt;

  // 1. ДВИЖЕНИЕ ИГРОКА (Клавиатура или виртуальный джойстик)
  let mx = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0);
  let my = (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0) - (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0);

  if (mx !== 0 || my !== 0) {
    const len = Math.hypot(mx, my);
    mx /= len;
    my /= len;
  } else if (joy.active) {
    mx = joy.dx;
    my = joy.dy;
  }

  const isMoving = mx !== 0 || my !== 0;
  player.isMoving = isMoving;

  // Плавный поворот корабля по направлению движения
  if (isMoving) {
    const targetAngle = Math.atan2(my, mx);
    let diff = targetAngle - player.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    player.angle += diff * 0.22;

    // Реактивные искры из двигателей
    if (Math.random() < 0.45) {
      const tailX = player.x - Math.cos(player.angle) * (player.r + 2);
      const tailY = player.y - Math.sin(player.angle) * (player.r + 2);
      particles.push({
        x: tailX,
        y: tailY,
        vx: -Math.cos(player.angle) * 2.5 + (Math.random() - 0.5),
        vy: -Math.sin(player.angle) * 2.5 + (Math.random() - 0.5),
        life: 0.4,
        color: player.color,
      });
    }
  }

  player.x += mx * player.speed * dt;
  player.y += my * player.speed * dt;

  // 2. АВТОМАТИЧЕСКОЕ ОРУЖИЕ
  // 2.1 Авто-бластер
  const blasterLvl = player.skills.blaster || 0;
  if (blasterLvl > 0) {
    player.timers.blaster -= dt;
    if (player.timers.blaster <= 0) {
      const target = findNearestEnemy(player.x, player.y);
      if (target) {
        const baseA = Math.atan2(target.y - player.y, target.x - player.x);
        const count = blasterLvl;
        for (let i = 0; i < count; i++) {
          const a = baseA + (i - (count - 1) / 2) * 0.14;
          bullets.push({
            type: 'blaster',
            x: player.x,
            y: player.y,
            vx: Math.cos(a) * 10.5,
            vy: Math.sin(a) * 10.5,
            dmg: 12 + blasterLvl * 3,
            r: 5,
            color: '#00ffcc',
            life: 75,
            bounces: 0,
            lastHit: null,
          });
        }
        player.timers.blaster = Math.max(14, 34 - blasterLvl * 4);
      }
    }
  }

  // 2.2 Цепная молния
  const lightLvl = player.skills.lightning || 0;
  if (lightLvl > 0) {
    player.timers.lightning -= dt;
    if (player.timers.lightning <= 0 && enemies.length > 0) {
      let curX = player.x;
      let curY = player.y;
      const hitSet = new Set<Enemy>();
      const jumps = 2 + lightLvl;
      const points = [{ x: player.x, y: player.y }];

      for (let j = 0; j < jumps; j++) {
        const t = findNearestEnemy(curX, curY, hitSet);
        if (!t || Math.hypot(t.x - curX, t.y - curY) > 360) break;
        hitSet.add(t);
        points.push({ x: t.x, y: t.y });
        damageEnemy(t, 16 + lightLvl * 6);
        addParticles(t.x, t.y, '#b829ff', 6, 3);
        curX = t.x;
        curY = t.y;
      }

      if (points.length > 1) {
        lightningArcs.push({ points, life: 1 });
        player.timers.lightning = Math.max(38, 75 - lightLvl * 7);
      }
    }
  }

  // 2.3 Сверхновая (Нова)
  const novaLvl = player.skills.nova || 0;
  if (novaLvl > 0) {
    player.timers.nova -= dt;
    if (player.timers.nova <= 0) {
      const maxR = 135 + novaLvl * 28;
      novaWaves.push({ x: player.x, y: player.y, r: 10, maxR });
      for (const e of enemies) {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < maxR) {
          damageEnemy(e, 18 + novaLvl * 7);
          const a = Math.atan2(e.y - player.y, e.x - player.x);
          e.pushX = Math.cos(a) * 9;
          e.pushY = Math.sin(a) * 9;
        }
      }
      player.timers.nova = Math.max(75, 130 - novaLvl * 10);
    }
  }

  // 2.4 Рикошет-диск (Чакрам)
  const chakramLvl = player.skills.chakram || 0;
  if (chakramLvl > 0) {
    player.timers.chakram -= dt;
    if (player.timers.chakram <= 0) {
      const t = findNearestEnemy(player.x, player.y);
      if (t) {
        const a = Math.atan2(t.y - player.y, t.x - player.x);
        bullets.push({
          type: 'chakram',
          x: player.x,
          y: player.y,
          vx: Math.cos(a) * 8.5,
          vy: Math.sin(a) * 8.5,
          dmg: 15 + chakramLvl * 5,
          r: 9,
          color: '#ffea00',
          life: 140,
          bounces: 2 + chakramLvl,
          lastHit: null,
        });
        player.timers.chakram = 62;
      }
    }
  }

  // 2.5 Орбитальные клинки
  const bladeLvl = player.skills.blades || 0;
  player.timers.bladeAngle += (0.06 + bladeLvl * 0.01) * dt;
  const bladePositions: { x: number; y: number; r: number }[] = [];
  if (bladeLvl > 0) {
    const count = bladeLvl + 1;
    for (let i = 0; i < count; i++) {
      const a = player.timers.bladeAngle + (i * Math.PI * 2) / count;
      bladePositions.push({
        x: player.x + Math.cos(a) * 68,
        y: player.y + Math.sin(a) * 68,
        r: 11,
      });
    }
  }

  // 3. СНАРЯДЫ
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }

    let removeBullet = false;
    for (const e of enemies) {
      if (b.lastHit === e) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
        damageEnemy(e, b.dmg);
        addParticles(b.x, b.y, b.color, 5, 2.5);
        b.lastHit = e;

        if (b.bounces > 0) {
          b.bounces--;
          const nextTarget = findNearestEnemy(b.x, b.y, new Set([e]));
          if (nextTarget) {
            const na = Math.atan2(nextTarget.y - b.y, nextTarget.x - b.x);
            b.vx = Math.cos(na) * 8.5;
            b.vy = Math.sin(na) * 8.5;
          } else {
            b.vx *= -1;
            b.vy *= -1;
          }
        } else {
          removeBullet = true;
        }
        break;
      }
    }

    if (removeBullet) {
      bullets.splice(i, 1);
    }
  }

  // 4. СПАВН И ПОВЕДЕНИЕ ВРАГОВ
  if (elapsed >= nextBossTime) {
    nextBossTime += 45;
    spawnEnemy('boss');
    addFloatText(player.x, player.y - 50, 'ВНИМАНИЕ: БОСС НА АРЕНЕ!', '#ff0055', 20);
  }

  const maxEnemies = Math.min(48, 8 + Math.floor(elapsed * 0.45));
  spawnTimer -= dt / 60;
  if (spawnTimer <= 0) {
    if (enemies.length < maxEnemies) {
      const r = Math.random();
      if (elapsed > 30 && r < 0.22) spawnEnemy('tank');
      else if (elapsed > 15 && r < 0.5) spawnEnemy('runner');
      else spawnEnemy('normal');
    }
    spawnTimer = Math.max(0.28, 1.15 - elapsed * 0.008);
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.bladeCd && e.bladeCd > 0) e.bladeCd -= dt;

    // Урон от клинков
    for (const bl of bladePositions) {
      if (Math.hypot(e.x - bl.x, e.y - bl.y) < e.r + bl.r && (!e.bladeCd || e.bladeCd <= 0)) {
        damageEnemy(e, 11 + bladeLvl * 4);
        e.bladeCd = 18;
        addParticles(e.x, e.y, '#ff2a85', 4, 2);
      }
    }

    // Расталкивание врагов (чтобы не слипались в одну точку)
    for (let j = 0; j < enemies.length; j++) {
      if (i === j) continue;
      const other = enemies[j];
      const sepDist = Math.hypot(other.x - e.x, other.y - e.y);
      const minSep = e.r + other.r;
      if (sepDist > 0 && sepDist < minSep) {
        const overlap = (minSep - sepDist) * 0.08;
        const sa = Math.atan2(e.y - other.y, e.x - other.x);
        e.x += Math.cos(sa) * overlap;
        e.y += Math.sin(sa) * overlap;
      }
    }

    if (e.hp <= 0) {
      addParticles(e.x, e.y, e.color, e.type === 'boss' ? 35 : 10, 4);
      player.kills++;
      player.runGold += e.gold;
      save.gold += e.gold;
      gems.push({ x: e.x, y: e.y, xp: e.xp, isBoss: e.type === 'boss' });
      enemies.splice(i, 1);
      continue;
    }

    const a = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += (Math.cos(a) * e.speed + e.pushX) * dt;
    e.y += (Math.sin(a) * e.speed + e.pushY) * dt;
    e.pushX *= Math.pow(0.85, dt);
    e.pushY *= Math.pow(0.85, dt);

    // Контакт с игроком
    if (Math.hypot(e.x - player.x, e.y - player.y) < e.r + player.r && player.invuln <= 0) {
      player.hp -= e.dmg;
      player.invuln = 35;
      addFloatText(player.x, player.y - 20, `-${e.dmg} HP`, '#ff0055', 16);

      if (player.hp <= 0) {
        state = 'MENU';
        save.telemetry.bestSurvivalSec = Math.max(save.telemetry.bestSurvivalSec, Math.round(elapsed));
        save.telemetry.maxLevelReached = Math.max(save.telemetry.maxLevelReached, player.lvl);
        save.telemetry.totalKills += player.kills;
        save.telemetry.runsHistory.push({
          survivalSec: Math.round(elapsed),
          lvl: player.lvl,
          kills: player.kills,
          hero: CLASSES[save.selectedClass].name,
        });
        saveGame();
        renderMenu(
          `Забег завершен! Время: ${Math.round(elapsed)} сек | Уровень: ${player.lvl} | Добыто: +${player.runGold} CR`
        );
        document.getElementById('menuModal')!.style.display = 'flex';
        return;
      }
    }
  }

  // 5. КРИСТАЛЛЫ ОПЫТА И МАГНИТ
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i];
    const d = Math.hypot(player.x - g.x, player.y - g.y);
    if (d < player.magnetR) {
      const pull = (1 - d / player.magnetR) * 8 + 3;
      g.x += ((player.x - g.x) / d) * pull * dt;
      g.y += ((player.y - g.y) / d) * pull * dt;
    }
    if (d < player.r + 10) {
      if (g.isBoss) {
        player.hp = Math.min(player.maxHp, player.hp + 40);
        addFloatText(player.x, player.y - 30, 'ТРОФЕЙ БОССА: +40 HP!', '#ffd700', 18);
      }
      player.xp += g.xp;
      gems.splice(i, 1);

      if (player.xp >= player.nextXp) {
        player.xp -= player.nextXp;
        player.lvl++;
        player.nextXp = Math.floor(player.nextXp * 1.32 + 4);
        openLevelUp();
        return;
      }
    }
  }

  // 6. ЭФФЕКТЫ
  for (let i = novaWaves.length - 1; i >= 0; i--) {
    novaWaves[i].r += 7 * dt;
    if (novaWaves[i].r >= novaWaves[i].maxR) novaWaves.splice(i, 1);
  }
  for (let i = lightningArcs.length - 1; i >= 0; i--) {
    lightningArcs[i].life -= 0.08 * dt;
    if (lightningArcs[i].life <= 0) lightningArcs.splice(i, 1);
  }
  for (let i = floatTexts.length - 1; i >= 0; i--) {
    floatTexts[i].y -= 0.9 * dt;
    floatTexts[i].life -= 0.03 * dt;
    if (floatTexts[i].life <= 0) floatTexts.splice(i, 1);
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= 0.04 * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function draw(): void {
  ctx.fillStyle = '#06070d';
  ctx.fillRect(0, 0, W, H);
  if (state === 'MENU') return;

  ctx.save();
  // Камера центрируется на герое
  const camX = W / 2 - player.x;
  const camY = H / 2 - player.y;
  ctx.translate(camX, camY);

  // Бесконечная неоновая сетка пола
  const gridSize = 90;
  const startX = Math.floor((player.x - W / 2) / gridSize) * gridSize;
  const startY = Math.floor((player.y - H / 2) / gridSize) * gridSize;
  ctx.strokeStyle = 'rgba(0, 255, 204, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = startX; x < player.x + W / 2 + gridSize; x += gridSize) {
    ctx.moveTo(x, player.y - H / 2);
    ctx.lineTo(x, player.y + H / 2);
  }
  for (let y = startY; y < player.y + H / 2 + gridSize; y += gridSize) {
    ctx.moveTo(player.x - W / 2, y);
    ctx.lineTo(player.x + W / 2, y);
  }
  ctx.stroke();

  // Волны Сверхновой
  for (const nw of novaWaves) {
    ctx.strokeStyle = `rgba(0, 255, 204, ${1 - nw.r / nw.maxR})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(nw.x, nw.y, nw.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Кристаллы опыта
  for (const g of gems) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = g.isBoss ? '#ffd700' : '#00ffcc';
    ctx.fillStyle = g.isBoss ? '#ffd700' : g.xp > 1 ? '#b829ff' : '#00ffcc';
    const r = g.isBoss ? 10 : 5.5;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - r);
    ctx.lineTo(g.x + r, g.y);
    ctx.lineTo(g.x, g.y + r);
    ctx.lineTo(g.x - r, g.y);
    ctx.closePath();
    ctx.fill();
  }

  // Враги
  for (const e of enemies) {
    ctx.shadowBlur = 14;
    ctx.shadowColor = e.color;
    ctx.strokeStyle = e.color;
    ctx.lineWidth = e.type === 'boss' ? 4 : 3;
    ctx.beginPath();
    for (let k = 0; k < e.sides; k++) {
      const a = (k * Math.PI * 2) / e.sides + elapsed * 1.5;
      const px = e.x + Math.cos(a) * e.r;
      const py = e.y + Math.sin(a) * e.r;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    if (e.hp < e.maxHp || e.type === 'boss') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(e.x - e.r, e.y - e.r - 10, e.r * 2, 4);
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x - e.r, e.y - e.r - 10, e.r * 2 * Math.max(0, e.hp / e.maxHp), 4);
    }
  }

  // Снаряды
  for (const b of bullets) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = b.color;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Молнии
  for (const arc of lightningArcs) {
    ctx.strokeStyle = `rgba(184, 41, 255, ${arc.life})`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffcc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    arc.points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
  }

  // Орбитальные клинки
  const bladeLvl = player.skills.blades || 0;
  if (bladeLvl > 0) {
    const count = bladeLvl + 1;
    for (let i = 0; i < count; i++) {
      const a = player.timers.bladeAngle + (i * Math.PI * 2) / count;
      const bx = player.x + Math.cos(a) * 68;
      const by = player.y + Math.sin(a) * 68;
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#ff2a85';
      ctx.fillStyle = '#ff2a85';
      ctx.beginPath();
      ctx.arc(bx, by, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Игрок (космический корабль / кибер-дрон со скином)
  if (Math.floor(player.invuln) % 4 < 3) {
    drawShip(ctx, player.x, player.y, player.r, player.angle, player.skinId, player.color, player.isMoving);
  }

  // Частицы и текст урона
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  for (const ft of floatTexts) {
    ctx.globalAlpha = Math.max(0, ft.life);
    ctx.font = `800 ${ft.size}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = ft.color;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Виртуальный экранный джойстик при таче / зажатой мыши
  if (joy.active) {
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(joy.startX, joy.startY, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 255, 204, 0.6)';
    ctx.beginPath();
    ctx.arc(joy.startX + joy.dx * 28, joy.startY + joy.dy * 28, 16, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop(now: number): void {
  const dt = Math.min(2.5, (now - lastTime) / 16.667);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// Привязка кнопок интерфейса
document.getElementById('startBtn')!.onclick = startGame;

// --- ЛОГИКА "МНЕ СКУЧНО" (ЧИСТКА КОВРА) ---
const videoList = ['./videos/carpet1.mp4', './videos/carpet2.mp4', './videos/carpet3.mp4'];
let currentVideoIdx = 0;

const boredomBtn = document.getElementById('boredomBtn')!;
const boredomModal = document.getElementById('boredomModal')!;
const boredomVideo = document.getElementById('boredomVideo') as HTMLVideoElement;
const boredomNextBtn = document.getElementById('boredomNextBtn')!;
const boredomCloseBtn = document.getElementById('boredomCloseBtn')!;

function switchVideo(): void {
  currentVideoIdx = (currentVideoIdx + 1) % videoList.length;
  boredomVideo.src = videoList[currentVideoIdx];
  boredomVideo.load();
  boredomVideo.play().catch(() => {});
}

function openBoredom(): void {
  boredomModal.style.display = 'block';
  boredomBtn.classList.add('active');
  boredomVideo.play().catch(() => {});
}

// При нажатии на кнопку "МНЕ СКУЧНО":
// Если окно закрыто — открывает.
// Если окно уже открыто — переключает на следующее видео!
boredomBtn.onclick = () => {
  const isVisible = boredomModal.style.display === 'block';
  if (!isVisible) {
    openBoredom();
  } else {
    switchVideo();
  }
};

// Синяя кнопка в окне переключает на следующее видео
boredomNextBtn.onclick = switchVideo;

// Закрытие окна ТОЛЬКО по крестику
boredomCloseBtn.onclick = () => {
  boredomModal.style.display = 'none';
  boredomBtn.classList.remove('active');
  boredomVideo.pause();
};

renderMenu();
requestAnimationFrame(loop);


