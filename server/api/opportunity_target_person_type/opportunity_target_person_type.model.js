export default function(sequelize, DataTypes) {
  return sequelize.define('OpportunityTargetPersonType', {
    OpportunityId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Opportunity',
        key: 'OpportunityId'
      }
    },
    PersonTypeId: {
      type: DataTypes.INTEGER(1), 
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'PersonType',
        key: 'PersonTypeId'
      }
    }
  }, {
    tableName: 'OpportunityTargetPersonType'
  });
}
