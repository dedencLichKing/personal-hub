/* --- 游戏配置与数据 --- */

// 门派定义
const FACTIONS = {
    web: {
        name: "前端",
        bulletEmoji: "✨", // console.log
        bulletColor: "#61dafb",
        baseSpeed: 6,
        baseHp: 80,
        baseDmg: 10,
        baseInterval: 15,
        enemies: ["undefined", "NaN", "WhiteScreen", "IE6"],
        enemyEmojis: ["💩", "📄", "⬜", "🦖"]
    },
    java: {
        name: "后端",
        bulletEmoji: "🐘", // 数据库/Java
        bulletColor: "#f89820",
        baseSpeed: 4,
        baseHp: 150,
        baseDmg: 25,
        baseInterval: 35,
        enemies: ["Timeout", "404", "NullPointer", "DeadLock"],
        enemyEmojis: ["🐢", "🚫", "❓", "🔒"]
    },
    mobile: {
        name: "移动",
        bulletEmoji: "🍏", // Apple/Android
        bulletColor: "#a4c639",
        baseSpeed: 7,
        baseHp: 100,
        baseDmg: 12,
        baseInterval: 20,
        bulletCount: 2, // 初始2发
        enemies: ["Crash", "Lag", "NotRespon", "OOM"],
        enemyEmojis: ["💥", "🐌", "⏳", "💾"]
    }
};

// 技能库 (无限叠加设计)
const SKILLS = [
    { id: "multishot", icon: "🔱", name: "多线程并发", desc: "弹道数量 +1" },
    { id: "haste", icon: "⚡", name: "敏捷开发", desc: "攻击速度 +20%" },
    { id: "power", icon: "💪", name: "底层重构", desc: "基础伤害 +25%" },
    { id: "health", icon: "💊", name: "枸杞泡茶", desc: "生命上限 +30% 并回血" },
    { id: "speed", icon: "👟", name: "跑路精通", desc: "移动速度 +15%" },
    { id: "crit", icon: "🎯", name: "精准断点", desc: "暴击率 +10%" },
    { id: "magnet", icon: "🧲", name: "自动脚本", desc: "拾取范围 +50%" }
];

// 职位称号
const TITLES = [
    "实习生",
    "试用期",
    "初级工程师",
    "中级工程师",
    "高级工程师",
    "技术专家",
    "架构师",
    "CTO",
    "技术合伙人",
    "硅谷大佬",
    "图灵转世"
];

/* --- 核心引擎 --- */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 全局状态
const Game = {
    state: "MENU",
    width: 0,
    height: 0,
    faction: null,
    player: null,
    enemies: [],
    bullets: [],
    items: [],
    particles: [],
    texts: [],
    frame: 0,
    score: 0,

    // 初始化
    resize() {
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;
    },

    start(factionKey) {
        this.faction = FACTIONS[factionKey];
        this.player = new Player(this.faction);
        this.reset();

        document.getElementById("select-screen").classList.add("hidden");
        this.state = "PLAYING";
        this.loop();
    },

    reset() {
        this.enemies = [];
        this.bullets = [];
        this.items = [];
        this.particles = [];
        this.texts = [];
        this.score = 0;
        this.frame = 0;
        UI.update();
    },

    togglePause() {
        if (this.state === "PLAYING") {
            this.state = "PAUSED";
            document.getElementById("pause-screen").classList.remove("hidden");
        } else if (this.state === "PAUSED") {
            this.state = "PLAYING";
            document.getElementById("pause-screen").classList.add("hidden");
            this.loop();
        }
    },

    loop() {
        if (this.state !== "PLAYING") return;
        requestAnimationFrame(() => this.loop());

        this.frame++;
        ctx.clearRect(0, 0, this.width, this.height);

        // 背景网格特效
        this.drawBg();

        // 逻辑更新
        this.player.update();
        this.spawnLogic();

        // 实体更新
        [...this.items, ...this.bullets, ...this.enemies, ...this.particles, ...this.texts].forEach((e) =>
            e.update()
        );

        // 清理死亡实体 (倒序遍历防止索引错误)
        for (let i = this.items.length - 1; i >= 0; i--) if (this.items[i].dead) this.items.splice(i, 1);
        for (let i = this.bullets.length - 1; i >= 0; i--) if (this.bullets[i].dead) this.bullets.splice(i, 1);
        for (let i = this.enemies.length - 1; i >= 0; i--) if (this.enemies[i].dead) this.enemies.splice(i, 1);
        for (let i = this.particles.length - 1; i >= 0; i--) if (this.particles[i].dead) this.particles.splice(i, 1);
        for (let i = this.texts.length - 1; i >= 0; i--) if (this.texts[i].dead) this.texts.splice(i, 1);

        // 绘制
        this.items.forEach((e) => e.draw());
        this.enemies.forEach((e) => e.draw());
        this.bullets.forEach((e) => e.draw());
        this.player.draw();
        this.particles.forEach((e) => e.draw());
        this.texts.forEach((e) => e.draw());
    },

    spawnLogic() {
        // 难度曲线：每1分钟 (3600帧) 难度显著提升
        const rate = Math.max(20, 60 - Math.floor(this.score / 200));

        if (this.frame % rate === 0) {
            // 80% 概率出门派怪，20% 概率出通用 Bug
            const isCommon = Math.random() < 0.2;
            const type = isCommon ? "common" : "faction";
            this.enemies.push(new Enemy(type));
        }
    },

    drawBg() {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        const step = 50;
        const off = (this.frame * 0.5) % step;

        ctx.beginPath();
        for (let x = 0; x < this.width; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
        }
        for (let y = off; y < this.height; y += step) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
        }
        ctx.stroke();
    }
};

