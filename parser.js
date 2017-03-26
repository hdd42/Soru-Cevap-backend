let cheerio = require('cheerio')
const request = require("request")

let url = 'https://talk.istanbulcoders.org/c/merak-ediyorum'
let title;

var query = {
    url: 'http://google.com/search?q=javascript',
    type: 'html',
    selector: 'h3.r a',
    extract: 'text'
  },
  uriQuery = encodeURIComponent(JSON.stringify(query)),
  req  = 'http://example.noodlejs.com/?q=' +
             uriQuery + '&callback=?';

request(req, function (error, response, body) {

  if (!error) {

      
    console.log(body);
  } else {
    console.log("We’ve encountered an error: " + error);
  }
});