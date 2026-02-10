
import { Template, TemplateVersion, Variable, Category, CategoryVariable, Group } from '../models/index.model.js';
import { saveFile, getFile } from './storage.service.js';
import { NotFoundError, BadRequestError } from '../shared/errors.util.js';
import PizZip from 'pizzip';
import { Op } from 'sequelize';

class ImportExportService {

    async exportTemplate(templateId, groupId) {
        const template = await Template.findOne({
            where: { id: templateId, groupId },
            include: [
                { model: TemplateVersion, as: 'versions' }
            ]
        });

        if (!template) throw new NotFoundError('Template not found');

        // Gather all variables referenced by all versions (or just all in group? Spec says "export template", implies dependencies)
        // Ideally we scan versions.referencedVariableKeys.
        const variableKeys = new Set();
        template.versions.forEach(v => {
            (v.referencedVariableKeys || []).forEach(k => variableKeys.add(k));
        });

        const variables = await Variable.findAll({
            where: {
                groupId,
                key: { [Op.in]: Array.from(variableKeys) }
            },
            include: [
                {
                   model: Category,
                   as: 'categories',
                   through: { attributes: [] } 
                }
            ]
        });

        // Identify categories involved
        const categoriesMap = new Map();
        variables.forEach(v => {
            if (v.categories) {
                v.categories.forEach(c => {
                    if (!categoriesMap.has(c.name)) {
                        categoriesMap.set(c.name, {
                            name: c.name,
                            description: c.description,
                            variables: []
                        });
                    }
                    categoriesMap.get(c.name).variables.push(v.key);
                });
            }
        });

        // Manifest
        const manifest = {
            template: {
                name: template.name,
                description: template.description
            },
            variables: variables.map(v => ({
                key: v.key,
                label: v.label,
                type: v.type,
                description: v.description
            })),
            categories: Array.from(categoriesMap.values()),
            versions: []
        };

        const zip = new PizZip();

        // Add versions
        for (const v of template.versions) {
            const fileName = `v${v.versionNumber}.docx`;
            const fileBuffer = await getFile(v.docxPath);
            if (fileBuffer) {
                zip.file(fileName, fileBuffer);
                manifest.versions.push({
                    versionNumber: v.versionNumber,
                    changeNote: v.changeNote,
                    fileName,
                    referencedVariableKeys: v.referencedVariableKeys
                });
            }
        }

        zip.file('manifest.json', JSON.stringify(manifest, null, 2));

        return zip.generate({ type: 'nodebuffer' });
    }

    async importTemplate(groupId, userId, zipBuffer) {
        let zip;
        try {
            zip = new PizZip(zipBuffer);
        } catch (e) {
            throw new BadRequestError('Invalid ZIP file');
        }

        const manifestFile = zip.file('manifest.json');
        if (!manifestFile) throw new BadRequestError('Missing manifest.json');

        let manifest;
        try {
            manifest = JSON.parse(manifestFile.asText());
        } catch (e) {
            throw new BadRequestError('Invalid manifest JSON');
        }

        // 1. Ensure Variables exist or create
        for (const vDef of manifest.variables) {
            const existing = await Variable.findOne({ where: { groupId, key: vDef.key } });
            if (!existing) {
                await Variable.create({
                    groupId,
                    key: vDef.key, // Should validate key format?
                    label: vDef.label,
                    type: vDef.type,
                    description: vDef.description
                });
            }
            // If exists, skip (or update? MVP says import. existing wins usually)
        }

        // 2. Ensure Categories exist or create
        for (const cDef of manifest.categories) {
            const existing = await Category.findOne({ where: { groupId, name: cDef.name } });
            let categoryId = existing?.id;
            if (!existing) {
                const cat = await Category.create({
                    groupId,
                    name: cDef.name,
                    description: cDef.description
                });
                categoryId = cat.id;
            }
            
            // Link variables
            for (const vKey of cDef.variables) {
                const variable = await Variable.findOne({ where: { groupId, key: vKey } });
                if (variable) {
                    await CategoryVariable.findOrCreate({
                        where: { categoryId, variableId: variable.id }
                    });
                }
            }
        }

        // 3. Create Template
        // Handle name collision: append (Imported) or timestamp
        let templateName = manifest.template.name;
        let existingTemplate = await Template.findOne({ where: { groupId, name: templateName } });
        while (existingTemplate) {
            templateName = `${manifest.template.name} (Imported ${Date.now()})`; // Simple collision resolution
            existingTemplate = await Template.findOne({ where: { groupId, name: templateName } });
        }

        const template = await Template.create({
            groupId,
            name: templateName,
            description: manifest.template.description,
            createdByUserId: userId
        });

        // 4. Create Versions
        for (const vDef of manifest.versions) {
             const docxBuffer = zip.file(vDef.fileName)?.asNodeBuffer();
             if (!docxBuffer) continue; // Skip if missing

             const encodedName = `imported-${template.id}-v${vDef.versionNumber}.docx`;
             const { relativePath } = await saveFile(docxBuffer, encodedName, 'templates');
            
             await TemplateVersion.create({
                 templateId: template.id,
                 versionNumber: vDef.versionNumber, // Keep original number or resequence? Or trust manifest order.
                 changeNote: vDef.changeNote,
                 createdByUserId: userId,
                 docxPath: relativePath,
                 referencedVariableKeys: vDef.referencedVariableKeys || []
             });
        }
        
        // Update revision
        const maxV = Math.max(...manifest.versions.map(v => v.versionNumber), 0);
        await template.update({ revision: maxV });

        return template;
    }
}

export const importExportService = new ImportExportService();
