#!/usr/bin/env node
import program from 'commander';
import bootstrap from './bootstrap';

const pkg = require('../package');

program
  .name('overload-cli')
  .usage('command [options]')
  .version(pkg.version);

program
  .command('start <config-path>')
  .description('start one skeleton task.')
  .action(bootstrap);

program.parse(process.argv);