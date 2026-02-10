import { Template, TemplateVersion, Variable, GroupVariable } from '../models/index.model.js';
import { ConflictError, NotFoundError, BadRequestError } from '../shared/errors.util.js';
import { paginate } from '../shared/pagination.util.js';
import { Op } from 'sequelize';
import PizZip from 'pizzip';
import { saveFile, getFile } from './storage.service.js';
import mammoth from 'mammoth';
import HTMLtoDOCX from 'html-to-docx'; // Standard import might require tweaking for ESM/CJS compatibility? default export usually works.


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
        
        // 1. naive strip tags to handle split runs like {<w:t>foo</w:t>}
        // Note: This matches text content. 
        // Docxtemplater actually usually needs the logic in the XML, but for *detection* of keys, plain text is often "good enough" for MVP.
        const text = docXml.replace(/<[^>]+>/g, '');

        // 2. Regex to match:
        // {{ key }}
        // { key }
        // {#key}, {^key}, {/key}
        // Match: 1 or 2 open braces, optional whitespace, CAPTURE MODIFIER (#, ^, /), optional whitespace, CAPTURE KEY, optional whitespace, 1 or 2 close braces
        const regex = /\{{1,2}\s*([#^\/]?)\s*([a-zA-Z0-9_]+)\s*\}{1,2}/g;
        
        const variables = new Map(); // key -> type ('text' or 'boolean')
        let match;
        while ((match = regex.exec(text)) !== null) {
            const modifier = match[1];
            const key = match[2];

            // Filter out internal numeric/nonsense keys if any
            if (key.length > 1) { 
                if (!variables.has(key)) {
                     variables.set(key, 'text');
                }
                // If it is used as a section/condition, mark as boolean
                if (modifier === '#' || modifier === '^') {
                    variables.set(key, 'boolean');
                }
            }
        }
        return variables;
    } catch (e) {
        console.warn("Error parsing docx for variables", e);
        return new Map(); // Don't block upload if parsing fails
    }
};

export const createVersion = async (templateId, groupId, userId, fileBuffer, originalName, changeNote) => {
    const template = await Template.findOne({ where: { id: templateId, groupId } });
    if (!template) throw new NotFoundError('Template not found');

    // Extract variables
    const variablesMap = extractVariablesFromDocxBuffer(fileBuffer);
    const validKeys = Array.from(variablesMap.keys()).filter(k => k !== 'params'); // filter reserved words if any

    if (validKeys.length > 0) {
        // 1. Find all variables matching these keys (Globally)
        const existingVars = await Variable.findAll({
            where: { key: { [Op.in]: validKeys } }
        });
        
        const existingMap = new Map();
        existingVars.forEach(v => existingMap.set(v.key, v));
        
        for (const key of validKeys) {
            let variable = existingMap.get(key);
            
            if (!variable) {
                 // Create new Global
                 try {
                     const type = variablesMap.get(key) || 'text';
                     variable = await Variable.create({
                        groupId: null,
                        key,
                        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                        type,
                        description: 'Auto-created from template upload'
                     });
                 } catch (e) {
                      // Race condition handling
                      variable = await Variable.findOne({ where: { key } });
                 }
            }
            
            if (variable && groupId) {
                 // Ensure Association
                 try {
                    await GroupVariable.findOrCreate({ where: { groupId, variableId: variable.id } });
                 } catch (e) { console.warn("Failed to associate variable", e); }
            }
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
        referencedVariableKeys: validKeys,
        logicDefinition: {} // Placeholder for future logic
    });

    // Update template revision/timestamp if desired
    await template.update({ revision: nextVersion });

    return version;
};

export const createVersionFromHtml = async (templateId, groupId, userId, htmlContent, changeNote) => {
    // 1. Convert HTML to DOCX Buffer
    const fileBuffer = await HTMLtoDOCX(htmlContent, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true
    });
    
    // 2. Reuse createVersion to handle variables parsing and saving
    return createVersion(templateId, groupId, userId, fileBuffer, 'editor-export.docx', changeNote || 'Web editor update');
};

export const getVersionHtml = async (templateId, versionId, groupId) => {
    // Check access
    const template = await Template.findOne({ where: { id: templateId, groupId } });
    if (!template) throw new NotFoundError('Template not found');

    const version = await TemplateVersion.findOne({ where: { id: versionId, templateId } });
    if (!version) throw new NotFoundError('Version not found');

    const buffer = await getFile(version.docxPath);
    if (!buffer) throw new NotFoundError('File content missing');

    const result = await mammoth.convertToHtml({ buffer });
    return result.value;
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
