from app import app
from flask import jsonify, make_response, request, abort

import sys, json, time

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

def isUniqueResponse(postdata, input):
	for response in postdata:
		if postdata[response] == input:
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

def readResponses(display=False):
	try:
		with open(fname, 'r') as datafile:
			datafile = json.load(datafile)
			if display == False:
				return datafile
			else:
				responses = createResponseList(datafile)
				print(responses, file=sys.stderr)
				return displayResponses(responses)
	except:
		print('Data file read failed.', file=sys.stderr)
		return None

def saveResponse(input):
	postdata = readResponses()
	if isNonemptyResponse(input) and isUniqueResponse(postdata, input):
		postdata[get_timestamp()] = sanitiseInput(input)
		try:
			with open(fname, 'w') as datafile:
				json.dump(postdata, datafile)
		except:
			print('Data file save failed.', file=sys.stderr)
			return None


# API Endpoints
@app.route('/api/v1.0/get_responses', methods=['GET'])
def getResponses():
	try:
		if request.args.get('display') != None:
			responses = readResponses(display=True)
		else:
			responses = readResponses()
		return jsonify(responses)
	except:
		error_json = {'error': 'Not found'}
		return make_response(jsonify(error_json), 404)

@app.route('/api/v1.0/add_response', methods=['POST'])
def addResponse():
	input = request.form.to_dict().get('response')
	saveResponse(input)

	api_response = {'status': 'Success, your response was recorded.'}
	api_response['response'] = input
	return jsonify(api_response), 201
