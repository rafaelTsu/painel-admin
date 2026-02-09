
import { SimulationRun, GeneratedDocument, TemplateVersion, Template } from '../models/index.model.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../shared/errors.util.js';
import { saveFile, getFile } from './storage.service.js';
import { docxRenderService } from './docx-render.service.js';
import { pdfConvertService } from './pdf-convert.service.js';
import crypto from 'crypto';

class SimulationService {
    async createRun(groupId, templateId, versionId, userId, inputValues, outputFormat) {
        // 1. Verify TemplateVersion and Template exist and belong to group
        const version = await TemplateVersion.findOne({
            where: { id: versionId, templateId },
            include: [{
                model: Template,
                as: 'template',
                where: { groupId }
            }]
        });

        if (!version) {
            throw new NotFoundError('Template version not found or does not belong to group.');
        }

        // Check input variables coverage
        const providedKeys = Object.keys(inputValues);
        const missing = (version.referencedVariableKeys || []).filter(k => !providedKeys.includes(k));
        if (missing.length > 0) {
             throw new BadRequestError(`Missing input values for variables: ${missing.join(', ')}`);
        }

        // 2. Create SimulationRun record (queued/running)
        const simulation = await SimulationRun.create({
            groupId,
            templateId,
            templateVersionId: versionId,
            requestedByUserId: userId,
            status: 'running',
            outputFormat,
            inputValues,
            startedAt: new Date()
        });

        // 3. Process Logic (Usually background, doing inline for MVP)
        // We catch errors to update status to failed
        try {
            // Fetch template file
            const templateBuffer = await getFile(version.docxPath);
            
            // Render
            let outputBuffer = docxRenderService.render(templateBuffer, inputValues);
            let fileExtension = 'docx';
            let mediaType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            if (outputFormat === 'pdf') {
                outputBuffer = await pdfConvertService.convertDocxToPdf(outputBuffer);
                fileExtension = 'pdf';
                mediaType = 'application/pdf';
            }

            // Save Generated File
            const tempName = `sim.${fileExtension}`;
            const { relativePath, filename: storedName } = await saveFile(outputBuffer, tempName, 'simulations');
            
            const byteSize = outputBuffer.length;
            const sha256 = crypto.createHash('sha256').update(outputBuffer).digest('hex');

            // Create GeneratedDocument
            await GeneratedDocument.create({
                simulationRunId: simulation.id,
                format: outputFormat,
                fileName: storedName, // Stored name
                filePath: relativePath,
                byteSize,
                sha256
            });

            // Update Run Status
            await simulation.update({
                status: 'succeeded',
                finishedAt: new Date()
            });
            
            return simulation;

        } catch (error) {
            console.error('Simulation Failed:', error);
            await simulation.update({
                status: 'failed',
                errorMessage: error.message,
                finishedAt: new Date()
            });
            // We verify if we should throw or just return the failed simulation
            // Usually we return the simulation object which shows failed status.
            return simulation;
        }
    }

    async getRun(simulationId, groupId) {
        const simulation = await SimulationRun.findOne({
            where: { id: simulationId, groupId },
            include: [{ model: GeneratedDocument, as: 'generatedDocuments' }]
        });

        if (!simulation) {
            throw new NotFoundError('Simulation run not found.');
        }
        return simulation;
    }

    async getRunDownload(simulationId, groupId) {
        const simulation = await this.getRun(simulationId, groupId);
        
        if (simulation.status !== 'succeeded') {
            throw new ValidationError('Simulation is not succeeded.');
        }

        const doc = simulation.generatedDocuments[0]; // Assuming single doc for now
        if (!doc) {
            throw new NotFoundError('Generated document not found.');
        }

        const buffer = await getFile(doc.filePath);
        return { buffer, fileName: doc.fileName, format: doc.format };
    }
}

export const simulationService = new SimulationService();
