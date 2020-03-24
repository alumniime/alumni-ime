'use strict';

import express from 'express';
import passport from 'passport';
import { setTokenCookie } from '../auth.service';


var router = express.Router();

router
    .get('/callback', passport.authenticate('google', {
        failureRedirect: '/',
        session: false,
        //accessType: 'offline'
    }), 
        function(err,req,res,next){
            if (err.name === 'TokenError') {
                //TokenError Handle
                res.redirect('/auth/google'); // redirect them back to the login page
            } else {
                //Other Errors handle
                res.redirect('/auth/google'); // redirect them back to the login page
            }
        },
        (req, res) => { 
            // On success
            setTokenCookie(req,res);
        }
    )
    .get('/', passport.authenticate('google', {
        scope: ["profile", "email"],
        failureRedirect: '/main',
        session: false,
        accessType: 'offline'
    }));

export default router;

