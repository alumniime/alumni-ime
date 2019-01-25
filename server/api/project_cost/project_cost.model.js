'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('ProjectCost', {
    ProjectCostId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Project',
        key: 'ProjectId'
      }
    },
    CostDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Quantity: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    UnitPriceInCents: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    IsExcluded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'ProjectCost'
  });
}