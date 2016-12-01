from __future__ import print_function # In python 2.7

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

fname = 'app/data.json'

def readResponses(display=False):
	try:
		with open(fname, 'r') as datafile:
			datafile = json.load(datafile)
			if display == False:
				return datafile
			else:
				display_data = []
				for i in datafile:
					display_data.append(datafile[i])
				return display_data
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