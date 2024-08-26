/* eslint-disable @typescript-eslint/no-explicit-any */

import path from 'path';
import type { Client, ClientEvents } from 'discord.js';
import Table from 'cli-table';
import { capitalizeFirstLetter } from '../lib/utils/capitalize-first-letter';
import { getEventFiles } from '../lib/utils/get-event-files';

export type Event = {
	name: keyof ClientEvents;
	once?: boolean;
	rest?: boolean;
	execute(client: Client, ...args: any[]): Promise<any>;
};

export async function eventHandler(client: Client): Promise<void> {
	const table = new Table({
		head: ['Event', 'Status'],
		colWidths: [30, 10],
	});

	const eventFiles = getEventFiles(path.join(__dirname, '../events'));

	for (const file of eventFiles) {
		const event: Event = (await import(file)).default;

		if (event.rest) {
			if (event.once) {
				client.rest.once(event.name, (...args: any[]) => event.execute(client, ...args));
			} else {
				client.rest.on(event.name, async (...args: any[]) => {
					await event.execute(client, ...args);
				});
			}
		} else if (event.once) {
			client.once(event.name, (...args: any[]) => {
				event.execute(client, ...args);
			});
		} else {
			client.on(event.name, async (...args: any[]) => {
				await event.execute(client, ...args);
			});
		}

		table.push([capitalizeFirstLetter(event.name), '🟢']);
	}

	console.log(table.toString());
}
