#! /usr/bin/env node

const { program } = require('commander');

const { version } = require('./package.json');
const composer = require('./video');
const shifter = require('./shifter');
const imageMp3 = require('./image-mp3');

program.command('video')
  .description('Video composer, composes videos with subtitles and compresses them.')
  .action(composer)
  .version(version)

program.command('shift-subtitle')
  .description('Shifts subtitle by a given amount of milliseconds.')
  .action(shifter)
  .version(version)

program.command('image-mp3')
  .description('Composes an image with an mp3 file.')
  .action(imageMp3)
  .version(version)

program.parse();