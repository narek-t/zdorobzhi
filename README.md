## Basic blank template for front end developers #
Blank template for frontend developers using gulp v4, sass, jade, autoprefixer, auto sprite generator, browserSync and much more.
## Quick Start #
**Important! You will need [gulp v4][1] to install this template.**

1. Clone this repo

    `$ git clone https://github.com/narek-t/gulp-sass-jade.git .`
2. Install dependencies

    `$ npm i`

3. Start task for development

    `$ gulp dev`

## Capabilities #
1. Minify, autoprefix and sourcemaps for css.
2. Auto sprite generator.
3. browser-sync for live reload.
4. concat, uglify JavaScript files.
5. converting Jade templates to HTML
6. Optimize images.

## Project structure #

```
.
|-- dev
  |-- img
    |-- sprites <-> all images placed here will generate sprite.png
  |-- js
    |-- lib <-> all scripts placed here will generate lib.min.js
  |-- fonts
  |-- sass
  |-- templates <-> Jade files with prefix "_" will not generate separate .html files
  |-- scss.template.mustache

```

  [1]: https://github.com/gulpjs/gulp/tree/4.0
