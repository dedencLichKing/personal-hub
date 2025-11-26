/*
 * 蜀山：御剑飞升 (Shushan: Sword Ascension)
 * Core Game Logic
 */

/* --- 1. 游戏常量配置 (Config) --- */

// 境界体系 (Realm System)
const REALMS = [
    { name: "练气初期", exp: 100 }, { name: "练气中期", exp: 250 }, { name: "练气后期", exp: 500 },
    { name: "筑基初期", exp: 1000 }, { name: "筑基中期", exp: 2000 }, { name: "筑基后期", exp: 3500 },
    { name: "结丹初期", exp: 6000 }, { name: "结丹中期", exp: 9000 }, { name: "结丹后期", exp: 13000 },
    { name: "元婴初期", exp: 20000 }, { name: "元婴中期", exp: 30000 }, { name: "元婴后期", exp: 45000 },
    { name: "化神初期", exp: 70000 }, { name: "化神中期", exp: 100000 }, { name: "化神后期", exp: 150000 },
    { name: "炼虚", exp: 250000 }, { name: "合体", exp: 400000 }, { name: "大乘", exp: 700000 },
    { name: "渡劫", exp: 1000000 }, { name: "真仙", exp: Infinity }
];

// 技能库 (Skill Pool)
const SKILL_POOL = [
    // --- 属性类 ---
    { id: "atk_up", type: "passive", quality: "common", name: "洗髓伐骨", desc: "基础攻击力 +15%" },
    { id: "hp_up", type: "passive", quality: "common", name: "长生诀", desc: "生命上限 +20%" },
    { id: "haste", type: "passive", quality: "common", name: "御风术", desc: "攻击速度 +15%" },
    { id: "crit", type: "passive", quality: "rare", name: "天眼通", desc: "暴击率 +10%" },
    
    // --- 蜀山专属 ---
    { id: "sword_stack", type: "passive", quality: "epic", name: "剑心通明", desc: "暴击时 50% 几率发射一道额外剑气" },
    { id: "flying_sword", type: "active", quality: "epic", name: "养剑术", desc: "召唤一把永久环绕的飞剑，自动攻击敌人" },
    { id: "giant_sword", type: "passive", quality: "rare", name: "巨剑术", desc: "剑气体积变大 50%，伤害增加 20%" },
    { id: "split_sword", type: "passive", quality: "legendary", name: "分光化影", desc: "剑气命中后分裂成 2 道小剑气" },
    
    // --- 通用神通 ---
    { id: "magnet", type: "passive", quality: "common", name: "隔空取物", desc: "拾取范围 +50%" },
    { id: "heal", type: "active", quality: "rare", name: "回春术", desc: "立即回复 30% 生命值" }
];

// 怪物配置
const MONSTERS = {
    normal: [
        { name: "狂暴野猪", hp: 20, speed: 1.5, color: "#8B4513", size: 15, score: 10, exp: 5 },
        { name: "毒蝎", hp: 35, speed: 2.0, color: "#800080", size: 12, score: 15, exp: 8 },
        { name: "风狼", hp: 30, speed: 3.0, color: "#708090", size: 18, score: 20, exp: 10 }
    ],
    elite: [
        { name: "千年树妖", hp: 500, speed: 1.0, color: "#228B22", size: 35, score: 200, exp: 100 },
        { name: "赤炎兽", hp: 400, speed: 2.5, color: "#FF4500", size: 30, score: 250, exp: 120 }
    ],
    boss: [
        { name: "九幽魔尊", hp: 50000, speed: 1.8, color: "#000000", size: 60, score: 10000, exp: 5000 }
    ]
};

