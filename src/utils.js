var utils = {
  getUniqueKey: function () {
	var s = [], itoh = '0123456789ABCDEF';
	for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10);
	s[14] = 4;
	s[19] = (s[19] & 0x3) | 0x8;

	for (var x = 0; x < 36; x++) s[x] = itoh[s[x]];
	s[8] = s[13] = s[18] = s[23] = '-';

	return s.join('');
  },

  getEscapeHtml: function (html) {
	return String(html)
	  .replace(/&/g, '&amp;')
	  .replace(/"/g, '&quot;')
	  .replace(/'/g, '&#39;')
	  .replace(/</g, '&lt;')
	  .replace(/>/g, '&gt;');
  },
  getHashCode: function (s) {
	var hash = 0;
	if (s.length === 0) return hash;
	for (var i = 0; i < s.length; i++) {
	  var char1 = s.charCodeAt(i);
	  hash = ((hash << 5) - hash) + char1;
	  hash = hash & hash;
	}
	return hash;
  },
  hasClass: function (el, val) {
	var pattern = new RegExp("(^|\\s)" + val + "(\\s|$)");
	return pattern.test(el.className);
  },
  addClass: function (ele, cls) {
	if (!this.hasClass(ele, cls)) ele.className += " " + cls;
  },
  removeClass: function (ele, cls) {
	if (this.hasClass(ele, cls)) {
	  var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
	  ele.className = ele.className.replace(reg, ' ');
	}
  },
  mergeConfig: function (obj1, obj2) {

	for (var p in obj2) {
	  try {
		if (obj2[p].constructor == Object) {
		  obj1[p] = this.mergeConfig(obj1[p], obj2[p]);
		} else {
		  obj1[p] = obj2[p];
		}
	  } catch (e) {
		obj1[p] = obj2[p];

	  }
	}
	return obj1;
  },
  initXMLhttp: function () {
	var xmlhttp;
	if (window.XMLHttpRequest) {
	  //code for IE7,firefox chrome and above
	  xmlhttp = new XMLHttpRequest();
	} else {
	  //code for Internet Explorer
	  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlhttp;
  },
  minAjax: function (config) {

	if (!config.url) {
	  if (config.debugLog == true)
		console.log("No Url!");
	  return;
	}

	if (!config.type) {
	  if (config.debugLog == true)
		console.log("No Default type (GET/POST) given!");
	  return;
	}

	if (!config.method) {
	  config.method = true;
	}

	if (!config.debugLog) {
	  config.debugLog = false;
	}

	var xmlhttp = this.initXMLhttp();

	xmlhttp.onreadystatechange = function () {

	  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

		if (config.success) {
		  config.success(xmlhttp.responseText, xmlhttp.readyState);
		}

		if (config.debugLog == true)
		  console.log("SuccessResponse");
		if (config.debugLog == true)
		  console.log("Response Data:" + xmlhttp.responseText);

	  } else {

		if (config.debugLog == true)
		  console.log("FailureResponse --> State:" + xmlhttp.readyState + "Status:" + xmlhttp.status);
	  }
	};

	var sendString = [],
	  sendData = config.data;
	if (config.json) {
		sendString = JSON.stringify(sendData);
	} else {
		if (typeof sendData === "string") {
		  var tmpArr = String.prototype.split.call(sendData, '&');
		  for (var i = 0, j = tmpArr.length; i < j; i++) {
			var datum = tmpArr[i].split('=');
			sendString.push(encodeURIComponent(datum[0]) + "=" + encodeURIComponent(datum[1]));
		  }
		} else if (typeof sendData === 'object' && !( sendData instanceof String || (FormData && sendData instanceof FormData) )) {
		  for (var k in sendData) {
			var datum = sendData[k];
			if (Object.prototype.toString.call(datum) == "[object Array]") {
			  for (var i = 0, j = datum.length; i < j; i++) {
				sendString.push(encodeURIComponent(k) + "[]=" + encodeURIComponent(datum[i]));
			  }
			} else {
			  sendString.push(encodeURIComponent(k) + "=" + encodeURIComponent(datum));
			}
		  }
		}
		sendString = sendString.join('&');
	}

	if (config.type == "GET") {
	  xmlhttp.open("GET", config.url + "?" + sendString, config.method);
	  xmlhttp.send();

	  if (config.debugLog == true)
		console.log("GET fired at:" + config.url + "?" + sendString);
	}
	if (config.type == "POST" || config.type == "PUT") {
	  xmlhttp.open(config.type, config.url, config.method);
	  xmlhttp.setRequestHeader("Content-type", "application/json");
	  xmlhttp.send(sendString);

	  if (config.debugLog == true)
		console.log("POST fired at:" + config.url + " || Data:" + sendString);
	}
  },
  getCookie: function (c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
	  x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
	  y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
	  x = x.replace(/^\s+|\s+$/g, "");
	  if (x == c_name) {
		return unescape(y);
	  }
	}
  },
  setCookie: function (c_name, value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
},
  scrollTo: function (element, to, duration) {
	/*
	 to = -(to - element.clientHeight);
	 to = to > 0 ? 0 : to;
	 element.style.webkitTransform = "translateY("+to+"px)";
	 element.style.webkitTransform = "translateY("+to+"px)";
	 element.style.MozTransform = "translateY("+to+"px)";
	 element.style.msTransform = "translateY("+to+"px)";
	 element.style.OTransform = "translateY("+to+"px)";
	 element.style.transform = "translateY("+to+"px)";
	 return;
	 */
	var self = this;
	var start = element.scrollTop,
	  change = to - start,
	  increment = 20;

	var animateScroll = function (elapsedTime) {
	  elapsedTime += increment;
	  var position = self.easeInOut(elapsedTime, start, change, duration);
	  element.scrollTop = position;
	  if (elapsedTime < duration) {
		setTimeout(function () {
		  animateScroll(elapsedTime);
		}, increment);
	  }
	};

	animateScroll(0);
  },
  currentDateStr: function () {
	return (new Date()).toISOString().substring(0, 19);
  },
  easeInOut: function (currentTime, start, change, duration) {
	currentTime /= duration / 2;
	if (currentTime < 1) {
	  return change / 2 * currentTime * currentTime + start;
	}
	currentTime -= 1;
	return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
  },
  secondsTohhmmss: function (totalSeconds) {
	return (new Date(totalSeconds)).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  },
  timeSince: function (date) {
	var seconds = Math.floor((new Date() - date) / 1000);
	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
	  return interval + " years";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
	  return interval + " months";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
	  return interval + " days";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
	  return interval + " hours";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
	  return interval + " minutes";
	}
	return Math.floor(seconds) + " seconds";
  },
  generateShortId: function () {
	return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
  },
	guid: function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid; 
	},
	makeButton: function(button, type) {
  	if(type === 'carousel') {
    	var cssClass = 'carousel_quick_reply';
  	} else {
    	var cssClass = 'quick_reply';
  	}
  	switch(button.type) {
    	case 'postback':
    	  return '<button class="' + cssClass + '" data-payload=\'' + button.payload + '\'>' + button.title + '</button>';
    	break;
    	case 'web_url':
    	  return '<a target="_new" class="' + cssClass + '" href="' + button.url + '">' + button.title + '</a>';
    	break;
    	case 'phone_number':
    	  return '<a target="_new" class="' + cssClass + '" href="tel:' + button.payload + '">' + button.title + '</a>';
    	break;
    	default:
    	  return '';
    	break;
  	}
	},
	renderTemplate: function(data) {
  	console.log(data);
  	var template = '';
  	if(data.payload.template_type === 'receipt') {
    	template += '<div class="receipt">';
    	template += '<h2>Order Details</h2>';
    	template += '<img style="max-width: 60px; float: left;" src="' + data.payload.elements[0].image_url + '"/>';
    	template += '<span style="display: inline-block; padding-left: 5px;">' + data.payload.elements[0].title + '<br>' + data.payload.elements[0].subtitle + '<br>' + '$' + data.payload.elements[0].price + '.00</span>';
    	template += '<hr class="receipt-divider">';
    	template += '<ul>';
    	template += this.makeKeyValuePair('Ordered on', [data.payload.timestamp]);
    	template += this.makeKeyValuePair('Ship to', [data.payload.recipient_name, data.payload.address.street_1, data.payload.address.city, data.payload.address.state]);
    	template += this.makeKeyValuePair('Paid with', [data.payload.payment_method]);
    	template += this.makeKeyValuePair('Total', ['$'+data.payload.summary.total_cost+'.00']);
    	template += this.makeKeyValuePair('Order number', [data.payload.order_number]);
    	template += '</ul></div>';
  	}
  	return template;
	},
	makeKeyValuePair: function(key, value) {
  	return '<li class="key-value-pair"><span class="key">' + key + '</span><span class="value">' + value.join('<br>') + '</span></li>';
	},
  formatDate: function(date, format, utc){
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    function ii(i, len) { var s = i + ""; len = len || 2; while (s.length < len) s = "0" + s; return s; }
  
    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);
  
    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);
  
    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);
  
    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);
  
    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);
  
    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);
  
    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);
  
    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);
  
    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));
  
    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));
  
    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc)
    {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);
  
    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);
  
    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);
  
    format = format.replace(/\\(.)/g, "$1");
  
    return format;
  }
};

module.exports = utils;
