import User from './user.model.js';
import Group from './group.model.js';
import Membership from './membership.model.js';
import AuditEvent from './audit-event.model.js';
import Variable from './variable.model.js';
import Category from './category.model.js';
import CategoryVariable from './category-variable.model.js';
import GroupVariable from './group-variable.model.js';
import GroupCategory from './group-category.model.js';
import Template from './template.model.js';
import TemplateVersion from './template-version.model.js';
import SimulationRun from './simulation-run.model.js';
import GeneratedDocument from './generated-document.model.js';

// User <-> Membership <-> Group
User.hasMany(Membership, { foreignKey: 'userId', as: 'memberships' });
Membership.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Group.hasMany(Membership, { foreignKey: 'groupId', as: 'memberships' });
Membership.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

// Many-to-Many through Membership
User.belongsToMany(Group, { through: Membership, foreignKey: 'userId', as: 'groups' });
Group.belongsToMany(User, { through: Membership, foreignKey: 'groupId', as: 'users' });

// AuditEvent
User.hasMany(AuditEvent, { foreignKey: 'actorUserId' });
AuditEvent.belongsTo(User, { foreignKey: 'actorUserId' });

// Variable (Updated to Many-to-Many)
Group.belongsToMany(Variable, { through: GroupVariable, foreignKey: 'groupId', as: 'variables' });
Variable.belongsToMany(Group, { through: GroupVariable, foreignKey: 'variableId', as: 'groups' });

// Category (Updated to Many-to-Many)
Group.belongsToMany(Category, { through: GroupCategory, foreignKey: 'groupId', as: 'categories' });
Category.belongsToMany(Group, { through: GroupCategory, foreignKey: 'categoryId', as: 'groups' });

// Category <-> Variable
Category.belongsToMany(Variable, { through: CategoryVariable, foreignKey: 'categoryId', otherKey: 'variableId', as: 'variables' });
Variable.belongsToMany(Category, { through: CategoryVariable, foreignKey: 'variableId', otherKey: 'categoryId', as: 'categories' });

// Template
Group.hasMany(Template, { foreignKey: 'groupId', as: 'templates' });
Template.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });
User.hasMany(Template, { foreignKey: 'createdByUserId', as: 'createdTemplates' });
Template.belongsTo(User, { foreignKey: 'createdByUserId', as: 'creator' });

// TemplateVersion
Template.hasMany(TemplateVersion, { foreignKey: 'templateId', as: 'versions' });
TemplateVersion.belongsTo(Template, { foreignKey: 'templateId', as: 'template' });
User.hasMany(TemplateVersion, { foreignKey: 'createdByUserId', as: 'createdVersions' });
TemplateVersion.belongsTo(User, { foreignKey: 'createdByUserId', as: 'creator' });

// SimulationRun
Group.hasMany(SimulationRun, { foreignKey: 'groupId', as: 'simulationRuns' });
SimulationRun.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

Template.hasMany(SimulationRun, { foreignKey: 'templateId', as: 'simulationRuns' });
SimulationRun.belongsTo(Template, { foreignKey: 'templateId', as: 'template' });

TemplateVersion.hasMany(SimulationRun, { foreignKey: 'templateVersionId', as: 'simulationRuns' });
SimulationRun.belongsTo(TemplateVersion, { foreignKey: 'templateVersionId', as: 'version' });

User.hasMany(SimulationRun, { foreignKey: 'requestedByUserId', as: 'requestedSimulations' });
SimulationRun.belongsTo(User, { foreignKey: 'requestedByUserId', as: 'requester' });

// GeneratedDocument
SimulationRun.hasMany(GeneratedDocument, { foreignKey: 'simulationRunId', as: 'generatedDocuments' });
GeneratedDocument.belongsTo(SimulationRun, { foreignKey: 'simulationRunId', as: 'simulationRun' });

export {
  User,
  Group,
  Membership,
  AuditEvent,
  Variable,
  Category,
  CategoryVariable,
  GroupVariable,
  GroupCategory,
  Template,
  TemplateVersion,
  SimulationRun,
  GeneratedDocument
};
