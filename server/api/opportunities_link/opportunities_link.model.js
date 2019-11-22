'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('OpportunitiesLink', {
    PersonId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    OpportunityTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'OpportunityType',
        key: 'OpportunityTypeId'
      }
    }
  }, {
    tableName: 'OpportunitiesLink'
  });
}
