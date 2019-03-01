/**
 * Gulpfile.
 *
 * Gulp with (or without) WordPress.
 *
 * Implements:
 *      1. Live reloads browser with BrowserSync.
 *      2. CSS: Sass to CSS conversion, error catching, Autoprefixing, Sourcemaps,
 *         CSS minification, and Merge Media Queries.
 *      3. JS: Concatenates & uglifies Vendor and Custom JS files.
 *      4. Images: Minifies PNG, JPEG, GIF, and SVG images.
 *      5. Watches files for changes in CSS or JS.
 *      6. Watches files for changes in PHP/njk.
 *      7. Corrects the line endings.
 *      8. InjectCSS instead of browser page reload.
 *      9. Generates .pot file for i18n and l10n. (optional)
 *     10. Sync to outside folder for use in Virtual Machine preview. (optional)
 *     11. Build site for deployment noting revised assets.
 *
 * @author Jeffrey Scott French - extended from work by Ahmad Awais (@ahmadawais)
 * @version 1.2.0
 */
/**
 * Configuration.
 *
 * Project Configuration for gulp tasks.
 *
 * In paths you can add <<glob or array of globs>>. Edit the variables as per your project requirements.
 */

 // START Editing Project Variables. Use the guide in the ReadMe.
 // Project related.
 var client                  = 'Project_Name'; // Human readable, spaces allowed.
 var project                 = 'projectName'; // Computer readable, no spaces, used in filenames.
 var projectURL              = 'ProjectURLBase.dev'; // Project URL. Could be something like localhost:8888.
 var productURL              = './'; // Theme/Plugin URL. Leave it like it is, since our gulpfile.js lives in the root folder.

 // // Translation related for WP
 // var text_domain             = 'ProjectURLBase'; // Your textdomain here.
 // var destFile                = 'ProjectURLBase.pot'; // Name of the transalation file.
 // var packageName             = 'ProjectURLBase'; // Package name.
 // var bugReport               = ''; // Where can users report bugs.
 // var lastTranslator          = 'Jeffrey Scott French <jeffreyscottfrench@gmail.com>'; // Last translator Email ID.
 // var team                    = ''; // Team's Email ID.
 // var translatePath           = './languages' // Where to save the translation files.

// Style related.
var styleSRC                = './build/assets/scss/styles.scss'; // Path to main .scss file.
var styleDestination        = './build/assets/css/'; // Path to place the compiled CSS file.
// Defualt set to root folder.

// JS Vendor related.
var jsVendorSRC             = './build/assets/js/vendor/*.js'; // Path to JS vendor folder.
var jsVendorDestination     = './build/assets/js/'; // Path to place the compiled JS vendors file.
var jsVendorFile            = 'vendors'; // Compiled JS vendors file name.
// Default set to vendors i.e. vendors.js.

// JS Custom related.
var jsCustomSRC             = './build/assets/js/custom/*.js'; // Path to JS custom scripts folder.
var jsCustomDestination     = './build/assets/js/'; // Path to place the compiled JS custom scripts file.
var jsCustomFile            = project; // Compiled JS custom file name.
// Default set to custom i.e. custom.js.

// Images related.
var imagesSRC               = './build/assets/img/raw/**/*.{png,jpg,gif,svg}'; // Source folder of images which should be optimized.
var imagesDestination       = './build/images/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

// Watch files paths.
var styleWatchFiles         = './build/assets/scss/**/*.scss'; // Path to all *.scss files inside css folder and inside them.
var vendorJSWatchFiles      = './build/assets/js/vendor/**/*.js'; // Path to all vendor JS files.
var customJSWatchFiles      = './build/assets/js/custom/*.js'; // Path to all custom JS files.
var imageWatchFiles         = './build/assets/img/raw/**/*.{png,jpg,gif,svg}'; // Path to all image files inside img folder and inside them.
var projectPHPWatchFiles    = './**/*.php'; // Path to all PHP files.
var projectNunjucksWatchFiles    = './build/nunjucks/**/*.+(nunjucks|njk|html)'; // Path to all nunjucks files.

