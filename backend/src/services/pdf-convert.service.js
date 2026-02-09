
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

class PdfConvertService {
    /**
     * Converts a DOCX buffer to PDF buffer using LibreOffice.
     * @param {Buffer} docxBuffer 
     * @returns {Promise<Buffer>}
     */
    async convertDocxToPdf(docxBuffer) {
        // Create unique temp directory
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'admin-panel-pdf-'));
        const inputPath = path.join(tempDir, 'document.docx');
        const outputFilename = 'document.pdf';
        const outputPath = path.join(tempDir, outputFilename);

        try {
            await fs.writeFile(inputPath, docxBuffer);

            // Execute LibreOffice conversion
            // This requires libreoffice to be installed in the environment
            await execAsync(`libreoffice --headless --convert-to pdf --outdir "${tempDir}" "${inputPath}"`);

            // Verify output exists and read it
            try {
                await fs.access(outputPath);
            } catch (e) {
                throw new Error('LibreOffice failed to generate PDF.');
            }

            const pdfBuffer = await fs.readFile(outputPath);
            return pdfBuffer;
        } catch (error) {
            console.error('PDF Convert Error:', error);
            throw error;
        } finally {
            // Cleanup temp directory
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (e) {
                console.warn('Failed to cleanup temp dir:', tempDir);
            }
        }
    }
}

export const pdfConvertService = new PdfConvertService();
