'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('CompanyType', {
    CompanyTypeId: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      primaryKey: true
    },
    Description: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    PortugueseDescription: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'CompanyType'
  });
}
