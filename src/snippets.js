{
    quizzes: [
        {
            id: 1,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz1.png'
        },
        {
            id: 2,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz2.png'
        },
        {
            id: 3,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz3.png'
        },
        {
            id: 4,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz4.png'
        },
        {
            id: 5,
            title: '女帝邀我入朝辅政, 但作为牡丹花爱好者来说, 个人更愿意找一个别院, 养花, 护花',
            options: [
                ['明世隐在长安要的并不是功名', '0'],
                ['没从政经验, 他没信心', '1']
            ],
            bgImg: './img/quiz1.png'
        },
    ]
}

{
    pass: {
        title: '恭喜你, 成功进入尧天',
        stamp: '通过',
        content: [
            {
                grade: 4,
                tag: '高人',
                comment: '你不涉世事却知天下事, 并有非凡洞察世事的能力, 是睿智精明的大才'
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
                comment: '你有足够知人识事的能力, 能够为主上提供有用且建设性的方案,是不可多得的谋臣'
            },
            {
                grade: 2,
                tag: '门客',
                comment: '你各项能力均衡, 待以时机, 在关键时刻能为主上解决重要难题'
            },
            {
                grade: 1,
                tag: '良友',
                comment: '你生性淳朴以诚待人, 不愿过分揣测人心, 是做真诚好友的最佳人选'
            }
        ]
    }
}




{
    audios: [
        {
            url: '',
            loop: false
        },
        {

        }
    ]
}

function createAudioNode (opt) {
    var audio = document.createElement('audio');
    audio.src = opt.url
    return audio;
}
