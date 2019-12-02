'use strict';

import {Router} from 'express';
import * as controller from './former_student.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', controller.index);
router.get('/graduation_years', controller.years);
router.get('/industries', controller.industries);
router.get('/locations', controller.locations);
router.get('/ranking', controller.ranking);
router.get('/:year', controller.year);
router.get('/show/:id', controller.show);
router.post('/', controller.search);
router.post('/create', auth.hasRole('admin'), controller.create);
router.get('/autocomplete/:year/:name', auth.hasRole('admin'), controller.complete);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
