export default function(sequelize, DataTypes) {
  return sequelize.define('Opportunity', {
    OpportunityId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    OpportunityTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'OpportunityType',
        key: 'OpportunityTypeId'
      }
    },
    OpportunityFunctionId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'OpportunityFunction',
        key: 'OpportunityFunctionId'
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
    ExperienceTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'ExperienceLevel',
        key: 'ExperienceLevelId'
      }
    },
    LocationId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Location',
        key: 'LocationId'
      }
    },
    RecruiterId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    ImageId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Image',
        key: 'ImageId'
      }
    },
    Title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Responsabilities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Requirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PostDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ExpirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'Opportunity'
  });
}
