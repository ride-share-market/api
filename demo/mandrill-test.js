'use strict';

var config = require('../config/config'),
  logger = require(config.get('root') + '/config/log');


var mandrill = require('mandrill-api/mandrill');

console.log(config.get('email').mandrill.apikey);

var mandrill_client = new mandrill.Mandrill(config.get('email').mandrill.apikey);

var message = {
  "html": "<p>Example HTML content</p>",
  "subject": "Inquiry about your Rideshare Listing",
  "from_email": config.get('email').from_email,
  "from_name": config.get('email').from_name,
  "to": [{
    "email": "ooly.me@gmail.com",
    "name": "Recipient Name",
    "type": "to"
  }],
  "headers": {
    "Reply-To": "systemsadmin@ridesharemarket.com"
  },
  "important": false,
  "track_opens": null,
  "track_clicks": null,
  "auto_text": null,
  "auto_html": null,
  "inline_css": null,
  "url_strip_qs": null,
  "preserve_recipients": null,
  "view_content_link": null,
  "tracking_domain": null,
  "signing_domain": null,
  "return_path_domain": null,
  "merge": true,
  "tags": [
    "rideshare-contact"
  ],
  "metadata": {
    "website": config.get('email').website
  }
};

//console.log(message);

mandrill_client.messages.send({"message": message}, function(result) {
  console.log(result);
  /*
   [{
   "email": "recipient.email@example.com",
   "status": "sent",
   "reject_reason": "hard-bounce",
   "_id": "abc123abc123abc123abc123abc123"
   }]
   */
}, function(e) {
  // Mandrill returns the error as an object with name and message keys
  console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
  // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
});