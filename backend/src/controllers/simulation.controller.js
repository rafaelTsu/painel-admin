
import { simulationService } from '../services/simulation.service.js';
import { createSimulationSchema } from '../validations/simulation.validator.js';

class SimulationController {
    
    async createRun(req, res, next) {
        try {
            const { groupId, versionId } = req.params;
            const templateId = req.params.templateId || req.params.id;
            // Validate body
            const { error, value } = createSimulationSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const simulation = await simulationService.createRun(
                groupId, 
                templateId, 
                versionId, 
                req.user.id, 
                value.inputValues, 
                value.outputFormat
            );

            await req.audit({
                action: 'simulation.run',
                targetType: 'simulationRun',
                targetId: simulation.id,
                groupId,
                outcome: simulation.status === 'failed' ? 'failure' : 'success',
                metadata: { status: simulation.status, format: value.outputFormat }
            });

            // 201 Created or 202 Accepted. 
            // Since we ran it "sync" (in service for now), 201 is fine.
            res.status(201).json(simulation);
        } catch (err) {
            next(err);
        }
    }

    async getStatus(req, res, next) {
        try {
            const { groupId, simulationId } = req.params;
            const simulation = await simulationService.getRun(simulationId, groupId);
            res.json(simulation);
        } catch (err) {
            next(err);
        }
    }

    async download(req, res, next) {
        try {
            const { groupId, simulationId } = req.params;
            const { buffer, fileName, format } = await simulationService.getRunDownload(simulationId, groupId);

            await req.audit({
                action: 'simulation.download',
                targetType: 'simulationRun',
                targetId: simulationId,
                groupId,
                outcome: 'success',
                metadata: { fileName }
            });

            // Set headers
            const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.send(buffer);
        } catch (err) {
            next(err);
        }
    }
}

export const simulationController = new SimulationController();
