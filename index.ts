import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import chalk from 'chalk';
import { eventHandler } from './src/handlers/event';
import { slashHandler } from './src/handlers/slash';
import { env } from './env';
import { prefixHandler } from './src/handlers/message';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [
		Partials.User,
		Partials.Message,
		Partials.GuildMember,
		Partials.ThreadMember,
		Partials.Channel,
	],
});

// ! Modify discord.d.ts if you want to add more collections

client.slashCommands = new Collection();
client.prefixCommands = new Collection();
client.aliasCommands = new Collection();

console.log(chalk.magenta('Discord Bot Template'));

client
	.login(env.DISCORD_TOKEN)
	.then(() => {
		console.log(chalk.magenta('Loading...'));
		eventHandler(client);
		slashHandler(client);
		prefixHandler(client);
	})
	.catch(err => {
		console.error(chalk.red('Failed to login: '), err);
	});

export { client };
