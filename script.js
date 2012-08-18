/* AppCacheUI: https://github.com/timdream/appcacheui */
(function(){var e={init:function(){var a=document,b=a.body,c=window.applicationCache;if(c)if(b){this.info=a.getElementById("appcache_info");if(!this.info){a.cE=a.createElement;var d=a.cE("a"),a=a.cE("div");a.id="appcache_info";d.href="";a.appendChild(d);b.firstChild&&b.insertBefore(a,b.firstChild);this.info=a}"checking,downloading,progress,noupdate,cached,updateready,obsolete,error".split(",").forEach(function(a){c.addEventListener(a,e)})}else console.log("Premature init. Put the <script> in <body>.")},
handleEvent:function(a){this.info.className=this.info.className.replace(/ ?appcache\-.+\b/g,"")+" appcache-"+a.type;"progress"===a.type&&a.total&&this.info.setAttribute("data-progress",a.loaded+1+"/"+a.total)}};e.init()})();

//create all the variables
var score;
var cardsmatched;
var clicks;

var ui = $("#game");
var uiIntro = $("#gameIntro");
var uiStats = $("#gameStats");
var uiComplete = $("#gameComplete");
var uiCards= $("#cards");
var uiReset = $("#reset");
var uiScore = $("#gameScore");
var uiTime = $("#time");
var uiClick = $("#click");
var uiPlay = $("#gamePlay");
var uiAgain = $("#gameAgain");
var uiTimer = $("#timer");
var uiSplash = $("#splash");
var uiFullscreen = $("#fullscreen");
var decent = styleSupport('transition');

//create deck array
var matchingGame = {};
matchingGame.deck = [
'ie', 'ie-icon',
'fx', 'fx-icon',
'cr', 'cr-icon',
'sf', 'sf-icon',
'op', 'op-icon',
'ns', 'ns-icon',
'ms', 'ms-icon',
'tb', 'tb-icon',
'fm', 'fm-icon'
,];

matchingGame.clone = $.extend(true, [], matchingGame.deck);

//on document load the lazy way
$(function(){
	var loader = new PxLoader();
	loader.addImage('images/start.png');
	loader.addImage('images/end.png');
	loader.addImage('images/card.png');
	loader.addImage('images/left.png');
	loader.addImage('images/right.png');
	loader.addImage('images/logo.jpg');
	loader.addImage('images/ie.png');
	loader.addImage('images/icon_ie.png');
	loader.addImage('images/fx.png');
	loader.addImage('images/icon_fx.png');
	loader.addImage('images/cr.png');
	loader.addImage('images/icon_cr.png');
	loader.addImage('images/sf.png');
	loader.addImage('images/icon_sf.png');
	loader.addImage('images/op.png');
	loader.addImage('images/icon_op.png');
	loader.addImage('images/ns.png');
	loader.addImage('images/icon_ns.png');
	loader.addImage('images/ms.png');
	loader.addImage('images/icon_ms.png');
	loader.addImage('images/tb.png');
	loader.addImage('images/icon_tb.png');
	loader.addImage('images/fm.png');
	loader.addImage('images/icon_fm.png');
	loader.addProgressListener(function(e) {
		if (e.completedCount * 5 < 100) {
			uiPlay.text(e.completedCount * 4 + '%');
		}
	});
	loader.addCompletionListener(function() {
		uiPlay.text('Play');
		ui.addClass('open');
	});
	loader.start();
	init();
});

//initialise game
function init() {
	if (!decent) { //workaround for IE9
		uiSplash.addClass('disable');
	}
	playGame = false;
	uiPlay.click(function(e) {
		e.preventDefault();
		ui.removeClass("open");
		startGame();
	});
	uiAgain.click(function(e) {
		e.preventDefault();
		reStartGame();
	});
	uiReset.click(function(e) {
		e.preventDefault();
		reStartGame();
		$('.card').addClass('reset');
		$('.reset').bind("webkitTransitionEnd transitionend oTransitionEnd", function(){
			$('.reset').removeClass('reset');
		});
	});
	if (typeof document.cancelFullScreen != 'undefined' ||
		typeof document.mozCancelFullScreen != 'undefined' ||
		typeof document.webkitCancelFullScreen != 'undefined') {
		uiFullscreen.click(toggleFullscreen);
		uiFullscreen.addClass('support');
	}

	document.addEventListener('keydown', closebox, false);

	//Handle the melody
	if(mediaSupport('audio/ogg; codecs=vorbis', 'audio') ||
		mediaSupport('audio/mpeg', 'audio')) {
		var melody = $('#melody')[0];
		melody.volume = 0.15;
		melody.muted = false;
		$('#mute').click(function() {
		  if(melody.muted) {
			melody.muted = false;
			$(this).addClass('melody');
		  } else {
			melody.muted = true;
			$(this).removeClass('melody');
		  }
		});
		$('#melody').on(
			'ended',
			function() {
				melody.currentTime = 0;
				melody.pause();
				melody.play();
			}
		);
		$('#mute').addClass('music').addClass('melody');
		melody.play();
	}
}

