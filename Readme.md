# ScottSmith.is

This is how I start the server up on a local machine. Server-side, I use wsgi. Your setup may vary.

```
sudo apt-get install python3-pip
sudo pip3 install virtualenv
mkdir /var/www/scottsmith.is
cd /var/www/scottsmith.is
git clone git@github.com:ScottSmith95/ScottSmith.is.git root
virtualenv -p python3 root
source root/bin/activate
pip3 install uwsgi flask
pip3 install -r root/requirements.txt
deactivate
cd root/
npm i
gulp build
Python3 local.py
```