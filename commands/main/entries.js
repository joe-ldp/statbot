// ping.js
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command
{
  constructor (client) 
  {
    super(client, 
    {
      name: 'entries',
      group: 'main',
      memberName: 'entries',
      aliases: ['e'],
      description: "Nether entries bla bla bla",
      examples: [`${client.commandPrefix}entries`, `${client.commandPrefix}entries @user`], 
    });
  }

  async run (message)
  {
    const args = message.content.slice(this.client.commandPrefix.length).trim().split(/ +/g).splice(1);
    if (args.length === 0) return message.reply("You entered nothing.");
    
    const startTime = new Date().getTime();

    try
    {
      // Initalize Discord embed and required variables
      const embed = new MessageEmbed();
      const ss = this.client.ss;
      
      const data = await this.client.handler.getRawData(this.client, args[0]);//message.author.sheetId shit
      let nethers = [];

      for (const [rowNum, row] of data.entries())
      {
        if (row.Nether != "" && row.Nether != undefined) {
          let sec = 0;
          let split = row.Nether.split(":");
          for (let i = 0; i < split.length; i++) {
            sec += split[i] * Math.pow(60, (split.length - i - 1));
          }
          nethers.push(sec);
        }
      }
      nethers = nethers.sort((a, b) => a - b);
      
      embed
        .setTitle(`Nether entry stats`)
        .addField(`**Mean avg entry:**`, `${secToHMS(ss.mean(nethers))}`)
        .addField(`**Median avg entry:**`, `${secToHMS(ss.medianSorted(nethers))}`)
        .addField(`**Interquartile Range:**`, `${secToHMS(ss.interquartileRange(nethers))}`)
        .addField(`**25th Percentile**`, `${secToHMS(ss.quantile(nethers, 0.25))}`)
        .addField(`**75th Percentile**`, `${secToHMS(ss.quantile(nethers, 0.75))}`)
        ;
      
      const funcTime = Date.now() - startTime;
      embed.setFooter(`Retrieved in ${funcTime}ms.`, `${this.client.botAvatar}`);    

      return message.channel.send(embed);
    }
    catch (err)
    {
      // Inform bot owner for error, send error log, and log it
      await this.client.handler.throw(this.client, err, message);
    }

    function secToHMS(sec)
    {
      return new Date(Math.round(sec) * 1000).toISOString().substr(14, 5);
    }
  }
}