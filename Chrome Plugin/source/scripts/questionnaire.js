import $ from './jquery.js';
import '../styles/questionnaire.scss';
import './bootstrap.js';
import { main } from '@popperjs/core';

const bg = require('./background.js');
var now = require('performance-now');
window.bootstrap = require('bootstrap/dist/js/bootstrap.bundle.js');

/* The injected button icon is located in background.js and taken into a constant variable here */
const questIcon = bg.iconSVG;
var credScore = -1;
var start_time = 0;
var end_time = 0;
var uid = bg.uid;
/*
The questionnaire form that opens when pushing the injected button 
*/
const questForm =   '<div class="card questHidden questForm">\
                        <div class="card-header">\
                            How credible is this post?\
                        </div>\
                        <div class="card-body">\
                            <p class="card-text">Evaluate the credibility of this post using the slider and elaborate on your answer using the text field below:</p>\
                            <div class="w-100">\
                                <label for="credibilityRange" class="form-label" id="cred-label"> Credibility: (Use the slider to select a value) </label>\
                            </div>\
                            <div class="w-100" style="text-align: center;">\
                                <div class="d-flex flex-row justify-content-between">\
                                    <span class="ml-1 mt-2 range-legend">1 - Not at all credible</span>\
                                    <span class="ml-1 mt-2 range-legend">7 - Extremely credible</span>\
                                </div>\
                                <input type="range" class="form-range cred-range" id="credibilityRange" default="-1" min="1" max="7"/>\
                            </div>\
                            <br>\
                            <textarea id="credibilityOpen" placeholder="Please elaborate on your answer" class="form-control" rows="3" maxlength="516"></textarea>\
                            <br>\
                            <button class="btn btn-primary quest_submit" style="outline: none;">Submit</button>\
                        </div>\
                    </div>'
/* 
The Thank you message after submitting the answer 
*/
const questDone =   '<div class="card questHidden questDone">\
                        <div class="card-header" style="font: bold;">\
                            Thank you for your rating!\
                        </div>\
                        <div class="card-body">\
                            <button class="btn btn-primary quest_close" style="outline: none;">Close</button>\
                        </div>\
                    </div>'
/*
The loading circle which waits for the submission to be finished before showing the Thank you message
*/
const loadingButton =  '<button class="btn btn-primary quest_submit" type="button" disabled>\
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>\
                    </button>'
/*
The original button in the questionnaire which will be added when the submission is loaded
*/
const origButton = '<button class="btn btn-primary quest_submit" style="outline: none;">Submit</button>';
/*
The connetion URL of the used database
*/
const url = bg.connectionURL;

window.addEventListener('load', initialize());

function initialize() {
    const config = {
        childList: true,
        subtree: true
    }

    const feed = document.body;

    const observer = new MutationObserver(mutated);
    observer.observe(feed, config);

    // Used to create and/or get the stored UID from chrome storage
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
}

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

function injectQuestButton(target) {
    // Injects the button to the button bar of a Tweet
    var tweet = $(target).closest('article');

    if (tweet.find('div[role="group"] div.quest_action').length) {
        return;
    }

    var icons = tweet.find('div[role="group"] div:nth-child(4)');

    icons.after(icons.clone());
    icons.attr('class', icons.prev().attr('class'));

    var question = icons.next();

    if (question[0]) {
        question.addClass('quest_action');
        question.find('svg').html(questIcon);

        question[0].addEventListener('click', function(target) {
            quest(target)
        });
    };

}

function mutated(mutationList, observer) {
    mutationList.forEach( (mutation) => {
        switch (mutation.type){
            case 'childList':
                injectQuestButton(mutation.target);
                break;
        }
    });
}

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Acces-Control-Allow-Origin': 'https://www.twitter.com',
        'Origin': 'https://www.twitter.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return JSON.stringify(response); // parses JSON response into native JavaScript objects
}

function removeElementsByClass(className){
    const elements = document.getElementsByClassName(className);
    while (elements.length > 0) elements[0].remove();
}

function quest(event) { 
    // Opening the questionnaire box after pressing the button

    let tweetSelector = event.target;
    let tweet = $(tweetSelector).closest('article');

    let quest_form = document.getElementsByClassName('questForm');

    if (!tweet.siblings().hasClass('questForm')) { // Check if there already is a questionnaire box open

        if (quest_form.length > 0){
            removeElementsByClass('questForm');
            credScore = -1;
            start_time = 0;
        }

        tweet.after(questForm);

        start_time = now();

        let button = document.getElementsByClassName('quest_submit');
        button[0].addEventListener('click', function() {
            questButtonPress(tweet, button[0]);
        });
        
        let range = document.getElementsByClassName('cred-range');
        range[0].addEventListener('input', function() {
            credScore = range[0].value;
            document.getElementById('cred-label').textContent = "Credibility: " + credScore;
        });
    }

    tweet.siblings().toggleClass('questHidden');
}

function questButtonPress(eventTarget, submitButton) {    

    try {
        var tweet_url = eventTarget[0].children[0].children[0].children[0].children[1].children[1].children[0].children[0].children[0].children[0].children[2].getAttribute('href');
        tweet_url = "https://twitter.com" + tweet_url;
    } catch(err) { // A simple catch to get the tweet url when it's not in the href indicated above (DOES NOT WORK ON PROMOTED TWEETS)
        var tweet_url = window.location.href;
    }

    let open = document.getElementById('credibilityOpen');
    let openAnswer = open.value;

    if (credScore < 0){
        window.alert("Use the slider to select a score!");
    } else if (!openAnswer){
        window.alert("Please provide a justification to your score.");
    }
    else {
        end_time = now();
        let spent_time = end_time.toFixed() - start_time.toFixed();
        spent_time = spent_time.toFixed();
        submitButton.outerHTML = loadingButton;
        postData(url, { "uid": uid, "tweet_url": tweet_url, "open_answer": openAnswer, "score": credScore , "time": spent_time })
        .then(data => {
            let form = document.getElementsByClassName('quest_submit');
            form[0].outerHTML = origButton;
            eventTarget.closest('article').after(questDone);
            eventTarget.siblings().toggleClass('questHidden');
            let closing = document.getElementsByClassName('questDone');
            closing[0].addEventListener('click', function() {
                removeElementsByClass('questDone');
                credScore = -1;
            })
        })
        .catch((error) => {
            console.error('Error:', error);
        })
    }
}
