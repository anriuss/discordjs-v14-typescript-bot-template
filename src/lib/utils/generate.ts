import axios from 'axios';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { env } from '../../../env';
import { orange } from '../config/embed-colors';

// API constants
export const OPENAI_API_KEY = env.OPENAI_API_KEY;
export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Spoofer types
export const SPOOFER_TYPES = [
	{ name: 'Temporary', value: 'temp' },
	{ name: 'Permanent', value: 'perm' },
];

// Languages for Fortnite content
export const LANGUAGES = [
	{ name: 'English', value: 'en' },
	{ name: 'Spanish', value: 'es' },
	{ name: 'Russian', value: 'ru' },
	{ name: 'German', value: 'de' },
	{ name: 'French', value: 'fr' },
];

// Language configuration for Fortnite content
export const LANGUAGE_PROMPTS = {
	en: {
		systemPrompt:
			'You are a YouTube content creation assistant specializing in gaming content. Your task is to create high-performing, searchable video titles and descriptions for gaming audiences.',
		contentType: 'Fortnite cheat',
	},
	es: {
		systemPrompt:
			'Eres un asistente de creación de contenido de YouTube especializado en contenido de juegos. Tu tarea es crear títulos y descripciones de videos de alto rendimiento y con capacidad de búsqueda para audiencias de juegos.',
		contentType: 'truco para Fortnite',
	},
	ru: {
		systemPrompt:
			'Вы помощник по созданию контента на YouTube, специализирующийся на игровом контенте. Ваша задача — создавать высокоэффективные, доступные для поиска заголовки и описания видео для игровой аудитории.',
		contentType: 'чит для Fortnite',
	},
	de: {
		systemPrompt:
			'Sie sind ein YouTube-Content-Erstellungsassistent, der sich auf Gaming-Inhalte spezialisiert hat. Ihre Aufgabe ist es, leistungsstarke, durchsuchbare Videotitel und Beschreibungen für Gaming-Zielgruppen zu erstellen.',
		contentType: 'Fortnite-Cheat',
	},
	fr: {
		systemPrompt:
			'Vous êtes un assistant de création de contenu YouTube spécialisé dans le contenu de jeux vidéo. Votre tâche consiste à créer des titres et des descriptions de vidéos performants et consultables pour les publics de jeux.',
		contentType: 'triche pour Fortnite',
	},
};

// Interfaces
export interface GeneratedContent {
	titles: string[];
	descriptions: string[];
}

// Common helper functions
function parseContentResponse(content: string): GeneratedContent {
	const pairs = content.split('\n\n');
	const titles: string[] = [];
	const descriptions: string[] = [];

	pairs.forEach(pair => {
		const lines = pair.split('\n');
		if (lines.length >= 2) {
			let title = lines[0].replace('Title:', '').trim();
			if (title.startsWith('"') && title.endsWith('"')) {
				title = title.substring(1, title.length - 1);
			}

			const description = lines[1].replace('Description:', '').trim();

			if (title && description) {
				titles.push(title);
				descriptions.push(description);
			}
		}
	});

	return { titles, descriptions };
}

// Spoofer content generation
export async function generateSpooferContent(
	spooferType: string,
	game: string
): Promise<GeneratedContent> {
	try {
		const prompt = `Generate 5 pairs of YouTube search-optimized video titles and descriptions for a ${spooferType === 'temp' ? 'TEMPORARY' : 'PERMANENT'} HWID spoofer targeting ${game}. 

Include real ban/kick error keywords that players would actually type into YouTube search (e.g., "VPN or cheating", "globally banned", "EAC: client integrity violation"), but don't include full error messages — just enough to make it searchable and recognizable. 

The titles should be catchy, clean, highly clickable, and tailored for gaming cheat/spoofer audiences in 2025.

The descriptions should be 2-3 sentences that expand on the title, include relevant keywords, and have a call to action.

Format your response exactly like this:
Title: [First Title]
Description: [First Description]

Title: [Second Title]
Description: [Second Description]

And so on for all 5 pairs.`;

		const response = await axios.post(
			OPENAI_API_URL,
			{
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content:
							'You are a YouTube content creation assistant specializing in gaming content. Your task is to create high-performing, searchable video titles and descriptions for gaming audiences.',
					},
					{ role: 'user', content: prompt },
				],
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
			}
		);

		const content: string = response.data.choices[0].message.content;
		return parseContentResponse(content);
	} catch (error) {
		console.error('Error generating spoofer content:', error);
		throw new Error('Failed to generate spoofer content');
	}
}

