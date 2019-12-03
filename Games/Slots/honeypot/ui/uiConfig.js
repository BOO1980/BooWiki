var uiConfig = {
	locale:{
		ROTATE_DEVICE:'Please Rotate Your Device',
		BALANCE:'BALANCE',
		BET:'BET',
		WIN:'WIN',
		SOUND:'SOUND',
		VIBRATE:'VIBRATE',
		OFF:'OFF',
		ON:'ON',
		UI:'UI',
		ERROR:"Error", 
		ERROR_PROTOCOL:"Unknown protocol message",
		ERROR_PROTOCOL_SEQUENCE:"Incorrect Sequence of messages",
		ERROR_UNKNOWN_PARAMETER:"Unknown parameter in protocol",
		ERROR_MISSING_PARAMETER:"Missing parameter in protocol",
		ERROR_PARAMETER_VALUE:"Parameter Values is wrong",
		ERROR_BET_LIMITS:"Bet amount out of limits",
		ERROR_LINES:"Incorrect number of lines",
		ERROR_FEATURE_PARAMETERS:"Feature Parameters incorrect",
		ERROR_JACKPOT:"Unknown Jackpot error",
		ERROR_UNKNOWN:"Unknown error",
		ERROR_NULL:"Server communications lost",
		ERROR_INSUFFICIENTFUNDS:"Not enough balance for the Bet",
		ERROR_STATESAVE:"Error trying to save the state",
		ERROR_STARTGAME:"Error trying to start the game",
		ERROR_ENDGAME:"Error trying to end the game",
		ERROR_GAMENOTSUPPORTED:"Game isn't supported by the system",
		ERROR_TIMEOUT:"You have been disconnected from the Server.  Please restart the game.",
		ERROR_SERVLET:"Server communications lost",
		ERROR_DEFAULT:"Server communications lost",
		ERROR_GAMING_LIMITS:"Gaming limits reached",
		ERROR_INVALID_SESSION:"Player session is not valid",
		ERROR_ACCOUNT_BLOCKED:"Player account locked",
	},
	sounds:{
		files:[
			{name:"btnClickSound", url:"honeypot/ui/sounds/bottomBarButton.m4a"},
			{name:"alarmSound", url:"honeypot/ui/sounds/wins/alarm.m4a"},
			{name:"applauseSound", url:"honeypot/ui/sounds/wins/applause.m4a"},
			{name:"bellSound", url:"honeypot/ui/sounds/wins/bell.m4a"},
			{name:"explosionSound", url:"honeypot/ui/sounds/wins/explosion.m4a"},
			{name:"bigWinSound", url:"honeypot/ui/sounds/wins/bigWinMusic.m4a"},
			{name:"bigWinEndSound", url:"honeypot/ui/sounds/wins/bigWinEnd.m4a"},
			{name:"superBigWinSound", url:"honeypot/ui/sounds/wins/superWinMusic.m4a"},
			{name:"megaBigWinSound", url:"honeypot/ui/sounds/wins/megaWinMusic.m4a"},
			{name:"tallyUpEndSound", url:"honeypot/ui/sounds/wins/tallyUpEnd.m4a"},
			{name:"tallyUpLoopSound", url:"honeypot/ui/sounds/wins/tallyUpLoop.m4a"},
		],
		singleChannelFiles:[
			{name:"btnClickSound", url:"honeypot/ui/sounds/bottomBarButton.m4a"},
			{name:"bigWinSound", url:"honeypot/ui/sounds/wins/bigWinMusic.m4a"},
			{name:"bigWinEndSound", url:"honeypot/ui/sounds/wins/bigWinEnd.m4a"},
			{name:"superBigWinSound", url:"honeypot/ui/sounds/wins/superWinMusic.m4a"},
			{name:"megaBigWinSound", url:"honeypot/ui/sounds/wins/megaWinMusic.m4a"},
		]
	},
	images:{
		files :[
			{name:"spinBtn", url:"honeypot/ui/images/spin.png"},
			{name:"autoPlayBtn", url:"honeypot/ui/images/Auto.png"},
			{name:"helpBtn", url:"honeypot/ui/images/info.png"},
			{name:"settingsBtn", url:"honeypot/ui/images/settings.png"},
			{name:"stakeBtn", url:"honeypot/ui/images/stake.png"},
			{name:"stakeValue", url:"honeypot/ui/images/stakeValue.png"},
			{name:"applyBtn", url:"honeypot/ui/images/apply.png"},
			{name:"closeBtn", url:"honeypot/ui/images/close.png"},
			{name:"autoTextBox", url:"honeypot/ui/images/autoTextBox.png"},
			{name:"autoValue", url:"honeypot/ui/images/AutoValue.png"},
			{name:"helpPagePanel", url:"honeypot/ui/images/helpPagePanel.png"},
			{name:"helpPageScroll1", url:"honeypot/ui/images/helpPageScroll1.png"},
			{name:"helpPageScroll2", url:"honeypot/ui/images/helpPageScroll2.png"},
			{name:"pageDownBtn", url:"honeypot/ui/images/pageDown.png"},
			{name:"autoCount", url:"honeypot/ui/images/spinCount.png"},
			{name:"autoStopBtn", url:"honeypot/ui/images/autoStop.png"},
			{name:"settingOption", url:"honeypot/ui/images/settingsbutton.png"},
			{name:"settingsTextBox", url:"honeypot/ui/images/settingsTextBox.png"},
			{name:"startGameBtn", url:"honeypot/ui/images/startGame.png"},
			{name:"warningPanel", url:"honeypot/ui/images/warningPanel.png"},
			{name:"rotateDevice", url:"honeypot/ui/images/rotateDevice.png"},
			{name:"bigwin", url:"honeypot/ui/images/bigwin.png"},
			{name:"superbw", url:"honeypot/ui/images/super.png"},
			{name:"megabw", url:"honeypot/ui/images/mega.png"},
			{name:"circleLights", url:"honeypot/ui/images/circleLights.png"},
			{name:"glowbw", url:"honeypot/ui/images/glow.png"},
			{name:"starBurst", url:"honeypot/ui/images/starBurst.png"},
			{name:"alphabetSprite", url:"honeypot/ui/images/alphabetSprite.png"},
			{name:"numberSprite", url:"honeypot/ui/images/numberSprite.png"},
			{name:"particle", url:"honeypot/ui/images/particle.png"},
		],
		textureMaps:[
			 {
				imageName:"numberSprite",
				imagePositions:[
					{
						id:"number9",
						x:0,
						y:0,
						width:67,
						height:97
					},
					{
						id:"number8",
						x:67,
						y:0,
						width:67,
						height:97
					},
					{
						id:"number7",
						x:137,
						y:0,
						width:67,
						height:97
					},
					{
						id:"number6",
						x:201,
						y:0,
						width:67,
						height:97
					},
					{
						id:"number5",
						x:0,
						y:97,
						width:67,
						height:97
					},
					{
						id:"number4",
						x:67,
						y:97,
						width:67,
						height:97
					},
					{
						id:"number3",
						x:137,
						y:97,
						width:65,
						height:97
					},
					{
						id:"number2",
						x:201,
						y:97,
						width:67,
						height:97
					},
					{
						id:"number1",
						x:16,
						y:194,
						width:35,
						height:97
					},
					{
						id:"number0",
						x:67,
						y:194,
						width:67,
						height:97
					},
					{
						id:"numberDot",
						x:158,
						y:194,
						width:20,
						height:97
					},
					{
						id:"numberComma",
						x:222,
						y:194,
						width:27,
						height:97
					},
					{
						id:"numberEuro",
						x:0,
						y:291,
						width:67,
						height:97
					},
					{
						id:"numberDollar",
						x:67,
						y:291,
						width:67,
						height:97
					},
					{
						id:"numberPound",
						x:137,
						y:291,
						width:67,
						height:97
					}
				]
			},
			{
				imageName:"settingOption",
				imagePositions:[
					{
						id:"settingOptionOff",
						x:0,
						y:0,
						width:180,
						height:60
					},
					{
						id:"settingOptionOn",
						x:180,
						y:0,
						width:180,
						height:60
					}
				]
			},
			{
				imageName:"startGameBtn",
				imagePositions:[
					{
						id:"startGameBtnDown",
						x:0,
						y:0,
						width:95,
						height:95
					},
					{
						id:"startGameBtnDisabled",
						x:95,
						y:0,
						width:95,
						height:95
					},
					{
						id:"startGameBtnUp",
						x:190,
						y:0,
						width:95,
						height:95
					}
				]
			},
			{
				imageName:"autoStopBtn",
				imagePositions:[
					{
						id:"autoStopBtnUp",
						x:0,
						y:0,
						width:58,
						height:58
					},
					{
						id:"autoStopBtnDisabled",
						x:58,
						y:0,
						width:58,
						height:58
					},
					{
						id:"autoStopBtnDown",
						x:116,
						y:0,
						width:58,
						height:58
					}
				]
			},
			{
				imageName:"pageDownBtn",
				imagePositions:[
					{
						id:"pageDownBtnUp",
						x:0,
						y:0,
						width:58,
						height:58
					},
					{
						id:"pageDownBtnDisabled",
						x:58,
						y:0,
						width:58,
						height:58
					}
				]
			},
			{
				imageName:"applyBtn",
				imagePositions:[
					{
						id:"applyBtnUp",
						x:0,
						y:0,
						width:58,
						height:58
					},
					{
						id:"applyBtnDisabled",
						x:58,
						y:0,
						width:58,
						height:58
					}
				]
			},
			{
				imageName:"closeBtn",
				imagePositions:[
					{
						id:"closeBtnUp",
						x:0,
						y:0,
						width:58,
						height:58
					},
					{
						id:"closeBtnDisabled",
						x:58,
						y:0,
						width:58,
						height:58
					}
				]
			},
			{
				imageName:"stakeValue",
				imagePositions:[
					{
						id:"stakeValueDisabled",
						x:0,
						y:0,
						width:180,
						height:60
					},
					{
						id:"stakeValueUp",
						x:180,
						y:0,
						width:180,
						height:60
					},
					{
						id:"stakeValueDown",
						x:360,
						y:0,
						width:180,
						height:60
					}
				]
			},
			{
				imageName:"autoValue",
				imagePositions:[
					{
						id:"autoValueUp",
						x:0,
						y:0,
						width:120,
						height:40
					},
					{
						id:"autoValueDown",
						x:120,
						y:0,
						width:120,
						height:40
					},
					{
						id:"autoValueDisabled",
						x:240,
						y:0,
						width:120,
						height:40
					}
				]
			},
			{
				imageName:"settingsBtn",
				imagePositions:[
					{
						id:"settingsBtnUp",
						x:0,
						y:0,
						width:58,
						height:58
					},
					{
						id:"settingsBtnDisabled",
						x:58,
						y:0,
						width:58,
						height:58
					},
					{
						id:"settingsBtnDown",
						x:116,
						y:0,
						width:58,
						height:58
					}
				]
			},
			{
				imageName:"stakeBtn",
				imagePositions:[
					{
						id:"stakeBtnUp",
						x:0,
						y:0,
						width:58,
						height:58
					},
					{
						id:"stakeBtnDisabled",
						x:58,
						y:0,
						width:58,
						height:58
					},
					{
						id:"stakeBtnDown",
						x:116,
						y:0,
						width:58,
						height:58
					}
				]
			},
			{
				imageName:"helpBtn",
				imagePositions:[
					{
						id:"helpBtnUp",
						x:0,
						y:0,
						width:58,
						height:58
					},
					{
						id:"helpBtnDisabled",
						x:58,
						y:0,
						width:58,
						height:58
					},
					{
						id:"helpBtnDown",
						x:116,
						y:0,
						width:58,
						height:58
					}
				]
			},
			{
				imageName:"autoPlayBtn",
				imagePositions:[
					{
						id:"autoPlayBtnUp",
						x:0,
						y:0,
						width:58,
						height:58
					},
					{
						id:"autoPlayBtnDisabled",
						x:58,
						y:0,
						width:58,
						height:58
					},
					{
						id:"autoPlayBtnDown",
						x:116,
						y:0,
						width:58,
						height:58
					}
				]
			},
			{
				imageName:"spinBtn",
				imagePositions:[
					{
						id:"spinBtnUp",
						x:0,
						y:0,
						width:131,
						height:131
					},
					{
						id:"spinBtnDisabled",
						x:131,
						y:0,
						width:131,
						height:131
					},
					{
						id:"spinBtnDown",
						x:262,
						y:0,
						width:131,
						height:131
					}
				]
			}
		]
	}
}