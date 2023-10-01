const fs = require("fs");
const { prompt } = require("enquirer");
const { parse, resync, stringify } = require('subtitle');

module.exports = async function () {

  const files = (await fs.promises.readdir(".")).filter((f) => f.endsWith(".srt"));

  if (!files.length) throw new Error("No srt files found");

  const { file } = await prompt({
    type: "select",
    name: "file",
    message: "Select file",
    choices: files,
  });

  const { time } = await prompt({
    type: "numeral",
    name: "time",
    message: "Enter shifting time in ms",
  });

  const stream = fs.createReadStream(`./${file}`);

  await new Promise((resolve, reject) => {
    const out = `./${file.replace(".srt", "")}-shifted.srt`;
    stream.on('error', () => {
      console.log(`Error shifting ${file} by ${time}ms`);
      reject();
    });
    stream.on('close', () => {
      console.log(`  Shifted at ${out}`);
      resolve();
    });
    stream
      .pipe(parse())
      .pipe(resync(time))
      .pipe(stringify({ format: 'SRT' }))
      .pipe(fs.createWriteStream(out))
  });
};