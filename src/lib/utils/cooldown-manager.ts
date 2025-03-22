import { Collection } from 'discord.js';

interface CooldownInfo {
	timestamp: number;
	uses: number;
}

export class CooldownManager {
	private cooldowns: Collection<string, Collection<string, CooldownInfo>> = new Collection();

	/**
	 * Check if a user is on cooldown for a specific command
	 * @param commandName The name of the command
	 * @param userId The ID of the user
	 * @param cooldownSeconds Cooldown duration in seconds
	 * @param maxUses Maximum number of uses before cooldown (default: 1)
	 * @returns Object containing cooldown status and time remaining
	 */
	checkCooldown(
		commandName: string,
		userId: string,
		cooldownSeconds: number,
		maxUses = 1
	): { onCooldown: boolean; remainingTime: number; remainingUses: number } {
		if (!this.cooldowns.has(commandName)) {
			this.cooldowns.set(commandName, new Collection());
		}

		const now = Date.now();
		const userCooldowns = this.cooldowns.get(commandName);
		const userCooldown = userCooldowns?.get(userId);

		if (!userCooldown || now - userCooldown.timestamp >= cooldownSeconds * 1000) {
			userCooldowns?.set(userId, { timestamp: now, uses: 1 });
			return { onCooldown: false, remainingTime: 0, remainingUses: maxUses - 1 };
		}

		if (userCooldown.uses >= maxUses) {
			const expirationTime = userCooldown.timestamp + cooldownSeconds * 1000;
			const remainingTime = (expirationTime - now) / 1000;
			return { onCooldown: true, remainingTime, remainingUses: 0 };
		}

		userCooldown.uses += 1;
		return { onCooldown: false, remainingTime: 0, remainingUses: maxUses - userCooldown.uses };
	}

	resetCooldown(commandName: string, userId: string): void {
		const commandCooldowns = this.cooldowns.get(commandName);
		if (commandCooldowns) {
			commandCooldowns.delete(userId);
		}
	}

	clearAllCooldowns(): void {
		this.cooldowns.clear();
	}
}

export const cooldownManager = new CooldownManager();
