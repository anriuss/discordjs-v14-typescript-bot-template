type Config = { PREFIX: string };

const config = { PREFIX: '$' } satisfies Config;

export default config;

export const PREFIX = config.PREFIX;
