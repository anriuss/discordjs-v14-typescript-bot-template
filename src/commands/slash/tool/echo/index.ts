import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, PermissionFlagsBits } from 'discord.js';

const data = new SlashCommandBuilder()
	.setName('echo')
	.setDescription('repeats your message')
	.setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone)
	.addStringOption(option =>
		option
			.setName('message')
			.setDescription('Message that will be repeated')
			.setRequired(true)
			.setMaxLength(2000)
	);

async function execute({ interaction }: { interaction: CommandInteraction }) {
	if (!interaction.isChatInputCommand()) return;

	const message = interaction.options.getString('message') ?? 'Error message was not provided';

	await interaction.reply(message);
}

export default {
	data,
	execute,
};
