/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
import config from './config/environment';

export default function (app) {

  // Insert routes below
  app.use('/api/subscriptions', require('./api/subscription'));
  app.use('/api/customers', require('./api/customer'));
  app.use('/api/transactions', require('./api/transaction'));
  app.use('/api/plans', require('./api/plan'));
  app.use('/api/opportunity_targets', require('./api/opportunity_target_person_type'));
  app.use('/api/favorite_opportunities', require('./api/favorite_opportunity'));
  app.use('/api/opportunity_applications', require('./api/opportunity_application'));
  app.use('/api/opportunity_functions', require('./api/opportunity_function'));
  app.use('/api/experience_levels', require('./api/experience_level'));
  app.use('/api/opportunities', require('./api/opportunity'));
  app.use('/api/opportunity_types', require('./api/opportunity_type'));
  app.use('/api/years', require('./api/year'));
  app.use('/api/former_students', require('./api/former_student'));
  app.use('/api/company_types', require('./api/company_type'));
  app.use('/api/cities', require('./api/city'));
  app.use('/api/states', require('./api/state'));
  app.use('/api/countries', require('./api/country'));
  app.use('/api/locations', require('./api/location'));
  app.use('/api/levels', require('./api/level'));
  app.use('/api/industries', require('./api/industry'));
  app.use('/api/companies', require('./api/company'));
  app.use('/api/positions', require('./api/position'));
  app.use('/api/news', require('./api/news'));
  app.use('/api/news_categories', require('./api/news_category'));
  app.use('/api/news_constructions', require('./api/news_construction'));
  app.use('/api/news_elements', require('./api/news_element'));
  app.use('/api/newsletters', require('./api/newsletters'));
  app.use('/api/donations', require('./api/donation'));
  app.use('/api/donator_hall', require('./api/donator_hall'));
  app.use('/api/images', require('./api/image'));
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
  
  app.use('/environment', require('./environment'));
  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
