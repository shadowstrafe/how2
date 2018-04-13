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
    try {
      return katex.renderToString(str, {
        throwOnError: false
      });
    } catch (err) {
      console.error(err);
      console.warn('Error parsing inline math, rendering as raw expression.');
      return escape(str);
    }
  },
  blockRenderer: function (str) {
    try {
      return katex.renderToString(str, {
        displayMode: true,
        throwOnError: false
      });
    } catch (err) {
      console.error(err);
      console.warn('Error parsing block math, rendering as raw expression.');
      return escape(str);
    }
  }
});

module.exports = function (contents) {
  let templateData = contents.attributes;
  templateData.content = md.render(contents.body);
  if (templateData.date) {
    templateData.date = moment(templateData.date).format('Do MMMM YYYY');
  }
  return template(templateData);
};
