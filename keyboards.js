const { Markup } = require('telegraf')

var mainKb = Markup.keyboard(
    [
        [
            '/status'
        ],
        [
            'Bottom 1',
            'Bottom 2'
        ]
    ]
)//.resize()

module.exports.mainKb = mainKb