/* --- 2. 工具函数 (Utils) --- */
const Utils = {
    rand(min, max) { return Math.random() * (max - min) + min; },
    randInt(min, max) { return Math.floor(this.rand(min, max)); },
    checkCollide(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.hypot(dx, dy) < (a.size + b.size);
    },
    drawSword(ctx, x, y, angle, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        
        // 绘制剑形
        ctx.beginPath();
        ctx.moveTo(0, -size); // 剑尖
        ctx.lineTo(size * 0.2, size * 0.2);
        ctx.lineTo(size * 0.1, size * 0.8); // 剑柄顶
        ctx.lineTo(size * 0.3, size * 0.8); // 护手
        ctx.lineTo(size * 0.3, size); // 剑尾
        ctx.lineTo(-size * 0.3, size);
        ctx.lineTo(-size * 0.3, size * 0.8);
        ctx.lineTo(-size * 0.1, size * 0.8);
        ctx.lineTo(-size * 0.2, size * 0.2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
};

/* --- 3. 核心类定义 (Classes) --- */

class Player {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Game.width / 2;
        this.y = Game.height / 2;
        this.size = 20;
        this.angle = 0;
        
        // 基础属性
        this.hp = 100;
        this.maxHp = 100;
        this.speed = 4;
        this.dmg = 15;
        this.defense = 0; // 基础防御力
        this.atkSpeed = 30; // 帧间隔 (越小越快)
        this.critRate = 0.05;
        this.pickupRange = 80;
        
        // 状态
        this.exp = 0;
        this.realmIdx = 0;
        this.atkTimer = 0;
        this.swordStacks = 0; // 剑心层数
        this.flyingSwords = []; // 养剑术产生的飞剑对象
        
        // 技能修正
        this.modifiers = {
            giantSword: false,
            splitSword: false,
            swordHeart: false // 剑心通明
        };
    }

    update() {
        // 移动
        let dx = 0, dy = 0;
        if (Input.up) dy -= 1;
        if (Input.down) dy += 1;
        if (Input.left) dx -= 1;
        if (Input.right) dx += 1;
        
        // 归一化速度
        if (dx !== 0 || dy !== 0) {
            const len = Math.hypot(dx, dy);
            this.x += (dx / len) * this.speed;
            this.y += (dy / len) * this.speed;
        }

        // 边界限制
        this.x = Math.max(this.size, Math.min(Game.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(Game.height - this.size, this.y));

        // 寻找最近敌人计算朝向
        const target = Game.getNearestEnemy(this.x, this.y);
        if (target) {
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
        }

        // 自动攻击
        if (++this.atkTimer >= this.atkSpeed) {
            this.attack(target);
            this.atkTimer = 0;
        }
        
        // 飞剑逻辑 update
        this.flyingSwords.forEach(sword => sword.update(this));
    }

    attack(target) {
        const angle = target ? Math.atan2(target.y - this.y, target.x - this.x) : -Math.PI / 2;
        
        // 发射主剑气
        this.shoot(this.x, this.y, angle);
    }

    shoot(x, y, angle, isExtra = false) {
        // 计算暴击
        const isCrit = Math.random() < this.critRate;
        const finalDmg = this.dmg * (isCrit ? 2.0 : 1.0);
        
        // 剑心积累
        if (!isExtra) {
            this.swordStacks++;
            UI.updateStack(this.swordStacks);
        }
        
        // 剑心通明：暴击触发额外攻击
        if (isCrit && this.modifiers.swordHeart && !isExtra) {
            // 延时发射一发
            setTimeout(() => this.shoot(x, y, angle + Utils.rand(-0.2, 0.2), true), 100);
        }

        const size = this.modifiers.giantSword ? 25 : 15;
        Game.bullets.push(new Bullet(x, y, angle, finalDmg, size, isCrit, this.modifiers.splitSword));
    }

    gainExp(val) {
        this.exp += val;
        const nextRealm = REALMS[this.realmIdx];
        
        if (nextRealm && this.exp >= nextRealm.exp) {
            this.exp -= nextRealm.exp;
            this.realmIdx++;
            
            // 播放升级特效
            for(let i=0; i<20; i++) Game.particles.push(new Particle(this.x, this.y, "#ffd700"));
            
            // 境界属性成长 (每级提升)
            this.maxHp += 30;
            this.hp = this.maxHp; // 升级回满血
            this.dmg += 5;
            this.defense += 2;
            
            // 触发选择
            Game.pauseForUpgrade();
        }
        UI.updateStatus();
    }

    addSkill(skillId) {
        if (skillId === "atk_up") this.dmg *= 1.15;
        if (skillId === "hp_up") { this.maxHp *= 1.2; this.hp += this.maxHp * 0.2; }
        if (skillId === "haste") this.atkSpeed = Math.max(5, this.atkSpeed * 0.85);
        if (skillId === "crit") this.critRate += 0.1;
        if (skillId === "magnet") this.pickupRange *= 1.5;
        if (skillId === "heal") this.hp = Math.min(this.hp + this.maxHp * 0.3, this.maxHp);
        
        // 蜀山特技
        if (skillId === "sword_stack") this.modifiers.swordHeart = true;
        if (skillId === "giant_sword") this.modifiers.giantSword = true;
        if (skillId === "split_sword") this.modifiers.splitSword = true;
        if (skillId === "flying_sword") {
            this.flyingSwords.push(new FlyingSword(this.flyingSwords.length));
        }
    }

    draw() {
        // 绘制角色 (简单圆代替)
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 脚底光环
        ctx.beginPath();
        ctx.arc(0, 0, this.size + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 242, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 角色本体
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 简单面部
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🤺", 0, 2);

        ctx.restore();
        
        // 绘制飞剑
        this.flyingSwords.forEach(s => s.draw());
    }
}

class FlyingSword {
    constructor(index) {
        this.index = index;
        this.angle = 0;
        this.dist = 60;
        this.speed = 0.05;
        this.cooldown = 0;
        this.maxCooldown = 60;
    }

    update(player) {
        // 环绕逻辑
        this.angle += this.speed;
        this.x = player.x + Math.cos(this.angle + this.index * 2) * this.dist;
        this.y = player.y + Math.sin(this.angle + this.index * 2) * this.dist;
        
        // 自动攻击最近敌人
        if (this.cooldown > 0) {
            this.cooldown--;
        } else {
            const target = Game.getNearestEnemy(this.x, this.y, 200);
            if (target) {
                const a = Math.atan2(target.y - this.y, target.x - this.x);
                Game.bullets.push(new Bullet(this.x, this.y, a, player.dmg * 0.5, 10, false, false));
                this.cooldown = this.maxCooldown; // 1秒一发
            }
        }
    }

    draw() {
        Utils.drawSword(ctx, this.x, this.y, this.angle + Math.PI/2, 15, "#00f2ff");
    }
}

class Bullet {
    constructor(x, y, angle, dmg, size, isCrit, canSplit) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 12;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.dmg = dmg;
        this.size = size;
        this.isCrit = isCrit;
        this.canSplit = canSplit;
        this.dead = false;
        this.color = isCrit ? "#ffd700" : "#aeeeee";
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -50 || this.x > Game.width + 50 || this.y < -50 || this.y > Game.height + 50) {
            this.dead = true;
        }

        // 碰撞检测
        for (let e of Game.enemies) {
            if (!e.dead && Utils.checkCollide(this, e)) {
                e.hit(this.dmg, this.isCrit);
                this.dead = true;
                
                // 分裂逻辑
                if (this.canSplit) {
                    Game.bullets.push(new Bullet(this.x, this.y, this.angle + 0.3, this.dmg * 0.5, this.size * 0.6, false, false));
                    Game.bullets.push(new Bullet(this.x, this.y, this.angle - 0.3, this.dmg * 0.5, this.size * 0.6, false, false));
                }
                
                // 特效
                for(let i=0; i<3; i++) Game.particles.push(new Particle(this.x, this.y, this.color));
                break;
            }
        }
    }

    draw() {
        Utils.drawSword(ctx, this.x, this.y, this.angle + Math.PI/2, this.size * 2, this.color);
    }
}

class Enemy {
    constructor(type, rank) { // rank: normal, elite, boss
        // 属性初始化
        const template = MONSTERS[rank][Math.floor(Math.random() * MONSTERS[rank].length)];
        
        // 边缘生成
        if (Math.random() < 0.5) {
            this.x = Math.random() < 0.5 ? -50 : Game.width + 50;
            this.y = Math.random() * Game.height;
        } else {
            this.x = Math.random() * Game.width;
            this.y = Math.random() < 0.5 ? -50 : Game.height + 50;
        }

        this.rank = rank;
        this.name = template.name;
        this.hp = template.hp * (1 + WaveManager.waveIndex * 0.2); // 随波次增强
        this.maxHp = this.hp;
        this.speed = template.speed;
        this.color = template.color;
        this.size = template.size;
        this.score = template.score;
        this.expValue = template.exp;
        
        // 3. 速度动态调整 (根据游戏时间 0-5min, 5-10min, 10-15min)
        const timePassed = WaveManager.timer - WaveManager.current; // 已进行时间(秒)
        let speedFactor = 1.0;
        if (timePassed < 300) { // 0-5分钟
            speedFactor = 0.6;
        } else if (timePassed < 600) { // 5-10分钟
            speedFactor = 0.8;
        } else { // 10分钟后
            speedFactor = 1.0;
        }
        this.speed *= speedFactor;
        
        this.dead = false;
    }

    update() {
        const p = Game.player;
        const angle = Math.atan2(p.y - this.y, p.x - this.x);
        
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        // 撞击玩家
        if (Utils.checkCollide(this, p)) {
            const baseDmg = (this.rank === 'boss' ? 50 : 10);
            // 计算防御减免，至少造成1点伤害
            const finalDmg = Math.max(1, baseDmg - p.defense);
            
            p.hp -= finalDmg;
            this.dead = true; // 撞击后自爆 (Boss除外)
            if (this.rank === 'boss') this.dead = false; // Boss 撞人不死
            
            UI.floatText(p.x, p.y, `-${Math.floor(finalDmg)}`, "#ff0000");
            UI.updateStatus();
            
            if (p.hp <= 0) Game.gameOver();
        }
    }

    hit(dmg, isCrit) {
        this.hp -= dmg;
        UI.floatText(this.x, this.y - 20, Math.floor(dmg), isCrit ? "#ffd700" : "#fff", isCrit);
        
        if (this.hp <= 0) {
            this.dead = true;
            Game.score += this.score;
            
            // 掉落经验球
            Game.items.push(new Item(this.x, this.y, this.expValue));
            
            // 掉落回血包 (1%几率)
            if (Math.random() < 0.01) Game.items.push(new Item(this.x + 10, this.y, 0, true));
            
            UI.updateStatus();
            
            if (this.rank === 'boss') {
                Game.victory();
            }
        }
    }

    draw() {
        // 身体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛 (示意朝向)
        const p = Game.player;
        const angle = Math.atan2(p.y - this.y, p.x - this.x);
        const eyeX = this.x + Math.cos(angle) * this.size * 0.5;
        const eyeY = this.y + Math.sin(angle) * this.size * 0.5;
        
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 血条
        if (this.hp < this.maxHp) {
            const w = this.size * 2;
            ctx.fillStyle = "red";
            ctx.fillRect(this.x - w/2, this.y - this.size - 10, w, 4);
            ctx.fillStyle = "#0f0";
            ctx.fillRect(this.x - w/2, this.y - this.size - 10, w * (this.hp / this.maxHp), 4);
        }
        
        // 名字 (精英/Boss显示)
        if (this.rank !== 'normal') {
            ctx.fillStyle = this.rank === 'boss' ? "#ff4d4d" : "#ffae00";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, this.x, this.y + this.size + 15);
        }
    }
}

