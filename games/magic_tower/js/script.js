// --- 游戏数据配置 ---

// 1. ID定义
const ID = {
    EMPTY: 0,
    WALL: 1,
    HERO: 2,
    STAIRS_UP: 88,
    STAIRS_DOWN: 89,
    
    // 物品
    KEY_YELLOW: 10, KEY_BLUE: 11, KEY_RED: 12,
    POTION_S: 20, POTION_L: 21,
    GEM_ATK: 22, GEM_DEF: 23,
    SWORD: 24, SHIELD: 25,
    
    // 门
    DOOR_YELLOW: 30, DOOR_BLUE: 31, DOOR_RED: 32,
    
    // 怪物 (40+)
    SLIME_G: 40, // 绿史莱姆
    SLIME_R: 41, // 红史莱姆
    BAT: 42,     // 蝙蝠
    SKELETON: 43,// 骷髅
    MAGE: 44,    // 法师
    BOSS: 99     // 魔王
};

// 2. 资源映射 (Emoji展示)
const ASSETS = {
    [ID.EMPTY]: '', [ID.WALL]: '',
    [ID.HERO]: '🛡️',
    [ID.STAIRS_UP]: '⏫', [ID.STAIRS_DOWN]: '⏬',
    [ID.KEY_YELLOW]: '🗝️', [ID.KEY_BLUE]: '🗝️', [ID.KEY_RED]: '🗝️',
    [ID.POTION_S]: '🍷', [ID.POTION_L]: '🍷',
    [ID.GEM_ATK]: '💎', [ID.GEM_DEF]: '🔷',
    [ID.SWORD]: '⚔️', [ID.SHIELD]: '🛡️',
    [ID.DOOR_YELLOW]: '', [ID.DOOR_BLUE]: '', [ID.DOOR_RED]: '',
    [ID.SLIME_G]: '🟢', [ID.SLIME_R]: '🔴',
    [ID.BAT]: '🦇', [ID.SKELETON]: '💀', [ID.MAGE]: '🧙', [ID.BOSS]: '👹'
};

// 3. 样式类映射
const CLASSES = {
    [ID.WALL]: 'wall', [ID.EMPTY]: 'floor',
    [ID.DOOR_YELLOW]: 'door-yellow', [ID.DOOR_BLUE]: 'door-blue', [ID.KEY_YELLOW]: 'key-icon yellow', [ID.KEY_BLUE]: 'key-icon blue'
};

// 4. 怪物数值字典
const MONSTERS = {
    [ID.SLIME_G]: { name: "绿史莱姆", hp: 50, atk: 20, def: 1, gold: 1, exp: 1 },
    [ID.SLIME_R]: { name: "红史莱姆", hp: 70, atk: 35, def: 5, gold: 2, exp: 2 },
    [ID.BAT]:     { name: "小蝙蝠", hp: 100, atk: 60, def: 10, gold: 5, exp: 5 },
    [ID.SKELETON]:{ name: "骷髅兵", hp: 200, atk: 150, def: 20, gold: 10, exp: 10 },
    [ID.MAGE]:    { name: "大法师", hp: 500, atk: 300, def: 100, gold: 50, exp: 50 },
    [ID.BOSS]:    { name: "魔王", hp: 5000, atk: 1000, def: 500, gold: 999, exp: 999 }
};

// --- 游戏状态 ---
let hero = {
    floor: 0,
    x: 6, y: 11,
    hp: 1000, atk: 100, def: 100, // 初始稍微强一点方便测试
    gold: 0, exp: 0,
    keys: { yellow: 1, blue: 1, red: 0 }
};

// 13x13 地图生成辅助
// 0=空, 1=墙
const M = ID; // 简写
const maps = []; // 存储所有楼层数据

