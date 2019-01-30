export default function(sequelize, DataTypes) {
  return sequelize.define('ExperienceLevel', {
    ExperienceLevelId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Description: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'ExperienceLevel'
  });
}