/** Browsers you care about for autoprefixing.
* Use the current defaults set via package.json using
* Browserlist https://github.com/ai/browserslist
* or uncomment below to manually specifiy, and then swap which usage of autoprefixer is called in the 'styles' task at line 230 (approx).
*/
// const AUTOPREFIXER_BROWSERS = [
//     'last 2 version',
//     '> 1%',
//     'ie >= 9',
//     'ie_mob >= 10',
//     'ff >= 30',
//     'chrome >= 34',
//     'safari >= 7',
//     'opera >= 23',
//     'ios >= 7',
//     'android >= 4',
//     'bb >= 10'
//   ];

/** Additional static files that should be included in the build.
 * These can be previewed in the normal build and will be copied over to the dist folder.
*/
var extras = {
  files: ['./build/.htaccess', './build/favicon.ico', './build/robots.txt', './build/ieconfig.xml', './build/sitemap.xml']
};

// STOP Editing Project Variables.

/**
 * Load Plugins.
 *
 * Load gulp plugins and assing them semantic names.
 */
var gulp         = require('gulp'); // Gulp of-course

// CSS related plugins.
var sass         = require('gulp-sass'); // Gulp pluign for Sass compilation.
var postcss      = require('gulp-postcss');
var autoprefixer = require('gulp-autoprefixer'); // Autoprefixing magic.
var cssnano      = require('cssnano'); // Minifies CSS files.
var mmq          = require('gulp-merge-media-queries'); // Combine matching media queries into one media query definition.

// JS related plugins.
var babel        = require('gulp-babel'); // write ES6!
var concat       = require('gulp-concat'); // Concatenates JS files
var uglify       = require('gulp-uglify'); // Minifies JS files

// Image realted plugins.
var imagemin     = require('gulp-imagemin'); // Minify PNG, JPEG, GIF and SVG images with imagemin.
var imageminJpegOptim = require('imagemin-jpegoptim');
var imageResize  = require('gulp-image-resize'); // Resize using ImageMagick
var exif         = require('exiftool');
var fs           = require('fs');

// Nunjucks related plugins.
var nunjucksRender = require('gulp-nunjucks-render');

// Utility related plugins.
var rename       = require('gulp-rename'); // Renames files E.g. style.css -> style.min.css
var rev          = require('gulp-rev');
var revReplace   = require('gulp-rev-replace'); // Version name changed assets and link to corresponding parent files that use them.
var lineec       = require('gulp-line-ending-corrector'); // Consistent Line Endings for non UNIX systems. Gulp Plugin for Line Ending Corrector (A utility that makes sure your files have consistent line endings)
var filter       = require('gulp-filter'); // Enables you to work on a subset of the original files by filtering them using globbing.
var gulpIf       = require('gulp-if'); // Filter results with logic
var sourcemaps   = require('gulp-sourcemaps'); // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css)
var notify       = require('gulp-notify'); // Sends message notification to you
var useref       = require('gulp-useref'); // Swaps file paths used in development to those used in distribution.
var symlink      = require('gulp-sym'); // Create a shortcut reference instead of copying over unchanged files (eg images folder).
var newer        = require('gulp-newer');
var del          = require('del');
var path         = require('path');
var through      = require('through2');
var parallel     = require('concurrent-transform');
var os           = require('os');
var fileList     = require('gulp-filelist');
var filenames    = require('gulp-filenames');
var data         = require('gulp-data'); // Attach data from outside source
var lazypipe     = require('lazypipe');
var runSequence  = require('run-sequence');
var php          = require('gulp-connect-php'); // Serve php files locally in the build environment using browserSync.
var browserSync  = require('browser-sync').create(); // Reloads browser and injects CSS. Time-saving synchronised browser testing.
var reload       = browserSync.reload; // For manual browser reload.



/**
 * Task: `browser-sync`.
 *
 * Live Reloads, CSS injections, Localhost tunneling.
 *
 * This task does the following:
 *    1. Sets the project URL
 *    2. Sets inject CSS
 *    3. You may define a custom port
 *    4. You may want to stop the browser from openning automatically
 */
