const { Telegraf, Markup } = require('telegraf');
const SerialPort = require('serialport');
const { StringStream } = require('scramjet'); 
const fs = require('fs');
//const ping = require("net-ping");

//var pngsession = ping.createSession ();
var config = require('./config.json');
var kb = require('./keyboards.js');
var loc = require('./localization.js');

var v1, v2, v3;
var a1, a2, a3;
var w1, w2, w3;
var kwh1, kwh2, kwh3;

var userData = {};
var stats = {};

function readUserData(){
    fs.readFile('./userData.json',{encoding: 'utf8'},function(err,data) {
        if (err){
            userData = {};
            console.warn("NO USERDATA SAVED");
        }
        else{
            userData = JSON.parse(data);
            log2('readUserData()');
        }
    });
}

function writeUserData(){
    fs.writeFile('./userData.json', JSON.stringify(userData, null, '\t'), function (err) {
        if (err)
            return console.error(err);
        log2('writeUserData()');
    });
}

function tr(ctx, str){ 
    return loc.translate(userData[ctx.from.id].lang, str);
}

function log2(str){
    if (config.debug == 1){
        console.log(str);
    }
}

//setInterval(writeUserData, 30000);
readUserData();

var portOpenRetry;
var serialPort = new SerialPort(config.serialPort, { 
    baudRate: config.baudRate,
    parser: new SerialPort.parsers.Readline("\n"),
    autoOpen: true
});

function update(data) {
    log2('data: ' + data);

    var dataArr = data.split(';');

    v1 = parseFloat(dataArr[0]);
    v2 = parseFloat(dataArr[1]);
    v3 = parseFloat(dataArr[2]);

    a1 = parseFloat(dataArr[3]);
    a2 = parseFloat(dataArr[4]);
    a3 = parseFloat(dataArr[5]);

    w1 = parseFloat(dataArr[6]);    
    w2 = parseFloat(dataArr[7]);
    w3 = parseFloat(dataArr[8]);

    kwh1 = parseFloat(dataArr[9]);
    kwh2 = parseFloat(dataArr[10]);
    kwh3 = parseFloat(dataArr[11]);

    var tempArr = [ [[v1,v2,v3],[a1,a2,a3],[w1,w2,w3],[kwh1,kwh2,kwh3]], [v1,a1,w1,kwh1], [v2,a2,w2,kwh2], [v3,a3,w3,kwh3]];

    for(let uid in userData){
        userData[uid].notif.forEach( (el) => {
            if (checkCondition(el, tempArr) && ( (Date.now() - el.timestamp) > userData[uid].notifCoolDown || el.timestamp === undefined)  ){
                var replyStr = loc.translate(userData[uid].lang, 'gotNotification');
                
                if(el.line == 0){
                    if(el.moreLess == 1)
                        replyStr += loc.VAWHtranslate(userData[uid].lang, el.VAWH) + '(' + loc.translate(userData[uid].lang, 'anyLine') +  `) ${loc.translate(userData[uid].lang,'notifMore')} ${el.val}\n\n`;
                    else
                        replyStr += loc.VAWHtranslate(userData[uid].lang, el.VAWH) + '(' + loc.translate(userData[uid].lang, 'anyLine') +  `) ${loc.translate(userData[uid].lang,'notifLess')} ${el.val}\n\n`;
                }else {
                    if(el.moreLess == 1)
                        replyStr += loc.VAWHtranslate(userData[uid].lang, el.VAWH) + '(' + loc.translate(userData[uid].lang, 'line') + ' ' + el.line + `) ${loc.translate(userData[uid].lang,'notifMore')} ${el.val}\n\n`;
                    else 
                        replyStr += loc.VAWHtranslate(userData[uid].lang, el.VAWH) + '(' + loc.translate(userData[uid].lang, 'line') + ' ' + el.line + `) ${loc.translate(userData[uid].lang,'notifLess')} ${el.val}\n\n`;
                }
                replyStr += `${loc.translate(userData[uid].lang, 'line')} 1\n`+ //ПОТОМ НАДО ВЫДЕЛИТЬ ЖИРНЫМ ШРИФТОМ ПАРАМЕТР КОТОРЫЙ СРАБОТАЛ
                `${loc.translate(userData[uid].lang, 'voltage')}: ${v1}V\n`+
                `${loc.translate(userData[uid].lang, 'amperage')}: ${a1}A\n`+
                `${loc.translate(userData[uid].lang, 'power')}: ${w1}W\n`+
                `${loc.translate(userData[uid].lang, 'energy')}: ${kwh1}kWh\n\n`+
                
                `${loc.translate(userData[uid].lang, 'line')} 2\n`+
                `${loc.translate(userData[uid].lang, 'voltage')}: ${v2}V\n`+
                `${loc.translate(userData[uid].lang, 'amperage')}: ${a2}A\n`+
                `${loc.translate(userData[uid].lang, 'power')}: ${w2}W\n`+
                `${loc.translate(userData[uid].lang, 'energy')}: ${kwh2}kWh\n\n`+
                
                `${loc.translate(userData[uid].lang, 'line')} 3\n`+
                `${loc.translate(userData[uid].lang, 'voltage')}: ${v3}V\n`+
                `${loc.translate(userData[uid].lang, 'amperage')}: ${a3}A\n`+
                `${loc.translate(userData[uid].lang, 'power')}: ${w3}W\n`+
                `${loc.translate(userData[uid].lang, 'energy')}: ${kwh3}kWh\n`;

                bot.telegram.sendMessage(uid, replyStr);
                
                el.timestamp = Date.now();
                writeUserData();
            }
        });
    }
}
 

