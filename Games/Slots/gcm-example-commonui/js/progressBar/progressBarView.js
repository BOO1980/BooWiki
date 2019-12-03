/**
 * (C) 2012 OpenBet Technologies Ltd. All rights reserved.<br>
 *
 *
 * The progressBar View will provide a loading bar
 * in the commonUI by adding the progressBar information
 * inside the loadingDisplayDiv tag in conole.html.
 * The required methods have jsDoc documentation
 *
 * @namespace
 * @author slakshmi
 */

Base.esapi.properties.application.Name = "commonUI";
org.owasp.esapi.ESAPI.initialize();

function progressBarView() {
  }
  /**
   * The loadProgressUpdate function will
   * update the percent complete of the progressBar in the commonUI.
   * @param {number} percentComplete The loading completion percentage.
   */
progressBarView.prototype.loadProgressUpdate = function(percentComplete) {
  var maxMidBarWidth = 188;
  var maxEndBarMarginLeft = 88;
  var startEndBarMarginLeft = -95;


  /* Stretch the middle portion of the bar */
  var middleBar = document.getElementById('loader-bar-middle');
  middleBar.style.width = (maxMidBarWidth * percentComplete / 100) + 'px';
  middleBar.style.marginLeft = - (maxMidBarWidth / 2) + 'px';

  /* Move the end piece of the bar */
  var barEnd = document.getElementById('loader-bar-end');
  barEnd.style.marginLeft = (startEndBarMarginLeft + ((maxEndBarMarginLeft - startEndBarMarginLeft) *
                             percentComplete / 100)) + 'px';
  document.getElementById('progressBarPercentComplete').innerHTML = percentComplete + ' <span class="percent">%</span>';
};


/**
 * The progressBarHTML function will create the progressBar view
 * inside the loadingDisplayTag
 * in the commonUI.html.
 * @param {string} gameName The name of the game to display.
 * @return {string} return the DOM string of preloader loading bar.
 */
progressBarView.prototype.progressBarHTML = function(gameName) {
  return '<div id="progressBarGameLogo"><h2>EXAMPLE COMMONUI<h2></div>' +
      '<div id="progressBarLoadingMessage">LOADING ' + $ESAPI.encoder().encodeForHTML(gameName) + '</div>' +
      '<div id="progressBarLoadingBar">' +
      '   <span class="loader-outer-glow"></span>' +
      '   <span class="loader-edge"></span>' +
      '   <span class="loader-base"></span>' +
      '   <span class="loader-shadow"></span>' +
      '   <span class="loader-bar-start"></span>' +
      '   <span id="loader-bar-middle" class="loader-bar-middle"></span>' +
      '   <span id="loader-bar-end" class="loader-bar-end"></span>' +
      '</div>' +
    '<div id="progressBarPercentComplete">0</div>';
};
