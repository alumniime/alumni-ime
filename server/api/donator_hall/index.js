'use strict';

import {Router} from 'express';
import * as controller from './donator_hall.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', controller.index);
router.get('/menu', controller.menu);

module.exports = router;
