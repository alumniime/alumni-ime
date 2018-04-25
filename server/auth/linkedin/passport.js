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
          console.log(JSON.stringify(profile));

          var ImageURL = null;
          if(profile._json.pictureUrls) {
            ImageURL = profile._json.pictureUrls.values[0];
          }

          crypto.randomBytes(20, function (err, buffer) {
            var token = buffer.toString('hex');
            if(!err) {
              user = User.build({
                name: profile.displayName,
                email: profile.emails[0].value,
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


        })
        .catch(err => done(err));
    }));
}
