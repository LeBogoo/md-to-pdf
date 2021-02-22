import test, { before } from 'ava';
import { readFileSync, unlinkSync } from 'fs';
import { basename, resolve } from 'path';
import { getDocument } from 'pdfjs-dist/es5/build/pdf';
import { mdToPdf } from '..';

before(() => {
	const filesToDelete = [resolve(__dirname, 'basic', 'api-test.pdf'), resolve(__dirname, 'basic', 'api-test.html')];

	for (const file of filesToDelete) {
		try {
			unlinkSync(file);
		} catch (error) {
			if ((error as { code: string }).code !== 'ENOENT') {
				throw error;
			}
		}
	}
});

test('should compile the basic example to pdf', async (t) => {
	const pdf = await mdToPdf({ path: resolve(__dirname, 'basic', 'test.md') });

	t.is(pdf.filename, '');
	t.truthy(pdf.content);
});

test('should compile the basic example to pdf and write to disk', async (t) => {
	const pdf = await mdToPdf(
		{ path: resolve(__dirname, 'basic', 'test.md') },
		{ dest: resolve(__dirname, 'basic', 'api-test.pdf') },
	);

	t.is(basename(pdf.filename!), 'api-test.pdf');

	t.notThrows(() => readFileSync(resolve(__dirname, 'basic', 'api-test.pdf'), 'utf-8'));
});

test('should compile the basic example to html and write to disk', async (t) => {
	const pdf = await mdToPdf(
		{ path: resolve(__dirname, 'basic', 'test.md') },
		{ dest: resolve(__dirname, 'basic', 'api-test.html'), as_html: true },
	);

	t.is(basename(pdf.filename!), 'api-test.html');

	t.notThrows(() => readFileSync(resolve(__dirname, 'basic', 'api-test.html'), 'utf-8'));
});

test('compile the MathJax test', async (t) => {
	const pdf = await mdToPdf({ path: resolve(__dirname, 'mathjax', 'math.md') });

	t.is(pdf.filename, '');
	t.truthy(pdf.content);

	const doc = await getDocument({ data: pdf.content }).promise;
	const page = await doc.getPage(1);
	const text = (await page.getTextContent()).items.map(({ str }) => str).join('');

	t.true(text.startsWith('Formulas with MathJax'));
	t.true(text.includes('a≠0'));
});

