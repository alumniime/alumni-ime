'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Initiative', {
    InitiativeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Description: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'Initiative'
  });
}