const browserSyncTask = function (done) {
  browserSync.init({

    // For more options
    // @link http://www.browsersync.io/docs/options/
    server: {
      baseDir: './build'
    },
    // Project URL.
    // proxy: projectURL,

    // `true` Automatically open the browser with BrowserSync live server.
    // `false` Stop the browser from automatically opening.
    open: true,

    // Inject CSS changes.
    // Comment it to reload browser for every CSS change.
    injectChanges: true,

    // Use a specific port (instead of the one auto-detected by Browsersync).
    port: 3000,

    // Use a specific browser or multiple browsers ("google chrome" or multiple ["firefox", "safari technology preview"] ).
    browser: ["google chrome", "firefox developer edition"]

  });
  done();
};

gulp.task('browser-sync', gulp.series(browserSyncTask));


const browserSyncProofTask = function (done) {
  browserSync.init({

    // For more options
    // @link http://www.browsersync.io/docs/options/
    server: {
      baseDir: './dist'
    },
    // Project URL.
    // proxy: 'stephentalasnik.dev',

    // `true` Automatically open the browser with BrowserSync live server.
    // `false` Stop the browser from automatically opening.
    open: true,

    // Inject CSS changes.
    // Comment it to reload browser for every CSS change.
    injectChanges: true,

    // Use a specific port (instead of the one auto-detected by Browsersync).
    port: 8888,

    // Use a specific browser or multiple browsers ("google chrome" or multiple ["firefox", "safari technology preview"] ).
    browser: ["google chrome", "firefox developer edition"]

  });
  done();
};

gulp.task('browser-sync_proof', gulp.series(browserSyncProofTask));

/**
 * Task: 'nunjucks'
 * standard nunjucks environment
 **/
const nunjucksTask = function (done) {
  gulp.src('./build/nunjucks/njk_SrcFiles/**/*.+(njk|html)')
    .pipe(nunjucksRender({
      path: ['./build/nunjucks/templates']
    }))
    .pipe(gulp.dest('./build'))
  done();
};
gulp.task('nunjucks', gulp.series(nunjucksTask));

/**
 * Global variables from data
 * Used to pull data from json object and pass to all parts of nunjucks
 * Use .nunjucks file extension when pulling from json data object
 **/
const getJsonData = function (file) {
  var fs = require('fs');
  return JSON.parse(fs.readFileSync(path.dirname(file.path) + '/' + path.basename(file.path, '.nunjucks') + '.json'));
};

const jsonTask = function (done) {
  gulp.src('./build/nunjucks/njk_SrcFiles/**/*.nunjucks')
  .pipe(data(getJsonData))
  // Do stuff with the data here or just send it on down the pipe
  .pipe(nunjucksRender({
    path: ['./build/nunjucks/templates']
  }))
  .pipe(gulp.dest('./build'))
  done();
};
gulp.task('json', gulp.series(jsonTask));

/**
 * Task: `styles`.
 *
 * Compiles Sass, Autoprefixes it and Minifies CSS.
 *
 * This task does the following:
 *    1. Gets the source scss file
 *    2. Compiles Sass to CSS
 *    3. Writes Sourcemaps for it
 *    4. Autoprefixes it and generates style.css
 *    5. Renames the CSS file with suffix .min.css
 *    6. Minifies the CSS file and generates style.min.css
 *    7. Injects CSS or reloads the browser via browserSync
 */
