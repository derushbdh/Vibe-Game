import Phaser from 'phaser';

/**
 * Игровые константы для легкой балансировки и защиты перед преподавателем.
 */
const PLAYER_SPEED = 240;
const PLAYER_MAX_HP = 100;
const PLAYER_INVULNERABILITY_TIME_MS = 600;

const BLASTER_BASE_COOLDOWN_MS = 400;
const BLASTER_BULLET_SPEED = 550;
const BLASTER_BULLET_DAMAGE = 25;
const BLASTER_RANGE = 420;

const ENEMY_SPAWN_INTERVAL_INITIAL_MS = 1000;
const ENEMY_SPAWN_INTERVAL_MIN_MS = 300;
const ENEMY_BASE_SPEED = 110;
const ENEMY_BASE_HP = 30;
const ENEMY_CONTACT_DAMAGE = 15;

const GEM_MAGNET_RADIUS = 150;
const GEM_MAGNET_SPEED = 320;
const XP_PER_GEM = 1;
const BASE_XP_FOR_LEVEL = 5;

interface Bullet {
  view: Phaser.GameObjects.Arc;
  vx: number;
  vy: number;
  damage: number;
  lifetimeMs: number;
}

interface Enemy {
  view: Phaser.GameObjects.Rectangle;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
}

interface Gem {
  view: Phaser.GameObjects.Arc;
  xp: number;
}

/**
 * Основная сцена Cyber Survivors на Phaser + TypeScript.
 */
export class GameScene extends Phaser.Scene {
  // Игрок
  private player!: Phaser.GameObjects.Rectangle;
  private playerHp = PLAYER_MAX_HP;
  private playerInvulnerableUntil = 0;

  // Оружие и прокачка
  private blasterCooldownTimer = 0;
  private currentLevel = 1;
  private currentXp = 0;
  private nextLevelXp = BASE_XP_FOR_LEVEL;
  private killsCount = 0;
  private survivalTimeSec = 0;
  private isGameOver = false;

  // Списки игровых сущностей
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private gems: Gem[] = [];

  // Спавн врагов
  private enemySpawnTimer = 0;
  private enemySpawnInterval = ENEMY_SPAWN_INTERVAL_INITIAL_MS;

  // Управление
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private restartKey!: Phaser.Input.Keyboard.Key;

