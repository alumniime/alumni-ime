'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Engineering', {
    EngineeringId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Description: {
      type: DataTypes.STRING(100),
      allowNull: false
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
    tableName: 'Engineering'
  });
}
