const { Markup } = require('telegraf');
var loc = require('./localization.js');

function mainKb(lang) {
    return Markup.keyboard(
        [
            [
                '/status',
                '/stats'
            ],
            [
                loc.translate(lang, 'settings')
            ]
        ]
    ).resize();
}

function settingsKb(lang) { 
    return Markup.keyboard(
        [
            [
                loc.translate(lang, 'lang'),
                loc.translate(lang, 'statusUpdTm')
            ],
            [
                loc.translate(lang, 'notifications'),
                loc.translate(lang, 'notifCD')
            ],
            [
                loc.translate(lang, 'back')
            ]
        ]
    ).resize();
}

function langKb(lang) {
    return Markup.keyboard(
        [
            [
                'Русский',
                'English'
            ],
            [
                loc.translate(lang,'back')
            ]
        ]
    ).resize();
}

function notifKb(lang){ 
    return Markup.keyboard(
        [
            [
                loc.translate(lang, 'add'),
                loc.translate(lang, 'list'),
                loc.translate(lang, 'del'),                
            ],
            [
                loc.translate(lang, 'back')
            ]
        ]
    ).resize();
}

function notifP1Kb(lang) { 
    return Markup.inlineKeyboard(
        [    
            [
                Markup.button.callback(loc.translate(lang, 'any'), 'P1Any')
            ],[
                Markup.button.callback('1', 'P1L1')
            ],[
                Markup.button.callback('2', 'P1L2')
            ],[
                Markup.button.callback('3', 'P1L3')
            ],[
                Markup.button.callback(loc.translate(lang, 'cancel'), 'notifAddCancel')
            ]
        ]
    ).resize();
}

function notifP2Kb(lang) { 
    return Markup.inlineKeyboard(
        [    
            [
                Markup.button.callback(loc.VAWHtranslate(lang, 0) + ' (V)', 'P2V')
            ],[
                Markup.button.callback(loc.VAWHtranslate(lang, 1) + ' (A)', 'P2A')
            ],[
                Markup.button.callback(loc.VAWHtranslate(lang, 2) + ' (W)', 'P2W')
            ],[
                Markup.button.callback(loc.VAWHtranslate(lang, 3) + ' (kWh)', 'P2kWh')
            ],[
                Markup.button.callback(loc.translate(lang, 'cancel'), 'notifAddCancel')
            ]
        ]
    ).resize();
}

function notifP3Kb(lang) { 
    return Markup.inlineKeyboard(
        [    
            [
                Markup.button.callback(loc.translate(lang, 'more'), 'P3More')
            ],[
                Markup.button.callback(loc.translate(lang, 'less'), 'P3Less')
            ],[
                Markup.button.callback(loc.translate(lang, 'cancel'), 'notifAddCancel')
            ]
        ]
    ).resize();
}

function notifP4Kb(lang) {
    return Markup.inlineKeyboard(    
        [
            Markup.button.callback(loc.translate(lang, 'cancel'), 'notifAddCancel')
        ]
    ).resize();
}

function notifDel(lang) { 
    return Markup.inlineKeyboard(    
        [
            Markup.button.callback(loc.translate(lang, 'cancel'), 'notifDelCancel')
        ]
    ).resize();
}

function statsPeriod(lang){
    return Markup.inlineKeyboard(
        [
            [
                Markup.button.callback(loc.translate(lang, 'today'), 'periodToday'),
            ],[
                Markup.button.callback(loc.translate(lang, 'yesterday'), 'periodYesterday'),
            ],[
                Markup.button.callback(loc.translate(lang, 'week'), 'periodWeek'),
            ],[
                Markup.button.callback(loc.translate(lang, 'month'), 'periodMonth'),
            ],[
                Markup.button.callback(loc.translate(lang, 'cancel'), 'statsCancel')
            ]
        ]
    ).resize();
}

module.exports.statsPeriod = statsPeriod;
module.exports.notifDel = notifDel;
module.exports.notifP4Kb = notifP4Kb;
module.exports.notifP3Kb = notifP3Kb;
module.exports.notifP2Kb = notifP2Kb;
module.exports.notifP1Kb = notifP1Kb;
module.exports.notifKb = notifKb;
module.exports.mainKb = mainKb;
module.exports.settingsKb = settingsKb;
module.exports.langKb = langKb;