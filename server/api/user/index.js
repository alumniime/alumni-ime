'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.post('/approve', auth.hasRole('admin'), controller.approve);
router.post('/bulk_approve', auth.hasRole('admin'), controller.bulkApprove);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/profile', auth.isAuthenticated(), controller.update);
router.get('/autocomplete/:name', auth.hasRole('admin'), controller.complete);
router.get('/:token/show', controller.showToken);
router.put('/:token/registry', controller.update);
router.get('/professors', controller.professors);
router.get('/students', controller.students);
router.get('/formerStudents', controller.formerStudents);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/upload', auth.isAuthenticated(), controller.upload);

router.post('/send_confirmation', controller.sendConfirmation);
router.get('/confirm_email/:token', controller.confirmEmail);
router.post('/forgot_password', controller.forgotPassword);
router.put('/reset_password', controller.resetPassword);
router.post('/contact', controller.sendContactEmail);

router.post('/association_trial', controller.sendAssociationTrialEmail);
router.post('/association_confirmation', controller.sendAssociationConfirmEmail);
router.post('/association_refuse', controller.sendAssociationRefuseEmail);

router.post('/subscription_modification', controller.sendModificationEmail);
router.post('/support_project', controller.sendSupportProjectEmail);

router.post('/project_submitted', controller.sendProjectSubmittedEmail);

module.exports = router;
