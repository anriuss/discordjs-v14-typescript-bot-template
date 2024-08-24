import { Client, ApplicationCommandDataResolvable } from "discord.js";
import chalk from "chalk";
import Table from "cli-table";
import fs from "fs";
import path from "path";
import { capitalizeFirstLetter } from "../lib/utils/capitalize-first-letter";

export async function slashHandler(client: Client): Promise<void> {
	const table = new Table({
		head: ["Slash Commands", "Category", "Status"],
		colWidths: [30, 20, 10],
	});

	const slashCommandsArray: ApplicationCommandDataResolvable[] = [];

	const commandsDir = path.join(__dirname, "../commands/slash");
	const categories = fs.readdirSync(commandsDir);

	for (const category of categories) {
		const categoryPath = path.join(commandsDir, category);

		if (fs.statSync(categoryPath).isDirectory()) {
			const commandNames = fs.readdirSync(categoryPath);

			for (const commandName of commandNames) {
				const commandPath = path.join(categoryPath, commandName);

				if (fs.statSync(commandPath).isDirectory()) {
					const indexFilePath = path.join(commandPath, "index.ts");

					if (fs.existsSync(indexFilePath)) {
						const slashCommand = (await import(indexFilePath)).default;
						client.slashCommands.set(slashCommand.data.name, slashCommand);

						if (slashCommand.data) {
							slashCommandsArray.push(slashCommand.data.toJSON());
							table.push([
								capitalizeFirstLetter(slashCommand.data.name),
								capitalizeFirstLetter(category),
								chalk.green("🟢"),
							]);
						} else {
							table.push([
								capitalizeFirstLetter(slashCommand.data.name),
								capitalizeFirstLetter(category),
								chalk.red("🔴"),
							]);
						}
					}
				}
			}
		}
	}

	console.log(table.toString());

	await client.application?.commands
		.set(slashCommandsArray)
		.then(() => console.log(chalk.cyan("Slash commands • Registered")));
}
