'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('NewsConstruction', {
    NewsConstructionId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    NewsId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'News',
        key: 'NewsId'
      }
    },
    NewsElementId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      references: {
        model: 'NewsElement',
        key: 'NewsElementId'
      }
    },
    Value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    OrderIndex: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    IsExcluded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'NewsConstruction'
  });
}