class Item {
    constructor(x, y, exp, isFood = false) {
        this.x = x;
        this.y = y;
        this.exp = exp;
        this.isFood = isFood;
        this.size = 8;
        this.dead = false;
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        const p = Game.player;
        const dist = Math.hypot(p.x - this.x, p.y - this.y);
        
        // 磁吸
        if (dist < p.pickupRange) {
            const angle = Math.atan2(p.y - this.y, p.x - this.x);
            this.vx += Math.cos(angle) * 1.0;
            this.vy += Math.sin(angle) * 1.0;
            this.x += this.vx;
            this.y += this.vy;
        } else {
            // 摩擦力
            this.vx *= 0.9;
            this.vy *= 0.9;
        }

        // 拾取
        if (dist < p.size + this.size) {
            this.dead = true;
            if (this.isFood) {
                p.hp = Math.min(p.hp + 30, p.maxHp);
                UI.floatText(this.x, this.y, "+生命", "#0f0");
            } else {
                p.gainExp(this.exp);
            }
        }
    }

    draw() {
        ctx.fillStyle = this.isFood ? "#0f0" : "#00f2ff";
        ctx.beginPath();
        if (this.isFood) {
            // 画个十字代表回血
            ctx.fillRect(this.x - 4, this.y - 1, 8, 2);
            ctx.fillRect(this.x - 1, this.y - 4, 2, 8);
        } else {
            // 菱形代表灵气
            ctx.moveTo(this.x, this.y - 6);
            ctx.lineTo(this.x + 6, this.y);
            ctx.lineTo(this.x, this.y + 6);
            ctx.lineTo(this.x - 6, this.y);
            ctx.fill();
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * 2 + 1;
        this.vx = Math.cos(a) * s;
        this.vy = Math.sin(a) * s;
        this.life = 1.0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05;
    }
    
    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class TextEffect {
    constructor(x, y, text, color, isBig = false) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 40;
        this.isBig = isBig;
    }
    update() {
        this.y -= 1;
        this.life--;
    }
    draw() {
        ctx.globalAlpha = Math.max(0, this.life / 40);
        ctx.fillStyle = this.color;
        ctx.font = this.isBig ? "bold 24px Arial" : "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

/* --- 4. 游戏管理器 (Game Manager) --- */

const WaveManager = {
    timer: 15 * 60, // 15分钟倒计时
    current: 15 * 60,
    waveIndex: 0,
    bossSpawned: false,

    update() {
        if (this.current > 0) {
            this.current -= 1 / 60; // 假设60fps
            
            // 更新 UI 倒计时
            const m = Math.max(0, Math.floor(this.current / 60)).toString().padStart(2, '0');
            const s = Math.max(0, Math.floor(this.current % 60)).toString().padStart(2, '0');
            document.getElementById("game-timer").innerText = `${m}:${s}`;

            // 波次逻辑
            const progress = (this.timer - this.current) / this.timer;
            this.waveIndex = Math.floor(progress * 10); // 0-9 难度系数
            
            // 刷新率控制
            if (Game.frame % Math.max(10, 60 - this.waveIndex * 5) === 0) {
                // 90% 普通, 10% 精英
                const rank = Math.random() < 0.1 ? "elite" : "normal";
                Game.enemies.push(new Enemy("mob", rank));
            }
        } else {
            // 时间到，出Boss
            if (!this.bossSpawned) {
                this.bossSpawned = true;
                document.getElementById("wave-display").innerText = "警告：魔尊降临！";
                document.getElementById("wave-display").style.color = "red";
                Game.enemies = []; // 清空小怪
                Game.enemies.push(new Enemy("boss", "boss"));
            }
        }
    },
    
    reset() {
        this.current = this.timer;
        this.waveIndex = 0;
        this.bossSpawned = false;
        document.getElementById("wave-display").innerText = "第一波: 妖兽初现";
        document.getElementById("wave-display").style.color = "#8899a6";
    }
};

const Game = {
    canvas: document.getElementById("gameCanvas"),
    ctx: document.getElementById("gameCanvas").getContext("2d"),
    width: window.innerWidth,
    height: window.innerHeight,
    state: "MENU", // MENU, PLAYING, PAUSED, UPGRADE, GAMEOVER, VICTORY
    frame: 0,
    score: 0,
    
    player: null,
    bullets: [],
    enemies: [],
    items: [],
    particles: [],
    texts: [],

    init() {
        window.addEventListener("resize", () => this.resize());
        this.resize();
        
        // 绑定头像点击事件
        document.querySelector('.avatar-box').addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发其他点击
            UI.toggleStats();
        });

        // 绑定属性面板关闭
        document.getElementById('stats-screen').addEventListener('click', () => {
            UI.toggleStats();
        });

        // 输入监听
        window.addEventListener("keydown", e => {
            if(e.key === "w" || e.key === "ArrowUp") Input.up = true;
            if(e.key === "s" || e.key === "ArrowDown") Input.down = true;
            if(e.key === "a" || e.key === "ArrowLeft") Input.left = true;
            if(e.key === "d" || e.key === "ArrowRight") Input.right = true;
            if(e.key === "Escape") this.togglePause();
        });
        window.addEventListener("keyup", e => {
            if(e.key === "w" || e.key === "ArrowUp") Input.up = false;
            if(e.key === "s" || e.key === "ArrowDown") Input.down = false;
            if(e.key === "a" || e.key === "ArrowLeft") Input.left = false;
            if(e.key === "d" || e.key === "ArrowRight") Input.right = false;
        });
        
        this.loop();
    },

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    },

