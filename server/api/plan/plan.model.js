export default function(sequelize, DataTypes) {
  var prop = {
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
    },
    Admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    Develop: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    PaypalId: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }

  return sequelize.define('Plan', prop, {
    tableName: 'Plan'
  });
}