'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('SE', {
    SEId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Description: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'SE'
  });
}
