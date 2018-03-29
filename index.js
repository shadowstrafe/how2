#!/usr/bin/env node
var chokidar = require('chokidar');
var inquirer = require('inquirer');
var open = require('opn');
var program = require('commander');
var url = require('url');
require('pkginfo')(module);

var build = require('./build/build.js');
var config = require('./config.js');
var db = require('./build/how2db.js');
var server = require('./server/server.js');

program.name('how2')
  .version(module.exports.version)
  .description(module.exports.description)
  .option('-l, --list', 'list categories')
  .option('-c, --category <CATEGORY>', 'limit the search to the provided CATEGORY')
  .option('-b, --build', 'force a rebuild of the documentation folder')
  .option('-w, --watch', 'watch source folder for changes and update documentation when they do')
  .option('-s, --server', 'launch the documentation server')
  .parse(process.argv);

if (program.build) {
  build.buildAll();
} else if (program.watch) {
  build.buildAll();
  var watcher = chokidar.watch('**/*.md', {
    persistent: true,
    ignoreInitial: true,
    cwd: config.source.sourcepath
  });
  watcher
    .on('add', filePath => {
      console.log('file added ' + filePath);
      build.buildMarkdown(filePath);
    })
    .on('change', filePath => {
      console.log('file changed ' + filePath);
      build.change(filePath);
    })
    .on('unlink', filePath => {
      console.log('file deleted ' + filePath);
      build.remove(filePath);
    })
    .on('error', error => console.error(error));

  console.log('Currently watching ' + config.source.sourcepath + ' for changes');
} else if (program.list) {
  let categories = db.GetCategories();
  categories.forEach(cat => {
    console.log(cat);
  });
  process.exit();
} else if (program.server) {
  server.start();
} else {
  var tags = program.args;
  var category = program.category;

  if (tags.length > 0) {
    if (tags.length === 1) {
      console.log(`Searching for entries that have the tag '${tags[0]}'.`);
    } else {
      console.log(`Searching for entries that have all the tags in (${tags.join(',')}).`);
    }
  }

  if (category) {
    console.log(`Searching within the category '${category}'.`);
  }

  let rows = db.Get(category, tags);

  if (rows.length === 0) {
    console.log('No howtos found.');
    console.log('Try relaxing your search conditions.');
    process.exit();
  }

  var choices = rows.map(function (row) {
    return {
      value: row.path,
      name: row.category + ' | ' + row.title
    };
  });

  var questions = [{
    type: 'list',
    name: 'howto',
    message: `${rows.length} howtos found.`,
    default: 0,
    choices: choices,
    pageSize: 10
  }];

  inquirer.prompt(questions).then(function (answers) {
    var howtoUrl = new url.URL('http://localhost/how2/' + answers.howto + '.html');
    howtoUrl.port = config.server.port;
    if (config.server.launch) {
      server.start();
      open(howtoUrl.toString());
    } else {
      open(howtoUrl.toString());
    }
  });
}
