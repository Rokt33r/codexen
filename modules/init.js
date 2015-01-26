var readline = require('readline');
var request = require('request');
var fs = require('fs');


module.exports = function(depotLabel){
    console.log('Initializing CodeXen....');
    if(depotLabel === undefined){
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question("Write your depot label >> ", function(answer){
            excuteInit(answer);
            rl.close();
        });
    }else{
        excuteInit(depotLabel);
    }

};
var excuteInit = function(depotLabel){
    console.log('depot label : %s', depotLabel);
    fetchDepot(depotLabel);
};
var fetchDepot = function(depotLabel){
    request.get('http://codexen.dev/cli/depots/' + depotLabel)
        .on('response', function(response) {
            console.log(response.statusCode) // 200
            console.log(response.headers['content-type']);
            console.log(response.constructor.name);
        })
        .pipe(fs.createWriteStream('codexen.json'))
};