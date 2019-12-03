var commonUItopUpDialogBox = function() {
  // global variables //
  var TIMER = 20;
  var SPEED = 5;
  var WRAPPER = 'content';
  var _callback = null;

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
   * @param {Object} balances The new formatted balances value to object.
   * @param {Function} callback invoked when window is closed.
   * */
  function showDialog(title, balances, callback) {
    _callback = callback;
    var cashBalance = balances['CASH'].display;
    var ccySymbol = balances['CASH'].currency_symbol;

    var dialog;
    var dialogheader;
    var dialogdeposit;
    var dialogtitle;
    var dialogcontent;
    var dialogmask;
    if (!document.getElementById('topUpDialog')) {
      dialog = document.createElement('div');
      dialog.id = 'topUpDialog';
      dialogheader = document.createElement('div');
      dialogheader.id = 'topUpDialog-header';
      dialogtitle = document.createElement('div');
      dialogtitle.id = 'topUpDialog-title';
      dialogdeposit = document.createElement('div');
      dialogdeposit.id = 'topUpDialog-deposit';
      dialogcontent = document.createElement('div');
      dialogcontent.id = 'topUpDialog-content';
      dialogcontent.align = 'center';
      dialogmask = document.createElement('div');
      dialogmask.id = 'topUpDialog-mask';
      document.body.appendChild(dialogmask);
      document.body.appendChild(dialog);
      dialog.appendChild(dialogheader);
      dialogheader.appendChild(dialogtitle);
      dialog.appendChild(dialogcontent);
      dialog.appendChild(dialogdeposit);
      dialogdeposit.setAttribute('onclick', 'hideDialog()');
      dialogdeposit.onclick = hideDialog;
      dialogdeposit.innerHTML = 'Deposit';
      dialogdeposit.align = 'center';
    } else {
      dialog = document.getElementById('topUpDialog');
      dialogheader = document.getElementById('topUpDialog-header');
      dialogtitle = document.getElementById('topUpDialog-title');
      dialogcontent = document.getElementById('topUpDialog-content');
      dialogmask = document.getElementById('topUpDialog-mask');
      dialogmask.style.visibility = 'visible';
      dialog.style.visibility = 'visible';
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
    dialogheader.className = 'INFOheader';
    dialogtitle.innerHTML = title;
    dialogcontent.className = 'INFO';
    dialogcontent.style.wordWrap = 'break-word';
    dialogcontent.style.whiteSpace = 'pre-wrap';
    dialogcontent.innerHTML = 'You have insufficient funds in your account. To add more funds please use the Quick top controls below'+
                                '<table> <tbody><tr> <td> Cash Balance:        </td> ' +
                                                   '<td id="cashBalance">  ' + cashBalance + '</td></tr>' +
                                             '<tr> <td> Top-Up Amount: ' + ccySymbol + '</td>' +
                                             '<td> <select id="topUpAmount">' +
                                                   '<option value="5.00" selected>5.00</option>' +
                                                   '<option value="10.00">10.00</option>' +
                                                   '<option value="100.00">100.00</option>' +
                                                   '</select> ' +
                                             '</td> </tr>' +
                              '</tbody></table>';
    // dialogcontent.textContent = cashBalance;
    var content = document;
    dialogmask.style.height = content.offsetHeight + 'px';
    dialog.timer = setInterval(function() {fadeDialog(1);}, TIMER);
  }

  function gettopUpAmount() {
    return document.getElementById('topUpAmount').value;
  }
  // hide the dialog box //
  function hideDialog() {
    var dialog = document.getElementById('topUpDialog');
    clearInterval(dialog.timer);
    dialog.timer = setInterval(function() {fadeDialog(0);}, TIMER);
  }

  // fade-in the dialog box //
  function fadeDialog(flag) {
    if (flag == null) {
      flag = 1;
    }
    var dialog = document.getElementById('topUpDialog');
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
      document.getElementById('topUpDialog-mask').style.visibility = 'hidden';
      clearInterval(dialog.timer);

      _callback();
    }
  }

  return {
    STYLE: 'INFO',
    show: showDialog,
    topUp: gettopUpAmount
  };
}();
