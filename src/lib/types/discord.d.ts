import { Collection, CommandInteraction } from 'discord.js';

interface SlashCommand {
	name: string;
	description: string;
	execute({
		client,
		interaction,
	}: {
		client: Client;
		interaction: CommandInteraction;
	}): Promise<void>;
}

declare module 'discord.js' {
	interface Client {
		slashCommands: Collection<string, SlashCommand>;
	}
}
