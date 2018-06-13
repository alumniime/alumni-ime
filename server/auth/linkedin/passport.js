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
            saveUser(user, profile._json.positions.values || null, done);
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
                saveUser(user, profile._json.positions.values || null, done);
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

function saveUser(user, positions, done) {
  user.save()
    .then(savedUser => {

      if(positions) {
        for(let position of positions) {
          Company.findOrCreate({
            where: {LinkedinId: position.company.id},
            defaults: {
              Name: position.company.name,
              Type: position.company.type,
              Industry: position.company.industry,
              Size: position.company.size,
            }
          })
            .then(result => {
              var company = result[0];
              Position.upsert({
                PersonId: savedUser.PersonId,
                CompanyId: company.CompanyId,
                LinkedinId: position.id,
                Title: position.title || null,
                Summary: position.summary || null,
                Location: (position.location ? position.location.name : null),
                StartDateMonth: (position.startDate ? position.startDate.month : null),
                StartDateYear: (position.startDate ? position.startDate.year : null),
                EndDateMonth: (position.endDate ? position.endDate.month : null),
                EndDateYear: (position.endDate ? position.endDate.year : null),
                IsCurrent: position.isCurrent
              })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }
      }
      done(null, savedUser);
    })
    .catch(err => done(err));
}
