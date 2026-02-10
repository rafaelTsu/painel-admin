import * as templateService from '../services/template.service.js';
import { importExportService } from '../services/import-export.service.js';
import { BadRequestError } from '../shared/errors.util.js';
import { createTemplateSchema, createVersionSchema } from '../validations/template.validator.js';

export const createTemplate = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const value = await createTemplateSchema.validateAsync(req.body);
        const template = await templateService.createTemplate(groupId, req.user.id, value);
        await req.audit({ action: 'template.create', targetType: 'template', targetId: template.id, groupId: groupId, outcome: 'success' });
        res.status(201).json(template);
    } catch (err) { next(err); }
};

export const listTemplates = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { page, limit, search } = req.query;
        const result = await templateService.listTemplates(groupId, { page, limit, search });
        res.json(result);
    } catch (err) { next(err); }
};

export const getTemplate = async (req, res, next) => {
    try {
        const { groupId, id } = req.params;
        const template = await templateService.getTemplate(id, groupId);
        res.json(template);
    } catch (err) { next(err); }
};

export const createVersion = async (req, res, next) => {
    try {
        const { groupId, id } = req.params;
        const value = await createVersionSchema.validateAsync(req.body);
        const file = req.file;

        if (!file) throw new BadRequestError('File is required');
        
        const version = await templateService.createVersion(
            id, 
            groupId, 
            req.user.id, 
            file.buffer, 
            file.originalname, 
            value.changeNote
        );
        await req.audit({ action: 'template.version.create', targetType: 'templateVersion', targetId: version.id, groupId: groupId, outcome: 'success', metadata: { templateId: id, version: version.versionNumber } });
        res.status(201).json(version);
    } catch (err) { next(err); }
};

export const listVersions = async (req, res, next) => {
    try {
         const { groupId, id } = req.params;
         const versions = await templateService.listVersions(id, groupId);
         res.json(versions);
    } catch (err) { next(err); }
};

export const exportTemplate = async (req, res, next) => {
    try {
        const { groupId, id } = req.params;
        const zipBuffer = await importExportService.exportTemplate(id, groupId);
        
        await req.audit({ action: 'template.export', targetType: 'template', targetId: id, groupId, outcome: 'success' });

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="template-export-${id}.zip"`);
        res.send(zipBuffer);
    } catch (e) { next(e); }
};

export const getVersionHtml = async (req, res, next) => {
    try {
        const { groupId, id, versionId } = req.params;
        const html = await templateService.getVersionHtml(id, versionId, groupId);
        res.json({ html });
    } catch (e) { next(e); }
};

export const createVersionFromHtml = async (req, res, next) => {
    try {
        const { groupId, id } = req.params;
        const { html, changeNote } = req.body;
        
        if (!html) throw new BadRequestError('HTML content required');

        const version = await templateService.createVersionFromHtml(id, groupId, req.user.id, html, changeNote);
        
        await req.audit({ action: 'template.version.create.html', targetType: 'templateVersion', targetId: version.id, groupId, outcome: 'success' });
        
        res.status(201).json(version);
    } catch (e) { next(e); }
};

export const importTemplate = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const file = req.file;
        if (!file) throw new BadRequestError('File is required');

        const template = await importExportService.importTemplate(groupId, req.user.id, file.buffer);

        await req.audit({ action: 'template.import', targetType: 'template', targetId: template.id, groupId: groupId, outcome: 'success' });

        res.status(201).json(template);
    } catch (e) { next(e); }
};
