/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below
  app.use('/api/person_types', require('./api/person_type'));
  app.use('/api/ses', require('./api/se'));
  app.use('/api/engineering', require('./api/engineering'));
  app.use('/api/option_to_know_types', require('./api/option_to_know_type'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/projects', require('./api/project'));
  app.use('/api/project_teams', require('./api/project_team'));
  app.use('/api/project_ses', require('./api/project_se'));
  app.use('/api/initiatives', require('./api/initiative'));
  app.use('/api/initiative_links', require('./api/initiative_link'));
  // app.use('/api/things', require('./api/thing'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
