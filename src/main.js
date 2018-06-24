;(function ($) {

var html = document.querySelector('html');
var docW = document.documentElement.clientWidth;
var fontScale = docW / 375;
html.style.fontSize = 14 * fontScale + 'px';

/**
 *            -------
 *            |     |
 * -------------------------------
 * |    |     |     |     |      |
 * |    |     |     |     |      |
 * |    |     |     |     |      |
 * |    |     |     |     |      |
 * |    |     |     |     |      |
 * |    |     |     |     |      |
 * -------------------------------
 *            |     |
 *            -------
 */

/**
 * QuizCard - 答题卡片
 * @extend Card
 * @param {object} opts - 配置参数
 * opts: {
 *     - container: {HTMLElement} - 卡片容器节点
 *     - quizzes: {array} - 卡片内容数据
 *     - result: {object} - 结果页面内容数据
 *
 *     // events
 *     - onCompleted: {function} - 所有卡片选择完毕后的回调函数
 * }
 *
 * @tofix: 卡片上的事件代理
*/
function QuizCards (opts) {

    /** @template 页面模板
    <div class="m-quiz-cards g-pos-center">
        <div class="m-quiz-card z-active" data-index="1">
            <div class="quiz-card-title">女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花</div>
            <div class="quiz-card-content">
                <img class="" src="./img/test3.png" alt="" />
                <div class="quiz-options f-clearfix">
                    <div class="option option-a">明世隐在长安要的并不是功名</div>
                    <div class="option option-b">没从政经验, 他没信心</div>
                </div>
            </div>
        </div>
        <ul class="m-cards-indicator">
            <li class="indicator-item z-active"></li>
        </ul>
    </div>
    */

    // 扩展参数
    $.extend(this, opts);

    // 定义内部数据
    this._quizCount = this.quizzes.length; // 题目数量
    this._cardIndex = 0; // 当前卡片索引值
    this.bingoCount = 0;  // 正确选择数量

    // 缓存节点
    this.quizCards = this.layoutCards();
    this.cardsIndicator = this.layoutIndicator();
    this.cards = Array.prototype.slice.call(this.quizCards.querySelectorAll('.m-quiz-card'));
    this.indicators = Array.prototype.slice.call(this.cardsIndicator.querySelectorAll('.indicator-item'));
    this.audio = document.createElement('audio');

    // 初始化
    this.quizCards.appendChild(this.cardsIndicator);

}
$.extend(QuizCards.prototype, {
    init: function () {
        this.container.appendChild(this.quizCards);
        this.setCurrent(this._cardIndex);
        this._initTouch(); // 初始化触摸事件
    },
    // 将 html 字符串转换为节点
    _html2Node: function (str) {
        var container = document.createElement('div');
        container.innerHTML = str;
        return container.children[0];
    },
    // 生成卡片 DOM 结构
    layoutCards: function () {

        var cardsWrapper, i, data, template, cardNode;

        cardsWrapper = document.createElement('div');
        cardsWrapper.className = 'm-quiz-cards g-pos-center';

        for (i = 0; i < this._quizCount; i++) {

            data = this.quizzes[i];
            template = `
                <div class="m-quiz-card" data-index=${i}>
                    <div class="quiz-card-title">${data.title}</div>
                    <div class="quiz-card-content a-slide-in-right">
                        <img class="quiz-card" src=${data.bgImg} alt="" />
                        <div class="quiz-options f-clearfix">
                            <div class="option option-a" data-ref=${data.options[0][1]}>${data.options[0][0]}</div>
                            <div class="option option-b" data-ref=${data.options[1][1]}>${data.options[1][0]}</div>
                        </div>
                    </div>
                </div>
            `;

            cardNode = this._html2Node(template)
            cardsWrapper.appendChild(cardNode);
        }

        return cardsWrapper;
    },
    // 生成指示器 DOM 结构
    layoutIndicator: function () {

        var indicatorWrapper, i, indicatorItem;

        indicatorWrapper = document.createElement('ul');
        indicatorWrapper.className = 'm-cards-indicator';

        for (i = 0; i < this._quizCount; i++) {
            indicatorItem = document.createElement('li');
            indicatorItem.className = 'indicator-item';
            indicatorWrapper.appendChild(indicatorItem);
        }

        return indicatorWrapper;
    },
    // 生成答题结果页面
    layoutResult: function (bingoCount) {
        var template;

        if (bingoCount >= 4) {
            data = this.results.pass;
            data.content = data.content[0];
        } else {
            bingoCount = (bingoCount == 0) ? 1 : bingoCount;
            data = this.results.fail;
            data.content = data.content.filter(function (item) {
                return item.grade == bingoCount;
            })[0];
        }

        template = `
            <div class="m-quiz-result g-pos-center">
                <div class="result-title">
                    ${data.title}
                </div>
                <div class="result-content">
                    <div class="tag">
                        根据你的测试情况，你获得
                    <div class="tag-name">${data.content.tag}</div>
                </div>
                <div class="stamp">${data.stamp}</div>
                </div>
                <div class="result-comment">
                    <div class="avatar"></div>
                    <div class="comment-content">
                        ${data.content.comment}
                    </div>
                </div>
                <div class="result-options">
                    <div class="option  option-share">告知好友一起进入尧天</div>
                    <div class="option option-again">再测一次</div>
                </div>
            </div>
        `;

        return this._html2Node(template);

    },
    // 切换到下一张卡片
    next: function () {
        var index, quizResultContainer, pageResult;

        this._cardIndex += 1;
        index = this._cardIndex;

        // 如果当前已经是最后一张卡片
        if (index >= this._quizCount) {
            // 构建结果页
            pageResult = this.layoutResult(this.bingoCount)
            quizResultContainer = document.querySelector('.m-page-result');
            quizResultContainer.appendChild(pageResult);

            this.audio.pause();
            this.hide();
            if (this.onCompleted && (this.onCompleted instanceof Function)) {
                this.onCompleted(this.bingoCount);
            }
            return false;
        }

        this.audio.pause();
        this.setCurrent(index);
        return true;
    },
    hide: function () {
        this.container.classList.add('f-dn');
    },

    // 卡片切换后的事件
    _onSwitch: function () {
        pages.next();
    },
    setCurrent: function (index) {
        var targetCard, targetTitle, targetIndicator,
            targetOptions, previousCard;

        this.audio.src = this.quizzes[index].audio;
        this.audio.play();

        targetCard = this.quizCards.querySelectorAll('.m-quiz-card')[index];
        targetTitle = targetCard.querySelector('.quiz-card-title');
        targetOptions = targetCard.querySelector('.quiz-options');
        previousCard = index > 0 ? this.quizCards.querySelectorAll('.m-quiz-card')[index - 1] : null;
        targetIndicator = this.cardsIndicator.querySelectorAll('.indicator-item')[index];

        // 清除元素已有的 z-active 样式
        this.cards.forEach(function (node) {
            node.classList.remove('z-active');
        });
        this.indicators.forEach(function (node) {
            node.classList.remove('z-active');
        });

        targetCard.classList.add('z-active');
        targetCard.querySelector('.quiz-card').classList.add('a-slide-in-right');
        targetTitle.classList.add('a-fade-in');
        targetOptions.classList.add('a-fade-in');
        targetIndicator.classList.add('z-active');
        if (previousCard) previousCard.classList.add('f-dn');

    },

    // 移动端 touch 事件
    _initTouch: function () {
        this._eventInfo = {};
        this.quizCards.addEventListener('touchstart', this._touchStart.bind(this));
        this.quizCards.addEventListener('touchmove', this._touchMove.bind(this));
        this.quizCards.addEventListener('touchend', this._touchEnd.bind(this));
    },
    _touchStart: function (e) {
        var eventInfo, target;

        target = e.target;

        // 触摸的是答案选项
        if (target.classList.contains('option')) {
            // 计算正确答题数量
            this.checkAnswer(target);
            this.next();
            return false;
        }

        eventInfo = this._eventInfo;
        eventInfo.type = 'card';
        eventInfo.startX = e.touches[0].clientX;

    },
    checkAnswer: function (node) {
        if (!!parseInt(node.dataset.ref)) this.bingoCount ++;
        return false;
    },
    _touchMove: function (e) {

        var eventInfo, target, cardTitle, cardContent, translateVal, answerNodeA, answerNodeA;

        target = e.target;

        eventInfo = this._eventInfo;
        if (eventInfo.type !== 'card') return false;

        eventInfo.offsetX = (e.touches[0].clientX - eventInfo.startX)

        // 缓存节点
        cardTitle = this.quizCards.querySelectorAll('.quiz-card-title')[this._cardIndex];
        cardContent = this.quizCards.querySelectorAll('.quiz-card-content')[this._cardIndex];
        answerNodeA = cardContent.querySelector('.option-a');
        answerNodeB = cardContent.querySelector('.option-b');

        cardTitle.style.opacity = 0;
        translateVal = 'translateX(' + eventInfo.offsetX + 'px)';
        cardContent.style.transform = translateVal;

        // 向哪边滑动只保留显示哪边答案
        if (eventInfo.offsetX < 0) {
            answerNodeA.classList.remove('f-dn');
            answerNodeB.classList.add('f-dn');
        } else {
            answerNodeB.classList.remove('f-dn');
            answerNodeA.classList.add('f-dn');
        }

    },
    _touchEnd: function (e)  {
        var eventInfo, cardItem, cardTitle, docWidth,
            cardContent, translateVal,
            answerNodeA, answerNodeA,
            directionWidth, optionSelected;

        eventInfo = this._eventInfo;
        if (eventInfo.type !== 'card') return false;

        // 缓存节点
        cardItem = this.quizCards.querySelector('.m-quiz-card');
        cardTitle = this.quizCards.querySelectorAll('.quiz-card-title')[this._cardIndex];
        cardContent = this.quizCards.querySelectorAll('.quiz-card-content')[this._cardIndex];
        answerNodeA = cardContent.querySelector('.option-a');
        answerNodeB = cardContent.querySelector('.option-b');

        if (!eventInfo.offsetX) return false;

        if (Math.abs(eventInfo.offsetX) < 100) {
            cardContent.style.transform = 'translateX(0)';
            cardTitle.style.opacity = 1

            answerNodeA.classList.remove('f-dn');
            answerNodeB.classList.remove('f-dn');

            return false
        }

        // 卡片飞出
        docWidth = document.documentElement.clientWidth;
        cardContent.style.transform = 'translateX(' + directionWidth + 'px)';
        cardItem.style.opacity = 0;

        optionSelected = eventInfo.offsetX < 0 ? answerNodeA : answerNodeB;
        this.checkAnswer(optionSelected);

        this.next();

    },
});

/**
 * Pages - 管理页面, 方便快速切换
*/
function Pages () {

    // 缓存节点
    this.container = document.querySelector('.g-pages-wrapper');
    this.pages = this.container.querySelectorAll('.g-page');
    this.pagesList = Array.prototype.slice.call(this.pages);

    // 内部数据
    this.pageIndex = 0;
    this.pageCount = this.pages.length;

    this.setCurrent(this.pageIndex);

}
$.extend(Pages.prototype, {
    next: function () {
        var index;
        this.pageIndex += 1;
        index = this.pageIndex;

        this.setCurrent(index);

    },
    setCurrent: function (index) {
        if (index >= this.pageCount) return false;
        this.pagesList.forEach(function (item) {
            item.classList.add('f-dn');
        });
        this.pages[index].classList.remove('f-dn');
    }
});

var pages = new Pages();

/** 资源预加载和 loading 效果 */
var imgArr = [
    './img/loading.png',
    './img/bg.jpg',
    './img/card_bg.png',
    './img/card_first.png',
    './img/card_end.png',
    './img/quiz1.png',
    './img/quiz2.png',
    './img/quiz3.png',
    './img/quiz4.png'
];
var audioArr = [
    './audio/bg.mp3',
    './audio/quiz1.mp3',
    './audio/quiz2.mp3',
    './audio/quiz3.mp3',
    './audio/quiz4.mp3',
    './audio/quiz5.mp3'
];
var preloadImgs = function(imgArr) {
    var maxCnt = imgArr.length;
    for (var i = 0; i < imgArr.length; i++) {
        var img = new Image;
        img.src = imgArr[i];
        img.onload = function() {
            maxCnt--;
            var progress = parseInt(((imgArr.length - maxCnt) / imgArr.length) * 100);
            progressHandler(progress);
        }
    }
}
var progressHandler = function (progress) {
    if (progress < 100) {
        var rate = progress + '%';
        document.querySelector('.j_rate').innerText = rate;
    } else {
        pages.next();
    }
};

// 开始资源预加载, 加载完毕进入答题页面
preloadImgs(imgArr);

// touch 事件定义
var eventInfo = {};
var touchStart = function (e) {
    eventInfo.startX = e.touches[0].clientX;
};
var touchMove = function (e) {

    var target = e.target;

    eventInfo.offsetX = (e.touches[0].clientX - eventInfo.startX)
    translateVal = 'translateX(' + eventInfo.offsetX + 'px)';
    target.style.transform = translateVal;

};
var touchEnd = function (e) {
    var target = e.target;

    if (Math.abs(eventInfo.offsetX) < 100) {
        target.style.transform = 'translateX(0)';

        return false
    }

    // 卡片飞出
    docWidth = document.documentElement.clientWidth;
    directionWidth = eventInfo.offsetX > 0 ? ('-' + docWidth) : docWidth;
    target.style.transform = 'translateX(' + directionWidth + 'px)';
    target.opacity = 0;

    pages.next();
};

// page-cover 事件处理, 滑动或点击进入下一页
var pageCover = $('.j_pageCover');
pageCover.on('touchstart', touchStart);
pageCover.on('touchmove', touchMove);
pageCover.on('touchend', touchEnd);

// 构建答题页面内容和处理答题页面逻辑
var quizCardsContainer = document.querySelector('.m-page-quiz');
var onCompleted = function (param) {
    pages.next();
}
var opts = {
    container: quizCardsContainer,
    onCompleted: onCompleted,
    quizzes: [
        {
            id: 1,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz1.png',
            audio: './audio/quiz1.mp3'
        },
        {
            id: 2,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz2.png',
            audio: './audio/quiz2.mp3'
        },
        {
            id: 3,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz3.png',
            audio: './audio/quiz3.mp3'
        },
        {
            id: 4,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz4.png',
            audio: './audio/quiz4.mp3'
        },
        {
            id: 5,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz1.png',
            audio: './audio/quiz5.mp3'
        },
    ],
    results: {
        pass: {
            title: '恭喜你, 成功进入尧天',
            stamp: '通过',
            content: [
            {
                grade: 4,
                tag: '高人',
                comment: '明世隐评语: 你不涉世事却知天下事, 并有非凡洞察世事的能力, 是睿智精明的大才'
            }
            ]
        },
        fail: {
            title: '遗憾, 你未能进入尧天',
            stamp: '遗憾',
            content: [
            {
                grade: 3,
                tag: '谋臣',
                comment: '明世隐评语: 你有足够知人识事的能力, 能够为主上提供有用且建设性的方案,是不可多得的谋臣'
            },
            {
                grade: 2,
                tag: '门客',
                comment: '明世隐评语: 你各项能力均衡, 待以时机, 在关键时刻能为主上解决重要难题'
            },
            {
                grade: 1,
                tag: '良友',
                comment: '明世隐评语: 你生性淳朴以诚待人, 不愿过分揣测人心, 是做真诚好友的最佳人选'
            }
            ]
        }
    }
};
var cards = new QuizCards(opts);
cards.init();

var audio = document.createElement('audio');
audio.src = './audio/bg.mp3';
audio.loop = 'true';
document.addEventListener('touchstart', function () {
    audio.play();
}, false);


})($);
