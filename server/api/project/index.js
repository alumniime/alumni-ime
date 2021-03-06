'use strict';

import {Router} from 'express';
import * as controller from './project.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', controller.index);
router.get('/all', auth.hasRole('admin'), controller.indexAll);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/menu', controller.menu);
router.get('/:id', controller.show);
router.get('/:id/preview', auth.isAuthenticated(), controller.preview);
router.get('/:id/admin', auth.isAuthenticated(), controller.admin);
router.post('/upload', auth.isAuthenticated(), controller.upload);
router.post('/edit', auth.isAuthenticated(), controller.edit);
router.post('/result', auth.isAuthenticated(), controller.result);
router.post('/edit/admin', auth.hasRole('admin'), controller.editAny);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
