import passport from 'passport';
import {Strategy as LinkedInStrategy} from 'passport-linkedin';
import crypto from 'crypto';
import {Position, Company} from '../../sqldb';

export function setup(User, config) {
  passport.use(new LinkedInStrategy({
      consumerKey: config.linkedin.clientID,
      consumerSecret: config.linkedin.clientSecret,
      callbackURL: config.linkedin.callbackURL,
      profileFields: [
        'id', 'first-name', 'last-name', 'email-address',
        'headline', 'location', 'industry',
        'summary', 'specialties', 'positions',
        'picture-url', 'picture-urls::(original)', 'public-profile-url'
      ]
    },
    function (token, tokenSecret, profile, done) {
      // TODO save positions and companies
      console.log(JSON.stringify(profile));
      var email = profile.emails[0].value;
      var ImageURL = null;
      if(profile._json.pictureUrls) {
        ImageURL = profile._json.pictureUrls.values[0];
      }
      User.find({
        where: {
          $or: [{LinkedinId: profile.id}, {Email: email}]
        }
      })
        .then(user => {
          if(user) {
            // User just has his LinkedinId saved or has an account with the same email
            user.name = profile.displayName;
            user.ImageURL = ImageURL;
            user.LinkedinId = profile.id;
            user.LinkedinProfileURL = profile._json.publicProfileUrl;
            user.Headline = profile._json.headline || null;
            user.Location = profile._json.location.name || null;
            user.Industry = profile._json.industry || null;
            user.Summary = profile._json.summary || null;
            user.Specialties = profile._json.specialties || null;
            user.save()
              .then(savedUser => done(null, savedUser))
              .catch(err => done(err));
          } else {
            // User is new
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
                  LinkedinProfileURL: profile._json.publicProfileUrl,
                  Headline: profile._json.headline || null,
                  Location: profile._json.location.name || null,
                  Industry: profile._json.industry || null,
                  Summary: profile._json.summary || null,
                  Specialties: profile._json.specialties || null,
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
            })
              .catch(err => done(err));
          }
        })
        .catch(err => done(err));
    }));
}
