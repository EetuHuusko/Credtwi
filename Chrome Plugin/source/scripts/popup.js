import browser from 'webextension-polyfill';

import '../styles/popup.scss';

const bg = require('./background.js');
const trend_url = bg.trendsURL;
const quest_url = bg.final_questURL;
var onboarding_quest, final_quest;
var trend1, trend2, trend3, uid;

function openWebPage(url) {
  return browser.tabs.create({url});
}

var p = new Promise(function (resolve,reject) {
  chrome.storage.sync.get('userid', function(items) {
    var userid = items.userid;
    if (userid) {
      uid = userid;
      resolve(uid);
    } else {
      userid = getRandomToken();
      chrome.storage.sync.set({userid: userid}, function() {
        uid = userid;
        reject(uid);
      });
    }
  });
});

p
  .then(uid => {
    document.getElementById('Onboard__button').disabled = false;
    onboarding_quest = "https://docs.google.com/forms/d/e/1FAIpQLSf9A48p6-r5_DK_x50FlGhB3pkY1g4X1LuVCT9TZIqEtKVrSw/viewform?usp=pp_url&entry.2021587984=" + uid;
    final_quest = "https://docs.google.com/forms/d/e/1FAIpQLSfq5Jp0Uq0z4NXXbN0kIfXpkUczq6b-qC3JkguzGG9nnBqyZg/viewform?usp=pp_url&entry.2021587984=" + uid;
  })
  .catch(uid => {
    document.getElementById('Onboard__button').disabled = false;
    onboarding_quest = "https://docs.google.com/forms/d/e/1FAIpQLSf9A48p6-r5_DK_x50FlGhB3pkY1g4X1LuVCT9TZIqEtKVrSw/viewform?usp=pp_url&entry.2021587984=" + uid;
    final_quest = "https://docs.google.com/forms/d/e/1FAIpQLSfq5Jp0Uq0z4NXXbN0kIfXpkUczq6b-qC3JkguzGG9nnBqyZg/viewform?usp=pp_url&entry.2021587984=" + uid;
})


fetch(trend_url)
  .then(data => data.json())
  .then(data => {
    let string = JSON.stringify(data)
    var parsed = JSON.parse(string);
    trend1 = parsed.results[0].trend;
    trend2 = parsed.results[1].trend;
    trend3 = parsed.results[2].trend;
    document.getElementById('trend1__button').disabled = false;
    document.getElementById('trend2__button').disabled = false;
    document.getElementById('trend3__button').disabled = false;
})

fetch(quest_url)
  .then(data => data.json())
  .then(data => {
    let string = JSON.stringify(data)
    var parsed = JSON.parse(string);
    let boolean = parsed.results[0].quest_boolean;
    if (boolean) {
      document.getElementById('final__button').hidden = false;
    }
})

document.addEventListener('DOMContentLoaded', async () => {

  document.getElementById('Onboard__button').addEventListener('click', () => {
    return openWebPage(onboarding_quest);
  });

  document.getElementById('final__button').addEventListener('click', () => {
    return openWebPage(final_quest);
  });

  document.getElementById('trend1__button').addEventListener('click', () => {
    return openWebPage(trend1);
  });

  document.getElementById('trend2__button').addEventListener('click', () => {
    return openWebPage(trend2);
  });

  document.getElementById('trend3__button').addEventListener('click', () => {
    return openWebPage(trend3);
  });

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