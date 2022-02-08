const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const fs = require('fs');
const mysql = require('mysql');

const app = express();
const port = 3000;
const levenshteinDistance = (s, t) => {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[t.length][s.length];
};

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
      //Si on a un résultat :
      if(results.length != 0){
        //Distance de Levenshtein = 0 => ce sont les mêmes fingerprint.
        var leven =levenshteinDistance(results[0].fingerprint, fingerprint);
        if( leven == 0){
          var nbPassage = parseInt(results[0].nbrePassage, 10)
          var update = "UPDATE tad SET nbrePassage = "+ (nbPassage+1)+" where code_client ='"+fingerprintHashed+"';";
          db.query(update, function(err, results){
            if (err) throw err;
            console.log("J'ai bien update sa mère ! ");  
          });
        //Distance de Levenshtein != 0 => c'est une collision.
        }else{
          var insertCollision = "INSERT INTO collision ('id','distance','fk_code_client') VALUES ('0','"+leven+"', '"+fingerprintHashed+"');"
          db.query(insertCollision, function(err, results){
            if (err) throw err;
            console.log("J'ai bien insérer la collision! ");
          });
        }
      //Si pas de résultat, on insert.
      }else{
        var insert = "INSERT INTO `tad` (`code_client`, `fingerprint`, `nbrePassage`) VALUES ('"+fingerprintHashed+"', '"+fingerprint+"', '"+1+"');";
        db.query(insert, function(err, results){
          if (err) throw err;
          console.log("J'ai bien insérer ! ");
        });
      }
    });
    
    /*
    let savedData = [fingerprintHashed, fingerprint].join(",")+"\n";

    fs.appendFile('infos.txt', savedData, function (err) {
      if (err) throw err;
      console.log('Saved client data', req.body);
    });*/
    res.sendStatus(200);

});

//Récupérer tous les fingerprints.
app.get('/getAllFingerprints', (req, res) => {
  var select = "SELECT * FROM tad;";
  db.query(select, function(err, results){
    if (err) throw err;
    console.log("J'ai bien récupérer ! ");
    res.send(results);
  });
});

//Récupérer la somme du nombre de visites.
app.get('/getNbVisites', (req, res) => {
  var select = "SELECT SUM(nbrePassage) FROM tad;";
  db.query(select, function(err, results){
    if (err) throw err;
    console.log("J'ai bien récupérer ! ");
    res.send(results);
  });
});

//Récupérer le nombre de fingerprint.
app.get('/getNbFingerprint', (req, res) => {
  var select = "SELECT COUNT(*) FROM tad;";
  db.query(select, function(err, results){
    if (err) throw err;
    console.log("J'ai bien récupérer ! ");
    res.send(results);
  });
});

//Récupérer le nombre de collisions.
app.get('/getNbCollision', (req, res) => {
  var select = "SELECT COUNT(*) FROM collision;";
  db.query(select, function(err, results){
    if (err) throw err;
    console.log("J'ai bien récupérer ! ");
    res.send(results);
  });
});

//Récupérer la moyenne des distances des collisions.
app.get('/getMoyenneCollision', (req, res) => {
  var select = "SELECT MOY(distance) FROM collision;";
  db.query(select, function(err, results){
    if (err) throw err;
    console.log("J'ai bien récupérer ! ");
    res.send(results);
  });
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
