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
	for response in data:
		if data[response] == input:
			return False
	return True

def sanitiseInput(input):
	'''Ensures input is a typed as a string and
	   strips extraneous puctuation and spaces.
	'''
	input = str(input)
	input = input.rstrip('.,:;!?').rstrip()
	return input

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

def readResponses(format='dict', tries=2):
	for i in range(tries):
		try:
			with open(fname, 'r') as datafile:
				datafile = json.load(datafile)
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
