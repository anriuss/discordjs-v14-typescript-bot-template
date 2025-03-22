import { Events, Message } from 'discord.js';
import type { Event } from '../../handlers/event';
import { PREFIX } from '../../lib/config';
import { fail } from '../../lib/config/emojis';
import { cooldownManager } from '../../lib/utils/cooldown-manager';

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
		let usedName = commandName;

		if (!command) {
			const alias = client.aliasCommands.get(commandName);
			if (alias) {
				command = client.prefixCommands.get(alias);
				usedName = alias;
			}
		}

		if (command) {
			// Check cooldown if specified
			if (command.data?.cooldown) {
				const userId = message.author.id;
				const cooldownSeconds = command.data.cooldown;
				const maxUses = command.data.maxUses || 1;

				const cooldownStatus = cooldownManager.checkCooldown(
					usedName,
					userId,
					cooldownSeconds,
					maxUses
				);

				if (cooldownStatus.onCooldown) {
					const timeLeft = cooldownStatus.remainingTime.toFixed(1);
					await message.reply(
						`${fail} Please wait **${timeLeft} seconds** before using this command again.`
					);
					return;
				}
			}

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
