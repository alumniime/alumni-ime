export default function(sequelize, DataTypes) {
  return sequelize.define('Customer', {
    CustomerId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
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
    CustomerJSON: {
      type: DataTypes.JSON,
      allowNull: false
    },
    CreateDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'Customer'
  });
}
