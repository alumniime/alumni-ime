'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('OptionToKnowType', {
    OptionTypeId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Description: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    IsExcluded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'OptionToKnowType'
  });
}
