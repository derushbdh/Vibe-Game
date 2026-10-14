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
type SoundType =
  | 'levelup'
  | 'upgrade'
  | 'blaster'
  | 'lightning'
  | 'nova'
  | 'chakram'
  | 'enemy_shoot'
  | 'player_hit'
  | 'heal'
  | 'explosion'
  | 'boss_spawn';

let audioCtx: AudioContext | null = null;
function playSound(type: SoundType): void {
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
    } else if (type === 'blaster') {
      // Классический аркадный лазерный выстрел
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'lightning') {
      // Высоковольтный треск цепной молнии
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.linearRampToValueAtTime(280, now + 0.06);
      osc.frequency.linearRampToValueAtTime(900, now + 0.11);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'nova') {
      // Низкочастотный резонансный импульс сверхновой
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.28);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.29);
    } else if (type === 'chakram') {
      // Звенящий вибрирующий свист рикошет-диска
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'enemy_shoot') {
      // Чужеродный плазменный плевок врага
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'player_hit') {
      // Предупреждающий плотный удар по корпусу
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'heal') {
      // Гармоничный двухнотный перелив исцеления
      [659.25, 987.77].forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } else if (type === 'explosion') {
      // Глубокий рокот детонации камикадзе
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (type === 'boss_spawn') {
      // Тревожная кибер-сирена появления босса
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.32);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
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
    drone: number;
    regen?: number;
  };
  invuln: number;
}

interface Enemy {
  type: 'normal' | 'runner' | 'tank' | 'boss' | 'shooter' | 'kamikaze';
  bossType?: 'dreadnought' | 'archon' | 'singularity';
  bossName?: string;
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
  shootCooldown?: number;
  bossTimer?: number;
  dashTime?: number;
  specialTimer?: number;
  fieldRadius?: number;
  fieldZapTimer?: number;
  burstCount?: number;
  burstTimer?: number;
  spinAngle?: number;
}

interface CompanionDrone {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  recoil: number;
  bobPhase: number;
}

interface Bullet {
  type: 'blaster' | 'chakram' | 'drone';
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

interface EnemyBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  r: number;
  color: string;
  life: number;
  isExplosive?: boolean;
  blastRadius?: number;
}

interface MedKit {
  x: number;
  y: number;
  heal: number;
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
  drone: {
    name: 'Дрон-спутник',
    desc: 'Боевой автономный дрон летает рядом с кораблем и бегло расстреливает цели',
    max: 5,
    type: 'weapon',
    color: '#00e5ff',
    icon: '🛸',
  },
  regen: {
    name: 'Нано-регенерация',
    desc: 'Постепенно восстанавливает здоровье корабля (+1.5 HP/сек за уровень)',
    max: 5,
    type: 'passive',
    color: '#10b981',
    icon: '💚',
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

  // Кнопка переключения Хардкор-режима
  const hardcoreBtn = document.getElementById('hardcoreBtn');
  if (hardcoreBtn) {
    const maxLvl = save.telemetry.maxLevelReached || 1;
    if (maxLvl < 15) {
      hardcoreBtn.className = 'btn-hardcore locked';
      hardcoreBtn.innerHTML = `🔒 ХАРДКОР (НУЖЕН 15 УР, ТЕКУЩИЙ: ${maxLvl})`;
      hardcoreBtn.onclick = () => {
        const lastRunBanner = document.getElementById('lastRunBanner')!;
        lastRunBanner.innerHTML = `<span style="color:#ff4444;font-weight:700">Хардкор откроется при достижении 15 уровня в любом забеге! (Ваш максимум: ${maxLvl} ур.)</span>`;
      };
    } else {
      if (isHardcore) {
        hardcoreBtn.className = 'btn-hardcore active';
        hardcoreBtn.innerHTML = '☠ ХАРДКОР: ВКЛ (x2 CR)';
      } else {
        hardcoreBtn.className = 'btn-hardcore unlocked';
        hardcoreBtn.innerHTML = '☠ ВКЛЮЧИТЬ ХАРДКОР (x2 CR)';
      }
      hardcoreBtn.onclick = () => {
        isHardcore = !isHardcore;
        playSound('upgrade');
        renderMenu();
      };
    }
  }
}

// --- ПЕРЕМЕННЫЕ ИГРОВОГО МИРА ---
let state: 'MENU' | 'PLAYING' | 'LEVEL_UP' | 'PAUSED' = 'MENU';
let isHardcore = false;
let lastTime = performance.now();
let elapsed = 0;
let spawnTimer = 0;
let bossSpawnCount = 0;
let bossWarningTimer = 0;
let bossWarningText = '';
let bossWarningSub = '';
let bossWarningColor = '#ff0055';

let player!: Player;
let bullets: Bullet[] = [];
let enemyBullets: EnemyBullet[] = [];
let enemies: Enemy[] = [];
let gems: Gem[] = [];
let medkits: MedKit[] = [];
let floatTexts: FloatText[] = [];
let particles: Particle[] = [];
let lightningArcs: LightningArc[] = [];
let novaWaves: NovaWave[] = [];
let companionDrones: CompanionDrone[] = [];

// Игровые параметры сложности и баланса
// Активация Фазы 2 (босс) по количеству убийств: 45 фрагов уничтожаются в среднем за ~50 секунд боя
const BOSS_KILLS_THRESHOLD_NORMAL = 45; // Убийств врагов до появления босса (~50 сек)
const BOSS_KILLS_THRESHOLD_HARDCORE = 35; // В хардкоре требуется 35 убийств
let nextBossKills = BOSS_KILLS_THRESHOLD_NORMAL;
const MAX_ENEMIES_CAP = 75; // Максимальная плотность толпы врагов (было 50)
const BASE_ENEMIES_COUNT = 14; // Начальное количество врагов (было 8)
const ENEMY_SPEED_SCALING_PER_SEC = 0.0014; // Плавное ускорение врагов (+8.4% за минуту)
const MEDKIT_BASE_DROP_CHANCE = 0.02; // Базовый шанс выпадения аптечки (2%)
const MEDKIT_PITY_INCREMENT = 0.002; // Накопительный шанс за каждого убитого врага (+0.2%)
const MEDKIT_HEAL_AMOUNT = 8; // Объем лечения от одной аптечки
let currentMedkitDropChance = MEDKIT_BASE_DROP_CHANCE;

const keys: Record<string, boolean> = {};
const joy = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, dx: 0, dy: 0 };

function togglePause(paused: boolean): void {
  const pauseModal = document.getElementById('pauseModal');
  if (paused && state === 'PLAYING') {
    state = 'PAUSED';
    joy.active = false;
    joy.dx = joy.dy = 0;
    pauseBoredom();
    if (boredomBtn) boredomBtn.style.pointerEvents = 'none';
    if (boredomModal) boredomModal.style.pointerEvents = 'none';
    if (pauseModal) pauseModal.style.display = 'flex';
  } else if (!paused && state === 'PAUSED') {
    state = 'PLAYING';
    lastTime = performance.now();
    resumeBoredom();
    if (boredomBtn) boredomBtn.style.pointerEvents = 'auto';
    if (boredomModal) boredomModal.style.pointerEvents = 'auto';
    if (pauseModal) pauseModal.style.display = 'none';
  }
}