  // UI элементы
  private hpText!: Phaser.GameObjects.Text;
  private hpBarBg!: Phaser.GameObjects.Rectangle;
  private hpBarFill!: Phaser.GameObjects.Rectangle;
  private xpBarFill!: Phaser.GameObjects.Rectangle;
  private levelText!: Phaser.GameObjects.Text;
  private killsText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private gameOverContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('GameScene');
  }

  create(): void {
    const { width, height } = this.scale;

    // Сброс состояния для возможности рестарта
    this.playerHp = PLAYER_MAX_HP;
    this.currentLevel = 1;
    this.currentXp = 0;
    this.nextLevelXp = BASE_XP_FOR_LEVEL;
    this.killsCount = 0;
    this.survivalTimeSec = 0;
    this.isGameOver = false;
    this.bullets = [];
    this.enemies = [];
    this.gems = [];
    this.blasterCooldownTimer = 0;
    this.enemySpawnTimer = 0;
    this.enemySpawnInterval = ENEMY_SPAWN_INTERVAL_INITIAL_MS;

    // Фоновая сетка
    this.createBackgroundGrid(width, height);

    // Создаем игрока (кибер-дрон)
    this.player = this.add.rectangle(width / 2, height / 2, 28, 28, 0x00ffcc);

    // Инициализация управления
    if (!this.input.keyboard) {
      throw new Error('Клавиатура недоступна.');
    }
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Интерфейс пользователя (HUD)
    this.createHud(width);

    // Экран завершения игры
    this.createGameOverScreen(width, height);
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
      return;
    }

    const seconds = delta / 1000;
    this.survivalTimeSec += seconds;

    // Постепенное нарастание сложности
    this.enemySpawnInterval = Math.max(
      ENEMY_SPAWN_INTERVAL_MIN_MS,
      ENEMY_SPAWN_INTERVAL_INITIAL_MS - this.survivalTimeSec * 10
    );

    // Обновление таймера в HUD
    const mins = Math.floor(this.survivalTimeSec / 60);
    const secs = Math.floor(this.survivalTimeSec % 60);
    this.timerText.setText(`TIME: ${mins}:${secs < 10 ? '0' : ''}${secs}`);

    // Движение игрока
    this.updatePlayerMovement(seconds);

    // Автоматическая стрельба
    this.updateBlaster(delta);

    // Движение и столкновения пуль
    this.updateBullets(seconds);

    // Спавн и поведение врагов
    this.updateEnemies(delta, seconds);

    // Притягивание и сбор кристаллов
    this.updateGems(seconds);

    // Мерцание неуязвимости при получении урона
    if (this.time.now < this.playerInvulnerableUntil) {
      this.player.setAlpha(Math.floor(this.time.now / 60) % 2 === 0 ? 0.3 : 1);
    } else {
      this.player.setAlpha(1);
    }
  }

  /**
   * Отрисовка кибернетической фоновой сетки
   */
  private createBackgroundGrid(width: number, height: number): void {
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1e293b, 0.4);
    const cellSize = 60;
    for (let x = 0; x <= width; x += cellSize) {
      grid.moveTo(x, 0);
      grid.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += cellSize) {
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();
  }

  /**
   * Создание полосок HP, XP и счетчиков
   */
  private createHud(width: number): void {
    // Верхняя полоска опыта
    const xpBarBg = this.add.rectangle(width / 2, 6, width, 8, 0x1e293b).setOrigin(0.5, 0.5);
    xpBarBg.setDepth(10);
    this.xpBarFill = this.add.rectangle(0, 6, 0, 8, 0xb829ff).setOrigin(0, 0.5);
    this.xpBarFill.setDepth(11);

    // Полоска HP
    this.hpBarBg = this.add.rectangle(80, 32, 120, 16, 0x334155).setOrigin(0, 0.5);
    this.hpBarFill = this.add.rectangle(80, 32, 120, 16, 0x00ffcc).setOrigin(0, 0.5);
    this.hpText = this.add.text(210, 24, `${PLAYER_MAX_HP} / ${PLAYER_MAX_HP}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
    });

    // Уровень, враги и время
    this.levelText = this.add.text(width / 2, 24, 'LVL 1', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#b829ff',
    }).setOrigin(0.5, 0);

    this.killsText = this.add.text(width - 220, 24, 'KILLS: 0', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ff2a85',
    });

    this.timerText = this.add.text(width - 110, 24, 'TIME: 0:00', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#facc15',
    });
  }

  /**
   * Окно Game Over с показом итогов забега
   */
  private createGameOverScreen(width: number, height: number): void {
    this.gameOverContainer = this.add.container(width / 2, height / 2);
    this.gameOverContainer.setDepth(100);
    this.gameOverContainer.setVisible(false);

    const overlay = this.add.rectangle(0, 0, width, height, 0x06070d, 0.88);
    const title = this.add.text(0, -90, 'ЗАБЕГ ЗАВЕРШЕН', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#ff2a85',
    }).setOrigin(0.5);

    const restartBtn = this.add.text(0, 70, '[ Нажми R или Кликни для рестарта ]', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#00ffcc',
    }).setOrigin(0.5);

    restartBtn.setInteractive({ useHandCursor: true });
    restartBtn.on('pointerdown', () => this.scene.restart());
    overlay.setInteractive();
    overlay.on('pointerdown', () => this.scene.restart());

    this.gameOverContainer.add([overlay, title, restartBtn]);
  }

  /**
   * Перемещение персонажа (клавиатура или следование за мышью/пальцем)
   */
  private updatePlayerMovement(seconds: number): void {
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) dy += 1;

    // Управление тачем / зажатой мышью
    const pointer = this.input.activePointer;
    if (pointer.isDown && dx === 0 && dy === 0) {
      const distanceToPointer = Phaser.Math.Distance.Between(this.player.x, this.player.y, pointer.x, pointer.y);
      if (distanceToPointer > 20) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.x, pointer.y);
        dx = Math.cos(angle);
        dy = Math.sin(angle);
      }
    }

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);
      this.player.x += (dx / length) * PLAYER_SPEED * seconds;
      this.player.y += (dy / length) * PLAYER_SPEED * seconds;
    }

    // Удержание игрока в границах арены
    const half = this.player.width / 2;
    this.player.x = Phaser.Math.Clamp(this.player.x, half, this.scale.width - half);
    this.player.y = Phaser.Math.Clamp(this.player.y, 48 + half, this.scale.height - half);
  }

  /**
   * Автоматический поиск цели и выстрел из бластера
   */
  private updateBlaster(delta: number): void {
    this.blasterCooldownTimer -= delta;
    if (this.blasterCooldownTimer > 0) return;

    // Поиск ближайшего врага
    let nearestEnemy: Enemy | null = null;
    let minDistance = BLASTER_RANGE;

    for (const enemy of this.enemies) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.view.x, enemy.view.y);
      if (dist < minDistance) {
        minDistance = dist;
        nearestEnemy = enemy;
      }
    }

    if (!nearestEnemy) return;

    // Расчет угла и скорости полета снаряда
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      nearestEnemy.view.x,
      nearestEnemy.view.y
    );

    const bulletView = this.add.circle(this.player.x, this.player.y, 5, 0x00ffcc);
    this.bullets.push({
      view: bulletView,
      vx: Math.cos(angle) * BLASTER_BULLET_SPEED,
      vy: Math.sin(angle) * BLASTER_BULLET_SPEED,
      damage: BLASTER_BULLET_DAMAGE,
      lifetimeMs: 1200,
    });

    // С каждым уровнем темп стрельбы слегка ускоряется
    const cooldownReduction = Math.min(180, (this.currentLevel - 1) * 25);
    this.blasterCooldownTimer = BLASTER_BASE_COOLDOWN_MS - cooldownReduction;
  }

  /**
   * Обновление полета пуль и попаданий во врагов
   */
  private updateBullets(seconds: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.view.x += b.vx * seconds;
      b.view.y += b.vy * seconds;
      b.lifetimeMs -= seconds * 1000;

      // Проверка столкновения с врагами
      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        const dist = Phaser.Math.Distance.Between(b.view.x, b.view.y, e.view.x, e.view.y);

        if (dist <= 18) {
          hit = true;
          e.hp -= b.damage;

          // Вспышка урона на враге
          e.view.setFillStyle(0xffffff);
          this.time.delayedCall(50, () => {
            if (e.view && e.view.active) {
              e.view.setFillStyle(0xff0055);
            }
          });

          // Гибель врага
          if (e.hp <= 0) {
            this.killEnemy(j);
          }
          break;
        }
      }

      if (hit || b.lifetimeMs <= 0) {
        b.view.destroy();
        this.bullets.splice(i, 1);
      }
    }
  }

  /**
   * Уничтожение врага, начисление очков и спавн кристалла
   */
  private killEnemy(index: number): void {
    const enemy = this.enemies[index];
    const gemView = this.add.circle(enemy.view.x, enemy.view.y, 4, 0xb829ff);
    this.gems.push({ view: gemView, xp: XP_PER_GEM });

    enemy.view.destroy();
    this.enemies.splice(index, 1);

    this.killsCount += 1;
    this.killsText.setText(`KILLS: ${this.killsCount}`);
  }

  /**
   * Спавн врагов с краев экрана и движение к игроку
   */
  private updateEnemies(delta: number, seconds: number): void {
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.enemySpawnTimer = 0;
      this.spawnSingleEnemy();
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const angle = Phaser.Math.Angle.Between(e.view.x, e.view.y, this.player.x, this.player.y);
      e.view.x += Math.cos(angle) * e.speed * seconds;
      e.view.y += Math.sin(angle) * e.speed * seconds;

      // Контакт с игроком
      const distToPlayer = Phaser.Math.Distance.Between(e.view.x, e.view.y, this.player.x, this.player.y);
      if (distToPlayer <= 22) {
        this.damagePlayer(e.damage);
      }
    }
  }

  /**
   * Спавн одного врага за пределами видимого поля
   */
  private spawnSingleEnemy(): void {
    const edge = Phaser.Math.Between(0, 3);
    let x = 0;
    let y = 0;

    if (edge === 0) {
      x = Phaser.Math.Between(0, this.scale.width);
      y = -20;
    } else if (edge === 1) {
      x = this.scale.width + 20;
      y = Phaser.Math.Between(0, this.scale.height);
    } else if (edge === 2) {
      x = Phaser.Math.Between(0, this.scale.width);
      y = this.scale.height + 20;
    } else {
      x = -20;
      y = Phaser.Math.Between(0, this.scale.height);
    }

    const enemyView = this.add.rectangle(x, y, 22, 22, 0xff0055);
    const speedBonus = Math.min(60, this.survivalTimeSec * 1.2);

    this.enemies.push({
      view: enemyView,
      hp: ENEMY_BASE_HP + Math.floor(this.survivalTimeSec * 0.3),
      maxHp: ENEMY_BASE_HP,
      speed: ENEMY_BASE_SPEED + speedBonus,
      damage: ENEMY_CONTACT_DAMAGE,
    });
  }

  /**
   * Получение урона игроком
   */
  private damagePlayer(damage: number): void {
    if (this.time.now < this.playerInvulnerableUntil) return;

    this.playerHp = Math.max(0, this.playerHp - damage);
    this.playerInvulnerableUntil = this.time.now + PLAYER_INVULNERABILITY_TIME_MS;

    // Обновление полоски здоровья
    const hpPercent = this.playerHp / PLAYER_MAX_HP;
    this.hpBarFill.width = 120 * hpPercent;
    this.hpText.setText(`${this.playerHp} / ${PLAYER_MAX_HP}`);

    // Тряска экрана (Juice)
    this.cameras.main.shake(120, 0.008);

    if (this.playerHp <= 0) {
      this.triggerGameOver();
    }
  }

  /**
   * Сбор кристаллов опыта и притягивание магнитом
   */
  private updateGems(seconds: number): void {
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      const dist = Phaser.Math.Distance.Between(g.view.x, g.view.y, this.player.x, this.player.y);

      // Магнитное притягивание
      if (dist <= GEM_MAGNET_RADIUS) {
        const angle = Phaser.Math.Angle.Between(g.view.x, g.view.y, this.player.x, this.player.y);
        g.view.x += Math.cos(angle) * GEM_MAGNET_SPEED * seconds;
        g.view.y += Math.sin(angle) * GEM_MAGNET_SPEED * seconds;
      }

      // Сбор кристалла
      if (dist <= 18) {
        g.view.destroy();
        this.gems.splice(i, 1);
        this.addXp(g.xp);
      }
    }
  }

  /**
   * Начисление опыта и повышение уровня
   */
  private addXp(amount: number): void {
    this.currentXp += amount;
    if (this.currentXp >= this.nextLevelXp) {
      this.currentXp -= this.nextLevelXp;
      this.currentLevel += 1;
      this.nextLevelXp = Math.floor(this.nextLevelXp * 1.4 + 2);

      // Восстановление 20 HP при повышении уровня
      this.playerHp = Math.min(PLAYER_MAX_HP, this.playerHp + 20);
      this.hpBarFill.width = 120 * (this.playerHp / PLAYER_MAX_HP);
      this.hpText.setText(`${this.playerHp} / ${PLAYER_MAX_HP}`);

      this.levelText.setText(`LVL ${this.currentLevel}`);

      // Вспышка на повышение уровня
      this.cameras.main.flash(200, 0, 255, 204);
    }

    // Обновление полоски опыта в самом верху экрана
    const xpPercent = Math.min(1, this.currentXp / this.nextLevelXp);
    this.xpBarFill.width = this.scale.width * xpPercent;
  }

  /**
   * Завершение игры при потере всего HP
   */
  private triggerGameOver(): void {
    this.isGameOver = true;
    this.player.setFillStyle(0x475569);
    this.gameOverContainer.setVisible(true);

    const mins = Math.floor(this.survivalTimeSec / 60);
    const secs = Math.floor(this.survivalTimeSec % 60);
    const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    // Добавляем итоговую статистику на экран
    const statsText = this.add.text(
      0,
      -10,
      `Выжито: ${formattedTime}  |  Уровень: ${this.currentLevel}  |  Врагов повержено: ${this.killsCount}`,
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '17px',
        color: '#f8fafc',
      }
    ).setOrigin(0.5);

    this.gameOverContainer.add(statsText);
  }
}
