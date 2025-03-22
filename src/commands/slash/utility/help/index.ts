import { SlashCommandBuilder } from '@discordjs/builders';
import {
	ActionRowBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { orange } from '../../../../lib/config/embed-colors';
import { SlashCommand } from '../../../../lib/types/discord';

const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Display all available commands')
	.addStringOption(option =>
		option
			.setName('command')
			.setDescription('Get detailed info about a specific command')
			.setRequired(false)
	);

const execute: SlashCommand['execute'] = async ({ client, interaction }) => {
	if (!interaction.isChatInputCommand()) return;

	const specificCommand = interaction.options.getString('command');

	if (specificCommand) {
		const command = client.slashCommands.get(specificCommand.toLowerCase());

		if (!command) {
			return await interaction.reply({
				content: `Command \`${specificCommand}\` not found. Use \`/help\` to see all commands.`,
				ephemeral: true,
			});
		}

		const embed = new EmbedBuilder()
			.setColor(orange)
			.setTitle(`Command: /${command.data.name}`)
			.setDescription(command.data.description)
			.addFields({
				name: 'Cooldown',
				value: command.cooldown
					? `${command.cooldown} seconds (${command.maxUses || 1} uses before cooldown)`
					: 'No cooldown',
			});

		const options = command.data.options;

		if (options && options.length > 0) {
			const optionsField = options
				.map((opt: { required: any; name: any; description: any }) => {
					const required = opt.required ? '(Required)' : '(Optional)';
					return `\`${opt.name}\` - ${opt.description} ${required}`;
				})
				.join('\n');

			embed.addFields({ name: 'Options', value: optionsField });
		}

		return await interaction.reply({ embeds: [embed], ephemeral: true });
	}

	const categories = new Map<string, SlashCommand[]>();

	client.slashCommands.forEach((cmd: SlashCommand) => {
		const category = cmd.data.name.includes('/') ? cmd.data.name.split('/')[0] : 'General';

		if (!categories.has(category)) {
			categories.set(category, []);
		}

		categories.get(category)?.push(cmd);
	});

	const embed = new EmbedBuilder()
		.setColor(orange)
		.setTitle('Bot Help Menu')
		.setDescription(
			'Use the dropdown menu below to browse command categories\nOr use `/help [command]` to get detailed information about a specific command'
		);

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId('help_category_select')
		.setPlaceholder('Select a category...');

	for (const [category, commands] of categories.entries()) {
		selectMenu.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(category)
				.setDescription(`View ${category} commands (${commands.length})`)
				.setValue(category)
		);
	}

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

	const response = await interaction.reply({
		embeds: [embed],
		components: [row],
		ephemeral: true,
	});

	const collector = response.createMessageComponentCollector({ time: 60000 });

	collector.on('collect', async i => {
		if (i.user.id !== interaction.user.id) {
			await i.reply({ content: 'This menu is not for you!', ephemeral: true });
			return;
		}

		if (i.isStringSelectMenu() && i.customId === 'help_category_select') {
			const category = i.values[0];
			const commands = categories.get(category) || [];

			const categoryEmbed = new EmbedBuilder()
				.setColor(orange)
				.setTitle(`${category} Commands`)
				.setDescription('Here are all the commands in this category:');

			const commandList = commands
				.map(cmd => {
					const cooldownInfo = cmd.cooldown
						? ` (Cooldown: ${cmd.cooldown}s, Uses: ${cmd.maxUses || 1})`
						: '';

					return `\`/${cmd.data.name}\` - ${cmd.data.description}${cooldownInfo}`;
				})
				.join('\n\n');

			categoryEmbed.addFields({
				name: 'Available Commands',
				value: commandList || 'No commands in this category',
			});

			await i.update({ embeds: [categoryEmbed] });
		}
	});

	collector.on('end', () => {
		interaction.editReply({ components: [] }).catch(console.error);
	});
};

export default { data, execute, cooldown: 5, maxUses: 3 } satisfies SlashCommand;
