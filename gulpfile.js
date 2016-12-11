'use strict';

// -------------------------------------
//   devDependencies
// -------------------------------------
const gulp = require('gulp');
const path = require('path');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const cssnano = require('gulp-cssnano');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const autoprefixer = require('autoprefixer');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');
const JadeInheritance = require('jade-inheritance');
const changed = require('gulp-changed');

//uncomment this if you want imagemin
// const imagemin = require('gulp-imagemin');


// --------------------------------------------
//  Error catching
// --------------------------------------------

const onError = function(err) {
	notify.onError({
		title: "Gulp",
		subtitle: "FAIL!!!",
		message: "Error: <%= error.message %>",
		sound: "Beep"
	})(err);
	this.emit('end');
};

// --------------------------------------------
//  Task: compile, minify, autoprefix sass/scss
// --------------------------------------------
gulp.task('styles', function() {
	return gulp.src('dev/sass/*.{sass,scss}')
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(postcss([ 
			autoprefixer({ 
				browsers: ['last 5 versions', 'ie 8', 'ie 9', '> 1%'],
				cascade: false,
			}) 
		]))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(cssnano())
		.pipe(sourcemaps.write('/maps'))
		.pipe(gulp.dest('public/css/'))
		.pipe(browserSync.stream({match: '**/*.css'}));
});


// --------------------------------------------
//  Task: compile Jade to HTML
// --------------------------------------------
 
/*
All .jade files with prefix "_" is layout files,
it means when you edit file with prefix "_" 
all your compiled .html files will update.
If you edit any other .jade file with NO prefix
will update only appropriate .html file.
*/
function isPartial(file) {
  return path.basename(file).match(/^_.*/);
}
function findAffectedFiles(changedFile) {
  return new JadeInheritance(changedFile, 'dev/templates', {basedir: 'dev/templates'})
    .files
    .filter(function(file) { return !isPartial(file); })
    .map(function(file) { return 'dev/templates/' + file; })
}
function compileJade(files) {
  return gulp.src(files, {base:'dev/templates'})
    .pipe(plumber({
        errorHandler: onError
    }))
    .pipe(jade({
        pretty: true,
    }))
    .pipe(gulp.dest('public'))
    .pipe(browserSync.reload({
        stream: true
    }));
}
gulp.task('jade', function() {
  return compileJade('dev/templates/**/!(_)*.jade');
});


/* 
If you don't want all features above
just uncomment task below and
comment functions above.
*/

// gulp.task('jade', function() {
// 	return gulp.src('dev/templates/**/!(_)*.jade')
// 		.pipe(plumber({
// 			errorHandler: onError
// 		}))
// 		.pipe(jade({
// 			pretty: true,
// 		}))
// 		.pipe(gulp.dest('public'))
// 		.pipe(browserSync.reload({
// 			stream: true
// 		}));
// });

// --------------------------------------------
//  Task: Minify, concat JavaScript files
// --------------------------------------------

gulp.task('scripts', function() {
	return gulp.src(['dev/js/**/*.js', '!dev/js/lib/**'])
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(concat('main.min.js'))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(gulp.dest('public/js'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Minify, concat JavaScript Lib files
// --------------------------------------------

gulp.task('libScripts', function() {
	return gulp.src('dev/js/lib/**')
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(concat('lib.min.js'))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(gulp.dest('public/js/lib'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Move font files to public
// --------------------------------------------

gulp.task('fonts', function() {
	return gulp.src('dev/fonts/**/*.{ttf,woff,eot,svg,otf,woff2}')
		.pipe(gulp.dest('public/fonts'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Creating sprites
// --------------------------------------------

gulp.task('sprites', function() {
	var spriteData = gulp.src('dev/img/sprites/*.{png,jpg}')
		.pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: '_sprite.scss',
			imgPath: '../img/sprite.png',
			cssFormat: 'scss',
			padding: 4,
			cssTemplate: 'dev/scss.template.mustache'
		}));
	var imgStream = spriteData.img
		.pipe(gulp.dest('public/img/'));
	var cssStream = spriteData.css
		.pipe(gulp.dest('dev/sass/'));
	return merge(imgStream, cssStream)
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Move images to public
// --------------------------------------------

gulp.task('images', function() {
	return gulp.src(['dev/img/**', '!dev/img/{sprites,sprites/**}'])
		.pipe(changed('public/img'))
		//uncomment this if you want imagemin
		/* .pipe(imagemin({
		 	optimizationLevel: 4,
		 	progressive: true,
		 	interlaced: true,
		 })) */
		.pipe(gulp.dest('public/img'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// --------------------------------------------
//  Task: Browser reload
// --------------------------------------------

gulp.task('bs-reload', function() {
	browserSync.reload();
});

// --------------------------------------------
//  Task: Deleting public
// --------------------------------------------

gulp.task('clean', function() {
	return del('public');
});

// --------------------------------------------
//  Task: Watch
// --------------------------------------------

gulp.task('watch', function() {
	gulp.watch('dev/sass/**/*.*', gulp.series('styles'));
	gulp.watch(['dev/js/**/*.js', '!dev/js/lib/**'], gulp.series('scripts'));
	gulp.watch('dev/js/lib/**', gulp.series('libScripts'));
	gulp.watch('dev/img/sprites/*.{png,jpg}', gulp.series('sprites'));
	gulp.watch(['dev/img/**/*', '!dev/img/{sprites,sprites/**}'], gulp.series('images'));
	gulp.watch('dev/fonts/**/*.{ttf,woff,eot,svg,otf}', gulp.series('fonts'));
	gulp.watch('dev/templates/**/*.jade').on('change', function(changedFile) {
    	return compileJade(isPartial(changedFile) ? findAffectedFiles(changedFile) : changedFile);
  	});
  	/* comment watch above and uncomment watch below if you don't want Jade to HTML compile
  	with prefix "_".*/
  	// gulp.watch('dev/templates/**/*.*', gulp.series('jade'));
});

// --------------------------------------------
//  Task: Build
// --------------------------------------------

gulp.task('build', gulp.series(
	'clean',
	gulp.parallel('styles', 'scripts', 'jade', 'fonts', 'sprites', 'images', 'libScripts')));

// --------------------------------------------
//  Task: Basic server
// --------------------------------------------

gulp.task('server', function() {
	browserSync.init({
		server: 'public'
	});
});

// --------------------------------------------
//  Task: Development
// --------------------------------------------

gulp.task('dev',
	gulp.series('build', gulp.parallel('watch', 'server'))
);