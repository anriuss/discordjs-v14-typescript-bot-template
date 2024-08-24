import { z } from "zod";
import { fail } from "./src/lib/config/emojis";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	DISCORD_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	MONGO_DB_URI: z.string().url(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error(`${fail} Invalid environment variables:`, parsedEnv.error.format());
	process.exit(1);
}

export const env = parsedEnv.data;
