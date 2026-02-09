import { Template, TemplateVersion, Variable } from '../models/index.model.js';
import { ConflictError, NotFoundError, BadRequestError } from '../shared/errors.util.js';
import { paginate } from '../shared/pagination.util.js';
import { Op } from 'sequelize';
import PizZip from 'pizzip';
import { saveFile } from './storage.service.js';

export const createTemplate = async (groupId, userId, data) => {
    const existing = await Template.findOne({ where: { groupId, name: data.name } });
    if (existing) throw new ConflictError(`Template '${data.name}' already exists in this group`);

    return Template.create({
        ...data,
        groupId,
        createdByUserId: userId
    });
};

export const listTemplates = async (groupId, { page = 1, limit = 20, search }) => {
    const where = { groupId };
    if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
    }

    // Include latest version info? or just simple list
    return paginate(Template, { page, limit }, { 
        where, 
        order: [['updatedAt', 'DESC']]
    });
};

export const getTemplate = async (id, groupId) => {
     const template = await Template.findOne({ where: { id, groupId } });
     if (!template) throw new NotFoundError('Template not found');
     return template;
}

const extractVariablesFromDocxBuffer = (buffer) => {
    try {
        const zip = new PizZip(buffer);
        const docXml = zip.file("word/document.xml").asText();
        // Simple regex for {{ tag }}
        // Match {{ key }} or { key }
        const regex = /\{{1,2}\s*([a-zA-Z0-9_]+)\s*\}{1,2}/g;
        const matches = new Set();
        let match;
        while ((match = regex.exec(docXml)) !== null) {
            matches.add(match[1]);
        }
        return Array.from(matches);
    } catch (e) {
        throw new BadRequestError('Invalid DOCX file');
    }
};

export const createVersion = async (templateId, groupId, userId, fileBuffer, originalName, changeNote) => {
    const template = await Template.findOne({ where: { id: templateId, groupId } });
    if (!template) throw new NotFoundError('Template not found');

    // Extract variables
    const keys = extractVariablesFromDocxBuffer(fileBuffer);

    // Validate variables exist in group
    if (keys.length > 0) {
        const variables = await Variable.findAll({
            where: {
                groupId,
                key: { [Op.in]: keys }
            }
        });
        
        const foundKeys = variables.map(v => v.key);
        const missing = keys.filter(k => !foundKeys.includes(k));
        
        if (missing.length > 0) {
            throw new BadRequestError(`Referenced variables not defined in group: ${missing.join(', ')}`);
        }
    }

    // Save file
    const { relativePath } = await saveFile(fileBuffer, originalName, 'templates');

    // Create version
    // Calculate new version number: max + 1
    const maxVersion = await TemplateVersion.max('versionNumber', { where: { templateId } }) || 0;
    const nextVersion = maxVersion + 1;

    const version = await TemplateVersion.create({
        templateId,
        versionNumber: nextVersion,
        changeNote,
        createdByUserId: userId,
        docxPath: relativePath,
        referencedVariableKeys: keys,
        logicDefinition: {} // Placeholder for future logic
    });

    // Update template revision/timestamp if desired
    await template.update({ revision: nextVersion });

    return version;
};

export const listVersions = async (templateId, groupId) => {
     // Check access
    const template = await Template.findOne({ where: { id: templateId, groupId } });
    if (!template) throw new NotFoundError('Template not found');

    return TemplateVersion.findAll({
        where: { templateId },
        order: [['versionNumber', 'DESC']]
    });
};
