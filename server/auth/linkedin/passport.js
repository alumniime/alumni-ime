import passport from 'passport';
import {Strategy as LinkedInStrategy} from 'passport-linkedin';
import crypto from 'crypto';
import {Position, Company, Location, Industry, Image} from '../../sqldb';
import async from 'async';
import download from 'image-downloader';

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
      if(config.debug) {
        console.log('\n=>profile', JSON.stringify(profile));
      }
      var email = profile.emails[0].value;
      var ImageURL = null;
      var profileImage = {
        Path: null
      };
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
          if(config.debug) {
            console.log('\n=>industry', JSON.stringify(industry));
          }
          Location.findOrCreate({where: {LinkedinName: profile._json.location.name}})
            .spread((location, created) => next(null, user, industry, location))
            .catch(err => next(null, user, industry, null));
        },
        // Saving user photo
        (user, industry, location, next) => {
          if (!user || (user && !user.ImageURL)) {
            var time = Date.now();
            var name = profile.displayName.replace(/[^a-zA-Z0-9]/, '');
            var imagePath = `assets/profiles/${time}-${name}.jpg`;
            download.image({
              url: ImageURL,
              dest: `./client/${imagePath}`
            })
              .then(({ filename, image }) => {
                if(config.debug) {
                  console.log('\n=>profile image', filename);
                }
                profileImage = {
                  Path: imagePath,
                  Filename: `${time}-${name}.jpg`,
                  Type: 'profile',
                  Timestamp: time,
                  IsExcluded: 0
                };      
                next(null, user, industry, location, image);
              })
              .catch(err => {
                if(config.debug) {
                  console.log('\n=>profile image', err);
                }
                next(null, user, industry, location, null);
              })
          } else {
            next(null, user, industry, location, null);
          }
        },
        // Assigning user fields
        (user, industry, location, image, next) => {
          var industryId = null;
          var locationId = null;
          var positions = profile._json.positions.values;
          if(config.debug) {
            console.log('\n=>location', JSON.stringify(location));
          }
          if(industry) {
            industryId = industry.IndustryId;
          }
          if(location) {
            locationId = location.LocationId;
          }
          if(user) {
            // User just has his LinkedinId saved or has an account with the same email
            if (user.LinkedinId) { 
              positions = null;
            }
            user.LinkedinId = profile.id;
            user.LinkedinProfileURL = profile._json.publicProfileUrl;
            user.Summary = profile._json.summary || null;
            user.Specialties = profile._json.specialties || null;
            if(profileImage.Path) {
              user.ImageURL = profileImage.Path;
            }
            // Fields that won't be changed for each login
            //  user.name = profile.displayName;
            //  user.Headline = profile._json.headline || null;
            //  user.LocationId = profile._json.location.name || null;
            //  user.IndustryId = profile._json.industry || null;
            next(null, user, positions);
          } else {
            // User is new
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
                  provider: 'linkedin',
                  ImageURL: profileImage.Path ? profileImage.Path : (profile._json.pictureUrls ? profile._json.pictureUrls.values[0] : null),
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
                next(null, user, positions);
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

              // Saving user profile image
              if(profileImage.Path) {
                console.log('Creating image');
                profileImage.PersonId = savedUser.PersonId;                
                Image.create(profileImage)
                .then(newImage => {})
                .catch(err => {});
              }

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
                      if(position.location && position.location.name) {
                        Location.findOrCreate({where: {LinkedinName: position.location.name}})
                          .spread((location, created) => next(null, industry, location))
                          .catch(err => next(null, industry, null));
                      } else {
                        next(null, industry, null);
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
                          .catch(err => {
                            console.log(err);
                            next(null, savedUser);
                          });
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
          console.log('linkedin/passport =>\n', err);
          done(err);
        } else {
          done(null, result);
        }
      });

    }));
}
