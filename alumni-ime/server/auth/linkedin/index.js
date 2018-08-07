'use strict';

import express from 'express';
import passport from 'passport';
import {setTokenCookie} from '../auth.service';
import config from '../../config/environment';

var router = express.Router();

router
  .get('/', passport.authenticate('linkedin', {
    scope: ['r_basicprofile', 'r_emailaddress'],
    failureRedirect: '/main',
    session: false
  }))
  .get('/callback', passport.authenticate('linkedin', {
    failureRedirect: '/main',
    session: false
  }), setTokenCookie);

export default router;
