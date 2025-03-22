import { SlashCommandBuilder } from '@discordjs/builders';
import { ComponentType, EmbedBuilder, Message, PermissionFlagsBits } from 'discord.js';
import { fail, success } from '../../../../lib/config/emojis';
import { SlashCommand } from '../../../../lib/types/discord';
import {
	LANGUAGES,
	SPOOFER_TYPES,
	appendFortniteContactInfo,
	appendSpooferContactInfo,
	createFortniteCheatEmbeds,
	createSpooferEmbeds,
	generateFortniteCheatContent,
	generateSpooferContent,
	getCopyButtons,
	getNavigationButtons,
} from '../../../../lib/utils/generate';

const data = new SlashCommandBuilder()
	.setName('generate')
	.setDescription('Generate YouTube content for various gaming products')
	.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
	// Spoofer subcommand
	.addSubcommand(subcommand =>
		subcommand
			.setName('spoofer')
			.setDescription('Generate YouTube titles and descriptions for HWID spoofer content')
			.addStringOption(option =>
				option
					.setName('type')
					.setDescription('Type of spoofer (temp or perm)')
					.setRequired(true)
					.addChoices(...SPOOFER_TYPES)
			)
			.addStringOption(option =>
				option
					.setName('game')
					.setDescription('Enter a game name (e.g., Minecraft, Fortnite, etc.)')
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('coupon')
					.setDescription('Optional coupon code for the website link')
					.setRequired(false)
			)
	)
	// Fortnite-cheats subcommand
	.addSubcommand(subcommand =>
		subcommand
			.setName('fortnite-cheats')
			.setDescription('Generate YouTube titles and descriptions for Fortnite cheat content')
			.addStringOption(option =>
				option
					.setName('language')
					.setDescription('Language for the generated content')
					.setRequired(false)
					.addChoices(...LANGUAGES)
			)
			.addStringOption(option =>
				option
					.setName('coupon')
					.setDescription('Optional coupon code for the website link')
					.setRequired(false)
			)
	);

const execute: SlashCommand['execute'] = async ({ interaction }) => {
	if (!interaction.isChatInputCommand()) return;

	const subcommand = interaction.options.getSubcommand();

	await interaction.deferReply();

	try {
		if (subcommand === 'spoofer') {
			const spooferType = interaction.options.getString('type');
			const game = interaction.options.getString('game');
			const couponCode = interaction.options.getString('coupon');

			if (!spooferType || !game) {
				return await interaction.editReply({ content: `${fail} Invalid input` });
			}

			const { titles, descriptions } = await generateSpooferContent(spooferType, game);
			const enhancedDescriptions = descriptions.map(desc =>
				appendSpooferContactInfo(desc, couponCode)
			);
			const embeds = createSpooferEmbeds(titles, enhancedDescriptions, spooferType, game);

			let currentPage = 0;

			const response = await interaction.editReply({
				embeds: [embeds[currentPage]],
				components: [getNavigationButtons(currentPage, embeds.length), getCopyButtons()],
			});

			handlePagination(response, interaction.user.id, embeds, titles, enhancedDescriptions);
		} else if (subcommand === 'fortnite-cheats') {
			const language = interaction.options.getString('language') || 'en';
			const couponCode = interaction.options.getString('coupon');

			const { titles, descriptions } = await generateFortniteCheatContent(language);
			const enhancedDescriptions = descriptions.map(desc =>
				appendFortniteContactInfo(desc, couponCode)
			);
			const embeds = createFortniteCheatEmbeds(titles, enhancedDescriptions, language);

			let currentPage = 0;

			const response = await interaction.editReply({
				embeds: [embeds[currentPage]],
				components: [getNavigationButtons(currentPage, embeds.length), getCopyButtons()],
			});

			handlePagination(response, interaction.user.id, embeds, titles, enhancedDescriptions);
		}
	} catch (error) {
		console.error(error);
		await interaction.editReply({
			content: `${fail} An error occurred while generating content. Please check your API key and try again.`,
		});
	}
};

// Helper function to handle pagination for both subcommands
function handlePagination(
	response: Message,
	userId: string,
	embeds: EmbedBuilder[],
	titles: string[],
	enhancedDescriptions: string[]
) {
	let currentPage = 0;

	const collector = response.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 180000,
	});

	collector.on('collect', async i => {
		if (i.user.id !== userId) {
			await i.reply({ content: 'These buttons are not for you!', ephemeral: true });
			return;
		}

		if (i.customId === 'prev') {
			currentPage = Math.max(0, currentPage - 1);
			await i.update({
				embeds: [embeds[currentPage]],
				components: [getNavigationButtons(currentPage, embeds.length), getCopyButtons()],
			});
		} else if (i.customId === 'next') {
			currentPage = Math.min(embeds.length - 1, currentPage + 1);
			await i.update({
				embeds: [embeds[currentPage]],
				components: [getNavigationButtons(currentPage, embeds.length), getCopyButtons()],
			});
		} else if (i.customId === 'copy_title') {
			await i.reply({
				content: `${success} Here's your title:\n\`\`\`\n${titles[currentPage]}\n\`\`\``,
				ephemeral: true,
			});
		} else if (i.customId === 'copy_description') {
			await i.reply({
				content: `${success} Here's your description:\n\`\`\`\n${enhancedDescriptions[currentPage]}\n\`\`\``,
				ephemeral: true,
			});
		}
	});

	collector.on('end', () => {
		response.edit({ embeds: [embeds[currentPage]], components: [] }).catch(console.error);
	});
}

export default { data, execute, cooldown: 120, maxUses: 3 } satisfies SlashCommand;
