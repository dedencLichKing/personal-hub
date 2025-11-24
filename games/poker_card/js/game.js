// 游戏逻辑控制器

// DOM 元素引用
const galleryContainer = document.getElementById('gallery-container');
const viewLadderBtn = document.getElementById('view-ladder');
const viewFactionBtn = document.getElementById('view-faction');
const modeBattleBtn = document.getElementById('mode-battle');
const battleArena = document.getElementById('battle-arena');
const playerSlot = document.getElementById('player-card');
const enemySlot = document.getElementById('enemy-card');
const battleResult = document.getElementById('battle-result');
const drawBtn = document.getElementById('btn-draw');
const closeBattleBtn = document.getElementById('btn-close-battle');
// 新增一键全翻按钮引用 (稍后在 HTML 中添加 id)
let flipAllBtn = document.getElementById('btn-flip-all');

// 模态框引用
const modal = document.getElementById('card-modal');
const closeModal = document.querySelector('.close-modal');
const modalCardDisplay = document.getElementById('modal-card-display');
const modalName = document.getElementById('modal-name');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalRank = document.getElementById('modal-rank');
const modalSuit = document.getElementById('modal-suit');

// 当前状态
let currentView = 'ladder'; // 'ladder', 'faction'
let isAllFlipped = false; // 全翻转状态

// 定义天梯等级顺序 (根据需求: Joker -> 2 -> A -> K -> ... -> 3)
const LADDER_RANKS = ['Joker', '2', 'A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'];

// --- 初始化 ---
function init() {
    // 如果 HTML 还没加按钮，先尝试获取
    if (!flipAllBtn) {
        flipAllBtn = document.getElementById('btn-flip-all');
    }
    renderGallery();
    setupEventListeners();
}

