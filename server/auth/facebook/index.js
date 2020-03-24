'use strict';

import express from 'express';
import passport from 'passport';
import { setTokenCookie } from '../auth.service';


var router = express.Router();

router
    .get('/callback', passport.authenticate('facebook', {
        failureRedirect: '/',
        session: false
    }),setTokenCookie)
    .get('/', passport.authenticate('facebook', {
        scope : ['email'], 
        failureRedirect: '/main',
        session: false
    }));

export default router;