function checkCondition(el, arr){
    if(el.line == 0){
        if( (el.moreLess == 1) && ( (arr[1][el.VAWH] > el.val) || (arr[2][el.VAWH] > el.val) || (arr[3][el.VAWH] > el.val))){
            return 1;
        }else if ((el.moreLess == 0) && ( (arr[1][el.VAWH] < el.val) || (arr[2][el.VAWH] < el.val) || (arr[3][el.VAWH] < el.val))){
            return 1;
        }
    }else{
        if( (el.moreLess == 1) && (arr[el.line][el.VAWH] > el.val)){
            return 1;
        }else if ((el.moreLess == 0) && (arr[el.line][el.VAWH] < el.val)){
            return 1;
        }
    }
}

serialPort.on("open", function () {
    console.log('Serialport open');
    clearInterval(portOpenRetry);
});

serialPort.on("close", function () {
    console.log('Serialport closed');
    portOpenRetry = setInterval(tryOpenPort, 3000);
});

function tryOpenPort(){
    console.log('Trying to open port');
    serialPort.open((e) => {console.error(e);});
    
}

serialPort.pipe(new StringStream()) 
    .lines('\n')                  
    .each(                        
        data => update(data)
);

const bot = new Telegraf(config.token);

bot.start((ctx) => {
    var uid = ctx.from.id;
    Object.assign(userData, {
        [uid]:{
            state:0,
            updateMsgTimeout: config.updateMsgTimeout,
            notifCoolDown: config.notificationCoolDown,
            lang : 0,
            notif:[]
        }
    });

    ctx.reply(tr(ctx, 'welcome'), kb.mainKb(userData[uid].lang));
});



