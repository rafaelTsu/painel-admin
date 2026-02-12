import { describe, it, expect } from 'vitest';
import { docxRenderService } from '../../src/services/docx-render.service.js';
import HTMLtoDOCX from 'html-to-docx';
import mammoth from 'mammoth';

describe('DocxRenderService Integration', () => {

    const generateDocx = async (html) => {
        // Basic configuration for html-to-docx
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

    it('should render simple variable replacement', async () => {
        const templateHtml = '<p>Hello {{name}}</p>';
        const buffer = await generateDocx(templateHtml);
        
        const renderedBuffer = docxRenderService.render(buffer, { name: 'World' });
        const text = await extractText(renderedBuffer);
        
        expect(text).toContain('Hello World');
    });

    it('should render IF condition (true)', async () => {
        const templateHtml = '<p>{{# show }}Visible{{/}}</p>';
        const buffer = await generateDocx(templateHtml);
        
        const renderedBuffer = docxRenderService.render(buffer, { show: true });
        const text = await extractText(renderedBuffer);
        
        expect(text).toContain('Visible');
    });

    it('should hide IF condition (false)', async () => {
        const templateHtml = '<p>{{# show }}Visible{{/}}</p>';
        const buffer = await generateDocx(templateHtml);
        
        const renderedBuffer = docxRenderService.render(buffer, { show: false });
        const text = await extractText(renderedBuffer);
        
        expect(text).not.toContain('Visible');
    });

    it('should render IF/ELSE condition', async () => {
        // html-to-docx might normalize spaces, so keep it simple
        // Using explicit inverted section to ensure test reliability with html-to-docx
        const templateHtml = '<p>{{# condition }}TruePath{{/ condition }}{{^ condition }}FalsePath{{/ condition }}</p>';
        const buffer = await generateDocx(templateHtml);
        
        // Test True
        let rendered = docxRenderService.render(buffer, { condition: true });
        let text = await extractText(rendered);
        expect(text).toContain('TruePath');
        expect(text).not.toContain('FalsePath');

        // Test False
        rendered = docxRenderService.render(buffer, { condition: false });
        text = await extractText(rendered);
        expect(text).toContain('FalsePath');
        expect(text).not.toContain('TruePath');
    });

    it('should evaluate complex expressions (equality)', async () => {
        const templateHtml = '<p>{{# user.role == "admin" }}Admin{{/}}</p>';
        const buffer = await generateDocx(templateHtml);
        
        // Test Match
        let rendered = docxRenderService.render(buffer, { user: { role: 'admin' } });
        let text = await extractText(rendered);
        expect(text).toContain('Admin');

        // Test No Match
        rendered = docxRenderService.render(buffer, { user: { role: 'user' } });
        text = await extractText(rendered);
        expect(text).not.toContain('Admin');
    });

    it('should evaluate comparisons (greater than)', async () => {
        const templateHtml = '<p>{{# price > 100 }}Expensive{{/}}</p>';
        const buffer = await generateDocx(templateHtml);
        
        let rendered = docxRenderService.render(buffer, { price: 150 });
        let text = await extractText(rendered);
        expect(text).toContain('Expensive');

        rendered = docxRenderService.render(buffer, { price: 50 });
        text = await extractText(rendered);
        expect(text).not.toContain('Expensive');
    });
});
