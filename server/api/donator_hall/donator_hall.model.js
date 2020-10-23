'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('DonatorHall', {
    DonatorHallId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DonatorId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    FormerStudentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'FormerStudent',
        key: 'FormerStudentId'
      }
    },
    PersonTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'PersonType',
        key: 'PersonTypeId'
      }
    },
    CategoryId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'DonatorHallCategory',
        key: 'DonatorHallCategoryId'
      }
    },
    DonatorName: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    Year: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    IsAnonymous: {
      type: DataTypes.BOOLEAN
    },
    IsCompany: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    ExternalURL: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ImgPath: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'DonatorHall'
  });
}
