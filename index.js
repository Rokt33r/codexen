#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var readline = require('readline');
var path = require('path');
var execSync;

if(process.version.match(/0.12/)){
    execSync = require('child_process').execSync;
}else{
    execSync = require('execSync').exec;
}

var commandCards, cards;

program
    .version('0.0.8')
    .parse(process.argv);



fs.readFile('./codexen.json', {encoding: 'utf-8'}, function (err, data) {
    if (err) throw err;
    var result = JSON.parse(data);
    commandCards = result.deck.cards;
    cards = result.cards;

    if(program.args[0]) {
        execute(program.args[0], program.args[1]);
    }else{
        console.log('Thanks for using CodeXen');
        console.log('\nAvailable commands are below. :)\n');

        commandCards.forEach(function (card) {
            console.log(card.command);
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
    commandCards.forEach(function (commandCard) {
        if (commandCard.command == command) {
            if(commandCard.type=='generator') generateCode(commandCard, overrideFilename);
            if(commandCard.type=='runner') runCode(commandCard, overrideFilename);
            if(commandCard.type=='group') runGroup(commandCard);
        }
    });
};

var generateCode = function(commandCard, overrideFilename){
    var targetCard = cards.filter(function(card){
        return card.id ===commandCard.card_id;
    })[0];
    if(overrideFilename){
        targetCard.filename = overrideFilename;
    }

    var codePath = targetCard.filename;
    codePath = path.normalize(codePath);
    var dirPath = path.dirname(codePath);

    var exists = fs.existsSync(dirPath);
    if(!exists){
        fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(codePath, targetCard.code);
    console.log('Successfully generated!! >> %s\n', codePath);
};

var runCode = function(commandCard){
    var targetCard = cards.filter(function(card){
        return card.id ===commandCard.card_id;
    })[0];

    var codePath = targetCard.filename;
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
    if(commandCard.runtime) runtime = commandCard.runtime;

    if(!runtime) console.log('CodeXen runner can execute Shell, Javascript(NodeJS), PHP only');

    console.log('runtime >> ' +runtime);

    var code = runtime + '\n' + targetCard.code;

    var runnable = fs.writeFileSync('codexen.lock', code);
    execSync('chmod 700 codexen.lock');
    var output = execSync('./codexen.lock');

    if(process.version.match(/0.12/)){
        console.log(output.toString('utf-8'));
    }else{
        console.log(output.stdout);
    }

};

var runGroup = function(groupCard){
    groupCard.cards.forEach(function (card) {
        if(card.type=='generator') generateCode(card);
        if(card.type=='runner') runCode(card);
    });
};
