'use strict';

import crypto from 'crypto';

var validatePresenceOf = function (value) {
  return value && value.length >= 6;
};

export default function (sequelize, DataTypes) {
  var User = sequelize.define('Person', {
    PersonId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    PersonTypeId: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      references: {
        model: 'PersonType',
        key: 'PersonTypeId'
      }
    },
    LinkedinId: {
      type: DataTypes.STRING(45),
      allowNull: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    salt: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    provider: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: 'user'
    },
    EmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    ConfirmEmailToken: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ConfirmEmailExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ResetPasswordToken: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ResetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    MailchimpStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'subscribed'
    },
    LinkedinProfileURL: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Headline: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    LocationId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Location',
        key: 'LocationId'
      }
    },
    IndustryId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Industry',
        key: 'IndustryId'
      }
    },
    Summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Specialties: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ImageURL: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ImageData: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    FullName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Birthdate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Genre: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    Phone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    ShowPhone: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    ShowInformation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    GraduationEngineeringId: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      references: {
        model: 'Engineering',
        key: 'EngineeringId'
      }
    },
    GraduationYear: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ProfessorSEId: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      references: {
        model: 'SE',
        key: 'SEId'
      }
    },
    OptionToKnowThePageId: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      references: {
        model: 'OptionToKnowType',
        key: 'OptionTypeId'
      }
    },
    OptionToKnowThePageOther: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    InitiativeLinkOther: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CreateDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    ApprovedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    LastActivityDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    IsApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    IsExcluded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    IsSpecialUser:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    SpecializationLevel:{
      type: DataTypes.STRING(45),
      allowNull: true
    },
    CompanyName:{
      type: DataTypes.STRING(45),
      allowNull: true
    },
    TryAssociation:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    IsAssociated:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    Country:{
      type: DataTypes.STRING(100),
      allowNull: true
    },
    State:{
      type: DataTypes.STRING(100),
      allowNull: true
    },
    City:{
      type: DataTypes.STRING(100),
      allowNull: true
    },
    District:{
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CEP:{
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Address:{
      type: DataTypes.STRING(100),
      allowNull: true
    },
    AddressComplement:{
      type: DataTypes.STRING(100),
      allowNull: true
    },
    RG:{
      type: DataTypes.STRING(13),
      allowNull: true
    },
    CPF:{
      type: DataTypes.STRING(11),
      allowNull: true
    },
    AssociationCategory:{
      type: DataTypes.STRING(10),
      allowNull: true
    }

  }, {

    tableName: 'Person',

    /**
     * Virtual Getters
     */
    getterMethods: {
      // Public profile information
      profile() {
        return {
          name: this.name,
          role: this.role
        };
      },

      // Non-sensitive info we'll be putting in the token
      token() {
        return {
          PersonId: this.PersonId,
          role: this.role
        };
      },

      // Return if user has a password (both for local or linkedin provider)
      hasPassword() {
        return this.password !== null && this.password !== '';
      }

    },

    /**
     * Pre-save hooks
     */
    hooks: {
      beforeBulkCreate(users, fields, fn) {
        var totalUpdated = 0;
        users.forEach(user => {
          user.LastActivityDate = Date.now();
          user.updatePassword(err => {
            if(err) {
              return fn(err);
            }
            totalUpdated += 1;
            if(totalUpdated === users.length) {
              return fn();
            }
          });
        });
      },
      beforeCreate(user, fields, fn) {
        user.LastActivityDate = Date.now();
        user.updatePassword(fn);
      },
      beforeUpdate(user, fields, fn) {
        user.LastActivityDate = Date.now();
        if(user.changed('password')) {
          return user.updatePassword(fn);
        }
        fn();
      }
    },

    /**
     * Instance Methods
     */
    instanceMethods: {
      /**
       * Authenticate - check if the passwords are the same
       *
       * @param {String} password
       * @param {Function} callback
       * @return {Boolean}
       * @api public
       */
      authenticate(password, callback) {
        if(!callback) {
          return this.password === this.encryptPassword(password);
        }

        var passwordThis = this.password;
        this.encryptPassword(password, function (err, pwdGen) {
          if(err) {
            return callback(err);
          }

          if(passwordThis === pwdGen) {
            return callback(null, true);
          } else {
            return callback(null, false);
          }
        });
      },

      /**
       * Make salt
       *
       * @param {Number} [byteSize] - Optional salt byte size, default to 16
       * @param {Function} callback
       * @return {String}
       * @api public
       */
      makeSalt() { //...args
        let byteSize;
        let callback;
        let defaultByteSize = 16;

        if(typeof arguments[0] === 'function') {
          callback = arguments[0];
          byteSize = defaultByteSize;
        } else if(typeof arguments[1] === 'function') {
          callback = arguments[1];
        } else {
          throw new Error('Missing Callback');
        }

        if(!byteSize) {
          byteSize = defaultByteSize;
        }

        return crypto.randomBytes(byteSize, function (err, salt) {
          if(err) {
            return callback(err);
          }
          return callback(null, salt.toString('base64'));
        });
      },

      /**
       * Encrypt password
       *
       * @param {String} password
       * @param {Function} callback
       * @return {String}
       * @api public
       */
      encryptPassword(password, callback) {
        if(!password || !this.salt) {
          return callback ? callback(null) : null;
        }

        var defaultIterations = 10000;
        var defaultKeyLength = 64;
        var salt = new Buffer(this.salt, 'base64');

        if(!callback) {
          // eslint-disable-next-line no-sync
          return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha1')
            .toString('base64');
        }

        return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha1',
          function (err, key) {
            if(err) {
              return callback(err);
            }
            return callback(null, key.toString('base64'));
          });
      },

      /**
       * Update password field
       *
       * @param {Function} fn
       * @return {String}
       * @api public
       */
      updatePassword(fn) {
        // Handle new/update passwords
        if(!this.password) return fn(null);

        if(!validatePresenceOf(this.password)) {
          fn(new Error('Invalid password'));
        }

        // Make salt with a callback
        this.makeSalt((saltErr, salt) => {
          if(saltErr) {
            return fn(saltErr);
          }
          this.salt = salt;
          this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
            if(encryptErr) {
              fn(encryptErr);
            }
            this.password = hashedPassword;
            fn(null);
          });
        });
      }
    }
  });

  return User;
}
