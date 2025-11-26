/**
 * 孤身救美：决战缅北 - 完美修复版
 * 修复了主角穿地死亡的Bug，包含了完整的剧情和Emoji画面
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const SCREEN_W = canvas.width;
const SCREEN_H = canvas.height;
const HUD_DIV = document.getElementById('hud');

// --- 游戏素材 (Emoji) ---
const SPRITES = {
    PLAYER: '👮‍♂️', ENEMY_RUSH: '🧟', ENEMY_GUN: '🦹‍♂️', TURRET: '🚧', MECH: '🤖', BOSS: '👹',
    BULLET_PLAYER: '🔥', BULLET_ENEMY: '🔴', BULLET_LASER: '⚡', ITEM: '📦',
    BG_JUNGLE: '🌴', BG_CITY: '🏢', BG_BASE: '🏭'
};

// --- 全局配置 ---
const STATE = { INTRO: 0, PLAYING: 1, GAME_OVER: 3, VICTORY: 4 };
const DIFFICULTY = { hpMod: 1.0, scoreMod: 1.5 }; 

let gameState = STATE.INTRO;
let level = 1;
let score = 0;
let lives = 3;
let frameCount = 0;
let camera = { x: 0 };
let levelEndX = 0;

const KEYS = { W: false, A: false, S: false, D: false, U: false, I: false, J: false, K: false, ENTER: false };

// --- 实体类 ---
class Entity {
    constructor(x, y, w, h) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.vx = 0; this.vy = 0;
        this.markedForDeletion = false;
        this.sprite = '⬛';
        this.flip = false;
    }
    // 绘制逻辑：将Emoji底部对齐碰撞箱底部
    draw(ctx, camX) {
        ctx.save();
        ctx.font = `${this.h}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        let drawX = this.x - camX + this.w / 2;
        let drawY = this.y + this.h + 5; // +5是为了微调Emoji的基线
        if (this.flip) {
            ctx.translate(drawX, drawY);
            ctx.scale(-1, 1);
            ctx.fillText(this.sprite, 0, 0);
        } else {
            ctx.fillText(this.sprite, drawX, drawY);
        }
        // 调试用：取消下面注释可以看到实际碰撞框
        // ctx.strokeStyle = 'red'; ctx.lineWidth = 1; ctx.strokeRect(this.x - camX, this.y, this.w, this.h);
        ctx.restore();
    }
}

class Player extends Entity {
    constructor() {
        super(100, 300, 40, 50); // 初始y设为300，离地近一点
        this.sprite = SPRITES.PLAYER;
        this.grounded = false;
        this.weapon = 'RIFLE';
        this.lastShot = 0;
        this.invulnerable = 0;
    }
    update() {
        // 左右移动
        if (KEYS.A) { this.vx = -5; this.flip = true; }
        else if (KEYS.D) { this.vx = 5; this.flip = false; }
        else { this.vx = 0; }

        // 镜头限制
        if (this.x < camera.x) this.x = camera.x;

        // 跳跃输入
        if (this.grounded) {
            if (KEYS.K) { this.vy = -16; this.grounded = false; }
            else if (KEYS.I) { this.vy = -10; this.grounded = false; }
        }

        // 射击
        if (KEYS.J && gameState === STATE.PLAYING) this.shoot(true);

        // --- 物理引擎核心修复 ---
        this.vy += 0.7; // 重力
        this.x += this.vx;
        this.y += this.vy;

        this.grounded = false; // 先假设在空中

        // 平台碰撞检测 (之前漏掉的部分!)
        platforms.forEach(p => {
            // checkRect是矩形重叠，后半部分判断是否是“从上方落下踩到”
            // this.y + this.h 是脚底板位置
            // p.y 是平台顶部
            if (checkRect(this, p) && 
                this.vy >= 0 && // 只有下落时才检测地板
                this.y + this.h - this.vy <= p.y + 15) // 宽容度检测
            {
                this.y = p.y - this.h; // 修正位置到地面
                this.vy = 0;
                this.grounded = true;
            }
        });

        // 状态更新
        if (this.invulnerable > 0) this.invulnerable--;
        if (this.y > SCREEN_H) this.die(); // 掉出屏幕才死
    }

    shoot(auto) {
        const now = Date.now();
        let cd = this.weapon === 'RIFLE' ? (auto ? 250 : 150) : (this.weapon === 'MACHINE' ? 80 : 300);
        if (now - this.lastShot < cd) return;
        this.lastShot = now;

        let bx = this.x + (this.flip ? -20 : 40);
        let by = this.y + 20;
        let v = this.flip ? -12 : 12;
        let vy = 0;
        if (KEYS.W) { vy = -12; v = 0; bx = this.x + 10; by = this.y - 10; }

        if (this.weapon === 'SPREAD') {
            bullets.push(new Bullet(bx, by, v, vy, true, 'S'));
            bullets.push(new Bullet(bx, by, v, vy-3, true, 'S'));
            bullets.push(new Bullet(bx, by, v, vy+3, true, 'S'));
        } else if (this.weapon === 'LASER') {
             bullets.push(new Bullet(bx, by, v*1.5, vy, true, 'L'));
        } else {
            bullets.push(new Bullet(bx, by, v, vy, true, 'N'));
        }
    }
    die() {
        if (this.invulnerable > 0) return;
        lives--;
        updateHUD();
        if (lives > 0) {
            showToast(`生命 -1 ! 剩余: ${lives}`);
            restartLevel();
        } else {
            gameState = STATE.GAME_OVER;
        }
    }
}

class Bullet extends Entity {
    constructor(x, y, vx, vy, isPlayer, type) {
        super(x, y, 15, 15);
        this.vx = vx; this.vy = vy;
        this.isPlayer = isPlayer;
        this.type = type;
        this.sprite = isPlayer ? (type==='L'?SPRITES.BULLET_LASER:SPRITES.BULLET_PLAYER) : SPRITES.BULLET_ENEMY;
        if(type === 'L') { this.w = 30; this.h = 10; }
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (Math.abs(this.x - camera.x) > SCREEN_W + 100 || this.y < -50 || this.y > SCREEN_H) this.markedForDeletion = true;
    }
}

class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y, 40, 50);
        this.type = type;
        this.hp = (type > 8 ? 20 : (type > 4 ? 5 : 1)) * DIFFICULTY.hpMod;
        if (type === 10) this.hp = 100 * DIFFICULTY.hpMod;
        
        if (type <= 1) this.sprite = SPRITES.ENEMY_RUSH;
        else if (type <= 4) this.sprite = SPRITES.ENEMY_GUN;
        else if (type <= 7) this.sprite = SPRITES.TURRET;
        else if (type <= 9) { this.sprite = SPRITES.MECH; this.w=60; this.h=70; }
        else { this.sprite = SPRITES.BOSS; this.w=100; this.h=100; }
        
        this.active = false;
        this.timer = 0;
    }
    update() {
        if (!this.active) {
            if (this.x < camera.x + SCREEN_W + 50) this.active = true;
            else return;
        }
        if (this.x < camera.x - 100) this.markedForDeletion = true;
        this.flip = (player.x < this.x);

        if (this.type === 10) this.updateBoss();
        else if (this.type >= 8) this.updateMech();
        else if (this.type >= 5) this.updateTurret();
        else if (this.type >= 2) this.updateShooter();
        else this.updateRush();

        // 敌人也要有物理，不然也会掉下去
        if (this.type < 5) {
            this.vy += 0.7; this.y += this.vy;
            platforms.forEach(p => {
                if (checkRect(this, p) && this.y + this.h - this.vy <= p.y + 10) {
                    this.y = p.y - this.h; this.vy = 0;
                }
            });
            if(this.y > SCREEN_H) this.markedForDeletion = true;
        }
    }
    updateRush() { this.x -= 2; }
    updateShooter() {
        if (frameCount % 100 === 0 && Math.abs(this.x - player.x) < 500) {
            let dir = this.x > player.x ? -1 : 1;
            bullets.push(new Bullet(this.x, this.y+20, dir * 7, 0, false, 'N'));
        }
    }
    updateTurret() {
        if (frameCount % 120 === 0) {
            let angle = Math.atan2(player.y - this.y, player.x - this.x);
            bullets.push(new Bullet(this.x, this.y, Math.cos(angle)*6, Math.sin(angle)*6, false, 'N'));
        }
    }
    updateMech() {
        if (frameCount % 80 === 0) bullets.push(new Bullet(this.x, this.y+30, -8, 0, false, 'N'));
    }
    updateBoss() {
        this.timer++;
        this.y = 100 + Math.sin(this.timer * 0.05) * 80;
        if (this.timer % 15 === 0) bullets.push(new Bullet(this.x, this.y + 50, -8, (Math.random()-0.5)*5, false, 'N'));
    }
}

class Item extends Entity {
    constructor(x, y, type) {
        super(x, y, 30, 30);
        this.type = type; this.sprite = SPRITES.ITEM; this.vy = -5;
    }
    update() {
        this.vy += 0.5; this.y += this.vy;
        platforms.forEach(p => {
            if (checkRect(this, p) && this.y + this.h - this.vy <= p.y + 10) {
                this.y = p.y - this.h; this.vy = 0;
            }
        });
    }
    draw(ctx, cx) {
        super.draw(ctx, cx);
        ctx.fillStyle = '#000'; ctx.font = 'bold 16px Arial';
        ctx.fillText(this.type, this.x - cx + 15, this.y + 20);
    }
}

// --- 游戏逻辑 ---
let player, bullets, enemies, items, platforms;

function initGame() {
    score = 0; lives = 3; level = 1;
    HUD_DIV.classList.remove('hidden');
    restartLevel();
}

function restartLevel() {
    player = new Player();
    bullets = []; enemies = []; items = []; platforms = [];
    camera.x = 0;
    
    levelEndX = (level === 3) ? 2000 : 4000;
    let cx = 0;
    let groundY = SCREEN_H - 60;
    
    // 初始站台：确保在玩家出生点下方
    platforms.push({x: -100, y: groundY, w: 600, h: 200});
    cx += 500;

    while (cx < levelEndX) {
        if (Math.random() < 0.3 && level !== 3) cx += 120 + Math.random() * 100;

        let w = 300 + Math.random() * 400;
        let h = groundY - (Math.random() * (level===2?250:150) - 50);
        if (h > SCREEN_H - 50) h = SCREEN_H - 50;
        if (h < 200) h = 200;

        platforms.push({x: cx, y: h, w: w, h: SCREEN_H});

        let eCount = Math.floor(w / 200);
        for(let i=0; i<eCount; i++) {
            let typeMax = level === 1 ? 4 : (level === 2 ? 7 : 9);
            enemies.push(new Enemy(cx + Math.random()*w, h - 60, Math.floor(Math.random() * (typeMax+1))));
        }
        cx += w;
    }
    platforms.push({x: levelEndX, y: groundY, w: 1000, h: 200});
    let bossType = level === 3 ? 10 : 8;
    enemies.push(new Enemy(levelEndX + 600, 100, bossType));

    showToast(`第 ${level} 关开始！`);
    updateHUD();
}

// 矩形碰撞检测
function checkRect(r1, r2) {
    return (r1.x < r2.x + r2.w && 
            r1.x + r1.w > r2.x && 
            r1.y < r2.y + r2.h && 
            r1.y + r1.h > r2.y);
}

function updateGame() {
    player.update();
    let targetCam = player.x - SCREEN_W * 0.3;
    if (targetCam < 0) targetCam = 0;
    if (targetCam > camera.x) camera.x = targetCam;

    enemies.forEach(e => e.update());
    bullets.forEach(b => b.update());
    items.forEach(i => i.update());

    bullets.forEach(b => {
        if (b.markedForDeletion) return;
        if (b.isPlayer) {
            enemies.forEach(e => {
                if (!e.markedForDeletion && checkRect(b, e)) {
                    e.hp -= (b.type==='L'?2:1);
                    b.markedForDeletion = (b.type!=='L');
                    if (e.hp <= 0) {
                        e.markedForDeletion = true;
                        score += 100;
                        if(Math.random()<0.2) items.push(new Item(e.x, e.y, ['S','M','L'][Math.floor(Math.random()*3)]));
                        updateHUD();
                    }
                }
            });
        } else {
            if (checkRect(b, player)) { player.die(); b.markedForDeletion = true; }
        }
    });

    enemies.forEach(e => { if (!e.markedForDeletion && checkRect(player, e)) player.die(); });
    items.forEach(i => {
        if (checkRect(player, i)) {
            player.weapon = i.type === 'S' ? 'SPREAD' : (i.type === 'M' ? 'MACHINE' : 'LASER');
            score += 50; showToast("获得武器: " + player.weapon);
            i.markedForDeletion = true; updateHUD();
        }
    });

    enemies = enemies.filter(e => !e.markedForDeletion);
    bullets = bullets.filter(b => !b.markedForDeletion);
    items = items.filter(i => !i.markedForDeletion);

    if (player.x > levelEndX + 600 && enemies.length === 0) {
        if (level < 3) { level++; restartLevel(); }
        else gameState = STATE.VICTORY;
    }
}

// --- 渲染 ---
function draw() {
    let bgColors = ['#1a2a1a', '#0a0a2a', '#2a1a1a'];
    ctx.fillStyle = bgColors[level-1];
    ctx.fillRect(0,0, SCREEN_W, SCREEN_H);
    
    ctx.globalAlpha = 0.2; ctx.font = '100px Arial';
    let bgSprite = [SPRITES.BG_JUNGLE, SPRITES.BG_CITY, SPRITES.BG_BASE][level-1];
    for(let i=0; i<10; i++) {
        let px = (i * 300 - camera.x * 0.5) % (SCREEN_W + 400);
        if (px < -200) px += SCREEN_W + 400;
        ctx.fillText(bgSprite, px, SCREEN_H - 100);
    }
    ctx.globalAlpha = 1.0;

    let dangerColor = level === 1 ? '#2f4f2f' : '#4a0000';
    ctx.fillStyle = dangerColor;
    ctx.fillRect(0, SCREEN_H - 40, SCREEN_W, 40);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    for(let i=0; i<SCREEN_W; i+=20) {
        ctx.moveTo(i - (frameCount%20), SCREEN_H - 40);
        ctx.lineTo(i+10 - (frameCount%20), SCREEN_H - 35);
    }
    ctx.stroke();

    ctx.save();
    platforms.forEach(p => {
        let drawX = p.x - camera.x;
        if (drawX < SCREEN_W && drawX + p.w > 0) {
            ctx.fillStyle = level === 1 ? '#3e2723' : (level === 2 ? '#37474f' : '#263238');
            ctx.fillRect(drawX, p.y, p.w, SCREEN_H - p.y);
            ctx.fillStyle = level === 1 ? '#4caf50' : (level === 2 ? '#90a4ae' : '#546e7a');
            ctx.fillRect(drawX, p.y, p.w, 10);
            ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(drawX, p.y, p.w, 2);
        }
    });

    items.forEach(i => i.draw(ctx, camera.x));
    enemies.forEach(e => e.draw(ctx, camera.x));
    bullets.forEach(b => b.draw(ctx, camera.x));
    player.draw(ctx, camera.x);
    ctx.restore();
    
    drawToast();
}

function drawIntro() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0, SCREEN_W, SCREEN_H);
    HUD_DIV.classList.add('hidden');

    ctx.fillStyle = '#4caf50';
    ctx.font = 'bold 40px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("孤身救美：决战缅北", SCREEN_W/2, 80);

    let lines = [
        "你的江西女友被骗至缅北3K园区...",
        "身无分文的你无法支付赎金，唯有拿起身边的枪。",
        "",
        "目标：突破丛林、园区和仓库，救出她！",
        "",
        "---- 操作说明 ----",
        "WASD : 移动/瞄准",
        "U : 单发射击  |  J : 连发开火",
        "I : 小跳跃    |  K : 大跳跃",
        "",
        "⚠️ 按 [ENTER] 开始行动 ⚠️"
    ];

    ctx.font = '20px "Courier New", monospace';
    let startY = 140;
    lines.forEach((line, index) => {
        if (line.includes("Enter")) ctx.fillStyle = '#fff';
        else if (line.includes("----")) ctx.fillStyle = '#4caf50';
        else ctx.fillStyle = '#ccc';
        ctx.fillText(line, SCREEN_W/2, startY + index * 30);
    });
}

function drawEndScreen(title, sub) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0,0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = title.includes("成功") ? '#4caf50' : '#f44336';
    ctx.font = "50px Arial"; ctx.textAlign = "center";
    ctx.fillText(title, SCREEN_W/2, SCREEN_H/2 - 40);
    
    ctx.fillStyle = '#fff'; ctx.font = "24px Arial";
    let lines = sub.split('\n');
    lines.forEach((l, i) => ctx.fillText(l, SCREEN_W/2, SCREEN_H/2 + 30 + i*40));
}

let toastTimer = 0, toastMsg = "";
function showToast(msg) { toastMsg = msg; toastTimer = 120; }
function drawToast() {
    if (toastTimer > 0) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(SCREEN_W/2 - 200, 100, 400, 50);
        ctx.fillStyle = "#fff"; ctx.font = "20px Arial"; ctx.textAlign = "center";
        ctx.fillText(toastMsg, SCREEN_W/2, 132);
        toastTimer--;
    }
}

function updateHUD() {
    let hearts = ""; for(let i=0; i<lives; i++) hearts += "❤️";
    document.getElementById('hud-lives').innerText = hearts || "💀";
    document.getElementById('hud-score').innerText = "💰 " + score;
    document.getElementById('hud-weapon').innerText = "🔫 " + (player.weapon === 'RIFLE' ? '步枪' : player.weapon);
    document.getElementById('hud-level').innerText = "🚩 " + level + "-1";
}

// --- 循环 ---
function gameLoop() {
    frameCount++;
    ctx.clearRect(0,0,SCREEN_W, SCREEN_H);

    if (gameState === STATE.PLAYING) {
        updateGame();
        draw();
    } else if (gameState === STATE.INTRO) {
        drawIntro();
    } else if (gameState === STATE.GAME_OVER) {
        drawEndScreen("任务失败", `最终得分: ${score}\n按 [ENTER] 重新挑战`);
    } else if (gameState === STATE.VICTORY) {
        drawEndScreen("营救成功！", `你摧毁了3K园区救出了女友！\n最终得分: ${score}\n按 [ENTER] 再玩一次`);
    }

    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
    let k = e.key.toUpperCase();
    if(KEYS.hasOwnProperty(k)) KEYS[k] = true;
    if(k === 'U' && gameState === STATE.PLAYING) player.shoot(false);
    if(k === 'ENTER') {
        if(gameState !== STATE.PLAYING) {
            initGame();
            gameState = STATE.PLAYING;
        }
    }
});
window.addEventListener('keyup', e => {
    let k = e.key.toUpperCase();
    if(KEYS.hasOwnProperty(k)) KEYS[k] = false;
});

requestAnimationFrame(gameLoop);

