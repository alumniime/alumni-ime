'use strict';

import {Router} from 'express';
import * as controller from './former_student.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/graduation_years', auth.isAuthenticated(), controller.years);
router.get('/industries', auth.isAuthenticated(), controller.industries);
router.get('/locations', auth.isAuthenticated(), controller.locations);
router.get('/:year', auth.isAuthenticated(), controller.year);
router.get('/show/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.search);
router.post('/create', auth.hasRole('admin'), controller.create);
router.get('/autocomplete/:year/:name', auth.hasRole('admin'), controller.complete);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
