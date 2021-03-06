#! /usr/bin/env node
const puppeteer = require('puppeteer');
const minimist = require('minimist');

// todo also output path

const start = new Date;
var diff;

const defaults = {
  verbose: false,
  url: "http://example.com",
  filename: null,
  width: 1440,
  height: 1080,
  resetHeight: true,
  help: false,
};

var args = Object.assign(defaults, minimist(process.argv.slice(2)));
args.verbose && console.log(args);

if (args.verbose) console.log(((new Date) - start) + 'ms', 'args', args);

if (args.help) {
  const usage = `pixxy - a small utility to make an image of a webpage

Options:
--verbose: true | false    Show more logs
--url: (required)
--filename                 Save to this file
--width: 1440
--height: 1080
--resetHeight
--help
  `;

  console.log(usage);

  process.exit();
}

(async () => {
  // todo save / show timing info

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // todo configurable width
  let defaultViewport = { width: args.width, height: args.height }
  await page.setViewport(defaultViewport);

  if (args.verbose) console.log(((new Date) - start) + 'ms', 'loading ' + args.url);
  await page.goto(args.url);

  // set viewport to everything so we can take a picture
  const dimensions = await page.evaluate(() => {
    return {
      height: document.documentElement.offsetHeight
    };
  });

  defaultViewport.height = dimensions.height;

  if (args.resetHeight) {
    await page.setViewport(defaultViewport);
  }

  if (args.verbose) console.log(((new Date) - start) + 'ms', 'viewport:', defaultViewport);

  // todo date format
  let filename = args.filename;
  if (!filename) {
    filename = args.url.replace(/^https?:\/\//, '');
    filename = (filename + '-' + start.toISOString()).replace(/[^a-z0-9]+/gmi, '-');
    filename = filename += '.png';
  }

  await page.screenshot({
    path: filename,
    fullPage: true
  });

  console.log(((new Date) - start) + 'ms', 'saved', filename);

  if (args.verbose) console.log(((new Date) - start) + 'ms', 'closing browser');
  await browser.close();
})();
