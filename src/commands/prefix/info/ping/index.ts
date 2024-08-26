import { PrefixCommand } from '../../../../lib/types/discord';

const data: PrefixCommand['data'] = {
	name: 'ping',
	description: 'Replies with Pong!',
	aliases: ['p', 'pong', 'pingcmd'],
};

const execute: PrefixCommand['execute'] = async ({ message }) => {
	await message.reply('Pong!');
};

export default {
	data,
	execute,
} satisfies PrefixCommand;
