Pep Band Manager Web App
==========================

About
--------
This is a web application designed to replace the (outdated) Pep Band Manager Suite client application.


Setup
--------
TODO

Client side setup: 
1. Install node.js
2. Migrate any existing data into a sqlite database. Put this database in node/db
3. cd into the node folder and run 'node server/server.js' from the terminal. 


Code Structure
---------------

* 'migration' contains code to conver the data from the old format to multiple SQL files
* 'node' contains the server code. It is designed that it can be run locally (with no authentication), or
on a public server over SSL
* 'php' cointains old code when the project was written in PHP.
