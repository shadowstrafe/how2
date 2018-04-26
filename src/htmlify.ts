import escape from 'escape-html';
import hljs from 'highlight.js';
import katex = require('katex');
import MarkdownIt from 'markdown-it';
import MarkdownItMath from 'markdown-it-math';

import * as logger from './logger';

const md = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: false,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          '</code></pre>';
      } catch (err) {
        logger.warn('highlight.js unable to highlight code block ' + err);
       }
    }
    return '<pre class="hljs"><code>' +
      escape(str) +
      '</code></pre>';
  },
}).use(MarkdownItMath, {
  inlineOpen: '$',
  inlineClose: '$',
  blockOpen: '$$',
  blockClose: '$$',
  inlineRenderer: (str: string) => {
    try {
      return katex.renderToString(str, {
        throwOnError: false,
      });
    } catch (err) {
      logger.warn('Error parsing inline math. Rendering as raw latex expression "' + str + '"');
      logger.warn(err);
      return escape(str);
    }
  },
  blockRenderer: (str: string) => {
    try {
      return katex.renderToString(str, {
        displayMode: true,
        throwOnError: false,
      });
    } catch (err) {
      logger.warn('Error parsing block math. Rendering as raw latex expression "' + str + '"');
      logger.warn(err);
      return escape(str);
    }
  },
});

export function htmlify(content: string) {
  return md.render(content);
}
