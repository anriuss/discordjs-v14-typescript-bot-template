import fs from "fs";
import path from "path";

export const getEventFiles = (dir: string): string[] => {
	let results: string[] = [];
	const list = fs.readdirSync(dir);

	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat && stat.isDirectory()) {
			results = results.concat(getEventFiles(filePath));
		} else if (file.endsWith(".ts")) {
			results.push(filePath);
		}
	});

	return results;
};
