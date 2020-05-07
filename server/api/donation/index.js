'use strict';

import {Router} from 'express';
import * as controller from './donation.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/user/:id', auth.hasRole('admin'), controller.user);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/upload', auth.isAuthenticated(), controller.upload);
router.post('/setting', auth.isAuthenticated(), controller.update);
router.post('/', auth.hasRole('admin'), controller.create);
router.post('/edit', auth.hasRole('admin'), controller.edit);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