bot.command('status', (ctx) => {
    log2('/status');
    
    var uid = ctx.message.from.id;
    checkUid(uid, ctx);
    var chat = ctx.update.message.chat;
    var msgId;

    var duration = userData[uid].updateMsgTimeout;     
    var endsAfter = duration;
    var updateInterval;
    
    function replyStr() {
        return `${tr(ctx, 'line')} 1\n`+
        `${tr(ctx, 'voltage')}: ${v1}V\n`+
        `${tr(ctx, 'amperage')}: ${a1}A\n`+
        `${tr(ctx, 'power')}: ${w1}W\n`+
        `${tr(ctx, 'energy')}: ${kwh1}kWh\n\n`+
        
        `${tr(ctx, 'line')} 2\n`+
        `${tr(ctx, 'voltage')}: ${v2}V\n`+
        `${tr(ctx, 'amperage')}: ${a2}A\n`+
        `${tr(ctx, 'power')}: ${w2}W\n`+
        `${tr(ctx, 'energy')}: ${kwh2}kWh\n\n`+
        
        `${tr(ctx, 'line')} 3\n`+
        `${tr(ctx, 'voltage')}: ${v3}V\n`+
        `${tr(ctx, 'amperage')}: ${a3}A\n`+
        `${tr(ctx, 'power')}: ${w3}W\n`+
        `${tr(ctx, 'energy')}: ${kwh3}kWh\n`;
    }

    if(serialPort.isOpen){
        ctx.reply(replyStr() + `\n${tr(ctx, 'realtimeUpd')}(${endsAfter/1000 + tr(ctx, 'sec')})\n`).then(
            function(value) {
                msgId = value.message_id;
            }, 
            function(reason) {
                console.error("Couldn't send msg:" + reason);
                //Выход сделать
            }
        );
    }else {
        ctx.reply(tr(ctx, 'deviceOffline') + replyStr());
        return;
    }

    function updateMsg(){
        endsAfter -= 1000;
        bot.telegram.editMessageText(chat.id, msgId, undefined, replyStr() + `\n${tr(ctx, 'realtimeUpd')}(${endsAfter/1000 + tr(ctx, 'sec')})\n`).then(
            function(value) {
                msgId = value.message_id;
            }, 
            function(reason) {
                console.error("Couldn't update msg: " + reason);
            }
        );
    }

    updateInterval = setInterval(updateMsg, 1000);

    setTimeout( () => {
        clearInterval(updateInterval);
        bot.telegram.editMessageText(chat.id, msgId, undefined, replyStr());
    } ,duration);

});

bot.command('stats', (ctx) => {
    var uid = ctx.from.id;
    userData[uid].state = 12;
    ctx.reply(tr(ctx, 'ChoosePeriod'), kb.statsPeriod(userData[uid].lang) );
});

