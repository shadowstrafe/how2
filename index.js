#!/usr/bin/env node
var inquirer = require('inquirer');
var open = require('opn');
var del = require('rimraf');
var path = require('path');
var slash = require('slash');
var fs = require('fs');
var mkdirp = require('mkdirp');
var frontMatter = require('front-matter');
var glob = require('glob');
var program = require('commander');
var url = require('url');
require('pkginfo')(module);

var config = require('./config.js');
var db = require('./build/how2db.js');
var server = require('./server/server.js');
var htmlify = require('./build/htmlify.js');

const shouldBuildHtml = config.build.buildhtml;

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
  build();
} else if (program.watch) {
  build();
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
    var howtoUrl = new url.URL('http://localhost/' + answers.howto + '.html');
    howtoUrl.port = config.server.port;
    if (config.server.launch) {
      server.start();
      open(howtoUrl.toString());
    } else {
      open(howtoUrl.toString());
    }
  });
}

function build () {
  glob('**/*.md', {
    cwd: slash(config.source.sourcepath)
  }, function (err, matches) {
    if (err) throw err;

    if (shouldBuildHtml) {
      // Cleanup output directory
      del(config.source.outputpath + '/**/*', (err) => {
        if (err) {
          console.error(err);
        } else {
          copyAssets();
          for (let i = 0; i < matches.length; i++) {
            buildMarkdown(matches[i]);
          }
        }
      });
    } else {
      for (let i = 0; i < matches.length; i++) {
        buildMarkdown(matches[i]);
      }
    }
  });
}

function copyAssets () {
  glob('*.@(css|ico)', {
    cwd: slash(config.source.sourcepath)
  }, function (err, files) {
    if (err) console.err(err);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const srcPath = path.resolve(config.source.sourcepath, file);
      const destPath = path.resolve(config.build.outputpath, file);
      fs.copyFile(srcPath, destPath, (err) => {
        if (err) console.error(err);
      });
    }
  });

  glob('fonts/**/*', {
    cwd: slash(config.source.sourcepath)
  }, function (err, files) {
    if (err) {
      console.err(err);
    } else {
      mkdirp(path.resolve(config.build.outputpath, 'fonts'), function (err) {
        if (err) {
          console.error(err);
        } else {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const srcPath = path.resolve(config.source.sourcepath, file);
            const destPath = path.resolve(config.build.outputpath, file);
            fs.copyFile(srcPath, destPath, (err) => {
              if (err) console.error(err);
            });
          }
        }
      });
    }
  });
}

function buildMarkdown (file) {
  db.Clear();
  const relativePath = slash(file).replace(/.md$/, '');
  const absPath = path.resolve(config.source.sourcepath, file);
  const pathSegments = relativePath.split('/');
  const category = pathSegments.slice(0, -1).join('/');
  const fileName = pathSegments[pathSegments.length - 1];
  fs.readFile(absPath, 'utf8', function (err, data) {
    if (err) {
      console.error(err);
    } else {
      const content = frontMatter(data);
      const metadata = content.attributes;
      db.Insert({
        category: category,
        title: metadata.title,
        tags: metadata.tags || [],
        path: relativePath
      });
      if (shouldBuildHtml) {
        var html = htmlify(content);
        var outputDir = path.join(config.build.outputpath, category);
        mkdirp(outputDir, function (err) {
          if (err) {
            console.error(err);
          } else {
            var outputPath = path.join(outputDir, fileName + '.html');
            fs.writeFile(outputPath, html, function (err) {
              if (err) {
                console.error(err);
              }
            });
          }
        });
      }
    }
  });
}
