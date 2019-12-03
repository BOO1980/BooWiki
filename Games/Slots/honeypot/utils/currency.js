HoneyPot.Currency = {
	thousandSeperator :",",
	decimalSeperator : ".",
	currency : "£",
    currencyASCII : "\u00a3",
    currencyPos : "L",
    fracCurrencySymbols : "32;",
    fracCurrencyPos : "R",

	convertDecimalToPence: function(val){
        return (Math.round(val * 100));
    },

    convertPenceToDecimal: function(val){
        return (val / 100);
    },

    formatMoneyPence: function(pence){
        if (pence === null){
            pence = 0;
        }

        return this.formatMoney(pence / 100.0);
    },
    convertPenceToDecimalString : function(pence)
    {
        return ((pence / 100.0).toFixed(2));
    },

    round: function(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    },

    formatMoney: function (money){
        if (money === null)
        {
            money = 0;
        }

        var charAndManArray = ((+money).toFixed(2)).split(".");
        var manStr = (charAndManArray.length > 1) ? (this.decimalSeperator + charAndManArray[1]) : ("");
        var regEx = /(\d+)(\d{3})/;
        var charStr = charAndManArray[0];

        while (regEx.test(charStr))
        {
            charStr = charStr.replace(regEx, '$1' + this.thousandSeperator + '$2');
        }

        return (this.currency + charStr + manStr);
    },
    setCurrencySymbol: function (symbol){
    	this.currency = this.currentCodeMap[symbol];
    },
    currentCodeMap:
    {
        ''    : '',
        'AED' : '\u062F\u002e\u0625',
        'ARS' : '$',
        'AUD' : '$',
        'BDT' : '\u09F3',
        'BRL' : 'R$',
        'CAD' : '$',
        'CHF' : 'Fr.',
        'CLP' : '$',
        'CNY' : '\u00a5',
        'COP' : '$',
        'CRC' : '\u20a1',
        'CUP' : '$',
        'CZK' : 'K\u010d',
        'DKK' : 'kr',
        'DOP' : '$',
        'EGP' : '\u00a3',
        'EUR' : '\u20ac',
        'GBP' : '\u00a3',
        'HKD' : '$',
        'HRK' : 'kn',
        'HUF' : 'Ft',
        'IDR' : 'Rp',
        'ILS' : '\u20AA',
        'INR' : 'Rs',
        'IQD' : '\u0639\u062F',
        'ISK' : 'kr',
        'JMD' : '$',
        'JPY' : '\u00a5',
        'KRW' : '\u20A9',
        'KWD' : '\u062F\u002e\u0643',
        'LKR' : 'Rs',
        'LVL' : 'Ls',
        'MNT' : '\u20AE',
        'MXN' : '$',
        'MYR' : 'RM',
        'NOK' : 'kr',
        'NZD' : '$',
        'PAB' : 'B/.',
        'PEN' : 'S/.',
        'PHP' : 'P',
        'PKR' : 'Rs.',
        'PLN' : 'z\u0142',
        'RON' : 'L',
        'RUB' : '\u0440\u0443\u0431',
        'SAR' : '\u0633\u002E\u0631',
        'SEK' : 'kr',
        'SGD' : '$',
        'SKK' : 'Sk',
        'SYP' : 'SYP',
        'THB' : '\u0e3f',
        'TRY' : 'TL',
        'TWD' : 'NT$',
        'USD' : '$',
        'UYU' : '$',
        'VEF' : 'Bs.F',
        'VND' : '\u20AB',
        'XAF' : 'FCFA',
        'XCD' : '$',
        'YER' : 'YER',
        'ZAR' : 'R'
    },
}