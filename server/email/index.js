'use strict';

import config from '../config/environment';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

var smtpTransport = nodemailer.createTransport({
  /*
  host: 'email-ssl.com.br',
  port: 587,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
  */
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: 'contato@alumniime.com.br',
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
