import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js';
import { SlashCommand } from '../../../../lib/types/discord';

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

const execute: SlashCommand['execute'] = async ({ interaction }) => {
	if (!interaction.isChatInputCommand()) return;

	const message = interaction.options.getString('message') ?? 'Error message was not provided';

	await interaction.reply(message);
};

export default {
	data,
	execute,
} satisfies SlashCommand;
