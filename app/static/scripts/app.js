'use strict';

/* Global Variables */
var get_url_display = '/api/v1.0/get_responses?format=display'
var get_url = '/api/v1.0/get_responses?format=json'
var post_url = '/api/v1.0/add_response'
var response_json

/* Page Elements */
var mainElement = document.querySelector('main');
var responseForm = document.querySelector('.input-form');
var textInput = document.querySelector('.input-form input[type="text"]');
var submitButton = document.querySelector('.input-form input[type="submit"]');

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
		var response_container_html = "<ul class='responses'></ul>"
		mainElement.insertAdjacentHTML('beforeend', response_container_html);
		var response_container = document.querySelector('.responses');

		var response_number = Object.keys(responses).length
		console.log(response_number);

		// Create an Array of random positions.
		var positions = [];
		positions = generatePositionsArray(100, 100, response_number, 1);


		// Position each response with a random position.
		for (var r in responses) {
			// Add content divs
			var response_html = "<li class='response' id='" + r + "'>" + responses[r] + "</li>";
			response_container.insertAdjacentHTML('afterbegin', response_html);
			var el = document.getElementById(r);
			position(el, positions);
		}
	}

	// Returns a random integer between min (included) and max (excluded)
	// Using Math.round() will give you a non-uniform distribution!
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	// generate random positions
	function generatePositionsArray(maxX, maxY, safeRadius, irregularity) {
		// declarations
		var positionsArray = [];
		var r, c;
		var rows;
		var columns;
		// count the amount of rows and columns
		rows = Math.floor(maxY / safeRadius);
		columns = Math.floor(maxX / safeRadius);
		// loop through rows
		for (r = 1; r <= rows; r += 1) {
			// loop through columns
			for (c = 1; c <= columns; c += 1) {
				// populate array with point object
				positionsArray.push({
					x: Math.round(maxX * c / columns) + getRandomInt(irregularity * -1, irregularity),
					y: Math.round(maxY * r / rows) + getRandomInt(irregularity * -1, irregularity)
				});
			}
		}
		// return array
		return positionsArray;
	}

	// get random position from positions array
	function getRandomPosition(array, removeTaken) {
		// declarations
		var randomIndex;
		var coordinates;
		// get random index
		randomIndex = getRandomInt(0, array.length - 1);
		// get random item from array
		coordinates = array[randomIndex];
		// check if remove taken
		if (removeTaken) {
			// remove element from array
			array.splice(randomIndex, 1);
		}
		// return position
		return coordinates;
	}

	function position(el, positions) {
		var pos = getRandomPosition(positions, true);
		console.log(pos);
		var elWidth = el.clientWidth;
		var elHeight = el.clientHeight;
		var posx = pos['x'];
		var posy = pos['y'];

		el.style.position = 'absolute';
		el.style.left = 'calc('+posx+'% - ' + elWidth + 'px)';
		el.style.top = 'calc('+posy+'% - ' + elHeight + 'px)';
	}

	function make_alert(text, type) {
		if (type === undefined) {
				type = 'neutral';
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
			scottis.remove_alert();
		}, 4000);
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
			scottis.make_alert("Try to keep responses under 20 chars.", 'failure');
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

	return {
		layout: layout,
		make_alert: make_alert,
		remove_alert: remove_alert,
		handle_form: handle_form,
		load_responses: load_responses,
		send_response: send_response
	};
}));

/* Client Actions */
boomsvgloader.load('/static/images/icons/icon-sprite.svg');
scottis.load_responses(get_url);
responseForm.addEventListener('submit', scottis.handle_form);
