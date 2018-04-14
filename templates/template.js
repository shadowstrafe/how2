var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs');
var moment = require('moment');

const config = require('../config.js');

const TEMPLATE_DIRPATH = config.templateDirpath;

const how2TemplateSource = fs.readFileSync(path.resolve(TEMPLATE_DIRPATH, 'how2.handlebars'), 'utf8');
const how2Template = handlebars.compile(how2TemplateSource);

const searchTemplateSource = fs.readFileSync(path.resolve(TEMPLATE_DIRPATH, 'search.handlebars'), 'utf8');
const searchTemplate = handlebars.compile(searchTemplateSource);

function how2 (data) {
  if (data.date) {
    data.date = moment(data.date).format('Do MMMM YYYY');
  }
  return how2Template(data);
}

function search (data) {
  return searchTemplate({
    results: data
  });
}

module.exports = {
  how2: how2,
  search: search
};
