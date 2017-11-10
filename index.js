#!/usr/bin/env node
var program = require('commander');
var inquirer = require('inquirer');
var open = require('opn');

var db = require('./build/how2db.js');

program.version('0.0.1')
  .option('-c, --category <CATEGORY>', 'Limit the search to the provided CATEGORY')
  .parse(process.argv);

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
  return {
    value: 'http://localhost:5500/' + row.path + '.html',
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
