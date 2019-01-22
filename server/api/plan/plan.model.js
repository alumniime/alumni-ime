export default function(sequelize, DataTypes) {
  return sequelize.define('Plan', {
    PlanId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Amount: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'Plan'
  });
}