// --- 事件监听 ---
function setupEventListeners() {
    viewLadderBtn.addEventListener('click', () => switchView('ladder'));
    viewFactionBtn.addEventListener('click', () => switchView('faction'));
    modeBattleBtn.addEventListener('click', startBattleMode);
    
    if (flipAllBtn) {
        flipAllBtn.addEventListener('click', toggleFlipAll);
    }
    
    drawBtn.addEventListener('click', playBattleRound);
    closeBattleBtn.addEventListener('click', endBattleMode);
    
    closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

// --- 视图切换 ---
function switchView(view) {
    currentView = view;
    isAllFlipped = false; // 切换视图时重置翻转状态
    if(flipAllBtn) flipAllBtn.innerText = "一键全翻";
    
    // 按钮状态更新
    viewLadderBtn.classList.toggle('active', view === 'ladder');
    viewFactionBtn.classList.toggle('active', view === 'faction');
    modeBattleBtn.classList.remove('active');

    // 隐藏对决区域
    battleArena.classList.add('hidden');
    galleryContainer.classList.remove('hidden');
    // 显示控制栏辅助按钮
    if (flipAllBtn) flipAllBtn.classList.remove('hidden');

    renderGallery();
}

// --- 核心渲染逻辑 ---
function createCardElement(cardData, isRevealed = false) {
    const container = document.createElement('div');
    container.className = 'card-container';
    if (isRevealed) {
        container.classList.add('flipped');
    }

    // 防止点击事件冒泡导致触发行的翻转
    container.addEventListener('click', (e) => {
        e.stopPropagation();
        // 翻转当前卡片
        container.classList.toggle('flipped');
    });

    // 内部结构
    const cardInner = document.createElement('div');
    cardInner.className = 'poker-card';
    cardInner.style.color = cardData.color || SUIT_CONFIG[cardData.suit].color;
    
    // 背面 (保持不变)
    const backFace = document.createElement('div');
    backFace.className = 'card-face back';
    backFace.innerHTML = `
        <div class="sun-symbol">
            <div class="sun-ray"></div>
        </div>
    `;

    // 正面 (新版设计)
    const suitIcon = SUIT_CONFIG[cardData.suit].icon;
    const frontFace = document.createElement('div');
    frontFace.className = 'card-face front';
    
    // 中间主面板内容：判断是否有 avatar
    let portraitContent = '';
    if (cardData.avatar && cardData.avatar.trim() !== '') {
        // 如果有图片路径，显示图片
        portraitContent = `<img src="${cardData.avatar}" class="card-portrait-img" alt="${cardData.name}">`;
    } else {
        // 如果没有图片路径，显示默认占位
        portraitContent = `<div class="portrait-bg">☀</div>`;
    }

    // 构建 HTML 结构
    frontFace.innerHTML = `
        <!-- 左上角点数 -->
        <div class="corner-rank top-left">
            <span class="rank-text">${cardData.rank}</span>
            <span class="suit-icon">${suitIcon}</span>
        </div>

        <!-- 中间主面板 -->
        <div class="main-panel">
            <!-- 背景纹理或人物照片 -->
            ${portraitContent}

            <!-- 右上角勋章 -->
            <div class="medal-badge">
                <span class="medal-star">★</span>
                <span class="medal-star">★</span>
            </div>

            <!-- 竖排名字 -->
            <div class="panel-name">${cardData.name}</div>

            <!-- 底部信息栏 -->
            <div class="info-bar">
                <div class="info-desc">${cardData.desc || ''}</div>
                <div class="info-divider"></div>
                <div class="info-title">${cardData.title || ''}</div>
            </div>
        </div>

        <!-- 右下角点数 -->
        <div class="corner-rank bottom-right">
            <span class="rank-text">${cardData.rank}</span>
            <span class="suit-icon">${suitIcon}</span>
        </div>
    `;
    
    // 点击正面查看详情
    frontFace.addEventListener('click', (e) => {
        if (container.classList.contains('flipped')) {
            e.stopPropagation(); // 阻止 container 的 toggle
            showCardDetail(cardData);
        }
    });

    cardInner.appendChild(backFace);
    cardInner.appendChild(frontFace);
    container.appendChild(cardInner);

    return container;
}

function renderGallery() {
    galleryContainer.innerHTML = '';
    
    if (currentView === 'ladder') {
        renderLadderView();
    } else {
        renderFactionView();
    }
}

function renderLadderView() {
    // 按 Rank 分组
    LADDER_RANKS.forEach(rank => {
        // 找到该 Rank 的所有卡牌
        let cards = CARDS_DATA.filter(c => c.rank === rank);
        
        // 特殊处理：如果 Rank 是 '2' 或 'A' 等有多个花色的，按花色排序 (黑桃>红桃>梅花>方片)
        const suitOrder = ['spade', 'heart', 'club', 'diamond'];
        cards.sort((a, b) => {
             // Joker 特殊处理
             if (a.suit === 'joker') return b.value - a.value; // 大王在前
             return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
        });

        if (cards.length > 0) {
            createRow(rank, cards);
        }
    });
}

function renderFactionView() {
    // 按派系分组
    const suits = ['spade', 'heart', 'club', 'diamond', 'joker'];
    const suitLabels = {
        'spade': '王牌核心',
        'heart': '军政核心',
        'club': '财经后继',
        'diamond': '财阀统帅',
        'joker': '最高领袖'
    };

    suits.forEach(suit => {
        let cards = CARDS_DATA.filter(c => c.suit === suit);
        // 派系内按大小排序
        cards.sort((a, b) => b.value - a.value);

        if (cards.length > 0) {
            createRow(suitLabels[suit], cards);
        }
    });
}

function createRow(label, cards) {
    const row = document.createElement('div');
    row.className = 'ladder-row';
    
    // 行标签
    const labelEl = document.createElement('div');
    labelEl.className = 'row-label';
    labelEl.innerText = label;
    row.appendChild(labelEl);

    // 卡牌容器
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'row-cards';
    
    const cardElements = [];
    cards.forEach(cardData => {
        const cardEl = createCardElement(cardData, isAllFlipped); // 根据当前全翻状态决定是否翻开
        cardsContainer.appendChild(cardEl);
        cardElements.push(cardEl);
    });
    row.appendChild(cardsContainer);

    // 点击行空白处翻转整行
    row.addEventListener('click', (e) => {
        // 检查点击是否发生在卡牌上（通过事件冒泡，如果在卡牌上已经被阻止了，但为了保险）
        if (e.target.closest('.card-container')) return;

        // 检查这一行是否大部分是翻开的
        const flippedCount = cardElements.filter(el => el.classList.contains('flipped')).length;
        const shouldFlipOpen = flippedCount < cardElements.length / 2; // 如果翻开少于一半，则全翻开；否则全合上

        cardElements.forEach((el, index) => {
            setTimeout(() => {
                if (shouldFlipOpen) {
                    el.classList.add('flipped');
                } else {
                    el.classList.remove('flipped');
                }
            }, index * 50); // 加一点流水灯延迟效果
        });
    });

    galleryContainer.appendChild(row);
}

// --- 一键全翻 ---
function toggleFlipAll() {
    isAllFlipped = !isAllFlipped;
    flipAllBtn.innerText = isAllFlipped ? "一键重置" : "一键全翻";

    const allCards = document.querySelectorAll('.card-container');
    allCards.forEach((el, index) => {
        setTimeout(() => {
            if (isAllFlipped) {
                el.classList.add('flipped');
            } else {
                el.classList.remove('flipped');
            }
        }, index * 10); // 快速流水灯
    });
}

// --- 对决模式逻辑 ---
function startBattleMode() {
    battleArena.classList.remove('hidden');
    galleryContainer.classList.add('hidden'); // 专注模式
    
    modeBattleBtn.classList.add('active');
    viewLadderBtn.classList.remove('active');
    viewFactionBtn.classList.remove('active');
    
    // 隐藏全翻按钮
    if (flipAllBtn) flipAllBtn.classList.add('hidden');

    resetBattleStage();
}

function endBattleMode() {
    switchView('ladder');
}

function resetBattleStage() {
    playerSlot.innerHTML = '<div class="card-placeholder">准备</div>';
    enemySlot.innerHTML = '<div class="card-placeholder">准备</div>';
    battleResult.innerText = '';
    battleResult.className = 'battle-result'; 
}

function playBattleRound() {
    const idx1 = Math.floor(Math.random() * CARDS_DATA.length);
    let idx2 = Math.floor(Math.random() * CARDS_DATA.length);
    while (idx1 === idx2) idx2 = Math.floor(Math.random() * CARDS_DATA.length);

    const playerCard = CARDS_DATA[idx1];
    const enemyCard = CARDS_DATA[idx2];

    playerSlot.innerHTML = '';
    enemySlot.innerHTML = '';

    // 创建翻转的卡牌
    const pCardEl = createCardElement(playerCard, false);
    const eCardEl = createCardElement(enemyCard, false);
    
    playerSlot.appendChild(pCardEl);
    enemySlot.appendChild(eCardEl);

    // 延迟翻开
    setTimeout(() => {
        pCardEl.classList.add('flipped');
        eCardEl.classList.add('flipped');
        
        // 判定结果
        setTimeout(() => {
            let resultText = '';
            if (playerCard.value > enemyCard.value) {
                resultText = `胜利！${playerCard.name} 压制了 ${enemyCard.name}`;
                battleResult.style.color = '#2ecc71';
            } else if (playerCard.value < enemyCard.value) {
                resultText = `失败！${playerCard.name} 不敌 ${enemyCard.name}`;
                battleResult.style.color = '#e74c3c';
            } else {
                resultText = '平局！旗鼓相当';
                battleResult.style.color = '#f1c40f';
            }
            battleResult.innerText = resultText;
        }, 600); // 等翻转动画结束

    }, 100);
}

// --- 详情弹窗 ---
function showCardDetail(card) {
    modalCardDisplay.innerHTML = '';
    // 克隆一个大卡牌用于展示 (直接展示正面)
    const largeCardContainer = createCardElement(card, true); // 默认为翻开
    largeCardContainer.style.width = '280px'; // 放大一点
    largeCardContainer.style.height = '400px';
    largeCardContainer.style.pointerEvents = 'none'; 
    modalCardDisplay.appendChild(largeCardContainer);

    modalName.innerText = card.name;
    modalTitle.innerText = `${card.title}`;
    modalDesc.innerText = card.desc ? `"${card.desc}"` : '';
    
    modalRank.innerText = `点数: ${card.rank}`;
    modalSuit.innerText = `派系: ${card.suitName || card.suit}`;
    
    modal.classList.remove('hidden');
}

// 启动 (等待 DOM 加载)
document.addEventListener('DOMContentLoaded', init);
