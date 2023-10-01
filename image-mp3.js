const fs = require("fs");
const { prompt } = require("enquirer");
const ffmpeg = require("fluent-ffmpeg");

module.exports = async function () {

  console.clear();

  const audioFiles = (await fs.promises.readdir(".")).filter((f) =>
    f.endsWith(".mp3") || f.endsWith(".wav")
  );

  const { audioFile } = await prompt({
    type: "select",
    name: "audioFile",
    message: "Select file",
    choices: audioFiles,
  });

  const imageFiles = (await fs.promises.readdir(".")).filter((f) =>
    f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".jpeg")
  );

  const { imageFile } = await prompt({
    type: "select",
    name: "imageFile",
    message: "Select file",
    choices: imageFiles,
  });

  const cmd = ffmpeg();

  const { quality } = await prompt({
    type: "select",
    name: "quality",
    message: "Select audio quality",
    choices: ['low', 'medium', 'high', 'very high', 'ultra'],
  });

  const qualityMap = {
    'low': '50k',
    'medium': '100k',
    'high': '192k',
    'very high': '320k',
    'ultra': '500k'
  }
  
  const { outputFileName } = await prompt({
    type: "input",
    name: "outputFileName",
    message: "Enter output file name",
    initial: "output",
  });

  const { outputFormat } = await prompt({
    type: "select",
    name: "outputFormat",
    message: "Select output format",
    choices: ['mp4', 'mkv', 'avi', 'mov'],
  });

  await new Promise((res, rej) => {
    let command;
    cmd
      .input(imageFile)
      .inputOptions([
        '-loop 1'
      ])
      .input(audioFile)
      .videoCodec('libx264')
      .outputOptions([
        '-tune stillimage',
        // '-c:a aac',
        `-b:a ${qualityMap[quality]}`,
        '-pix_fmt yuv420p',
        '-shortest'
      ])
      .audioCodec('aac')
      .output(`${outputFileName}.${outputFormat}`)
      .on('start', (commandLine) => {
        command = commandLine;
      })
      .on('progress', (progress) => {
        console.clear();
        console.log(">", command,`\n  Processing:`, progress);
      })
      .on('error', (err) => {
        rej(err);
      })
      .on('end', () => {
        console.log(`  Composed at ${outputFileName}.${outputFormat}`);
        res();
      })
      .run();
  })



  console.log("Done!");
}
