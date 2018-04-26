import passport from 'passport';
import {Strategy as LinkedInStrategy} from 'passport-linkedin';
import crypto from 'crypto';

export function setup(User, config) {
  passport.use(new LinkedInStrategy({
      consumerKey: config.linkedin.clientID,
      consumerSecret: config.linkedin.clientSecret,
      callbackURL: config.linkedin.callbackURL,
      profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline', 'location', 'picture-url', 'picture-urls::(original)']
    },
    function (token, tokenSecret, profile, done) {
      User.find({where: {LinkedinId: profile.id}})
        .then(user => {
          if(user) {
            return done(null, user);
          }
          // console.log(JSON.stringify(profile));
          var email = profile.emails[0].value;

          // Try to find an account with the same email
          User.find({where: {Email: email}})
            .then(user => {
              var ImageURL = null;
              if(profile._json.pictureUrls) {
                ImageURL = profile._json.pictureUrls.values[0];
              }
              if(user) {
                user.name = profile.displayName;
                user.ImageURL = ImageURL;
                user.LinkedinId = profile.id;
                user.save()
                  .then(savedUser => done(null, savedUser))
                  .catch(err => done(err));
              } else {
                crypto.randomBytes(20, function (err, buffer) {
                  var token = buffer.toString('hex');
                  if(!err) {
                    user = User.build({
                      name: profile.displayName,
                      email: email,
                      role: 'user',
                      provider: 'linkedin',
                      ImageURL: ImageURL,
                      LinkedinId: profile.id,
                      PersonTypeId: 1,
                      EmailVerified: 1,
                      ConfirmEmailToken: token
                    });
                    user.save()
                      .then(savedUser => done(null, savedUser))
                      .catch(err => done(err));
                  } else {
                    done(err);
                  }
                });
              }
            })
            .catch(err => done(err));
        })
        .catch(err => done(err));
    }));
}
