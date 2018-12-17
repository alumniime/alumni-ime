export default function(sequelize, DataTypes) {
  return sequelize.define('Year', {
    GraduationYear: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
  }, {
    tableName: 'Year'
  });
}