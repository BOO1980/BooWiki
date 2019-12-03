/**
npm Dev dependencies

 "devDependencies": {
    "gulp": "^4.0.2",
    "gulp-clean": "^0.4.0",
    "gulp-concat": "^2.6.1",
    "gulp-copy": "^4.0.1",
    "gulp-order": "^1.2.0",
    "gulp-rename": "^1.4.0",
    "gulp-sourcemaps": "^2.6.5",
    "gulp-uglify": "^3.0.2"
    "gulp-javascript-obfuscator": "^1.1.6"
  }

**/

/**
 * Created by shawn on 24/02/2016.
 */
/// <binding ProjectOpened='default' />
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var order = require('gulp-order');
var javascriptObfuscator = require('gulp-javascript-obfuscator');
var clean = require('gulp-clean');

var paths = {
    scriptsOutput: 'dist/honeypot',
    scriptsOutputwatch: '../barkingdeluxe/honeypot',
    scripts: [
      'namespace/namespace.js',
      'utils/logger.js',
      'utils/currency.js',
      'locale/localeManager.js',
      'connection/account.js',
      'connection/slotSymbolRow.js',
      'connection/slotScatterWin.js',
      'connection/slotBonusWin.js',
      'connection/slotLineWin.js',
      'connection/slotState.js',
      'connection/gameState.js',
      'connection/reelSet.js',
      'connection/slotOverlay.js',
      'connection/slotBonus.js',
      'connection/slotPayout.js',
      'connection/symbolDef.js',
      'connection/winline.js',
      'connection/slotDef.js',
      'connection/connection.js',
      'connection/progressiveJackpot.js',
      'connection/openBetConnection.js',
      'connection/openBetReelConnection.js',
      'connection/gdmConnection.js',
      'connection/AccumulatorTransfer.js',
      'connection/accumulatorState.js',
      'connection/accumulator.js',
      'drivers/graphicsPIXI.js',
      'drivers/graphicsDriver.js',
      'display/container.js',
      'display/winlineContainer.js',
      'display/winPanel.js',
      'display/reelSymbol.js',
      'display/graphic.js',
      'display/betPanelContainer.js',
      'display/animatedSprite.js',
      'display/sprite.js',
      'display/highlightSprite.js',
      'display/text.js',
      'display/button.js',
      'display/pickmePanel.js',
      'display/reel.js',
      'display/reelContainer.js',
      'display/screen.js',
      'display/rotationScreen.js',
      'topbar/topBar.js',
      'topbar/gdmTopBar.js',
      'topbar/gcmTopBar.js',
      'display/helpScreen.js',
      'display/reelScreen.js',
      'ui/uiConfig.js',
      'ui/valueButton.js',
      'ui/stakePanel.js',
      'ui/bigwinPanel.js',
      'ui/warningPanel.js',
      'ui/settingsPanel.js',
      'ui/helpPanel.js',
      'ui/autoplayPanel.js',
      'ui/bottomBarUI.js',
      'ui/gameUI.js',
      'connection/blackjack/hand.js',
      'connection/blackjack/player.js',
      'connection/blackjack/blackjackGameState.js',
      'connection/blackjack/blackjackGDMConnection.js',
      'connection/openBetBJConnection.js',
      'game.js'

    ],
    scriptOrder: [
      'namespace/namespace.js',
      'utils/logger.js',
      'utils/currency.js',
      'locale/localeManager.js',
      'connection/account.js',
      'connection/slotSymbolRow.js',
      'connection/slotScatterWin.js',
      'connection/slotBonusWin.js',
      'connection/slotLineWin.js',
      'connection/slotState.js',
      'connection/gameState.js',
      'connection/reelSet.js',
      'connection/slotOverlay.js',
      'connection/slotBonus.js',
      'connection/slotPayout.js',
      'connection/symbolDef.js',
      'connection/winline.js',
      'connection/slotDef.js',
      'connection/connection.js',
       'connection/progressiveJackpot.js',
      'connection/openBetConnection.js',
      'connection/openBetReelConnection.js',
      'connection/gdmConnection.js',
      'connection/AccumulatorTransfer.js',
      'connection/accumulatorState.js',
      'connection/accumulator.js',
      'drivers/graphicsPIXI.js',
      'drivers/graphicsDriver.js',
      'display/container.js',
      'display/winlineContainer.js',
      'display/winPanel.js',
      'display/reelSymbol.js',
      'display/graphic.js',
      'display/betPanelContainer.js',
      'display/animatedSprite.js',
      'display/sprite.js',
      'display/highlightSprite.js',
      'display/text.js',
      'display/button.js',
      'display/pickmePanel.js',
      'display/reel.js',
      'display/reelContainer.js',
      'display/screen.js',
      'display/rotationScreen.js',
      'topbar/topBar.js',
      'topbar/gdmTopBar.js',
      'topbar/gcmTopBar.js',
      'display/helpScreen.js',
      'display/reelScreen.js',
      'ui/uiConfig.js',
      'ui/valueButton.js',
      'ui/stakePanel.js',
      'ui/bigwinPanel.js',
      'ui/warningPanel.js',
      'ui/settingsPanel.js',
      'ui/helpPanel.js',
      'ui/autoplayPanel.js',
      'ui/bottomBarUI.js',
      'ui/gameUI.js',
      'connection/blackjack/hand.js',
      'connection/blackjack/player.js',
      'connection/blackjack/blackjackGameState.js',
      'connection/blackjack/blackjackGDMConnection.js',
      'connection/openBetBJConnection.js',
      'game.js'
    ],
    vendor:[
        '3rdParty/jquery-3.3.1.min.js',
        '3rdParty/pixi.min.js',
        '3rdParty/TweenMax.min.js',
        '3rdParty/PixiPlugin.min.js',
        '3rdParty/pixi-particles.min.js',
        '3rdParty/pixi-filters.js',
        '3rdParty/pixi-sound.js'
    ],
    vendorOrder:[
        '3rdParty/jquery-3.3.1.min.js',
        '3rdParty/pixi.min.js',
        '3rdParty/TweenMax.min.js',
        '3rdParty/PixiPlugin.min.js',
        '3rdParty/pixi-particles.min.js',
        '3rdParty/pixi-filters.js',
        '3rdParty/pixi-sound.js'
    ],
    vendorLegacy:[
        '3rdParty/jquery-3.3.1.min.js',
        '3rdParty/pixi-legacy.min.js',
        '3rdParty/TweenMax.min.js',
        '3rdParty/PixiPlugin.min.js',
        '3rdParty/pixi-particles.min.js',
        '3rdParty/pixi-filters.js',
        '3rdParty/pixi-sound.js'
    ],
    vendorLegacyOrder:[
        '3rdParty/jquery-3.3.1.min.js',
        '3rdParty/pixi-legacy.min.js',
        '3rdParty/TweenMax.min.js',
        '3rdParty/PixiPlugin.min.js',
        '3rdParty/pixi-particles.min.js',
        '3rdParty/pixi-filters.js',
        '3rdParty/pixi-sound.js'
    ],
    vendorSpine:[
        '3rdParty/jquery-3.3.1.min.js',
        '3rdParty/pixi.min.js',
        '3rdParty/TweenMax.min.js',
        '3rdParty/PixiPlugin.min.js',
        '3rdParty/pixi-particles.min.js',
        '3rdParty/pixi-spine.js',
        '3rdParty/pixi-filters.js',
        '3rdParty/pixi-sound.js'
    ],
    vendorSpineOrder:[
        '3rdParty/jquery-3.3.1.min.js',
        '3rdParty/pixi.min.js',
        '3rdParty/TweenMax.min.js',
        '3rdParty/PixiPlugin.min.js',
        '3rdParty/pixi-particles.min.js',
        '3rdParty/pixi-spine.js',
        '3rdParty/pixi-filters.js',
        '3rdParty/pixi-sound.js'
    ],
};

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

