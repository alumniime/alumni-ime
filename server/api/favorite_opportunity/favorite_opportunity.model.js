export default function(sequelize, DataTypes) {
  return sequelize.define('FavoriteOpportunity', {
    OpportunityId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Opportunity',
        key: 'OpportunityId'
      }
    },
    PersonId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    }
  }, {
    tableName: 'FavoriteOpportunity'
  });
}
