let scoreBoardChannel = new BroadcastChannel('scoreBoardChannel');
scoreBoardChannel.onmessage = function(e) {
    if (e.data.event && e.data.event == 'scoreBoardLoaded') {
        gameStorage.save(app.game);
    }
};

let STORAGE_KEY = 'game';
let gameStorage = {
    fetch: function () {
        let data = localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY)) : JSON.parse(JSON.stringify(defaultGame));

        if (data.clock.oldData) {
            data.clock = data.clock.oldData;
        }

        return data;
    },
    save: function (data) {
        scoreBoardChannel.postMessage(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },
    clear: function () {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGame));
        return this.fetch();
    }
};

let sound = {
    horn: function () {
        let audio = document.getElementById('horn');
        audio.currentTime = 0;
        audio.play();
    },
    endTimeOut: function () {
        let audio = document.getElementById('outro');
        audio.currentTime = 0;
        audio.play();
    },
    stopEndTimeOut: function () {
        let audio = document.getElementById('outro');
        audio.pause();
    }
};

let gameClock = {
    clock: new Timer(),
    toggle: function () {
        if (this.clock.isRunning()) {
            this.clock.pause();
            app.game.clock.isRunning = false;
        } else if (app.game.clock.minutes || app.game.clock.seconds || app.game.clock.secondTenths) {
            this.clock.stop();
            this.clock.start({
                precision: 'secondTenths',
                countdown: true,
                startValues: {
                    minutes: parseInt(app.game.clock.minutes),
                    seconds: parseInt(app.game.clock.seconds),
                    secondTenths: parseInt(app.game.clock.secondTenths)
                }
            });
            app.game.clock.isRunning = true;
        }
    }
};
gameClock.clock.addEventListener('secondTenthsUpdated', function () {
    let timeValues = gameClock.clock.getTimeValues();

    app.game.clock.minutes = timeValues.minutes;
    app.game.clock.seconds = timeValues.seconds;
    app.game.clock.secondTenths = timeValues.secondTenths;

    if (app.game.clock.type == 'timeout' && timeValues.seconds == 10  && timeValues.secondTenths == 0) {
        sound.endTimeOut();
    }
});
gameClock.clock.addEventListener('targetAchieved', function () {
    app.game.clock.isRunning = false;
    sound.horn();

    if (app.game.clock.oldData) {
        app.game.clock = app.game.clock.oldData;
    }
});


