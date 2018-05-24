'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('News', {
    NewsId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    NewsCategoryId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      references: {
        model: 'NewsCategory',
        key: 'NewsCategoryId'
      }
    },
    Title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Subtitle: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    PublishDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsExcluded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'News'
  });
}
