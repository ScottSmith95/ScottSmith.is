from app import app
from flask import jsonify, request

import requests, sys, json, time

def getAppVersion():
	return json.load(open('package.json', 'r'))['version']

def get_timestamp():
	return str(time.time())

def isNonemptyResponse(input):
	input = sanitiseInput(input)
	if type(input) == 'NoneType': # Do this first, because calling len() on NoneType fails.
		return False
	if input == 'None':
		return False
	if len(input) == 0:
		return False
	return True

def isUniqueResponse(data, input):
	'''Searches a dict of response data and returns False
	   If a duplicate entry is found.
	'''
	input = input.lower()
	for response in data:
		if data[response].lower() == input:
			return False
	return True

import re, cgi
def sanitiseInput(input):
	'''Ensures input is a typed as a string and
	   strips extraneous puctuation and spaces.
	'''
	santised = str(input)
	# Remove HTML like so: http://stackoverflow.com/a/19730306/1867887
	santised = re.compile(r'(<!--.*?-->|<[^>]*>)')
	# Remove well-formed tags, fixing mistakes by legitimate users
	santised = santised.sub('', input)
	# Clean up anything else by escaping
	santised = cgi.escape(santised)
	# Remove extraneous spaces and punctuation too.
	santised = santised.lstrip().rstrip('.,:;!?').rstrip()
	return santised

def createResponseList(data):
	'''Create list of Response objects.'''
	responses = []
	for resp in data:
		resp_item = {}
		resp_item['timestamp'] = resp
		resp_item['message'] = data[resp]
		responses.append(Response(resp_item))
	return responses

def displayResponses(responses):
	'''Create list of sorted Response object messages.'''
	responses.sort(key=lambda x: x.timestamp, reverse=True)
	display_responses = [r.message for r in responses]
	return display_responses

class Response():
	def __init__(self, resp_item):
		self.timestamp = resp_item['timestamp']
		self.message = resp_item['message']

	def __str__(self):
		return_str = 'Message: %s\nTimestamp: %s\n\n' % (self.message, self.timestamp)
		return return_str

fname = 'app/data.json'

def createDatafile():
	file = open(fname, 'w')
	file.write('{}')
	file.close

def readResponses(length=None, format='dict', tries=2):
	for i in range(tries):
		try:
			with open(fname, 'r') as datafile:
				datafile = json.load(datafile)

				if length is not None:
					length = int(length)
					# Protect from trying to grab too many keys.
					if length > len(datafile):
						length = len(datafile)

					responses = {}
					for i in range(length):
						item = datafile.popitem()
						responses[item[0]] = item[1]
					datafile = responses

				if format == 'dict':
					return datafile
				elif format == 'list':
					responses = createResponseList(datafile)
					return displayResponses(responses)
				elif format == 'json':
					return jsonify(datafile)
		# If data file is missing, create it and retry.
		except FileNotFoundError:
			createDatafile()
			continue
		except:
			print('Data file read failed.', file=sys.stderr)
			return None

def saveResponse(input):
	data = readResponses(format='dict')
	if isNonemptyResponse(input) and isUniqueResponse(data, input):
		timestamp = get_timestamp()
		input = sanitiseInput(input)
		new_info = {}
		new_info[timestamp] = input
		data.update(new_info)
		createSlackWebhook(input, timestamp)
		try:
			with open(fname, 'w') as datafile:
				json.dump(data, datafile, sort_keys=True, indent=2)
		except:
			print('Data file save failed.', file=sys.stderr)
			return None

def deleteResponse(timestamp):
	try:
		with open(fname, 'r') as datafile:
			data = json.load(datafile)
			if timestamp in data:
				del data[timestamp]
		with open(fname, 'w') as datafile:
			json.dump(data, datafile, sort_keys=True, indent=2)
	except:
		print('Delete failed.', file=sys.stderr)
		return None

def createSlackWebhook(message, timestamp):
	hook_url = 'https://hooks.slack.com/services/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'
	delete_url = request.url_root + 'api/v1.0/delete_response/' + timestamp
	payload = {
		'attachments': [{
			'fallback': message,
			'title': message,
			'text': '<%s|Delete>' % (delete_url),
			'color': '#167EDA'
		}]}
	r = requests.post(hook_url, json=payload)
