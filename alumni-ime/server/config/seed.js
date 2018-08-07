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

    return User.destroy({ where: {
      email: ['test@example.com', 'admin@example.com']
    } })
      .then(() => User.bulkCreate([{
        PersonTypeId: 1,
        provider: 'local',
        name: 'Test User',
        email: 'test@example.com',
        password: 'test'
      }, {
        PersonTypeId: 2,
        provider: 'local',
        name: 'Gabriel Dilly',
        email: 'gb_2012@live.com',
        password: '123456',
        EmailVerified: true
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