function surrenderRun(): void {
  const pauseModal = document.getElementById('pauseModal');
  if (pauseModal) pauseModal.style.display = 'none';
  closeBoredom();
  if (boredomBtn) boredomBtn.style.pointerEvents = 'none';
  if (boredomModal) boredomModal.style.pointerEvents = 'none';
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
  renderMenu(`Забег завершен (сдались)! Время: ${Math.round(elapsed)} сек | Уровень: ${player.lvl} | Добыто: +${player.runGold} CR`);
  document.getElementById('menuModal')!.style.display = 'flex';
}

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Escape') {
    if (state === 'PLAYING') {
      togglePause(true);
    } else if (state === 'PAUSED') {
      togglePause(false);
    }
  }
});
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
  if (boredomBtn) boredomBtn.style.pointerEvents = 'auto';
  if (boredomModal) boredomModal.style.pointerEvents = 'auto';
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
    timers: { blaster: 0, lightning: 0, nova: 0, chakram: 0, bladeAngle: 0, drone: 0, regen: 0 },
    invuln: 0,
  };

  const pauseModal = document.getElementById('pauseModal');
  if (pauseModal) pauseModal.style.display = 'none';

  bullets = [];
  enemyBullets = [];
  enemies = [];
  gems = [];
  medkits = [];
  floatTexts = [];
  particles = [];
  lightningArcs = [];
  novaWaves = [];
  companionDrones = [];
  elapsed = 0;
  spawnTimer = 1.0;
  nextBossKills = isHardcore ? BOSS_KILLS_THRESHOLD_HARDCORE : BOSS_KILLS_THRESHOLD_NORMAL;
  bossSpawnCount = 0;
  bossWarningTimer = 0;
  currentMedkitDropChance = MEDKIT_BASE_DROP_CHANCE;
  state = 'PLAYING';
  lastTime = performance.now();

  const hcPill = document.getElementById('hardcorePill');
  if (hcPill) hcPill.style.display = isHardcore ? 'inline-block' : 'none';

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
  pauseBoredom();
  if (boredomBtn) boredomBtn.style.pointerEvents = 'none';
  if (boredomModal) boredomModal.style.pointerEvents = 'none';
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
      if (k === 'regen') {
        player.hp = Math.min(player.maxHp, player.hp + 12);
        addFloatText(player.x, player.y - 15, '+12 HP', '#10b981', 16);
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
        resumeBoredom();
        if (boredomBtn) boredomBtn.style.pointerEvents = 'auto';
        if (boredomModal) boredomModal.style.pointerEvents = 'auto';
        updateHud();
      }
    };
    box.appendChild(div);
  });

  document.getElementById('levelModal')!.style.display = 'flex';
}

