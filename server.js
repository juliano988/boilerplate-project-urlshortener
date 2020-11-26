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

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Initializing db
const mongoose = require('mongoose');
mongoose.connect(process.env.URI, { useNewUrlParser: true , useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    const shortenSchema = new mongoose.Schema({
        original_url: String,
        short_url: String
    });
    const Links = mongoose.model('Links', shortenSchema);

    // db functions
    function saveLinks(org,shr) {
        const link = new Links({
            original_url: org,
            short_url: shr
        });
        link.save(function(err,data){
            if(err){return console.log(err)}
            console.log(data);
        });
    };

    // server functions
    app.post('/api/shorturl/new',function(req,res){
      if((/^(http|https):\/\/.+/).test(req.body.link)){
        const randomCode = Math.round(Math.random()*99999).toString(10).padStart(5,"0");
        const original = req.body.link;
        const short = req.headers.host+'/'+randomCode;
        saveLinks(original,short);
        res.json({ original_url : original, short_url : short});
      }
      else{
        res.json({ error: 'invalid url' });
      }
    });

    //Listening server...
    app.listen(port, function() {
      console.log(`Listening on port ${port}`);
    });

});
