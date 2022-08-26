const { browserAction } = require("webextension-polyfill");

const connectionURL = "https://afternoon-brook-01612.herokuapp.com/db";
const iconSVG = '<g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1">\
<path id="path841" style="display:inline;opacity:1;fill:#1DA1F2;stroke-width:0.143045" d="M 46.767578,1.7890625 A 45.354331,45.354331 0 0 0 45.636719,1.8144531 45.354331,45.354331 0 0 0 1.7988281,48.148438 45.354331,45.354331 0 0 0 47.644531,92.494141 45.354331,45.354331 0 0 0 92.498047,47.142578 l -0.04492,-2.009766 A 45.354331,45.354331 0 0 0 46.767578,1.7890625 Z M 38.992188,20.570312 H 53.203125 V 39.75 H 73.269531 V 53.335938 H 53.203125 v 19.18164 H 38.992188 V 53.335938 H 18.927734 V 39.75 h 20.064454 z" transform="scale(0.26458333)" />\
</g>';
const trendsURL = "https://afternoon-brook-01612.herokuapp.com/trends";
const final_questURL = "https://afternoon-brook-01612.herokuapp.com/quest";
var uid;

module.exports = {
  connectionURL,
  iconSVG,
  trendsURL,
  final_questURL,
  uid
};

chrome.storage.sync.get('userid', function(items) {
  var userid = items.userid;
  if (userid) {
      uid = userid;
  } else {
      userid = getRandomToken();
      chrome.storage.sync.set({userid: userid}, function() {
          uid = userid;
      });
  }
});

function getRandomToken() {
  // E.g. 8 * 32 = 256 bits token
  var randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  var hex = '';
  for (var i = 0; i < randomPool.length; ++i) {
      hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
}