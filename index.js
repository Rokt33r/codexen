#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var readline = require('readline');
var path = require('path');
var execSync = require('execSync');

var supplies, codes;

program
    .version('0.0.1')
    .parse(process.argv);



fs.readFile('./codexen.json', {encoding: 'utf-8'}, function (err, data) {
    if (err) throw err;
    var result = JSON.parse(data);
    supplies = result.depot.supplies;
    codes = result.codes;

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
            var code = codes.filter(function(code){
                return code.id ===supply.code_id;
            })[0];
            if(overrideFilename){
                code.filename = overrideFilename;
            }

            console.log(supply.intro);
            var output = execSync.exec(supply.intro);
            console.log(output.stdout);

            var codePath = code.prefix + code.filename + code.suffix;
            codePath = path.normalize(codePath);
            var dirPath = path.dirname(codePath);
            fs.exists(dirPath, function(exists){
                if(!exists){
                    fs.mkdirSync(dirPath);
                }
                fs.writeFile(codePath, code.code, function(err){
                    if(err) throw err;
                    console.log('Successfully generated!! >> %s\n', codePath);

                    console.log(supply.outro);
                    var output = execSync.exec(supply.outro);
                    console.log(output.stdout);
                });
            });
        }
    });
};