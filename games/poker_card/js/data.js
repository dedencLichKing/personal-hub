// 游戏数据源
const CARDS_DATA = [
    // --- 大小王 ---
    { id: 'joker_big', rank: 'Joker', value: 16, suit: 'joker', name: '蒋介石', title: '国民政府领袖', desc: '校长', color: '#d93025', avatar: '' },
    { id: 'joker_small', rank: 'Joker', value: 15, suit: 'joker', name: '李宗仁', title: '中华民国代总统', desc: '副总统', color: '#000000', avatar: '' },

    // --- 黑桃 (王牌核心派系) ---
    { id: 's_1', rank: 'A', value: 14, suit: 'spade', name: '陈诚', title: '副总统、参谋总长', desc: '土木系领袖', suitName: '王牌核心', avatar: '' },
    { id: 's_13', rank: 'K', value: 13, suit: 'spade', name: '顾祝同', title: '陆军总司令', desc: '国防部参谋总长', suitName: '王牌核心', avatar: '' },
    { id: 's_12', rank: 'Q', value: 12, suit: 'spade', name: '孙立人', title: '陆军总司令', desc: '东方隆美尔', suitName: '王牌核心', avatar: '' },
    { id: 's_11', rank: 'J', value: 11, suit: 'spade', name: '卫立煌', title: '东北剿总司令', desc: '五虎上将之一', suitName: '王牌核心', avatar: '' },
    { id: 's_10', rank: '10', value: 10, suit: 'spade', name: '薛岳', title: '广东省主席', desc: '天炉战法', suitName: '王牌核心', avatar: '' },
    { id: 's_9', rank: '9', value: 9, suit: 'spade', name: '钱大钧', title: '上海市市长', desc: '蒋介石侍从长', suitName: '王牌核心', avatar: '' },
    { id: 's_8', rank: '8', value: 8, suit: 'spade', name: '刘斐', title: '国防部参谋次长', desc: '为共军提供情报', suitName: '王牌核心', avatar: '' },
    { id: 's_7', rank: '7', value: 7, suit: 'spade', name: '宋希濂', title: '华中剿总副司令', desc: '鹰犬将军', suitName: '王牌核心', avatar: '' },
    { id: 's_6', rank: '6', value: 6, suit: 'spade', name: '李文', title: '北剿总副司令', desc: '华北作战', suitName: '王牌核心', avatar: '' },
    { id: 's_5', rank: '5', value: 5, suit: 'spade', name: '邱清泉', title: '第二兵团司令', desc: '邱疯子', suitName: '王牌核心', avatar: '' },
    { id: 's_4', rank: '4', value: 4, suit: 'spade', name: '邱行湘', title: '洛阳警备司令', desc: '青年军206师', suitName: '王牌核心', avatar: '' },
    { id: 's_3', rank: '3', value: 3, suit: 'spade', name: '张灵甫', title: '整编74师师长', desc: '御林军统领', suitName: '王牌核心', avatar: '' },
    { id: 's_2', rank: '2', value: 2, suit: 'spade', name: '阎锡山', title: '行政院长', desc: '山西王', suitName: '王牌核心', avatar: '' },

    // --- 红桃 (军政核心力量) ---
    { id: 'h_1', rank: 'A', value: 14, suit: 'heart', name: '何应钦', title: '国防部长', desc: '行政院长', suitName: '军政核心', avatar: '' },
    { id: 'h_13', rank: 'K', value: 13, suit: 'heart', name: '张治中', title: '西北军政长官', desc: '和平将军', suitName: '军政核心', avatar: '' },
    { id: 'h_12', rank: 'Q', value: 12, suit: 'heart', name: '周志柔', title: '空军总司令', desc: '代理参谋总长', suitName: '军政核心', avatar: '' },
    { id: 'h_11', rank: 'J', value: 11, suit: 'heart', name: '傅作义', title: '华北剿总司令', desc: '北平和平解放', suitName: '军政核心', avatar: '' },
    { id: 'h_10', rank: '10', value: 10, suit: 'heart', name: '杜聿明', title: '徐州剿总副司令', desc: '救火队长', suitName: '军政核心', avatar: '' },
    { id: 'h_9', rank: '9', value: 9, suit: 'heart', name: '蒋鼎文', title: '第一战区司令', desc: '飞将军', suitName: '军政核心', avatar: '' },
    { id: 'h_8', rank: '8', value: 8, suit: 'heart', name: '吴石', title: '国防部参谋次长', desc: '潜伏最深的红色特工', suitName: '军政核心', avatar: '' },
    { id: 'h_7', rank: '7', value: 7, suit: 'heart', name: '郑洞国', title: '东北剿总副司令', desc: '长春守将', suitName: '军政核心', avatar: '' },
    { id: 'h_6', rank: '6', value: 6, suit: 'heart', name: '陈继承', title: '北平警备司令', desc: '华北剿总第一副司令', suitName: '军政核心', avatar: '' },
    { id: 'h_5', rank: '5', value: 5, suit: 'heart', name: '黄百韬', title: '第七兵团司令', desc: '杂牌军死战悍将', suitName: '军政核心', avatar: '' },
    { id: 'h_4', rank: '4', value: 4, suit: 'heart', name: '阙汉谦', title: '第54军军长', desc: '抗战名将', suitName: '军政核心', avatar: '' },
    { id: 'h_3', rank: '3', value: 3, suit: 'heart', name: '郭景云', title: '第35军军长', desc: '傅作义王牌', suitName: '军政核心', avatar: '' },
    { id: 'h_2', rank: '2', value: 2, suit: 'heart', name: '张学良', title: '东北边防军司令', desc: '少帅', suitName: '军政核心', avatar: '' },

    // --- 梅花 (财经与后继力量) ---
    { id: 'c_1', rank: 'A', value: 14, suit: 'club', name: '宋子文', title: '财政部长', desc: '国舅爷', suitName: '财经后继', avatar: '' },
    { id: 'c_13', rank: 'K', value: 13, suit: 'club', name: '蒋经国', title: '台湾地区领导人', desc: '太子', suitName: '财经后继', avatar: '' },
    { id: 'c_12', rank: 'Q', value: 12, suit: 'club', name: '徐永昌', title: '军令部长', desc: '受降代表', suitName: '财经后继', avatar: '' },
    { id: 'c_11', rank: 'J', value: 11, suit: 'club', name: '刘峙', title: '徐州剿总司令', desc: '福将/长腿将军', suitName: '财经后继', avatar: '' },
    { id: 'c_10', rank: '10', value: 10, suit: 'club', name: '胡宗南', title: '西北剿总司令', desc: '西北王', suitName: '财经后继', avatar: '' },
    { id: 'c_9', rank: '9', value: 9, suit: 'club', name: '汤恩伯', title: '京沪杭警备司令', desc: '中原王', suitName: '财经后继', avatar: '' },
    { id: 'c_8', rank: '8', value: 8, suit: 'club', name: '刘永尧', title: '国防部参谋次长', desc: '黄埔一期', suitName: '财经后继', avatar: '' },
    { id: 'c_7', rank: '7', value: 7, suit: 'club', name: '范汉杰', title: '锦州指挥所主任', desc: '东北剿总副司令', suitName: '财经后继', avatar: '' },
    { id: 'c_6', rank: '6', value: 6, suit: 'club', name: '冯治安', title: '第三绥靖区司令', desc: '原西北军将领', suitName: '财经后继', avatar: '' },
    { id: 'c_5', rank: '5', value: 5, suit: 'club', name: '陈长捷', title: '天津警备司令', desc: '傅作义亲信', suitName: '财经后继', avatar: '' },
    { id: 'c_4', rank: '4', value: 4, suit: 'club', name: '杨伯涛', title: '第18军军长', desc: '美械王牌', suitName: '财经后继', avatar: '' },
    { id: 'c_3', rank: '3', value: 3, suit: 'club', name: '熊寿春', title: '第14军军长', desc: '黄埔三期', suitName: '财经后继', avatar: '' },
    { id: 'c_2', rank: '2', value: 2, suit: 'club', name: '冯玉祥', title: '军事委员会副委员长', desc: '倒戈将军', suitName: '财经后继', avatar: '' },

    // --- 方片 (财阀与战场统帅) ---
    { id: 'd_1', rank: 'A', value: 14, suit: 'diamond', name: '孔祥熙', title: '财政部长', desc: '财阀领袖', suitName: '财阀统帅', avatar: '' },
    { id: 'd_13', rank: 'K', value: 13, suit: 'diamond', name: '陈布雷', title: '总统府国策顾问', desc: '文胆 (注:文中为陈训恩)', suitName: '财阀统帅', avatar: '' },
    { id: 'd_12', rank: 'Q', value: 12, suit: 'diamond', name: '桂永清', title: '海军总司令', desc: '海军总司令', suitName: '财阀统帅', avatar: '' },
    { id: 'd_11', rank: 'J', value: 11, suit: 'diamond', name: '白崇禧', title: '华中剿总司令', desc: '小诸葛', suitName: '财阀统帅', avatar: '' },
    { id: 'd_10', rank: '10', value: 10, suit: 'diamond', name: '王耀武', title: '山东省主席', desc: '第二绥靖区司令', suitName: '财阀统帅', avatar: '' },
    { id: 'd_9', rank: '9', value: 9, suit: 'diamond', name: '胡琏', title: '金门防卫司令', desc: '狡如狐', suitName: '财阀统帅', avatar: '' },
    { id: 'd_8', rank: '8', value: 8, suit: 'diamond', name: '郭汝瑰', title: '国防部作战厅厅长', desc: '红色特工', suitName: '财阀统帅', avatar: '' },
    { id: 'd_7', rank: '7', value: 7, suit: 'diamond', name: '邓宝珊', title: '华北剿总副司令', desc: '晋陕甘宁边区', suitName: '财阀统帅', avatar: '' },
    { id: 'd_6', rank: '6', value: 6, suit: 'diamond', name: '廖耀湘', title: '第九兵团司令', desc: '国军王牌指挥', suitName: '财阀统帅', avatar: '' },
    { id: 'd_5', rank: '5', value: 5, suit: 'diamond', name: '黄维', title: '第十二兵团司令', desc: '书呆子', suitName: '财阀统帅', avatar: '' },
    { id: 'd_4', rank: '4', value: 4, suit: 'diamond', name: '郑挺锋', title: '第94军军长', desc: '华北守军', suitName: '财阀统帅', avatar: '' },
    { id: 'd_3', rank: '3', value: 3, suit: 'diamond', name: '刘镇湘', title: '第64军军长', desc: '粤军悍将', suitName: '财阀统帅', avatar: '' },
    { id: 'd_2', rank: '2', value: 2, suit: 'diamond', name: '唐生智', title: '军事参议院院长', desc: '南京保卫战', suitName: '财阀统帅', avatar: '' },
];

const SUIT_CONFIG = {
    'spade': { icon: '♠', color: 'black', label: '王牌核心' },
    'heart': { icon: '♥', color: '#d93025', label: '军政核心' },
    'club': { icon: '♣', color: 'black', label: '财经后继' },
    'diamond': { icon: '♦', color: '#d93025', label: '财阀统帅' },
    'joker': { icon: '★', color: 'purple', label: '最高领袖' }
};
