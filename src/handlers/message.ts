import { Client } from 'discord.js';
import chalk from 'chalk';
import Table from 'cli-table';
import fs from 'fs';
import path from 'path';
import { capitalizeFirstLetter } from '../lib/utils/capitalize-first-letter';
import { PrefixCommand } from '../lib/types/discord';

export async function prefixHandler(client: Client): Promise<void> {
	const table = new Table({
		head: ['Prefix Commands', 'Category', 'Aliases', 'Status'],
		colWidths: [30, 20, 20, 10],
	});

	const prefixCommandsArray: PrefixCommand['data'][] = [];

	const commandsDir = path.join(__dirname, '../commands/prefix');
	const categories = fs.readdirSync(commandsDir);

	for (const category of categories) {
		const categoryPath = path.join(commandsDir, category);

		if (fs.statSync(categoryPath).isDirectory()) {
			const commandNames = fs.readdirSync(categoryPath);

			for (const commandName of commandNames) {
				const commandPath = path.join(categoryPath, commandName);

				if (fs.statSync(commandPath).isDirectory()) {
					const indexFilePath = path.join(commandPath, 'index.ts');

					if (fs.existsSync(indexFilePath)) {
						const prefixCommandModule = await import(indexFilePath);
						const prefixCommand: PrefixCommand = prefixCommandModule.default;

						client.prefixCommands.set(
							prefixCommand.data?.name || commandName,
							prefixCommand
						);

						if (prefixCommand.data) {
							prefixCommandsArray.push(prefixCommand.data);
							table.push([
								capitalizeFirstLetter(prefixCommand.data.name),
								capitalizeFirstLetter(category),
								capitalizeFirstLetter(prefixCommand.data.aliases.join(', ')),
								chalk.green('🟢'),
							]);
						} else {
							table.push([
								capitalizeFirstLetter(commandName),
								capitalizeFirstLetter(category),
								'Unknown Aliases',
								chalk.red('🔴'),
							]);
						}
					}
				}
			}
		}
	}

	console.log(table.toString());
}