bot.on('text',(ctx) => {
    var txt = ctx.message.text;
    var uid = ctx.message.from.id;
    checkUid(uid, ctx);

    try{
        switch(userData[uid].state){

            case 0: //Гл меню
                switch(txt){
                    case tr(ctx, 'settings'):
                        userData[uid].state = 1;
                        ctx.reply(tr(ctx, 'settings'),kb.settingsKb(userData[uid].lang));
                        break;
                    default:
                        break;
                }
            break; 

            case 1: //Настройки
                switch(txt){
                    case tr(ctx, 'lang'):
                        userData[uid].state = 2;
                        ctx.reply(tr(ctx, 'lang'), kb.langKb(userData[uid].lang));
                        break;
                    
                    case tr(ctx, 'statusUpdTm'):
                        userData[uid].state = 3;
                        ctx.reply(tr(ctx, 'enterNumSec'), Markup.removeKeyboard());
                        break;

                    case tr(ctx, 'notifications'):
                        userData[uid].state = 4;
                        ctx.reply(tr(ctx, 'notifSettings'), kb.notifKb(userData[uid].lang));
                        break;

                    case tr(ctx, 'back'):
                        userData[uid].state = 0;
                        ctx.reply(tr(ctx, 'mainMenu'), kb.mainKb(userData[uid].lang));
                        break;

                        //TODO НАДО СДЕЛАТЬ ДЕФоЛТ ЧТОБЫ ЕСЛИ ЧТО ОТПРАВЛЯЛ НОВУЮ КЛАВУ!!!!!!

                    case tr(ctx, 'notifCD'):
                        userData[uid].state = 10;
                        ctx.reply(tr(ctx, 'enterNumSec'), Markup.removeKeyboard());
                        break;
                }
                break;
            
            case 2: //Настройка языка
                switch(txt){
                    case'Русский':
                        userData[uid].lang = 0;
                        break;
                    case'English':
                        userData[uid].lang = 1;
                        break;
                    case 'Back':
                        userData[uid].state = 1;
                        ctx.reply(tr(ctx, 'settings'),kb.settingsKb(userData[uid].lang));
                        break;
                    case 'Назад':
                        userData[uid].state = 1;
                        ctx.reply(tr(ctx, 'settings'),kb.settingsKb(userData[uid].lang));
                        break;
                }
                break;

            case 3: //Таймаут статуса
                var val = parseInt(txt);
                if ((val < 500) && (val > 0)){
                    userData[uid].updateMsgTimeout = val * 1000;
                    userData[uid].state = 1;
                    ctx.reply(tr(ctx, 'settings'), kb.settingsKb(userData[uid].lang));
                }else{
                    ctx.reply(tr(ctx, 'enterCorrectNum'));
                }
                break;

            case 4:
                switch (txt){
                    case tr(ctx, 'back'): //Назад
                        userData[uid].state = 1;
                        ctx.reply(tr(ctx, 'settings'),kb.settingsKb(userData[uid].lang));
                        break;

                    case tr(ctx, 'add'): //Добавление уведомлений
                        userData[uid].state = 5;
                        ctx.reply(`${tr(ctx,'notifAddPt1')}___${tr(ctx,'notifAddPt2')}___${tr(ctx,'notifAddPt3')}___`, kb.notifP1Kb(userData[uid].lang));
                        break;

                    case tr(ctx, 'list'): //Список уведомлений
                        if(userData[uid].notif.length > 0){
                            var replyStr = "";
                            
                            userData[uid].notif.forEach((el, i) => {
                                if (el.line == 0){
                                    if(el.moreLess == 1)
                                        replyStr += `${i+1}. (${tr(ctx, 'anyLine2')}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} > ${el.val} \n`;
                                    else 
                                        replyStr += `${i+1}. (${tr(ctx, 'anyLine2')}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} < ${el.val} \n`;
                                }else{
                                    if(el.moreLess == 1)
                                        replyStr += `${i+1}. (${tr(ctx, 'line') + ' ' + el.line}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} > ${el.val} \n`;
                                    else 
                                        replyStr += `${i+1}. (${tr(ctx, 'line') + ' ' + el.line}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} < ${el.val} \n`;
                                }
                            });
                            
                            ctx.reply(replyStr);
                        }else{
                            ctx.reply(tr(ctx, 'noNotif'));
                        }
                        break;
                     
                    case tr(ctx, 'del'): //Удаление уведомлений
                        if(userData[uid].notif.length > 0){

                            if(userData[uid].notif.length < 10){
                                userData[uid].state = 11;
                                var keyboard = [];
                                
                                userData[uid].notif.forEach((el, i) => {
                                    var replyStr = '';
                                    if (el.line == 0){
                                        if(el.moreLess == 1)
                                            replyStr += `${i+1}. (${tr(ctx, 'anyLine2')}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} > ${el.val} \n`;
                                        else 
                                            replyStr += `${i+1}. (${tr(ctx, 'anyLine2')}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} < ${el.val} \n`;
                                    }else{
                                        if(el.moreLess == 1)
                                            replyStr += `${i+1}. (${tr(ctx, 'line') + ' ' + el.line}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} > ${el.val} \n`;
                                        else 
                                            replyStr += `${i+1}. (${tr(ctx, 'line') + ' ' + el.line}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} < ${el.val} \n`;
                                    }

                                keyboard.push([Markup.button.callback( replyStr, 'delNotif'+(i+1) )] );
                                });
                                keyboard.push( [Markup.button.callback( tr(ctx, 'cancel'), 'notifDelCancel')] );
                                ctx.reply(tr(ctx, 'chooseNotifToDel'), Markup.inlineKeyboard(keyboard).resize());
                            }else{
                                userData[uid].state = 9;
                                var replyStr = tr(ctx, 'chooseNotifToDel');
                            
                                userData[uid].notif.forEach((el, i) => {
                                    if (el.line == 0){
                                        if(el.moreLess == 1)
                                            replyStr += `${i+1}. (${tr(ctx, 'anyLine2')}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} > ${el.val} \n`;
                                        else 
                                            replyStr += `${i+1}. (${tr(ctx, 'anyLine2')}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} < ${el.val} \n`;
                                    }else{
                                        if(el.moreLess == 1)
                                            replyStr += `${i+1}. (${tr(ctx, 'line') + ' ' + el.line}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} > ${el.val} \n`;
                                        else 
                                            replyStr += `${i+1}. (${tr(ctx, 'line') + ' ' + el.line}) ${loc.VAWHtranslate(userData[uid].lang,el.VAWH)} < ${el.val} \n`;
                                    }
                                });
                                
                                ctx.reply(replyStr, kb.notifDel(userData[uid].lang));
                            
                            }

                        }else{
                            ctx.reply(tr(ctx, 'noNotif'));
                        }
                        break;
                }
                break;

            case 8: //Добавление уведомлений
                var val = parseFloat(txt);
                if (val > 0){
                    var tmpNotif = userData[uid].notifTmp;
                    delete tmpNotif.str;
                    tmpNotif.val = val;
                    tmpNotif.timestamp = 0;
                    userData[uid].notif.push(tmpNotif);
                    userData[uid].state = 4;
                    userData[uid].notifTmp = {};
                    ctx.reply(tr(ctx, 'notifAdded'), kb.notifKb(userData[uid].lang));
                }else{
                    ctx.reply(tr(ctx, 'enterCorrectNumMore0'));
                }
                break;

            case 9: //Удаление уведомлений если их больше 10
                var val = parseInt(txt) - 1;
                if (val >= 0 && val <=  userData[uid].notif.length){
                    userData[uid].notif.splice(val, 1);
                    userData[uid].state = 4;
                    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[uid].lang));
                }else{
                    ctx.reply(tr(ctx, 'enterCorrectNum'));
                }

                break;

            case 10: //Кулдаун уведомлений
                var val = parseInt(txt);
                if ((val < 9999) && (val > 0)){
                    userData[uid].notifCoolDown = val * 1000;
                    userData[uid].state = 1;
                    ctx.reply(tr(ctx, 'settings'), kb.settingsKb(userData[uid].lang));
                }else{
                    ctx.reply(tr(ctx, 'enterCorrectNum'));
                }
                break;

            case 11: //Удаление уведомлений обычный способ

                break;

            case 12: //Статистка

                break;

            default:
                break;
        }
        writeUserData();
    }catch(e){
        console.error(e);
    }
});

