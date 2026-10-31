// 2026-11-01：依据视频原站公开索引核对标题与分集；不下载或转载视频。
const collection='https://www.bilibili.com/video/BV1D1421m754/';
export const videos=[
 {id:'powers',title:'指数与运算性质',source:'一数 · B站',unit:'exponent',duration:'16 分钟',level:'基础',url:'https://www.bilibili.com/video/BV1Bp4y1t7S3/',goal:'负指数、分数指数与指数运算法则。',question:'为什么 2⁻³ 等于 1/8，而不是 −8？'},
 {id:'exponential',title:'指数函数：概念与性质',source:'一数 · B站',unit:'exponent',duration:'21 分钟',level:'基础',url:'https://www.bilibili.com/video/BV1LU4y1h7z5/',goal:'先理解底数，再观察递增与递减。',question:'底数从 2 改为 1/2，图像发生了什么变化？'},
 {id:'log-definition',title:'对数的定义',source:'高中数学公益课合集 · P39',unit:'meaning',duration:'16 分钟',level:'基础',url:collection+'?p=39',goal:'把对数问题翻译为指数关系。',question:'请把 log₃(1/9) = −2 翻译成指数式。'},
 {id:'fractional',title:'分数指数幂习题',source:'高中数学公益课合集 · P36',unit:'exponent',duration:'9 分钟',level:'基础练习',url:collection+'?p=36',goal:'开方、乘方与负指数的运算顺序。',question:'怎样分两步计算 16⁻³⁄⁴？'},
 {id:'log-graph',title:'对数函数的图像与性质',source:'高中数学公益课合集 · P41',unit:'function',duration:'18 分钟',level:'基础',url:collection+'?p=41',goal:'定义域、定点、单调性与底数的关系。',question:'为什么不论底数如何变化，图像都经过 (1,0)？'},
 {id:'log-calculation',title:'指数与对数的运算解析',source:'高中数学公益课合集 · P44',unit:'rules',duration:'23 分钟',level:'进阶',url:collection+'?p=44',goal:'基础规则熟练后，再看综合运算。',question:'对数法则使用前，需要检查哪些条件？'},
 {id:'sets',title:'集合的基本定义与表示方法',source:'高中数学公益课合集 · P8',unit:'reading',duration:'18 分钟',level:'基础',url:collection+'?p=8',goal:'分清元素、集合与描述集合的条件。',question:'{1} 和 {{1}} 的元素分别是什么？'},
 {id:'quantifiers',title:'全称量词和存在量词',source:'高中数学公益课合集 · P20',unit:'reading',duration:'12 分钟',level:'基础',url:collection+'?p=20',goal:'区分“任意一个”与“至少存在一个”。',question:'证明“所有正数都大于 1”不成立，需要多少个反例？'},
 {id:'negation',title:'命题的否定',source:'高中数学公益课合集 · P21',unit:'reading',duration:'10 分钟',level:'基础',url:collection+'?p=21',goal:'把量词与逻辑关系准确翻译出来。',question:'“a ≠ 2 或 b ≠ 5”的否定是什么？'},
 {id:'monotonicity',title:'单调性与最值的基本概念',source:'高中数学公益课合集 · P27',unit:'function',duration:'15 分钟',level:'基础',url:collection+'?p=27',goal:'从函数定义理解大小关系，不只记图像。',question:'递减函数为什么会让比较方向反转？'},
 {id:'full-course',title:'高一数学必修一同步课程',source:'刘新宇老师 · B站',unit:'conditions',duration:'分集课程',level:'按需查找',url:'https://www.bilibili.com/video/BV1fQ4y1N7yU/',goal:'补查集合、逻辑、函数、指数与对数；在选集中定位知识点。',question:'选一个仍不理解的概念，写出定义和适用条件。'}
];
export const videoTopics=[['all','全部课程'],['exponent','指数基础'],['meaning','对数定义'],['rules','对数运算'],['conditions','条件与定义域'],['function','函数图像'],['reading','读题逻辑']];
