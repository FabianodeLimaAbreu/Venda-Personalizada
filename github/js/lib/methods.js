var nodePath = "http://was-dev/Focus24/Services/VP.svc", scrollTop = document.documentElement ? document.documentElement.scrollTop : document.body.scrollTop;
window.console = window.console || {log:function() {
}};
window.intervalList = [];
window.oldSetInterval = window.setInterval;
window.oldClearInterval = window.clearInterval;
window.setInterval = function(c, a) {
  var d = [].slice.call(arguments, 2), e = window.oldSetInterval(function() {
    c.apply(this, d);
  }, a);
  window.intervalList.push(e);
  return e;
};
function parseJsonDate(jsonDateString){
    return new Date(parseInt(jsonDateString.replace('/Date(', '')));
}
String.prototype.bool = function() {
    return (/^true$/i).test(this);
};
window.clearInterval = function(c) {
  var a = window.intervalList.indexOf(c);
  0 <= a && window.intervalList.splice(a, 1);
  return window.oldClearInterval(c);
};
window.clearAllIntervals = function() {
  for (var c in window.intervalList) {
    window.clearInterval(window.intervalList[c]);
  }
  window.intervalList = [];
};
window.timeoutList = [];
window.oldSetTimeout = window.setTimeout;
window.oldClearTimeout = window.clearTimeout;
window.setTimeout = function(c, a) {
  var d = window.oldSetTimeout(c, a);
  window.timeoutList.push(d);
  return d;
};
window.clearTimeout = function(c) {
  var a = window.timeoutList.indexOf(c);
  0 <= a && window.timeoutList.splice(a, 1);
  return window.oldClearTimeout(c);
};
window.clearAllTimeouts = function() {
  for (var c in window.timeoutList) {
    window.oldClearTimeout(window.timeoutList[c]);
  }
  window.timeoutList = [];
};
String.prototype.toDate = function() {
  if (!1 === /^[0-9]{4}-(?:[0]?[0-9]{1}|10|11|12)-(?:[012]?[0-9]{1}|30|31)(?: (?:[01]?[0-9]{1}|20|21|22|23)(?::[0-5]?[0-9]{1})?(?::[0-5]?[0-9]{1})?)?$/.test(this)) {
    throw "Wrong format for the param. `Y-m-d H:i:s` expected.";
  }
  var c = this.split(" "), a = c[0].split("-"), c = c[1].split(":"), d = new Date;
  d.setUTCFullYear(a[0], a[1] - 1, a[2]);
  d.setHours(c[0]);
  d.setMinutes(c[1]);
  return d;
};
Date.prototype.format = function(c) {
  var a = {"M+":this.getMonth() + 1, "d+":this.getDate(), "h+":this.getHours(), "m+":this.getMinutes(), "s+":this.getSeconds(), "q+":Math.floor((this.getMonth() + 3) / 3), S:this.getMilliseconds()};
  /(y+)/.test(c) && (c = c.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)));
  for (var d in a) {
    RegExp("(" + d + ")").test(c) && (c = c.replace(RegExp.$1, 1 == RegExp.$1.length ? a[d] : ("00" + a[d]).substr(("" + a[d]).length)));
  }
  return c;
};
window.mobilecheck = function() {
  var c = !1, a = navigator.userAgent || navigator.vendor || window.opera;
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 
  4))) {
    c = !0;
  }
  return c;
};
String.prototype.initialCaps = function() {
  return this.replace(/[^|\.|\!|\?/]+/g, function(c, a, d) {
    return 0 > d.charAt(a - 1).search(/[^\s-]/) ? c.charAt(0).toUpperCase() + c.substr(1).toLowerCase() : " " + c.charAt(1).toUpperCase() + c.substr(2).toLowerCase();
  });
};
String.prototype.capitalize = function() {
  var c = /^(a|e|o|da|de|do|br|n\u00e3o|das|dos|ao|ou|em|oz|um|uma|seu|com|a|an|and|as|os|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via)$/i;
  return this.toLowerCase().replace(/([^\W_]+[^\s-]*) */g, function(a, d, e, f) {
    return 0 < e && e + d.length !== f.length && -1 < d.search(c) && ":" !== f.charAt(e - 2) && 0 > f.charAt(e - 1).search(/[^\s-]/) ? a.toLowerCase() : -1 < d.substr(1).search(/[A-Z]|\../) ? a : a.charAt(0).toUpperCase() + a.substr(1);
  });
};
Array.prototype.diff = function(c) {
  return this.filter(function(a) {
    return!(-1 < c.indexOf(a));
  });
};
Array.prototype.inter = function(c) {
  return this.filter(function(a) {
    return-1 < c.indexOf(a);
  });
};
Array.prototype.sortBy = function() {
  function c(a) {
    var c = 1;
    "-" == a[0] && (c = -1, a = a.substr(1));
    return function(e, f) {
      return(e[a] < f[a] ? -1 : e[a] > f[a] ? 1 : 0) * c;
    };
  }
  return this.sort(function() {
    if (0 == arguments.length) {
      throw "Zero length arguments not allowed for Array.sortBy()";
    }
    var a = arguments;
    return function(d, e) {
      for (var f = 0, h = 0;0 == f && h < a.length;h++) {
        f = c(a[h])(d, e);
      }
      return f;
    };
  }.apply(null, arguments));
};
Array.prototype.indexOf || (Array.prototype.indexOf = function(c) {
  if (null == this) {
    throw new TypeError;
  }
  var a, d = Object(this), e = d.length >>> 0;
  if (0 === e) {
    return-1;
  }
  a = 0;
  1 < arguments.length && (a = Number(arguments[1]), a != a ? a = 0 : 0 != a && Infinity != a && -Infinity != a && (a = (0 < a || -1) * Math.floor(Math.abs(a))));
  if (a >= e) {
    return-1;
  }
  for (a = 0 <= a ? a : Math.max(e - Math.abs(a), 0);a < e;a++) {
    if (a in d && d[a] === c) {
      return a;
    }
  }
  return-1;
});
Array.prototype.unique = function() {
  var c, a, d;
  a = [];
  for (c = this.length;c--;) {
    d = this[c], -1 === $.inArray(d, a) && a.unshift(d);
  }
  return a;
};
Array.prototype.remove = function(c, a) {
  var d = this.slice((a || c) + 1 || this.length);
  this.length = 0 > c ? this.length + c : c;
  return this.push.apply(this, d);
};
Array.prototype.filter || (Array.prototype.filter = function(c, a) {
  var d = this.length >>> 0;
  if ("function" != typeof c) {
    throw new TypeError;
  }
  for (var e = [], f = 0;f < d;f++) {
    if (f in this) {
      var h = this[f];
      c.call(a, h, f, this) && e.push(h);
    }
  }
  return e;
});
function filterBy(a, b, c){
    var d = a.filter(function(d) {
        return -1 !== d[b].indexOf(c);
    });
    return d;
}
Array.prototype.map || (Array.prototype.map = function(c, a) {
  var d = this.length;
  if ("function" != typeof c) {
    throw new TypeError;
  }
  for (var e = Array(d), f = 0;f < d;f++) {
    f in this && (e[f] = c.call(a, this[f], f, this));
  }
  return e;
});
Array.prototype.forEach || (Array.prototype.forEach = function(c, a) {
  for (var d = 0, e = this.length;d < e;++d) {
    c.call(a, this[d], d, this);
  }
});
jQuery.fn.disableSelection = function() {
  return this.each(function() {
    "undefined" != typeof this.onselectstart ? this.onselectstart = function() {
      return!1;
    } : "undefined" != typeof this.style.MozUserSelect ? this.style.MozUserSelect = "none" : this.onmousedown = function() {
      return!1;
    };
  });
};
jQuery.fn.labelOver = function(c) {
  return this.find("label.pre").each(function() {
    var a, d;
    d = $(this);
    d.attr("for") && (a = d.next(), d.hide = function() {
      d.css({textIndent:-1E4, display:"none"});
    }, d.show = function() {
      "" === a.val() && d.css({textIndent:0, display:"block"});
    }, a.focus(d.hide), a.blur(d.show), d.addClass(c).click(function() {
      a.focus();
    }), "" !== a.val() && d.hide());
  });
};
jQuery.tiny = $.tiny || {};
jQuery.tiny.scrollbar = {options:{axis:"y", wheel:40, scroll:!0, lockscroll:!0, size:"auto", sizethumb:"auto", invertscroll:!1}};
jQuery.fn.tinyscrollbar = function(c) {
  var a = $.extend({}, $.tiny.scrollbar.options, c);
  this.each(function() {
    $(this).data("tsb", new Scrollbar($(this), a));
  });
  return this;
};
jQuery.fn.tinyscrollbar_update = function(c) {
  return $(this).data("tsb").update(c);
};
function Scrollbar(c, a) {
  function d(a) {
    $("body").addClass("noSelect");
    var c = parseInt(l.obj.css(s), 10);
    t = u ? a.pageX : a.pageY;
    q = "auto" == c ? 0 : c;
    v ? (document.ontouchmove = function(a) {
      a.preventDefault();
      f(a.touches[0]);
    }, document.ontouchend = h) : ($(document).bind("mousemove", f), $(document).bind("mouseup", h), l.obj.bind("mouseup", h));
  }
  function e(c) {
    1 > g.ratio && (c = c || window.event, n -= (c.wheelDelta ? c.wheelDelta / 120 : -c.detail / 3) * a.wheel, n = Math.min(g[a.axis] - p[a.axis], Math.max(0, n)), l.obj.css(s, n / r.ratio), g.obj.css(s, -n), a.lockscroll || n !== g[a.axis] - p[a.axis] && 0 !== n) && (c = $.event.fix(c), c.preventDefault());
  }
  function f(c) {
    1 > g.ratio && (k = a.invertscroll && v ? Math.min(m[a.axis] - l[a.axis], Math.max(0, q + (t - (u ? c.pageX : c.pageY)))) : Math.min(m[a.axis] - l[a.axis], Math.max(0, q + ((u ? c.pageX : c.pageY) - t))), n = k * r.ratio, g.obj.css(s, -n), l.obj.css(s, k));
  }
  function h() {
    $("body").removeClass("noSelect");
    $(document).unbind("mousemove", f);
    $(document).unbind("mouseup", h);
    l.obj.unbind("mouseup", h);
    document.ontouchmove = document.ontouchend = null;
  }
  var t, q, k, p = {obj:$(".viewport", c)}, g = {obj:$(".overview", c)}, r = {obj:$(".scrollbar", c)}, m = {obj:$(".track", r.obj)}, l = {obj:$(".thumb", r.obj)}, u = "x" === a.axis, s = u ? "left" : "top", w = u ? "Width" : "Height", n = 0;
  k = q = 0;
  t = void 0;
  var v = "ontouchstart" in document.documentElement;
  this.update = function(c) {
    p[a.axis] = p.obj[0]["offset" + w];
    g[a.axis] = g.obj[0]["scroll" + w];
    g.ratio = p[a.axis] / g[a.axis];
    r.obj.toggleClass("hide", 1 <= g.ratio);
    m[a.axis] = "auto" === a.size ? p[a.axis] : a.size;
    l[a.axis] = Math.min(m[a.axis], Math.max(0, "auto" === a.sizethumb ? m[a.axis] * g.ratio : a.sizethumb));
    r.ratio = "auto" === a.sizethumb ? g[a.axis] / m[a.axis] : (g[a.axis] - p[a.axis]) / (m[a.axis] - l[a.axis]);
    n = "relative" === c && 1 >= g.ratio ? Math.min(g[a.axis] - p[a.axis], Math.max(0, n)) : 0;
    n = "bottom" === c && 1 >= g.ratio ? g[a.axis] - p[a.axis] : isNaN(parseInt(c, 10)) ? n : parseInt(c, 10);
    c = w.toLowerCase();
    l.obj.css(s, n / r.ratio);
    g.obj.css(s, -n);
    t = l.obj.offset()[s];
    r.obj.css(c, m[a.axis]);
    m.obj.css(c, m[a.axis]);
    l.obj.css(c, l[a.axis]);
  };
  this.update();
  (function() {
    v ? p.obj[0].ontouchstart = function(a) {
      1 === a.touches.length && (d(a.touches[0]), a.stopPropagation());
    } : (l.obj.bind("mousedown", d), m.obj.bind("mouseup", f));
    a.scroll && window.addEventListener ? (c[0].addEventListener("DOMMouseScroll", e, !1), c[0].addEventListener("mousewheel", e, !1), c[0].addEventListener("MozMousePixelScroll", function(a) {
      a.preventDefault();
    }, !1)) : a.scroll && (c[0].onmousewheel = e);
  })();
  return this;
}
function arrayObject(c) {
  var a = {};
  $.each(c, function(c, e) {
    a.hasOwnProperty(e.name) ? (a[e.name] = $.makeArray(a[e.name]), a[e.name].push(e.value)) : a[e.name] = e.value;
  });
  return a;
}
function isEmptyObject(c) {
  for (var a in c) {
    if (Object.prototype.hasOwnProperty.call(c, a)) {
      return!1;
    }
  }
  return!0;
}
function isCnpj(c) {
  c = onlyNumbers(c);
  var a = c.substr(0, 12), d = c.substr(12, 2), e = 0;
  for (c = 0;12 > c;c++) {
    e += a.charAt(11 - c) * (2 + c % 8);
  }
  if (0 == e) {
    return!1;
  }
  e = 11 - e % 11;
  9 < e && (e = 0);
  if (d.charAt(0) != e) {
    return!1;
  }
  e *= 2;
  for (c = 0;12 > c;c++) {
    e += a.charAt(11 - c) * (2 + (c + 1) % 8);
  }
  e = 11 - e % 11;
  9 < e && (e = 0);
  return d.charAt(1) != e ? !1 : !0;
}
function isEmail(c) {
  return/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(c) ? !0 : !1;
}
function isNumber(c) {
  return("[object Number]" === Object.prototype.toString.call(c) || "[object String]" === Object.prototype.toString.call(c)) && !isNaN(parseFloat(c)) && isFinite(c.toString().replace(/^-/, ""));
}
function onlyNumbers(c) {
  return c.replace(/[^\d]/g, "");
}
function myIP() {
  xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
  xmlhttp.open("GET", "http://api.hostip.info/get_html.php", !1);
  xmlhttp.send();
  hostipInfo = xmlhttp.responseText.split("\n");
  for (i = 0;hostipInfo.length >= i;i++) {
    if (ipAddress = hostipInfo[i].split(":"), "IP" == ipAddress[0]) {
      return ipAddress[1];
    }
  }
  return!1;
}
String.prototype.removeAccents = function() {
  b = this.split("");
  for (var c = [], a = b.length, d = 0;d < a;d++) {
    -1 != "\u00c0\u00c1\u00c2\u00c3\u00c4\u00c5\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5\u00d2\u00d3\u00d4\u00d5\u00d5\u00d6\u00d8\u00f2\u00f3\u00f4\u00f5\u00f6\u00f8\u00c8\u00c9\u00ca\u00cb\u00e8\u00e9\u00ea\u00eb\u00f0\u00c7\u00e7\u00d0\u00cc\u00cd\u00ce\u00cf\u00ec\u00ed\u00ee\u00ef\u00d9\u00da\u00db\u00dc\u00f9\u00fa\u00fb\u00fc\u00d1\u00f1\u0160\u0161\u0178\u00ff\u00fd\u017d\u017e".indexOf(b[d]) ? c[d] = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz".substr("\u00c0\u00c1\u00c2\u00c3\u00c4\u00c5\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5\u00d2\u00d3\u00d4\u00d5\u00d5\u00d6\u00d8\u00f2\u00f3\u00f4\u00f5\u00f6\u00f8\u00c8\u00c9\u00ca\u00cb\u00e8\u00e9\u00ea\u00eb\u00f0\u00c7\u00e7\u00d0\u00cc\u00cd\u00ce\u00cf\u00ec\u00ed\u00ee\u00ef\u00d9\u00da\u00db\u00dc\u00f9\u00fa\u00fb\u00fc\u00d1\u00f1\u0160\u0161\u0178\u00ff\u00fd\u017d\u017e".indexOf(b[d]), 
    1) : c[d] = b[d];
  }
  return c.join("");
};
function printObject(c) {
  var a, d = [], e;
  for (e in c) {
    if (a = c[e], "object" == typeof a) {
      for (var f in a) {
        d.push(f + ": " + a[f]);
      }
    } else {
      d.push(e + ": " + c[e]);
    }
  }
  alert(d.join("\n"));
  console.log(d.join("\n"));
}
(function(c) {
  "function" === typeof define && define.amd ? define(["jquery"], c) : c(jQuery);
})(function(c) {
  function a(a) {
    return a;
  }
  function d(a) {
    return decodeURIComponent(a.replace(f, " "));
  }
  function e(a) {
    0 === a.indexOf('"') && (a = a.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
    try {
      return h.json ? JSON.parse(a) : a;
    } catch (c) {
    }
  }
  var f = /\+/g, h = c.cookie = function(f, q, k) {
    if (void 0 !== q) {
      k = c.extend({}, h.defaults, k);
      if ("number" === typeof k.expires) {
        var p = k.expires, g = k.expires = new Date;
        g.setDate(g.getDate() + p);
      }
      q = h.json ? JSON.stringify(q) : String(q);
      return document.cookie = [h.raw ? f : encodeURIComponent(f), "=", h.raw ? q : encodeURIComponent(q), k.expires ? "; expires=" + k.expires.toUTCString() : "", k.path ? "; path=" + k.path : "", k.domain ? "; domain=" + k.domain : "", k.secure ? "; secure" : ""].join("");
    }
    q = h.raw ? a : d;
    k = document.cookie.split("; ");
    for (var p = f ? void 0 : {}, g = 0, r = k.length;g < r;g++) {
      var m = k[g].split("="), l = q(m.shift()), m = q(m.join("="));
      if (f && f === l) {
        p = e(m);
        break;
      }
      f || (p[l] = e(m));
    }
    return p;
  };
  h.defaults = {};
  c.removeCookie = function(a, d) {
    return void 0 !== c.cookie(a) ? (c.cookie(a, "", c.extend({}, d, {expires:-1})), !0) : !1;
  };
});
// Converte a Data para o formato padrão
function convertDate(d){
  var year    = d.substring(0,4);
  var month   = d.substring(4,6);
  var day     = d.substring(6,8);
  var Data    = day+"/"+month+"/"+year;
  if(Data=="00/00/0000"){
    Data="Não disponível"
  }    
  return Data;
};
// Verifica se é um número decimal ou inteiro
function numDecimal(n){
  if(n.indexOf(",")==-1){
    // return n+",00";
    return n;
  }else if(n.split(",")[1].length=='1'){
    return n+"0";
  }else{
    return n
  }
};
// Logout
function Logout() {
  $.removeCookie('portal', { path: '/' });
  document.location = "login.html";
  return !1
}

if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(search, replace) {
        'use strict';
        if (replace === undefined) {
            return this.toString();
        }
        return this.split(search).join(replace);
    }
}

if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }

    return keys;
  };
}