/* --- 实体类定义 --- */

class Player {
    constructor(config) {
        this.x = Game.width / 2;
        this.y = Game.height / 2;
        this.emoji = "👨🏻‍💻";

        // 属性
        this.hp = config.baseHp;
        this.maxHp = config.baseHp;
        this.speed = config.baseSpeed;
        this.dmg = config.baseDmg;
        this.interval = config.baseInterval;
        this.bulletCount = config.bulletCount || 1;
        this.bulletColor = config.bulletColor;
        this.bulletEmoji = config.bulletEmoji;
        this.magnet = 100; // 拾取范围

        // 升级
        this.exp = 0;
        this.maxExp = 100;
        this.level = 0;
        this.timer = 0;
    }

    update() {
        // 移动
        if (Input.up) this.y -= this.speed;
        if (Input.down) this.y += this.speed;
        if (Input.left) this.x -= this.speed;
        if (Input.right) this.x += this.speed;

        // 边界
        this.x = Math.max(20, Math.min(Game.width - 20, this.x));
        this.y = Math.max(20, Math.min(Game.height - 20, this.y));

        // 自动射击
        if (++this.timer >= this.interval) {
            this.shoot();
            this.timer = 0;
        }
    }

    shoot() {
        // 找最近敌人
        let target = null;
        let minD = Infinity;
        Game.enemies.forEach((e) => {
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d < minD) {
                minD = d;
                target = e;
            }
        });

        let angle = -Math.PI / 2;
        if (target) angle = Math.atan2(target.y - this.y, target.x - this.x);

        // 散弹逻辑
        const spread = 0.2;
        const startA = angle - ((this.bulletCount - 1) * spread) / 2;
        for (let i = 0; i < this.bulletCount; i++) {
            Game.bullets.push(new Bullet(this.x, this.y, startA + i * spread, this.dmg));
        }
    }

    gainExp(val) {
        this.exp += val;
        // 循环升级，防止溢出卡死
        while (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.level++;
            this.maxExp = Math.floor(this.maxExp * 1.2);
            // 暂停并弹窗
            Game.state = "UPGRADE";
            UI.showUpgrade();
        }
        UI.update();
    }

    draw() {
        ctx.font = "40px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 光环
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 20;
        ctx.fillText(this.emoji, this.x, this.y);
        ctx.shadowBlur = 0;
    }
}

