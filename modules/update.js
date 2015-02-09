var request = require('request');
var fs = require('fs');

var path = './codexen.json';

module.exports = function(){
    console.log('\nUpdating codexen.json....')
    checkCodexenFile(function (check){

        // when codexen.json file doesn't exist
        if(!check) throwCodexenFileNotFound();

        fs.readFile(path, {encoding: 'utf-8'}, function(err, data){
            if(err) throw err;
            var depot = JSON.parse(data).depot;
            fetchDepot(depot.label);
        })

    });
};

var checkCodexenFile = function(callback){
    fs.exists(path, callback);
};

var throwCodexenFileNotFound = function(){
    console.error('\'codexen.json\' is not found.\n');
    console.error('use \'cx-config init\' to make codexen.json\n');
    process.exit();
};
var fetchDepot = function(depotLabel){
    var url = require('./url');
    request.get(url + depotLabel)
        .on('response', function(response) {
            //console.log(response.statusCode)
            //console.log(response.headers['content-type']);
            console.log('\nSuccessfully Done.\n');
        })
        .pipe(fs.createWriteStream('codexen.json'))
};