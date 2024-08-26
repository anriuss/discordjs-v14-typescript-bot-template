declare module 'ascii-table' {
	class AsciiTable {
		setHeading(...headings: string[]): AsciiTable;
		addRow(...row: string[]): AsciiTable;
		toString(): string;
	}

	export default function (title?: string): AsciiTable;
}
