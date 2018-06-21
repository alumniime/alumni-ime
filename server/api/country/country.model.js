'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Country', {
    CountryId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: true
    },
    Description: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'Country'
  });
}
