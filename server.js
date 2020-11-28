require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Initializing db
const mongoose = require('mongoose');
mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  const shortenSchema = new mongoose.Schema({
    original_url: String,
    short_url: String
  });
  const Links = mongoose.model('Links', shortenSchema);

  // db functions
  function saveLinks(_org, _shr) {
    let short;
    let flag;
    do {
      const randomCode = Math.round(Math.random() * 99999).toString(10).padStart(5, "0");
      short = _shr + randomCode;
      Links.find({ short_url: short }).exec(function (err, data) {
        if (err) { return console.log(err) };
        flag = data.length;
      });
    } while (flag === 0);
    const link = new Links({
      original_url: _org,
      short_url: short
    });
    link.save(function (err, data) {
      if (err) { return console.log(err) }
    });
    return ({ original_url: _org, short_url: short });
  };

  // server functions
  app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

  app.post('/api/shorturl/new', function (req, res) {
    if ((/^(http|https):\/\/.+/).test(req.body.link)) {
      const original = req.body.link;
      const short = req.headers.host + '/api/shorturl/';
      Links.find({ original_url: original }).exec(function (err, data) {
        if (err) { return console.log(err) };
        if (data.length && data[0].get('original_url') === original) {
          res.json({ original_url: data[0].get('original_url'), short_url: data[0].get('short_url') });
        } else {
          res.json(saveLinks(original, short));
        }
      });
    }
    else {
      res.json({ error: 'invalid url' });
    }
  });

  app.get('/api/shorturl/:link', function (req, res) {
    Links.find({ short_url: req.headers.host + req.path }).exec(function (err, data) {
      if (err) { return console.log(err) };
      if (data.length) {
        res.redirect(data[0].get('original_url'));
      } else {
        res.json({ error: 'invalid url' });
      }
    });
  });

  app.get('/regs',function(req,res){
    Links.find({}).select('original_url short_url').sort('original_url').exec(function(err,data){
      if(err){return console.log(err)};
      res.json(data);
    });
  })

  //Listening server...
  app.listen(port, function () {
    console.log(`Listening on port ${port}`);
  });

});