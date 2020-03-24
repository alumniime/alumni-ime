import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import mailchimp from '../../email/mailchimp';
import async from 'async';
import crypto from 'crypto'

export function setup(User, config) {
    passport.use(new GoogleStrategy({
        clientID: config.google.clientID ,   
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        scope: ["profile", "email"],
        state: true
    }, function(accessToken, refreshToken, profile, cb) {
        var email = profile.emails[0].value.toLowerCase();

        async.waterfall([

            //Finding user using GoogleId or his email
            (next) => {
                console.log('Trying to find\n');
                User.find({
                    where: {
                        $or: [{GoogleId: profile.id}, {Email: email}]
                    }
                }).then(user => {
                    console.log('Got it');
                    next(null, user);
                }).catch(err => {
                    console.log('Failed to find');
                    next(err)});
            },

            //Assigning user fields
            (user, next) => {
                if(user) {
                    //User found
                    console.log("User found");
                    user.GoogleId = profile.id;
                    next(null, user, false);
                } else {
                    //User is new
                    crypto.randomBytes(20, function (err, buffer) {
                        var token = buffer.toString('hex');
                        if(config.env === 'development') {
                          console.log('\n=>token', token);
                        }
                        if(!err) {
            
                          user = User.build({
                            name: profile.displayName,
                            email: email,
                            role: 'user',
                            provider: 'google',
                            //ImageURL: profileImage.Path ? profileImage.Path : (profile._profileJson.profilePicture ? profile._profileJson.profilePicture.displayImage : null),
                            ImageURL: null,
                            GoogleId: profile.id,
                            Headline: null,
                            LinkedinProfileURL: null,
                            LocationId: null,
                            IndustryId: null,
                            Summary: null,
                            Specialties: null,
                            PersonTypeId: 1,
                            EmailVerified: 1,
                            ConfirmEmailToken: token
                          })
                          next(null, user, true);
                        } else {
                          next(err);
                        }
                    }, err => next(err));
                }
            },

            //Saving user
            (user, isNew, next) => {
                console.log("Saving user");
                user.save().then(savedUser => {
                    if(isNew) {
                        mailchimp.updateUser(savedUser.PersonId)
                    }
                    next(null, savedUser);
                }).catch(err => next(err));
            }
        ], function (err, result) {
            if(err) {
                console.log('google/passport =>\n', err);
                return cb(err);
            } else {
                return cb(null, result);
            }
        });
    }));
}