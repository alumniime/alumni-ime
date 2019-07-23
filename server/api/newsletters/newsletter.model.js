'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Newsletter', {
    NewsletterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    FileUrl: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Month: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Year: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Newsletter'
  });
}
