# Overview

how2 is a tool for building, searching and serving local documentation that was written in markdown. The flavour of markdown used is the default of markdown-it, which is commonmark based with certain additional extensions.

This project is a fork of how2 that instead uses markdown-it, nodejs and gulp instead of pandoc and python for speed improvements and better control over the output.

# Installation

While in this directory
``` shell
$> npm install -g
```

# Usage

## Building

``` shell
$> how2 --build
```

## Watching
While watching is active, when markdown files in source folder change they will be rebuilt.

``` shell
$> how2 --watch
```

## Search for related how-tos

``` shell
$> how2 -c category tag1 tag2
```

Interact with the inquirer command prompt.

# Configuration
.how2.config configuration files are read from the user's home directory. It is an ini-like file with key value pairs.

## Paths
### sourcepath 
This should be an absolute path to the location where all markdown files are kept. Required.

### distpath 
This is currently unused. There are issues with how the current gulp clean task refuses to delete files outside of the working directory of gulp. No impact to currently how it works though.

## Server
### Port
The port number to be used to serve content. If not found defaults to 5500.

# Content structure
## Template
how2.template is a handlebars template used to generate the resulting html files.

## CSS
css files at root of sourcepath are copied over to the dist path.
