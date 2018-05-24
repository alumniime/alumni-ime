'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('NewsElement', {
    NewsElementId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Type: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    PortugueseDescription: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'NewsElement'
  });
}
