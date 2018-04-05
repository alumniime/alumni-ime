/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import sqldb from '../sqldb';
import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if(config.seedDB) {
    let User = sqldb.User;

    return User.destroy({ where: {} })
      .then(() => User.bulkCreate([{
        PersonTypeId: 1,
        provider: 'local',
        name: 'Test User',
        email: 'test@example.com',
        password: 'test'
      }, {
        PersonTypeId: 1,
        provider: 'local',
        role: 'admin',
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin'
      }])
        .then(() => console.log('finished populating users'))
        .catch(err => console.log('error populating users', err)));
  }
}
