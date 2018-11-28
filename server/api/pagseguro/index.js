'use strict';

import {Router} from 'express';
import * as controller from './pagseguro.controller';

var router = new Router();

router.get('/session', controller.getSessionID);
router.post('/checkout', controller.checkout);

module.exports = router;