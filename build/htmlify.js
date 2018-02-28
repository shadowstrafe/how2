var handlebars = require('handlebars');
var hljs = require('highlight.js');
var escape = require('markdown-it')().utils.escapeHtml;
var katex = require('katex');
var MarkdownIt = require('markdown-it');
var fs = require('fs');
var moment = require('moment');

const config = require('../config.js');

const TEMPLATE_PATH = config.source.templatepath;

const templateSource = fs.readFileSync(TEMPLATE_PATH, 'utf8');
var template = handlebars.compile(templateSource);

let md = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: false,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          '</code></pre>';
      } catch (_) { }
    }
    return '<pre class="hljs"><code>' +
      escape(str) +
      '</code></pre>';
  }
}).use(require('markdown-it-math'), {
  inlineOpen: '$',
  inlineClose: '$',
  blockOpen: '$$',
  blockClose: '$$',
  inlineRenderer: function (str) {
    return katex.renderToString(str, {
      throwOnError: false
    });
  },
  blockRenderer: function (str) {
    return katex.renderToString(str, {
      displayMode: true,
      throwOnError: false
    });
  }
});

module.exports = function (fileContents) {
  let templateData = fileContents.attributes;
  templateData.content = md.render(fileContents.body);
  templateData.rootdir = '/';
  if (templateData.date) {
    templateData.date = moment(templateData.date).format('Do MMMM YYYY');
  }
  return template(templateData);
};
