# Overview

how2 is a tool for building, searching and serving local documentation that was written in markdown. The flavour of markdown used is the default of markdown-it, which is CommonMark based with certain additional extensions.

## Getting Started

``` shell
npm install
npm run build
npm start
```

## Configuration

Application uses environment variables for configuration.

``` shell
HOW2_SOURCE_DIRPATH='/path/to/markdown/files/'
HOW2_PORT='5500'
```

## Markdown

Uses markdown-it which is CommonMark compliant and uses "GFM Tables" by default. Also allows for maths latex inlined with a pair of $s or in a block between a pair of double $s

    Einsteins famous equation: $e=mc^2$

    $$
    2 + 2 = 4
    $$

## Docker

To build the Docker image,

First ensure that the files inside the `dist` folder have been built. Then run the following.

``` shell
docker build . -t chengkai/how2:latest
```
