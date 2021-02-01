'use strict';

import express from 'express';
import passport from 'passport';
import { setTokenCookie } from '../auth.service';


var router = express.Router();

router
    .get('/callback', passport.authenticate('facebook', {
        failureRedirect: '/',
        session: false
    }), 
        function(err,req,res,next){
            console.log("ERR", err,"\n");
            if(err.name=="SequelizeUniqueConstraintError"){
                let message="Entre em contato com a equipe Alumni IME."
                res.redirect('/login/ERR-'+message);
            }
        },
        (req, res) => {
            //On success
            setTokenCookie(req,res);
        }
    )
    .get('/', passport.authenticate('facebook', {
        scope : ['email'], 
        failureRedirect: '/main',
        session: false
    }));

export default router;