bot.action('P1Any', (ctx) => { //state 5
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    var str = tr(ctx,'notifAddPt1')+
    tr(ctx,'any').toLowerCase()+
    tr(ctx,'notifAddPt2');

    ctx.editMessageText(str + '___' + tr(ctx,'notifAddPt3') + '___' , kb.notifP2Kb(userData[uid].lang));
    userData[uid].state = 6;
    userData[uid].notifTmp = {
        line: 0,
        str: str
    };
});

bot.action('P1L1', (ctx) => {
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    var str = tr(ctx,'notifAddPt1')+
    '1'+
    tr(ctx,'notifAddPt2');

    ctx.editMessageText(str + '___' + tr(ctx,'notifAddPt3') + '___', kb.notifP2Kb(userData[uid].lang));
    userData[uid].state = 6;
    userData[uid].notifTmp = {
        line: 1,
        str: str
    };
});

bot.action('P1L2', (ctx) => {
    checkUid(uid, ctx);
    var uid = ctx.from.id;
    var str = tr(ctx,'notifAddPt1')+
    '2'+
    tr(ctx,'notifAddPt2');

    ctx.editMessageText(str + '___' + tr(ctx,'notifAddPt3') + '___', kb.notifP2Kb(userData[uid].lang));
    userData[uid].state = 6;
    userData[uid].notifTmp = {
        line: 2,
        str: str
    };
});

bot.action('P1L3', (ctx) => {
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    var str = tr(ctx,'notifAddPt1')+
    '3'+
    tr(ctx,'notifAddPt2');

    ctx.editMessageText(str + '___' + tr(ctx,'notifAddPt3') + '___', kb.notifP2Kb(userData[uid].lang));
    userData[uid].state = 6;
    userData[uid].notifTmp = {
        line: 3,
        str: str
    };
});

bot.action('P2V', (ctx) => { //state6
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    userData[uid].notifTmp.str += tr(ctx, 'voltage'); 
    ctx.editMessageText(userData[uid].notifTmp.str + tr(ctx,'notifAddPt3') + '___', kb.notifP3Kb(userData[uid].lang)); //Сделать вместо Х
    userData[uid].state = 7;
    userData[uid].notifTmp.VAWH = 0;
});

bot.action('P2A', (ctx) => {
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    userData[uid].notifTmp.str += tr(ctx, 'amperage');
    ctx.editMessageText(userData[uid].notifTmp.str + tr(ctx,'notifAddPt3') + '___', kb.notifP3Kb(userData[uid].lang));
    userData[uid].state = 7;
    userData[uid].notifTmp.VAWH = 1;
});

bot.action('P2W', (ctx) => {
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    userData[uid].notifTmp.str += tr(ctx, 'power');
    ctx.editMessageText(userData[uid].notifTmp.str + tr(ctx,'notifAddPt3') + '___', kb.notifP3Kb(userData[uid].lang));
    userData[uid].state = 7;
    userData[uid].notifTmp.VAWH = 2;
});

