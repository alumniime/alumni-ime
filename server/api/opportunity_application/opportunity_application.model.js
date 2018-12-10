export default function(sequelize, DataTypes) {
  return sequelize.define('OpportunityApplication', {
    OpportunityId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Opportunity',
        key: 'OpportunityId'
      }
    },
    PersonId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    ResumeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Image',
        key: 'ImageId'
      }
    },
    LinkedinLink: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ApplicationDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'OpportunityApplication'
  });
}
