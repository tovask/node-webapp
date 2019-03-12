
# install:

sudo apt update
sudo apt upgrade

# monitoring
sudo apt install mc htop

# web server
sudo apt install apache2
sudo apache2ctl configtest 
sudo service apache2 status
sudo netstat -ltunp

# sql server
sudo apt install mysql-server
sudo mysql_secure_installation # set the root password SqlR00tP@ssword
sudo mysql # optionally enable root login (not in production)
# ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'SqlR00tP@ssword';

# install PHPMyAdmin
sudo apt install php libapache2-mod-php php-mysql
sudo systemctl restart apache2
sudo apt install phpmyadmin php-mbstring php-gettext # give the root password: SqlR00tP@ssword
sudo phpenmod mbstring
sudo vi /etc/phpmyadmin/apache.conf # optional: set custom path /phpmyadmin -> /arbitrarypmaurl
sudo vi /usr/share/phpmyadmin/libraries/sql.lib.php
	#601: (count($analyzed_sql_results['select_expr'] == 1) -> ((count($analyzed_sql_results['select_expr']) == 1)
sudo systemctl restart apache2

# install node
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install nodejs

# install process manager
sudo npm install -g pm2
pm2 startup
	# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# configure server proxy settings
#https://linuxtogether.org/configuring-reverse-proxy-for-node-using-apache-mod-proxy/
#https://stackoverflow.com/questions/43531965/apache-nodejs-phpmyadmin-https
#https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxypass
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo vi /etc/apache2/sites-available/000-default.conf
	# ProxyRequests on
	# ProxyPass /arbitrarypmaurl !
	# ProxyPass / http://localhost:3000/
	# ProxyPassReverse / http://localhost:3000/
sudo systemctl restart apache2

# install node modules
npm install express mysql express-mysql-session passport passport-google-oauth20 connect-ensure-login ejs

# start up the project
pm2 start ecosystem.config.js
pm2 save
# other useful pm2 commands:
#pm2 list
#pm2 logs mynodeproject --lines 100
#pm2 restart 1
#pm2 stop 0
#pm2 delete 0


# enable the sql cache
sudo vi /etc/mysql/my.cnf
	# [mysqld]
	# query_cache_type = 1

# increase the amount of inotify watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

