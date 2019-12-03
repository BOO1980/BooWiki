/**
 * CommonUI Object for integration with GCM.
 * (C) 2012 OpenBet Technologies Ltd. All rights reserved.<br>
 *<br>
 * Example CommonUI implementation for GCM Integration<br>
 *<br>
 * The CommonUI must provide a Javascript commonUI
 * object with a set of methods that GCM will call.<br>
 * The required methods have jsDoc documentation<br>
 *<br>
 * In the game HTML it should gcm.js as the deploy structure should be:<br>
 * <br>+-base/
 * <br>+----commonUI/
 * <br>+--------index.html
 * <br>+----gcm/
 * <br>+--------js/
 * <br>+------------gcm.js
 *<br>
 * Therefore the path for GCMBridge should be:<br>
 * '../gcm/gcmBridge.js'<br>
 *<br>
 * Game Specific Loading:<br>
 * The commonUI url includes game specific details in the request params,
 * i.e. gameName=BJStd1Hand.<br>
 * This is done so that the commonUI developer has access to the game
 * details at the earliest possible point.<br>
 * An example function is provided 'getSearchParameterByName' in the commonUI
 * to show how this can be done.<br>
 * The game details can be used to display game specific information during loading,
 * as shown in this example commonUI.<br>
 *
 *
 * @namespace
 * @author asugar
 */