// Concatenate & Minify JS

gulp.task('vendor', function () {
    return gulp.src(paths.vendor)
        .pipe(order(paths.vendorOrder, { base: './' }))
        .pipe(concat('vendor.js'))
        .on('error', handleError)
        .pipe(gulp.dest(paths.scriptsOutput))

});

gulp.task('vendorLegacy', function () {
    return gulp.src(paths.vendorLegacy)
        .pipe(order(paths.vendorLegacyOrder, { base: './' }))
        .pipe(concat('vendor.js'))
        .on('error', handleError)
        .pipe(gulp.dest(paths.scriptsOutput))

});

gulp.task('vendorSpine', function () {
    return gulp.src(paths.vendorSpine)
        .pipe(order(paths.vendorSpineOrder, { base: './' }))
        .pipe(concat('vendor.js'))
        .on('error', handleError)
        .pipe(gulp.dest(paths.scriptsOutput))

});
gulp.task('clean', function () {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
});
// Concatenate & Minify JS
gulp.task('scripts', function () {
    return gulp.src(paths.scripts)
        .pipe(order(paths.scriptOrder, { base: './' }))
        .pipe(concat('app.js'))
        .on('error', handleError)
        .pipe(javascriptObfuscator())
        .on('error', handleError)
        .pipe(gulp.dest(paths.scriptsOutput))

});

// Concatenate & Minify JS
gulp.task('scriptswatch', function () {
    return gulp.src(paths.scripts)
        .pipe(order(paths.scriptOrder, { base: './' }))
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .on('error', handleError)
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .on('error', handleError)
        .pipe(gulp.dest(paths.scriptsOutputwatch))

});

gulp.task('copyImages', function () {
   return gulp.src('ui/images/**/*', { base: './' })
        .on('error', handleError)
        .pipe(gulp.dest(paths.scriptsOutput));
});

gulp.task('copySounds', function () {
   return gulp.src('ui/sounds/**/*', { base: './' })
        .on('error', handleError)
        .pipe(gulp.dest(paths.scriptsOutput));
});
// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch(paths.scripts, gulp.series('scriptswatch')).on('error', handleError);

});

gulp.task('buildLegacy', gulp.series('clean','scripts','vendorLegacy','copyImages','copySounds'));
gulp.task('buildSpine', gulp.series('clean','scripts','vendorSpine','copyImages','copySounds'));
gulp.task('build', gulp.series('clean','scripts','vendor','copyImages','copySounds'));

// Default Task
gulp.task('default', gulp.series('watch'));