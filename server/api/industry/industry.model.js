'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Industry', {
    IndustryId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Description: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true
    },
    PortugueseDescription: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true
    },
    Segments: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'Industry'
  });
}
