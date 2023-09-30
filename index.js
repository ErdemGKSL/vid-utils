#! /usr/bin/env node

const { program } = require('commander');

const { version } = require('./package.json');
const composer = require('./composer');
const shifter = require('./shifter');

program.command('video')
  .description('Video composer, composes videos with subtitles and compresses them.')
  .action(composer)
  .version(version)

program.command('shift-subtitle')
  .description('Shifts subtitle by a given amount of milliseconds.')
  .action(shifter)
  .version(version)

program.parse();