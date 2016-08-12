var express = require("express");
var mongoose = require("mongoose");
var Guid = require("guid");

var port = process.env.PORT || 8080;
var baseUrl = process.env.LURL_BASE_URL || "http://localhost:8080";

if (!process.env.MONGO_URI) {
    console.log("You must set MONGO_URI");
    process.exit(0);
}

mongoose.connect(process.env.MONGO_URI);

var app = express();

var Url = mongoose.model('url', { id: String, url:String });

app.get("/:urlcode", function(req, res) {
    var urlCode = req.params.urlcode;
    
    Url.findOne({ id: urlCode }, function(err, record) {
        if (err) console.log(err);
        
        if (!record||!record.url) {
            res.json({error: "not_found"});
        } else {
            console.log(record.url);
            res.redirect(record.url);
        }
    });
  
});

app.get("/new/:url", function(req, res) {
   
    var urlParam = req.params.url;
    
    var urlRegex = "^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?";
    
    if (!urlParam.match(urlRegex)) {
        res.json({error:"invalid_url"});
        res.end();
    } else {
        
        var newId = Guid.raw().split("-")[0];
    
        var newUrl = new Url({ id: newId, url: urlParam});
        newUrl.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('saved to db');
           var response = {
               "original_url": urlParam,
               "short_url": baseUrl + "/" + newId
           }
           
           res.json(response);
          }
        });
    }
});

app.listen(port, function() {
    console.log("Listening on port " + port);
});