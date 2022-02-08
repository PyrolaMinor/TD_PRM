const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

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
    let fingerprintHashed = req.body.fingerprintHashed;
    let fingerprint = req.body.fingerprint;

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
