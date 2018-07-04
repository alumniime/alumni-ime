'use strict';

import express from 'express';
import passport from 'passport';
import {setTokenCookie} from '../auth.service';
import config from '../../config/environment';

var router = express.Router();

if(config.env === 'production') {
  router.use('/callback', function (req, res, next) {
    // Redirects urls to www.
    console.log('\n=>host', req.headers.host);
    console.log('\n=>url', req.url);
    if(req.headers.host.match(/^www\./) === null) {
      console.log('\n=>IN');
      if(req.url !== '/') {
        req.url = `/callback${req.url.slice(1)}`;
        console.log('\n=>new url', req.url);
      }
      res.redirect(`http://www.${req.headers.host}/auth/linkedin${req.url}`, 301);
    } else {
      next();
    }
  });
}

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
