let defaultPlayers = [
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
    { number: '', name: '' },
];

let defaultGame = {
    home: {
        name: 'Home',
        players: defaultPlayers
    },
    away: {
        name: 'Away',
        players: defaultPlayers
    },
    period: '0',
    events: [],
    clock: {
        type: 'default',
        isRunning: false,
        minutes: 10,
        seconds: 0,
        secondTenths: 0
    }
};