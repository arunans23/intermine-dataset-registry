# intermine-dataset-registry

This is a web application which shows the datasets of all the mines available in the [Intermine Registry](http://registry.intermine.org/) and its relevant data sources. 

# API info

* `GET` /service/datasets                   Get all the datasets
* `GET` /service/last-update                Get the details of last update details
* `GET` /service/datasets/{datasetIDorName} Get a database by its ID or name


## Installation ##

1. Install [Node.js](https://nodejs.org/en/download/) on your host.

2. Install [MongoDB](https://docs.mongodb.com/getting-started/shell/installation/) on your host.

3. Clone this repository

4. Go inside the directory and from your terminal
```
npm install
```
5. To run the application, being on the same directory:
```
npm start
```