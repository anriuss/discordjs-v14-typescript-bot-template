import { SlashCommandBuilder } from "@discordjs/builders";
import {
	CommandInteraction,
	PermissionFlagsBits,
	TextChannel,
} from "discord.js";
import { fail, purge } from "../../../../lib/config/emojis";
import ms from "ms";

const MAX_MESSAGES_PER_COMMAND = 99;
const MESSAGE_DELETION_THRESHOLD = ms("14 days");

const data = new SlashCommandBuilder()
	.setName("purge")
	.setDescription("Bulk delete messages")
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.addIntegerOption((option) =>
		option
			.setName("amount")
			.setDescription("Number of messages to delete (1-99)")
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(MAX_MESSAGES_PER_COMMAND)
	);

async function execute({ interaction }: { interaction: CommandInteraction }) {
	if (!interaction.isChatInputCommand()) return;

	const limit = interaction.options.getInteger("amount");
	const channel = interaction.channel;

	if (!channel || !limit)
		return await interaction.reply({
			content: `${fail} Invalid input`,
			ephemeral: true,
		});

	if (
		!interaction.guild?.members.me?.permissions.has(
			PermissionFlagsBits.ManageMessages
		)
	) {
		return await interaction.reply({
			content: `${fail} I don't have permissions to run that command.`,
			ephemeral: true,
		});
	}

	try {
		const messages = await channel?.messages.fetch({ limit });
		const filtered = messages.filter(
			(msg) => Date.now() - msg.createdTimestamp < MESSAGE_DELETION_THRESHOLD
		);

		let responseMessage = `${purge} deleted ${filtered.size} messages.`;

		if (filtered.size === 0) {
			responseMessage = `${fail} I can't delete messages older than 14 days.`;
		} else if (messages.size !== filtered.size) {
			responseMessage += `\nI can't delete ${
				messages.size - filtered.size
			} messages because they are older than 14 days.`;
		}

		await interaction.deferReply({ ephemeral: true });
		await (channel as TextChannel).bulkDelete(filtered);
		await interaction.editReply(responseMessage);
	} catch (err) {
		await interaction.reply({
			content: `${fail} An error occurred while trying to purge messages.`,
			ephemeral: true,
		});
	}
}

export default {
	data,
	execute,
};
