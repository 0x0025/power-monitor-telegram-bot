const { Telegraf } = require('telegraf')
var SerialPort = require('serialport')
const { StringStream } = require('scramjet') 
var config = require('./config.json')

var v1, v2, v3
var w1, w2, w3
var wh1, wh2, wh3
var a1, a2, a3

var portOpenRetry
var serialPort = new SerialPort(config.serialPort, { //TODO: Авто определение порта
    baudRate: config.baudRate,
    parser: new SerialPort.parsers.Readline("\n"),
    autoOpen: true
})

function update(data) {
    console.log('data: ' + data)

    var tempArr = data.split(';') //TODO: Эту хрень переделать

    v1 = tempArr[0]     //TODO: Надо проверить как ведет себя с не целыми значениями
    v2 = tempArr[1]
    v3 = tempArr[2]

    w1 = tempArr[3]
    w2 = tempArr[4]
    w3 = tempArr[5]

    wh1 = tempArr[6]
    wh2 = tempArr[7]
    wh3 = tempArr[8]

    a1 = tempArr[9]
    a2 = tempArr[10]
    a3 = tempArr[11]
}


serialPort.on("open", function () {
    console.log('Serialport open');
    clearInterval(portOpenRetry);
})

serialPort.on("close", function () {
    console.log('Serialport closed');
    portOpenRetry = setInterval(tryOpenPort, 3000)
})

function tryOpenPort(){
    console.log('Trying to open port')
    try{
        serialPort.open()
    }catch(e){
        console.error(e)
    }
}



serialPort.pipe(new StringStream) // pipe the stream to scramjet StringStream
    .lines('\n')                  // split per line
    .each(                        // send message per every line
        data => update(data)
)

const bot = new Telegraf(config.token)

bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.command('status', (ctx) => {
    console.log('/status')
    
    var replyStr = 'v1 = ' + v1 + ' v2 = ' + v2 + ' v3 = ' + v3 + '\n' + //Переделать с ${}
    'w1 = ' + w1 + ' w2 = ' + w2 + ' w3 = ' + w3 + '\n' + 
    'wh1 = ' + wh1 + ' wh2 = ' + wh2 + ' wh3 = ' + wh3 + '\n'+ 
    'a1 = ' + a1 + ' a2 = ' + a2 + ' a3 = ' + a3 + '\n'

    if(serialPort.isOpen){
        ctx.reply(replyStr)
    }else {
        ctx.reply('Устройство считывания оффлайн \n \n Последние данные:\n' + replyStr)
    }
})

bot.command('quit', (ctx) => {
    //ctx.telegram.leaveChat(ctx.message.chat.id)
    //ctx.leaveChat()

    //Чето нада
})

bot.launch()
console.log('bot.launch')

process.once('SIGINT', () => bot.stop('SIGINT'))   // Enable graceful stop
process.once('SIGTERM', () => bot.stop('SIGTERM'))