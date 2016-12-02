from app import app
from flask import jsonify, request, redirect, url_for

import requests, sys, json, time

def getAppVersion():
	return json.load(open('package.json', 'r'))['version']

def get_timestamp():
	return str(time.time())

def isNonemptyResponse(input):
	if type(input) == 'NoneType': # Do this first, because calling len() on NoneType fails.
		return False
	if input == 'None':
		return False
# 	if len(input) == 0:
# 		return False
	return True

def isUniqueResponse(data, input):
	for response in data:
		if data[response] == input:
			return False
	return True

def sanitiseInput(input):
	input = str(input)
	input = input.rstrip('.,:;!?').rstrip()
	return input

def createResponseList(data):
	responses = []
	for resp in data:
		resp_item = {}
		resp_item['timestamp'] = resp
		resp_item['message'] = data[resp]
		responses.append(Response(resp_item))
	return responses

def displayResponses(responses):
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

def readResponses(display=False, tries=2):
	for i in range(tries):
		try:
			with open(fname, 'r') as datafile:
				datafile = json.load(datafile)
				if display == False:
					return datafile
				else:
					responses = createResponseList(datafile)
					return displayResponses(responses)
		# If data file is missing, create it and retry.
		except FileNotFoundError:
			createDatafile()
			continue
		except:
			print('Data file read failed.', file=sys.stderr)
			return None

def saveResponse(input):
	data = readResponses()
	if isNonemptyResponse(input) and isUniqueResponse(data, input):
		timestamp = get_timestamp()
		new_info = {}
		new_info[timestamp] = sanitiseInput(input)
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

# from urllib.parse import urlencode
# from urllib.request import Request, urlopen
def createSlackWebhook(message, timestamp):
	hook_url = 'https://hooks.slack.com/services/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'
	delete_url = request.url_root + 'api/v1.0/delete_response/' + timestamp
	payload = {
		'text': 'You are %s' % (message),
		'attachments': [{
			'fallback': 'Scott is %s' % (message),
			# 'title': 'Scott is',
			'text': 'Delete this message? \n%s' % (delete_url),
			'color': '#167EDA'
		}]}
	r = requests.post(hook_url, json=payload)

# API Endpoints
@app.route('/api/v1.0/get_responses', methods=['GET'])
def getRoute():
	try:
		if request.args.get('display') != None:
			responses = readResponses(display=True)
		else:
			responses = readResponses()

		# Throw basic error message if json can't be parsed.
		if responses == None:
			error_json = {'error': 'File read error'}
			return jsonify(error_json), 500
		else:
			return jsonify(responses)
	except:
		error_json = {'error': 'Not found'}
		return make_response(jsonify(error_json), 500)

@app.route('/api/v1.0/add_response', methods=['POST'])
def addRoute():
	input = request.form.to_dict().get('response')
	saveResponse(input)

	api_response = {'status': 'Success, your response was recorded.'}
	api_response['response'] = input
	return jsonify(api_response), 202

@app.route('/api/v1.0/delete_response/<timestamp>', methods=['GET', 'DELETE'])
def deleteRoute(timestamp):
	deleteResponse(timestamp)

	if request.method == 'GET':
		return redirect(url_for('index'))
	if request.method == 'DELETE':
		api_response = {'status': 'Message successfully deleted.'}
		return jsonify(api_response), 200
