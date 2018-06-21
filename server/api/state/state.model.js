'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('State', {
    StateId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    CountryId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Country',
        key: 'CountryId'
      }
    },
    Code: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    Description: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'State'
  });
}