let app = new Vue({
    data: {
        game: gameStorage.fetch(),
        activeEvent: null,
        scoreBoardWindow: false
    },
    watch: {
        game: {
            handler: function (game) {
                gameStorage.save(game);
            },
            deep: true,
        },
        'game.period': {
            handler: function () {
                this.activeEvent = null;
            }
        }
    },
    computed: {
        homeEnrichEvent: function () {
            return this.activeEvent !== null && this.game.events[this.game.period][this.activeEvent].team == 'home';
        },
        awayEnrichEvent: function () {
            return this.activeEvent !== null && this.game.events[this.game.period][this.activeEvent].team == 'away';
        },
        reversedEvents: function () {
            if (!this.game.events[this.game.period]) {
                return [];
            }
            return this.game.events[this.game.period].slice().reverse()
        },
        minutesPadded: function () {
            return this.game.clock.minutes.pad(2);
        },
        secondsPadded: function () {
            return this.game.clock.seconds.pad(2);
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
    filters: {},
    methods: {
        showScoreBoard: function () {
            let w = window.screen.availWidth * .8;
            let h = window.screen.availHeight * .8;
            let l = window.screen.availWidth * .1;
            let t = window.screen.availHeight * .1;

            this.scoreBoardWindow = window.open("board.html", "scoreboard", "location=0,menubar=0,scrollbars=0,status=0,titlebar=0,toolbar=0,width=" + w + ",height=" + h + ",left=" + l + ",top=" + t);
        },
        getScore: function (team) {
            return eventFilter.score(this.game.events, team);
        },
        getTimeouts: function (team) {
            return eventFilter.timeouts(this.game.events, this.game.period, team);
        },
        getTeamFouls: function (team) {
            return eventFilter.teamFouls(this.game.events, this.game.period, team);
        },
        getPlayerScores: function(team, player) {
            return eventFilter.playerScores(this.game.events, team, player);
        },
        getPlayerFouls: function(team, player) {
            return eventFilter.playerFouls(this.game.events, team, player);
        },
        playerIsDisabled: function (team, player) {
            return eventFilter.playerIsDisabled(this.game.events, team, player);
        },
        addScore: function (team, points) {
            this.addEvent(team, "Score +" + points, 'score', points);
        },
        addTeamFoul: function (team, type) {
            let msg = 'Team Foul';

            switch (type) {
                case 'personal':
                    msg = 'Personal Foul';
                    break;
                case 'technical':
                    msg = 'Technical Foul';
                    break;
                case 'unsportsmanlike':
                    msg = 'Unsportsmanlike Foul';
                    break;
                case 'disqualifying':
                    msg = 'Disqualifying Foul';
                    break;
            }

            this.addEvent(team, msg, 'teamfoul');
        },
        addFightingFoul: function (team) {
            this.addEvent(team, 'Fighting Foul', 'fightingfoul');
        },
        addTimeout: function (team) {
            if (this.game.clock.isRunning) {
                gameClock.toggle();
            }
            this.addEvent(team, 'Time-out', 'timeout');

            let oldData = JSON.parse(JSON.stringify(this.game.clock));

            this.game.clock.oldData = oldData;
            this.game.clock.type = 'timeout';
            this.game.clock.minutes = 1;
            this.game.clock.seconds = 0;
            this.game.clock.secondTenths = 0;
            gameClock.toggle();
        },
        switchEvent: function (event) {
            let teamPrev = event.team;
            let teamNew = (teamPrev == 'home') ? 'away' : 'home' ;
            event.player = null;
            event.team = teamNew;
            this.activeEvent = event.id;
        },
        reset: function () {
            if (confirm('Are you sure you want to reset the game?')) {
                this.game = gameStorage.clear();
                this.activeEvent = null;
            }
        },
        horn: function () {
            sound.horn();
        },
        handleKeyPress: function (event) {
            switch (event.code) {
                case 'Space':
                    if (event.srcElement.nodeName != 'INPUT' && this.game.clock.type == 'default') {
                        gameClock.toggle();
                    }
                    break;
                case 'Escape':
                    if (this.game.clock.isRunning
                        && this.game.clock.oldData
                        && this.game.clock.type == 'timeout'
                    ) {
                        gameClock.toggle();
                        sound.stopEndTimeOut();
                        this.game.clock = this.game.clock.oldData;
                    }
                    break;
            }
        },
        addEvent: function (team, msg, type, value = 1) {
            if (!this.game.events[this.game.period]) {
                Vue.set(this.game.events, this.game.period, []);
            }

            let newKey = this.game.events[this.game.period].length;

            Vue.set(this.game.events[this.game.period], newKey, {
                id: newKey,
                team: team,
                message: msg,
                type: type,
                value: value,
                time: this.game.clock.minutes.pad(2) + ':' + this.game.clock.seconds.pad(2),
                minutes: this.game.clock.minutes,
                seconds: this.game.clock.seconds,
                secondTenths: this.game.clock.secondTenths
            });

            this.activeEvent = newKey;
        },
        deleteEvent: function (eventSource) {
            let eventKey = this.game.events[this.game.period].indexOf(eventSource);
            if (eventKey > -1) {
                this.activeEvent = null;
                this.game.events[this.game.period].splice(eventKey, 1);
            }
        },
        enrichEvent: function (player) {
            Vue.set(this.game.events[this.game.period][this.activeEvent], 'player', player);
            this.activeEvent = null;
        },
        enrichEventAvailable: function (team) {
            return this.activeEvent !== null && this.game.events[this.game.period][this.activeEvent].team == team;
        }
    },
    directives: {},
    created: function () {
        window.addEventListener('keyup', this.handleKeyPress);
        window.addEventListener('keydown', function (event) {
            if (event.code == 'Space' && event.target.nodeName != 'INPUT') {
                event.preventDefault();
                return false;
            }
        });
    }
});

app.$mount('#controlboard');