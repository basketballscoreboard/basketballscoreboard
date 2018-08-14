let eventFilter = {
    score: function (events, team) {
        let scores = [];
        for (let i = 0; i < events.length; i++) {
            if (events[i]) {
                scores = scores.concat(events[i].filter(function (event) {
                    return event.type == 'score' && event.team == team;
                }));
            }
        }

        let score = 0;
        for (let i = 0; i < scores.length; i++) {
            score += scores[i].value;
        }
        return score;
    },
    timeouts: function (events, period, team) {
        if (['1', '2'].indexOf(period) > -1) {
            period = ['1', '2'];
        } else if (['3', '4'].indexOf(period) > -1) {
            period = ['3', '4'];
        } else {
            period = ['5'];
        }

        let timeouts = [];
        for (let i = 0; i < period.length; i++) {
            if (events[period[i]]) {
                timeouts = timeouts.concat(events[period[i]].filter(function (event) {
                    return event.type == 'timeout' && event.team == team;
                }));
            }
        }

        return timeouts.length;
    },
    teamFouls: function (events, period, team) {
        let fouls = [];
        if (events[period]) {
            fouls = fouls.concat(events[period].filter(function (event) {
                return event.type == 'teamfoul' && event.team == team;
            }));
        }

        return fouls.length;
    },
    playerScores: function (events, team, player) {
        let scores = [];
        for (let i = 0; i < events.length; i++) {
            if (events[i]) {
                scores = scores.concat(events[i].filter(function (event) {
                    return event.type == 'score' && event.team == team && event.player == player;
                }));
            }
        }

        let score = 0;
        for (let i = 0; i < scores.length; i++) {
            score += scores[i].value;
        }
        return score;
    },
    playerFouls: function (events, team, player) {
        let fouls = [];
        for (let i = 0; i < events.length; i++) {
            if (events[i]) {
                fouls = fouls.concat(events[i].filter(function (event) {
                    return event.type == 'teamfoul' && event.team == team && event.player == player;
                }));
            }
        }

        return fouls;
    },
    playerIsDisabled: function (events, team, player) {
        let fouls = this.playerFouls(events, team, player);

        if (fouls.length >= 5) {
            return true;
        }

        let strikes = 0;
        for (let i = 0; i < fouls.length; i++) {
            let foul = fouls[i];

            if (foul.message == 'Disqualifying Foul') {
                return true;
            }

            if (foul.message != 'Personal Foul') {
                strikes++;
            }
        }

        if (strikes >= 2) {
            return true;
        }

        let fightingFouls = [];
        for (let i = 0; i < events.length; i++) {
            if (events[i]) {
                fightingFouls = fightingFouls.concat(events[i].filter(function (event) {
                    return event.type == 'fightingfoul' && event.team == team && event.player == player;
                }));
            }
        }

        return (fightingFouls.length >= 1);
    }
};