'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Engineering', {
    EngineeringId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    SEId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      references: {
        model: 'SE',
        key: 'SEId'
      }
    },
    Description: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Legend: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'Engineering'
  });
}
