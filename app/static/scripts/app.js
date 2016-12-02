boomsvgloader.load('/static/images/icons/icon-sprite.svg');

/* Global Variables */
var get_url = '/api/v1.0/get_responses?display=true'
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
		var httpRequest = new XMLHttpRequest();
		httpRequest.open('POST', url, true);
    httpRequest.onreadystatechange = function() {
      after_response(url, httpRequest)
    };
		// httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); This causes HUGE problems.
		/* Figure out what encoding is correct. plain text and multipart don't work. https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest */
		httpRequest.send(data)
	}

  function after_response(url, httpRequest) {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 202) {
        load_responses(get_url)
      } else {
        console.log('There was a problem with the request.');
      }
    }
  }

  function handle_form(event) {
    event = event || window.event;
    event.preventDefault();
    var targ = event.target || event.srcElement;
    var form = targ;
    var data = new FormData(form);
    scottis.send_response(post_url, data);
    form.reset();
  }

	return {
		load_responses: load_responses,
		send_response: send_response
	};
}));

/* Client Actions */
scottis.load_responses(get_url);
responseForm.addEventListener('submit', scottis.handle_form);
