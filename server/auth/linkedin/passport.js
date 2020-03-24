import passport from 'passport';
//import {Strategy as LinkedInStrategy} from 'passport-linkedin';
import {Strategy as LinkedInStrategy} from '@sokratis/passport-linkedin-oauth2';
import crypto from 'crypto';
import {Position, Company, Location, Industry, Image} from '../../sqldb';
import async from 'async';
import download from 'image-downloader';
import mailchimp from '../../email/mailchimp';

export function setup(User, config) {
  passport.use(new LinkedInStrategy({
    clientID: config.linkedin.clientID,
    clientSecret: config.linkedin.clientSecret,
    callbackURL: config.linkedin.callbackURL,
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true
  }, function(token, tokenSecret, profile, done) {
    console.log('\n=>profile', JSON.stringify(profile));
    var email = profile.emails[0].value.toLowerCase();
    var ImageURL = null;
    var profileImage = {
      Path: null
    };
    //if(profile._profileJson.profilePicture) {
      //ImageURL = profile._profileJson.profilePicture.displayImage;
    //}
    async.waterfall([
      // Finding user using his LinkedinId or his email
      (next) => {
        User.find({
          where: {
            $or: [{LinkedinId: profile.id}, {Email: email}]
          }
        })
          .then(user => {
            next(null, user);
          })
          .catch(err => next(err));
      },
      // Saving user photo
      /*
      (user, next) => {
        if ((!user || (user && !user.ImageURL)) && profile._profileJson.profilePicture) {
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
              next(null, user, image);
            })
            .catch(err => {
              if(config.debug) {
                console.log('\n=>profile image', err);
              }
              next(null, user, null);
            })
        } else {
          next(null, user, null);
        }
      },
      */
      // Assigning user fields
      (user, next) => {
        if(user) {
          console.log("not here")
          // User just has his LinkedinId saved or has an account with the same email
          user.LinkedinId = profile.id;
          /*
          if(profileImage.Path) {
            user.ImageURL = profileImage.Path;
          }
          */
          // Fields that won't be changed for each login
          //  user.name = profile.displayName;
          //  user.Headline = profile._json.headline || null;
          //  user.LocationId = profile._json.location.name || null;
          //  user.IndustryId = profile._json.industry || null;
          next(null, user, false);
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
                //ImageURL: profileImage.Path ? profileImage.Path : (profile._profileJson.profilePicture ? profile._profileJson.profilePicture.displayImage : null),
                ImageURL: null,
                LinkedinId: profile.id,
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

      // Saving user
      (user, isNew, next) => {
        console.log("saving user")
        user.save()
          .then(savedUser => {
            console.log("isnew", isNew)
            if(isNew) {
              mailchimp.updateUser(savedUser.PersonId);
            }

            // Saving user profile image
            /*
            if(profileImage.Path) {
              console.log('Creating image');
              profileImage.PersonId = savedUser.PersonId;                
              Image.create(profileImage)
              .then(newImage => {})
              .catch(err => {});
              console.log("Acho3");
            }
            */
            next(null, savedUser);
            
          })
          .catch(err => next(err));
          console.log("Acho4");

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
