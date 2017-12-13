'use strict'
//Package imports
let express = require('express');
let app = express();
let appDetails = require('./package.json')
//Settings
const PORT = 3000;
//Ping response
app.get('/ping',(req,res)=>{
  res.end(`PONG, version ${appDetails.version}`);
});

app.listen(PORT,()=>{
  console.log(`Listening on port ${PORT}`);
})
