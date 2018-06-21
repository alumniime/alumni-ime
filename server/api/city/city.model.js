'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('City', {
    CityId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    StateId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'State',
        key: 'StateId'
      }
    },
    IBGEId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      unique: true
    },
    Description: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'City'
  });
}
