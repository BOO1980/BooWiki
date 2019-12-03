HoneyPot.OpenBetReelConnection = function(config, callback){
	HoneyPot.OpenBetConnection.call(this,config, callback);
	
}

HoneyPot.OpenBetReelConnection.prototype = Object.create(HoneyPot.OpenBetConnection.prototype);
HoneyPot.OpenBetReelConnection.prototype.constructor = HoneyPot.OpenBetReelConnection;

HoneyPot.OpenBetReelConnection.prototype.parseInitXML = function(data){
	HoneyPot.OpenBetConnection.prototype.parseInitXML.call(this, data);

	var initResponseXML = $(data);
	if (initResponseXML.find('Error').length){
		 //HoneyPot.logger.log("ERROR : = " +initResponseXML.find('Error'));
		  //this.processErrorMessageCallBack(initResponseXML.find('Error'));
	}else{
		this.gameState.slotDef = new HoneyPot.SlotDef();
		var slotDefData = initResponseXML.find('SlotDef');
		this.parseSlotDef(slotDefData);   
		this.parseWinlines(slotDefData.find('SlotWinLine'));
		this.parseReelSets(slotDefData.find('SlotReelSet'));
		this.parseSlotBonus(slotDefData.find('SlotBonus'));
		this.parseSymbolDef(slotDefData.find('SlotSymbolDef'));
		var slotPayoutData = initResponseXML.find('SlotPayout');
		this.parseSlotPayout(slotPayoutData.find('SlotLinePayout'), 'line');
		this.parseSlotPayout(slotPayoutData.find('SlotScatterPayout'), 'scatter');

		this.parseAccumulatorState(initResponseXML.find('AccumulatorState'));

		if(this.gameState.gip){
			this.parseSlotState(initResponseXML.find('SlotState'));
		}
	}
}

HoneyPot.OpenBetReelConnection.prototype.parseSlotPayout = function(data, type){
	if(data.length > 0){
		for(var i=0;i<data.length;i++){
			var slotPayout = new HoneyPot.SlotPayout();
			slotPayout.type = type;
			slotPayout.reelSetIndex = data[i].getAttribute('reel_set_index') ? data[i].getAttribute('reel_set_index') : "";
			slotPayout.index = data[i].getAttribute('index') ? data[i].getAttribute('index') : "";
			slotPayout.payoutFactor = data[i].getAttribute('payout_factor') ? data[i].getAttribute('payout_factor') : "";
			slotPayout.chainTrigger = data[i].getAttribute('chain_trigger') ? data[i].getAttribute('chain_trigger') : "";

			var linePattern = $(data[i]).find('SlotLinePattern');
			if(linePattern.length > 0){
				for(var j=0;j<linePattern.length;j++){
					slotPayout.linePattern.push({symbol:linePattern[j].getAttribute('symbol'), reelIndex:linePattern[j].getAttribute('reel_indexes')});
				}
			}
			slotPayout.bitmaskLine = data[i].getAttribute('bitmask_line') ? this.formatBitMask(data[i].getAttribute('bitmask_line'),slotPayout.linePattern[0].reelIndex) : "";
			
			this.gameState.slotPayouts.push(slotPayout);
		}
	}
}
HoneyPot.OpenBetReelConnection.prototype.formatBitMask = function(data,reelIndex){
	var mask = data.split("|");
	var newMask = [];
	var index = reelIndex.split(",");

	for(var i=0;i<mask.length;i++){
		newMask.push("0");
	}
	for(var i=0;i<reelIndex.length;i++){
		newMask[reelIndex[i]] = "x";
	}
	return newMask;
}