const stylesTask = function (done) {
  gulp.src( styleSRC )
  .pipe( sourcemaps.init() )
  .pipe( sass( {
    errLogToConsole: true,
    outputStyle: 'compact',
    //outputStyle: 'compressed',
    // outputStyle: 'nested',
    // outputStyle: 'expanded',
    precision: 10
  } ) )
  .on('error', console.error.bind(console))
  .pipe( sourcemaps.write( { includeContent: false } ) )
  .pipe( sourcemaps.init( { loadMaps: true } ) )
  // uncomment for manual list set above
  // .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )
  .pipe( autoprefixer() )
  .pipe( sourcemaps.write ( "." ) ) // gulp is already in the dest folder now.

  .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
  .pipe( gulp.dest( styleDestination ) )

  .pipe( filter( '**/*.css' ) ) // Filtering stream to only css files
  .pipe( mmq( {log: true} ))

  .pipe( browserSync.stream() ) // Reloads style.css if that is enqueued.

  .pipe( rename( { suffix: '.min' } ) )
  .pipe( postcss([ cssnano() ]) )
  .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
  .pipe( gulp.dest( styleDestination ))

  .pipe( filter( '**/*.css' )) // Filtering stream to only css files
  .pipe( browserSync.stream() )// Reloads style.min.css if that is enqueued.
  .pipe( notify({
    onlast: true,
    message: function(){
      return 'TASK: "styles" Completed! 💯';
    }
  }));
  done();
};
gulp.task('styles', gulp.series(stylesTask));

/**
 * Task: `vendorJS`.
 *
 * Concatenate and uglify vendor JS scripts.
 *
 * This task does the following:
 *     1. Gets the source folder for JS vendor files
 *     2. Concatenates all the files and generates vendors.js
 *     3. Renames the JS file with suffix .min.js
 *     4. Uglifes/Minifies the JS file and generates vendors.min.js
 */
