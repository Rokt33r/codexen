#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var readline = require('readline');

var supplies;

program
    .version('0.0.1')
    .parse(process.argv);



fs.readFile('./codexen.json', {encoding: 'utf-8'}, function (err, data) {
    if (err) throw err;
    var depot = JSON.parse(data);
    supplies = depot.supplies;

    if(program.args[0]) {
        executeGenerator(program.args[0], program.args[1]);
    }else{
        console.log('Thanks for using CodeXen');
        console.log('\nAvailable commands are below. :)\n');

        supplies.forEach(function (supply) {
            console.log(supply.command);
        });

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question("Choose the command to execute >> ", function(answer){
            var command = answer;
            rl.question("Choose filename (default) >> ", function(answer) {
                console.log(answer);
                executeGenerator(command, answer);
            });
        });

    }
});

var executeGenerator = function(command, overrideFilename){
    supplies.forEach(function (supply) {
        if (supply.command == command) {
            var code = supply.code;
            if(overrideFilename){
                code.filename = overrideFilename;
            }

            var path = code.prefix + code.filename + code.suffix;

            fs.writeFile(path, code.code, function(err){
                if(err) throw err;
                console.log('\nSuccessfully generated!!\n'+path + '\n');
            });
        }
    });
};