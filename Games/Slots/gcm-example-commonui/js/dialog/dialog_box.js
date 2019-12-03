var commonUIDialogBox = function() {
  // global variables //
  var TIMER = 20;
  var SPEED = 5;
  var WRAPPER = 'content';
  var _callback = null;
  var _quitCallback = null;
  var _usingCallback = null;
  var _isDisplaying = false;
  var errorParamsOptions_ = [];
  var messageBoxStyle = {
    ERROR: 'ERROR',
    INFO: 'INFO',
    WARNING: 'WARNING',
    QUIT_CONTINUE: 'QUIT_CONTINUE'
  };

  /**
   * @return {Number} current window width.
   * */
  function pageWidth() {
    return window.innerWidth != null ? window.innerWidth :
           document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth :
           document.body != null ? document.body.clientWidth : null;
  }

  /**
   * @return {Number} current window height.
   * */
  function pageHeight() {
    return window.innerHeight != null ? window.innerHeight :
           document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight :
           document.body != null ? document.body.clientHeight : null;
  }

  /**
   * @return {Number} current window vertical offset.
   * */
  function topPosition() {
    return typeof window.pageYOffset != 'undefined' ? window.pageYOffset :
           document.documentElement && document.documentElement.scrollTop ? document.documentElement.scrollTop :
           document.body.scrollTop ? document.body.scrollTop : 0;
  }

  /**
   * @return {Number} the position starting at the left of the window.
   * */
  function leftPosition() {
    return typeof window.pageXOffset != 'undefined' ? window.pageXOffset :
           document.documentElement && document.documentElement.scrollLeft ? document.documentElement.scrollLeft :
           document.body.scrollLeft ? document.body.scrollLeft : 0;
  }

  /**build/show the dialog box,
   * populate the data and call the fadeDialog function
   * @param {string} title Message box title.
   * @param {string} message Message content.
   * @param {string} type Message Type (Error/Warning/Info).
   * @param {Function} callback invoked when window is closed.
   * @param {Function=} quitCallback involved when quit option is selected.
   * @param {string=} error category (Optional) 
   * @param {Object=} errorParams (Optional) JSON object parameter to allow game to pass additional
   *          information to the commonUI on how to handle the error. Key,value pairs
   *          must be provided in a valid JSON format.
   * */
  function showDialog(title, message, type, callback, quitCallback, errorCategory, errorParams) {
    //if there is a msg displaying, cancel display another one.
    if(_isDisplaying)
      return false;

    //mark current is showing a msg
    _isDisplaying = true;

    if (!type) {
      type = 'error';
    }
    _callback = callback;
    _quitCallback = quitCallback;
    var dialog;
    var dialogheader;
    var dialogclose, dialogQuit;
    var dialogtitle;
    var dialogcontent;
    var dialogmask;
    var displayType;

    if (document.getElementById("errorDialog")!= null) {
       var elementDialog = document.getElementById('errorDialog');
       elementDialog.parentNode.removeChild(elementDialog);
       var elementDialogMask = document.getElementById('errorDialog-mask');
       elementDialogMask.parentNode.removeChild(elementDialogMask);
    }
    dialog = document.createElement('div');
    dialog.id = 'errorDialog';
    dialogheader = document.createElement('div');
    dialogheader.id = 'errorDialog-header';
    dialogtitle = document.createElement('div');
    dialogtitle.id = 'errorDialog-title';
    dialog.style.visibility = 'visible';
    if (errorCategory == "MULTI_CHOICE_DIALOG" && errorParams != null ) {
         errorParamsOptions_ = errorParams.options;
         var optionElements = [];
         dialogcontent = document.createElement('div');
         dialogcontent.id = 'errorDialog-content';
         dialogmask = document.createElement('div');
         dialogmask.id = 'errorDialog-mask';
         document.body.appendChild(dialogmask);
         document.body.appendChild(dialog);
         dialog.appendChild(dialogheader);
         dialogheader.appendChild(dialogtitle);
         dialog.appendChild(dialogcontent);
         var marginLeftSize = errorParamsOptions_.length;
         for (var index = 0; index < errorParamsOptions_.length; ++index) {
            optionElements[index] = document.createElement('div');
            optionElements[index].id = 'errorDialog-'+errorParamsOptions_[index];
            optionElements[index].className = 'dialog-confirm-button';
            optionElements[index].setAttribute("style","margin-left:" + marginLeftSize + "%");
            marginLeftSize = marginLeftSize + (errorParamsOptions_.length * 10);
            dialog.appendChild(optionElements[index]);
            (function(i){
            	optionElements[index].onclick = function(){ confirmDialog(errorParamsOptions_[i]) };
            }(index));
            optionElements[index].innerHTML = errorParamsOptions_[index];
            optionElements[index].align = 'center';
        }
     } else {
         
         dialogcontent = document.createElement('div');
         dialogcontent.id = 'errorDialog-content';
         dialogmask = document.createElement('div');
         dialogmask.id = 'errorDialog-mask';
         document.body.appendChild(dialogmask);
         document.body.appendChild(dialog);
         dialog.appendChild(dialogheader);
         dialogheader.appendChild(dialogtitle);
         dialog.appendChild(dialogcontent);
         dialogclose = document.createElement('div');
         dialogclose.id = 'errorDialog-close';
         dialogclose.className = 'dialog-confirm-button';
         dialogQuit = document.createElement('div');
         dialogQuit.id = 'errorDialog-quit';
         dialogQuit.className = 'dialog-confirm-button';
         dialog.appendChild(dialogclose);
         dialogclose.onclick = confirmDialog;
         dialogclose.innerHTML = 'OK';
         dialogclose.align = 'center';
         dialog.appendChild(dialogQuit);
         dialogQuit.onclick = quitDialog;
         dialogQuit.innerHTML = 'Quit';
         dialogQuit.align = 'center';
         
      }
    if (type == messageBoxStyle.QUIT_CONTINUE) {
        dialogQuit.style.display = '';
        displayType = messageBoxStyle.INFO;
     } else {
        if (document.getElementById("errorDialog-quit")!= null) {
            dialogQuit.style.display = 'none';
        }
        displayType = type;
     }
    dialog.style.opacity = .00;
    dialog.style.filter = 'alpha(opacity=0)';
    dialog.alpha = 0;
    var width = pageWidth();
    var left = leftPosition();
    var dialogwidth = dialog.offsetWidth;
    var leftposition = left + (width / 2) - (dialogwidth / 2);
    dialog.style.top = 2 + 'em';
    dialog.style.left = leftposition + 'px';
    dialogheader.className = displayType + 'header';
    dialogtitle.innerHTML = title;
    dialogcontent.className = displayType;
    dialogcontent.style.wordWrap = 'break-word';
    dialogcontent.style.whiteSpace = 'pre-wrap';
    dialogcontent.innerText = message;
    dialogcontent.textContent = message;
    var content = document;
    dialogmask.style.height = content.offsetHeight + 'px';
    dialog.timer = setInterval(function() {fadeDialog(1);}, TIMER);

    return true;
  }
  /**
  * confirmation button dialog for error dialog. 
  * @param {string=} errorParamOption of error Params passed for error category MULTI_CHOICE_DIALOG
  */
  function confirmDialog(errorParamOption) {
    _usingCallback = _callback;
    var errorParamIndex = null;
    if (errorParamOption != null && errorParamsOptions_.length > 0) {
       errorParamIndex = errorParamsOptions_.indexOf(errorParamOption);
       hideDialog(errorParamIndex);
       errorParamsOptions_ = [];
    } else {
       hideDialog(errorParamIndex);	
    }
    
  }

  function quitDialog() {
    _usingCallback = _quitCallback;
    hideDialog();
  }


  /**
   *   hide the dialog box . 
   * @param {number=} errorParamIndex of error Params passed for error category MULTI_CHOICE_DIALOG
   */
  function hideDialog(errorParamIndex) {
    var dialog = document.getElementById('errorDialog');
    clearInterval(dialog.timer);
    dialog.timer = setInterval(function() {fadeDialog(0,errorParamIndex);}, TIMER);
  }

  /**
   *  fade-in the dialog box . 
   * @param {Boolean} flag value for the  fade in dialog box
   * @param {number=} errorParamIndex of error Params passed for error category MULTI_CHOICE_DIALOG
   */
  function fadeDialog(flag,errorParamIndex) {
    if (flag == null) {
      flag = 1;
    }
    var dialog = document.getElementById('errorDialog');
    var value;
    if (flag == 1) {
      value = dialog.alpha + SPEED;
    } else {
      value = dialog.alpha - SPEED;
    }
    dialog.alpha = value;
    dialog.style.opacity = (value / 100);
    dialog.style.filter = 'alpha(opacity=' + value + ')';
    if (value >= 99) {
      clearInterval(dialog.timer);
      dialog.timer = null;
    } else if (value <= 1) {
      dialog.style.visibility = 'hidden';
      document.getElementById('errorDialog-mask').style.visibility = 'hidden';
      clearInterval(dialog.timer);

      _isDisplaying = false;
      _usingCallback(errorParamIndex);
    }
  }

  function isDisplaying()
  {
    return _isDisplaying;
  }

  return {
    STYLE: messageBoxStyle,
    show: showDialog,
    isDisplaying: isDisplaying
  };
}();
