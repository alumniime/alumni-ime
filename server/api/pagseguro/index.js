'use strict';

import {Router} from 'express';
import * as controller from './pagseguro.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

// router.get('/session', controller.getSessionID);
router.post('/pay', auth.isAuthenticated(), controller.pay);
// router.post('/checkout', controller.checkout);

module.exports = router;