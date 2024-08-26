import { Message, Events } from 'discord.js';
import type { Event } from '../../handlers/event';
import { PREFIX } from '../../lib/config';

const MessageCreate: Event = {
	name: Events.MessageCreate,
	once: false,
	async execute(client, message: Message) {
		if (message.author.bot || message.channel.type !== 0) return;

		if (!message.content.startsWith(PREFIX)) return;

		const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
		const commandName = args.shift()?.toLowerCase();

		if (!commandName) return;

		let command = client.prefixCommands.get(commandName);

		if (!command) {
			const alias = client.aliasCommands.get(commandName);
			if (alias) {
				command = client.prefixCommands.get(alias);
			}
		}

		if (command) {
			try {
				await command.execute({ client, message, args });
			} catch (error) {
				console.error(`Error executing command '${commandName}':`, error);
				await message.reply('There was an error executing that command!');
			}
		} else {
			await message.reply("That command doesn't exist!");
		}
	},
};

export default MessageCreate;
