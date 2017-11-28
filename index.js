#!/usr/bin/env node
var inquirer = require('inquirer');
var open = require('opn');
var path = require('path');
var program = require('commander');
var url = require('url');
require('pkginfo')(module);

var GulpRunner = require('gulp-runner');

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

if (program.build || program.watch) {
  server.stop();
  var gulp = new GulpRunner(path.resolve(__dirname, 'gulpfile.js'));
  gulp.on('log', function (data) {
    process.stdout.write(data);
  });

  gulp.on('error', function (err) {
    process.stderr.write(err);
  });

  if (program.watch) {
    gulp.run('watch');
  } else if (program.build) {
    gulp.run('build');
  }
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
    if (config.server.launch) {
      server.start();
    }
    var howtoUrl = new url.URL('http://localhost/' + answers.howto + '.html');
    howtoUrl.port = config.server.port;
    open(howtoUrl.toString());
  });
}
