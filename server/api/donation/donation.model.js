'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('Donation', {
    DonationId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DonatorId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Person',
        key: 'PersonId'
      }
    },
    TransferVoucherId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Image',
        key: 'ImageId'
      }
    },
    ProjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Project',
        key: 'ProjectId'
      }
    },
    DonationPriceInCents: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    DonationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    IsApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'Donation'
  });
}
