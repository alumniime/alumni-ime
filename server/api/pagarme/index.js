'use strict';

import {Router} from 'express';
import * as controller from './pagarme.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.post('/pay', auth.isAuthenticated(), controller.pay);

module.exports = router;