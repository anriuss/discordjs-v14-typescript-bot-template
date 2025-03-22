/* eslint-disable @typescript-eslint/no-explicit-any */

import { Collection, CommandInteraction, Message } from 'discord.js';

interface SlashCommand {
	data: ReturnType<(typeof SlashCommandBuilder)['toJSON']>;
	cooldown?: number;
	maxUses?: number;
	execute: ({
		client,
		interaction,
	}: {
		client: Client;
		interaction: CommandInteraction;
	}) => Promise<any>;
}

interface PrefixCommand {
	data: {
		name: string;
		description: string;
		aliases: string[];
		usage?: string;
		examples?: string[];
		cooldown?: number;
		maxUses?: number;
	};
	execute: ({
		client,
		message,
		args,
	}: {
		client: Client;
		message: Message;
		args?: string[];
	}) => Promise<any>;
}

interface aliasCommand {
	name: string;
	description: string;
	execute({
		client,
		message,
	}: {
		client: Client;
		message: Message;
		args: string[];
	}): Promise<any>;
}

declare module 'discord.js' {
	interface Client {
		slashCommands: Collection<string, SlashCommand>;
		prefixCommands: Collection<string, PrefixCommand>;
		aliasCommands: Collection<string, PrefixCommand['name']>;
	}
}
