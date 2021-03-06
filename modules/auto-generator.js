const
    DB = require('./SQL'),
    axios = require('axios'),
    config = require('../config'),
    schedule = require('node-schedule'),
    teamsInfo = require('./teamsInfo.json'),
    leagues = ["hs", "lol", "ow", "rl"],
    league_emojis = {
        lol: "<:LoL:745802103871766601>",
        ow: "<:Overwatch:745802104035213342>",
        rl: "<:RocketLeague:745802104010178630>",
        hs: "<:Hearthstone:745802103947132979>",
    };;

let sendHeadToHead = (game, team1, team2, date) => {
    let week = Math.floor(((date.getDate()-18)+(date.getMonth()+1))/7)+10;
    let short_month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);

    let imgURL = `http://api.opsesports.ca/image-generator/create/h2h?game=${game}&line1=${short_month}%20${date.getDate()},%20${date.getFullYear()}&line2=Regular%20Season&line3=Week%20${week}&away_logo=${team1.imgID}&home_logo=${team2.imgID}`;

    axios.post(`https://discord.com/api/webhooks/${config.WEBHOOK_ID}/${config.WEBHOOK_TOKEN}`, {
        "content": `­\n${league_emojis[game]} | [PREVIEW](<${imgURL}>) - [DOWNLOAD](<${imgURL}&download=true>) | ${team1.emoji} **${team1.name}** vs ${team2.emoji} **${team2.name}**`,
    });
}

let sendLoLcode = (mID, t1, t2, b, game_time) => {
    let url = `http://api.opsesports.ca/tourneycode/${t1.id}%20${t2.id}%20${mID}%20${t1.abbr}%20@%20${t2.abbr}`;
    if (!b) url = `${url}.ALL`
    let time = new Date(game_time);

    axios.get(url).then(res => {
        let code = res.data;

        axios.post(`https://discord.com/api/webhooks/${config.WEBHOOK_ID2}/${config.WEBHOOK_TOKEN2}`, {
            "content": `­\n${t1.emoji} @ ${t2.emoji} - **${time.getHours()<10?`0${time.getHours()}`:time.getHours()}:00** ${b?"<:twitch:765254683811381290>":""}\`\`\`${code}\`\`\``,
        });
    })
}

let checkGames = async (today) => {
    let games = await DB.getSchedule();

    let gamesToNotify = games.filter(game => {
        let game_time = new Date(game.date);
        return game_time.getDate() == today.getDate() && game_time.getMonth() == today.getMonth() && game_time.getFullYear() == today.getFullYear();
    });

    let LoLgamesToNotify = gamesToNotify.filter(game => game.leagueID == 2);

    if (gamesToNotify.length > 0) {
        axios.post(`https://discord.com/api/webhooks/${config.WEBHOOK_ID}/${config.WEBHOOK_TOKEN}`, {
            "content": `Head to Head for tonight's games.`,
        }).then(() => {
            gamesToNotify.forEach(game => {
                let team1 = teamsInfo.filter(t => t.id == game.teamID1)[0];
                let team2 = teamsInfo.filter(t => t.id == game.teamID2)[0];
                let gameN = leagues[game.leagueID-1];
        
                sendHeadToHead(gameN, team1, team2, today);
            });
        });
    }

    if (LoLgamesToNotify.length > 0) {
        LoLgamesToNotify.sort((a,b) => b.date - a.date);
        axios.post(`https://discord.com/api/webhooks/${config.WEBHOOK_ID2}/${config.WEBHOOK_TOKEN2}`, {
            "content": `${league_emojis.lol} Tonights lol games.`,
        }).then(() => {
            LoLgamesToNotify.forEach(game => {
                let team1 = teamsInfo.filter(t => t.id == game.teamID1)[0];
                let team2 = teamsInfo.filter(t => t.id == game.teamID2)[0];
        
                sendLoLcode(game.ID, team1, team2, game.broadcast, game.date);
            });
        });
    }
}

// schedule.scheduleJob('30 * * * * *', checkGames);
schedule.scheduleJob('00 09 * * *', checkGames);