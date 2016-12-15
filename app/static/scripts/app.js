'use strict';

/* Global Variables */
var get_url_display = '/api/v1.0/get_responses?format=display'
var get_url = '/api/v1.0/get_responses?format=json&length=50'
var post_url = '/api/v1.0/add_response'
var response_json

/* Page Elements */
var mainElement = document.querySelector('main');
var responseForm = document.querySelector('.input-form');
var textInput = document.querySelector('.input-form input[type="text"]');
var submitButton = document.querySelector('.input-form input[type="submit"]');
var helpButton = document.querySelector('header .help');
var helpText = document.querySelector('.help-text');

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
		// Add Response container to DOM.
		var response_container = document.querySelector('.responses');
		if (response_container) {
			response_container.remove();
		}
		var response_container_html = "<ul class='responses'></ul>"
		mainElement.insertAdjacentHTML('beforeend', response_container_html);
		// Redefine element after removal.
		response_container = document.querySelector('.responses');

		var response_number = Object.keys(responses).length

		// Position each response with a random position.
		for (var r in responses) {
			// Add content divs
			var response_html = "<li class='response' id='" + r + "'>" + responses[r] + "</li>";
			response_container.insertAdjacentHTML('afterbegin', response_html);
			var el = document.getElementById(r);
			word_cloud(el);
		}
	}

	function getRandomIntInclusive(min, max) {
	  min = Math.ceil(min);
	  max = Math.floor(max);
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function word_cloud(el) {
		var mod = getRandomIntInclusive(1, 4)
		el.classList.add('size' + mod);
	}

	function make_alert(text, type, duration) {
		if (type === undefined) {
				type = 'neutral';
		}
		if (duration === undefined) {
				duration = 4000;
		}

		if (document.getElementById('status')) {
			var statusEl = document.getElementById('status');
			statusEl.className = '';
			statusEl.classList.add('status', type)
			statusEl.innerHTML = text
		} else {
			var alert_html = "<div id='status' class='status " + type + "' role='alert' aria-live='assertive'><p>"
				+ text
				+ "</p></div>";
			responseForm.insertAdjacentHTML('afterend', alert_html);
		}

		// Remove alert after 3s.
		setTimeout(function() {
			remove_alert();
		}, duration);
	}

	function remove_alert() {
		var statusEl = document.getElementById('status');
		statusEl.classList.add('remove');

		setTimeout(function() {
			statusEl.remove();
		}, 1000);
	}

	function handle_form(event) {
		event = event || window.event;
		event.preventDefault();
		var targ = event.target || event.srcElement;
		var form = targ;
		if (textInput.value.length > 20) {
			scottis.make_alert("Try to keep responses under 20 chars. 😅", 'failure');
			return false
		}
		if (textInput.value.length == 0) {
			scottis.make_alert("You've gotta actually have something to say. 😒", 'failure');
			return false
		}
		var data = new FormData(form);
		scottis.send_response(post_url, data);
		form.reset();
	}

	function load_responses(url) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.open('GET', url, true);
		httpRequest.send();
		httpRequest.onload = function(e) {
			response_json = JSON.parse(httpRequest.responseText);
			scottis.layout(response_json);
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
				scottis.make_alert("Success! Message posted. 👍", 'success');
				load_responses(get_url)
			} else {
				scottis.make_alert("Uh small problem. Tell me about it. 😕", 'failure');
				console.log('There was a problem with the request.');
			}
		}
	}

	function help_button(event) {
		event = event || window.event;
		event.preventDefault();
		helpButton.classList.toggle('visible');
		helpText.classList.toggle('hidden');
		helpText.classList.toggle('visible');
	}

	function help_setup() {
		if (window.location.hash == '#help') {
			helpButton.classList.toggle('visible');
			helpText.classList.remove('hidden');
		}
	}

	return {
		layout: layout,
		make_alert: make_alert,
		handle_form: handle_form,
		load_responses: load_responses,
		send_response: send_response,
		help_button: help_button,
		help_setup: help_setup
	};
}));

/* Client Actions */
try {
	boomsvgloader.load('/app/static/images/icons/icon-sprite.svg');
} catch (e) {
	console.log(e)
}

scottis.load_responses(get_url);
responseForm.addEventListener('submit', scottis.handle_form);
scottis.help_setup();
helpButton.addEventListener('click', scottis.help_button);
