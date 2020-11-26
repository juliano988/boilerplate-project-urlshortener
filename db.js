require('dotenv').config();

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

    function saveLinks() {
        const link = new Links({
            original_url: "https://www.youtube.com/watch?v=77S70NhRoBc&ab_channel=Impostor",
            short_url: "192.168.0.19:3000/56382"
        });
        link.save(function(err,data){
            if(err){return console.log(err)}
            console.log(data);
        });
    };

});