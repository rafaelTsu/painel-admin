
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

class DocxRenderService {
    /**
     * Renders a DOCX template with the provided data.
     * @param {Buffer} templateBuffer - The DOCX template as a buffer.
     * @param {Object} data - Key-value map of variables.
     * @returns {Buffer} - The rendered DOCX as a buffer.
     */
    render(templateBuffer, data) {
        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: '{{', end: '}}' },
            nullGetter: (part) => `[MISSING: ${part.value}]`
        });

        try {
            // Render the document
            doc.render(data);
            return zip.generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });
        } catch (error) {
            // Catch compilation errors (e.g., malformed template)
            const e = {
                message: error.message,
                name: error.name,
                stack: error.stack,
                properties: error.properties,
            };
            console.error('Docx render error:', JSON.stringify(e));
            throw error;
        }

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        return buf;
    }
}

export const docxRenderService = new DocxRenderService();
