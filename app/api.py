from app import app
from .main import readResponses, saveResponse, deleteResponse
from flask import jsonify, request, redirect, url_for

api_version = 1.0

# API Endpoints
@app.route('/api/v%s/get_responses'%(api_version), methods=['GET'])
def apiGetRoute():
	try:
		if request.args.get('format') == 'list':
			responses = jsonify(readResponses(format='list'))
		else:
			responses = readResponses(format='json')

		# Throw basic error message if json can't be parsed.
		if responses == None:
			error_json = {'error': 'File read error'}
			return jsonify(error_json), 500
		else:
			return responses
	except:
		error_json = {'error': 'Not found'}
		return jsonify(error_json), 500

@app.route('/api/v%s/add_response'%(api_version), methods=['POST'])
def apiAddRoute():
	input = request.form.to_dict().get('response')
	saveResponse(input)

	api_response = {'status': 'Success, your response was recorded.'}
	api_response['response'] = input
	return jsonify(api_response), 202

@app.route('/api/v%s/delete_response/<timestamp>'%(api_version), methods=['GET', 'DELETE'])
def apiDeleteRoute(timestamp):
	deleteResponse(timestamp)

	if request.method == 'GET':
		return redirect(url_for('index'))
	if request.method == 'DELETE':
		api_response = {'status': 'Message successfully deleted.'}
		return jsonify(api_response), 200
