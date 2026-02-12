import { describe, it, expect } from 'vitest';
import { docxRenderService } from '../../src/services/docx-render.service.js';
import HTMLtoDOCX from 'html-to-docx';
import mammoth from 'mammoth';

describe('DocxRenderService Reproduction', () => {

    const generateDocx = async (html) => {
        return await HTMLtoDOCX(html, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });
    };

    const extractText = async (buffer) => {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    };

    it('should fail or succeed with user expression', async () => {
        // User's exact case: {{# nome_autor == 'Rafael' }}É ele mesmo{{^}}não é ele{{/}}
        // FIX: docxtemplater requires explicit inverted section for else logic with expressions
        const templateHtml = '<p>{{# nome_autor == \'Rafael\' }}É ele mesmo{{/}}{{^ nome_autor == \'Rafael\' }}não é ele{{/}}</p>';
        const buffer = await generateDocx(templateHtml);
        
        try {
            const renderedBuffer = docxRenderService.render(buffer, { nome_autor: 'Rafael' });
            const text = await extractText(renderedBuffer);
            console.log('Rendered (Rafael):', text);
            expect(text).toContain('É ele mesmo');
            expect(text).not.toContain('não é ele');

            const renderedBuffer2 = docxRenderService.render(buffer, { nome_autor: 'Other' });
            const text2 = await extractText(renderedBuffer2);
            console.log('Rendered (Other):', text2);
            expect(text2).toContain('não é ele');
            expect(text2).not.toContain('É ele mesmo');

        } catch (e) {
            console.error('Render Error:', JSON.stringify(e, null, 2));
            throw e;
        }
    });
});