bot.action('P2kWh', (ctx) => {
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    userData[uid].notifTmp.str += tr(ctx, 'energy');
    ctx.editMessageText(userData[uid].notifTmp.str + tr(ctx,'notifAddPt3') + '___', kb.notifP3Kb(userData[uid].lang));
    userData[uid].state = 7;
    userData[uid].notifTmp.VAWH = 3;
}); 

bot.action('P3More', (ctx) => { //state7
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    userData[uid].notifTmp.str += ' ' + tr(ctx, 'more').toLowerCase() + ' ';
    ctx.editMessageText(userData[uid].notifTmp.str + '('+ tr(ctx, 'enterANum') +')', kb.notifP4Kb(userData[uid].lang));
    userData[uid].state = 8;
    userData[uid].notifTmp.moreLess = 1;
});

bot.action('P3Less', (ctx) => {
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    userData[uid].notifTmp.str += ' ' + tr(ctx, 'less').toLowerCase() + ' ';
    ctx.editMessageText(userData[uid].notifTmp.str + '('+ tr(ctx, 'enterANum') +')', kb.notifP4Kb(userData[uid].lang));
    userData[uid].state = 8;
    userData[uid].notifTmp.moreLess = 0;
});

bot.action('notifAddCancel', (ctx) => {
    var uid = ctx.from.id;
    checkUid(uid, ctx);
    ctx.deleteMessage();
    userData[uid].notifTmp = {};
    userData[uid].state = 4;
});

bot.action('notifDelCancel', (ctx) => {
    checkUid(ctx.from.id, ctx);
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif1', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(0, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif2', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(1, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif3', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(2, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif4', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(3, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif5', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(4, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif6', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(5, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif7', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(6, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif8', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(7, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif9', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(8, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif10', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(9, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('delNotif11', (ctx) => {
    checkUid(ctx.from.id, ctx);
    userData[ctx.from.id].notif.splice(10, 1);
    ctx.reply(tr(ctx, 'notifDeleted'), kb.notifKb(userData[ctx.from.id].lang));
    ctx.deleteMessage();
    userData[ctx.from.id].state = 4;
});

bot.action('periodToday', (ctx) =>{
    ctx.editMessageText('Stats are not here yet');
    userData[ctx.from.id].state = 0;
});

bot.action('periodYesterday', (ctx) =>{
    ctx.editMessageText('Stats are not here yet');
    userData[ctx.from.id].state = 0;
});

bot.action('periodWeek', (ctx) =>{
    ctx.editMessageText('Stats are not here yet');
    userData[ctx.from.id].state = 0;
});

bot.action('periodMonth', (ctx) =>{
    ctx.editMessageText('Stats are not here yet');
    userData[ctx.from.id].state = 0;
});

bot.action('statsCancel', (ctx) =>{
    ctx.deleteMessage();
    userData[ctx.from.id].state = 0;
});

function checkUid(uid, ctx){ //Доп проверка просто на всякий случай
    if((userData[uid] === undefined) && (typeof(uid) != "undefined")){ 
            Object.assign(userData, {
            [uid]:{
                state:0,
                updateMsgTimeout: config.updateMsgTimeout,
                notifCoolDown: config.notificationCoolDown,
                lang : 0,
                notif:[]
            }
        });
        
        ctx.reply('USERDATA RESET', kb.mainKb(userData[uid].lang));
    }
}

bot.launch();
console.log('bot.launch');

bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
    stopAll('SIGINT');
});

// function pingGoogle(){
//     pngsession.pingHost ("8.8.8.8", function (error, target) {
//         if (error){
//             console.log (target + ": " + error.toString ());
//             stopAll('SIGINT');
//         }
//         else
//             log2(target + ": Alive");
//     });
//}

// pingGoogleInterval = setInterval(pingGoogle, 6000);

//pingGoogle();

process.once('SIGINT', () => {
    stopAll('SIGINT');
});  
process.once('SIGTERM', () => {
    stopAll('SIGTERM');
});

function stopAll(chtoto){
    bot.stop(chtoto);
    //clearInterval(pingGoogleInterval);
    writeUserData();
    console.log('bot.stop');
    setTimeout(()=>{process.exit();}, 2000);
}