import passport from 'passport';
import {Strategy as LinkedInStrategy} from 'passport-linkedin';

export function setup(User, config) {
  passport.use(new LinkedInStrategy({
      consumerKey: config.linkedin.clientID,
      consumerSecret: config.linkedin.clientSecret,
      callbackURL: config.linkedin.callbackURL,
      profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline', 'location', 'picture-url']
    },
    function (token, tokenSecret, profile, done) {
      User.find({where: {LinkedinId: profile.id}})
        .then(user => {
          if(user) {
            return done(null, user);
          }

          user = User.build({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'user',
            provider: 'linkedin',
            LinkedinId: profile.id
          });
          user.save()
            .then(savedUser => done(null, savedUser))
            .catch(err => done(err));
        })
        .catch(err => done(err));
    }));
}
