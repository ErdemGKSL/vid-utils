const fs = require("fs");
const { prompt } = require("enquirer");
const ffmpeg = require("fluent-ffmpeg");

module.exports = async function () {

  console.clear();

  const videoFiles = (await fs.promises.readdir(".")).filter((f) =>
    f.endsWith(".mp4") || f.endsWith(".mkv") || f.endsWith(".avi") || f.endsWith(".mov")
  );

  const { videoFile } = await prompt({
    type: "select",
    name: "videoFile",
    message: "Select file",
    choices: videoFiles,
  });

  const { useSrt } = await prompt({
    type: "confirm",
    name: "useSrt",
    message: "Add subtitle?",
  });

  const srtFiles = (await fs.promises.readdir(".")).filter((f) => f.endsWith(".srt"));
  const { srtFile } = useSrt ? await prompt({
    type: "select",
    name: "srtFile",
    message: "Select file",
    choices: srtFiles,
  }) : { srtFile: null };

  const cmd = ffmpeg().input(videoFile);

  const { useCuda } = await prompt({
    type: "confirm",
    name: "useCuda",
    message: "Use CUDA?",
  });

  if (useCuda) cmd.inputOptions([
    '-hwaccel cuda'
  ]);

  const { compressVideo } = await prompt({
    type: "confirm",
    name: "compressVideo",
    message: "Compress video?",
  });

  const { outputFormat } = await prompt({
    type: "select",
    name: "outputFormat",
    message: "Select output format",
    choices: ['mp4', 'mkv', 'avi', 'mov'],
  });

  await new Promise((resolve, reject) => {
    let command;
    const timeout = setTimeout(() => {
      reject("Timed out");
    }, 1000 * 2);
    cmd.on('start', function (commandLine) {
      command = commandLine;
    });
    cmd.on('progress', function (progress) {
      console.clear();
      console.log("> " + command, '\nProcessing:', progress);
      timeout.refresh();
    });
    cmd.on('end', function () {
      console.log('Finished processing');
      clearTimeout(timeout);
      resolve();
    });

    cmd
      .outputOptions([
        ...(compressVideo ? ['-vcodec libx265', '-crf 28'] : []),
        ...(useSrt ? [`-vf subtitles=${srtFile}`] : []),
      ])
      .output(videoFile.replace(/(\.mkv|\.mp4|\.avi|\.mov)$/, `.out.${outputFormat}`))
      .run()
  });


};