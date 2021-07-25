# [Secrets-signIn-authentication]

## Steps to View Project :

- DOWNLOAD the .zip file or clone the rep.
- cd to the folder where the where the starting files exist .
- Install the dependencies from your package.json file OR Run the following command

              $ npm install
              
- After the installation is complete run the following command .

              $ node index.js

Refer to the comments in the source code for more info . 



## Different levels of security for passwords on a website .
(Level increases with every subsequent commit)

## LEVEL 1 : Saving Id and password to database

## LEVEL 2 : using mongoose-encryption to encrypt password and save onto database.
### -(adding environment variables using dotenv package)

## LEVEL 3 : using md5 HASHING package to hash password and save onto database.

## LEVEL 4 : SALTING and HASHING then saving cookies & seesions onto browser
   #### using packages - passport,passport,passport-local ,passport-local-mongoose ,express-session

## LEVEL 5 : Adding google authentication
   #### using packages - passport-google-oauth20 

(The Project is hosted on a local device with a local database so,
feel free to clone the rep. and run on your devie it via 'node app.js' 
DO NOT FORGET TO RUN MONGOD)

