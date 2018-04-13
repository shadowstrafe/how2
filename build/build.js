var del = require('rimraf');
var frontMatter = require('front-matter');
var fs = require('fs');
var glob = require('glob');
var mkdirp = require('mkdirp');
var path = require('path');
var slash = require('slash');

var config = require('../config.js');
var db = require('./how2db.js');
var htmlify = require('./htmlify.js');

const shouldBuildHtml = config.build.buildhtml;

function buildAll () {
  glob('**/*.md', {
    cwd: slash(config.source.sourcepath)
  }, function (err, matches) {
    if (err) throw err;

    if (shouldBuildHtml) {
      // path.resolve removes trailing slashes
      var cleanGlob = slash(path.resolve(config.build.outputpath)) + '/**/*';

      // Cleanup output directory
      del(cleanGlob, (err) => {
        if (err) {
          console.error(err);
        } else {
          db.Clear();
          copyAssets();
          for (let i = 0; i < matches.length; i++) {
            buildMarkdown(matches[i]);
          }
        }
      });
    } else {
      db.Clear();
      for (let i = 0; i < matches.length; i++) {
        buildMarkdown(matches[i]);
      }
    }
  });
}

function copyAssets () {
  glob('*.@(css|ico|css.map)', {
    cwd: slash(config.source.assetdirpath)
  }, function (err, files) {
    if (err) console.err(err);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const srcPath = path.resolve(config.source.assetdirpath, file);
      const destPath = path.resolve(config.build.outputpath, file);
      fs.copyFile(srcPath, destPath, (err) => {
        if (err) console.error(err);
      });
    }
  });

  glob('fonts/**/*', {
    cwd: slash(config.source.assetdirpath)
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
            const srcPath = path.resolve(config.source.assetdirpath, file);
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

function buildMarkdown (filePath) {
  const relativePath = slash(filePath).replace(/.md$/, '');
  const absPath = path.resolve(config.source.sourcepath, filePath);
  const pathSegments = relativePath.split('/');
  const category = pathSegments.slice(0, -1).join('/');
  const fileName = pathSegments[pathSegments.length - 1];
  fs.stat(absPath, function (err, stats) {
    if (err) {
      console.error(err);
      return;
    }
    const lastModifiedOn = stats.mtime;
    fs.readFile(absPath, 'utf8', function (err, data) {
      if (err) {
        console.error(err);
        return;
      }
      const content = frontMatter(data);
      let metadata = content.attributes;
      metadata.date = lastModifiedOn;
      metadata.tags = metadata.tags || [];
      metadata.category = category;

      db.Insert({
        category: category,
        title: metadata.title,
        tags: metadata.tags,
        path: relativePath,
        date: metadata.date
      });
      if (shouldBuildHtml) {
        var html = htmlify(content);
        var outputDir = path.join(config.build.outputpath, 'how2', category);
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
    });
  });
}

function change (filePath) {
  var relativePath = slash(filePath).replace(/.md$/, '');
  db.Delete(relativePath);
  buildMarkdown(filePath);
}

function remove (filePath) {
  var relativePath = slash(filePath).replace(/.md$/, '');
  db.Delete(relativePath);

  if (shouldBuildHtml) {
    var destFilePath = path.join(config.build.outputpath, relativePath + '.html');
    del(destFilePath, function (err) {
      if (err) {
        console.error(err);
      }
    });
  }
}

module.exports = {
  buildAll,
  buildMarkdown,
  change,
  remove
};