const vendorsJsTask = function (done) {
  gulp.src(jsVendorSRC)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat(jsVendorFile + '.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(jsVendorDestination))
    .pipe(rename({
      basename: jsVendorFile,
      suffix: '.min'
    }))
    .pipe(filter('**/*.js')) // Filtering stream to only js files
    .pipe(uglify())
    .pipe(lineec()) // Consistent Line Endings for non UNIX systems.
    .pipe(gulp.dest(jsVendorDestination))
    .pipe(notify({
      onLast: true,
      message: function () {
        return 'TASK: "vendorsJs" Completed! 💯';
      }
    }));
    done();
};
gulp.task('vendorsJs', gulp.series(vendorsJsTask));


/**
 * Task: `customJS`.
 *
 * Concatenate and uglify custom JS scripts.
 *
 * This task does the following:
 *     1. Gets the source folder for JS custom files
 *     2. Concatenates all the files and generates custom.js
 *     3. Renames the JS file with suffix .min.js
 *     4. Uglifes/Minifies the JS file and generates custom.min.js
 */
const customJSTask = function (done) {
  gulp.src(jsCustomSRC)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat(jsCustomFile + '.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(jsCustomDestination))
    .pipe(rename({
      basename: jsCustomFile,
      suffix: '.min'
    }))
    .pipe(filter('**/*.js')) // Filtering stream to only js files
    .pipe(uglify())
    .pipe(lineec()) // Consistent Line Endings for non UNIX systems.
    .pipe(gulp.dest(jsCustomDestination))
    .pipe(notify({
      onLast: true,
      message: function () {
        return 'TASK: "customJS" Completed! 💯';
      }
    }));
    done();
};
gulp.task('customJS', gulp.series(customJSTask));


// resize images
let resizeTheseImages = [];

[400,600,800,1200,1600,2000].forEach(function (size) {
  let resizeThisImage = 'resize_' + size;
  gulp.task(
    resizeThisImage,
    gulp.series( (done) => {
      return gulp.src( imagesSRC )
        .pipe( filter('**/*.jpg'))
        .pipe( newer( {
          dest: imagesDestination,
          map:
            function(relativePath) {
              let relativePathBasename = relativePath.replace('.jpg', '');
              return relativePathBasename + '-' + size + '.jpg';
            }
        }))
        .pipe( parallel(
          imageResize({
            imageMagick: true,
            width: size,
            crop: false,
            upscale: false
          }),
          os.cpus().length
        ))
        .pipe( rename( function(path) {
            path.basename += '-' + size;
        }))
        .pipe( imagemin([
          imageminJpegOptim({
            max: 80,
            stripAll: false,
            stripCom: true,
            stripExif: true,
            stripIptc: true,
            stripXmp: true,
            stripIcc: false
          })
        ]))
      .pipe(gulp.dest( imagesDestination ))
      done();
    })
  );
  resizeTheseImages.push(resizeThisImage);
});

/**
 * resize for hi density screens
 */
[800,1200,1600,2000,2400].forEach(function (size) {
  let resizeThisImage_hidpi = 'resize_HiDpi_' + size;
  gulp.task(
    resizeThisImage_hidpi,
    gulp.series( (done) => {
      return gulp.src( imagesSRC )
        .pipe( filter('**/*.jpg') )
        .pipe( newer( {
          dest: imagesDestination,
          map:
            function(relativePath) {
              let relativePathBasename = relativePath.replace('.jpg', '');
              return relativePathBasename + '-' + size + '-2x' + '.jpg';
            }
        }))
        .pipe( parallel(
          imageResize({
            imageMagick: true,
            width: size,
            crop: false,
            upscale: false
          }),
          os.cpus().length
        ))
        .pipe( rename( function(path) {
            path.basename += '-' + size + '-2x';
        }))
        .pipe( imagemin([
          imageminJpegOptim({
            max: 50,
            stripAll: false,
            stripCom: true,
            stripExif: true,
            stripIptc: true,
            stripXmp: true,
            stripIcc: false
          })
        ]))
      .pipe(gulp.dest( imagesDestination ))
      done();
    })
  );
  resizeTheseImages.push(resizeThisImage_hidpi);
});
gulp.task('resizeImages', gulp.parallel(resizeTheseImages));

/**
 * Task: `images`.
 *
 * Minifies PNG, JPEG, GIF and SVG images.
 *
 * This task does the following:
 *     1. Gets the source of images raw folder
 *     2. Minifies PNG, JPEG, GIF and SVG images
 *     3. Generates and saves the optimized images
 *
 * This task will run only once, if you want to run it
 * again, do it with the command `gulp images`.
 */
const imagesTask = function (done) {
  gulp.src( imagesSRC )
  .pipe( filter('**/*.{gif, png, svg}'))
  .pipe( newer( imagesDestination ))
  .pipe( imagemin( {
    progressive: true,
    optimizationLevel: 1, // 0-7 low-high
    interlaced: true,
    svgoPlugins: [{removeViewBox: false}]
  } ) )
  .pipe(gulp.dest( imagesDestination ))
  .pipe( notify( { message: 'TASK: "images" Completed! 💯', onLast: true } ) );
  done();
};
gulp.task( 'images', imagesTask );

/**
 * WP POT Translation File Generator.
 *
 * * This task does the following:
 *     1. Gets the source of all the PHP files
 *     2. Sort files in stream by path or any custom sort comparator
 *     3. Applies wpPot with the variable set at the top of this file
 *     4. Generate a .pot file of i18n that can be used for l10n to build .mo file
 */
// Uncomment to use
// const translateTask = function (done) {
//   gulp.src( projectPHPWatchFiles )
//     .pipe(sort())
//     .pipe(wpPot( {
//         domain        : text_domain,
//         destFile      : destFile,
//         package       : packageName,
//         bugReport     : bugReport,
//         lastTranslator: lastTranslator,
//         team          : team
//     } ))
//     .pipe(gulp.dest(translatePath))
//     .pipe( notify( { message: 'TASK: "translate" Completed! 💯', onLast: true } ) )
//     done();
// };
// gulp.task( 'translate', gulp.series(translateTask));


/**
 * Sync Task.
 *
 * Syncs to folder outside of project folder for use on virtual machine.
 */
// Uncomment to use
// const syncTask = function(done) {
//   gulp.src('./**/*')
//   .pipe(newer('../../Dev/VVV/www/')) // add folder
//   .pipe(gulp.dest('../../Dev/VVV/www/')); // add folder
//   done();
// };
// gulp.task('sync', gulp.series(syncTask));

/**
 * Watches for file changes and runs the sync task above.
 */
// Uncomment to use
// const syncWatchTask = function(done) {
//   var watcher = gulp.watch('./**/*', gulp.parallel('sync'));
//   watcher.on('change', function(ev) {
//     if(ev.type === 'deleted') {
//       del(path.relative('./', ev.path).replace('/','../../Dev/VVV/www/bmblog/htdocs/wp-content/themes/bm2017/'));
//     }
//   });
//   done();
// };
// gulp.task('sync-watch', syncWatchTask);


/** Build Tasks
  * These will excecute only when the build function is called
*/

const cleanDist = function (done) {
  del.sync('./dist');
  done();
};
gulp.task('clean:dist', gulp.series(cleanDist));

const aliasFoldersTask = function (done) {
  gulp.src('./build/images')
  .pipe(symlink('./dist/images'))
  done();
};
gulp.task('alias-folders', gulp.series(aliasFoldersTask))

const userefTask = function (done) {
  gulp.src('./build/**/*.+(html|php)')
  .pipe(useref({
    searchPath: './build',
    transformPath: function (filePath) {
      const regExp = /\.*\/assets/;
      return filePath.replace(regExp, '/assets');
    }
  }))
  .pipe(gulpIf('*.js', rev()))
  .pipe(gulpIf('*.css', rev()))
  .pipe(revReplace())
  .pipe(gulp.dest('./dist'))
  done();
};
gulp.task('useref', gulp.series(userefTask));

const fontsTask = function (done) {
  gulp.src('./build/assets/fonts/**/*')
  .pipe(gulp.dest('./dist/assets/fonts'))
  done();
};
gulp.task('fonts', gulp.series(fontsTask));

const copyFilesTask = function (done) {
  gulp.src(extras.files)
  .pipe(gulp.dest('./dist'))
  done();
};
gulp.task('copyFiles', gulp.series(copyFilesTask));


/** Build out the site to upload */
gulp.task(
  'build',
  gulp.series(
    'clean:dist',
    'alias-folders',
    gulp.parallel('useref', 'fonts', 'copyFiles'),
    'browser-sync_proof'
  )
);

// Use With Sync to Virtual Machine (WP development)
// gulp.task( 'devwp', gulp.series(
//   gulp.parallel('styles', 'vendorsJs', 'customJS', 'images', 'sync'),
//   gulp.series('browser-sync'),
//   gulp.parallel(
//     function () {
//     gulp.watch( projectPHPWatchFiles, gulp.series('sync', browserSync.reload ) ); // Reload on PHP file changes.
//     gulp.watch( styleWatchFiles, gulp.series('styles', 'sync', browserSync.reload) ); // Reload on SCSS file changes.
//     gulp.watch( vendorJSWatchFiles, gulp.series( 'vendorsJs', 'sync', browserSync.reload ) ); // Reload on vendorsJs file changes.
//     gulp.watch( customJSWatchFiles, gulp.series( 'customJS', 'sync', browserSync.reload ) ); // Reload on customJS file changes.
//   })
// ));

// Watch for changes (called from default)
const watchTasks = function (done) {
  // Rebuild compiled html files on nunjuck file changes and reload.
  gulp.watch( projectNunjucksWatchFiles, gulp.series('nunjucks', 'json', browserSync.reload));
  // Reload on SCSS file changes.
  gulp.watch( projectPHPWatchFiles ).on('change', browserSync.reload );
  // Rerun on SCSS file changes (will inject from styles task).
  gulp.watch( styleWatchFiles, gulp.series('styles'));
  // Rerun and Reload on images file changes.
  gulp.watch( imageWatchFiles, gulp.series('images', browserSync.reload));
  // Reload on vendorsJs file changes.
  gulp.watch( vendorJSWatchFiles ).on('change', browserSync.reload);
  // Rerun and Reload on customJS file changes.
  gulp.watch( customJSWatchFiles, gulp.series('customJS', browserSync.reload));
  done();
};
gulp.task('watch', gulp.parallel(watchTasks));

// Standard
gulp.task(
  'default',
  gulp.series(
    'nunjucks',
    'json',
    'styles',
    'vendorsJs',
    'customJS',
    'images',
    'browser-sync',
    'watch'
  )
);
