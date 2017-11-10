#!/usr/bin/env node
var program = require('commander');
var inquirer = require('inquirer');
var open = require('opn');
var url = require('url');

var db = require('./build/how2db.js');
var config = require('./build/config.js');

program.version('0.0.1')
  .description('A tool for searching local documentation written in markdown.')
  .option('-c, --category <CATEGORY>', 'limit the search to the provided CATEGORY')
  .option('-b, --build', 'force a rebuild of the documentation folder')
  .option('-w, --watch', 'watch source folder for changes and update documentation when they do')
  .parse(process.argv);

if (program.build || program.watch) {
  console.log('Building...');
  process.exit();
}

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

var rows = db.Get(category, tags);

if (rows.length === 0) {
  console.log('No howtos found.');
  console.log('Try relaxing your search conditions.');
  process.exit();
}

var choices = rows.map(function (row) {
  var howtoUrl = new url.URL(config.server.baseurl + row.path + '.html');
  return {
    value: howtoUrl.toString(),
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
  open(answers.howto);
});
