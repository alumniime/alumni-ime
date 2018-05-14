'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('Project', {
    ProjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProjectName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    TeamName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    SubmissionerId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    ProfessorId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    LeaderId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    TeamMembers: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    StudentsNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    EstimatedPriceInCents: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Abstract: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Goals: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Benefits: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Schedule: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ConclusionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    SubmissionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    IsExcluded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'Project'
  });
}
