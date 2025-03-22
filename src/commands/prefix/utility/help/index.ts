import { EmbedBuilder } from 'discord.js';
import { PREFIX } from '../../../../lib/config';
import { orange } from '../../../../lib/config/embed-colors';
import { PrefixCommand } from '../../../../lib/types/discord';

const data: PrefixCommand['data'] = {
	name: 'help',
	description: 'Display all available commands',
	aliases: ['commands', 'cmds', 'h'],
	usage: 'help [command]',
	examples: ['help', 'help generate-info'],
	cooldown: 5,
	maxUses: 3,
};

const execute: PrefixCommand['execute'] = async ({ client, message, args = [] }) => {
	if (args.length > 0) {
		const commandName = args[0].toLowerCase();
		const command =
			client.prefixCommands.get(commandName) ||
			client.prefixCommands.get(client.aliasCommands.get(commandName) || '');

		if (!command) {
			return message.reply(
				`Command \`${commandName}\` not found. Use \`${PREFIX}help\` to see all commands.`
			);
		}

		const embed = new EmbedBuilder()
			.setColor(orange)
			.setTitle(`Command: ${PREFIX}${command.data.name}`)
			.setDescription(command.data.description)
			.addFields(
				{ name: 'Usage', value: `\`${PREFIX}${command.data.usage}\`` },
				{
					name: 'Aliases',
					value:
						command.data.aliases.map((a: any) => `\`${PREFIX}${a}\``).join(', ') ||
						'No aliases',
				},
				{
					name: 'Cooldown',
					value: command.data.cooldown
						? `${command.data.cooldown} seconds (${command.data.maxUses || 1} uses before cooldown)`
						: 'No cooldown',
				},
				{
					name: 'Examples',
					value:
						command.data.examples.map((e: any) => `\`${PREFIX}${e}\``).join('\n') ||
						'No examples',
				}
			);

		return message.reply({ embeds: [embed] });
	}

	const categories = new Map<string, PrefixCommand[]>();

	client.prefixCommands.forEach((cmd: PrefixCommand) => {
		// Get category from file path or set default
		const category = cmd.data.name.includes('/') ? cmd.data.name.split('/')[0] : 'General';

		if (!categories.has(category)) {
			categories.set(category, []);
		}

		categories.get(category)?.push(cmd);
	});

	const embed = new EmbedBuilder()
		.setColor(orange)
		.setTitle('Bot Help Menu')
		.setDescription(
			`Use \`${PREFIX}help [command]\` to get detailed information about a specific command.\nPrefix: \`${PREFIX}\`\n\n**Available Categories:**`
		);

	for (const [category, commands] of categories.entries()) {
		const commandList = commands
			.map(cmd => {
				const cooldownInfo = cmd.data.cooldown
					? ` (Cooldown: ${cmd.data.cooldown}s, Uses: ${cmd.data.maxUses || 1})`
					: '';

				return `\`${PREFIX}${cmd.data.name}\` - ${cmd.data.description}${cooldownInfo}`;
			})
			.join('\n');

		embed.addFields({
			name: `${category} Commands [${commands.length}]`,
			value: commandList || 'No commands in this category',
		});
	}

	embed.setFooter({
		text: `Use ${PREFIX}help [command] to see aliases and examples • ${client.prefixCommands.size} total commands`,
	});

	await message.reply({ embeds: [embed] });
};

export default { data, execute } satisfies PrefixCommand;
