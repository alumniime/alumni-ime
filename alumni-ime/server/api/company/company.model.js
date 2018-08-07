'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Company', {
    CompanyId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    LinkedinId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      unique: true
    },
    CompanyTypeId: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      references: {
        model: 'CompanyType',
        key: 'CompanyTypeId'
      }
    },
    IndustryId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Industry',
        key: 'IndustryId'
      }
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Size: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'Company'
  });
}