HoneyPot.OpenBetReelConnection.prototype.parseSymbolDef = function(data){
	if(data.length > 0){
		for(var i=0;i<data.length;i++){
			var symbolDef = new HoneyPot.SymbolDef();
			symbolDef.name = data[i].getAttribute('name') ? data[i].getAttribute('name') : "";
			symbolDef.symbolIndex = data[i].getAttribute('symbol_index') ? data[i].getAttribute('symbol_index') : "";
			symbolDef.isWild = data[i].getAttribute('is_wild') ? data[i].getAttribute('is_wild') : "";

			var wildSym = $(data[i]).find('WildSymbol');
			if(wildSym.length > 0){
				symbolDef.wildNumFactor = wildSym.attr('num_factor');
				symbolDef.wildNumLifetime = wildSym.attr('num_lifetime');
				symbolDef.wildType = wildSym.attr('type') ;
				var factor = $(wildSym).find('Factor');
				if(factor.length > 0){
					symbolDef.wildFactor = factor.attr('factor');
					symbolDef.wildWeight = factor.attr('weight');
				}
			}
			this.gameState.slotDef.symbolDefs.push(symbolDef);
		}
	}
}
HoneyPot.OpenBetReelConnection.prototype.parseSlotBonus = function(data){
	if(data.length > 0){
		for(var i=0;i<data.length;i++){
			var slotBonus = new HoneyPot.SlotBonus();
			slotBonus.bonusId = data[i].getAttribute('bonus_id') ? data[i].getAttribute('bonus_id') : "";
			slotBonus.name = data[i].getAttribute('name') ? data[i].getAttribute('name') : "";
			slotBonus.bonusType = data[i].getAttribute('bonus_type') ? data[i].getAttribute('bonus_type') : "";
			slotBonus.numSpins = data[i].getAttribute('num_spins') ? data[i].getAttribute('num_spins') : "";
			slotBonus.choosable = data[i].getAttribute('choosable') ? data[i].getAttribute('choosable') : "";
			slotBonus.reelSetIndex = data[i].getAttribute('reel_set_index')? data[i].getAttribute('reel_set_index'):"";

			slotBonus.multiplierFunction = data[i].getAttribute('multiplier_function') ? data[i].getAttribute('multiplier_function') : "";
			slotBonus.reelDef = data[i].getAttribute('reel_def') ? data[i].getAttribute('reel_def') : "";
			slotBonus.numSpins = data[i].getAttribute('num_spins') ? data[i].getAttribute('num_spins') : "";
			this.gameState.slotDef.slotBonus.push(slotBonus);
		}
	}
}
HoneyPot.OpenBetReelConnection.prototype.parseReelSets = function(data){
	if(data.length > 0){
		for(var i=0;i<data.length;i++){
			var reelSet = new HoneyPot.ReelSet();
			reelSet.type = data[i].getAttribute('type');
			reelSet.index = data[i].getAttribute('index');
			reelSet.numReels = data[i].getAttribute('num_reels');
			reelSet.choosable = data[i].getAttribute('indchoosableex');
			reelSet.name = data[i].getAttribute('name');
			var reelsData = $(data[i]).find('SlotReel');
			if(reelsData.length > 0){
				var reels = [];
				for(j=0;j<reelsData.length;j++){
					reels[reelsData[j].getAttribute('index')] = reelsData[j].getAttribute('reel_def').split('|');
				}
				reelSet.reels = reels;
			}
			this.gameState.slotDef.reelSets.push(reelSet);
			
		}
	}
}

HoneyPot.OpenBetReelConnection.prototype.parseWinlines = function(data){
	if(data.length > 0){
		for(var i=0;i<data.length;i++){
			var winline = new HoneyPot.WinLine();
			winline.index = data[i].getAttribute('index'),
			winline.line = data[i].getAttribute('line');
			winline.winlinePattern = winline.line.split('|');
			
			this.gameState.slotDef.winLines.push(winline);
		}
	}
}
HoneyPot.OpenBetReelConnection.prototype.parseSlotDef = function(data){
	
	this.gameState.slotDef.numReels = data.attr('num_reels');
	this.gameState.slotDef.viewSize = data.attr('view_size');
	this.gameState.slotDef.numWinLines = Number(data.attr('num_win_lines'));
	this.gameState.slotDef.delim = data.attr('delim');
	this.gameState.slotDef.symbols = data.attr('symbols').split(data.attr('delim'));
	this.gameState.slotDef.wildCards = data.attr('wild_cards');
	this.gameState.slotDef.wildFactor = data.attr('wild_factor');
	this.gameState.slotDef.useStakeOnly = data.attr('use_stake_only');
	this.gameState.slotDef.baseToTotalStakeMult = data.attr('base_to_total_stake_mult');

	var str = '';
	for(var i=0;i<this.gameState.slotDef.numWinLines;i++){
		if(i == this.gameState.slotDef.numWinLines-1){
			str += i;
		}else{
			str += i+'|';
		}

		
	}

	this.gameState.slotDef.winlineString = str;

}

