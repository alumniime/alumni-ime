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
      type: 'BLOB',
      allowNull: true
    },
    Timestamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Image'
  });
}
