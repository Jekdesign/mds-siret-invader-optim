# Siret Invader

## Introduction
Siret Invader is a mongodb indexor of high volumetry for the gouvernement account which can insert data from csv format to a NoSQL (MongoDB) database.

## Requirement
* NodeJS & NPM
* PM2 version 3.5.0
* MongoDb & MongoDb Compass

## Installation
Download the project on your compurter, get in the directory and download the dependencies :
```
> git clone 'https://github.com/Jekdesign/mds-siret-invader-optim.git'
> cd siret-invader
> npm i
```
Then :
* Download [the csv source file by clicking here](https://www.data.gouv.fr/fr/datasets/r/7e73e851-3b07-45e6-a29a-506733eafb2d "StockEtablissement_utf8.zip").
*  Save the .zip in the `originalZipFile` folder if you don't want to stock the document in your personal files.
* Unzip the csv content in `originalFile`, then rename it as `stock.csv`
* To finish, create an empty folder in the root and name it as `splittedFiles`
## Usage

### Available Commandes :
To start the process :
```
> npm run start
> or
> npm start
```
To pause the process :
```
> npm run pause
```
To restart the process :
```
> npm run restart
```
To delete all the running process :
```
> npm run kill
```
### The working way :
* The process is running with pm2.
* It split the csv file in many csv files. (if already done, it only takes the content in the `splittedFiles` folder)
* It starts 2 instances of the `insertDb.js` child process.
* The child process send a `'ready'` message to the parent process.
* Then the parent process send a filename to the child process who is awake.
* The process transform the csv lines into json lines and then it insert it into `mongodb` by using `bulk` method.
* At every insertion, the child process send a `'delete'` message to tell the parent to delete 1000 lines from the file.
* Once done, it send a finish message to tell the parent process to delete the file and to send another one.

### Warning :
If the processes are too heavy for your device, you can change the instances number in the `index.js` file, in the `conf` constant.
# mds-siret-invader-optim
