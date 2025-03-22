import { CommandInteraction, Events } from 'discord.js';
import type { Event } from '../../handlers/event';
import { fail } from '../../lib/config/emojis';
import { cooldownManager } from '../../lib/utils/cooldown-manager';

const InteractionCreate: Event = {
	name: Events.InteractionCreate,
	once: false,
	async execute(client, interaction: CommandInteraction) {
		if (interaction.type !== 2) return;

		const slashCommand = client.slashCommands.get(interaction.commandName);

		if (!slashCommand) {
			client.slashCommands.delete(interaction.commandName);
			await interaction.reply({ content: `${fail} This command no longer exists` });
			return;
		}

		if (slashCommand.cooldown) {
			const userId = interaction.user.id;
			const commandName = interaction.commandName;
			const cooldownSeconds = slashCommand.cooldown;
			const maxUses = slashCommand.maxUses || 1;

			const cooldownStatus = cooldownManager.checkCooldown(
				commandName,
				userId,
				cooldownSeconds,
				maxUses
			);

			if (cooldownStatus.onCooldown) {
				const timeLeft = cooldownStatus.remainingTime.toFixed(1);
				await interaction.reply({
					content: `${fail} Please wait **${timeLeft} seconds** before using this command again.`,
					ephemeral: true,
				});
				return;
			}
		}

		await slashCommand.execute({ client, interaction });
	},
};

export default InteractionCreate;
