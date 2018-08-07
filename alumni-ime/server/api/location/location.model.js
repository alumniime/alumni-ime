'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Location', {
    LocationId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    CountryId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Country',
        key: 'CountryId'
      }
    },
    StateId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'State',
        key: 'StateId'
      }
    },
    CityId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'City',
        key: 'CityId'
      }
    },
    LinkedinName: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'Location'
  });
}
