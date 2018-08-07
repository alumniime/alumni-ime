'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('FormerStudent', {
    FormerStudentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    PersonId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    GraduationYear: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    EngineeringId: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      references: {
        model: 'Engineering',
        key: 'EngineeringId'
      }
    },
    LevelType: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    LevelDescription: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    Decade: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'FormerStudent'
  });
}
