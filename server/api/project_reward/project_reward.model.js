'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('ProjectReward', {
    ProjectRewardId: {
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
    ValueInCents:{
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    RewardDescription: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    IsUpperBound: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'ProjectReward'
  });
}