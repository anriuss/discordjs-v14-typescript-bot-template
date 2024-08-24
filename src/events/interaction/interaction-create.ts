import { CommandInteraction, Events } from "discord.js";
import type { Event } from "../../handlers/event";

const InteractionCreate: Event = {
	name: Events.InteractionCreate,
	once: false,
	async execute(client, interaction: CommandInteraction) {
		if (interaction.type !== 2) return;

		const slashCommand = client.slashCommands.get(interaction.commandName);

		if (!slashCommand) {
			client.slashCommands.delete(interaction.commandName);
			await interaction.reply({
				content: ":x: This command no longer exists",
			});
			return;
		}

		await slashCommand.execute({ client, interaction });
	},
};

export default InteractionCreate;
