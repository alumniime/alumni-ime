'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('ProjectTeam', {
    ProjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Project',
        key: 'ProjectId'
      }
    },
    PersonId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    }
  }, {
    tableName: 'ProjectTeam'
  });
}
