'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Position', {
    PositionId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    PersonId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    CompanyId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Company',
        key: 'CompanyId'
      }
    },
    LevelId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Level',
        key: 'LevelId'
      }
    },
    LocationId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Location',
        key: 'LocationId'
      }
    },
    LinkedinId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      unique: true
    },
    Title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    LevelOther: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    StartDateMonth: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    StartDateYear: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    EndDateMonth: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    EndDateYear: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    LastActivityDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    IsCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'Position'
  });
}
