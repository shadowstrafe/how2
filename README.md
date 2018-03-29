# Overview

how2 is a tool for building, searching and serving local documentation that was written in markdown. The flavour of markdown used is the default of markdown-it, which is commonmark based with certain additional extensions.

This project is a fork of how2 that instead uses markdown-it, nodejs and gulp instead of pandoc and python for speed improvements and better control over the output.

## Installation

While in this directory

``` shell
$> npm install -g
```

## Usage

### Building Files

``` shell
how2 --build
```

### Compiling CSS

In this directory,

``` shell
npm run compile
```

### Watching Files

While watching is active, when markdown files in source folder change they will be rebuilt.

``` shell
$> how2 --watch
```

### Search For Related how-tos

``` shell
$> how2 -c category tag1 tag2
```

Interact with the inquirer command prompt.

## Configuration

.how2.config configuration files are read from the user's home directory. It is an ini-like file with key value pairs.

### Source

#### sourcepath

This should be an absolute path to the location where all markdown files are kept. Required.

#### templatepath

The path of the handlebars template to use to generate the resulting HTML. If not provided defaults to **how2.template** at the root of the sourcepath

### Server

#### launch

If true, an express server is automatically launched if not running on selection of howto that serves the content.

#### port

The port number to be used to serve content. If not found defaults to 5500.

### Build

#### manifestdir

Location of the manifest file (how2db.json).

#### buildhtml

If true, HTML files are generated and placed at the output path when the manifest file is built. These files will be served by the express server if configured.

#### outputpath

The location of the HTML files when buildhtml is set to true. As this directory is cleaned on build, be careful not to provide a path that may damage the system.

## Content structure

### Template

how2.template is a handlebars template used to generate the resulting html files.

### CSS

css files at root of sourcepath are copied over to the dist path.

### Markdown

Uses markdown-it which is commonmark-compliant and uses "GFM Tables" by default. Also allows for maths latex inlined with a pair of $s or in a block between a pair of double $s
