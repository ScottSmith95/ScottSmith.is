cd /var/www/scottsmith.is/root/
/var/www/scottsmith.is/root/bin/uwsgi --ini scottsmith.is.ini


# /var/www/scottsmith.is/root/bin/uwsgi --socket 0.0.0.0:5000 --protocol=http -w wsgi:app
# /var/www/scottsmith.is/root/bin/uwsgi --socket 0.0.0.0:5000 --protocol=http --wsgi-file wsgi:app
# /var/www/scottsmith.is/root/bin/uwsgi --socket 127.0.0.1:5000 --ini scottsmith.is.ini
# /var/www/scottsmith.is/root/bin/uwsgi --http 127.0.0.1:5000 --home root --wsgi-file wsgi.py --callable main --master
# /var/www/scottsmith.is/root/bin/uwsgi --socket 0.0.0.0:5000 --protocol=http -w wsgi:app