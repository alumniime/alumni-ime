'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('DonatorHallCategory', {
    DonatorHallCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING(25),
      allowNull: false
    }
  }, {
    tableName: 'DonatorHallCategory'
  });
}
