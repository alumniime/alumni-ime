'use strict';

import {Router} from 'express';
import * as controller from './subscription.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/', auth.isAuthenticated(), controller.subscribe);
router.post('/setting', auth.isAuthenticated(), controller.update);
router.post('/postback', controller.postback);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;