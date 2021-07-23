const { Telegraf, Markup } = require('telegraf');
const SerialPort = require('serialport');
const { StringStream } = require('scramjet'); 
const fs = require('fs');

var config = require('./config.json'); //Потом тоже чтение кфг сделать
var kb = require('./keyboards.js');

var v1, v2, v3;
var w1, w2, w3;
var wh1, wh2, wh3;
var a1, a2, a3;

var userData = {};

function readUserData(){
    fs.readFile('./userData.json',{encoding: 'utf8'},function(err,data) {
        userData = JSON.parse(data);
        console.log('readUserData()');
    });
}

function writeUserData(){
    fs.writeFile('./userData.json', JSON.stringify(userData, null, '\t'), function (err) {
        if (err)
            return console.error(err);
        console.log('writeUserData()');
    });
}

setInterval(writeUserData, 30000);
readUserData();

var portOpenRetry;
var serialPort = new SerialPort(config.serialPort, { //TODO: Авто определение порта
    baudRate: config.baudRate,
    parser: new SerialPort.parsers.Readline("\n"),
    autoOpen: true
});

function update(data) {
    console.log('data: ' + data);

    var tempArr = data.split(';'); //TODO: Эту хрень переделать

    v1 = tempArr[0];     //TODO: Надо проверить как ведет себя с не целыми значениями
    v2 = tempArr[1];
    v3 = tempArr[2];

    w1 = tempArr[3];
    w2 = tempArr[4];
    w3 = tempArr[5];

    wh1 = tempArr[6];
    wh2 = tempArr[7];
    wh3 = tempArr[8];

    a1 = tempArr[9];
    a2 = tempArr[10];
    a3 = tempArr[11];
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
            settings:{
                updateMsgTimeout: config.updateMsgTimeout
            }
        }
    });

    ctx.reply('Welcome', kb.mainKb);
});



bot.command('status', (ctx) => {
    console.log('/status');
    
    var uid = ctx.message.from.id;
    var chat = ctx.update.message.chat;
    var msgId;

    var duration = userData[uid].settings.updateMsgTimeout;
    // if(userData[uid].settings.updateMsgTimeout <= 500){ //Норм проверку сделать
    //     duration = userData[uid].settings.updateMsgTimeout
    // }else{
    //     duration = 10000
    // }

    var endsAfter = duration;
    var updateInterval;
    
    function replyStr() {
        return 'Фаза 1\n'+
        `Напряжение: ${v1}V\n`+
        `Сила тока: ${a1}A\n`+
        `Мощность: ${w1}W\n`+
        `Потребление: ${wh1}Wh\n\n`+
        
        'Фаза 2\n'+
        `Напряжение: ${v2}V\n`+
        `Сила тока: ${a2}A\n`+
        `Мощность: ${w2}W\n`+
        `Потребление: ${wh2}Wh\n\n`+
        
        'Фаза 3\n'+
        `Напряжение: ${v3}V\n`+
        `Сила тока: ${a3}A\n`+
        `Мощность: ${w3}W\n`+
        `Потребление: ${wh3}Wh\n`;
    }

    if(serialPort.isOpen){
        ctx.reply(replyStr() + `\nОбновление в реальном времени(${endsAfter/1000}с)\n`).then(
            function(value) {
                msgId = value.message_id;
            }, 
            function(reason) {
                console.error('Не получилось отправить сообщение: ' + reason);
                //Выход сделать
            }
        );
    }else {
        ctx.reply('Устройство считывания оффлайн \n \n Последние данные:\n' + replyStr());
        return;
    }

    function updateMsg(){
        endsAfter -= 1000;
        bot.telegram.editMessageText(chat.id, msgId, undefined, replyStr() + `\nОбновление в реальном времени(${endsAfter/1000}с)\n`).then(
            function(value) {
                msgId = value.message_id;
            }, 
            function(reason) {
                console.error('Не получилось обновить сообщение: ' + reason);
            }
        );
    }

    updateInterval = setInterval(updateMsg, 1000);

    setTimeout( () => {
        clearInterval(updateInterval);
        bot.telegram.editMessageText(chat.id, msgId, undefined, replyStr());
    } ,duration);

});


bot.command('quit', (ctx) => {
    //ctx.telegram.leaveChat(ctx.message.chat.id)
    //ctx.leaveChat()
    ctx.reply('quit ', Markup.removeKeyboard() );
    //Чето нада
});

bot.on('text',(ctx) => {
    var txt = ctx.message.text;
    var uid = ctx.message.from.id;

    console.log(userData[uid].state);

    try{
        switch(userData[uid].state){

            case 0:
                switch(txt){
                    case 'Настройки':
                        userData[uid].state = 1;
                        ctx.reply('Настройки',kb.settingsKb); //Надо найти как выслать клавиатуру без отправки текста
                        break;
                    default:
                        break;
                }
                break;

            case 1:
                switch(txt){
                    case'Язык':
                        userData[uid].state = 2;
                        ctx.reply('Настройка языка', kb.langKb);
                        break;
                    
                    case'Таймаут обновления /status':
                        userData[uid].state = 3;
                        ctx.reply('Введите кол-во секунд', Markup.removeKeyboard());
                        break;

                    case'Уведомления':
                        userData[uid].state = 4;
                        ctx.reply('Настройка уведомлений', kb.notificationsKb);
                        break;

                    case'Назад':
                        userData[uid].state = 0;
                        ctx.reply('Главное меню', kb.mainKb);
                        break;
                }
                break;
            
            case 2:
                switch(txt){
                    case'Русский':
                        userData[uid].settings.lang = 0;
                        break;
                    case'English':
                        userData[uid].settings.lang = 1;
                        break;
                    case'Назад':
                        userData[uid].state = 1;
                        ctx.reply('Настройки',kb.settingsKb);
                        break;
                }
                break;

            case 3:
                var val = parseInt(txt);
                if ((val < 500) && (val > 0)){
                    userData[uid].settings.updateMsgTimeout = val * 1000;
                    userData[uid].state = 1;
                    ctx.reply('Настройки',kb.settingsKb);
                }else{
                    ctx.reply('Введите число не больше 500');
                }
                break;

            case 4:
                switch (txt){
                    case 'Назад':
                        userData[uid].state = 1;
                        ctx.reply('Настройки',kb.settingsKb);
                        break;
                    
                }
                break;

            default:
                break;
        }
        writeUserData();
    }catch(e){
        console.error(e);
    }
});

bot.launch();
console.log('bot.launch');

process.once('SIGINT', () => {
    bot.stop('SIGINT');
    serialPort.close(); //UserData
    console.log('bot.stop');
    process.exit();
});  
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    serialPort.close();
    console.log('bot.stop');
    process.exit();
});