// 创建10层地图 (这里简单生成，实际开发可手写每一层)
function initMaps() {
    // 模板1：简单迷宫
    const map1 = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,M.STAIRS_UP,0,0,M.SLIME_G,0,0,M.KEY_YELLOW,1,M.POTION_S,0,M.GEM_ATK,1],
        [1,1,1,1,1,1,0,1,1,1,0,1,1],
        [1,M.GEM_DEF,0,M.DOOR_YELLOW,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,0,1,1,1,1,1,1],
        [1,M.KEY_BLUE,0,M.SLIME_R,1,0,0,0,1,M.BAT,0,M.KEY_YELLOW,1],
        [1,0,1,1,1,0,0,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,0,1],
        [1,M.POTION_L,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,0,1,1,1],
        [1,0,0,0,0,0,2,0,0,0,0,M.STAIRS_DOWN,1], // 2是勇士初始位
        [1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // 复制逻辑生成10层，每层怪物加强一点点(逻辑上简化)
    for(let i=0; i<10; i++) {
        // 深拷贝地图
        let newMap = JSON.parse(JSON.stringify(map1));
        
        // 第10层放BOSS
        if(i === 9) {
            newMap[1][1] = M.BOSS; // 终点放BOSS
            newMap[11][11] = M.STAIRS_DOWN;
        } else {
            // 偶数层稍微改变一下布局
            if(i % 2 === 0) newMap[3][3] = M.SKELETON;
            if(i > 5) newMap[5][5] = M.MAGE;
            newMap[1][1] = M.STAIRS_UP;
            if(i>0) newMap[11][11] = M.STAIRS_DOWN;
        }
        maps.push(newMap);
    }
}

// --- 核心引擎 ---

const gameMapEl = document.getElementById('game-map');
const logEl = document.getElementById('message-box');

function log(msg) {
    logEl.innerHTML += `> ${msg}<br>`;
    logEl.scrollTop = logEl.scrollHeight;
}

// 渲染函数
function render() {
    gameMapEl.innerHTML = '';
    const currentMap = maps[hero.floor];

    for(let y=0; y<13; y++) {
        for(let x=0; x<13; x++) {
            const id = currentMap[y][x];
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // 设置背景样式
            if(id === M.WALL) cell.classList.add('wall');
            else cell.classList.add('floor');
            
            // 特殊物体样式
            if(CLASSES[id]) {
                const classArr = CLASSES[id].split(' ');
                classArr.forEach(c => cell.classList.add(c));
            }

            // 渲染内容 (Emoji)
            // 如果是勇士位置
            if (x === hero.x && y === hero.y) {
                cell.innerHTML = ASSETS[M.HERO];
                cell.classList.add('hero');
            } else if (ASSETS[id]) {
                cell.innerHTML = ASSETS[id];
                // 给怪物添加标识以便点击
                if(id >= 40) {
                    cell.setAttribute('data-monster', id);
                    cell.onclick = () => showMonsterInfo(id);
                }
            }
            
            gameMapEl.appendChild(cell);
        }
    }
    updateUI();
}

function updateUI() {
    document.getElementById('ui-floor').innerText = hero.floor + 1;
    document.getElementById('ui-hp').innerText = hero.hp;
    document.getElementById('ui-atk').innerText = hero.atk;
    document.getElementById('ui-def').innerText = hero.def;
    document.getElementById('ui-gold').innerText = hero.gold;
    document.getElementById('ui-exp').innerText = hero.exp;
    document.getElementById('ui-key-y').innerText = hero.keys.yellow;
    document.getElementById('ui-key-b').innerText = hero.keys.blue;
    document.getElementById('ui-key-r').innerText = hero.keys.red;
}

// 移动逻辑
function move(dx, dy) {
    const targetX = hero.x + dx;
    const targetY = hero.y + dy;
    
    // 边界检查
    if (targetX < 0 || targetX > 12 || targetY < 0 || targetY > 12) return;

    const targetId = maps[hero.floor][targetY][targetX];

    // 1. 撞墙
    if (targetId === M.WALL) return;

    // 2. 物品/门/怪物 处理
    if (targetId === M.EMPTY) {
        hero.x = targetX; hero.y = targetY;
    } 
    else if (targetId === M.STAIRS_UP) {
        if(hero.floor < 9) {
            hero.floor++;
            // 简单处理：上楼保持位置，或者重置到入口。这里简单重置到左下角附近
            hero.x = 10; hero.y = 11; 
            log(`进入第 ${hero.floor+1} 层`);
        } else {
            log("已是顶层！");
        }
    }
    else if (targetId === M.STAIRS_DOWN) {
        if(hero.floor > 0) {
            hero.floor--;
            hero.x = 1; hero.y = 1;
            log(`返回第 ${hero.floor+1} 层`);
        }
    }
    else if (targetId >= 40) {
        // 战斗
        fight(targetX, targetY, targetId);
        return; // 战斗时不直接移动，如果赢了再消除
    }
    else if (handleItem(targetId, targetX, targetY)) {
        // 如果是物品且处理成功（例如开门成功），移动进去
        // 只有吃东西或者捡钥匙才移动，门开了也是移动
        hero.x = targetX; hero.y = targetY;
        maps[hero.floor][targetY][targetX] = M.EMPTY; // 移除物体
    }

    render();
}

