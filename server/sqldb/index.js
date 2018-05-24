/**
 * Sequelize initialization module
 */

'use strict';

// import path from 'path';
import config from '../config/environment';
import Sequelize from 'sequelize';

var db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};

// Insert models below
db.NewsCategory = db.sequelize.import('../api/news_category/news_category.model');
db.News = db.sequelize.import('../api/news/news.model');
db.NewsElement = db.sequelize.import('../api/news_element/news_element.model');
db.NewsConstruction = db.sequelize.import('../api/news_construction/news_construction.model');
db.Donation = db.sequelize.import('../api/donation/donation.model');
db.Image = db.sequelize.import('../api/image/image.model');
db.PersonType = db.sequelize.import('../api/person_type/person_type.model');
db.Se = db.sequelize.import('../api/se/se.model');
db.Engineering = db.sequelize.import('../api/engineering/engineering.model');
db.OptionToKnowType = db.sequelize.import('../api/option_to_know_type/option_to_know_type.model');
db.User = db.sequelize.import('../api/user/user.model');
db.Project = db.sequelize.import('../api/project/project.model');
db.ProjectTeam = db.sequelize.import('../api/project_team/project_team.model');
db.ProjectSe = db.sequelize.import('../api/project_se/project_se.model');
db.Initiative = db.sequelize.import('../api/initiative/initiative.model');
db.InitiativeLink = db.sequelize.import('../api/initiative_link/initiative_link.model');

// Insert relations below
db.User.belongsTo(db.PersonType, {sourceKey: 'PersonTypeId', foreignKey: 'PersonTypeId', as: 'personType'});
db.User.belongsTo(db.Se, {sourceKey: 'SEId', foreignKey: 'ProfessorSEId', as: 'se'});
db.User.belongsTo(db.Engineering, {sourceKey: 'EngineeringId', foreignKey: 'GraduationEngineeringId', as: 'engineering'});
db.User.belongsTo(db.OptionToKnowType, {sourceKey: 'OptionToKnowThePageId', foreignKey: 'OptionTypeId', as: 'optionToKnowType'});
db.User.hasMany(db.InitiativeLink, {foreignKey: 'PersonId', as: 'userInitiativeLinks'});

db.Project.belongsTo(db.User, {sourceKey: 'PersonId', foreignKey: 'SubmissionerId', as: 'submissioner'});
db.Project.belongsTo(db.User, {sourceKey: 'PersonId', foreignKey: 'LeaderId', as: 'leader'});
db.Project.belongsTo(db.User, {sourceKey: 'PersonId', foreignKey: 'ProfessorId', as: 'professor'});
db.Project.belongsTo(db.Se, {sourceKey: 'SEId', foreignKey: 'ProjectSEId', as: 'se'});
db.Project.hasMany(db.Image, {foreignKey: 'ProjectId', as: 'images'});
db.Project.hasMany(db.Donation, {foreignKey: 'ProjectId', as: 'donations'});

db.News.belongsTo(db.NewsCategory, {sourceKey: 'NewsCategoryId', foreignKey: 'NewsCategoryId', as: 'category'});
db.News.hasMany(db.NewsConstruction, {foreignKey: 'NewsId', as: 'constructions'});

db.NewsConstruction.belongsTo(db.NewsElement, {sourceKey: 'NewsElementId', foreignKey: 'NewsElementId', as: 'element'});
db.NewsConstruction.hasMany(db.Image, {foreignKey: 'NewsConstructionId', as: 'images'});

db.Donation.belongsTo(db.User, {sourceKey: 'PersonId', foreignKey: 'DonatorId', as: 'donator'});
db.Donation.belongsTo(db.Project, {sourceKey: 'ProjectId', foreignKey: 'ProjectId', as: 'project'});
db.Donation.belongsTo(db.Image, {sourceKey: 'ImageId', foreignKey: 'TransferVoucherId', as: 'transferVoucher'});

module.exports = db;
