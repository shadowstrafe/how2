var hljs = require('highlight.js');
var escape = require('markdown-it')().utils.escapeHtml;
var katex = require('katex');
var MarkdownIt = require('markdown-it');

var logger = require('./logger');

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
      logger.warn('Error parsing inline math. Rendering as raw latex expression "' + str + '"');
      logger.warn(err);
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
      logger.warn('Error parsing block math. Rendering as raw latex expression "' + str + '"');
      logger.warn(err);
      return escape(str);
    }
  }
});

export = function (content) {
  return md.render(content);
};