var commonUI = (
  function commonUI() {
  var isDemoPlay_ = false;
  var isExpanded_ = false;
  var isFullScreenTaken_ = false;
  var options_ = {};
  var gcm_ = com.openbet.gcm;
  var commonUIbalances = null;
  var lastSyncTime_ = 0;
  var sessionDuration_ = 0;

  var DEFAULT_WIDTH = 1024;
  var DEFAULT_HEIGHT = 768;
  var DEFAULT_COMMONUI_HEIGHT_EXPAND = 210;
  var DEFAULT_COMMONUI_HEIGHT_TOGGLE = 44;
  var COMMONUI_HEIGHT_MAXIMUM = '100%';
  var COMMONUI_HEIGHT_EXPAND = DEFAULT_COMMONUI_HEIGHT_EXPAND + 'px';
  var COMMONUI_HEIGHT_TOGGLE = DEFAULT_COMMONUI_HEIGHT_TOGGLE + 'px';

  //we must initialize gcm as one of the first things we do
  //pass in gameWindow, commonUIWindow and the base url for the web services
  //change the base url to ../gcm-mock-ws in order to use the static mock web services
  function init()
  {
    gcm_.init(window.parent, window, '../gcm-mock-ws');

    sendReady();
  }

 /**
   * gcm will call this method to display the stake in the commonUI
   * @param {Object} stake a stake moneyInfo oject in the following format:
   *       {display: 'Â£10.00', code:'GBP', value: 10.00 , currency_symbol: 'Â£',
   *       ccy_thousand_separator: ',', ccy_decimal_separator: '.'}.
   */
  function stakeUpdate(stake) {
    document.getElementById('stake').innerHTML = stake['display'];
  }

  /**
   * gcm will call this method to display the paid in the commonUI
   * @param {Object} paid a paid moneyInfo oject in the following format:
   *       {display: 'Â£10.00', code:'GBP', value: 10.00 , currency_symbol: 'Â£',
   *       ccy_thousand_separator: ',', ccy_decimal_separator: '.'}.
   */
  function paidUpdate(paid) {
    document.getElementById('paid').innerHTML = paid['display'];
  }

  /**
   * gcm will call this method to display the balance in the commonUI
   * @param {Object} balances The new formatted balances value to object in the format:
   * <code>
   *            {
   *                'CASH': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
   *                        currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
   *                'FREEBET': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
   *                        currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
   *            }.
   * </code>
   */
  function balancesUpdate(balances) {
    //grab the cash balance
    if(balances['CASH'])
      document.getElementById('balance').innerHTML = balances['CASH'].display;

    //grab the freebet balance
    if(balances['FREEBET'])
      document.getElementById('freebets').innerHTML = balances['FREEBET'].display;

    //store the balances
    commonUIbalances = balances;
  }

  /**
   * gcm will call this method to display the percentage loaded in the commonUI
   * loading screen.  Implementations should illustrate the loading as they wish
   * @param {number} percentLoaded the game loading percentage.
   */
  function loadProgressUpdate(percentLoaded) {
    progressBar_.loadProgressUpdate(percentLoaded);
  }

  /**
   * gcm will call this method when the game is loaded and ready to be shown.
   * The commonUI can decide to display loading content
   * for a little longer if it wishes
   * then it should remove the loading display and call gameRevealed().
   */
  function gameReady() {
    // show minimized topbar
    document.getElementById('loadingDisplayDiv').style.display = 'none';
    document.getElementById('topbarDiv').style.display = 'block';
    document.getElementById('mainTopbarContent').style.display = 'none';

    if(!commonUIDialogBox.isDisplaying())
    {
      //If no error displaying, remove full screen console block
      releaseFullScreen();
    }
    // tell gcm that we can be shrunk back down to 'minimized topbar' size
    minimizeTopbar();

    // call gameRevealed immediately. In the future
    // we can wait until we have shown an end of loading sequence if desired
    gcm_.gameRevealed();
  }

  /**
   * gcm will call this method when the game config has been loaded
   * Until this has been called getConfig() should not be called on gcm
   */
  function configReady() {
    //do nothing
    //can call gcm_.getConfig here if we want to query any game config
    //from the commonUI
  }

  /**
   * Called by gcm when the game play animation starts.  The commonUI should
   * prevent the possibility of any commonUI UI displaying
   * over the game animation
   */
  function gameAnimationStart() {
    //here we disable any UI that shouldn't be shown during game play
    minimizeTopbar();

    //disable UI
    disableUI();
  }

  /**
   * Called by gcm when the game play animation is complete. The commonUI is now
   * free to display content wherever it wants
   */
  function gameAnimationComplete() {
    //here we enable any UI that was disabled during game play
    enableUI();
  }

  /**
   * gcm will call handleError on the commonUI when the game passes a an error to
   * gcm which needs to be displayed. A commonUI implementor should handle the business logic
   * of client side error and always display all errors passed from GCM.<br>
   * When commonUI finished dealing with recoverable error (i.e. INSUFFICIENT_FUNDS and RECOVERABLE_ERROR)
   * commonUI should call gcm.resume() to tell gcm resume from error handling.
   *
   * @param {string} errorCategory the category of current error.
   *                 The current error categories are including:
   *                 {
   *                     CRITICAL,
   *                     INSUFFICIENT_FUNDS,
   *                     LOGIN_ERROR,
   *                     RECOVERABLE_ERROR,
   *                     NON_RECOVERABLE_ERROR,
   *                     CONNECTION_ERROR,
   *                     MULTI_CHOICE_DIALOG,
   *                     OTHER_GAME_IN_PROGRESS
   *                  }.
   * @param {string} errorSeverity this signifies the severity of the error and can
   *          be 'WARNING', 'INFO' or 'ERROR'.
   * @param {string} errorCode the error code string. Note that usually nothing
   *          should be done with this parameter. The commonUI is not expected to
   *          do any business logic based on the error code, but it is passed
   *          through in case the commonUI wishes to log the error codes that
   *          have been sent.
   * @param {string} errorMessage the error message provide by game.
   * @param {Object=} errorParams (Optional) the optional JSON object parameter to allow the game to pass additional
   *          information to the commonUI on how to handle the error. Name key, value pairs
   *          must be provided in a valid JSON format.
   *          This parameter is used for (and not restricted to) error categories "OTHER_GAME_IN_PROGRESS" and "MULTI_CHOICE_DIALOG".
   *
   *          Usage in "OTHER_GAME_IN_PROGRESS"
   *          Raising a "OTHER_GAME_IN_PROGRESS" error category will inform the CommonUI that more than one game is already in progress.
   *          The CommonUI can relaunch the corresponding game by using game information provided in errorParams argument.
   *          When calling an error of this category type the game name must be provided as part of the error parameters
   *          in JSON format in a 'gameName' tag. Any additional game launching information can be provided within
   *          a 'gameInProgressParams' tag in the JSON object.
   *
   *          Example of errorParams object for a "OTHER_GAME_IN_PROGRESS" error:
   *              {'gameName': 'ChainReactors'}
   *              {'gameInProgressParams': {
   *                         'channel': 'I',
   *                         'lang': 'en',
   *                         'playMode': 'real',
   *                         'loginToken': 'tqQRojxew8fBeadMe/8gtOk8nz1+PeuCSE0AQdKyw0Og4wpnFyZhrVh2VhZhp67gz10s8Y2==',
   *                         'affId': '1'
   *                         }
   *              }}
   *
   *
   *          Usage in "MULTI_CHOICE_DIALOG"
   *          Raising a "MULTI_CHOICE_DIALOG" error category will inform the CommonUI that the error dialog can be
   *          displayed with multiple options.  These options will be provided in errorParams object.
   *          When the user acknowledges the error dialog, the selected option's index will be returned to the game.
   *
   *          Example of errorParams object for a "OTHER_GAME_IN_PROGRESS" error:
   *              {'options' : ['Ok', 'Cancel', 'Quit']}
   *
   *
   *          Usage in providing additional error handling information
   *          This is an example of how this parameter can be used when the error category raised is not a "OTHER_GAME_IN_PROGRESS"
   *          or "MULTI_CHOICE_DIALOG" type.  This example provides a method to suppress an error message if for example the previous
   *          error was a "MULTI_CHOICE_DIALOG" error category type and the player selected an option to "close the game".
   *          This could result in the game raising a Critical error to inform the CommonUI that it is closing the game.  This error
   *          can be suppressed since the player has chosen to close the game.
   *
   *          This example scenario would require additional information to be provided in the following format:
   *              {'suppressMessage':'true'}
   *
   */
  function handleError(errorCategory, errorSeverity, errorCode, errorMessage, errorParams)
  {
    var suppressMessage = false;
    var useTopUpDialog = false;
    if (errorParams != null) {
      suppressMessage = errorParams.suppressMessage;
    }
      //the colour and title of the error dialog depends on the errorSeverity
      var errorTitle, messageBoxStyle, errorOKCallback;
      errorTitle = errorSeverity;
      //available style: ERROR, INFO, WARNING
      switch (errorSeverity)
      {
        case 'ERROR':
          messageBoxStyle = commonUIDialogBox.STYLE.ERROR;
          break;

        case 'INFO':
          messageBoxStyle = commonUIDialogBox.STYLE.INFO;
          break;

        case 'WARNING':
          messageBoxStyle = commonUIDialogBox.STYLE.WARNING;
          break;

        default:
          messageBoxStyle = commonUIDialogBox.STYLE.ERROR;
      }
      //the iframe should expand to cover the whole screen with a transparency
      takeFullScreen();

      //decide what to do after clicking ok in error dialog
      //business logic based on errorCategory
      switch (errorCategory)
      {
        //For 'INSUFFICIENT_FUNDS' error we directly popup the quick top-up dialog
        case 'INSUFFICIENT_FUNDS':
          //only display quick pop-up in real play
          if(!isDemoPlay_)
          {
            useTopUpDialog = true;
          }

          errorOKCallback = handleRecoverableErrorCallback;
          break;
        case 'CRITICAL':
          //cannot be resolved by refresh return to lobby
          errorOKCallback = returnToLobby;
          break;
        case 'LOGIN_ERROR':
          //TODO quick login functionality demonstration
          //for now we will just return to lobby
          errorOKCallback = returnToLobby;
          break;
        case 'RECOVERABLE_ERROR':
          errorOKCallback = handleRecoverableErrorCallback;
          break;
        case 'NON_RECOVERABLE_ERROR':
          //we will handle non recoverable errors by reloading the game
          //alternatively they can be handled by returning to lobby
          errorOKCallback = reloadGameWindow;
          break;
        case 'CONNECTION_ERROR':
          //most games will not recover from a connection error
          //so we need to restart
          errorOKCallback = reloadGameWindow;
          break;
        case 'MULTI_CHOICE_DIALOG':
            errorOKCallback = handleRecoverableErrorCallback;
            break;
        case 'OTHER_GAME_IN_PROGRESS':
            errorOKCallback = function(){ launchGameInProgress(errorParams) };
            break;
        default:
          //our default is to reload the game window
          errorOKCallback = reloadGameWindow;
          break;
      }

      //popup a model error dialog
      if (!suppressMessage) {
          if (useTopUpDialog) {
              handleFundsErrorCallback();
          } else {
              commonUIDialogBox.show(errorTitle, errorMessage, messageBoxStyle, errorOKCallback, null, errorCategory, errorParams);
          }
      } else {
          errorOKCallback();
      }
  }

  /*
   * @private
   * reload the game window.
   */
  function reloadGameWindow()
  {
    parent.window.location.reload();
  }

  /*
   * @private
   * return to the lobby
   */
  function returnToLobby() {
      window.parent.location = '../gcm-example-lobby/launch.html';
  }

  /*
   * @private
   * In this example game, after the error dialog acknowledgement, we are redirecting to lobby. But actually
   * the game should be redirected based on the information present in errorParams object using the game launch service.
   * The model errorParams mentioned below can be referred for identifying the values present in that.
   * errorParams = {
   *                  {'gameName': 'ChainReactors'}
   *                  {'gameInProgressParams': {
   *                                            'channel': 'I',
   *                                            'lang': 'en',
   *                                            'playMode': 'real',
   *                                            'loginToken': 'tqQRojxew8fBeadMe/8gtOk8nz1+PeuCSE0AQdKyw0Og4wpnFyZhrVh2VhZhp67gz10s8Y2==',
   *                                            'affId': '1'
   *                                            }
   *                  }
   *               }
   * Using the errorParams values, the game launch service can be invoked to launch the game.
   * @param {Object} JSON object parameter to allow game to pass additional
   *          information to the commonUI on how to handle the error. Key,value pairs
   *          must be provided in a valid JSON format.
   */
   function launchGameInProgress(errorParams) {
       var suppressMessage = false;
       if (errorParams != null) {
         suppressMessage = errorParams.suppressMessage;
       }
       if(!suppressMessage) {
               returnToLobby();
       } else {
               window.parent.location = '../../gcm-example-lobby/launch.html';
       }

   }
  /*
   * @private
   * tell the game to resume
   * @param {number=} errorParamIndex of error Params passed for error category MULTI_CHOICE_DIALOG.
   */
  function resumeGame(errorParamIndex)
  {
    if(errorParamIndex != null ) {
    	gcm_.resume(errorParamIndex);
    } else {
    	gcm_.resume();
    }
  }

  /*
   * @private
   * this is the callback function for handleError()
   * @param {number=} errorParamIndex of error Params passed for error category MULTI_CHOICE_DIALOG.
   * */
   function handleRecoverableErrorCallback(errorParamIndex)
   {
     //reset commonUI iframe
     releaseFullScreen();
     //resume game after recoverable error
     resumeGame(errorParamIndex);
   }

  /*
  * @private
  * this is the callback function for handleError()
  * */
  function handleFundsErrorCallback()
  {
    //display quick top up
    commonUItopUpDialogBox.show('Top-up Your Account', commonUIbalances, quicktopUpCallback);
  }

 /*
  * @private
  * this is the callback function for quick top up()
  * */
  function quicktopUpCallback()
  {
    var topUpAmount = parseFloat(commonUItopUpDialogBox.topUp());
    var cashAmount = commonUIbalances['CASH'].value + topUpAmount;
    var freebetAmount = commonUIbalances['FREEBET'].value;
    var balancesObj_ = {'CASH': {amount: cashAmount }, 'FREEBET': {amount: freebetAmount}};
    gcm_.balancesUpdate(balancesObj_, 0.00, true);
    //reset commonUI iframe
    releaseFullScreen();
    //resume
    resumeGame();
  }

  /**
  * GCM will call regOption on the commonUI when a game has registered
  * that they support this option.
  * The commonUI must then display this option somewhere so that
  * the user is able to control it.
  * This is an optional call for the game to make to GCM.
  * The game can choose to use this facility if they want to allow
  * the commonUI to control game options.
  * @param {string} optionType must be one of MUTE, TURBO.
  *         We can extend this list in the future.
  * @param {boolean} initialValue the initial value for the option.
  */
  function regOption(optionType, initialValue) {
    options_[optionType] = initialValue;

    switch (optionType)
    {
      case 'MUTE':
        //add a mute option to the commonUI display (mute is hidden by default)
        document.getElementById('muteButton').style.display = 'block';
        //switch mute display to the new value
        updateMuteIcon();
        break;

      case 'TURBO':
        //add a turbo option to the commonUI display
        document.getElementById('turboButton').style.display = 'block';
        //switch turbo display to the new value
        updateTurboIcon();
        break;

      case 'ABOUT':
        document.getElementById('aboutIcon').style.display = 'block';
        break;

      case 'GAME_PREFERENCES':
        document.getElementById('prefIcon').style.display = 'block';
        break;

      case 'PAYTABLE':
        options_['GAME_PREFERENCES'] = initialValue;
        document.getElementById('paytableIcon').style.display = 'block';
        break;

    }
  }

  /**
   * GCM will call this when the option has been changed by the game
   * The commonUI should respond by changing the UI for the option in the menu
   * to the new value
   * @param {string} optionType must be one of MUTE, TURBO.
   *                  We can extend this list in the future.
   * @param {boolean} newValue the new value for the option.
   */
  function optionHasChanged(optionType, newValue) {
    options_[optionType] = newValue;
    switch (optionType) {
    case 'MUTE':
      updateMuteIcon();
      break;
    case 'TURBO':
      updateTurboIcon();
      break;
    case 'ABOUT':
      break;
    case 'PAYTABLE':
      options_['PAYTABLE'] = newValue;
      break;
    }
  }

  /**
   * PREVIEW - GCM will call this API to update current session display in commonUI
   * @param {number} duration The duration of current session
   * */
  function sessionDurationUpdate(duration) {
    //record sycn time for local upodate
    sessionDuration_ = duration;
    lastSyncTime_ = (new Date()).getTime();

    updateDurationText(duration);
  }

  /**
   * PREVIEW - GCM will call this API to update current session display in commonUI
   * @param {number} stakes The stakes player placed in current session.
   * @param {number} winnings The amount of credit player won within this session.
   * @param {number} turnover The turnover of current session.
   * */
  function sessionStatsDisplay(stakes, winnings, turnover) {
    var displayMsg = 'Stakes: '+stakes+'\n' +
                     'Winnings: '+winnings+'\n'+
                     'Turnover: '+turnover+'\n';
    //popup stats window
    takeFullScreen();
    commonUIDialogBox.show('Session Stats', displayMsg, commonUIDialogBox.STYLE.QUIT_CONTINUE
                            , sessionContinue, sessionEnd);
  }

  /*
  @private
  * */
  function sessionContinue()
  {
    //continue game session
    releaseFullScreen();
    gcm_.sessionContinue();
  }

  /*
  @private
  * */
  function sessionEnd()
  {
    gcm_.sessionEnd();
    returnToLobby();
  }

  /*
   * @private
   * map util function to local name.
   * This function is used to extract params from commonUI url.
   */
  var getSearchParameterByName = com.openbet.gcm.urlutil.getSearchParameterByName;

  /*
   * update duration time and local time every second
   * @private
   * */
  function localTimerTick() {
    //update session duration
    //only do local update if session started
    if(sessionDuration_ > 0 && lastSyncTime_)
    {
      var timeElapsed = Math.round(((new Date()).getTime() - lastSyncTime_)/1e3);
      updateDurationText(sessionDuration_+timeElapsed);
    }

    //update local time
    var date = new Date();
    document.getElementById('localTimer').innerHTML = formatTime(date.getHours(), date.getMinutes(), date.getSeconds());
  }

  /*
   * @private
  * */
  function updateDurationText(time)
  {
    var hour = Math.floor(time/(60*60));
    var minute = Math.floor(time/60)-hour*60;
    var second = time - hour*60*60 - minute*60;

    document.getElementById('durationTimer').innerHTML = formatTime(hour, minute, second);
  }

  /**
   * @private
   * */
  function formatTime(hour, minute, second)
  {
    return padTimerDigit(hour) + ':' + padTimerDigit(minute) + ':' + padTimerDigit(second);
  }

  /*
  * @private
  * */
  function padTimerDigit(digit)
  {
    if(!digit)
      return '00';
    else if(digit < 10)
      return '0'+digit;
    else
      return digit;
  }

  /*
   * @private
   * minimize the topbar down to just the button
   */
  function minimizeTopbar() {
    isExpanded_ = false;
    requestIframeSize();
    document.getElementById('mainTopbarContent').style.display = 'none';
  }

  /*
   * @private
   */
  function expandTopbar() {
    isExpanded_ = true;
    requestIframeSize();
    document.getElementById('mainTopbarContent').style.display = 'block';
  }

  /*
   * @private
   * minimize the topbar down to just the button
   */
  function takeFullScreen() {
    isFullScreenTaken_ = true;
    requestIframeSize();
  }

  /*
   * @private
   * minimize the topbar down to just the button
   */
  function releaseFullScreen() {
    isFullScreenTaken_ = false;
    requestIframeSize();
  }

  /*
   * @private
   * */
  function requestIframeSize() {
    if (isFullScreenTaken_)
      gcm_.commonUIResize(COMMONUI_HEIGHT_MAXIMUM, '100%');
    else if (isExpanded_)
      gcm_.commonUIResize(COMMONUI_HEIGHT_EXPAND, '100%');
    else
      gcm_.commonUIResize(COMMONUI_HEIGHT_TOGGLE, '40%');
  }
  /*
   * @private
   * disable the commonUI UI
   */
  function disableUI() {
    document.getElementById('toggleTopbarButton').disabled = 'disabled';
  }

  /*
   * @private
   * enable the commonUI UI
   */
  function enableUI() {
    document.getElementById('toggleTopbarButton').disabled = '';
  }

  /*
   * @private
   * show about box
   */
  function toggleAbout() {
    options_['ABOUT'] = !options_['ABOUT'];
    gcm_.optionHasChanged('ABOUT', 'COMMONUI', options_['ABOUT']);
  }

  /*
   * @private
   * show paytable box
   */
  function togglePaytable() {
    options_['PAYTABLE'] = !options_['PAYTABLE'];
    gcm_.optionHasChanged('PAYTABLE', 'COMMONUI', options_['PAYTABLE']);
  }


  /*
   * @private
   * show pref box
   */
  function showPreference() {
    options_['GAME_PREFERENCES'] = !options_['GAME_PREFERENCES'];
    gcm_.optionHasChanged('GAME_PREFERENCES', 'COMMONUI', options_['GAME_PREFERENCES']);
  }

  /*
   * @public
   * toggle the topbar display
   */
  function toggleTopbar() {
    if (!isExpanded_) {
      expandTopbar();
    } else {
      minimizeTopbar();
    }
  }

  /*
   *
   * Mute/Unmute Game Audio from the commonUI
   * @private
   */
  function toggleMute() {
    options_['MUTE'] = !options_['MUTE'];
    gcm_.optionHasChanged('MUTE', 'COMMONUI', options_['MUTE']);

    updateMuteIcon();
  }

 /*
  * @private
  * */
  function updateMuteIcon() {
   if (options_['MUTE']) {
     document.getElementById('muteIconOn').style.display = 'block';
     document.getElementById('muteIconOff').style.display = 'none';
  } else {
     document.getElementById('muteIconOn').style.display = 'none';
     document.getElementById('muteIconOff').style.display = 'block';
   }
  }

  /*
   * Toggle turbo button from the commonUI
   * @private
   */
  function toggleTurbo() {
    options_['TURBO'] = !options_['TURBO'];
    gcm_.optionHasChanged('TURBO', 'COMMONUI', options_['TURBO']);

    updateTurboIcon();
  }

  /*
   * @private
   * */
  function updateTurboIcon() {
    if (options_['TURBO']) {
      document.getElementById('turboIconOn').style.display = 'block';
      document.getElementById('turboIconOff').style.display = 'none';
    } else {
      document.getElementById('turboIconOn').style.display = 'none';
      document.getElementById('turboIconOff').style.display = 'block';
    }
  }

  /*
   * @private
   * inform gcm we are ready
   */
  function sendReady() {
    gcm_.commonUIReady(commonUIForGcm_);

    //start local session duration update interval
    setInterval(localTimerTick, 1000);

    // initially layout commonUI, using device window size
    layout();

    // initially ask for the full screen from gcm
    // 100% height
    takeFullScreen();
  }

  function layout()
  {
    /**@const */
    var MINIMUM_RARIO = 0.5;
    var MAXIMUM_RARIO = 1;

    //this refers to the window that calls this function
    var ratio = Math.min(this.innerWidth / DEFAULT_WIDTH, this.innerHeight / DEFAULT_HEIGHT);
    ratio = Math.max(MINIMUM_RARIO, ratio);
    ratio = Math.min(MAXIMUM_RARIO, ratio);

    //resize iframe
    COMMONUI_HEIGHT_EXPAND = DEFAULT_COMMONUI_HEIGHT_EXPAND * ratio + 'px';
    COMMONUI_HEIGHT_TOGGLE = DEFAULT_COMMONUI_HEIGHT_TOGGLE * ratio + 'px';
    requestIframeSize();

    //resize commonUI layout
    document.getElementsByTagName('body')[0].style.fontSize = ratio + 'em';
  }

  // the public interface for the commonUI which it must expose to gcm
  var commonUIForGcm_ = {
      'stakeUpdate': stakeUpdate,
      'paidUpdate': paidUpdate,
      'balancesUpdate': balancesUpdate,
      'gameAnimationStart': gameAnimationStart,
      'gameAnimationComplete': gameAnimationComplete,
      'gameReady': gameReady,
      'loadProgressUpdate': loadProgressUpdate,
      'handleError': handleError,
      'regOption': regOption,
      'optionHasChanged': optionHasChanged,
      'configReady': configReady,
      'sessionDurationUpdate': sessionDurationUpdate,
      'sessionStatsDisplay': sessionStatsDisplay
  };

  // next we tell gcm that the commonUI has been loaded
  // note we don't have to make this call immediately
  // we can can be loading content whilst the game is
  // loading content

  var gameStr = getSearchParameterByName('gameName', window.location.search);

  var progressBar_ = new progressBarView();
  var loadingDisplayDiv = document.getElementById('loadingDisplayDiv');
  loadingDisplayDiv.innerHTML = progressBar_.progressBarHTML(gameStr);
  document.getElementById('aboutIcon').onclick = function() { toggleAbout(); };
  document.getElementById('prefIcon').onclick = function() { showPreference(); };
  document.getElementById('paytableIcon').onclick = function() { togglePaytable(); };

  //setup play-for-real button
  var playForRealButton = document.getElementById('playForReal');
  var playMode = getSearchParameterByName('playMode', window.location.search);
  if ('demo' == playMode)
  {
    isDemoPlay_ = true;
    playForRealButton.style.display = '';
    playForRealButton.onclick = function() {
      gcm_.playForReal();
    };
  }
  else
  {
    playForRealButton.style.display = 'none';
  }


  //When game window size changes commonUI should relayout
  //to fit the new window size
  //TODO: Doing this is assumeing game window's 'onresize' is not taken
  //And also this could be rewritten by other program on game page
  //There may be a better way doing this.
  window.parent.addEventListener('resize', layout);

  //public interface for commonUI html components
  return {
      'init': init,
      'toggleTopbar': toggleTopbar,
      'toggleMute': toggleMute,
      'toggleTurbo': toggleTurbo
  };
}());
