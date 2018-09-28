'use strict';

import {Router} from 'express';
import * as controller from './news.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', controller.index);
router.get('/all', auth.hasRole('admin'), controller.indexAll);
router.get('/admin/:id', auth.hasRole('admin'), controller.showAdmin);
router.get('/:id', controller.show);
router.post('/edit', auth.hasRole('admin'), controller.edit);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