//start game and create cards from deck array
function startGame() {
	ui.addClass('play');
	uiTime.text("0");
	uiClick.text("0");
	score = 0;
	cardsmatched = 0;
	clicks = 0;
	if (playGame == false) {
		playGame = true;
		$.shuffle(matchingGame.deck.sort(function(){return 0.5 - Math.random();}));
		for(var i=0;i<17;i++){
			$(".card:first-child").clone().appendTo("#cards");
		}
		// initialize each card's position
		uiCards.children().each(function(index) {
			// align the cards to be 3x6 ourselves.
			$(this).css({
				"left" : ($(this).width() + 20) * (index % 6),
				"top" : ($(this).height() + 20) * Math.floor(index / 6)
			});
			// get a pattern from the shuffled deck
			var pattern = matchingGame.deck.pop();
			// visually apply the pattern on the card's back side.
			$(this).find(".back").addClass(pattern);
			// embed the pattern data into the DOM element.
			$(this).attr("data-pattern",pattern.substr(0,2));
			// listen the click event on each card DIV element.
			$(this).click(selectCard);
		});
		playSound('intro');
		timer();
	}
}


//timer for game
function timer() {
	if (playGame) {
		scoreTimeout = setTimeout(function() {
			uiTimer.text(++score);
			timer();
		}, 1000);
	}
}

//onclick function add flip class and then check to see if cards are the same
function selectCard() {
	// we do nothing if there are already two cards flipped.
	if ($(".card-flipped").size() > 1) {
		return;
	}
	if(!$(this).hasClass("card-flipped")) {
		playSound('select');
		uiClick.text(++clicks);
		$(this).addClass("card-flipped");
	}
	// check the pattern of both flipped card 0.7s later.
	if ($(".card-flipped").size() == 2) {
		setTimeout(checkPattern,700);
	}
}

//if pattern is same remove cards otherwise flip back
function checkPattern() {
	var pattern = isMatchPattern();
	if (pattern) {
		uiSplash.addClass('match');
		$('.matched').removeClass('current');
		$('#' + pattern).addClass('matched current');
		$('.match').bind("webkitTransitionEnd transitionend oTransitionEnd", function(){
			uiSplash.removeClass('match');
		});
		$(".card-flipped").removeClass("card-flipped").addClass("card-removed");
		$(".card-removed").bind("webkitTransitionEnd transitionend oTransitionEnd", removeTookCards);
		if(!decent) { //workaround for IE9
			removeTookCards();
		}
	} else {
		$(".card-flipped").removeClass("card-flipped");
	}
}

//put 2 flipped cards in an array then check the image to see if it's the same.
function isMatchPattern() {
	var cards = $(".card-flipped");
	var pattern = $(cards[0]).data("pattern");
	var anotherPattern = $(cards[1]).data("pattern");
	if (pattern == anotherPattern) {
		return pattern;
	} else {
		return false;
	}
}

//check to see if all cardmatched variable is less than 8 if so remove card only otherwise remove card and end game
function removeTookCards() {
	playSound('match');
	if (cardsmatched < 8){
		cardsmatched++;
		$(".card-removed").remove();
	} else {
		$(".card-removed").remove();
		EndGame();
	}
}

