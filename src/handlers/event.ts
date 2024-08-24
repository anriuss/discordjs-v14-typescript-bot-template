import path from "path";
import type { Client, ClientEvents } from "discord.js";
import Table from "cli-table";
import { capitalizeFirstLetter } from "../lib/utils/capitalize-first-letter";
import { getEventFiles } from "../lib/utils/get-event-files";

export type Event = {
	name: keyof ClientEvents;
	once?: boolean;
	rest?: boolean;
	execute(client: Client, ...args: unknown[]): Promise<void>;
};

export async function eventHandler(client: Client): Promise<void> {
	const table = new Table({
		head: ["Event", "Status"],
		colWidths: [30, 10],
	});

	const eventFiles = getEventFiles(path.join(__dirname, "../events"));

	for (const file of eventFiles) {
		const event: Event = (await import(file)).default;

		if (event.rest) {
			if (event.once) {
				client.rest.once(event.name, (...args: unknown[]) =>
					event.execute(client, ...args)
				);
			} else {
				client.rest.on(event.name, async (...args: unknown[]) => {
					await event.execute(client, ...args);
				});
			}
		} else if (event.once) {
			client.once(event.name, (...args: unknown[]) => {
				event.execute(client, ...args);
			});
		} else {
			client.on(event.name, async (...args: unknown[]) => {
				await event.execute(client, ...args);
			});
		}

		table.push([capitalizeFirstLetter(event.name), "🟢"]);
	}

	console.log(table.toString());
}
