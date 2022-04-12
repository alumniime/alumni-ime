export default function(sequelize, DataTypes) {
  return sequelize.define('Transaction', {
    TransactionId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    PersonId: {
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
    SubscriptionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Subscription',
        key: 'SubscriptionId'
      }
    },
    PaymentMethod: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    Amount: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    AuthorizedAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    PaidAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    RefundedAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Cost: {
      type: DataTypes.INTEGER(11),
      allowNull: false
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
    BoletoURL: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    BoletoBarcode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    BoletoExpirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    RiskLevel: {
      type: DataTypes.STRING(25),
      allowNull: false
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
    },
    StatusReason: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    PixQrCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PixExpirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    tableName: 'Transaction'
  });
}