// Fortnite cheat content generation
export async function generateFortniteCheatContent(
	language: string = 'en'
): Promise<GeneratedContent> {
	try {
		// Ensure language is valid
		const validLanguage = Object.keys(LANGUAGE_PROMPTS).includes(language) ? language : 'en';
		const langConfig = LANGUAGE_PROMPTS[validLanguage as keyof typeof LANGUAGE_PROMPTS];

		const prompt = `Generate 5 pairs of YouTube search-optimized video titles and descriptions for a ${langConfig.contentType} in 2025. 
  
  Please create all titles and descriptions in ${
		validLanguage === 'en'
			? 'English'
			: validLanguage === 'es'
				? 'Spanish'
				: validLanguage === 'ru'
					? 'Russian'
					: validLanguage === 'de'
						? 'German'
						: validLanguage === 'fr'
							? 'French'
							: 'English'
  } language.
  
  Include real ban-evasion and gameplay advantages keywords that players would actually type into YouTube search (e.g., "aimbot", "wallhack", "soft aim", "aim assist", "undetected"), but make it sound legitimate to YouTube algorithm.
  
  The titles should be catchy, clean, highly clickable, and tailored for gaming cheat audiences in 2025.
  
  The descriptions should be 2-3 sentences that expand on the title, include relevant keywords, and have a call to action.
  
  Format your response exactly like this:
  Title: [First Title]
  Description: [First Description]
  
  Title: [Second Title]
  Description: [Second Description]
  
  And so on for all 5 pairs.`;

		const response = await axios.post(
			OPENAI_API_URL,
			{
				model: 'gpt-3.5-turbo',
				messages: [
					{ role: 'system', content: langConfig.systemPrompt },
					{ role: 'user', content: prompt },
				],
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
			}
		);

		const content: string = response.data.choices[0].message.content;
		return parseContentResponse(content);
	} catch (error) {
		console.error('Error generating Fortnite cheat content:', error);
		throw new Error('Failed to generate Fortnite cheat content');
	}
}

// Contact info appenders
export function appendSpooferContactInfo(description: string, couponCode: string | null): string {
	let websiteInfo = 'Site: https://cheatbaron.com/';

	if (couponCode) {
		websiteInfo += ` [ USE CODE: ${couponCode} for 10% off ]`;
	}

	return `${description}\n\n${websiteInfo}\nDiscord: https://discord.gg/cheatbaron`;
}

export function appendFortniteContactInfo(description: string, couponCode: string | null): string {
	let websiteInfo = 'Site: https://cheatbaron.com/fortnite';

	if (couponCode) {
		websiteInfo += ` [ USE CODE: ${couponCode} for 10% off ]`;
	}

	return `${description}\n\n${websiteInfo}\nDiscord: https://discord.gg/cheatbaron`;
}

// Embed creators
export function createSpooferEmbeds(
	titles: string[],
	descriptions: string[],
	spooferType: string,
	game: string
): EmbedBuilder[] {
	const spooferTypeDisplay = spooferType === 'temp' ? 'Temporary' : 'Permanent';
	const embeds: EmbedBuilder[] = [];

	for (let i = 0; i < titles.length; i++) {
		const embed = new EmbedBuilder()
			.setColor(orange)
			.setTitle(`YouTube Content Generator`)
			.addFields(
				{ name: 'Title:', value: titles[i] },
				{ name: 'Description:', value: descriptions[i] }
			)
			.setFooter({
				text: `${spooferTypeDisplay} HWID Spoofer for ${game} | Page ${i + 1}/${titles.length}`,
			})
			.setThumbnail(
				'https://media.discordapp.net/attachments/1352557965135056937/1353048078873268343/Logo.png?ex=67e03bb8&is=67deea38&hm=5ea37c9626b115bea72d4260aa4493046ed7aee40b26d9993d244216f446b470&=&format=webp&quality=lossless&width=1024&height=1024'
			)
			.setTimestamp();

		embeds.push(embed);
	}

	return embeds;
}

export function createFortniteCheatEmbeds(
	titles: string[],
	descriptions: string[],
	language: string
): EmbedBuilder[] {
	const embeds: EmbedBuilder[] = [];
	const languageDisplay = language ? language.toUpperCase() : 'EN';

	for (let i = 0; i < titles.length; i++) {
		const embed = new EmbedBuilder()
			.setColor(orange)
			.setTitle(`Fortnite Cheat Content Generator`)
			.addFields(
				{ name: 'Title:', value: titles[i] },
				{ name: 'Description:', value: descriptions[i] }
			)
			.setFooter({
				text: `Fortnite Cheat Content | Language: ${languageDisplay} | Page ${i + 1}/${titles.length}`,
			})
			.setThumbnail(
				'https://media.discordapp.net/attachments/1352557965135056937/1353048078873268343/Logo.png?ex=67e03bb8&is=67deea38&hm=5ea37c9626b115bea72d4260aa4493046ed7aee40b26d9993d244216f446b470&=&format=webp&quality=lossless&width=1024&height=1024'
			)
			.setTimestamp();

		embeds.push(embed);
	}

	return embeds;
}

// Button generators
export function getNavigationButtons(
	currentPage: number,
	totalPages: number
): ActionRowBuilder<ButtonBuilder> {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('prev')
			.setLabel('Previous')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(currentPage === 0),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('Next')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === totalPages - 1)
	);
}

export function getCopyButtons(): ActionRowBuilder<ButtonBuilder> {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('copy_title')
			.setLabel('Copy Title')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId('copy_description')
			.setLabel('Copy Description')
			.setStyle(ButtonStyle.Success)
	);
}
