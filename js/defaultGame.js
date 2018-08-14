let defaultPlayers = [
    { number: '4', name: '' },
    { number: '5', name: '' },
    { number: '6', name: '' },
    { number: '7', name: '' },
    { number: '8', name: '' },
    { number: '9', name: '' },
    { number: '10', name: '' },
    { number: '11', name: '' },
    { number: '12', name: '' },
    { number: '13', name: '' },
    { number: '14', name: '' },
    { number: '15', name: '' },
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