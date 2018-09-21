export default function(sequelize, DataTypes) {
  return sequelize.define('Year', {
    GraduationYear: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    DonatorsNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    DonationsValueInCents: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'Year'
  });
}