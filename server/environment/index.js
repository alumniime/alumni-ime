'use strict';

import {Router} from 'express';
import * as controller from './environment.controller';

var router = new Router();

router.get('/paypal', controller.paypal);

module.exports = router;
