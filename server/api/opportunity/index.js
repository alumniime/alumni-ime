'use strict';

import {Router} from 'express';
import * as controller from './opportunity.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/industries', auth.isAuthenticated(), controller.industries);
router.get('/locations', auth.isAuthenticated(), controller.locations);
router.get('/opportunity_functions', auth.isAuthenticated(), controller.opportunityFunctions);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.search);
router.post('/create', auth.hasRole('admin'), controller.create);
router.post('/upload', auth.isAuthenticated(), controller.upload);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
