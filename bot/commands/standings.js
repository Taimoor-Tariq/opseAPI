const opseAPI = require('../../modules/API');
const Discord = require('discord.js');

let sendEmbed = (channel, data, title, logo) => {
    const icons = {
        hs_icon: {
            attach: new Discord.MessageAttachment(`./bot/assets/hs_icon.png`),
            url: "attachment://hs_icon.png"
        },
        lol_icon: {
            attach: new Discord.MessageAttachment(`./bot/assets/lol_icon.png`),
            url: "attachment://lol_icon.png"
        },
        ow_icon: {
            attach: new Discord.MessageAttachment(`./bot/assets/ow_icon.png`),
            url: "attachment://ow_icon.png"
        },
        rl_icon: {
            attach: new Discord.MessageAttachment(`./bot/assets/rl_icon.png`),
            url: "attachment://rl_icon.png"
        }
    }

    let embed = {
        "title": title,
        "description": "",
        "color": 14100527,
        "timestamp": new Date(),
        "thumbnail": {
            "url": icons[logo].url
        }
    }
    
    for (var i in data) {
        n = parseInt(i) + 1;
        if (n<10) n = `0${n}`
        embed.description += `\`${n}\` - **${data[i].wins}W ${data[i].loss}L** - ${data[i].name}\n`;
    }
    
    channel.send({ files: [icons[logo].attach], embed: embed });
}

exports.run = async (client, message, args) => {
    let user = message.author;

    console.log(`[BOT] \n[BOT] > ${user.username} typed the 'standings' command.`);
    let standings = await opseAPI.getStandings(true);

    if (args[0]) {
        switch (args[0]) {
            case "1":
            case "hs":
                sendEmbed(message.channel, standings["1"], "Hearthstone Standings", "hs_icon");
                break;

            case "2":
            case "lol":
                sendEmbed(message.channel, standings["2"], "League of Legends Standings", "lol_icon");
                break;


            case "3":
            case "ow":
                sendEmbed(message.channel, standings["3"], "Overwatch Standings", "ow_icon");
                break;


            case "4":
            case "rl":
                sendEmbed(message.channel, standings["4"], "Rocket League Standings", "rl_icon");
                break;
        
            default:
                break;
        }
    }
    else {
        sendEmbed(message.channel, standings["1"], "Hearthstone Standings", "hs_icon");
        sendEmbed(message.channel, standings["2"], "League of Legends Standings", "lol_icon");
        sendEmbed(message.channel, standings["3"], "Overwatch Standings", "ow_icon");
        sendEmbed(message.channel, standings["4"], "Rocket League Standings", "rl_icon");
    }

    console.log(`[BOT] > End of command entered by ${user.username}`);
};