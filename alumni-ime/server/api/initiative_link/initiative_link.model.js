'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('InitiativeLink', {
    PersonId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    InitiativeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Initiative',
        key: 'InitiativeId'
      }
    }
  }, {
    tableName: 'InitiativeLink'
  });
}
