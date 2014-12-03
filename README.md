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
Please refer to the [official wiki page](https://git.cronosx.de/prior/corpses/wikis/installation).


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
