import { parse, resolve } from 'path';
import { PDFOptions } from 'puppeteer';
import { readFile } from './read-file';

/**
 * Get the directory that a file is in.
 */
export const getDir = (filePath: string) => resolve(parse(filePath).dir);

/**
 * Get a margin object from a CSS-like margin string.
 */
export const getMarginObject = (margin: string): PDFOptions['margin'] => {
	if (typeof margin !== 'string') {
		throw new TypeError(`margin needs to be a string.`);
	}

	const [top, right, bottom, left, ...remaining] = margin.split(' ');

	if (remaining.length > 0) {
		throw new Error(`invalid margin input "${margin}": can have max 4 values.`);
	}

	return left
		? { top, right, bottom, left }
		: bottom
		? { top, right, bottom, left: right }
		: right
		? { top, right, bottom: top, left: right }
		: top
		? { top, right: top, bottom: top, left: top }
		: undefined;
};

export const processIncludes = async (raw: string, encoding = 'utf-8'): Promise<string> => {
	// find every include statement -> <!-- include: path/to/file -->
	const includeRegex = /<!--\s*include:\s*([^\s]+)\s*-->/g;
	const includes = raw.match(includeRegex);

	if (!includes) {
		return raw;
	}

	// replace every include statement with the file content
	for (const include of includes) {
		const filePath = include.replace(/<!--\s*include:\s*([^\s]+)\s*-->/, '$1');
		const fileContent = await processIncludes(await readFile(filePath, encoding), encoding);
		raw = raw.replace(include, fileContent);
	}

	return raw;
};