    start(faction) {
        if (faction !== 'shushan') return; // 暂时只支持蜀山
        
        this.player = new Player();
        this.bullets = [];
        this.enemies = [];
        this.items = [];
        this.particles = [];
        this.texts = [];
        this.score = 0;
        this.frame = 0;
        
        WaveManager.reset();
        UI.updateStatus();
        
        document.getElementById("select-screen").classList.add("hidden");
        document.getElementById("hud-layer").style.display = "flex";
        
        // 检查新手引导
        if (!localStorage.getItem("mortal_cultivation_tutorial")) {
            this.state = "PAUSED";
            document.getElementById("tutorial-screen").classList.remove("hidden");
            localStorage.setItem("mortal_cultivation_tutorial", "true");
        } else {
            this.state = "PLAYING";
        }
    },

    closeTutorial() {
        document.getElementById("tutorial-screen").classList.add("hidden");
        this.state = "PLAYING";
    },

    pauseForUpgrade() {
        this.state = "UPGRADE";
        UI.showUpgradeOptions();
    },

    togglePause() {
        if (this.state === "PLAYING") {
            this.state = "PAUSED";
            document.getElementById("pause-screen").classList.remove("hidden");
        } else if (this.state === "PAUSED") {
            this.state = "PLAYING";
            document.getElementById("pause-screen").classList.add("hidden");
        }
    },
    
