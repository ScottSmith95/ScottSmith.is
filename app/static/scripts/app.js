boomsvgloader.load('/static/images/icons/icon-sprite.svg');

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
		var ajax = new XMLHttpRequest();
		ajax.open('GET', url, true);
		ajax.send();
		ajax.onload = function(e) {
			// console.log(ajax.responseText)
			responseContainer.innerHTML = ajax.responseText;
		};
	}
	
	function send_response(url, data) {
		var ajax = new XMLHttpRequest();
		ajax.open('POST', url, true);
		// ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); This causes HUGE problems. 
		/* Figure out what encoding is correct. plain text and multipart don't work. https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest */
		ajax.send(data);
	}
	
	return {
		load_responses: load_responses,
		send_response: send_response
	};
}));

/* Client Actions */
function handle_form(event) {
	event = event || window.event;
	event.preventDefault();
	var targ = event.target || event.srcElement;
	var form = targ;
	var data = new FormData(form);
	scottis.send_response('/api/v1.0/add_response', data);
	form.reset();
	scottis.load_responses('/api/v1.0/get_responses?display=true')
}

scottis.load_responses('/api/v1.0/get_responses?display=true');
responseForm.addEventListener('submit', handle_form);