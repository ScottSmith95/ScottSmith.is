boomsvgloader.load('/static/images/icons/icon-sprite.svg');

/* Global Variables */
var get_url = '/api/v1.0/get_responses?format=display'
var post_url = '/api/v1.0/add_response'

/* Page Elements */
var responseForm = document.querySelector('.input-form');
var submitButton = document.querySelector('.input-form input[type="submit"]');
var responseContainer = document.querySelector('.response-text');

/* Client Module */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
	// AMD
	define(['scottis'], factory);
  } else if (typeof exports === 'object') {
	// Node, CommonJS-like
	module.exports = factory();
  } else {
	// Browser globals (root is window)
	root.scottis = factory();
  }
}(this, function() {
	'use strict';

	function load_responses(url) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.open('GET', url, true);
		httpRequest.send();
		httpRequest.onload = function(e) {
			// console.log(httpRequest.responseText)
			responseContainer.innerHTML = httpRequest.responseText;
		};
	}

	function send_response(url, data) {
    console.log('sending');
		var httpRequest = new XMLHttpRequest();
		httpRequest.open('POST', url, true);
    httpRequest.onreadystatechange = function() {
      console.log('callback.');
      after_response(httpRequest)
    };
		// httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); This causes HUGE problems.
		/* Figure out what encoding is correct. plain text and multipart don't work. https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest */
		httpRequest.send(data)
	}

  function after_response(httpRequest) {
    console.log('after_response');
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      console.log('Waiting for 202.');
      if (httpRequest.status === 202) {
        console.log('Reloading responses.');
        load_responses(get_url)
      } else {
        console.log('There was a problem with the request.');
      }
    }
  }

	return {
		load_responses: load_responses,
		send_response: send_response
	};
}));

/* Client Actions */
function handle_form(event) {
  console.log('handle_form');
  event = event || window.event;
  event.preventDefault();
  var targ = event.target || event.srcElement;
  var form = targ;
  var data = new FormData(form);
  scottis.send_response(post_url, data);
  form.reset();
}

scottis.load_responses(get_url);
responseForm.addEventListener('submit', handle_form);