HoneyPot.OpenBetReelConnection.prototype.parsePlayXML = function(data){
	HoneyPot.OpenBetConnection.prototype.parsePlayXML.call(this, data);

	var playResponseXML = $(data);
	if (playResponseXML.find('Error').length){
        //HoneyPot.logger.log("ERROR : = " +playResponseXML.find('Error'));
        //this.processErrorMessageCallBack(playResponseXML.find('Error'));
    } else{
		this.parseSlotState(playResponseXML.find('SlotState'));
		this.parseAccumulatorState(playResponseXML.find('AccumulatorState'));
	}

}
HoneyPot.OpenBetReelConnection.prototype.parseAccumulatorState = function(data){
	if(data.length > 0){
		var accumulatorState = new HoneyPot.AccumulatorState();
		accumulatorState.totalContribution = data.attr('total_contribution');
		var accTransferData = data.find('AccumulatorTransfer'); 
		var accTransfers = [];
		if(accTransferData.length > 0){
			for(var i=0;i<accTransferData.length;i++){
				var acc = new HoneyPot.AccumulatorTransfer();
				acc.type = accTransferData[i].getAttribute('type');
				acc.operation = accTransferData[i].getAttribute('operation');
				acc.acclatorInoutId = accTransferData[i].getAttribute('acclator_inout_id');
				acc.transferAmount = accTransferData[i].getAttribute('transfer_amount');
				acc.state = accTransferData[i].getAttribute('state');
				acc.status = accTransferData[i].getAttribute('status');
				acc.newBalance = accTransferData[i].getAttribute('new_balance');
				accTransfers.push(acc);
			}
		}
		accumulatorState.accumulatorTransfer = accTransfers;

		var accumulatorData = data.find('Accumulator'); 
		var accumulators = [];
		if(accumulatorData.length > 0){
			for(var i=0;i<accumulatorData.length;i++){
				var acc = new HoneyPot.Accumulator();
				acc.type = accumulatorData[i].getAttribute('type');
				acc.status = accumulatorData[i].getAttribute('status');
				acc.balance = accumulatorData[i].getAttribute('balance');
				acc.maxBalance = accumulatorData[i].getAttribute('max_balance');
				acc.stakes = accumulatorData[i].getAttribute('stakes');
				acc.crDate = accumulatorData[i].getAttribute('cr_date');
				acc.seedFactor = accumulatorData[i].getAttribute('seed_factor');
				acc.playedFor = accumulatorData[i].getAttribute('played_for');
				acc.wasWon = accumulatorData[i].getAttribute('was_won');
				acc.data = accumulatorData[i].getAttribute('data');
				acc.avgStake = accumulatorData[i].getAttribute('avg_stake');
				acc.totalStakes = accumulatorData[i].getAttribute('total_stakes');
				acc.numPlays = accumulatorData[i].getAttribute('num_plays');
				acc.stateName = accumulatorData[i].getAttribute('state_name');
				accumulators.push(acc);
			}
		}
		accumulatorState.accumulators = accumulators;
		this.gameState.accumulatorState = accumulatorState;
	}

}
HoneyPot.OpenBetReelConnection.prototype.parseSlotState = function(data){

	var slotStateStr = new XMLSerializer().serializeToString(data[0]);
	this.prevSlotState = slotStateStr;

	var slotState = new HoneyPot.SlotState();
	slotState.selWinLines = data.attr('sel_win_lines');
	slotState.reversePayout = data.attr('reverse_payout');
	slotState.delim = data.attr('delim');
	slotState.stop = data.attr('stop').split(slotState.delim);
	slotState.reelSetIndex = data.attr('reel_set_index');
	slotState.action = data.attr('action');
	slotState.gameStatus = data.attr('game_status');
	slotState.currentPlay = data.attr('current_play');
	slotState.currentWinnings = HoneyPot.Currency.convertDecimalToPence(data.attr('current_winnings'));
	slotState.bonusWinnings = HoneyPot.Currency.convertDecimalToPence(data.attr('bonus_winnings'));
	slotState.totalWinnings = HoneyPot.Currency.convertDecimalToPence(data.attr('total_winnings'));
	slotState.numFreeSpins = Number(data.attr('num_free_spins'));
	slotState.stake = HoneyPot.Currency.convertDecimalToPence(data.attr('stake'));
	slotState.stakePerLine = HoneyPot.Currency.convertDecimalToPence(data.attr('stake_per_line'));
	slotState.fsTrigStop = data.attr('fs_trig_stop');
	slotState.fsTrigReelSetIndex = data.attr('fs_trig_reel_set_index');
	slotState.freeSpinMultiplier = data.attr('free_spin_multiplier');
	slotState.persistentBonusId = data.attr('persistent_bonus_id');
	slotState.freeSpinState = data.attr('free_spin_state');

	var symbolRowData = data.find('SlotSymbolRow');
	var symbolRows = [];
	if(symbolRowData.length > 0){
		
		for(var i=0;i<symbolRowData.length;i++){
			var symRow = new HoneyPot.SlotSymbolRow();
			symRow.rowIndex = symbolRowData[i].getAttribute('row_index');
			symRow.symbolIndexes = symbolRowData[i].getAttribute('symbol_indexes');
			var wildSymData = $(symbolRowData[i]).find('WildSymbolState');
			var wildSymbols = [];
			if(wildSymData.length > 0){
				for(var j=0;j<wildSymData.length;j++){
					wildSymbols.push({
						symbolIndex:wildSymData[j].getAttribute('symbol_index'),
						column:wildSymData[j].getAttribute('column'),
						factor:wildSymData[j].getAttribute('factor')
					});
				}
				symRow.wildSymbols = wildSymbols;
			}
	
			symbolRows.push(symRow);
		}
		
	}
	slotState.slotSymbolRows = symbolRows
	var slotLineWinData = data.find('SlotLineWin');
	var slotLines = [];
	if(slotLineWinData.length > 0){
		
		for(var i=0;i<slotLineWinData.length;i++){
			var slotLineWin = new HoneyPot.SlotLineWin();
			slotLineWin.index = slotLineWinData[i].getAttribute('index');
			slotLineWin.payoutFactor = HoneyPot.Currency.convertDecimalToPence(slotLineWinData[i].getAttribute('payout_factor'));
			slotLineWin.winnings = HoneyPot.Currency.convertDecimalToPence(slotLineWinData[i].getAttribute('winnings'));
			slotLineWin.wildFactor = slotLineWinData[i].getAttribute('wild_factor');
			slotLineWin.preMultiplierWinnings = HoneyPot.Currency.convertDecimalToPence(slotLineWinData[i].getAttribute('pre_multiplier_winnings'));
			slotLineWin.winLine = slotLineWinData[i].getAttribute('win_line');
			slotLineWin.stake = HoneyPot.Currency.convertDecimalToPence(slotLineWinData[i].getAttribute('stake'));

			slotLines.push(slotLineWin);
		}
		
	}
	slotState.slotLineWins = slotLines;

	var slotScatterWinData = data.find('SlotScatterWin');
	var slotScatters = [];
	if(slotScatterWinData.length > 0){
		
		for(var i=0;i<slotScatterWinData.length;i++){
			var slotScatterWin = new HoneyPot.SlotScatterWin();
			slotScatterWin.index = slotScatterWinData[i].getAttribute('index');
			slotScatterWin.payoutFactor = slotScatterWinData[i].getAttribute('payout_factor');
			slotScatterWin.winnings = HoneyPot.Currency.convertDecimalToPence(slotScatterWinData[i].getAttribute('winnings'));
			slotScatterWin.matchPositions = slotScatterWinData[i].getAttribute('match_positions');

			var slotBonusWinData = $(slotScatterWinData[i]).find('SlotBonusWin');
			var slotBonusWins = [];
			
			if(slotBonusWinData.length > 0){
				for(var j=0;j<slotBonusWinData.length;j++){
					var bonusWin = new HoneyPot.SlotBonusWin();
					bonusWin.bonusId = slotBonusWinData[j].getAttribute('bonus_id');
					bonusWin.name = slotBonusWinData[j].getAttribute('name');
					bonusWin.bonusType = slotBonusWinData[j].getAttribute('bonus_type');
					bonusWin.winnings = HoneyPot.Currency.convertDecimalToPence(slotBonusWinData[j].getAttribute('winnings'));
					bonusWin.intermediateMultipliers = slotBonusWinData[j].getAttribute('intermediate_multipliers');
					bonusWin.totalMultiplier = slotBonusWinData[j].getAttribute('total_multiplier'); 
					bonusWin.numFreeSpins = slotBonusWinData[j].getAttribute('num_free_spins') ? Number(slotBonusWinData[j].getAttribute('num_free_spins')) : 0;
					bonusWin.bonusElement = [];

					var bonusElementData = $(slotBonusWinData[j]).find('BonusElement');
					if(bonusElementData.length > 0){
						for(var b=0;b<bonusElementData.length;b++){
							bonusWin.bonusElement.push({
								factor:bonusElementData[b].getAttribute('factor'),
								gameData:bonusElementData[b].getAttribute('gameData'),
								repeat:bonusElementData[b].getAttribute('repeat')
							});
						}
					}
					slotBonusWins.push(bonusWin);
				}
			}
			slotScatterWin.slotBonusWin = slotBonusWins;
			slotScatters.push(slotScatterWin);
		}
		
	}
	slotState.slotScatterWins = slotScatters;

	var slotOverlayData = data.find('SlotOverlay');
	var slotOverlays = [];
	if(slotOverlayData.length > 0){
		var wildSymbolState = slotOverlayData.find('WildSymbolState');

		if(wildSymbolState.length > 0){
			for(var j=0;j<wildSymbolState.length;j++){
				var slotOverlay = new HoneyPot.SlotOverlay();
				slotOverlay.type = 'WildSymbolState';
				slotOverlay.symbolIndex = wildSymbolState[j].getAttribute('symbol_index');
				slotOverlay.row = wildSymbolState[j].getAttribute('row');
				slotOverlay.column = wildSymbolState[j].getAttribute('column');
				slotOverlay.description = wildSymbolState[j].getAttribute('description') ? wildSymbolState[j].getAttribute('description') : '';
				slotOverlay.lifetimeRemaining = wildSymbolState[j].getAttribute('lifetime') ? wildSymbolState[j].getAttribute('lifetime') : -1;
				slotOverlay.lifetime = wildSymbolState[j].getAttribute('lifetime_remaining') ? wildSymbolState[j].getAttribute('lifetime_remaining') : -1;
				slotOverlays.push(slotOverlay); 
			}
		}
		var wildSymbolState = slotOverlayData.find('CosmeticSymbolOverlay');
		if(wildSymbolState.length > 0){
			for(var j=0;j<wildSymbolState.length;j++){
				var slotOverlay = new HoneyPot.SlotOverlay();
				slotOverlay.type = 'CosmeticSymbolOverlay';
				slotOverlay.symbolIndex = wildSymbolState[j].getAttribute('symbol_index');
				slotOverlay.row = wildSymbolState[j].getAttribute('row');
				slotOverlay.column = wildSymbolState[j].getAttribute('column');
				slotOverlay.description = wildSymbolState[j].getAttribute('description') ? wildSymbolState[j].getAttribute('description') : '';
				slotOverlay.lifetimeRemaining = wildSymbolState[j].getAttribute('lifetime') ? wildSymbolState[j].getAttribute('lifetime') : -1;
				slotOverlay.lifetime = wildSymbolState[j].getAttribute('lifetime_remaining') ? wildSymbolState[j].getAttribute('lifetime_remaining') : -1;
				slotOverlays.push(slotOverlay); 
			}
		}
	}
	slotState.slotOverlays = slotOverlays;

	this.gameState.slotState = slotState;
}