    gameOver() {
        this.state = "GAMEOVER";
        const realmName = REALMS[this.player.realmIdx].name;
        document.getElementById("end-realm").innerText = realmName;
        document.getElementById("end-kills").innerText = this.score;
        
        // 计算存活时间 (总时长 - 剩余时长)
        const survivalTime = WaveManager.timer - Math.max(0, WaveManager.current);
        const m = Math.floor(survivalTime / 60).toString().padStart(2, '0');
        const s = Math.floor(survivalTime % 60).toString().padStart(2, '0');
        document.getElementById("end-time").innerText = `${m}:${s}`;
        
        document.getElementById("game-over-screen").classList.remove("hidden");
    },
    
    victory() {
        this.state = "VICTORY";
        document.getElementById("vic-time").innerText = document.getElementById("game-timer").innerText;
        document.getElementById("victory-screen").classList.remove("hidden");
    },

    loop() {
        requestAnimationFrame(() => this.loop());
        
        if (this.state !== "PLAYING") return;

        this.frame++;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 逻辑更新
        WaveManager.update();
        this.player.update();
        
        // 实体更新与清理
        this.updateEntities(this.bullets);
        this.updateEntities(this.enemies);
        this.updateEntities(this.items);
        this.updateEntities(this.particles);
        this.updateEntities(this.texts);

        // 绘制
        this.items.forEach(e => e.draw());
        this.enemies.forEach(e => e.draw());
        this.player.draw();
        this.bullets.forEach(e => e.draw());
        this.particles.forEach(e => e.draw());
        this.texts.forEach(e => e.draw());
    },
    
