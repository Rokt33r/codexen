#!/usr/bin/env node

var program = require('commander');

program
    .version('0.0.5')

program
    .command('init [depotLabel]')
    .description('Initialize CodeXen')
    .action(require('./modules/init.js'));

program
    .command('update')
    .description('Update CodeXen')
    .action(require('./modules/update.js'));

program.parse(process.argv);

if(!program.args.length) {
    console.log('   ___          _     __  __          ');
    console.log('  / __\\___   __| | ___\\ \\/ /___ _ __  ');
    console.log(' / /  / _ \\ / _` |/ _ \\\\  // _ \\ \'_ \\ ');
    console.log('/ /__| (_) | (_| |  __//  \\  __/ | | |');
    console.log('\\____/\\___/ \\__,_|\\___/_/\\_\\___|_| |_|');
    console.log('Prototype v0.0.5');
    program.help();
}