// 物品交互逻辑
function handleItem(id, tx, ty) {
    switch(id) {
        case M.KEY_YELLOW: hero.keys.yellow++; log("获得黄钥匙"); return true;
        case M.KEY_BLUE: hero.keys.blue++; log("获得蓝钥匙"); return true;
        case M.KEY_RED: hero.keys.red++; log("获得红钥匙"); return true;
        case M.POTION_S: hero.hp += 200; log("生命 +200"); return true;
        case M.POTION_L: hero.hp += 500; log("生命 +500"); return true;
        case M.GEM_ATK: hero.atk += 3; log("攻击 +3"); return true;
        case M.GEM_DEF: hero.def += 3; log("防御 +3"); return true;
        case M.DOOR_YELLOW: 
            if(hero.keys.yellow > 0) { hero.keys.yellow--; log("开启黄门"); return true; }
            else { log("需要黄钥匙！"); return false; }
        case M.DOOR_BLUE: 
            if(hero.keys.blue > 0) { hero.keys.blue--; log("开启蓝门"); return true; }
            else { log("需要蓝钥匙！"); return false; }
        case M.DOOR_RED: 
             if(hero.keys.red > 0) { hero.keys.red--; log("开启红门"); return true; }
            else { log("需要红钥匙！"); return false; }
        default: return true; // 默认可行
    }
}

// 战斗逻辑
function fight(tx, ty, monsterId) {
    const m = MONSTERS[monsterId];
    
    // 计算伤害
    const heroDmg = Math.max(hero.atk - m.def, 0);
    const monsterDmg = Math.max(m.atk - hero.def, 0);

    if (heroDmg === 0) {
        log(`你无法破防 ${m.name}！`);
        return;
    }

    const turns = Math.ceil(m.hp / heroDmg);
    const totalDmg = (turns - 1) * monsterDmg; // 先手攻击，少受一次伤

    if (hero.hp > totalDmg) {
        hero.hp -= totalDmg;
        hero.gold += m.gold;
        hero.exp += m.exp;
        log(`战胜 ${m.name}! 损失HP:${totalDmg}, 获得金币:${m.gold}`);
        
        // 移除怪物
        maps[hero.floor][ty][tx] = M.EMPTY;
        hero.x = tx; hero.y = ty; // 移动到怪物位置
        
        if (monsterId === M.BOSS) {
            alert("恭喜你！打败了魔王，救出了公主（虽然没做公主的素材）！游戏通关！");
        }
        
        render();
    } else {
        log(`打不过 ${m.name}！预计损失 ${totalDmg} HP，你只有 ${hero.hp}`);
    }
}

// 查看怪物属性
function showMonsterInfo(mid) {
    const m = MONSTERS[mid];
    const modal = document.getElementById('monster-modal');
    document.getElementById('m-name').innerText = m.name;
    document.getElementById('m-hp').innerText = m.hp;
    document.getElementById('m-atk').innerText = m.atk;
    document.getElementById('m-def').innerText = m.def;
    document.getElementById('m-gold').innerText = m.gold;
    document.getElementById('m-exp').innerText = m.exp;

    // 预测结果
    const heroDmg = Math.max(hero.atk - m.def, 0);
    const monsterDmg = Math.max(m.atk - hero.def, 0);
    let predText = "";
    
    if(heroDmg <= 0) predText = "无法战胜 (攻击过低)";
    else {
        const turns = Math.ceil(m.hp / heroDmg);
        const totalLoss = (turns - 1) * monsterDmg;
        if (hero.hp > totalLoss) predText = `预计损失: ${totalLoss} HP`;
        else predText = "危险！生命不足！";
    }
    document.getElementById('m-prediction').innerText = predText;
    if(hero.hp <= (Math.ceil(m.hp / Math.max(hero.atk - m.def, 0)) - 1) * Math.max(m.atk - hero.def, 0)) {
         document.getElementById('m-prediction').style.color = 'red';
    } else {
         document.getElementById('m-prediction').style.color = '#0f0';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('monster-modal').classList.add('hidden');
}

// --- 输入控制 ---
window.addEventListener('keydown', (e) => {
    if(document.getElementById('game-container').style.display === 'none') return;
    
    switch(e.key) {
        case 'ArrowUp': move(0, -1); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
    }
});

// --- 游戏启动 ---
document.getElementById('intro-screen').addEventListener('click', () => {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    initMaps();
    render();
});