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
    TransferReceiptId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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
    Type: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    ValueInCents: {
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