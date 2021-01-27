var config = require('../../config/environment');

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
    }
  }

  if(config.localEnv == 'dev'){
    prop.Develop = {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    }
  }

  return sequelize.define('Plan', prop, {
    tableName: 'Plan'
  });
}