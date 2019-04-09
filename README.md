# CRUD web application in Node.js

### Using:
- [express](https://expressjs.com/) for server
- [ejs](https://ejs.co/) for template engine
- [multer](https://github.com/expressjs/multer) for file upload
- [passport](http://www.passportjs.org/) for authentication
- [mysql](https://www.mysql.com/) for database
- [pm2](https://pm2.keymetrics.io/) for process manager

## Instructions:

### install the web server:
```
sudo apt update && sudo apt upgrade
sudo apt install apache2
sudo apache2ctl configtest 
sudo service apache2 status
```

### install the sql server:
```
sudo apt install mysql-server
sudo mysql_secure_installation # set the root password eg.: SqlR00tP@ssword
```
optionally enable root login (not in production)
```
echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'SqlR00tP@ssword';" |
	sudo mysql
```

### install PHPMyAdmin
```
sudo apt install php libapache2-mod-php php-mysql
sudo systemctl restart apache2
sudo apt install phpmyadmin php-mbstring php-gettext # type the root password
sudo phpenmod mbstring
```
optional security: set custom path /phpmyadmin -> /mypmaurl
```
sudo vi /etc/phpmyadmin/apache.conf
```
```
sudo vi /usr/share/phpmyadmin/libraries/sql.lib.php
	#601: (count($analyzed_sql_results['select_expr'] == 1) -> ((count($analyzed_sql_results['select_expr']) == 1)
sudo systemctl restart apache2
```

### install node
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install nodejs
```

### install process manager
```
sudo npm install -g pm2
pm2 startup
```

### configure server proxy settings
help:  
https://linuxtogether.org/configuring-reverse-proxy-for-node-using-apache-mod-proxy/  
https://stackoverflow.com/questions/43531965/apache-nodejs-phpmyadmin-https  
https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxypass  
`sudo a2enmod proxy`  
`sudo a2enmod proxy_http`  
`sudo vi /etc/apache2/sites-available/000-default.conf`  

	ProxyRequests on
	ProxyPass /mypmaurl !
	ProxyPass / http://localhost:3000/
	ProxyPassReverse / http://localhost:3000/

`sudo systemctl restart apache2`  

### install node modules
```
npm install express mysql express-mysql-session passport passport-google-oauth20 connect-ensure-login ejs
```

### start up the project
```
pm2 start ecosystem.config.js
pm2 save
```

### other useful pm2 commands:
```
pm2 list
pm2 logs mynodeproject --lines 100
pm2 restart 1
pm2 stop 0
pm2 delete 0
```

### optional for speed-up: enable the sql cache
`sudo vi /etc/mysql/my.cnf`  

	[mysqld]
	query_cache_type = 1

### optional: increase the amount of inotify watchers
`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

