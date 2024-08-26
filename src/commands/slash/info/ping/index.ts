import { SlashCommandBuilder } from '@discordjs/builders';
import { SlashCommand } from '../../../../lib/types/discord';

const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

const execute: SlashCommand['execute'] = async ({ interaction }) => {
	await interaction.reply('Pong!');
};

export default {
	data,
	execute,
} satisfies SlashCommand;
