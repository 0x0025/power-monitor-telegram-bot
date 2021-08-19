const rus = {
    'settings': 'Настройки',
    'voltage': 'Напряжение',
    'amperage': 'Сила тока',
    'power': 'Мощность',
    'energy': 'Кол-во энергии',
    'line': 'Фаза',
    'realtimeUpd': 'Обновление в реальном времени',
    'sec': 'с',
    'deviceOffline': 'Устройство считывания оффлайн \n \n Последние данные:\n',
    'cancel': 'Отмена',
    'back': 'Назад',
    'notifications': 'Уведомления',
    'lang': 'Язык',
    'statusUpdTm': 'Таймаут обновления /status',
    'del':'Удалить',
    'list':'Список',
    'add':'Добавить',
    'more':'Больше',
    'less':'Меньше',
    'any': 'Любой',
    'enterCorrectNum':'Введите корректное число',
    'enterCorrectNumMore0':'Введите число больше 0',
    'notifAdded':'Уведомление Добавлено',
    'notifDeleted':'Уведомление удалено',
    'noNotif':'У вас нет уведомлений',
    'chooseNotifToDel':'Выберите какое уведомление вы хотите удалить: \n',
    'notifAddPt1':'Уведомить, если по ',
    'notifAddPt2':' фазе ',
    'notifAddPt3':' больше/меньше ',
    'enterANum':'Введите число',
    'mainMenu': 'Главное меню',
    'enterNumSec': 'Введите кол-во секунд',
    'notifSettings':'Настройка уведомлений',
    'welcome':'Добро пожаловать!',
    'gotNotification':'Уведомление сработало! \n \n',
    'notifLess': 'ниже',
    'notifMore': 'выше',
    'anyLine': 'Одна из фаз',
    'notifCD':'Кулдаун уведомлений',
    'anyLine2':'Любая фаза',
    'ChoosePeriod':'Выберите период:',
    'today':'Сегодня',
    'yesterday':'Вчера',
    'week':'Неделя',
    'month':'Месяц'
};

const eng = {
    'settings': 'Settings',
    'voltage': 'Voltage',
    'amperage': 'Ampreage',
    'power': 'Power',
    'energy': 'Energy',
    'line':'Line',
    'realtimeUpd': 'Realtime update',
    'sec': 's',
    'deviceOffline': 'Device offline \n \n Last data:\n',
    'cancel': 'Cancel',
    'back': 'Back',
    'notifications': 'Notifications',
    'lang': 'Language',
    'statusUpdTm': 'Status update timeout',
    'del':'Delete',
    'list':'List',
    'add':'Add new',
    'more':'More',
    'less':'Less',
    'any': 'Any',
    'enterCorrectNum':'Enter correct number',
    'enterCorrectNumMore0':'Enter correct number more than 0',
    'notifAdded':'Notification added',
    'notifDeleted':'Notification deleted',
    'noNotif':'No notifications',
    'chooseNotifToDel':'Choose what notification do you want to delete: \n',
    'notifAddPt1':'Notify if the ( ',
    'notifAddPt2':' line) ',
    'notifAddPt3':' gets more/less than ',
    'enterANum':'Enter a number',
    'mainMenu': 'Main menu',
    'enterNumSec': 'Enter number of seconds',
    'notifSettings':'Notification settings',
    'welcome':'Welcome!',
    'gotNotification':'Got notification! \n \n',
    'notifLess': 'is lower than',
    'notifMore': 'is higher than',
    'anyLine': 'One of the lines',
    'notifCD':'Notifications cooldown',
    'anyLine2':'Any line',
    'ChoosePeriod':'Choose period:',
    'today':'Today',
    'yesterday':'Yesterday',
    'week':'Week',
    'month':'Month'
};

function translate(lang, str){
    if(lang == 0){
        if(str in rus)
            return rus[str];
    }else 
    {
        if(str in eng)
            return eng[str];
    }
    return str;
}

function VAWHtranslate(lang, VAWH){
    switch(VAWH){
        case 0:
            return translate(lang, 'voltage');
        case 1:
            return translate(lang, 'amperage');
        case 2:
            return translate(lang, 'power');
        case 3:
            return translate(lang, 'energy');
    }
}

module.exports.eng = eng;
module.exports.rus = rus;
module.exports.translate = translate;
module.exports.VAWHtranslate = VAWHtranslate;