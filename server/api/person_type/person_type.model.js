'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('PersonType', {
    PersonTypeId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Description: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    PortugueseDescription: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'PersonType'
  });
}
