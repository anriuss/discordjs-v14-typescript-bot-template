import { Client, Events, TextChannel } from "discord.js";
import mongoose from "mongoose";
import chalk from "chalk";
import { ready as ReadyChannel } from "../../lib/config/log";
import { env } from "../../../env";
import type { Event } from "../../handlers/event";

const Ready: Event = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		console.log(chalk.cyan("Client • ready"));

		if (ReadyChannel) {
			const channel = client.channels.cache.get(
				ReadyChannel
			) as TextChannel | null;
			if (channel) {
				await channel.send({ content: "Client is ready!" }).catch(() => null);
			} else {
				console.warn(
					chalk.yellow(`Channel with ID ${ReadyChannel} not found.`)
				);
			}
		}

		mongoose.set("strictQuery", false);
		try {
			await mongoose.connect(env.MONGO_DB_URI);
			console.log(chalk.cyan("Mongo Database • Connected"));
		} catch (err) {
			console.error(chalk.red("Mongo Database • Connection Error:"), err);
		}
	},
};

export default Ready;
