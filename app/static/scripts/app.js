'use strict';

/* Global Variables */
var get_url_display = '/api/v1.0/get_responses?format=display'
var get_url = '/api/v1.0/get_responses?format=json'
var post_url = '/api/v1.0/add_response'
var response_json

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

  function layout(responses) {
    var content = ''
    for (var r in responses) {
      content = content + responses[r] + ', ';
    }
    content = content.replace(/,\s*$/, '');
    responseContainer.innerHTML = content
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

	function load_responses(url) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.open('GET', url, true);
		httpRequest.send();
		httpRequest.onload = function(e) {
			// console.log(httpRequest.responseText)
      response_json = JSON.parse(httpRequest.responseText);
      scottis.layout(response_json);
			// responseContainer.innerHTML = httpRequest.responseText;
		};
	}

	function send_response(url, data) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.open('POST', url, true);
    httpRequest.onreadystatechange = function() {
      after_response(httpRequest)
    };
		// httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); This causes HUGE problems.
		/* Figure out what encoding is correct. plain text and multipart don't work. https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest */
		httpRequest.send(data)
	}

  function after_response(httpRequest) {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 202) {
        load_responses(get_url)
      } else {
        console.log('There was a problem with the request.');
      }
    }
  }

	return {
    layout: layout,
		handle_form: handle_form,
		load_responses: load_responses,
		send_response: send_response
	};
}));

/* Client Actions */
boomsvgloader.load('/static/images/icons/icon-sprite.svg');
scottis.load_responses(get_url);
responseForm.addEventListener('submit', scottis.handle_form);
