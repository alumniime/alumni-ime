'use strict';

import {Router} from 'express';
import * as controller from './project.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', controller.index);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id', controller.show);
router.get('/:id/preview', auth.isAuthenticated(), controller.preview);
router.post('/upload', auth.isAuthenticated(), controller.upload);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
