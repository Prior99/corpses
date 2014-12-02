CORPSES
=======
CORPSES stands for **Comprehensive Online (Route) Planning-, Social- and Explorationsystem**.

This is most of all a webbased map for the popular game *7 Days To Die* from *The Fun Pimps*.

This software requires an own server that interops with the telnet interface of the 7DTD server itself, utilizes a database and listens for incoming websocketconnections to run commands executed by the webinterface published via http using your systems default webserver.

Requirements
============
This software should run on every plattform that supports [NodeJS](http://nodejs.org/) and allows hosting a webpage (Allmost every operatingsystem does this), but only Linux (Debian, Ubuntu and Arch) and Windows were tested). You will need access to a database on a MySQL server as well as a 7DTD server itself.

What could also be necessary is a decent cup of hot chocolate for the duration of the installationprocess.


Installation
============
This software utilizes [NodeJS](http://nodejs.org/) as serversoftware. All relevant packages are installed via nodes packagemanager **npm**.
The whole buildsystem is written in [Grunt](http://gruntjs.com/), clientside scripts are installed using [Bower](http://bower.io/).

Preparing
-----------
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
Make sure **NodeJS** is installed on your system. On a Debian or Ubuntu based machine you can install it using aptitude:

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
This webinterface is currently using **MySQL** as it's database. If you do not have **MySQL** installed, you might want to do this. Installing and managing a MySQL server is not part of this readme.
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

If you did not change the port of the *telnet interface* in the 7 days to die server and it is running on the same machine as this server, you do neither need to edit ```telnetPort``` nor ```telnetHost```.

The setting ```clientDirectory``` needs to point to the ```htdocs/``` directory the webui is hosted in. If you linked it and did not move it, you do not need to change this. If you did move it, please point it to the correct directory.

The next one is a bit tricky: We need the path to where the 7 days to die server drops the rendered map. The server will try to link this into the webuis directory so it has access to the map and your users can see the map at all.
Please point ```mapDirectory``` to the corresponding directory. If you are using Allocs scripts, this should be: ```/home/sdtd/instances/<Name of your instance>/Random Gen/<Name of your map>/map```.

Please insert the information for the user and database you created in the ```database``` settings.

If you set ```kickUnregistered``` to true, the server will also operate as a whitelist as every user that did not register at the webui and was enabled by an administrator will be kicked. If you do not need this, please set this to ```false```.

At last you need to set ```website``` to your the url to where your webui is publicly available in order to point users to for example in the kick-reason or in the chat.

*Whew*. You are now done configuring the server.

8. Preparing the 7 days to die server
-------------------------------------

You need to have [Allocs fixes](http://7dtd.illy.bz) installed to interopt with the server.
Please install them following their instructions. If you are using Allocs scripts to manage the server (e.g. in linux), then they are already installed.

You need to make the server render the map. Use a telnet client (I recommend putty when using windows) and connect to ```localhost``` on port ```8081``` if you did not change the port in the configuration of the 7 days to die server.
Run the commands

	enablerendering

to enable live rendering as well as

	rendermap

to render the part of the map that was already discovered.

9. Starting the server
----------------------
You can start the server using:

	node server/src/startup.js

If everything went right, this should produce an output similiar to this:

	Initializing Telnetclient... Initializing Telnetclient okay.
	Connection to 7DTD established.
	Connecting to Database... Starting Websocketserver...
	Connecting to Database done.
	Getting tables ready ... All tables okay.

The order can be different as the server is heavily eventbased.

I recommend running the server in a **screen** session for the time being, an init script as well as more management and configuration scripts will be available in a later release.

Admin
=====
The first user who registers on the server will be automatically an administrator. Make sure that you are the first one to register.

Contributors
============
This software was mainly written by:

  * Soana (Andra Ruebsteck)
  * Prior (Frederick Gnodtke)

If you would like to contribute to this project we of course would be happy. Just fork this project and send us a pull-request.

Thanks to
=========
**Alloc** for his server fixes as without them there would be neither maprendering nor a decent telnetinterface.

Every contributor of every dependency we are using.

The Fun Pimps for creating this game.
