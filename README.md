# Big Data Planning
A repository to handle big data applications and responses.


# Running the application

## Redis Installation
  You need to have a local server of redis installed and runninng on your device. 
  If not you can also configure a cloud instance of redis, but be sure to change your env vars accordingly

## ENV Setup
  - REDIS_PORT             ---   ; Specify the port number for redis server
  - APPLICATION_PORT       ---   ; Specify the port number for the node application
  - REDIS_HOST             ---   ; specify the URL or localhost(127.0.0.1) for redis host machine
  - APPLICATION_HOST       ---   ; specify the URl or localhost(127.0.0.1) for node server

## Running application
  - run the application using the command `node index.js`. Wait for the application to sucessfully connect to redis before proceeding.

## Running redis server locally
  - for MacOS users use the command `brew services start redis` followed by `redis-cli` to check if you can log into the redis shell

  - for Linux(Ubuntu) users, use the command `sudo systemctl services start redis` followed by `redis-cli` to log into the redis shell 
