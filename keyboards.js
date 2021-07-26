const { Markup } = require('telegraf');

const mainKb = Markup.keyboard(
    [
        [
            '/status',
            'Настройки'
        ]
    ]
).resize();

const settingsKb = Markup.keyboard(
    [
        [
            'Язык',
            'Таймаут обновления /status'
        ],
        [
            'Уведомления'
        ],
        [
            'Назад'
        ]
    ]
).resize();

const langKb = Markup.keyboard(
    [
        [
            'Русский',
            'English'
        ],
        [
            'Назад'
        ]
    ]
).resize();

const notifKb = Markup.keyboard(
    [
        [
            'Удалить',
            'Добавить'
        ],
        [
            'Назад'
        ]
    ]
).resize();

const notifP1Kb = Markup.inlineKeyboard(
    [    
        [
            Markup.button.callback('Любой', 'P1Any')
        ],[
            Markup.button.callback('1', 'P1L1')
        ],[
            Markup.button.callback('2', 'P1L2')
        ],[
            Markup.button.callback('3', 'P1L3')
        ],[
            Markup.button.callback('Отмена', 'cancel')
        ]
    ]
);

const notifP2Kb = Markup.inlineKeyboard(
    [    
        [
            Markup.button.callback('V', 'P2V')
        ],[
            Markup.button.callback('A', 'P2A')
        ],[
            Markup.button.callback('W', 'P2W')
        ],[
            Markup.button.callback('Wh', 'P2Wh')
        ],[
            Markup.button.callback('Отмена', 'notifCancel')
        ]
    ]
);

const notifP3Kb = Markup.inlineKeyboard(
    [    
        [
            Markup.button.callback('Больше', 'P3More')
        ],[
            Markup.button.callback('Меньше', 'P3Less')
        ],[
            Markup.button.callback('Отмена', 'notifCancel')
        ]
    ]
);

const notifP4Kb = Markup.inlineKeyboard(    
    [
        Markup.button.callback('Отмена', 'notifAddCancel')
    ]
);

const notifDel = Markup.inlineKeyboard(    
    [
        Markup.button.callback('Отмена', 'notifDelCancel')
    ]
);

module.exports.notifDel = notifDel;
module.exports.notifP4Kb = notifP4Kb;
module.exports.notifP3Kb = notifP3Kb;
module.exports.notifP2Kb = notifP2Kb;
module.exports.notifP1Kb = notifP1Kb;
module.exports.notifKb = notifKb;
module.exports.mainKb = mainKb;
module.exports.settingsKb = settingsKb;
module.exports.langKb = langKb;