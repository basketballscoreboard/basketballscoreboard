Number.prototype.pad = function(size) {
    let s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
};

let board = new Vue({
    data: {
        game: defaultGame
    },
    computed: {
        homeScore: function () {
            return eventFilter.score(this.game.events, 'home');
        },
        awayScore: function () {
            return eventFilter.score(this.game.events, 'away');
        },
        homeTimeouts: function () {
            return eventFilter.timeouts(this.game.events, this.game.period, 'home');
        },
        awayTimeouts: function () {
            return eventFilter.timeouts(this.game.events, this.game.period, 'away');
        },
        homeTeamFouls: function () {
            return eventFilter.teamFouls(this.game.events, this.game.period, 'home');
        },
        awayTeamFouls: function () {
            return eventFilter.teamFouls(this.game.events, this.game.period, 'away');
        },
        minutes: function () {
            if (this.game.clock.minutes >= 0) {
                return this.game.clock.minutes.pad(2)
            }
            return '00';
        },
        seconds: function () {
            if (this.game.clock.seconds >= 0) {
                if (this.game.clock.minutes > 0) {
                    return this.game.clock.seconds.pad(2)
                }
                return this.game.clock.seconds
            }
            return '00';
        },
        secondTenths: function () {
            if (!this.game.clock.minutes) {
                return this.game.clock.secondTenths;
            }
        },
        timeoutLimit: function () {
            if (['1', '2'].indexOf(this.game.period) > -1) {
                return 2;
            } else if (['3', '4'].indexOf(this.game.period) > -1) {
                return 3;
            }

            return 0;
        }
    },
    methods: {
        getPlayerScores: function(team, player) {
            return eventFilter.playerScores(this.game.events, team, player);
        },
        getPlayerFouls: function(team, player) {
            return eventFilter.playerFouls(this.game.events, team, player);
        },
        playerIsDisabled: function (team, player) {
            return eventFilter.playerIsDisabled(this.game.events, team, player);
        }
    }
});

board.$mount('#scoreboard');

let scoreBoardChannel = new BroadcastChannel('scoreBoardChannel');
scoreBoardChannel.postMessage({event: 'scoreBoardLoaded'});
scoreBoardChannel.onmessage = function(e) {
    board.game = e.data;
};