/* =========================================================
   经典魔塔 - 勇者试炼 (修复版)
   ========================================================= */

const ID = {
    EMPTY: 0, WALL: 1, HERO: 2,
    STAIR_UP: 88, STAIR_DOWN: 89,
    KEY_Y: 10, KEY_B: 11, KEY_R: 12,
    POTION_R: 20, POTION_B: 21,
    GEM_ATK: 22, GEM_DEF: 23,
    SWORD: 24, SHIELD: 25,
    DOOR_Y: 30, DOOR_B: 31, DOOR_R: 32,
    // 怪物 ID
    SLIME_G: 40, SLIME_R: 41, BAT: 42, MAGE: 43,
    SKELETON: 44, SKELETON_S: 45, ORC: 46, STONE: 47,
    GHOST: 48, VAMPIRE: 49, BOSS: 99
};

// 资源映射
const ASSET_CLASS = {
    [ID.WALL]: 'bg-wall', 
    [ID.EMPTY]: 'bg-floor',
    [ID.KEY_Y]: 'item-bg i-key-y', [ID.KEY_B]: 'item-bg i-key-b', [ID.KEY_R]: 'item-bg i-key-r',
    [ID.POTION_R]: 'item-bg i-potion-r', [ID.POTION_B]: 'item-bg i-potion-b',
    [ID.GEM_ATK]: 'item-bg i-gem-atk', [ID.GEM_DEF]: 'item-bg i-gem-def',
    [ID.SWORD]: 'item-bg i-sword', [ID.SHIELD]: 'item-bg i-shield',
    [ID.DOOR_Y]: 'door-y', [ID.DOOR_B]: 'door-b', [ID.DOOR_R]: 'door-r',
    [ID.HERO]: 'hero-icon'
};

const MONSTERS = {
    [ID.SLIME_G]: { name: "绿史莱姆", hp: 35, atk: 18, def: 1, gold: 1, exp: 1, cls: "m-slime-g" },
    [ID.SLIME_R]: { name: "红史莱姆", hp: 60, atk: 25, def: 5, gold: 2, exp: 2, cls: "m-slime-r" },
    [ID.BAT]:     { name: "小蝙蝠", hp: 100, atk: 35, def: 10, gold: 5, exp: 3, cls: "m-bat" },
    [ID.MAGE]:    { name: "大法师", hp: 130, atk: 60, def: 5, gold: 10, exp: 5, cls: "m-mage" },
    [ID.SKELETON]:{ name: "骷髅人", hp: 150, atk: 70, def: 20, gold: 15, exp: 8, cls: "m-skeleton" },
    [ID.SKELETON_S]:{ name: "骷髅战士", hp: 250, atk: 120, def: 30, gold: 25, exp: 12, cls: "m-skeleton" },
    [ID.ORC]:     { name: "兽人", hp: 400, atk: 180, def: 40, gold: 35, exp: 20, cls: "m-orc" },
    [ID.STONE]:   { name: "石头人", hp: 600, atk: 220, def: 120, gold: 50, exp: 30, cls: "m-boss" },
    [ID.GHOST]:   { name: "幽灵", hp: 500, atk: 300, def: 5, gold: 45, exp: 28, cls: "m-mage" },
    [ID.VAMPIRE]: { name: "吸血鬼", hp: 1200, atk: 550, def: 300, gold: 120, exp: 100, cls: "m-bat" },
    [ID.BOSS]:    { name: "魔王佐斯", hp: 5000, atk: 999, def: 500, gold: 0, exp: 0, cls: "m-boss" }
};

const M = ID;
let hero = { floor: 0, x: 6, y: 12, hp: 1000, atk: 10, def: 10, gold: 0, exp: 0, keys: { y: 1, b: 0, r: 0 } };
let isBattling = false;
let maps = [];

