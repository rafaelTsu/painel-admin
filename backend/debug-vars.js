import { sequelize } from './src/db/sequelize.db.js';
import { TemplateVersion, Template } from './src/models/index.model.js';

const check = async () => {
    try {
        // Find the template named 'Contestação' or similar
        const template = await Template.findOne({ 
            where: { name: 'Contestação' }
        });

        if (!template) {
            console.log("Template 'Contestação' not found.");
            return;
        }

        console.log(`Found Template: ${template.name} (${template.id})`);

        // Get latest version
        const version = await TemplateVersion.findOne({
            where: { templateId: template.id },
            order: [['versionNumber', 'DESC']]
        });

        if (!version) {
            console.log("No versions found.");
            return;
        }

        console.log(`Latest Version: v${version.versionNumber}`);
        console.log(`Referenced Variables: ${JSON.stringify(version.referencedVariableKeys)}`);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

check();
