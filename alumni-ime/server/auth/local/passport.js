import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, email, password, done) {
  User.find({
    where: {
      email: email.toLowerCase()
    }
  })
    .then(user => {
      if(!user) {
        return done(null, false, {
          message: 'Este email não está cadastrado.'
        });
      }
      user.authenticate(password, function (authError, authenticated) {
        if(authError) {
          return done(authError);
        }
        if(!authenticated) {
          return done(null, false, {message: 'Senha incorreta.'});
        } else {
          // User is authenticated
          // User aren't a NewUser and his email is verified, so he can login
          if(!user.EmailVerified) {
            return done(null, false, {
              message: 'Por favor, confirme primeiro seu email.',
              PersonId: user.PersonId
            });
          } else if(user.PersonTypeId === 1) {
            return done(null, false, {
              message: 'Você deve completar seu cadastro para logar.',
              confirmEmailToken: user.ConfirmEmailToken
            });
          } else {
            return done(null, user);
          }
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User/*, config*/) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password' // this is the virtual field on the model
  }, function (email, password, done) {
    return localAuthenticate(User, email, password, done);
  }));
}
