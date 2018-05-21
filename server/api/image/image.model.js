'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Image', {
    ImageId: {
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
    Path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Type: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    Data: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    OrderIndex: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    Timestamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsExcluded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'Image'
  });
}
