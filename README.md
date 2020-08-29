Cocora -- a COVOID-19 mask compliance reporting app

## Setup

### Netlify
* Configure functions directory `lambdas` (may not be necessary; it should take it from the netlify.toml file)

### AWS 
* Set up an AWS Mysql database with user `admin`
* Create environment variables
    DATABASE_KEY=password
    DATABASE=domain
* Also record this in Netlify→Build&Deploy→Environment

### Google

The hardcoded API key is restricted to working only at cocora.app. To work locally, 
create a .env.local with the line:

`REACT_APP_COCORA_PLACES_KEY=what you get from google`

Do not commit that file to the repository.

You'll need an unrestricted [Google Place API key](https://developers.google.com/places/web-service/get-api-key).

### Start locally
* Start server:


    netlify dev
    
* Browse to http://localhost:8888/.netlify/functions/init
    
