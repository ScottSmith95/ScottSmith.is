from app import app
from .api import getAppVersion, readResponses, saveResponse
from flask import request, render_template

# Index
@app.route('/', methods=['GET', 'POST'])
def index():
	template_vals = {}
	template_vals['app_version'] = getAppVersion()
	template_vals['main_text'] = 'Scott is…'
	template_vals['responses'] = readResponses(display=True)

	if request.method == 'POST':
		input = request.form.get("response")
		saveResponse(input)

	return render_template('index.html', template_vals=template_vals)
