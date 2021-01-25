/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /engineering/paypal           ->  paypal
 */

'use strict';

import config from '../config/environment'

// Get correct paypal url
export function paypal(req, res) {
  if(config.paypal.clientID == ''){
    return res.status(503).send('PayPal: Invalid Client ID');
  }else{
    var paypalUrl = {}
    paypalUrl.once = "https://www.paypal.com/sdk/js?currency=BRL&client-id="+config.paypal.clientID;
    paypalUrl.monthly = "https://www.paypal.com/sdk/js?currency=BRL&client-id="+config.paypal.clientID+"&vault=true";
    return res.json(paypalUrl);
  }
}




