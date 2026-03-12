# PRO200SecurityCamera
This project is an attempt at a security camera application designed to function exclusively when a human face is on camera.

## Requirements
In order to run this program you'll need the latest version of node and npm installed on your system;

Note that the database is restricted and you may need to create your own redis database through docker on your system;

## Setup
To run this program, run an `npm update` to ensure all dependencies are loaded, then just run `npm start` within the project's directory and open up the localhost link provided in the terminal.

The program uses a .env file in the root directory in order to handle access to the redis database- basic setup is:
``
REDIS_URL=redis://{database_name}:{password}
REDIS_HOST=localhost/{IP_address}:{port}
``

## Known issues
Currently the program is only capable of detecting faces, but not storing any image data to the connected database.