function spawnEnemy(
  type: 'normal' | 'runner' | 'tank' | 'boss' | 'shooter' | 'kamikaze' = 'normal',
  bossKind?: 'dreadnought' | 'archon' | 'singularity'
): void {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.max(W, H) * 0.58 + 60;
  const x = player.x + Math.cos(angle) * dist;
  const y = player.y + Math.sin(angle) * dist;

  const hcHpMult = isHardcore ? 1.45 : 1.0;
  const hcSpeedMult = isHardcore ? 1.25 : 1.0;

  if (type === 'boss') {
    const kind = bossKind || 'dreadnought';
    if (kind === 'archon') {
      const hp = Math.round((1300 + elapsed * 14) * hcHpMult);
      enemies.push({
        type: 'boss',
        bossType: 'archon',
        bossName: 'ШТОРМ-АРХОНТ ТЕСЛЫ',
        x,
        y,
        r: 36,
        hp,
        maxHp: hp,
        speed: 1.25 * hcSpeedMult,
        dmg: 28,
        color: '#b829ff',
        sides: 8,
        xp: 22,
        gold: 35,
        pushX: 0,
        pushY: 0,
        bossTimer: 75,
        specialTimer: 140,
        dashTime: 0,
        fieldRadius: 195,
        fieldZapTimer: 25,
        burstCount: 0,
        burstTimer: 0,
        spinAngle: 0,
      });
    } else if (kind === 'singularity') {
      const hp = Math.round((1800 + elapsed * 18) * hcHpMult);
      enemies.push({
        type: 'boss',
        bossType: 'singularity',
        bossName: 'СИНГУЛЯРНОСТЬ БЕЗДНЫ',
        x,
        y,
        r: 38,
        hp,
        maxHp: hp,
        speed: 1.2 * hcSpeedMult,
        dmg: 30,
        color: '#ff6600',
        sides: 10,
        xp: 28,
        gold: 50,
        pushX: 0,
        pushY: 0,
        bossTimer: 35,
        specialTimer: 180,
        dashTime: 0,
      });
    } else {
      const hp = Math.round((850 + elapsed * 10) * hcHpMult);
      enemies.push({
        type: 'boss',
        bossType: 'dreadnought',
        bossName: 'КИБЕР-ДРЕДНОУТ',
        x,
        y,
        r: 34,
        hp,
        maxHp: hp,
        speed: 1.35 * hcSpeedMult,
        dmg: 26,
        color: '#ff0055',
        sides: 6,
        xp: 18,
        gold: 30,
        pushX: 0,
        pushY: 0,
        bossTimer: 70,
        specialTimer: 120,
        dashTime: 0,
      });
    }
  } else if (type === 'tank') {
    const hp = Math.round((32 + elapsed * 0.9) * (isHardcore ? 1.35 : 1.0));
    enemies.push({
      type: 'tank',
      x,
      y,
      r: 20,
      hp,
      maxHp: hp,
      speed: 0.95 * hcSpeedMult,
      dmg: 14,
      color: '#ff8800',
      sides: 5,
      xp: 3,
      gold: 3,
      pushX: 0,
      pushY: 0,
    });
  } else if (type === 'shooter') {
    const hp = Math.round((16 + elapsed * 0.45) * (isHardcore ? 1.35 : 1.0));
    enemies.push({
      type: 'shooter',
      x,
      y,
      r: 15,
      hp,
      maxHp: hp,
      speed: 1.15 * hcSpeedMult,
      dmg: 8,
      color: '#ff3366',
      sides: 8,
      xp: 2,
      gold: 2,
      pushX: 0,
      pushY: 0,
      shootCooldown: 40 + Math.random() * 50,
    });
  } else if (type === 'kamikaze') {
    const hp = Math.round((8 + elapsed * 0.25) * (isHardcore ? 1.35 : 1.0));
    enemies.push({
      type: 'kamikaze',
      x,
      y,
      r: 11,
      hp,
      maxHp: hp,
      speed: 3.35 * hcSpeedMult,
      dmg: 14,
      color: '#ff3b00',
      sides: 3,
      xp: 2,
      gold: 2,
      pushX: 0,
      pushY: 0,
    });
  } else if (type === 'runner') {
    const hp = Math.round((10 + elapsed * 0.35) * (isHardcore ? 1.35 : 1.0));
    enemies.push({
      type: 'runner',
      x,
      y,
      r: 12,
      hp,
      maxHp: hp,
      speed: 2.05 * hcSpeedMult,
      dmg: 8,
      color: '#ff2a85',
      sides: 4,
      xp: 1,
      gold: 1,
      pushX: 0,
      pushY: 0,
    });
  } else {
    const hp = Math.round((14 + elapsed * 0.5) * (isHardcore ? 1.35 : 1.0));
    enemies.push({
      type: 'normal',
      x,
      y,
      r: 14,
      hp,
      maxHp: hp,
      speed: 1.35 * hcSpeedMult,
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
  let finalDmg = Math.round(dmg * player.dmgMult);
  if (e.type === 'boss') {
    // Укрепленная броня боссов (-15% входящего урона)
    finalDmg = Math.max(3, Math.round(finalDmg * 0.85));
  }
  e.hp -= finalDmg;
  addFloatText(e.x, e.y - e.r, `${finalDmg}`, finalDmg > 25 ? '#ffea00' : '#ffffff', finalDmg > 25 ? 16 : 13);
}

function damagePlayer(dmg: number): boolean {
  if (player.invuln > 0) return false;
  player.hp -= dmg;
  player.invuln = 35;
  playSound('player_hit');
  addFloatText(player.x, player.y - 20, `-${dmg} HP`, '#ff0055', 16);

  if (player.hp <= 0) {
    state = 'MENU';
    closeBoredom();
    if (boredomBtn) boredomBtn.style.pointerEvents = 'none';
    if (boredomModal) boredomModal.style.pointerEvents = 'none';
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
    const modeLabel = isHardcore ? ' [ХАРДКОР x2 CR]' : '';
    renderMenu(
      `Забег завершен${modeLabel}! Время: ${Math.round(elapsed)} сек | Уровень: ${player.lvl} | Добыто: +${player.runGold} CR`
    );
    document.getElementById('menuModal')!.style.display = 'flex';
    return true;
  }
  return false;
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
  document.getElementById('killsEl')!.innerHTML = `FRAGS: ${player.kills} <span style="font-size:11px;color:#94a3b8;font-weight:600;">(БОСС: ${Math.min(player.kills, nextBossKills)}/${nextBossKills})</span>`;
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
  if (bossWarningTimer > 0) {
    bossWarningTimer -= dt / 60;
    if (bossWarningTimer < 0) bossWarningTimer = 0;
  }

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

  // 1.1 Нано-регенерация здоровья (пассивный навык)
  const regenLvl = player.skills.regen || 0;
  if (regenLvl > 0 && player.hp < player.maxHp) {
    player.timers.regen = (player.timers.regen || 0) + dt;
    if (player.timers.regen >= 60) {
      player.timers.regen = 0;
      const healAmount = Math.min(player.maxHp - player.hp, Math.round(regenLvl * 1.5));
      if (healAmount > 0) {
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        addFloatText(player.x + (Math.random() - 0.5) * 14, player.y - player.r - 8, `+${healAmount} HP`, '#10b981', 13);
        for (let p = 0; p < 3; p++) {
          particles.push({
            x: player.x + (Math.random() - 0.5) * player.r * 1.2,
            y: player.y + (Math.random() - 0.5) * player.r * 1.2,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -1.2 - Math.random() * 0.8,
            life: 0.4,
            color: '#10b981',
          });
        }
      }
    }
  }

  // 2. АВТОМАТИЧЕСКОЕ ОРУЖИЕ
  // 2.1 Авто-бластер
  const blasterLvl = player.skills.blaster || 0;
  if (blasterLvl > 0) {
    player.timers.blaster -= dt;
    if (player.timers.blaster <= 0) {
      const target = findNearestEnemy(player.x, player.y);
      if (target) {
        playSound('blaster');
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
        playSound('lightning');
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
      playSound('nova');
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
        playSound('chakram');
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

  // 2.6 Боевой дрон-спутник (живое плавное поведение напарника)
  const droneLvl = player.skills.drone || 0;
  if (droneLvl > 0) {
    const desiredCount = droneLvl >= 4 ? 2 : 1;
    while (companionDrones.length < desiredCount) {
      const idx = companionDrones.length;
      companionDrones.push({
        x: player.x - 30,
        y: player.y - 30,
        vx: 0,
        vy: 0,
        angle: player.angle,
        recoil: 0,
        bobPhase: idx * Math.PI,
      });
    }
    while (companionDrones.length > desiredCount) {
      companionDrones.pop();
    }

    for (let d = 0; d < companionDrones.length; d++) {
      const drone = companionDrones[d];
      drone.bobPhase += 0.04 * dt;

      // 1. Позиция следования за кораблем:
      // Дрон держится на фланге позади корабля, словно верный ведомый (wingman)
      const flankAngle = player.angle + Math.PI + (d === 0 ? -0.85 : 0.85);
      const followDist = 48 + Math.sin(drone.bobPhase * 1.4) * 8;
      const hoverX = Math.cos(drone.bobPhase) * 12;
      const hoverY = Math.sin(drone.bobPhase * 1.2) * 10;
      const targetX = player.x + Math.cos(flankAngle) * followDist + hoverX;
      const targetY = player.y + Math.sin(flankAngle) * followDist + hoverY;

      // Плавное пружинное физическое перемещение с мягкой инерцией
      const toTx = targetX - drone.x;
      const toTy = targetY - drone.y;
      drone.vx = drone.vx * 0.82 + toTx * 0.045 * dt;
      drone.vy = drone.vy * 0.82 + toTy * 0.045 * dt;
      drone.x += drone.vx * dt;
      drone.y += drone.vy * dt;

      // 2. Плавный поворот носа дрона:
      // Целится во врага, если он рядом, или смотрит по направлению полета
      const target = findNearestEnemy(drone.x, drone.y);
      let desiredAngle = player.angle;
      if (target && Math.hypot(target.x - drone.x, target.y - drone.y) < 380) {
        desiredAngle = Math.atan2(target.y - drone.y, target.x - drone.x);
      } else if (Math.hypot(drone.vx, drone.vy) > 0.4) {
        desiredAngle = Math.atan2(drone.vy, drone.vx);
      }

      let diffAngle = desiredAngle - drone.angle;
      while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
      while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
      drone.angle += diffAngle * 0.18 * dt;

      if (drone.recoil > 0) drone.recoil -= 0.12 * dt;

      // Искры из микродвигателя при активном маневрировании
      if (Math.hypot(drone.vx, drone.vy) > 1.2 && Math.random() < 0.3) {
        particles.push({
          x: drone.x - Math.cos(drone.angle) * 8,
          y: drone.y - Math.sin(drone.angle) * 8,
          vx: -Math.cos(drone.angle) * 1.5 + (Math.random() - 0.5),
          vy: -Math.sin(drone.angle) * 1.5 + (Math.random() - 0.5),
          life: 0.25,
          color: '#00e5ff',
        });
      }
    }

    // 3. Стрельба дронов
    player.timers.drone -= dt;
    if (player.timers.drone <= 0) {
      for (const drone of companionDrones) {
        const target = findNearestEnemy(drone.x, drone.y);
        if (target && Math.hypot(target.x - drone.x, target.y - drone.y) < 550) {
          playSound('blaster');
          const da = Math.atan2(target.y - drone.y, target.x - drone.x);
          bullets.push({
            type: 'drone',
            x: drone.x + Math.cos(da) * 6,
            y: drone.y + Math.sin(da) * 6,
            vx: Math.cos(da) * 12,
            vy: Math.sin(da) * 12,
            dmg: 11 + droneLvl * 4,
            r: 4.5,
            color: '#00e5ff',
            life: 60,
            bounces: 0,
            lastHit: null,
          });
          drone.recoil = 3.5;
          addParticles(drone.x + Math.cos(da) * 6, drone.y + Math.sin(da) * 6, '#00e5ff', 3, 2);
        }
      }
      player.timers.drone = Math.max(16, 34 - droneLvl * 3.5);
    }
  }

  // 3. СНАРЯДЫ ИГРОКА
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

  // 3.1 СНАРЯДЫ ВРАГОВ
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    eb.x += eb.vx * dt;
    eb.y += eb.vy * dt;
    eb.life -= dt;

    const hitPlayer = Math.hypot(eb.x - player.x, eb.y - player.y) < eb.r + player.r;
    const isExpired = eb.life <= 0;

    // Взрывные снаряды (Оранжевый босс)
    if (eb.isExplosive && (isExpired || hitPlayer)) {
      const blastR = eb.blastRadius || 48;
      novaWaves.push({ x: eb.x, y: eb.y, r: 8, maxR: blastR });
      addParticles(eb.x, eb.y, '#ff6600', 14, 3.5);
      playSound('explosion');

      const distP = Math.hypot(player.x - eb.x, player.y - eb.y);
      if (distP < blastR + player.r && player.invuln <= 0) {
        const isDead = damagePlayer(eb.dmg);
        enemyBullets.splice(i, 1);
        if (isDead) return;
        continue;
      }
      enemyBullets.splice(i, 1);
      continue;
    }

    if (isExpired) {
      enemyBullets.splice(i, 1);
      continue;
    }

    if (hitPlayer) {
      addParticles(eb.x, eb.y, eb.color, 6, 2.5);
      const isDead = damagePlayer(eb.dmg);
      enemyBullets.splice(i, 1);
      if (isDead) return;
    }
  }

  // 4. СПАВН И ПОВЕДЕНИЕ ВРАГОВ
  // Активация 2 фазы (босса) по числу побежденных врагов (набирается примерно за 50 сек боя)
  if (player.kills >= nextBossKills) {
    nextBossKills += isHardcore ? BOSS_KILLS_THRESHOLD_HARDCORE : BOSS_KILLS_THRESHOLD_NORMAL;
    bossSpawnCount++;
    const bossKinds: ('dreadnought' | 'archon' | 'singularity')[] = ['dreadnought', 'archon', 'singularity'];
    const curKind = bossKinds[(bossSpawnCount - 1) % bossKinds.length];
    spawnEnemy('boss', curKind);

    const bossNames = {
      dreadnought: 'КИБЕР-ДРЕДНОУТ',
      archon: 'ШТОРМ-АРХОНТ ТЕСЛЫ',
      singularity: 'СИНГУЛЯРНОСТЬ БЕЗДНЫ',
    };
    const bossColors = {
      dreadnought: '#ff0055',
      archon: '#b829ff',
      singularity: '#ff6600',
    };

    bossWarningTimer = 3.5;
    bossWarningText = `⚠ ВНИМАНИЕ: ${bossNames[curKind]}! ⚠`;
    bossWarningSub = 'ФАЗА 2: БОСС ВЫЗВАН ПО КОЛИЧЕСТВУ УБИЙСТВ';
    bossWarningColor = bossColors[curKind];
    playSound('boss_spawn');
  }

  const maxEnemies = Math.min(MAX_ENEMIES_CAP, BASE_ENEMIES_COUNT + Math.floor(elapsed * 0.65));
  spawnTimer -= dt / 60;
  if (spawnTimer <= 0) {
    const batch = elapsed > 20 ? (Math.random() < 0.5 ? 2 : 1) : 1;
    for (let b = 0; b < batch; b++) {
      if (enemies.length < maxEnemies) {
        const r = Math.random();
        if (elapsed > 40 && r < 0.16) {
          spawnEnemy('tank');
        } else if (elapsed > 25 && r < 0.38) {
          spawnEnemy('shooter');
        } else if (elapsed > 18 && r < 0.58) {
          spawnEnemy('kamikaze');
        } else if (elapsed > 8 && r < 0.8) {
          spawnEnemy('runner');
        } else {
          spawnEnemy('normal');
        }
      }
    }
    spawnTimer = Math.max(0.18, 0.95 - elapsed * 0.007);
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
      if (e.type === 'kamikaze') {
        // Детонация камикадзе: мощный урон по области (AoE взрыв)
        const blastR = 72;
        playSound('explosion');
        addParticles(e.x, e.y, '#ff3b00', 25, 4.5);
        addParticles(e.x, e.y, '#ffea00', 15, 3.5);
        novaWaves.push({ x: e.x, y: e.y, r: 8, maxR: blastR });

        // Урон игроку, если он в радиусе взрыва
        const distP = Math.hypot(player.x - e.x, player.y - e.y);
        if (distP < blastR + player.r && player.invuln <= 0) {
          if (damagePlayer(14)) return;
        }

        // Цепной взрыв по окружающим врагам
        for (const other of enemies) {
          if (other === e) continue;
          const distO = Math.hypot(other.x - e.x, other.y - e.y);
          if (distO < blastR + other.r) {
            damageEnemy(other, 24);
            const sa = Math.atan2(other.y - e.y, other.x - e.x);
            other.pushX += Math.cos(sa) * 7;
            other.pushY += Math.sin(sa) * 7;
          }
        }
      } else {
        addParticles(e.x, e.y, e.color, e.type === 'boss' ? 35 : 10, 4);
      }

      const earnedGold = isHardcore ? e.gold * 2 : e.gold;
      player.kills++;
      player.runGold += earnedGold;
      save.gold += earnedGold;
      gems.push({ x: e.x, y: e.y, xp: e.xp, isBoss: e.type === 'boss' });

      // Накапливающийся шанс выпадения аптечки (pity-timer)
      if (Math.random() < currentMedkitDropChance) {
        medkits.push({ x: e.x, y: e.y, heal: MEDKIT_HEAL_AMOUNT });
        currentMedkitDropChance = MEDKIT_BASE_DROP_CHANCE;
      } else {
        currentMedkitDropChance += MEDKIT_PITY_INCREMENT;
      }

      enemies.splice(i, 1);
      continue;
    }

    // Плавное постепенное ускорение врагов со временем забега
    const effectiveSpeed = e.speed * (1 + elapsed * ENEMY_SPEED_SCALING_PER_SEC);
    const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
    const aimAngle = Math.atan2(player.y - e.y, player.x - e.x);

    let moveAngle = aimAngle;
    let moveSpeed = effectiveSpeed;

    if (e.type === 'boss') {
      // Все боссы неуязвимы к отталкиванию
      e.pushX = 0;
      e.pushY = 0;

      const isEnraged = e.hp < e.maxHp * 0.45;
      const baseSpeed = effectiveSpeed * (isEnraged ? 1.25 : 1.0);
      const bKind = e.bossType || 'dreadnought';

      if (bKind === 'dreadnought') {
        // --- БОСС 1: КИБЕР-ДРЕДНОУТ ---
        // Таранный рывок (Dash) + Веерный залп плазмой
        if (e.dashTime && e.dashTime > 0) {
          e.dashTime -= dt;
          moveSpeed = baseSpeed * 2.6;
          if (Math.random() < 0.6) {
            addParticles(e.x, e.y, isEnraged ? '#ff0033' : '#ff0055', 2, 2.5);
          }
        } else {
          moveSpeed = baseSpeed;
        }

        e.bossTimer = (e.bossTimer || 70) - dt;
        if (e.bossTimer <= 0) {
          const doDash = Math.random() < 0.35 && distToPlayer > 180;
          if (doDash) {
            e.dashTime = 38;
            addFloatText(e.x, e.y - e.r - 15, 'РЫВОК!', isEnraged ? '#ff0033' : '#ff0055', 18);
            e.bossTimer = isEnraged ? 85 : 130;
          } else {
            const bulletCount = isEnraged ? 7 : 5;
            const spread = isEnraged ? 0.95 : 0.75;
            for (let b = 0; b < bulletCount; b++) {
              const bAngle = aimAngle - spread / 2 + (b / (bulletCount - 1)) * spread;
              enemyBullets.push({
                x: e.x + Math.cos(bAngle) * (e.r + 6),
                y: e.y + Math.sin(bAngle) * (e.r + 6),
                vx: Math.cos(bAngle) * 5.4,
                vy: Math.sin(bAngle) * 5.4,
                dmg: Math.round(11 + elapsed * 0.04),
                r: 6,
                color: isEnraged ? '#ff0033' : '#ff0055',
                life: 175,
              });
            }
            playSound('enemy_shoot');
            e.bossTimer = isEnraged ? 90 : 145;
          }
        }
      } else if (bKind === 'archon') {
        // --- БОСС 2: ШТОРМ-АРХОНТ ТЕСЛЫ ---
        // Электрическое поле (бьет током СТРОГО внутри) + Вращающийся залп спиральными шлейфами
        moveSpeed = baseSpeed * 0.92;

        const fieldR = e.fieldRadius || (isEnraged ? 235 : 195);
        e.fieldRadius = fieldR;

        // 1. Урон и разряды в электрическом поле (СТРОГО когда игрок внутри поля)
        if (distToPlayer <= fieldR + player.r) {
          e.fieldZapTimer = (e.fieldZapTimer || 25) - dt;
          if (e.fieldZapTimer <= 0) {
            lightningArcs.push({
              points: [{ x: e.x, y: e.y }, { x: player.x, y: player.y }],
              life: 0.85,
            });
            playSound('lightning');
            const isDead = damagePlayer(9);
            addParticles(player.x, player.y, '#b829ff', 7, 2.5);
            addFloatText(player.x, player.y - 20, 'ТОК ТЕСЛЫ!', '#b829ff', 16);
            e.fieldZapTimer = isEnraged ? 18 : 26;
            if (isDead) return;
          }
        } else {
          // Вне поля таймер находится в готовности, но снаружи поля молния НЕ бьет!
          e.fieldZapTimer = 15;
        }

        // 2. Вращающийся залп шлейфами (Spinning Barrage фиолетовых снарядов)
        if (e.burstCount && e.burstCount > 0) {
          e.burstTimer = (e.burstTimer || 0) - dt;
          if (e.burstTimer <= 0) {
            e.burstTimer = 5; // шаг между волнами шлейфа
            e.burstCount--;
            e.spinAngle = (e.spinAngle || 0) + (isEnraged ? 0.42 : 0.35);

            const streams = isEnraged ? 5 : 4;
            for (let s = 0; s < streams; s++) {
              const bAngle = (s / streams) * Math.PI * 2 + e.spinAngle;
              enemyBullets.push({
                x: e.x + Math.cos(bAngle) * (e.r + 6),
                y: e.y + Math.sin(bAngle) * (e.r + 6),
                vx: Math.cos(bAngle) * 5.0,
                vy: Math.sin(bAngle) * 5.0,
                dmg: Math.round(9 + elapsed * 0.035),
                r: 5.5,
                color: '#b829ff', // Фиолетовые снаряды под цвет Теслы!
                life: 190,
              });
            }
            playSound('enemy_shoot');
          }
        }

        // Таймер перезарядки серии залпов
        e.bossTimer = (e.bossTimer || 80) - dt;
        if (e.bossTimer <= 0) {
          e.burstCount = isEnraged ? 7 : 5; // 5-7 волн в одном шлейфе
          e.burstTimer = 0;
          addFloatText(e.x, e.y - e.r - 15, 'ШТОРМ-СПИРАЛЬ!', '#b829ff', 17);
          e.bossTimer = isEnraged ? 90 : 130;
        }
      } else if (bKind === 'singularity') {
        // --- БОСС 3: СИНГУЛЯРНОСТЬ БЕЗДНЫ ---
        // Гравитационная воронка (засасывает корабль) + Взрывные плазменные залпы + Призыв камикадзе
        moveSpeed = baseSpeed * 0.85;

        // Гравитационное притяжение игрока к центру черной дыры (мягкое притяжение, позволяющее маневрировать)
        const vortexRadius = 320;
        if (distToPlayer < vortexRadius && distToPlayer > e.r + player.r) {
          const pull = (1 - distToPlayer / vortexRadius) * (isEnraged ? 1.35 : 0.9);
          player.x += Math.cos(aimAngle + Math.PI) * pull * dt;
          player.y += Math.sin(aimAngle + Math.PI) * pull * dt;
          if (Math.random() < 0.15) {
            novaWaves.push({ x: e.x, y: e.y, r: 8, maxR: 55 });
          }
        }

        // Взрывные плазменные снаряды: прицельный залп по игроку (с веером при ярости)
        e.bossTimer = (e.bossTimer || 45) - dt;
        if (e.bossTimer <= 0) {
          const shotCount = isEnraged ? 3 : 1;
          const spread = 0.32;
          for (let s = 0; s < shotCount; s++) {
            const bAngle = shotCount === 1 ? aimAngle : aimAngle - spread / 2 + (s / (shotCount - 1)) * spread;
            enemyBullets.push({
              x: e.x + Math.cos(bAngle) * (e.r + 8),
              y: e.y + Math.sin(bAngle) * (e.r + 8),
              vx: Math.cos(bAngle) * 5.2,
              vy: Math.sin(bAngle) * 5.2,
              dmg: Math.round(15 + elapsed * 0.04),
              r: 8.5,
              color: '#ff6600',
              life: 115, // пролетает дальше и взрывается на дистанции или при попадании!
              isExplosive: true,
              blastRadius: 48,
            });
          }
          playSound('nova');
          addFloatText(e.x, e.y - e.r - 15, 'ВЗРЫВНАЯ ПЛАЗМА!', '#ff6600', 16);
          e.bossTimer = isEnraged ? 32 : 48;
        }

        // Спавн дронов-камикадзе
        e.specialTimer = (e.specialTimer || 180) - dt;
        if (e.specialTimer <= 0) {
          addFloatText(e.x, e.y - e.r - 15, 'ПРИЗЫВ КАМИКАДЗЕ!', '#ff6600', 18);
          playSound('explosion');
          const count = isEnraged ? 3 : 2;
          for (let k = 0; k < count; k++) {
            const ka = Math.random() * Math.PI * 2;
            enemies.push({
              type: 'kamikaze',
              x: e.x + Math.cos(ka) * (e.r + 20),
              y: e.y + Math.sin(ka) * (e.r + 20),
              r: 11,
              hp: 6,
              maxHp: 6,
              speed: 3.25,
              dmg: 12,
              color: '#ff3b00',
              sides: 3,
              xp: 1,
              gold: 1,
              pushX: 0,
              pushY: 0,
            });
          }
          e.specialTimer = isEnraged ? 130 : 200;
        }
      }
    } else if (e.type === 'shooter') {
      // Стрелок держит боевую дистанцию (200-330px)
      if (distToPlayer < 200) {
        moveAngle = aimAngle + Math.PI; // отступает
        moveSpeed = effectiveSpeed * 0.85;
      } else if (distToPlayer > 330) {
        moveAngle = aimAngle; // приближается
        moveSpeed = effectiveSpeed;
      } else {
        moveAngle = aimAngle + Math.PI / 2; // стрейфит
        moveSpeed = effectiveSpeed * 0.55;
      }

      // Стрельба по игроку
      if (e.shootCooldown !== undefined) {
        e.shootCooldown -= dt;
        if (e.shootCooldown <= 0 && distToPlayer < 650) {
          enemyBullets.push({
            x: e.x + Math.cos(aimAngle) * (e.r + 5),
            y: e.y + Math.sin(aimAngle) * (e.r + 5),
            vx: Math.cos(aimAngle) * 5.8,
            vy: Math.sin(aimAngle) * 5.8,
            dmg: Math.round(8 + elapsed * 0.03),
            r: 5,
            color: '#ff3366',
            life: 165,
          });
          playSound('enemy_shoot');
          e.shootCooldown = 110 + Math.random() * 40;
        }
      }
    } else if (e.type === 'kamikaze') {
      // Турбо-ускорение дрона-камикадзе при сближении с игроком
      if (distToPlayer < 220) {
        moveSpeed = effectiveSpeed * 1.25;
        if (Math.random() < 0.35) {
          particles.push({
            x: e.x - Math.cos(aimAngle) * (e.r + 3),
            y: e.y - Math.sin(aimAngle) * (e.r + 3),
            vx: -Math.cos(aimAngle) * 2 + (Math.random() - 0.5),
            vy: -Math.sin(aimAngle) * 2 + (Math.random() - 0.5),
            life: 0.25,
            color: Math.random() < 0.5 ? '#ffea00' : '#ff3b00',
          });
        }
      }
    }

    e.x += (Math.cos(moveAngle) * moveSpeed + e.pushX) * dt;
    e.y += (Math.sin(moveAngle) * moveSpeed + e.pushY) * dt;
    e.pushX *= Math.pow(0.85, dt);
    e.pushY *= Math.pow(0.85, dt);

    // Контакт с игроком
    if (distToPlayer < e.r + player.r) {
      if (e.type === 'kamikaze') {
        e.hp = 0; // Врезается в игрока и взрывается
      } else if (player.invuln <= 0) {
        if (damagePlayer(e.dmg)) return;
      }
    }
  }

  // 5. КРИСТАЛЛЫ ОПЫТА И АПТЕЧКИ
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

  for (let i = medkits.length - 1; i >= 0; i--) {
    const mk = medkits[i];
    const d = Math.hypot(player.x - mk.x, player.y - mk.y);
    if (d < player.magnetR) {
      const pull = (1 - d / player.magnetR) * 8 + 3;
      mk.x += ((player.x - mk.x) / d) * pull * dt;
      mk.y += ((player.y - mk.y) / d) * pull * dt;
    }
    if (d < player.r + 10) {
      player.hp = Math.min(player.maxHp, player.hp + mk.heal);
      addFloatText(player.x, player.y - 25, `+${mk.heal} HP`, '#10b981', 16);
      addParticles(mk.x, mk.y, '#10b981', 8, 2.5);
      playSound('heal');
      medkits.splice(i, 1);
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

  // Кристаллы опыта (мягко пульсирующие кристаллы с четкими гранями)
  for (const g of gems) {
    const pulse = 1 + Math.sin(elapsed * 4.5 + g.x * 0.05) * 0.12;
    const r = (g.isBoss ? 11 : 5.5) * pulse;
    ctx.shadowBlur = 10;
    ctx.shadowColor = g.isBoss ? '#ffd700' : '#00ffcc';
    ctx.fillStyle = g.isBoss ? '#ffd700' : g.xp > 1 ? '#00e5ff' : '#00ffcc';
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - r);
    ctx.lineTo(g.x + r * 0.8, g.y);
    ctx.lineTo(g.x, g.y + r);
    ctx.lineTo(g.x - r * 0.8, g.y);
    ctx.closePath();
    ctx.fill();

    // Внутренняя сверкающая грань
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - r * 0.45);
    ctx.lineTo(g.x + r * 0.35, g.y);
    ctx.lineTo(g.x, g.y + r * 0.45);
    ctx.lineTo(g.x - r * 0.35, g.y);
    ctx.closePath();
    ctx.fill();
  }

  // Аптечки (нано-ремонт с неоновым зеленым крестом)
  for (const mk of medkits) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#10b981';
    ctx.beginPath();
    ctx.arc(mk.x, mk.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mk.x - 5, mk.y - 1.5, 10, 3);
    ctx.fillRect(mk.x - 1.5, mk.y - 5, 3, 10);
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

    // Орудийный ствол стрелка
    if (e.type === 'shooter') {
      const aim = Math.atan2(player.y - e.y, player.x - e.x);
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x + Math.cos(aim) * (e.r + 7), e.y + Math.sin(aim) * (e.r + 7));
      ctx.stroke();
    }

    // Пульсирующее ядро камикадзе
    if (e.type === 'kamikaze') {
      const pulse = 0.5 + Math.sin(elapsed * 14) * 0.5;
      ctx.fillStyle = pulse > 0.5 ? '#ffea00' : '#ff3b00';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Силовое кольцо и ядро босса
    if (e.type === 'boss') {
      const isEnraged = e.hp < e.maxHp * 0.45;
      const bKind = e.bossType || 'dreadnought';

      if (bKind === 'archon') {
        const fieldR = e.fieldRadius || (isEnraged ? 235 : 195);

        // Электрическое поле Теслы: эффекты молний строго внутри поля, фон полупрозрачный
        ctx.save();
        ctx.beginPath();
        ctx.arc(e.x, e.y, fieldR, 0, Math.PI * 2);

        // 1. Полупрозрачный фон поля (арена видна сквозь него)
        ctx.fillStyle = isEnraged ? 'rgba(184, 41, 255, 0.12)' : 'rgba(184, 41, 255, 0.07)';
        ctx.fill();

        // Ограничиваем отрисовку молний строго границей круга (clip)
        ctx.clip();

        // 2. Внутренние эффекты молний и искр строго внутри поля
        const boltCount = isEnraged ? 7 : 5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1.4;

        for (let b = 0; b < boltCount; b++) {
          const boltBaseAngle = ((b / boltCount) * Math.PI * 2) + Math.sin(elapsed * 8 + b) * 0.4;
          const targetDist = (fieldR * 0.3) + ((b * 37 + Math.floor(elapsed * 15)) % Math.floor(fieldR * 0.65));
          const tx = e.x + Math.cos(boltBaseAngle) * targetDist;
          const ty = e.y + Math.sin(boltBaseAngle) * targetDist;

          // Ломаная дуга от центра босса
          ctx.beginPath();
          ctx.moveTo(e.x, e.y);
          const midX = (e.x + tx) / 2 + (Math.sin(elapsed * 25 + b * 5) * 8);
          const midY = (e.y + ty) / 2 + (Math.cos(elapsed * 25 + b * 5) * 8);
          ctx.lineTo(midX, midY);
          ctx.lineTo(tx, ty);
          ctx.stroke();

          // Микро-искра на кончике молнии
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(tx, ty, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // 3. Внешняя пульсирующая неоновая граница поля
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#b829ff';
        ctx.strokeStyle = isEnraged ? '#ff00ff' : 'rgba(184, 41, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(e.x, e.y, fieldR + Math.sin(elapsed * 8) * 2.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Внутреннее защитное кольцо босса
        ctx.strokeStyle = isEnraged ? '#00ffff' : '#b829ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r + 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isEnraged ? '#00ffff' : '#ffffff';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (bKind === 'singularity') {
        // Воронка сингулярности с черным центром
        ctx.strokeStyle = isEnraged ? '#ffea00' : 'rgba(255, 102, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r + 11, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#0a0503';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isEnraged ? '#ff3b00' : '#ffea00';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Кибер-Дредноут
        ctx.strokeStyle = isEnraged ? '#ff0033' : 'rgba(255, 0, 85, 0.65)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r + 9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isEnraged ? '#ffea00' : '#ffffff';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (e.hp < e.maxHp || e.type === 'boss') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(e.x - e.r, e.y - e.r - 10, e.r * 2, 4);
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x - e.r, e.y - e.r - 10, e.r * 2 * Math.max(0, e.hp / e.maxHp), 4);
    }
  }

  // Снаряды игрока
  for (const b of bullets) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = b.color;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Снаряды врагов (огненно-красные плазменные иглы со шлейфом опасности и ореолом)
  for (const eb of enemyBullets) {
    const bSpeed = Math.hypot(eb.vx, eb.vy);
    const bAngle = Math.atan2(eb.vy, eb.vx);

    if (eb.isExplosive) {
      // Взрывной плазменный шар Сингулярности Бездны
      const pulse = 1 + Math.sin(elapsed * 12) * 0.18;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ff6600';
      ctx.fillStyle = 'rgba(255, 102, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, (eb.r + 4) * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff3b00';
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Огненный шлейф
      const tailLen = Math.max(16, bSpeed * 3.2);
      ctx.strokeStyle = 'rgba(255, 102, 0, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(eb.x, eb.y);
      ctx.lineTo(eb.x - Math.cos(bAngle) * tailLen, eb.y - Math.sin(bAngle) * tailLen);
      ctx.stroke();
      continue;
    }

    const tailLen = Math.max(16, bSpeed * 3.4);
    const tailX = eb.x - Math.cos(bAngle) * tailLen;
    const tailY = eb.y - Math.sin(bAngle) * tailLen;

    ctx.save();
    // 1. Длинный светящийся шлейф опасности
    ctx.shadowBlur = 14;
    ctx.shadowColor = eb.color;
    ctx.strokeStyle = eb.color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(eb.x, eb.y);
    ctx.stroke();

    // 2. Внешний красный предупреждающий ореол опасности
    ctx.strokeStyle = '#ff0033';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eb.x, eb.y, eb.r + 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Бело-желтое раскаленное плазменное жало
    ctx.fillStyle = '#fff6cc';
    ctx.beginPath();
    ctx.arc(eb.x, eb.y, eb.r * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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

  // Боевой дрон-спутник (живой напарник на крыле корабля)
  const droneLvl = player.skills.drone || 0;
  if (droneLvl > 0 && companionDrones.length > 0) {
    for (const drone of companionDrones) {
      ctx.save();
      const renderX = drone.x - Math.cos(drone.angle) * (drone.recoil || 0);
      const renderY = drone.y - Math.sin(drone.angle) * (drone.recoil || 0);
      ctx.translate(renderX, renderY);
      ctx.rotate(drone.angle + Math.PI / 2);

      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00e5ff';

      // Корпус дрона
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8, 4);
      ctx.lineTo(0, 8);
      ctx.lineTo(-8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Крылья / стабилизаторы
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-8, 4);
      ctx.lineTo(-11, 8);
      ctx.moveTo(8, 4);
      ctx.lineTo(11, 8);
      ctx.stroke();

      // Светящееся плазменное ядро
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(0, -2, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Сопло двигателя
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(0, 7, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
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

  // Верхняя полоска здоровья босса (ТОЛЬКО если босс виден на экране)
  const activeBoss = enemies.find((e) => e.type === 'boss');
  if (activeBoss) {
    const isBossOnScreen =
      activeBoss.x + activeBoss.r >= player.x - W / 2 &&
      activeBoss.x - activeBoss.r <= player.x + W / 2 &&
      activeBoss.y + activeBoss.r >= player.y - H / 2 &&
      activeBoss.y - activeBoss.r <= player.y + H / 2;

    if (isBossOnScreen) {
      const isEnraged = activeBoss.hp < activeBoss.maxHp * 0.45;
      const bKind = activeBoss.bossType || 'dreadnought';
      const barW = Math.min(460, W * 0.6);
      const barH = 14;
      const barX = (W - barW) / 2;
      const barY = 56;

      const themeColor = bKind === 'archon' ? '#b829ff' : bKind === 'singularity' ? '#ff6600' : '#ff0055';
      const enragedColor = bKind === 'archon' ? '#ff00ff' : bKind === 'singularity' ? '#ffea00' : '#ff0033';
      const activeColor = isEnraged ? enragedColor : themeColor;

      ctx.fillStyle = 'rgba(8, 10, 18, 0.9)';
      ctx.fillRect(barX - 8, barY - 24, barW + 16, barH + 32);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(barX - 8, barY - 24, barW + 16, barH + 32);

      ctx.font = "800 12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = activeColor;
      ctx.textAlign = 'left';
      const bName = activeBoss.bossName || 'БОСС';
      ctx.fillText(
        isEnraged ? `⚠ ${bName} [РЕЖИМ ЯРОСТИ!]` : `${bName} [ФАЗА 1]`,
        barX,
        barY - 8
      );

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      const bossMaxHp = Math.round(activeBoss.maxHp);
      const bossCurHp = Math.min(bossMaxHp, Math.max(0, Math.ceil(activeBoss.hp)));
      ctx.fillText(`${bossCurHp} / ${bossMaxHp}`, barX + barW, barY - 8);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(barX, barY, barW, barH);

      const fillW = barW * Math.max(0, Math.min(1, activeBoss.hp / activeBoss.maxHp));
      ctx.fillStyle = activeColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = activeColor;
      ctx.fillRect(barX, barY, fillW, barH);
      ctx.shadowBlur = 0;
    }
  }

  // Большое визуальное уведомление о появлении босса в арене
  if (bossWarningTimer > 0) {
    const alpha = Math.min(1, bossWarningTimer, (3.5 - bossWarningTimer) * 2.5);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    const bannerW = Math.min(480, W * 0.88);
    const bannerH = 50;
    const bannerX = (W - bannerW) / 2;
    const bannerY = 82;

    const pulse = 0.85 + Math.sin(performance.now() * 0.012) * 0.15;
    ctx.fillStyle = 'rgba(10, 12, 22, 0.94)';
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
    ctx.strokeStyle = bossWarningColor;
    ctx.lineWidth = 2 * pulse;
    ctx.shadowColor = bossWarningColor;
    ctx.shadowBlur = 14 * pulse;
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

    ctx.textAlign = 'center';
    ctx.font = "900 15px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = bossWarningColor;
    ctx.fillText(bossWarningText, W / 2, bannerY + 22);

    ctx.font = "700 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = '#cbd5e1';
    ctx.shadowBlur = 0;
    ctx.fillText(bossWarningSub, W / 2, bannerY + 40);

    ctx.restore();
  }

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

const resumeBtn = document.getElementById('resumeBtn');
if (resumeBtn) resumeBtn.onclick = () => togglePause(false);

const surrenderBtn = document.getElementById('surrenderBtn');
if (surrenderBtn) surrenderBtn.onclick = surrenderRun;

const pauseHintBtn = document.getElementById('pauseHintBtn');
if (pauseHintBtn) {
  pauseHintBtn.onclick = () => {
    if (state === 'PLAYING') togglePause(true);
    else if (state === 'PAUSED') togglePause(false);
  };
}

// --- ЛОГИКА "МНЕ СКУЧНО" (ЧИСТКА КОВРА С МГНОВЕННЫМ ПЕРЕКЛЮЧЕНИЕМ И ЗВУКОМ) ---
const carpetVideos = [
  document.getElementById('carpetVideo0') as HTMLVideoElement,
  document.getElementById('carpetVideo1') as HTMLVideoElement,
  document.getElementById('carpetVideo2') as HTMLVideoElement,
];
let currentVideoIdx = 0;
let isBoredomMuted = true;

const boredomBtn = document.getElementById('boredomBtn')!;
const boredomModal = document.getElementById('boredomModal')!;
const boredomSpeedBtn = document.getElementById('boredomSpeedBtn');
const boredomMuteBtn = document.getElementById('boredomMuteBtn');
const boredomNextBtn = document.getElementById('boredomNextBtn')!;
const boredomCloseBtn = document.getElementById('boredomCloseBtn')!;
const boredomLoader = document.getElementById('boredomLoader');
const boredomTitle = document.querySelector('.boredom-title') as HTMLElement | null;

const VIDEO_SPEEDS = [1.0, 1.5, 2.0];
let currentSpeedIdx = 0;

function setPlaybackSpeed(idx: number): void {
  currentSpeedIdx = idx % VIDEO_SPEEDS.length;
  const speed = VIDEO_SPEEDS[currentSpeedIdx];
  if (boredomSpeedBtn) {
    boredomSpeedBtn.textContent = `${speed}x`;
  }
  carpetVideos.forEach((v) => {
    if (v) v.playbackRate = speed;
  });
}

if (boredomSpeedBtn) {
  boredomSpeedBtn.onclick = () => {
    setPlaybackSpeed(currentSpeedIdx + 1);
  };
}

function setMuteState(muted: boolean): void {
  isBoredomMuted = muted;
  if (boredomMuteBtn) {
    boredomMuteBtn.textContent = isBoredomMuted ? '🔇' : '🔊';
    boredomMuteBtn.classList.toggle('unmuted', !isBoredomMuted);
  }
  carpetVideos.forEach((v) => {
    if (!v) return;
    v.muted = isBoredomMuted;
    if (!isBoredomMuted) v.volume = 0.75;
  });
}

if (boredomMuteBtn) {
  boredomMuteBtn.onclick = () => {
    setMuteState(!isBoredomMuted);
  };
}

// Гарантируем корректные атрибуты звука и плавную загрузку
carpetVideos.forEach((v) => {
  if (!v) return;
  v.muted = true;
  v.defaultMuted = true;
  v.playsInline = true;

  v.addEventListener('waiting', () => {
    if (boredomLoader) boredomLoader.style.display = 'flex';
  });
  v.addEventListener('playing', () => {
    if (boredomLoader) boredomLoader.style.display = 'none';
  });
  v.addEventListener('canplay', () => {
    if (boredomLoader) boredomLoader.style.display = 'none';
  });
});

function updateCarpetUI(): void {
  if (boredomTitle) {
    boredomTitle.textContent = `🧼 ДОФАМИН [${currentVideoIdx + 1}/3]`;
  }
}

function playActiveCarpet(): void {
  carpetVideos.forEach((v, idx) => {
    if (!v) return;
    if (idx === currentVideoIdx) {
      v.style.display = 'block';
      v.muted = isBoredomMuted;
      v.playbackRate = VIDEO_SPEEDS[currentSpeedIdx];
      if (!isBoredomMuted) v.volume = 0.75;
      const p = v.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    } else {
      v.style.display = 'none';
      v.pause();
    }
  });
  updateCarpetUI();
}

function switchVideo(): void {
  currentVideoIdx = (currentVideoIdx + 1) % carpetVideos.length;
  const nextVid = carpetVideos[currentVideoIdx];
  if (nextVid) {
    nextVid.currentTime = 0;
  }
  playActiveCarpet();
}

function pauseBoredom(): void {
  carpetVideos.forEach((v) => {
    if (v) v.pause();
  });
}

function resumeBoredom(): void {
  if (boredomModal && boredomModal.style.display === 'block') {
    playActiveCarpet();
  }
}

function closeBoredom(): void {
  if (boredomModal) boredomModal.style.display = 'none';
  if (boredomBtn) boredomBtn.classList.remove('active');
  pauseBoredom();
}

function openBoredom(): void {
  boredomModal.style.display = 'block';
  boredomBtn.classList.add('active');
  playActiveCarpet();
}

// При нажатии на кнопку "МНЕ СКУЧНО":
// Если окно закрыто — открывает.
// Если окно уже открыто — мгновенно переключает на следующее видео!
boredomBtn.onclick = () => {
  const isVisible = boredomModal.style.display === 'block';
  if (!isVisible) {
    openBoredom();
  } else {
    switchVideo();
  }
};

boredomNextBtn.onclick = switchVideo;

boredomCloseBtn.onclick = closeBoredom;

if (boredomBtn) boredomBtn.style.pointerEvents = 'none';
if (boredomModal) boredomModal.style.pointerEvents = 'none';
renderMenu();
requestAnimationFrame(loop);


