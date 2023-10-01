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

  const { useCuda } = await prompt({
    type: "confirm",
    name: "useCuda",
    message: "Use CUDA?",
  });

  if (useCuda) cmd.inputOptions([
    '-hwaccel cuda'
  ]);

  const { outputFormat } = await prompt({
    type: "select",
    name: "outputFormat",
    message: "Select output format",
    choices: ['mp4', 'mkv', 'avi', 'mov'],
  });
  
  const { outputFileName } = await prompt({
    type: "input",
    name: "outputFileName",
    message: "Enter output file name",
    initial: "output",
  });

  const { quality } = await prompt({
    type: "select",
    name: "quality",
    message: "Select quality",
    choices: ['low', 'medium', 'high', 'very high', 'ultra'],
  });

  const qualityMap = {
    'low': '50k',
    'medium': '400k',
    'high': '1000k',
    'very high': '6000k',
    'ultra': '18000k'
  }

  await new Promise((res, rej) => {
    let command;
    cmd
      .input(imageFile)
      .input(audioFile)
      .outputOptions([
        '-acodec copy',
        '-b:v ' + qualityMap[quality],
        '-bt 50k',
      ])
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
