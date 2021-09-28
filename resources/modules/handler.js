exports.getRawData = async (client, sheetKey) =>
{
  // Create a connection between the bot and the Google sheet
  //const doc = new client.gs("1NQNg2cLu3eS4aa6ZXF056BJLOTcQf-qVdOtDggkWiTE");
  const doc = new client.gs(sheetKey);
  await doc.useServiceAccountAuth(client.google);
  await doc.loadInfo();
  
  let sheetId = 0;
  doc.sheetsByIndex.forEach(sheet => { if (sheet.title == "Raw Data") sheetId = sheet.sheetId; });

  // Get the sheet and an obj array containing its rows
  const sheet = doc.sheetsById[sheetId];
  const rows = await sheet.getRows();

  return rows;
}

// Custom error handling management
exports.throw = async (client, err, message) =>
{
  await console.error(err);
  
  const errChannel = client.channels.cache.get(process.env.ERROR_CHANNEL);

  const errMsg = `The bot has experienced a critical error. Notifying developers and restarting...`;
  if (message === undefined) errChannel.send(`${errMsg}`);
  else message.errChannel.send(`${errMsg}`);
  
  if (message !== undefined)
  {
    if (message.channel.type === "dm")
    {
      await errChannel.send(`User ${message.author} experienced an error in **Direct Messages with the bot** at ${message.createdAt}`);
    }
    else if (message.guild.available)
    {
      await errChannel.send(`User ${message.author} experienced an error in **${message.guild.name}**: #${message.channel.name} at ${message.createdAt}`);
      await errChannel.send(`Link: https://discordapp.com/channels/${message.author.id}/${message.channel.id}/${message.id}`);
    }
    else
    {
      await errChannel.send(`User ${message.author} experienced an error in **an unknown DM or Guild** at ${message.createdAt}`);
    }
    await errChannel.send(`Command issued: \`\`\`${message.content}\`\`\``);
  }

  await errChannel.send(`Error encountered: \`\`\`${err}\`\`\``);
  
  process.exit(err.code);
}