import passport from 'passport';
import {Strategy as LinkedInStrategy} from 'passport-linkedin';
import crypto from 'crypto';
import {Position, Company, Location, Industry} from '../../sqldb';
import async from 'async';

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
      // console.log(profile);
      var email = profile.emails[0].value;
      var ImageURL = null;
      if(profile._json.pictureUrls) {
        ImageURL = profile._json.pictureUrls.values[0];
      }

      async.waterfall([
        // Finding user using his LinkedinId or his email
        (next) => {
          User.find({
            where: {
              $or: [{LinkedinId: profile.id}, {Email: email}]
            }
          })
            .then(user => next(null, user))
            .catch(err => next(err));
        },
        // Trying to find his industry
        (user, next) => {
          Industry.find({
            where: {
              $or: [
                {Description: {$like: `%${profile._json.industry}%`}},
                {PortugueseDescription: {$like: `%${profile._json.industry}%`}}
              ]
            }
          })
            .then(industry => next(null, user, industry))
            .catch(err => next(null, user, null));
        },
        // Trying to save his location
        (user, industry, next) => {
          console.log(industry);
          Location.findOrCreate({where: {LinkedinName: profile._json.location.name}})
            .spread((location, created) => next(null, user, industry, location))
            .catch(err => next(null, user, industry, null));
        },
        // Assigning user fields
        (user, industry, location, next) => {
          var industryId = null;
          var locationId = null;
          if(industry) {
            industryId = industry.IndustryId;
          }
          if(location) {
            locationId = location.LocationId;
          }
          if(user) {
            // User just has his LinkedinId saved or has an account with the same email
            user.ImageURL = ImageURL;
            user.LinkedinId = profile.id;
            user.LinkedinProfileURL = profile._json.publicProfileUrl;
            user.Summary = profile._json.summary || null;
            user.Specialties = profile._json.specialties || null;
            // Fields that won't be changed for each login
            //  user.name = profile.displayName;
            //  user.Headline = profile._json.headline || null;
            //  user.LocationId = profile._json.location.name || null;
            //  user.IndustryId = profile._json.industry || null;
            next(null, user, null);
          } else {
            // User is new
            crypto.randomBytes(20, function (err, buffer) {
              var token = buffer.toString('hex');
              if(config.env === 'development') {
                console.log(token);
              }
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
                  LocationId: locationId,
                  IndustryId: industryId,
                  Summary: profile._json.summary || null,
                  Specialties: profile._json.specialties || null,
                  PersonTypeId: 1,
                  EmailVerified: 1,
                  ConfirmEmailToken: token
                });
                next(null, user, profile._json.positions.values);
              } else {
                next(err);
              }
            }, err => next(err));
          }
        },
        // Saving user
        (user, positions, next) => {
          user.save()
            .then(savedUser => {

              if(positions) {
                async.eachSeries(positions, function (position, cb) {
                  async.waterfall([
                    // Trying to find company industry
                    (next) => {
                      Industry.find({
                        where: {
                          $or: [
                            {Description: {$like: `%${position.company.industry}%`}},
                            {PortugueseDescription: {$like: `%${position.company.industry}%`}}
                          ]
                        }
                      })
                        .then(industry => next(null, industry))
                        .catch(err => next(null, null));
                    },
                    // Trying to save position location
                    (industry, next) => {
                      if(position.location) {
                        Location.findOrCreate({where: {LinkedinName: position.location.name}})
                          .spread((location, created) => next(null, industry, location))
                          .catch(err => next(null, industry, null));
                      }
                    },
                    // Trying to save company
                    (industry, location, next) => {
                      var industryId = null;
                      if(industry) {
                        industryId = industry.IndustryId;
                      }
                      Company.findOrCreate({
                        where: {LinkedinId: position.company.id},
                        defaults: {
                          Name: position.company.name,
                          Type: position.company.type,
                          Size: position.company.size,
                          IndustryId: industryId
                        }
                      })
                        .spread((company, created) => next(null, location, company))
                        .catch(err => next(null, location, null));
                    },
                    // Saving position
                    (location, company, next) => {
                      var locationId = null;
                      if(location) {
                        locationId = location.LocationId;
                      }

                      if(company) {
                        Position.upsert({
                          PersonId: savedUser.PersonId,
                          CompanyId: company.CompanyId,
                          LinkedinId: position.id,
                          Title: position.title || null,
                          Summary: position.summary || null,
                          LocationId: locationId,
                          StartDateMonth: (position.startDate ? position.startDate.month : null),
                          StartDateYear: (position.startDate ? position.startDate.year : null),
                          EndDateMonth: (position.endDate ? position.endDate.month : null),
                          EndDateYear: (position.endDate ? position.endDate.year : null),
                          IsCurrent: 0
                        })
                          .then(result => next(null, savedUser))
                          .catch(err => console.log(err));
                      } else {
                        next(null, savedUser);
                      }
                    }
                  ], function (err, result) {
                    if(err) {
                      cb(err);
                    } else {
                      cb(null, result);
                    }
                  });
                }, next);

              } else {
                next(null, savedUser);
              }
            })
            .catch(err => next(err));
        }

      ], function (err, result) {
        if(err) {
          done(err);
        } else {
          done(null, result);
        }
      });

    }));
}
