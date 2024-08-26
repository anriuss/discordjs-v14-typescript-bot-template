// For type safety
type Config = {
	PREFIX: string;
};

const config: Config = {
	PREFIX: 't!',
};

export default config;

export const PREFIX = config.PREFIX;
