const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const fs = require('fs');
const mysql = require('mysql');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    database: "td2_prm",
    host : "localhost",
    user: "root",
    password: ""
});
db.connect(function(err){
  if(err) throw err;
});
// Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Here we set our static routes.
app.use(express.static('public'));
app.use('/clientjs', express.static(__dirname + '/node_modules/clientjs/'));

// Default redirect to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// POST client data to file
app.post('/saveClientData', (req, res) => {
    /*db.connect(function(err) {
        if (err) throw err;
        console.log("Connecté à la base de données MySql!");
    });*/
    let fingerprintHashed = req.body.fingerprintHashed;
    let fingerprint = req.body.fingerprint;
    console.log(fingerprintHashed);
    var select = "SELECT * FROM tad where code_client ='"+fingerprintHashed+"';";
    db.query(select, function(err, results){
      if (err) throw err;
      console.log(results)
      console.log(results.length)
      if(results.length != 0){
        var nbPassage = parseInt(results[0].nbrePassage, 10)
        var update = "UPDATE tad SET nbrePassage = "+ (nbPassage+1)+"  where code_client ='"+fingerprintHashed+"';";
        db.query(update, function(err, results){
          if (err) throw err;
          console.log("J'ai bien update sa mère ! ");
        });
      }else{
        var insert = "INSERT INTO `tad` (`code_client`, `fingerprint`, `horodatage`, `nbrePassage`) VALUES ('"+fingerprintHashed+"', '"+fingerprint+"', '"+new Date()+"', '"+1+"');";
        db.query(insert, function(err, results){
          if (err) throw err;
          console.log("J'ai bien insérer ! ");
        });
      }
    });
    
    
    let savedData = [fingerprintHashed, fingerprint].join(",")+"\n";

    fs.appendFile('infos.txt', savedData, function (err) {
      if (err) throw err;
      console.log('Saved client data', req.body);
    });
    res.sendStatus(200);

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
