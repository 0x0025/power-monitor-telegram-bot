const { Markup } = require('telegraf')

var mainKb = Markup.keyboard(
    [
        [
            '/status',
            'Настройки'
        ]
    ]
).resize()

var settingsKb = Markup.keyboard(
    [
        [
            'Язык',
            'Таймаут обновления в реальном времени'
        ],
        [
            'Уведомления'
        ],
        [
            'Назад'
        ]
    ]
).resize()

var langKb = Markup.keyboard(
    [
        [
            'Русский',
            'English'
        ],
        [
            'Назад'
        ]
    ]
).resize()

var notificationsKb = Markup.keyboard(
    [
        [
            'Тут пока нефига нет'
        ],
        [
            'Назад'
        ]
    ]
).resize()

module.exports.notificationsKb = notificationsKb
module.exports.mainKb = mainKb
module.exports.settingsKb = settingsKb
module.exports.langKb = langKb