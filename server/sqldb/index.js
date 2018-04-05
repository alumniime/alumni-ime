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
// db.Thing = db.sequelize.import('../api/thing/thing.model');

module.exports = db;
