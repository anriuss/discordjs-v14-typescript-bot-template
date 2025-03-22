import { ComponentType, EmbedBuilder, Message } from 'discord.js';
import { fail, success } from '../../../../lib/config/emojis';
import { PrefixCommand } from '../../../../lib/types/discord';
import {
	appendFortniteContactInfo,
	appendSpooferContactInfo,
	createFortniteCheatEmbeds,
	createSpooferEmbeds,
	generateFortniteCheatContent,
	generateSpooferContent,
	getCopyButtons,
	getNavigationButtons,
} from '../../../../lib/utils/generate';

const data: PrefixCommand['data'] = {
	name: 'generate',
	description: 'Generate YouTube content for various gaming products',
	aliases: ['gen'],
	usage: 'generate <spoofer|fortnite-cheats> [options]',
	examples: [
		'generate spoofer temp Minecraft',
		'generate spoofer perm Fortnite SUMMER2025',
		'generate fortnite-cheats',
		'generate fortnite-cheats es SUMMER2025',
	],
	cooldown: 120,
	maxUses: 3,
};

const execute: PrefixCommand['execute'] = async ({ message, args = [] }) => {
	if (args.length < 1) {
		return message.reply(`${fail} Usage: ${data.usage}`);
	}

	const subcommand = args[0].toLowerCase();

	if (subcommand === 'spoofer') {
		if (args.length < 3) {
			return message.reply(`${fail} Usage: generate spoofer <temp|perm> <game> [coupon]`);
		}

		const spooferType = args[1].toLowerCase();
		const game = args[2];
		const couponCode = args.length > 3 ? args[3] : null;

		if (!['temp', 'perm'].includes(spooferType)) {
			return message.reply(`${fail} Invalid spoofer type. Use 'temp' or 'perm'`);
		}

		const replyMsg = await message.reply('Generating spoofer content, please wait...');

		try {
			const { titles, descriptions } = await generateSpooferContent(spooferType, game);
			const enhancedDescriptions = descriptions.map(desc =>
				appendSpooferContactInfo(desc, couponCode)
			);
			const embeds = createSpooferEmbeds(titles, enhancedDescriptions, spooferType, game);

			let currentPage = 0;

			await replyMsg.edit({
				content: null,
				embeds: [embeds[currentPage]],
				components: [getNavigationButtons(currentPage, embeds.length), getCopyButtons()],
			});

			handlePagination(replyMsg, message.author.id, embeds, titles, enhancedDescriptions);
		} catch (error) {
			console.error(error);
			await replyMsg.edit({
				content: `${fail} An error occurred while generating content. Please check your API key and try again.`,
				embeds: [],
				components: [],
			});
		}
	} else if (subcommand === 'fortnite-cheats') {
		// Improved language detection
		let language = 'en';
		let couponCode = null;

		// Check if args[1] is a valid language code
		if (args.length > 1) {
			const validLanguages = ['en', 'es', 'ru', 'de', 'fr'];
			if (validLanguages.includes(args[1].toLowerCase())) {
				language = args[1].toLowerCase();
				// If there's another arg after the language, it's the coupon
				couponCode = args.length > 2 ? args[2] : null;
			} else {
				// If args[1] is not a valid language, it must be a coupon
				couponCode = args[1];
			}
		}

		const replyMsg = await message.reply('Generating Fortnite cheat content, please wait...');

		try {
			const { titles, descriptions } = await generateFortniteCheatContent(language);
			const enhancedDescriptions = descriptions.map(desc =>
				appendFortniteContactInfo(desc, couponCode)
			);
			const embeds = createFortniteCheatEmbeds(titles, enhancedDescriptions, language);

			let currentPage = 0;

			await replyMsg.edit({
				content: null,
				embeds: [embeds[currentPage]],
				components: [getNavigationButtons(currentPage, embeds.length), getCopyButtons()],
			});

			handlePagination(replyMsg, message.author.id, embeds, titles, enhancedDescriptions);
		} catch (error) {
			console.error(error);
			await replyMsg.edit({
				content: `${fail} An error occurred while generating content. Please check your API key and try again.`,
				embeds: [],
				components: [],
			});
		}
	} else {
		return message.reply(`${fail} Invalid subcommand. Use 'spoofer' or 'fortnite-cheats'`);
	}
};

// Helper function to handle pagination for both subcommands
function handlePagination(
	replyMsg: Message,
	authorId: string,
	embeds: EmbedBuilder[],
	titles: string[],
	enhancedDescriptions: string[]
) {
	let currentPage = 0;

	const collector = replyMsg.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 180000,
	});

	collector.on('collect', async i => {
		if (i.user.id !== authorId) {
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
		replyMsg.edit({ embeds: [embeds[currentPage]], components: [] }).catch(console.error);
	});
}

export default { data, execute } satisfies PrefixCommand;