    updateEntities(arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
            arr[i].update();
            if (arr[i].dead || arr[i].life <= 0) {
                arr.splice(i, 1);
            }
        }
    },

    getNearestEnemy(x, y, maxDist = Infinity) {
        let target = null;
        let minD = maxDist;
        for (let e of this.enemies) {
            const d = Math.hypot(e.x - x, e.y - y);
            if (d < minD) {
                minD = d;
                target = e;
            }
        }
        return target;
    }
};

const Input = { up: false, down: false, left: false, right: false };
const ctx = Game.ctx; // 便捷引用

const UI = {
    updateStatus() {
        const p = Game.player;
        if (!p) return;
        
        // 血条
        const hpPct = (p.hp / p.maxHp) * 100;
        document.getElementById("hp-bar").style.width = `${hpPct}%`;
        document.getElementById("hp-text").innerText = `${Math.floor(p.hp)}/${Math.floor(p.maxHp)}`;
        
        // 经验/修为
        const realm = REALMS[p.realmIdx];
        const nextRealmExp = REALMS[p.realmIdx].exp; // 当前等级满经验值需求
        // 注意：这里的 exp 是累积制还是重置制？代码 Player.gainExp 里是减去，所以是当前段位进度
        const expPct = (p.exp / nextRealmExp) * 100;
        
        document.getElementById("exp-bar").style.width = `${expPct}%`;
        document.getElementById("exp-text").innerText = `修为 ${Math.floor(expPct)}%`;
        document.getElementById("realm-display").innerText = realm.name || "未知境界";
        
        // 击杀
        document.getElementById("kill-count").innerText = Game.score / 10; // 简单处理 score
    },
    
    updateStack(n) {
        document.getElementById("sword-stack").innerText = n;
    },

    floatText(x, y, text, color, isBig) {
        Game.texts.push(new TextEffect(x, y, text, color, isBig));
    },

    showUpgradeOptions() {
        const container = document.getElementById("skill-container");
        container.innerHTML = "";
        
        // 随机选3个
        const options = [];
        for(let i=0; i<3; i++) {
            const s = SKILL_POOL[Math.floor(Math.random() * SKILL_POOL.length)];
            options.push(s);
        }
        
        options.forEach(s => {
            const card = document.createElement("div");
            card.className = `skill-card card-quality-${s.quality}`;
            card.innerHTML = `
                <div class="card-type">${s.type === 'active' ? '神通' : '心法'}</div>
                <div class="card-icon">📖</div>
                <div class="card-name">${s.name}</div>
                <div class="card-desc">${s.desc}</div>
            `;
            card.onclick = () => {
                Game.player.addSkill(s.id);
                document.getElementById("upgrade-screen").classList.add("hidden");
                Game.state = "PLAYING";
            };
            container.appendChild(card);
        });
        
        document.getElementById("upgrade-screen").classList.remove("hidden");
    },

    toggleStats() {
        const statsScreen = document.getElementById("stats-screen");
        if (statsScreen.classList.contains("hidden")) {
            // 显示面板，刷新数据
            const p = Game.player;
            if (!p) return;
            
            document.getElementById("stat-atk").innerText = Math.floor(p.dmg);
            document.getElementById("stat-def").innerText = Math.floor(p.defense);
            document.getElementById("stat-hp").innerText = `${Math.floor(p.hp)}/${Math.floor(p.maxHp)}`;
            document.getElementById("stat-crit").innerText = `${Math.floor(p.critRate * 100)}%`;
            document.getElementById("stat-speed").innerText = p.speed.toFixed(1);
            document.getElementById("stat-atk-speed").innerText = `${(60/p.atkSpeed).toFixed(1)}/s`;
            
            statsScreen.classList.remove("hidden");
            // 暂停游戏（可选，为了安全查看属性建议暂停）
            if (Game.state === "PLAYING") Game.togglePause();
        } else {
            statsScreen.classList.add("hidden");
            // 如果是因为查看属性暂停的，可以在这里恢复，但通常让用户手动恢复或保持暂停逻辑一致更好
            // 这里我们保持简单的 togglePause 逻辑，如果上面暂停了，用户需要手动点击恢复或者再次点击头像？
            // 更好的体验是：如果当前是 PAUSED 且是因为打开面板暂停的，关闭时恢复。
            // 简化处理：仅仅切换显示，暂停逻辑由 Game.togglePause() 统一管理，这里只负责显示。
            // 为了防止意外死亡，打开属性面板强制暂停是比较好的。
        }
    }
};

// 启动
Game.init();
