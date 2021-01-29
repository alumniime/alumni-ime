'use strict';

import config from '../config/environment';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

var smtpTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: config.email.user,
    serviceClient: config.gsuite.client_id,
    privateKey: config.gsuite.private_key
  }
});

var handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.join(config.root, 'server', 'email', 'templates'),
  extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));

export default smtpTransport;
