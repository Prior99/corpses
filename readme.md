Installation
============
This software utilizes [node](http://nodejs.org/) as serversoftware. All relevant packages are installed via nodes packagemanager **npm**.
The whole buildsystem is written in [grunt](http://gruntjs.com/), clientside scripts are installed using [bower](http://bower.io/).

0. Cloning this repository
--------------------------
Clone this repository somewhere to your system. Either do this by invoking:

	git clone <URL to where you found this repository>

Or by downloading a release from this website.
If you cloned the repository and want to use a stable release instead of bleeding edge, you need to checkout the respective release. For example to check out alpha 1.0.0 just type:

	git checkout alpha_1.0.0

To get a list of all available releases, type:

	git tag

If you just downloaded a compressed package from this website, you do not need to do this if you downloaded the correct version.

There should also be a tag named ```stable``` which should always point to the latest stable release.

1. Installing node
------------------
Make sure **node** is installed on your system. On a Debian or Ubuntu based machine you can install it using aptitude:

	apt-get install nodejs

Or download the respective package from [nodejs.org](http://nodejs.org/). For all other systems, including windows and mac please also download it from there.

2. Installing npm packages
--------------------------
After node was installed, you have to install all relevant packages via **npm**:

	npm install

In order to use **grunt** and **bower** from the commandline you also have to run:

	npm install -g grunt-cli
	npm install -g bower

3. Installing bower components
------------------------------
Clientsided dependencies are managed via **bower**. In order to install all dependencies just run:

	bower install

4. Building
-----------
Yes, modern javascript applications need to be built! You can do this simply by invoking:

	grunt

This will minify the sourcecode, create sourcemaps, inject all dependencies into the html files an compile the files together in the ```htdocs/``` directory.

5. Publishing
--------------
Choose a decent webserver, I am sure you have one already installed on your system. If not, I can recommend [apache2](http://httpd.apache.org/). You need to make the ```htdocs/``` directory accessible, please refer to your webservers manual for this.

I recommend linking the folder as the server will need write-access to it. I did something like this:

	ln -s /path/to/webui/htdocs /var/www/7dtd

Or if using windows:

	mklink /D X:\path\to\www\7dtd X:\path\to\webui\htdocs

And was abled to reach the webinterface via example.org/7dtd afterwards. Please note that following symlinks has to be enabled in your webserver for this to work.

6. Setting up a database
------------------------
This webinterface is currently using **mysql** as it's database. If you do not have **mysql** installed, you might want to do this. Part of  installing and managing a **mysql**-server is not part of this readme.
Create a new database and a new user, grant the user all privileges for the database and give it a decent password.

7. Configuring the server
-------------------------
Take a look in the ```server/``` directory. There should be a ```config.json.example``` file. Copy it and rename the copy to ```config.json```.
The contents should look like this:

	{
		"websocketPort" : "4733",
		"telnetPort" : "8081",
		"telnetHost" : "localhost",
		"clientDirectory" : "htdocs/",
		"mapDirectory" : "/home/sdtd/instances/my_instance/Random Gen/my_map/map",
		"database" : {
			"host": "localhost",
			"user": "root",
			"password": "",
			"database" : "7dtd"
		},
		"kickUnregistered": true,
		"website": "example.org"
	}

Set the ```websocketPort``` to some free port on your system. The server will automatically configure the webui to use this port.

If you did not change the port of the *telnet interface* in the 7 days to die server, you do neither need to edit ```telnetPort``` nor ```telnetHost```.

The setting ```clientDirectory``` needs to point to the ```htdocs``` directory the webui is hosted in. If you linked it and did not move it, you do not need to change this. If you did move it, please point it to the correct directory.

The next one is a bit tricky: We need the path to where the 7 days to die server drops the rendered map. The server will try to link this into the webuis directory so it has access to the map and your users can see the map at all.
Please point ```mapDirectory``` to the corresponding directory. If you are using Allocs scripts, this should be: ```/home/sdtd/instances/<Name of your instance>/Random Gen/<Name of your map>/map```.

Please insert the information for the user and database you created in the ```database``` settings.

If you set ```kickUnregistered``` to true, the server will also operate as a whitelist as every user that did not register at the webui and was enabled by an administrator will be kicked. If you do not need this, please set this to ```false```.

At last you need to set ```website``` to your the url to where your webui is publicly available in order to point users to for example in the kick-reason or in the chat.

*Whew*. You are now done configuring the server.

8. Starting the server
----------------------
You can start the server using:

	./start.sh

Or on windows (or if you prefer not to use the script):

	node server/src/startup.js

If everything went right, this should produce an output similiar to this:

	Initializing Telnetclient... Initializing Telnetclient okay.
	Connection to 7DTD established.
	Connecting to Database... Starting Websocketserver...
	Connecting to Database done.
	Getting tables ready ... All tables okay.

The order can be different as the server is heavily eventbased.

I recommend running the server in a **screen** session for the time being, an init-script as well as more scripts will be available in a later release.
