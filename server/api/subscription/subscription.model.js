export default function(sequelize, DataTypes) {
  return sequelize.define('Subscription', {
    SubscriptionId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    PlanId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Plan',
        key: 'PlanId'
      }
    },
    SubscriberId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Customer',
        key: 'PersonId'
      }
    },
    CustomerId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Customer',
        key: 'CustomerId'
      }
    },
    ProjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Project',
        key: 'ProjectId'
      }
    },
    CardBrand: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    CardHolderName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CardLastDigits: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    ManageURL: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    CurrentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    CurrentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    CreateDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    UpdateDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    Status: {
      type: DataTypes.STRING(25),
      allowNull: false
    }
  }, {
    tableName: 'Subscription'
  });
}
