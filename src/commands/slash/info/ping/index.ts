import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

async function execute({ interaction }: { interaction: CommandInteraction }) {
	await interaction.reply('Pong!');
}

export default {
	data,
	execute,
};
