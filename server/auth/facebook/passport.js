import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook'
import mailchimp from '../../email/mailchimp';
import async from 'async';
import crypto from 'crypto'

export function setup(User, config) {
    passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID ,   
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'displayName', 'emails'],
        enableProof: true
    }, function(accessToken, refreshToken, profile, cb) {
        console.log('\n=>accessToken', JSON.stringify(accessToken));
        console.log('\n=>refreshToken', JSON.stringify(refreshToken));
        console.log('\n=>profile', JSON.stringify(profile));
        console.log('\n=>cb', JSON.stringify(cb));
        var email = profile.emails[0].value.toLowerCase();

        async.waterfall([

            //Finding user using FacebookId or his email
            (next) => {
                console.log('Trying to find\n');
                User.find({
                    where: {
                        $or: [{FacebookId: profile.id}, {Email: email}]
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
                    user.FacebookId = profile.id;
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
                            provider: 'facebook',
                            //ImageURL: profileImage.Path ? profileImage.Path : (profile._profileJson.profilePicture ? profile._profileJson.profilePicture.displayImage : null),
                            ImageURL: null,
                            FacebookId: profile.id,
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
                console.log('facebook/passport =>\n');
                return cb(err, null);
            } else {
                return cb(null, result);
            }
        });
    }));
}