function EndGame() {
	clearTimeout(scoreTimeout);
	playSound('applause');
	$('#score').text('You score: ' + clicks + ' clicks and ' + score + ' seconds.');
	ui.addClass('end').removeClass('play');
	$('.twitter-share-button').remove();
	$('.facebook-share-button').off('click');
	$('.facebook-share-button').on('click', function(event) {
    FB.ui( {
      method: 'feed',
      name: 'MozTW Browser Pairs',
      link: document.location.href,
      caption: 'MozTW Browser Pairs',
      description: '我剛用 #Firefox #Android 玩 MozTW 的瀏覽器翻牌遊戲，翻了 ' + clicks + ' 次 ' + score + '秒過關，快來挑戰我吧！'
    });
    event.stopPropagation();
    event.preventDefault();
  });
  $('.plurk-share-button').attr('href', 'http://www.plurk.com/m/?content=' + encodeURIComponent(document.location.href + ' (我剛用 #Firefox #Android 玩 MozTW 的瀏覽器翻牌遊戲，翻了 ' + clicks + ' 次 ' + score + '秒過關，快來挑戰我吧！)') + '&qualifier=shares');
  if ('twttr' in window) {
    $(document.createElement('a')).attr('href', 'https://twitter.com/share')
                                  .attr('data-text', '我剛用 #Firefox #Android 玩 MozTW 的瀏覽器翻牌遊戲，翻了 ' + clicks + ' 次 ' + score + '秒過關，快來挑戰我吧！')
                                  .attr('data-lang', 'zh-TW')
                                  .attr('data-hashtags', 'COSCUP')
                                  .addClass('twitter-share-button')
                                  .text('Tweet')
                                  .appendTo('#share');
    twttr.widgets.load();
  }
}

//recreate the original card , stop the timer and re populate the array with class names
function reStartGame(){
	ui.removeClass('end');
	$('.matched').removeClass('current');
	uiSplash.removeClass('matchend');
	uiSplash.find('span').removeClass('matched');
	playGame = false;
	uiCards.html("<div class='card'><div class='face front'></div><div class='face back'></div></div>");
	clearTimeout(scoreTimeout);
	matchingGame.deck = $.extend(true, [], matchingGame.clone);
	startGame();
}

function closebox(ev) {
	if(ev.which == 27 && window.location.hash.length > 1)
		window.location.hash = '';
}

function playSound(filename) {
	var index = ['intro','select','match','applause'].indexOf(filename);
	var sound = document.querySelectorAll('audio.sound')[index];
	sound.play();
}

function toggleFullscreen() {
if ((document.fullScreenElement && document.fullScreenElement !== null) ||
	(!document.mozFullScreen && !document.webkitIsFullScreen)) {
		enterFullscreen(document.documentElement);
	} else {
		cancelFullscreen();
	}
}

function enterFullscreen(docElm) {
	if (docElm.requestFullscreen) {
	    docElm.requestFullscreen();
	}
	else if (docElm.mozRequestFullScreen) {
	    docElm.mozRequestFullScreen();
	}
	else if (docElm.webkitRequestFullScreen) {
	    docElm.webkitRequestFullScreen();
	}
}

function cancelFullscreen() {
	if (document.exitFullscreen) {
	    document.exitFullscreen();
	}
	else if (document.mozCancelFullScreen) {
	    document.mozCancelFullScreen();
	}
	else if (document.webkitCancelFullScreen) {
	    document.webkitCancelFullScreen();
	}
}

function styleSupport(p) {
    var b = document.body || document.documentElement;
    var s = b.style;
    if(typeof s[p] == 'string') {return true; }

    // Tests for vendor specific prop
    v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
    p = p.charAt(0).toUpperCase() + p.substr(1);
    for(var i=0; i<v.length; i++) {
      if(typeof s[v[i] + p] == 'string') { return true; }
    }
    return false;
}

function mediaSupport(mimetype, container) {
	var elem = document.createElement(container);
	if(typeof elem.canPlayType == 'function'){
		var playable = elem.canPlayType(mimetype);
		if((playable.toLowerCase() == 'maybe')||(playable.toLowerCase() == 'probably')){
			return true;
		}
	}
	return false;
}

/*
 * jQuery shuffle
 *
 * Copyright (c) 2008 Ca-Phun Ung <caphun at yelotofu dot com>
 * Licensed under the MIT (MIT-LICENSE.txt) license.
 *
 * http://github.com/caphun/jquery.shuffle
 *
 * Shuffles an array or the children of a element container.
 * This uses the Fisher-Yates shuffle algorithm <http://jsfromhell.com/array/shuffle [v1.0]>
 */

(function($){

	$.fn.shuffle = function() {
		return this.each(function(){
			var items = $(this).children().clone(true);
			return (items.length) ? $(this).html($.shuffle(items)) : this;
		});
	}

	$.shuffle = function(arr) {
		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
		return arr;
	}

})(jQuery);