function initMaps() {
    maps = [];
    // Level 1: 上楼梯在 (1,1)
    maps.push([
        [1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,M.STAIR_UP,1,M.GEM_ATK,0,M.SLIME_G,0,M.KEY_Y,1,0,0,0,1],
        [1,0,1,1,1,1,M.DOOR_Y,1,1,0,1,0,1],
        [1,0,0,0,M.SLIME_G,1,0,1,0,0,1,0,1],
        [1,1,1,1,0,1,0,1,M.SLIME_R,0,1,0,1],
        [1,M.KEY_Y,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,M.SLIME_G,1,0,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,M.SLIME_G,M.KEY_Y,1],
        [1,1,1,1,1,1,0,1,1,1,1,0,1],
        [1,0,M.POTION_R,0,0,1,0,M.SLIME_R,0,0,0,0,1],
        [1,0,1,1,1,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,M.HERO,0,0,0,0,0,1], 
        [1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]);
    // Level 2: 下楼梯在 (1,1)
    maps.push([
        [1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,M.STAIR_DOWN,0,M.DOOR_Y,M.GEM_DEF,0,0,0,M.BAT,0,1,M.STAIR_UP,1],
        [1,1,1,1,1,1,0,1,1,1,1,0,1],
        [1,M.POTION_R,0,M.SLIME_R,0,0,0,1,M.GEM_ATK,0,0,0,1],
        [1,0,1,1,1,1,0,1,1,1,1,0,1],
        [1,0,M.SLIME_G,0,0,0,0,0,0,M.SLIME_G,1,0,1],
        [1,1,1,0,1,1,1,1,1,0,1,1,1],
        [1,M.KEY_B,0,0,0,M.BAT,0,0,0,0,0,M.KEY_Y,1],
        [1,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,M.GEM_DEF,0,0,1,0,1,0,0,0,M.SLIME_R,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1,1],
        [1,M.SWORD,1,0,0,0,0,0,0,1,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]);
    
    // 生成 Level 3-9
    for(let i=2; i<9; i++) {
        let newMap = JSON.parse(JSON.stringify(maps[1]));
        newMap[1][1] = M.STAIR_DOWN; 
        if(i%2===0) { newMap[6][6] = M.SKELETON; newMap[4][4] = M.ORC; }
        else { newMap[6][6] = M.MAGE; newMap[4][4] = M.GHOST; }
        maps.push(newMap);
    }
    // Level 10
    maps.push([
        [1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,M.BOSS,1,1,1,1,1,1,1],
        [1,1,1,1,1,M.DOOR_R,1,1,1,1,1,1,1],
        [1,0,0,M.VAMPIRE,0,0,0,M.VAMPIRE,0,0,1,1,1],
        [1,0,1,1,1,1,0,1,1,1,1,0,1],
        [1,0,1,M.POTION_B,0,0,0,0,0,M.POTION_B,1,0,1],
        [1,0,1,0,1,1,1,1,1,0,1,0,1],
        [1,0,1,0,0,M.MAGE,0,M.MAGE,0,0,1,0,1],
        [1,0,1,1,1,1,M.DOOR_B,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,0,1],
        [1,M.STAIR_DOWN,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]);
}

const gameMapEl = document.getElementById('game-map');
const logEl = document.getElementById('message-box');

function log(msg) {
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
}

function render() {
    gameMapEl.innerHTML = '';
    const currentMap = maps[hero.floor];

    for(let y=0; y<13; y++) {
        for(let x=0; x<13; x++) {
            const id = currentMap[y][x];
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // 地板
            if(id === M.WALL) cell.classList.add('bg-wall');
            else cell.classList.add('bg-floor');

            // 渲染层
            if (x === hero.x && y === hero.y) {
                const heroDiv = document.createElement('div');
                heroDiv.classList.add('cell', 'hero-icon');
                cell.appendChild(heroDiv);
            } 
            else if (id !== M.EMPTY && id !== M.WALL) {
                // Emoji 楼梯
                if(id === M.STAIR_UP) {
                    const s = document.createElement('div');
                    s.className = 'cell stair-emoji'; s.innerText = '⬆️';
                    cell.appendChild(s);
                } else if (id === M.STAIR_DOWN) {
                    const s = document.createElement('div');
                    s.className = 'cell stair-emoji'; s.innerText = '⬇️';
                    cell.appendChild(s);
                }
                // 怪物
                else if(id >= 40) { 
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('cell', 'monster-icon');
                    if(MONSTERS[id]) itemDiv.classList.add(MONSTERS[id].cls);
                    itemDiv.onclick = (e) => { e.stopPropagation(); openDetailModal(id); };
                    cell.appendChild(itemDiv);
                } 
                // 物品
                else {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('cell');
                    if(ASSET_CLASS[id]) {
                        const arr = ASSET_CLASS[id].split(' ');
                        arr.forEach(c => itemDiv.classList.add(c));
                    }
                    cell.appendChild(itemDiv);
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
    document.getElementById('ui-key-y').innerText = hero.keys.y;
    document.getElementById('ui-key-b').innerText = hero.keys.b;
    document.getElementById('ui-key-r').innerText = hero.keys.r;
}

function openDetailModal(mid) {
    if(isBattling) return;
    const m = MONSTERS[mid];
    const modal = document.getElementById('monster-detail-modal');
    
    document.getElementById('detail-m-name').innerText = m.name;
    document.getElementById('detail-m-img').className = 'big-fighter monster-icon ' + m.cls;
    document.getElementById('detail-hp').innerText = m.hp;
    document.getElementById('detail-atk').innerText = m.atk;
    document.getElementById('detail-def').innerText = m.def;
    document.getElementById('detail-gold').innerText = m.gold;
    document.getElementById('detail-exp').innerText = m.exp;

    const dmg = Math.max(hero.atk - m.def, 0);
    const mDmg = Math.max(m.atk - hero.def, 0);
    let predHTML = "";
    
    if (dmg <= 0) {
        predHTML = "<span class='text-danger'>❌ 攻击不足，无法破防！</span>";
    } else {
        const turns = Math.ceil(m.hp / dmg);
        const loss = (turns - 1) * mDmg;
        if (loss >= hero.hp) {
            predHTML = `<span class='text-danger'>❌ 危险！预计损失 ${loss} HP</span>`;
        } else if (loss > hero.hp * 0.5) {
             predHTML = `<span class='text-danger' style='color:#ff0'>⚠️ 困难！预计损失 ${loss} HP</span>`;
        } else {
            predHTML = `<span class='text-safe'>✅ 安全，预计损失 ${loss} HP</span>`;
        }
    }
    document.getElementById('detail-prediction').innerHTML = predHTML;
    modal.classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('monster-detail-modal').classList.add('hidden');
}

async function move(dx, dy) {
    if (isBattling) return;
    const tx = hero.x + dx, ty = hero.y + dy;
    if (tx < 0 || tx > 12 || ty < 0 || ty > 12) return;
    const tid = maps[hero.floor][ty][tx];
    
    if (tid === M.WALL) return;

    if (tid >= 40) {
        await startBattle(tx, ty, tid);
    } 
    // --- 修复重点：传送后坐标设置为 (1, 1)，确保不卡在墙里 ---
    else if (tid === M.STAIR_UP) {
        if (hero.floor < 9) {
            hero.floor++; hero.x = 1; hero.y = 1; 
            log(`进入第 ${hero.floor+1} 层`); render();
        } else {
            log("已是顶层");
        }
    } 
    else if (tid === M.STAIR_DOWN) {
        if (hero.floor > 0) {
            hero.floor--; hero.x = 1; hero.y = 1;
            log(`返回第 ${hero.floor+1} 层`); render();
        }
    } 
    else {
        if (tid !== M.EMPTY) {
            if (handleItem(tid)) {
                 hero.x = tx; hero.y = ty; maps[hero.floor][ty][tx] = M.EMPTY; render();
            }
        } else {
            hero.x = tx; hero.y = ty; render();
        }
    }
}

function handleItem(id) {
    switch(id) {
        case M.KEY_Y: hero.keys.y++; log("获得黄钥匙"); return true;
        case M.KEY_B: hero.keys.b++; log("获得蓝钥匙"); return true;
        case M.KEY_R: hero.keys.r++; log("获得红钥匙"); return true;
        case M.POTION_R: hero.hp += 200; log("生命 +200"); return true;
        case M.POTION_B: hero.hp += 500; log("生命 +500"); return true;
        case M.GEM_ATK: hero.atk += 3; log("攻击 +3"); return true;
        case M.GEM_DEF: hero.def += 3; log("防御 +3"); return true;
        case M.SWORD: hero.atk += 10; log("获得铁剑"); return true;
        case M.SHIELD: hero.def += 10; log("获得铁盾"); return true;
        case M.DOOR_Y: if(hero.keys.y>0){hero.keys.y--;return true;}else{log("需要黄钥匙");return false;}
        case M.DOOR_B: if(hero.keys.b>0){hero.keys.b--;return true;}else{log("需要蓝钥匙");return false;}
        case M.DOOR_R: if(hero.keys.r>0){hero.keys.r--;return true;}else{log("需要红钥匙");return false;}
        default: return true;
    }
}

function startBattle(tx, ty, mid) {
    return new Promise((resolve) => {
        const m = MONSTERS[mid];
        const heroDmg = Math.max(hero.atk - m.def, 0);
        if (heroDmg === 0) { log(`无法破防 ${m.name}`); resolve(); return; }

        isBattling = true;
        document.getElementById('battle-screen').classList.remove('hidden');
        document.getElementById('battle-monster-name').innerText = m.name;
        const mImg = document.getElementById('battle-monster-img');
        mImg.className = 'big-fighter monster-icon ' + m.cls;

        let curHeroHp = hero.hp, curMonHp = m.hp, maxMonHp = m.hp;
        updateBattleUI(curHeroHp, hero.hp, curMonHp, maxMonHp);
        
        const timer = setInterval(() => {
            const d1 = Math.max(hero.atk - m.def, 0);
            curMonHp -= d1;
            animateDmg('monster', d1);
            updateBattleUI(curHeroHp, hero.hp, curMonHp, maxMonHp);

            if (curMonHp <= 0) {
                clearInterval(timer);
                winBattle(tx, ty, mid, m);
                resolve();
                return;
            }

            setTimeout(() => {
                const d2 = Math.max(m.atk - hero.def, 0);
                curHeroHp -= d2;
                animateDmg('hero', d2);
                updateBattleUI(curHeroHp, hero.hp, curMonHp, maxMonHp);
                if(curHeroHp <= 0) {
                    clearInterval(timer);
                    alert("胜败乃兵家常事..."); location.reload();
                }
            }, 300);
        }, 800);
    });
}

function updateBattleUI(h, hMax, m, mMax) {
    document.getElementById('battle-hero-hp').innerText = Math.max(h, 0);
    document.getElementById('battle-monster-hp').innerText = Math.max(m, 0);
    document.getElementById('battle-hero-hp-bar').style.width = Math.max((h/hMax)*100, 0) + '%';
    document.getElementById('battle-monster-hp-bar').style.width = Math.max((m/mMax)*100, 0) + '%';
}

function animateDmg(target, val) {
    const el = document.getElementById(target + '-dmg-float');
    const img = document.getElementById('battle-' + target + '-img');
    el.innerText = '-' + val;
    el.classList.remove('pop-anim'); img.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('pop-anim'); img.classList.add('shake');
}

function winBattle(tx, ty, mid, m) {
    setTimeout(() => {
        isBattling = false;
        document.getElementById('battle-screen').classList.add('hidden');
        hero.hp = parseInt(document.getElementById('battle-hero-hp').innerText);
        hero.gold += m.gold; hero.exp += m.exp;
        maps[hero.floor][ty][tx] = M.EMPTY; hero.x = tx; hero.y = ty;
        log(`战胜 ${m.name}！`);
        if(mid === M.BOSS) alert("恭喜通关！");
        render();
    }, 800);
}

window.addEventListener('keydown', (e) => {
    if(document.getElementById('game-container').style.display === 'none') return;
    const k = e.key;
    if(k==='ArrowUp'||k==='w') move(0,-1);
    if(k==='ArrowDown'||k==='s') move(0,1);
    if(k==='ArrowLeft'||k==='a') move(-1,0);
    if(k==='ArrowRight'||k==='d') move(1,0);
});

document.getElementById('intro-screen').addEventListener('click', () => {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    initMaps(); render();
});