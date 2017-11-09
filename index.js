#!/usr/bin/env node

var db = require('./build/how2db.js');
var config = require('./build/config.js');

var program = require('commander');

program.version('0.0.1')
    .option('-c, --category <CATEGORY>', 'Limit the search to the provided CATEGORY')
    .parse(process.argv);

var tags = program.args;
var category = program.category;

if (tags.length > 0) {
    if (tags.length == 1) {
        console.log(`Searching for entries that have the tag '${tags[0]}'.`);
    } else {
        console.log(`Searching for entries that have all the tags in (${tags.join(',')}).`);
    }
}

if (category) {
    console.log(`Searching within the category '${category}'.`);
}

var rows = db.Get(category, tags);
console.log(rows);

console.log(config);
