'use strict';

import {Router} from 'express';
import * as controller from './environment.controller';
import * as auth from '../auth/auth.service';

var router = new Router();

router.get('/paypal', auth.isAuthenticated(), controller.paypal);
router.get('/pagarme', auth.isAuthenticated(), controller.pagarme);

module.exports = router;
