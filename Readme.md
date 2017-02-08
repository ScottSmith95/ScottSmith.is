# ScottSmith.is

This is how I start the server up on a local machine. Server-side, I use wsgi. Your setup may vary.

```
sudo apt-get install python3-pip
sudo pip3 install virtualenv
mkdir /var/www/scottsmith.is
cd /var/www/scottsmith.is
git clone git@github.com:ScottSmith95/ScottSmith.is.git root
cd /var/www/scottsmith.is
virtualenv -p python3 .
source root/bin/activate
pip3 install uwsgi flask
pip3 install -r requirements.txt
deactivate
cd root/
npm i
gulp build
python3 local.py
```

Purge and install pip packages: 
```
cd /var/www/scottsmith.is/root
rm -rf {bin,local,lib} && rm {.Python,.Python\ 2}
virtualenv -p python3 .
source bin/activate
pip3 install uwsgi flask
pip3 install -r requirements.txt
deactivate

```

Update pip packages: 
```
cd /var/www/scottsmith.is
source bin/activate
pip3 install -r requirements.txt --upgrade
deactivate

```