class Bullet {
    constructor(x, y, a, dmg) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(a) * 12;
        this.vy = Math.sin(a) * 12;
        this.dmg = dmg;
        this.dead = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > Game.width || this.y < 0 || this.y > Game.height) this.dead = true;

        // 碰撞检测
        for (const e of Game.enemies) {
            if (Math.hypot(this.x - e.x, this.y - e.y) < e.size) {
                e.hit(this.dmg);
                this.dead = true;
                break;
            }
        }
    }

    draw() {
        ctx.fillStyle = Game.player.bulletColor;
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(Game.player.bulletEmoji, this.x, this.y);
    }
}

class Enemy {
    constructor(type) {
        // 随机边缘生成
        if (Math.random() < 0.5) {
            this.x = Math.random() < 0.5 ? -30 : Game.width + 30;
            this.y = Math.random() * Game.height;
        } else {
            this.x = Math.random() * Game.width;
            this.y = Math.random() < 0.5 ? -30 : Game.height + 30;
        }

        // 属性设定
        const scaling = 1 + Game.score / 1000;
        this.hp = 30 * scaling;
        this.maxHp = this.hp;
        this.speed = (Math.random() * 1 + 1) * scaling * 0.5;
        if (this.speed > 4) this.speed = 4; // 限速

        // 外观
        if (type === "common") {
            const pool = ["👾", "🐛", "🕷️"];
            this.emoji = pool[Math.floor(Math.random() * pool.length)];
            this.size = 20;
        } else {
            const pool = Game.faction.enemyEmojis;
            this.emoji = pool[Math.floor(Math.random() * pool.length)];
            this.size = 25;
            this.hp *= 1.5; // 门派怪更强
        }
        this.dead = false;
    }

