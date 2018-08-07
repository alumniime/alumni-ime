'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('ProjectSe', {
    ProjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Project',
        key: 'ProjectId'
      }
    },
    SEId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'SE',
        key: 'SEId'
      }
    }
  }, {
    tableName: 'ProjectSE'
  });
}
