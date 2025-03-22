import path from 'path';
import { PrefixCommand, SlashCommand } from '../types/discord';

/**
 * Get the category of a command based on its file path
 * @param commandPath The full path to the command file
 * @returns The category name extracted from the path
 */
export function getCategoryFromPath(commandPath: string): string {
	const parts = commandPath.split(path.sep);
	const commandsIndex = parts.findIndex(
		part => part === 'commands' || part === 'slash' || part === 'prefix'
	);

	if (commandsIndex !== -1 && parts.length > commandsIndex + 1) {
		return parts[commandsIndex + 1];
	}

	return 'General';
}

/**
 * Organize commands into categories
 * @param commands Map of commands
 * @returns Map of categories with their commands
 */
export function categorizeCommands<T extends SlashCommand | PrefixCommand>(
	commands: Map<string, T>
): Map<string, T[]> {
	const categories = new Map<string, T[]>();

	commands.forEach((command, name) => {
		const category = name.includes('/') ? name.split('/')[0] : 'General';

		if (!categories.has(category)) {
			categories.set(category, []);
		}

		categories.get(category)?.push(command);
	});

	return categories;
}

/**
 * Format cooldown information for display
 * @param command Command with potential cooldown info
 * @returns Formatted string with cooldown details
 */
export function formatCooldownInfo(command: SlashCommand | PrefixCommand): string {
	if ('cooldown' in command) {
		return command.cooldown
			? `Cooldown: ${command.cooldown}s (${command.maxUses || 1} uses)`
			: 'No cooldown';
	}

	if (command.data?.cooldown) {
		return `Cooldown: ${command.data.cooldown}s (${command.data.maxUses || 1} uses)`;
	}

	return 'No cooldown';
}
