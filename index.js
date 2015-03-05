#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var readline = require('readline');
var path = require('path');
var execSync = require('execSync');

var supplies, codes;

program
    .version('0.0.5')
    .parse(process.argv);



fs.readFile('./codexen.json', {encoding: 'utf-8'}, function (err, data) {
    if (err) throw err;
    var result = JSON.parse(data);
    supplies = result.depot.supplies;
    codes = result.codes;

    if(program.args[0]) {
        execute(program.args[0], program.args[1]);
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
            execute(command);
        });

    }
});

var execute = function(command, overrideFilename){
    supplies.forEach(function (supply) {
        if (supply.command == command) {
            if(supply.type=='generator') generateCode(supply, overrideFilename);
            if(supply.type=='runner') runCode(supply, overrideFilename);
            if(supply.type=='group') runGroup(supply);
        }
    });
};

var generateCode = function(supply, overrideFilename){
    var code = codes.filter(function(code){
        return code.id ===supply.code_id;
    })[0];
    if(overrideFilename){
        code.filename = overrideFilename;
    }

    var codePath = code.prefix + code.filename + code.suffix;
    codePath = path.normalize(codePath);
    var dirPath = path.dirname(codePath);

    var exists = fs.existsSync(dirPath);
    if(!exists){
        fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(codePath, code.code);
    console.log('Successfully generated!! >> %s\n', codePath);
};

var runCode = function(supply){
    var code = codes.filter(function(code){
        return code.id ===supply.code_id;
    })[0];

    var codePath = code.prefix + code.filename + code.suffix;
    codePath = path.normalize(codePath);
    var ext = path.extname(codePath);

    var runtime;

    switch(ext) {
        case '.sh':
            runtime = '#!/usr/bin/env sh';
            break;
        case '.js':
            runtime = '#!/usr/bin/env node';
            break;
        case '.php':
            runtime = '#!/usr/bin/env php';
            break;
        default :
            break;
    }
    if(supply.override) runtime = supply.override;

    if(!runtime) console.log('CodeXen runner can execute Shell, Javascript(NodeJS), PHP only');

    console.log('runtime >> ' +runtime);

    code = runtime + '\n' + code.code;

    var runnable = fs.writeFileSync('codexen.lock', code);
    execSync.exec('chmod 777 codexen.lock');
    var output = execSync.exec('./codexen.lock');
    console.log(output.stdout);
};

var runGroup = function(supply){
    console.log(supply.supplies);
    supply.supplies.forEach(function (supply) {
        if(supply.type=='generator') generateCode(supply);
        if(supply.type=='runner') runCode(supply);
    });
};