import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	DISCORD_TOKEN: z.string(),
	DISCORD_CLIENT_ID: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	process.exit(1);
}

export const env = parsedEnv.data;
