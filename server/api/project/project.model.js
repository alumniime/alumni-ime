'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Project', {
    ProjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProjectName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    TeamName: {
      type: DataTypes.STRING(100),
      allowNull: false
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
    StudentsNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    EstimatedPriceInCents: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Abstract: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Goals: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Benefits: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Schedule: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ConclusionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    SubmissionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsExcluded: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'Project'
  });
}
