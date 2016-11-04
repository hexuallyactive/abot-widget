var utils = require('./utils.js');
require("./widget.css");

var elements = {};

window.AdiBotChat = {
	status: {
		current: undefined,
		last: undefined,
		sessionKey: undefined
	},

	init: function (config) {
		this.config = utils.mergeConfig({
			user: 'guest',
			server: undefined
		}, config);
		var div_root = document.createElement('div');
		div_root.id = 'abot';
		div_root.innerHTML = require('./widget.html');

		var _root = document.getElementsByTagName('body')[0];
		_root.appendChild(div_root);

		elements.divLauncher = document.getElementById('abot-launcher');
		elements.divChatbox = document.getElementById('abot-chatbox');
		elements.txMessage = document.getElementById('txMessage');

		document.querySelector('.abot-sheet-header-title').innerHTML = "AdiBotler";

		// Set a session key to uniquely identify this user across messages,
		// enabling Abot to store memories. Perhaps this should be moved to
		// localstorage?
		if(Cookies.get('adibotler.session')) {
  	  this.status.sessionKey = 	Cookies.get('adibotler.session');
		} else {
  		var guid = utils.guid();
  		Cookies.set('adibotler.session', guid);
  		this.status.sessionKey = guid;
		}

		// Add Event on elements
		this.initEventHandler();
	},
	open: function () {
  	document.getElementById('txMessage').focus();
		utils.removeClass(elements.divLauncher, 'abot-launcher-active');
		utils.addClass(elements.divLauncher, 'abot-launcher-inactive');
		elements.divChatbox.style.display = 'block';
		if (document.getElementById('abot-conversation') != undefined) {
			utils.removeClass(document.getElementById('abot-conversation'), 'abot-inactive');
			utils.addClass(document.getElementById('abot-conversation'), 'abot-active');
		}
		// XXX special message to auto-start
		this.sendMessage('init', '');
	},
	close: function () {
		utils.removeClass(elements.divLauncher, 'abot-launcher-inactive');
		utils.addClass(elements.divLauncher, 'abot-launcher-active');
		elements.divChatbox.style.display = 'none';
		if (document.getElementById('abot-conversation') != undefined) {
		 utils.removeClass(document.getElementById('abot-conversation'), 'abot-active');
		 utils.addClass(document.getElementById('abot-conversation'), 'abot-inactive');
		}
	},
	renderMessage: function (data) {
    if(data.type === 'text') {
      this.addMessage(data.text, 'abot', '', null);
    } else if(data.type === 'carousel') {
      var ts = Date.now();
      var carousel = '<div class="carousel slider js_slider js_slider_'+ts+'"><div class="frame js_frame"><ul class="slides js_slides">';
      data.items.forEach(function(item) {
        carousel += '<li class="js_slide">';
        carousel += '<img style="max-width: 250px;" src="'+ item.image_url + '"/>';
        carousel += '<div style="padding: 8px;">';
        carousel += item.title;
        carousel += '<p class="body">'+item.subtitle+'</p>';
        var buttons = [];
        item.buttons.forEach(function(button) {
          buttons.push(utils.makeButton(button, 'carousel'));
        });
        carousel += buttons.join('');
        carousel += '</div>';
        carousel += '</li>';
      });
      carousel +='</ul></div><span class="js_prev prev"><svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 501.5 501.5"><g><path fill="#2E435A" d="M302.67 90.877l55.77 55.508L254.575 250.75 358.44 355.116l-55.77 55.506L143.56 250.75z"/></g></svg></span><span class="js_next next"><svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 501.5 501.5"><g><path fill="#2E435A" d="M199.33 410.622l-55.77-55.508L247.425 250.75 143.56 146.384l55.77-55.507L358.44 250.75z"/></g></svg></span></div>';
      this.addMessage(carousel, 'abot', '', function() {
        $('.js_slider').lory({});
      });
    } else if(data.type == 'quick_reply') {
      var buttons = [];
      data.items.buttons.forEach(function(button) {
        buttons.push( utils.makeButton(button, '') );
      });
      this.addMessage(data.items.text, 'abot', '', null);
      this.addMessage(buttons.join(''), 'abot', 'buttons', null);
    } else if(data.type == 'menu') {
      var buttons = [];
      data.items.buttons.forEach(function(button) {
        buttons.push( utils.makeButton(button, 'menu_button') );
      });
      this.addMessage(data.items.text + '<br>' + buttons.join(''), 'abot', '', null);      
    } else if(data.type == 'button') {
      if(data.text.length > 0) {
        this.addMessage(data.text, 'abot', '', null);
      }
      var buttons = [];
      data.buttons.forEach(function(button) {
          buttons.push( utils.makeButton(button, '') );
      });
      this.addMessage(buttons.join(''), 'abot', '', null);
    } else if(data.type == 'template') {
      this.addMessage(utils.renderTemplate(data), 'abot', '', null);
    } else {
      console.log('dont know how to handle this');
      this.addMessage(data.text, 'abot', '', null);
    }
	},
	
	addMessage: function (message, user, type, cb) {
		var div_message = document.getElementById('abot-message');

		this.status.current = 'abot';
		if (user == this.config.user) {
		 this.status.current = 'user';
		}

		message = decodeURIComponent(message);

		var msgClass = 'abot-embed-body';
		var divClass = '';
		var divCaret = '';

		message = '<p>'+message+'</p>';
		divCaret = '<div class="abot-comment-caret"></div>';

    if(type === 'buttons') {
  		var msgHtml = '<div class="abot-comment-body-container-nostyle"><div class="abot-comment-body '+msgClass+'">';
  		msgHtml = msgHtml + message + '</div>'+divCaret+'</div>';
      
    } else {
  		var msgHtml = '<div class="abot-comment-body-container"><div class="abot-comment-body '+msgClass+'">';
  		msgHtml = msgHtml + message + '</div>'+divCaret+'</div>';
		}

		var msgContainer = document.createElement("div");
		utils.addClass(msgContainer, 'abot-comment abot-comment-by-' + this.status.current+" "+divClass);
		msgContainer.innerHTML = msgHtml;

		var t = document.querySelector('.abot-comment-metadata-container');
		if (this.status.last != this.status.current) {
			if (t) {
				utils.removeClass(t, 'abot-comment-metadata-container');
				utils.addClass(t, 'abot-comment-metadata-container-static');
			}
		} else {
			t.parentNode.removeChild(t);
		}

		window.metadata = this.metadata = document.createElement("div");
		utils.addClass(this.metadata, "abot-comment-metadata-container");
		this.metadata.innerHTML = '<div class="abot-comment-metadata">' +
			'<span class="abot-comment-state"></span>' +
			'<span class="abot-relative-time">' +
			utils.formatDate(new Date(), 'h:mmtt') +
			'</span></div><div class="abot-comment-readstate"></div>' +
		'</div>';

		msgContainer.appendChild(this.metadata);
		msgHtml = msgContainer.outerHTML;

		var classStr = 'abot-conversation-part abot-conversation-part-grouped';
		if (this.status.last != this.status.current) {
			// add avatar image (on the first abot message)
			if (this.status.current == 'abot') {
				msgHtml = '<img src="' + require('./abot.svg') + '" class="abot-comment-avatar">' + msgHtml;
			}
			classStr = classStr + '-first';
		}
		classStr += " fromBottomToUp";
		var chatDiv = document.createElement("div");
		chatDiv.className = classStr;
		chatDiv.innerHTML = msgHtml;

		var removeClass = function () {
			this.classList.remove("fromBottomToUp");
			this.removeEventListener("animationend", removeClass, false);
		};
		chatDiv.addEventListener("animationend", removeClass, false);

		div_message.appendChild(chatDiv);
		var msgContainer = document.querySelector(".abot-sheet-content");
		this.status.last = this.status.current;
		
		if(cb) {
  		cb();
		}
	},
	initEventHandler: function () {
		// element event handlers
		document.getElementById('abot-launcher-button').onclick = function (e) {
			AdiBotChat.open();
		};

		if (document.getElementById('btnClose') != undefined) {
			document.getElementById('btnClose').onclick = function (e) {
				AdiBotChat.close();
			};
		}

		var fncTxMessageKeydown = function (e) {
			e = window.event || e;
			var keyCode = (e.which) ? e.which : e.keyCode;

			if (keyCode == 13 && !e.shiftKey) {
				if (e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}

				var message = elements.txMessage.value.toString().trim();
				if (message !== "") {
					AdiBotChat.sendMessage(message);
				}

				elements.txMessage.value = "";
				return false;
			}
		};
		if (elements.txMessage != undefined) {
			elements.txMessage.onkeydown = fncTxMessageKeydown;
		}
	},
	sendMessage: function (msg, type) {
  	var self = this;
  	var data = {};
  	if(Object.prototype.toString.call(msg).slice(8, -1) === 'Object') {
      data.postback = JSON.stringify(msg);
  	} else {
    	if(msg === 'init') {
        data.message = 'hi';
  		} else {
    		this.addMessage(msg, 'guest', type, null);
    		data.message = msg;
    		var msgContainer = document.querySelector(".abot-sheet-content");
    		utils.scrollTo(msgContainer, msgContainer.scrollHeight, 400);
  		}
  	}
  	data.session_id = self.status.sessionKey;
		utils.minAjax({
			url: self.config.server,
			type: 'POST',
			data: data,
			json: true,
			success: function(data) {
  			if(data.trim().length > 0) {
  				self.addMessage(data, 'abot', type);
  				var msgContainer = document.querySelector(".abot-sheet-content");
  				utils.scrollTo(msgContainer, msgContainer.scrollHeight, 400);
				}
			}
		});
	}
};