    update() {
        const angle = Math.atan2(Game.player.y - this.y, Game.player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        // 撞击
        if (Math.hypot(this.x - Game.player.x, this.y - Game.player.y) < 30) {
            Game.player.hp -= 10;
            this.dead = true;
            UI.update();
            UI.floatText("痛!", Game.player.x, Game.player.y, "red");
            if (Game.player.hp <= 0) UI.gameOver();
        }
    }

    hit(dmg) {
        this.hp -= dmg;
        UI.floatText(Math.floor(dmg), this.x, this.y, "#fff");
        if (this.hp <= 0) {
            this.dead = true;
            Game.score += 10;
            Game.player.gainExp(20);
            // 掉落物品 (5% 概率)
            if (Math.random() < 0.05) {
                Game.items.push(new Item(this.x, this.y));
            }
            // 粒子特效
            for (let i = 0; i < 5; i++) Game.particles.push(new Particle(this.x, this.y));
        }
    }

    draw() {
        ctx.font = `${this.size * 2}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.emoji, this.x, this.y);

        // 血条
        if (this.hp < this.maxHp) {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x - 15, this.y - 25, 30, 4);
            ctx.fillStyle = "#0f0";
            ctx.fillRect(this.x - 15, this.y - 25, 30 * (this.hp / this.maxHp), 4);
        }
    }
}

class Item {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = Math.random();
        this.dead = false;
        // 30% 大经验包, 70% 鸡腿
        this.isFood = this.type > 0.3;
        this.emoji = this.isFood ? "🍗" : "💎";
        this.vy = -0.5; // 浮动效果
    }

    update() {
        // 磁力吸附
        const d = Math.hypot(this.x - Game.player.x, this.y - Game.player.y);
        if (d < Game.player.magnet) {
            this.x += (Game.player.x - this.x) * 0.1;
            this.y += (Game.player.y - this.y) * 0.1;
        }

        // 拾取
        if (d < 30) {
            this.dead = true;
            if (this.isFood) {
                Game.player.hp = Math.min(Game.player.hp + 20, Game.player.maxHp);
                UI.floatText("美味!", this.x, this.y, "#0f0");
            } else {
                Game.player.gainExp(100);
                UI.floatText("大补!", this.x, this.y, "#0ff");
            }
            UI.update();
        }
    }

    draw() {
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.emoji, this.x, this.y);
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const a = Math.random() * 6.28;
        const s = Math.random() * 3;
        this.vx = Math.cos(a) * s;
        this.vy = Math.sin(a) * s;
        this.life = 1.0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05;
        if (this.life <= 0) this.dead = true;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, 6.28);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Text {
    constructor(str, x, y, color) {
        this.str = str;
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 30;
        this.vy = -1;
    }

    update() {
        this.y += this.vy;
        this.life--;
        if (this.life <= 0) this.dead = true;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(this.str, this.x, this.y);
    }
}

/* --- 输入与UI --- */
const Input = { up: false, down: false, left: false, right: false };
window.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") Input.up = true;
    if (e.key === "s" || e.key === "ArrowDown") Input.down = true;
    if (e.key === "a" || e.key === "ArrowLeft") Input.left = true;
    if (e.key === "d" || e.key === "ArrowRight") Input.right = true;
    if (e.key === "Escape") Game.togglePause();
});
window.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") Input.up = false;
    if (e.key === "s" || e.key === "ArrowDown") Input.down = false;
    if (e.key === "a" || e.key === "ArrowLeft") Input.left = false;
    if (e.key === "d" || e.key === "ArrowRight") Input.right = false;
});
window.addEventListener("mousedown", (e) => {
    if (Game.state === "PLAYING" && e.target === canvas) Game.togglePause();
});
window.addEventListener("resize", () => Game.resize());

const UI = {
    update() {
        const p = Game.player;
        if (!p) return;
        document.getElementById("hp-bar").style.width = `${(p.hp / p.maxHp) * 100}%`;
        document.getElementById("hp-text").innerText = `${Math.floor(p.hp)}/${Math.floor(p.maxHp)}`;
        document.getElementById("exp-bar").style.width = `${(p.exp / p.maxExp) * 100}%`;
        document.getElementById("exp-text").innerText = `${Math.floor((p.exp / p.maxExp) * 100)}%`;
        document.getElementById("score-display").innerText = `BUGS: ${Game.score}`;

        const titleIdx = Math.min(p.level, TITLES.length - 1);
        document.getElementById("lvl-display").innerText = TITLES[titleIdx];
    },

    floatText(str, x, y, color) {
        Game.texts.push(new Text(str, x, y, color));
    },

    showUpgrade() {
        const container = document.getElementById("skill-container");
        container.innerHTML = "";

        // 随机取3个技能 (可重复取，无限升级)
        const pool = [...SKILLS].sort(() => 0.5 - Math.random()).slice(0, 3);

        pool.forEach((s) => {
            const card = document.createElement("div");
            card.className = "skill-card";
            card.innerHTML = `
                <div style="font-size:30px;margin-bottom:5px">${s.icon}</div>
                <div style="color:#00ffff;font-weight:bold">${s.name}</div>
                <div style="font-size:12px;color:#aaa;margin-top:5px">${s.desc}</div>
            `;
            card.onclick = () => {
                this.applySkill(s.id);
                document.getElementById("upgrade-screen").classList.add("hidden");
                Game.state = "PLAYING";
                Game.loop();
            };
            container.appendChild(card);
        });

        document.getElementById("upgrade-screen").classList.remove("hidden");
    },

    applySkill(id) {
        const p = Game.player;
        // 无限叠加逻辑
        if (id === "multishot") p.bulletCount++;
        if (id === "haste") p.interval = Math.max(2, p.interval * 0.85); // 攻速越小越快
        if (id === "power") p.dmg *= 1.25;
        if (id === "health") {
            p.maxHp *= 1.3;
            p.hp = p.maxHp;
        }
        if (id === "speed") p.speed *= 1.15;
        if (id === "crit") {
            // 简单实现暴击逻辑在伤害计算里，这里略
            p.dmg *= 1.1;
        }
        if (id === "magnet") p.magnet *= 1.5;

        this.floatText("技能 Get!", p.x, p.y - 40, "#ffd700");
        this.update();
    },

    gameOver() {
        Game.state = "GAMEOVER";
        const titleIdx = Math.min(Game.player.level, TITLES.length - 1);
        document.getElementById("end-lvl").innerText = TITLES[titleIdx];
        document.getElementById("end-score").innerText = Game.score;
        document.getElementById("game-over-screen").classList.remove("hidden");
    }
};

// 启动
Game.resize();


