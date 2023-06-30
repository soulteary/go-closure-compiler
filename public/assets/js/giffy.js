(function() {
    /*

 Copyright (C) 2017 by Marijn Haverbeke <marijnh@gmail.com> and others

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
    (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = global || self,
        global.CodeMirror = factory())
    }
    )(this, function() {
        var userAgent = navigator.userAgent;
        var platform = navigator.platform;
        var gecko = /gecko\/\d/i.test(userAgent);
        var ie_upto10 = /MSIE \d/.test(userAgent);
        var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
        var edge = /Edge\/(\d+)/.exec(userAgent);
        var ie = ie_upto10 || ie_11up || edge;
        var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : +(edge || ie_11up)[1]);
        var webkit = !edge && /WebKit\//.test(userAgent);
        var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent);
        var chrome = !edge && /Chrome\/(\d+)/.exec(userAgent);
        var chrome_version = chrome && +chrome[1];
        var presto = /Opera\//.test(userAgent);
        var safari = /Apple Computer/.test(navigator.vendor);
        var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent);
        var phantom = /PhantomJS/.test(userAgent);
        var ios = safari && (/Mobile\/\w+/.test(userAgent) || navigator.maxTouchPoints > 2);
        var android = /Android/.test(userAgent);
        var mobile = ios || android || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent);
        var mac = ios || /Mac/.test(platform);
        var chromeOS = /\bCrOS\b/.test(userAgent);
        var windows = /win/i.test(platform);
        var presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);
        if (presto_version)
            presto_version = Number(presto_version[1]);
        if (presto_version && presto_version >= 15) {
            presto = false;
            webkit = true
        }
        var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
        var captureRightClick = gecko || ie && ie_version >= 9;
        function classTest(cls) {
            return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*")
        }
        var rmClass = function(node, cls) {
            var current = node.className;
            var match = classTest(cls).exec(current);
            if (match) {
                var after = current.slice(match.index + match[0].length);
                node.className = current.slice(0, match.index) + (after ? match[1] + after : "")
            }
        };
        function removeChildren(e) {
            for (var count = e.childNodes.length; count > 0; --count)
                e.removeChild(e.firstChild);
            return e
        }
        function removeChildrenAndAdd(parent, e) {
            return removeChildren(parent).appendChild(e)
        }
        function elt(tag, content, className, style) {
            var e = document.createElement(tag);
            if (className)
                e.className = className;
            if (style)
                e.style.cssText = style;
            if (typeof content == "string")
                e.appendChild(document.createTextNode(content));
            else if (content)
                for (var i = 0; i < content.length; ++i)
                    e.appendChild(content[i]);
            return e
        }
        function eltP(tag, content, className, style) {
            var e = elt(tag, content, className, style);
            e.setAttribute("role", "presentation");
            return e
        }
        var range;
        if (document.createRange)
            range = function(node, start, end, endNode) {
                var r = document.createRange();
                r.setEnd(endNode || node, end);
                r.setStart(node, start);
                return r
            }
            ;
        else
            range = function(node, start, end) {
                var r = document.body.createTextRange();
                try {
                    r.moveToElementText(node.parentNode)
                } catch (e) {
                    return r
                }
                r.collapse(true);
                r.moveEnd("character", end);
                r.moveStart("character", start);
                return r
            }
            ;
        function contains(parent, child) {
            if (child.nodeType == 3)
                child = child.parentNode;
            if (parent.contains)
                return parent.contains(child);
            do {
                if (child.nodeType == 11)
                    child = child.host;
                if (child == parent)
                    return true
            } while (child = child.parentNode)
        }
        function activeElt() {
            var activeElement;
            try {
                activeElement = document.activeElement
            } catch (e) {
                activeElement = document.body || null
            }
            while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement)
                activeElement = activeElement.shadowRoot.activeElement;
            return activeElement
        }
        function addClass(node, cls) {
            var current = node.className;
            if (!classTest(cls).test(current))
                node.className += (current ? " " : "") + cls
        }
        function joinClasses(a, b) {
            var as = a.split(" ");
            for (var i = 0; i < as.length; i++)
                if (as[i] && !classTest(as[i]).test(b))
                    b += " " + as[i];
            return b
        }
        var selectInput = function(node) {
            node.select()
        };
        if (ios)
            selectInput = function(node) {
                node.selectionStart = 0;
                node.selectionEnd = node.value.length
            }
            ;
        else if (ie)
            selectInput = function(node) {
                try {
                    node.select()
                } catch (_e) {}
            }
            ;
        function bind(f) {
            var args = Array.prototype.slice.call(arguments, 1);
            return function() {
                return f.apply(null, args)
            }
        }
        function copyObj(obj, target, overwrite) {
            if (!target)
                target = {};
            for (var prop in obj)
                if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
                    target[prop] = obj[prop];
            return target
        }
        function countColumn(string, end, tabSize, startIndex, startValue) {
            if (end == null) {
                end = string.search(/[^\s\u00a0]/);
                if (end == -1)
                    end = string.length
            }
            for (var i = startIndex || 0, n = startValue || 0; ; ) {
                var nextTab = string.indexOf("\t", i);
                if (nextTab < 0 || nextTab >= end)
                    return n + (end - i);
                n += nextTab - i;
                n += tabSize - n % tabSize;
                i = nextTab + 1
            }
        }
        var Delayed = function() {
            this.id = null;
            this.f = null;
            this.time = 0;
            this.handler = bind(this.onTimeout, this)
        };
        Delayed.prototype.onTimeout = function(self) {
            self.id = 0;
            if (self.time <= +new Date)
                self.f();
            else
                setTimeout(self.handler, self.time - +new Date)
        }
        ;
        Delayed.prototype.set = function(ms, f) {
            this.f = f;
            var time = +new Date + ms;
            if (!this.id || time < this.time) {
                clearTimeout(this.id);
                this.id = setTimeout(this.handler, ms);
                this.time = time
            }
        }
        ;
        function indexOf(array, elt) {
            for (var i = 0; i < array.length; ++i)
                if (array[i] == elt)
                    return i;
            return -1
        }
        var scrollerGap = 50;
        var Pass = {
            toString: function() {
                return "CodeMirror.Pass"
            }
        };
        var sel_dontScroll = {
            scroll: false
        }
          , sel_mouse = {
            origin: "*mouse"
        }
          , sel_move = {
            origin: "+move"
        };
        function findColumn(string, goal, tabSize) {
            for (var pos = 0, col = 0; ; ) {
                var nextTab = string.indexOf("\t", pos);
                if (nextTab == -1)
                    nextTab = string.length;
                var skipped = nextTab - pos;
                if (nextTab == string.length || col + skipped >= goal)
                    return pos + Math.min(skipped, goal - col);
                col += nextTab - pos;
                col += tabSize - col % tabSize;
                pos = nextTab + 1;
                if (col >= goal)
                    return pos
            }
        }
        var spaceStrs = [""];
        function spaceStr(n) {
            while (spaceStrs.length <= n)
                spaceStrs.push(lst(spaceStrs) + " ");
            return spaceStrs[n]
        }
        function lst(arr) {
            return arr[arr.length - 1]
        }
        function map(array, f) {
            var out = [];
            for (var i = 0; i < array.length; i++)
                out[i] = f(array[i], i);
            return out
        }
        function insertSorted(array, value, score) {
            var pos = 0
              , priority = score(value);
            while (pos < array.length && score(array[pos]) <= priority)
                pos++;
            array.splice(pos, 0, value)
        }
        function nothing() {}
        function createObj(base, props) {
            var inst;
            if (Object.create)
                inst = Object.create(base);
            else {
                nothing.prototype = base;
                inst = new nothing
            }
            if (props)
                copyObj(props, inst);
            return inst
        }
        var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
        function isWordCharBasic(ch) {
            return /\w/.test(ch) || ch > "\u0080" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch))
        }
        function isWordChar(ch, helper) {
            if (!helper)
                return isWordCharBasic(ch);
            if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch))
                return true;
            return helper.test(ch)
        }
        function isEmpty(obj) {
            for (var n in obj)
                if (obj.hasOwnProperty(n) && obj[n])
                    return false;
            return true
        }
        var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
        function isExtendingChar(ch) {
            return ch.charCodeAt(0) >= 768 && extendingChars.test(ch)
        }
        function skipExtendingChars(str, pos, dir) {
            while ((dir < 0 ? pos > 0 : pos < str.length) && isExtendingChar(str.charAt(pos)))
                pos += dir;
            return pos
        }
        function findFirst(pred, from, to) {
            var dir = from > to ? -1 : 1;
            for (; ; ) {
                if (from == to)
                    return from;
                var midF = (from + to) / 2
                  , mid = dir < 0 ? Math.ceil(midF) : Math.floor(midF);
                if (mid == from)
                    return pred(mid) ? from : to;
                if (pred(mid))
                    to = mid;
                else
                    from = mid + dir
            }
        }
        function iterateBidiSections(order, from, to, f) {
            if (!order)
                return f(from, to, "ltr", 0);
            var found = false;
            for (var i = 0; i < order.length; ++i) {
                var part = order[i];
                if (part.from < to && part.to > from || from == to && part.to == from) {
                    f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr", i);
                    found = true
                }
            }
            if (!found)
                f(from, to, "ltr")
        }
        var bidiOther = null;
        function getBidiPartAt(order, ch, sticky) {
            var found;
            bidiOther = null;
            for (var i = 0; i < order.length; ++i) {
                var cur = order[i];
                if (cur.from < ch && cur.to > ch)
                    return i;
                if (cur.to == ch)
                    if (cur.from != cur.to && sticky == "before")
                        found = i;
                    else
                        bidiOther = i;
                if (cur.from == ch)
                    if (cur.from != cur.to && sticky != "before")
                        found = i;
                    else
                        bidiOther = i
            }
            return found != null ? found : bidiOther
        }
        var bidiOrdering = function() {
            var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
            var arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";
            function charType(code) {
                if (code <= 247)
                    return lowTypes.charAt(code);
                else if (1424 <= code && code <= 1524)
                    return "R";
                else if (1536 <= code && code <= 1785)
                    return arabicTypes.charAt(code - 1536);
                else if (1774 <= code && code <= 2220)
                    return "r";
                else if (8192 <= code && code <= 8203)
                    return "w";
                else if (code == 8204)
                    return "b";
                else
                    return "L"
            }
            var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
            var isNeutral = /[stwN]/
              , isStrong = /[LRr]/
              , countsAsLeft = /[Lb1n]/
              , countsAsNum = /[1n]/;
            function BidiSpan(level, from, to) {
                this.level = level;
                this.from = from;
                this.to = to
            }
            return function(str, direction) {
                var outerType = direction == "ltr" ? "L" : "R";
                if (str.length == 0 || direction == "ltr" && !bidiRE.test(str))
                    return false;
                var len = str.length
                  , types = [];
                for (var i = 0; i < len; ++i)
                    types.push(charType(str.charCodeAt(i)));
                for (var i$1 = 0, prev = outerType; i$1 < len; ++i$1) {
                    var type = types[i$1];
                    if (type == "m")
                        types[i$1] = prev;
                    else
                        prev = type
                }
                for (var i$2 = 0, cur = outerType; i$2 < len; ++i$2) {
                    var type$1 = types[i$2];
                    if (type$1 == "1" && cur == "r")
                        types[i$2] = "n";
                    else if (isStrong.test(type$1)) {
                        cur = type$1;
                        if (type$1 == "r")
                            types[i$2] = "R"
                    }
                }
                for (var i$3 = 1, prev$1 = types[0]; i$3 < len - 1; ++i$3) {
                    var type$2 = types[i$3];
                    if (type$2 == "+" && prev$1 == "1" && types[i$3 + 1] == "1")
                        types[i$3] = "1";
                    else if (type$2 == "," && prev$1 == types[i$3 + 1] && (prev$1 == "1" || prev$1 == "n"))
                        types[i$3] = prev$1;
                    prev$1 = type$2
                }
                for (var i$4 = 0; i$4 < len; ++i$4) {
                    var type$3 = types[i$4];
                    if (type$3 == ",")
                        types[i$4] = "N";
                    else if (type$3 == "%") {
                        var end = void 0;
                        for (end = i$4 + 1; end < len && types[end] == "%"; ++end)
                            ;
                        var replace = i$4 && types[i$4 - 1] == "!" || end < len && types[end] == "1" ? "1" : "N";
                        for (var j = i$4; j < end; ++j)
                            types[j] = replace;
                        i$4 = end - 1
                    }
                }
                for (var i$5 = 0, cur$1 = outerType; i$5 < len; ++i$5) {
                    var type$4 = types[i$5];
                    if (cur$1 == "L" && type$4 == "1")
                        types[i$5] = "L";
                    else if (isStrong.test(type$4))
                        cur$1 = type$4
                }
                for (var i$6 = 0; i$6 < len; ++i$6)
                    if (isNeutral.test(types[i$6])) {
                        var end$1 = void 0;
                        for (end$1 = i$6 + 1; end$1 < len && isNeutral.test(types[end$1]); ++end$1)
                            ;
                        var before = (i$6 ? types[i$6 - 1] : outerType) == "L";
                        var after = (end$1 < len ? types[end$1] : outerType) == "L";
                        var replace$1 = before == after ? before ? "L" : "R" : outerType;
                        for (var j$1 = i$6; j$1 < end$1; ++j$1)
                            types[j$1] = replace$1;
                        i$6 = end$1 - 1
                    }
                var order = [], m;
                for (var i$7 = 0; i$7 < len; )
                    if (countsAsLeft.test(types[i$7])) {
                        var start = i$7;
                        for (++i$7; i$7 < len && countsAsLeft.test(types[i$7]); ++i$7)
                            ;
                        order.push(new BidiSpan(0,start,i$7))
                    } else {
                        var pos = i$7
                          , at = order.length
                          , isRTL = direction == "rtl" ? 1 : 0;
                        for (++i$7; i$7 < len && types[i$7] != "L"; ++i$7)
                            ;
                        for (var j$2 = pos; j$2 < i$7; )
                            if (countsAsNum.test(types[j$2])) {
                                if (pos < j$2) {
                                    order.splice(at, 0, new BidiSpan(1,pos,j$2));
                                    at += isRTL
                                }
                                var nstart = j$2;
                                for (++j$2; j$2 < i$7 && countsAsNum.test(types[j$2]); ++j$2)
                                    ;
                                order.splice(at, 0, new BidiSpan(2,nstart,j$2));
                                at += isRTL;
                                pos = j$2
                            } else
                                ++j$2;
                        if (pos < i$7)
                            order.splice(at, 0, new BidiSpan(1,pos,i$7))
                    }
                if (direction == "ltr") {
                    if (order[0].level == 1 && (m = str.match(/^\s+/))) {
                        order[0].from = m[0].length;
                        order.unshift(new BidiSpan(0,0,m[0].length))
                    }
                    if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
                        lst(order).to -= m[0].length;
                        order.push(new BidiSpan(0,len - m[0].length,len))
                    }
                }
                return direction == "rtl" ? order.reverse() : order
            }
        }();
        function getOrder(line, direction) {
            var order = line.order;
            if (order == null)
                order = line.order = bidiOrdering(line.text, direction);
            return order
        }
        var noHandlers = [];
        var on = function(emitter, type, f) {
            if (emitter.addEventListener)
                emitter.addEventListener(type, f, false);
            else if (emitter.attachEvent)
                emitter.attachEvent("on" + type, f);
            else {
                var map = emitter._handlers || (emitter._handlers = {});
                map[type] = (map[type] || noHandlers).concat(f)
            }
        };
        function getHandlers(emitter, type) {
            return emitter._handlers && emitter._handlers[type] || noHandlers
        }
        function off(emitter, type, f) {
            if (emitter.removeEventListener)
                emitter.removeEventListener(type, f, false);
            else if (emitter.detachEvent)
                emitter.detachEvent("on" + type, f);
            else {
                var map = emitter._handlers
                  , arr = map && map[type];
                if (arr) {
                    var index = indexOf(arr, f);
                    if (index > -1)
                        map[type] = arr.slice(0, index).concat(arr.slice(index + 1))
                }
            }
        }
        function signal(emitter, type) {
            var handlers = getHandlers(emitter, type);
            if (!handlers.length)
                return;
            var args = Array.prototype.slice.call(arguments, 2);
            for (var i = 0; i < handlers.length; ++i)
                handlers[i].apply(null, args)
        }
        function signalDOMEvent(cm, e, override) {
            if (typeof e == "string")
                e = {
                    type: e,
                    preventDefault: function() {
                        this.defaultPrevented = true
                    }
                };
            signal(cm, override || e.type, cm, e);
            return e_defaultPrevented(e) || e.codemirrorIgnore
        }
        function signalCursorActivity(cm) {
            var arr = cm._handlers && cm._handlers.cursorActivity;
            if (!arr)
                return;
            var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);
            for (var i = 0; i < arr.length; ++i)
                if (indexOf(set, arr[i]) == -1)
                    set.push(arr[i])
        }
        function hasHandler(emitter, type) {
            return getHandlers(emitter, type).length > 0
        }
        function eventMixin(ctor) {
            ctor.prototype.on = function(type, f) {
                on(this, type, f)
            }
            ;
            ctor.prototype.off = function(type, f) {
                off(this, type, f)
            }
        }
        function e_preventDefault(e) {
            if (e.preventDefault)
                e.preventDefault();
            else
                e.returnValue = false
        }
        function e_stopPropagation(e) {
            if (e.stopPropagation)
                e.stopPropagation();
            else
                e.cancelBubble = true
        }
        function e_defaultPrevented(e) {
            return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false
        }
        function e_stop(e) {
            e_preventDefault(e);
            e_stopPropagation(e)
        }
        function e_target(e) {
            return e.target || e.srcElement
        }
        function e_button(e) {
            var b = e.which;
            if (b == null)
                if (e.button & 1)
                    b = 1;
                else if (e.button & 2)
                    b = 3;
                else if (e.button & 4)
                    b = 2;
            if (mac && e.ctrlKey && b == 1)
                b = 3;
            return b
        }
        var dragAndDrop = function() {
            if (ie && ie_version < 9)
                return false;
            var div = elt("div");
            return "draggable"in div || "dragDrop"in div
        }();
        var zwspSupported;
        function zeroWidthElement(measure) {
            if (zwspSupported == null) {
                var test = elt("span", "\u200b");
                removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
                if (measure.firstChild.offsetHeight != 0)
                    zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8)
            }
            var node = zwspSupported ? elt("span", "\u200b") : elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px");
            node.setAttribute("cm-text", "");
            return node
        }
        var badBidiRects;
        function hasBadBidiRects(measure) {
            if (badBidiRects != null)
                return badBidiRects;
            var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"));
            var r0 = range(txt, 0, 1).getBoundingClientRect();
            var r1 = range(txt, 1, 2).getBoundingClientRect();
            removeChildren(measure);
            if (!r0 || r0.left == r0.right)
                return false;
            return badBidiRects = r1.right - r0.right < 3
        }
        var splitLinesAuto = "\n\nb".split(/\n/).length != 3 ? function(string) {
            var pos = 0
              , result = []
              , l = string.length;
            while (pos <= l) {
                var nl = string.indexOf("\n", pos);
                if (nl == -1)
                    nl = string.length;
                var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
                var rt = line.indexOf("\r");
                if (rt != -1) {
                    result.push(line.slice(0, rt));
                    pos += rt + 1
                } else {
                    result.push(line);
                    pos = nl + 1
                }
            }
            return result
        }
        : function(string) {
            return string.split(/\r\n?|\n/)
        }
        ;
        var hasSelection = window.getSelection ? function(te) {
            try {
                return te.selectionStart != te.selectionEnd
            } catch (e) {
                return false
            }
        }
        : function(te) {
            var range;
            try {
                range = te.ownerDocument.selection.createRange()
            } catch (e) {}
            if (!range || range.parentElement() != te)
                return false;
            return range.compareEndPoints("StartToEnd", range) != 0
        }
        ;
        var hasCopyEvent = function() {
            var e = elt("div");
            if ("oncopy"in e)
                return true;
            var policy = {
                createScript: function(ignored) {
                    return "return;"
                }
            };
            if (typeof trustedTypes !== "undefined")
                policy = trustedTypes.createPolicy("codemirror#return", policy);
            e.setAttribute("oncopy", policy.createScript(""));
            return typeof e.oncopy == "function"
        }();
        var badZoomedRects = null;
        function hasBadZoomedRects(measure) {
            if (badZoomedRects != null)
                return badZoomedRects;
            var node = removeChildrenAndAdd(measure, elt("span", "x"));
            var normal = node.getBoundingClientRect();
            var fromRange = range(node, 0, 1).getBoundingClientRect();
            return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1
        }
        var modes = {}
          , mimeModes = {};
        function defineMode(name, mode) {
            if (arguments.length > 2)
                mode.dependencies = Array.prototype.slice.call(arguments, 2);
            modes[name] = mode
        }
        function defineMIME(mime, spec) {
            mimeModes[mime] = spec
        }
        function resolveMode(spec) {
            if (typeof spec == "string" && mimeModes.hasOwnProperty(spec))
                spec = mimeModes[spec];
            else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
                var found = mimeModes[spec.name];
                if (typeof found == "string")
                    found = {
                        name: found
                    };
                spec = createObj(found, spec);
                spec.name = found.name
            } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec))
                return resolveMode("application/xml");
            else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(spec))
                return resolveMode("application/json");
            if (typeof spec == "string")
                return {
                    name: spec
                };
            else
                return spec || {
                    name: "null"
                }
        }
        function getMode(options, spec) {
            spec = resolveMode(spec);
            var mfactory = modes[spec.name];
            if (!mfactory)
                return getMode(options, "text/plain");
            var modeObj = mfactory(options, spec);
            if (modeExtensions.hasOwnProperty(spec.name)) {
                var exts = modeExtensions[spec.name];
                for (var prop in exts) {
                    if (!exts.hasOwnProperty(prop))
                        continue;
                    if (modeObj.hasOwnProperty(prop))
                        modeObj["_" + prop] = modeObj[prop];
                    modeObj[prop] = exts[prop]
                }
            }
            modeObj.name = spec.name;
            if (spec.helperType)
                modeObj.helperType = spec.helperType;
            if (spec.modeProps)
                for (var prop$1 in spec.modeProps)
                    modeObj[prop$1] = spec.modeProps[prop$1];
            return modeObj
        }
        var modeExtensions = {};
        function extendMode(mode, properties) {
            var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : modeExtensions[mode] = {};
            copyObj(properties, exts)
        }
        function copyState(mode, state) {
            if (state === true)
                return state;
            if (mode.copyState)
                return mode.copyState(state);
            var nstate = {};
            for (var n in state) {
                var val = state[n];
                if (val instanceof Array)
                    val = val.concat([]);
                nstate[n] = val
            }
            return nstate
        }
        function innerMode(mode, state) {
            var info;
            while (mode.innerMode) {
                info = mode.innerMode(state);
                if (!info || info.mode == mode)
                    break;
                state = info.state;
                mode = info.mode
            }
            return info || {
                mode: mode,
                state: state
            }
        }
        function startState(mode, a1, a2) {
            return mode.startState ? mode.startState(a1, a2) : true
        }
        var StringStream = function(string, tabSize, lineOracle) {
            this.pos = this.start = 0;
            this.string = string;
            this.tabSize = tabSize || 8;
            this.lastColumnPos = this.lastColumnValue = 0;
            this.lineStart = 0;
            this.lineOracle = lineOracle
        };
        StringStream.prototype.eol = function() {
            return this.pos >= this.string.length
        }
        ;
        StringStream.prototype.sol = function() {
            return this.pos == this.lineStart
        }
        ;
        StringStream.prototype.peek = function() {
            return this.string.charAt(this.pos) || undefined
        }
        ;
        StringStream.prototype.next = function() {
            if (this.pos < this.string.length)
                return this.string.charAt(this.pos++)
        }
        ;
        StringStream.prototype.eat = function(match) {
            var ch = this.string.charAt(this.pos);
            var ok;
            if (typeof match == "string")
                ok = ch == match;
            else
                ok = ch && (match.test ? match.test(ch) : match(ch));
            if (ok) {
                ++this.pos;
                return ch
            }
        }
        ;
        StringStream.prototype.eatWhile = function(match) {
            var start = this.pos;
            while (this.eat(match))
                ;
            return this.pos > start
        }
        ;
        StringStream.prototype.eatSpace = function() {
            var start = this.pos;
            while (/[\s\u00a0]/.test(this.string.charAt(this.pos)))
                ++this.pos;
            return this.pos > start
        }
        ;
        StringStream.prototype.skipToEnd = function() {
            this.pos = this.string.length
        }
        ;
        StringStream.prototype.skipTo = function(ch) {
            var found = this.string.indexOf(ch, this.pos);
            if (found > -1) {
                this.pos = found;
                return true
            }
        }
        ;
        StringStream.prototype.backUp = function(n) {
            this.pos -= n
        }
        ;
        StringStream.prototype.column = function() {
            if (this.lastColumnPos < this.start) {
                this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
                this.lastColumnPos = this.start
            }
            return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
        }
        ;
        StringStream.prototype.indentation = function() {
            return countColumn(this.string, null, this.tabSize) - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
        }
        ;
        StringStream.prototype.match = function(pattern, consume, caseInsensitive) {
            if (typeof pattern == "string") {
                var cased = function(str) {
                    return caseInsensitive ? str.toLowerCase() : str
                };
                var substr = this.string.substr(this.pos, pattern.length);
                if (cased(substr) == cased(pattern)) {
                    if (consume !== false)
                        this.pos += pattern.length;
                    return true
                }
            } else {
                var match = this.string.slice(this.pos).match(pattern);
                if (match && match.index > 0)
                    return null;
                if (match && consume !== false)
                    this.pos += match[0].length;
                return match
            }
        }
        ;
        StringStream.prototype.current = function() {
            return this.string.slice(this.start, this.pos)
        }
        ;
        StringStream.prototype.hideFirstChars = function(n, inner) {
            this.lineStart += n;
            try {
                return inner()
            } finally {
                this.lineStart -= n
            }
        }
        ;
        StringStream.prototype.lookAhead = function(n) {
            var oracle = this.lineOracle;
            return oracle && oracle.lookAhead(n)
        }
        ;
        StringStream.prototype.baseToken = function() {
            var oracle = this.lineOracle;
            return oracle && oracle.baseToken(this.pos)
        }
        ;
        function getLine(doc, n) {
            n -= doc.first;
            if (n < 0 || n >= doc.size)
                throw new Error("There is no line " + (n + doc.first) + " in the document.");
            var chunk = doc;
            while (!chunk.lines)
                for (var i = 0; ; ++i) {
                    var child = chunk.children[i]
                      , sz = child.chunkSize();
                    if (n < sz) {
                        chunk = child;
                        break
                    }
                    n -= sz
                }
            return chunk.lines[n]
        }
        function getBetween(doc, start, end) {
            var out = []
              , n = start.line;
            doc.iter(start.line, end.line + 1, function(line) {
                var text = line.text;
                if (n == end.line)
                    text = text.slice(0, end.ch);
                if (n == start.line)
                    text = text.slice(start.ch);
                out.push(text);
                ++n
            });
            return out
        }
        function getLines(doc, from, to) {
            var out = [];
            doc.iter(from, to, function(line) {
                out.push(line.text)
            });
            return out
        }
        function updateLineHeight(line, height) {
            var diff = height - line.height;
            if (diff)
                for (var n = line; n; n = n.parent)
                    n.height += diff
        }
        function lineNo(line) {
            if (line.parent == null)
                return null;
            var cur = line.parent
              , no = indexOf(cur.lines, line);
            for (var chunk = cur.parent; chunk; cur = chunk,
            chunk = chunk.parent)
                for (var i = 0; ; ++i) {
                    if (chunk.children[i] == cur)
                        break;
                    no += chunk.children[i].chunkSize()
                }
            return no + cur.first
        }
        function lineAtHeight(chunk, h) {
            var n = chunk.first;
            outer: do {
                for (var i$1 = 0; i$1 < chunk.children.length; ++i$1) {
                    var child = chunk.children[i$1]
                      , ch = child.height;
                    if (h < ch) {
                        chunk = child;
                        continue outer
                    }
                    h -= ch;
                    n += child.chunkSize()
                }
                return n
            } while (!chunk.lines);
            var i = 0;
            for (; i < chunk.lines.length; ++i) {
                var line = chunk.lines[i]
                  , lh = line.height;
                if (h < lh)
                    break;
                h -= lh
            }
            return n + i
        }
        function isLine(doc, l) {
            return l >= doc.first && l < doc.first + doc.size
        }
        function lineNumberFor(options, i) {
            return String(options.lineNumberFormatter(i + options.firstLineNumber))
        }
        function Pos(line, ch, sticky) {
            if (sticky === void 0)
                sticky = null;
            if (!(this instanceof Pos))
                return new Pos(line,ch,sticky);
            this.line = line;
            this.ch = ch;
            this.sticky = sticky
        }
        function cmp(a, b) {
            return a.line - b.line || a.ch - b.ch
        }
        function equalCursorPos(a, b) {
            return a.sticky == b.sticky && cmp(a, b) == 0
        }
        function copyPos(x) {
            return Pos(x.line, x.ch)
        }
        function maxPos(a, b) {
            return cmp(a, b) < 0 ? b : a
        }
        function minPos(a, b) {
            return cmp(a, b) < 0 ? a : b
        }
        function clipLine(doc, n) {
            return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1))
        }
        function clipPos(doc, pos) {
            if (pos.line < doc.first)
                return Pos(doc.first, 0);
            var last = doc.first + doc.size - 1;
            if (pos.line > last)
                return Pos(last, getLine(doc, last).text.length);
            return clipToLen(pos, getLine(doc, pos.line).text.length)
        }
        function clipToLen(pos, linelen) {
            var ch = pos.ch;
            if (ch == null || ch > linelen)
                return Pos(pos.line, linelen);
            else if (ch < 0)
                return Pos(pos.line, 0);
            else
                return pos
        }
        function clipPosArray(doc, array) {
            var out = [];
            for (var i = 0; i < array.length; i++)
                out[i] = clipPos(doc, array[i]);
            return out
        }
        var SavedContext = function(state, lookAhead) {
            this.state = state;
            this.lookAhead = lookAhead
        };
        var Context = function(doc, state, line, lookAhead) {
            this.state = state;
            this.doc = doc;
            this.line = line;
            this.maxLookAhead = lookAhead || 0;
            this.baseTokens = null;
            this.baseTokenPos = 1
        };
        Context.prototype.lookAhead = function(n) {
            var line = this.doc.getLine(this.line + n);
            if (line != null && n > this.maxLookAhead)
                this.maxLookAhead = n;
            return line
        }
        ;
        Context.prototype.baseToken = function(n) {
            if (!this.baseTokens)
                return null;
            while (this.baseTokens[this.baseTokenPos] <= n)
                this.baseTokenPos += 2;
            var type = this.baseTokens[this.baseTokenPos + 1];
            return {
                type: type && type.replace(/( |^)overlay .*/, ""),
                size: this.baseTokens[this.baseTokenPos] - n
            }
        }
        ;
        Context.prototype.nextLine = function() {
            this.line++;
            if (this.maxLookAhead > 0)
                this.maxLookAhead--
        }
        ;
        Context.fromSaved = function(doc, saved, line) {
            if (saved instanceof SavedContext)
                return new Context(doc,copyState(doc.mode, saved.state),line,saved.lookAhead);
            else
                return new Context(doc,copyState(doc.mode, saved),line)
        }
        ;
        Context.prototype.save = function(copy) {
            var state = copy !== false ? copyState(this.doc.mode, this.state) : this.state;
            return this.maxLookAhead > 0 ? new SavedContext(state,this.maxLookAhead) : state
        }
        ;
        function highlightLine(cm, line, context, forceToEnd) {
            var st = [cm.state.modeGen]
              , lineClasses = {};
            runMode(cm, line.text, cm.doc.mode, context, function(end, style) {
                return st.push(end, style)
            }, lineClasses, forceToEnd);
            var state = context.state;
            var loop = function(o) {
                context.baseTokens = st;
                var overlay = cm.state.overlays[o]
                  , i = 1
                  , at = 0;
                context.state = true;
                runMode(cm, line.text, overlay.mode, context, function(end, style) {
                    var start = i;
                    while (at < end) {
                        var i_end = st[i];
                        if (i_end > end)
                            st.splice(i, 1, end, st[i + 1], i_end);
                        i += 2;
                        at = Math.min(end, i_end)
                    }
                    if (!style)
                        return;
                    if (overlay.opaque) {
                        st.splice(start, i - start, end, "overlay " + style);
                        i = start + 2
                    } else
                        for (; start < i; start += 2) {
                            var cur = st[start + 1];
                            st[start + 1] = (cur ? cur + " " : "") + "overlay " + style
                        }
                }, lineClasses);
                context.state = state;
                context.baseTokens = null;
                context.baseTokenPos = 1
            };
            for (var o = 0; o < cm.state.overlays.length; ++o)
                loop(o);
            return {
                styles: st,
                classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null
            }
        }
        function getLineStyles(cm, line, updateFrontier) {
            if (!line.styles || line.styles[0] != cm.state.modeGen) {
                var context = getContextBefore(cm, lineNo(line));
                var resetState = line.text.length > cm.options.maxHighlightLength && copyState(cm.doc.mode, context.state);
                var result = highlightLine(cm, line, context);
                if (resetState)
                    context.state = resetState;
                line.stateAfter = context.save(!resetState);
                line.styles = result.styles;
                if (result.classes)
                    line.styleClasses = result.classes;
                else if (line.styleClasses)
                    line.styleClasses = null;
                if (updateFrontier === cm.doc.highlightFrontier)
                    cm.doc.modeFrontier = Math.max(cm.doc.modeFrontier, ++cm.doc.highlightFrontier)
            }
            return line.styles
        }
        function getContextBefore(cm, n, precise) {
            var doc = cm.doc
              , display = cm.display;
            if (!doc.mode.startState)
                return new Context(doc,true,n);
            var start = findStartLine(cm, n, precise);
            var saved = start > doc.first && getLine(doc, start - 1).stateAfter;
            var context = saved ? Context.fromSaved(doc, saved, start) : new Context(doc,startState(doc.mode),start);
            doc.iter(start, n, function(line) {
                processLine(cm, line.text, context);
                var pos = context.line;
                line.stateAfter = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo ? context.save() : null;
                context.nextLine()
            });
            if (precise)
                doc.modeFrontier = context.line;
            return context
        }
        function processLine(cm, text, context, startAt) {
            var mode = cm.doc.mode;
            var stream = new StringStream(text,cm.options.tabSize,context);
            stream.start = stream.pos = startAt || 0;
            if (text == "")
                callBlankLine(mode, context.state);
            while (!stream.eol()) {
                readToken(mode, stream, context.state);
                stream.start = stream.pos
            }
        }
        function callBlankLine(mode, state) {
            if (mode.blankLine)
                return mode.blankLine(state);
            if (!mode.innerMode)
                return;
            var inner = innerMode(mode, state);
            if (inner.mode.blankLine)
                return inner.mode.blankLine(inner.state)
        }
        function readToken(mode, stream, state, inner) {
            for (var i = 0; i < 10; i++) {
                if (inner)
                    inner[0] = innerMode(mode, state).mode;
                var style = mode.token(stream, state);
                if (stream.pos > stream.start)
                    return style
            }
            throw new Error("Mode " + mode.name + " failed to advance stream.");
        }
        var Token = function(stream, type, state) {
            this.start = stream.start;
            this.end = stream.pos;
            this.string = stream.current();
            this.type = type || null;
            this.state = state
        };
        function takeToken(cm, pos, precise, asArray) {
            var doc = cm.doc, mode = doc.mode, style;
            pos = clipPos(doc, pos);
            var line = getLine(doc, pos.line)
              , context = getContextBefore(cm, pos.line, precise);
            var stream = new StringStream(line.text,cm.options.tabSize,context), tokens;
            if (asArray)
                tokens = [];
            while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
                stream.start = stream.pos;
                style = readToken(mode, stream, context.state);
                if (asArray)
                    tokens.push(new Token(stream,style,copyState(doc.mode, context.state)))
            }
            return asArray ? tokens : new Token(stream,style,context.state)
        }
        function extractLineClasses(type, output) {
            if (type)
                for (; ; ) {
                    var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
                    if (!lineClass)
                        break;
                    type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
                    var prop = lineClass[1] ? "bgClass" : "textClass";
                    if (output[prop] == null)
                        output[prop] = lineClass[2];
                    else if (!(new RegExp("(?:^|\\s)" + lineClass[2] + "(?:$|\\s)")).test(output[prop]))
                        output[prop] += " " + lineClass[2]
                }
            return type
        }
        function runMode(cm, text, mode, context, f, lineClasses, forceToEnd) {
            var flattenSpans = mode.flattenSpans;
            if (flattenSpans == null)
                flattenSpans = cm.options.flattenSpans;
            var curStart = 0
              , curStyle = null;
            var stream = new StringStream(text,cm.options.tabSize,context), style;
            var inner = cm.options.addModeClass && [null];
            if (text == "")
                extractLineClasses(callBlankLine(mode, context.state), lineClasses);
            while (!stream.eol()) {
                if (stream.pos > cm.options.maxHighlightLength) {
                    flattenSpans = false;
                    if (forceToEnd)
                        processLine(cm, text, context, stream.pos);
                    stream.pos = text.length;
                    style = null
                } else
                    style = extractLineClasses(readToken(mode, stream, context.state, inner), lineClasses);
                if (inner) {
                    var mName = inner[0].name;
                    if (mName)
                        style = "m-" + (style ? mName + " " + style : mName)
                }
                if (!flattenSpans || curStyle != style) {
                    while (curStart < stream.start) {
                        curStart = Math.min(stream.start, curStart + 5E3);
                        f(curStart, curStyle)
                    }
                    curStyle = style
                }
                stream.start = stream.pos
            }
            while (curStart < stream.pos) {
                var pos = Math.min(stream.pos, curStart + 5E3);
                f(pos, curStyle);
                curStart = pos
            }
        }
        function findStartLine(cm, n, precise) {
            var minindent, minline, doc = cm.doc;
            var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1E3 : 100);
            for (var search = n; search > lim; --search) {
                if (search <= doc.first)
                    return doc.first;
                var line = getLine(doc, search - 1)
                  , after = line.stateAfter;
                if (after && (!precise || search + (after instanceof SavedContext ? after.lookAhead : 0) <= doc.modeFrontier))
                    return search;
                var indented = countColumn(line.text, null, cm.options.tabSize);
                if (minline == null || minindent > indented) {
                    minline = search - 1;
                    minindent = indented
                }
            }
            return minline
        }
        function retreatFrontier(doc, n) {
            doc.modeFrontier = Math.min(doc.modeFrontier, n);
            if (doc.highlightFrontier < n - 10)
                return;
            var start = doc.first;
            for (var line = n - 1; line > start; line--) {
                var saved = getLine(doc, line).stateAfter;
                if (saved && (!(saved instanceof SavedContext) || line + saved.lookAhead < n)) {
                    start = line + 1;
                    break
                }
            }
            doc.highlightFrontier = Math.min(doc.highlightFrontier, start)
        }
        var sawReadOnlySpans = false
          , sawCollapsedSpans = false;
        function seeReadOnlySpans() {
            sawReadOnlySpans = true
        }
        function seeCollapsedSpans() {
            sawCollapsedSpans = true
        }
        function MarkedSpan(marker, from, to) {
            this.marker = marker;
            this.from = from;
            this.to = to
        }
        function getMarkedSpanFor(spans, marker) {
            if (spans)
                for (var i = 0; i < spans.length; ++i) {
                    var span = spans[i];
                    if (span.marker == marker)
                        return span
                }
        }
        function removeMarkedSpan(spans, span) {
            var r;
            for (var i = 0; i < spans.length; ++i)
                if (spans[i] != span)
                    (r || (r = [])).push(spans[i]);
            return r
        }
        function addMarkedSpan(line, span, op) {
            var inThisOp = op && window.WeakSet && (op.markedSpans || (op.markedSpans = new WeakSet));
            if (inThisOp && line.markedSpans && inThisOp.has(line.markedSpans))
                line.markedSpans.push(span);
            else {
                line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
                if (inThisOp)
                    inThisOp.add(line.markedSpans)
            }
            span.marker.attachLine(line)
        }
        function markedSpansBefore(old, startCh, isInsert) {
            var nw;
            if (old)
                for (var i = 0; i < old.length; ++i) {
                    var span = old[i]
                      , marker = span.marker;
                    var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
                    if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
                        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
                        (nw || (nw = [])).push(new MarkedSpan(marker,span.from,endsAfter ? null : span.to))
                    }
                }
            return nw
        }
        function markedSpansAfter(old, endCh, isInsert) {
            var nw;
            if (old)
                for (var i = 0; i < old.length; ++i) {
                    var span = old[i]
                      , marker = span.marker;
                    var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
                    if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
                        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
                        (nw || (nw = [])).push(new MarkedSpan(marker,startsBefore ? null : span.from - endCh,span.to == null ? null : span.to - endCh))
                    }
                }
            return nw
        }
        function stretchSpansOverChange(doc, change) {
            if (change.full)
                return null;
            var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
            var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
            if (!oldFirst && !oldLast)
                return null;
            var startCh = change.from.ch
              , endCh = change.to.ch
              , isInsert = cmp(change.from, change.to) == 0;
            var first = markedSpansBefore(oldFirst, startCh, isInsert);
            var last = markedSpansAfter(oldLast, endCh, isInsert);
            var sameLine = change.text.length == 1
              , offset = lst(change.text).length + (sameLine ? startCh : 0);
            if (first)
                for (var i = 0; i < first.length; ++i) {
                    var span = first[i];
                    if (span.to == null) {
                        var found = getMarkedSpanFor(last, span.marker);
                        if (!found)
                            span.to = startCh;
                        else if (sameLine)
                            span.to = found.to == null ? null : found.to + offset
                    }
                }
            if (last)
                for (var i$1 = 0; i$1 < last.length; ++i$1) {
                    var span$1 = last[i$1];
                    if (span$1.to != null)
                        span$1.to += offset;
                    if (span$1.from == null) {
                        var found$1 = getMarkedSpanFor(first, span$1.marker);
                        if (!found$1) {
                            span$1.from = offset;
                            if (sameLine)
                                (first || (first = [])).push(span$1)
                        }
                    } else {
                        span$1.from += offset;
                        if (sameLine)
                            (first || (first = [])).push(span$1)
                    }
                }
            if (first)
                first = clearEmptySpans(first);
            if (last && last != first)
                last = clearEmptySpans(last);
            var newMarkers = [first];
            if (!sameLine) {
                var gap = change.text.length - 2, gapMarkers;
                if (gap > 0 && first)
                    for (var i$2 = 0; i$2 < first.length; ++i$2)
                        if (first[i$2].to == null)
                            (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i$2].marker,null,null));
                for (var i$3 = 0; i$3 < gap; ++i$3)
                    newMarkers.push(gapMarkers);
                newMarkers.push(last)
            }
            return newMarkers
        }
        function clearEmptySpans(spans) {
            for (var i = 0; i < spans.length; ++i) {
                var span = spans[i];
                if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false)
                    spans.splice(i--, 1)
            }
            if (!spans.length)
                return null;
            return spans
        }
        function removeReadOnlyRanges(doc, from, to) {
            var markers = null;
            doc.iter(from.line, to.line + 1, function(line) {
                if (line.markedSpans)
                    for (var i = 0; i < line.markedSpans.length; ++i) {
                        var mark = line.markedSpans[i].marker;
                        if (mark.readOnly && (!markers || indexOf(markers, mark) == -1))
                            (markers || (markers = [])).push(mark)
                    }
            });
            if (!markers)
                return null;
            var parts = [{
                from: from,
                to: to
            }];
            for (var i = 0; i < markers.length; ++i) {
                var mk = markers[i]
                  , m = mk.find(0);
                for (var j = 0; j < parts.length; ++j) {
                    var p = parts[j];
                    if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0)
                        continue;
                    var newParts = [j, 1]
                      , dfrom = cmp(p.from, m.from)
                      , dto = cmp(p.to, m.to);
                    if (dfrom < 0 || !mk.inclusiveLeft && !dfrom)
                        newParts.push({
                            from: p.from,
                            to: m.from
                        });
                    if (dto > 0 || !mk.inclusiveRight && !dto)
                        newParts.push({
                            from: m.to,
                            to: p.to
                        });
                    parts.splice.apply(parts, newParts);
                    j += newParts.length - 3
                }
            }
            return parts
        }
        function detachMarkedSpans(line) {
            var spans = line.markedSpans;
            if (!spans)
                return;
            for (var i = 0; i < spans.length; ++i)
                spans[i].marker.detachLine(line);
            line.markedSpans = null
        }
        function attachMarkedSpans(line, spans) {
            if (!spans)
                return;
            for (var i = 0; i < spans.length; ++i)
                spans[i].marker.attachLine(line);
            line.markedSpans = spans
        }
        function extraLeft(marker) {
            return marker.inclusiveLeft ? -1 : 0
        }
        function extraRight(marker) {
            return marker.inclusiveRight ? 1 : 0
        }
        function compareCollapsedMarkers(a, b) {
            var lenDiff = a.lines.length - b.lines.length;
            if (lenDiff != 0)
                return lenDiff;
            var aPos = a.find()
              , bPos = b.find();
            var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
            if (fromCmp)
                return -fromCmp;
            var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
            if (toCmp)
                return toCmp;
            return b.id - a.id
        }
        function collapsedSpanAtSide(line, start) {
            var sps = sawCollapsedSpans && line.markedSpans, found;
            if (sps)
                for (var sp = void 0, i = 0; i < sps.length; ++i) {
                    sp = sps[i];
                    if (sp.marker.collapsed && (start ? sp.from : sp.to) == null && (!found || compareCollapsedMarkers(found, sp.marker) < 0))
                        found = sp.marker
                }
            return found
        }
        function collapsedSpanAtStart(line) {
            return collapsedSpanAtSide(line, true)
        }
        function collapsedSpanAtEnd(line) {
            return collapsedSpanAtSide(line, false)
        }
        function collapsedSpanAround(line, ch) {
            var sps = sawCollapsedSpans && line.markedSpans, found;
            if (sps)
                for (var i = 0; i < sps.length; ++i) {
                    var sp = sps[i];
                    if (sp.marker.collapsed && (sp.from == null || sp.from < ch) && (sp.to == null || sp.to > ch) && (!found || compareCollapsedMarkers(found, sp.marker) < 0))
                        found = sp.marker
                }
            return found
        }
        function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
            var line = getLine(doc, lineNo);
            var sps = sawCollapsedSpans && line.markedSpans;
            if (sps)
                for (var i = 0; i < sps.length; ++i) {
                    var sp = sps[i];
                    if (!sp.marker.collapsed)
                        continue;
                    var found = sp.marker.find(0);
                    var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
                    var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
                    if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0)
                        continue;
                    if (fromCmp <= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) || fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0))
                        return true
                }
        }
        function visualLine(line) {
            var merged;
            while (merged = collapsedSpanAtStart(line))
                line = merged.find(-1, true).line;
            return line
        }
        function visualLineEnd(line) {
            var merged;
            while (merged = collapsedSpanAtEnd(line))
                line = merged.find(1, true).line;
            return line
        }
        function visualLineContinued(line) {
            var merged, lines;
            while (merged = collapsedSpanAtEnd(line)) {
                line = merged.find(1, true).line;
                (lines || (lines = [])).push(line)
            }
            return lines
        }
        function visualLineNo(doc, lineN) {
            var line = getLine(doc, lineN)
              , vis = visualLine(line);
            if (line == vis)
                return lineN;
            return lineNo(vis)
        }
        function visualLineEndNo(doc, lineN) {
            if (lineN > doc.lastLine())
                return lineN;
            var line = getLine(doc, lineN), merged;
            if (!lineIsHidden(doc, line))
                return lineN;
            while (merged = collapsedSpanAtEnd(line))
                line = merged.find(1, true).line;
            return lineNo(line) + 1
        }
        function lineIsHidden(doc, line) {
            var sps = sawCollapsedSpans && line.markedSpans;
            if (sps)
                for (var sp = void 0, i = 0; i < sps.length; ++i) {
                    sp = sps[i];
                    if (!sp.marker.collapsed)
                        continue;
                    if (sp.from == null)
                        return true;
                    if (sp.marker.widgetNode)
                        continue;
                    if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp))
                        return true
                }
        }
        function lineIsHiddenInner(doc, line, span) {
            if (span.to == null) {
                var end = span.marker.find(1, true);
                return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker))
            }
            if (span.marker.inclusiveRight && span.to == line.text.length)
                return true;
            for (var sp = void 0, i = 0; i < line.markedSpans.length; ++i) {
                sp = line.markedSpans[i];
                if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to && (sp.to == null || sp.to != span.from) && (sp.marker.inclusiveLeft || span.marker.inclusiveRight) && lineIsHiddenInner(doc, line, sp))
                    return true
            }
        }
        function heightAtLine(lineObj) {
            lineObj = visualLine(lineObj);
            var h = 0
              , chunk = lineObj.parent;
            for (var i = 0; i < chunk.lines.length; ++i) {
                var line = chunk.lines[i];
                if (line == lineObj)
                    break;
                else
                    h += line.height
            }
            for (var p = chunk.parent; p; chunk = p,
            p = chunk.parent)
                for (var i$1 = 0; i$1 < p.children.length; ++i$1) {
                    var cur = p.children[i$1];
                    if (cur == chunk)
                        break;
                    else
                        h += cur.height
                }
            return h
        }
        function lineLength(line) {
            if (line.height == 0)
                return 0;
            var len = line.text.length, merged, cur = line;
            while (merged = collapsedSpanAtStart(cur)) {
                var found = merged.find(0, true);
                cur = found.from.line;
                len += found.from.ch - found.to.ch
            }
            cur = line;
            while (merged = collapsedSpanAtEnd(cur)) {
                var found$1 = merged.find(0, true);
                len -= cur.text.length - found$1.from.ch;
                cur = found$1.to.line;
                len += cur.text.length - found$1.to.ch
            }
            return len
        }
        function findMaxLine(cm) {
            var d = cm.display
              , doc = cm.doc;
            d.maxLine = getLine(doc, doc.first);
            d.maxLineLength = lineLength(d.maxLine);
            d.maxLineChanged = true;
            doc.iter(function(line) {
                var len = lineLength(line);
                if (len > d.maxLineLength) {
                    d.maxLineLength = len;
                    d.maxLine = line
                }
            })
        }
        var Line = function(text, markedSpans, estimateHeight) {
            this.text = text;
            attachMarkedSpans(this, markedSpans);
            this.height = estimateHeight ? estimateHeight(this) : 1
        };
        Line.prototype.lineNo = function() {
            return lineNo(this)
        }
        ;
        eventMixin(Line);
        function updateLine(line, text, markedSpans, estimateHeight) {
            line.text = text;
            if (line.stateAfter)
                line.stateAfter = null;
            if (line.styles)
                line.styles = null;
            if (line.order != null)
                line.order = null;
            detachMarkedSpans(line);
            attachMarkedSpans(line, markedSpans);
            var estHeight = estimateHeight ? estimateHeight(line) : 1;
            if (estHeight != line.height)
                updateLineHeight(line, estHeight)
        }
        function cleanUpLine(line) {
            line.parent = null;
            detachMarkedSpans(line)
        }
        var styleToClassCache = {}
          , styleToClassCacheWithMode = {};
        function interpretTokenStyle(style, options) {
            if (!style || /^\s*$/.test(style))
                return null;
            var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
            return cache[style] || (cache[style] = style.replace(/\S+/g, "cm-$&"))
        }
        function buildLineContent(cm, lineView) {
            var content = eltP("span", null, null, webkit ? "padding-right: .1px" : null);
            var builder = {
                pre: eltP("pre", [content], "CodeMirror-line"),
                content: content,
                col: 0,
                pos: 0,
                cm: cm,
                trailingSpace: false,
                splitSpaces: cm.getOption("lineWrapping")
            };
            lineView.measure = {};
            for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
                var line = i ? lineView.rest[i - 1] : lineView.line
                  , order = void 0;
                builder.pos = 0;
                builder.addToken = buildToken;
                if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line, cm.doc.direction)))
                    builder.addToken = buildTokenBadBidi(builder.addToken, order);
                builder.map = [];
                var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
                insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));
                if (line.styleClasses) {
                    if (line.styleClasses.bgClass)
                        builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "");
                    if (line.styleClasses.textClass)
                        builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "")
                }
                if (builder.map.length == 0)
                    builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure)));
                if (i == 0) {
                    lineView.measure.map = builder.map;
                    lineView.measure.cache = {}
                } else {
                    (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map);
                    (lineView.measure.caches || (lineView.measure.caches = [])).push({})
                }
            }
            if (webkit) {
                var last = builder.content.lastChild;
                if (/\bcm-tab\b/.test(last.className) || last.querySelector && last.querySelector(".cm-tab"))
                    builder.content.className = "cm-tab-wrap-hack"
            }
            signal(cm, "renderLine", cm, lineView.line, builder.pre);
            if (builder.pre.className)
                builder.textClass = joinClasses(builder.pre.className, builder.textClass || "");
            return builder
        }
        function defaultSpecialCharPlaceholder(ch) {
            var token = elt("span", "\u2022", "cm-invalidchar");
            token.title = "\\u" + ch.charCodeAt(0).toString(16);
            token.setAttribute("aria-label", token.title);
            return token
        }
        function buildToken(builder, text, style, startStyle, endStyle, css, attributes) {
            if (!text)
                return;
            var displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text;
            var special = builder.cm.state.specialChars
              , mustWrap = false;
            var content;
            if (!special.test(text)) {
                builder.col += text.length;
                content = document.createTextNode(displayText);
                builder.map.push(builder.pos, builder.pos + text.length, content);
                if (ie && ie_version < 9)
                    mustWrap = true;
                builder.pos += text.length
            } else {
                content = document.createDocumentFragment();
                var pos = 0;
                while (true) {
                    special.lastIndex = pos;
                    var m = special.exec(text);
                    var skipped = m ? m.index - pos : text.length - pos;
                    if (skipped) {
                        var txt = document.createTextNode(displayText.slice(pos, pos + skipped));
                        if (ie && ie_version < 9)
                            content.appendChild(elt("span", [txt]));
                        else
                            content.appendChild(txt);
                        builder.map.push(builder.pos, builder.pos + skipped, txt);
                        builder.col += skipped;
                        builder.pos += skipped
                    }
                    if (!m)
                        break;
                    pos += skipped + 1;
                    var txt$1 = void 0;
                    if (m[0] == "\t") {
                        var tabSize = builder.cm.options.tabSize
                          , tabWidth = tabSize - builder.col % tabSize;
                        txt$1 = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
                        txt$1.setAttribute("role", "presentation");
                        txt$1.setAttribute("cm-text", "\t");
                        builder.col += tabWidth
                    } else if (m[0] == "\r" || m[0] == "\n") {
                        txt$1 = content.appendChild(elt("span", m[0] == "\r" ? "\u240d" : "\u2424", "cm-invalidchar"));
                        txt$1.setAttribute("cm-text", m[0]);
                        builder.col += 1
                    } else {
                        txt$1 = builder.cm.options.specialCharPlaceholder(m[0]);
                        txt$1.setAttribute("cm-text", m[0]);
                        if (ie && ie_version < 9)
                            content.appendChild(elt("span", [txt$1]));
                        else
                            content.appendChild(txt$1);
                        builder.col += 1
                    }
                    builder.map.push(builder.pos, builder.pos + 1, txt$1);
                    builder.pos++
                }
            }
            builder.trailingSpace = displayText.charCodeAt(text.length - 1) == 32;
            if (style || startStyle || endStyle || mustWrap || css || attributes) {
                var fullStyle = style || "";
                if (startStyle)
                    fullStyle += startStyle;
                if (endStyle)
                    fullStyle += endStyle;
                var token = elt("span", [content], fullStyle, css);
                if (attributes)
                    for (var attr in attributes)
                        if (attributes.hasOwnProperty(attr) && attr != "style" && attr != "class")
                            if (attr === "title")
                                token.setAttribute("title", attributes[attr]);
                            else
                                throw new Error("attributes not supported for security reasons");
                return builder.content.appendChild(token)
            }
            builder.content.appendChild(content)
        }
        function splitSpaces(text, trailingBefore) {
            if (text.length > 1 && !/  /.test(text))
                return text;
            var spaceBefore = trailingBefore
              , result = "";
            for (var i = 0; i < text.length; i++) {
                var ch = text.charAt(i);
                if (ch == " " && spaceBefore && (i == text.length - 1 || text.charCodeAt(i + 1) == 32))
                    ch = "\u00a0";
                result += ch;
                spaceBefore = ch == " "
            }
            return result
        }
        function buildTokenBadBidi(inner, order) {
            return function(builder, text, style, startStyle, endStyle, css, attributes) {
                style = style ? style + " cm-force-border" : "cm-force-border";
                var start = builder.pos
                  , end = start + text.length;
                for (; ; ) {
                    var part = void 0;
                    for (var i = 0; i < order.length; i++) {
                        part = order[i];
                        if (part.to > start && part.from <= start)
                            break
                    }
                    if (part.to >= end)
                        return inner(builder, text, style, startStyle, endStyle, css, attributes);
                    inner(builder, text.slice(0, part.to - start), style, startStyle, null, css, attributes);
                    startStyle = null;
                    text = text.slice(part.to - start);
                    start = part.to
                }
            }
        }
        function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
            var widget = !ignoreWidget && marker.widgetNode;
            if (widget)
                builder.map.push(builder.pos, builder.pos + size, widget);
            if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
                if (!widget)
                    widget = builder.content.appendChild(document.createElement("span"));
                widget.setAttribute("cm-marker", marker.id)
            }
            if (widget) {
                builder.cm.display.input.setUneditable(widget);
                builder.content.appendChild(widget)
            }
            builder.pos += size;
            builder.trailingSpace = false
        }
        function insertLineContent(line, builder, styles) {
            var spans = line.markedSpans
              , allText = line.text
              , at = 0;
            if (!spans) {
                for (var i$1 = 1; i$1 < styles.length; i$1 += 2)
                    builder.addToken(builder, allText.slice(at, at = styles[i$1]), interpretTokenStyle(styles[i$1 + 1], builder.cm.options));
                return
            }
            var len = allText.length, pos = 0, i = 1, text = "", style, css;
            var nextChange = 0, spanStyle, spanEndStyle, spanStartStyle, collapsed, attributes;
            for (; ; ) {
                if (nextChange == pos) {
                    spanStyle = spanEndStyle = spanStartStyle = css = "";
                    attributes = null;
                    collapsed = null;
                    nextChange = Infinity;
                    var foundBookmarks = []
                      , endStyles = void 0;
                    for (var j = 0; j < spans.length; ++j) {
                        var sp = spans[j]
                          , m = sp.marker;
                        if (m.type == "bookmark" && sp.from == pos && m.widgetNode)
                            foundBookmarks.push(m);
                        else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
                            if (sp.to != null && sp.to != pos && nextChange > sp.to) {
                                nextChange = sp.to;
                                spanEndStyle = ""
                            }
                            if (m.className)
                                spanStyle += " " + m.className;
                            if (m.css)
                                css = (css ? css + ";" : "") + m.css;
                            if (m.startStyle && sp.from == pos)
                                spanStartStyle += " " + m.startStyle;
                            if (m.endStyle && sp.to == nextChange)
                                (endStyles || (endStyles = [])).push(m.endStyle, sp.to);
                            if (m.title)
                                (attributes || (attributes = {})).title = m.title;
                            if (m.attributes)
                                for (var attr in m.attributes)
                                    (attributes || (attributes = {}))[attr] = m.attributes[attr];
                            if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0))
                                collapsed = sp
                        } else if (sp.from > pos && nextChange > sp.from)
                            nextChange = sp.from
                    }
                    if (endStyles)
                        for (var j$1 = 0; j$1 < endStyles.length; j$1 += 2)
                            if (endStyles[j$1 + 1] == nextChange)
                                spanEndStyle += " " + endStyles[j$1];
                    if (!collapsed || collapsed.from == pos)
                        for (var j$2 = 0; j$2 < foundBookmarks.length; ++j$2)
                            buildCollapsedSpan(builder, 0, foundBookmarks[j$2]);
                    if (collapsed && (collapsed.from || 0) == pos) {
                        buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos, collapsed.marker, collapsed.from == null);
                        if (collapsed.to == null)
                            return;
                        if (collapsed.to == pos)
                            collapsed = false
                    }
                }
                if (pos >= len)
                    break;
                var upto = Math.min(len, nextChange);
                while (true) {
                    if (text) {
                        var end = pos + text.length;
                        if (!collapsed) {
                            var tokenText = end > upto ? text.slice(0, upto - pos) : text;
                            builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle, spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", css, attributes)
                        }
                        if (end >= upto) {
                            text = text.slice(upto - pos);
                            pos = upto;
                            break
                        }
                        pos = end;
                        spanStartStyle = ""
                    }
                    text = allText.slice(at, at = styles[i++]);
                    style = interpretTokenStyle(styles[i++], builder.cm.options)
                }
            }
        }
        function LineView(doc, line, lineN) {
            this.line = line;
            this.rest = visualLineContinued(line);
            this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
            this.node = this.text = null;
            this.hidden = lineIsHidden(doc, line)
        }
        function buildViewArray(cm, from, to) {
            var array = [], nextPos;
            for (var pos = from; pos < to; pos = nextPos) {
                var view = new LineView(cm.doc,getLine(cm.doc, pos),pos);
                nextPos = pos + view.size;
                array.push(view)
            }
            return array
        }
        var operationGroup = null;
        function pushOperation(op) {
            if (operationGroup)
                operationGroup.ops.push(op);
            else
                op.ownsGroup = operationGroup = {
                    ops: [op],
                    delayedCallbacks: []
                }
        }
        function fireCallbacksForOps(group) {
            var callbacks = group.delayedCallbacks
              , i = 0;
            do {
                for (; i < callbacks.length; i++)
                    callbacks[i].call(null);
                for (var j = 0; j < group.ops.length; j++) {
                    var op = group.ops[j];
                    if (op.cursorActivityHandlers)
                        while (op.cursorActivityCalled < op.cursorActivityHandlers.length)
                            op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm)
                }
            } while (i < callbacks.length)
        }
        function finishOperation(op, endCb) {
            var group = op.ownsGroup;
            if (!group)
                return;
            try {
                fireCallbacksForOps(group)
            } finally {
                operationGroup = null;
                endCb(group)
            }
        }
        var orphanDelayedCallbacks = null;
        function signalLater(emitter, type) {
            var arr = getHandlers(emitter, type);
            if (!arr.length)
                return;
            var args = Array.prototype.slice.call(arguments, 2), list;
            if (operationGroup)
                list = operationGroup.delayedCallbacks;
            else if (orphanDelayedCallbacks)
                list = orphanDelayedCallbacks;
            else {
                list = orphanDelayedCallbacks = [];
                setTimeout(fireOrphanDelayed, 0)
            }
            var loop = function(i) {
                list.push(function() {
                    return arr[i].apply(null, args)
                })
            };
            for (var i = 0; i < arr.length; ++i)
                loop(i)
        }
        function fireOrphanDelayed() {
            var delayed = orphanDelayedCallbacks;
            orphanDelayedCallbacks = null;
            for (var i = 0; i < delayed.length; ++i)
                delayed[i]()
        }
        function updateLineForChanges(cm, lineView, lineN, dims) {
            for (var j = 0; j < lineView.changes.length; j++) {
                var type = lineView.changes[j];
                if (type == "text")
                    updateLineText(cm, lineView);
                else if (type == "gutter")
                    updateLineGutter(cm, lineView, lineN, dims);
                else if (type == "class")
                    updateLineClasses(cm, lineView);
                else if (type == "widget")
                    updateLineWidgets(cm, lineView, dims)
            }
            lineView.changes = null
        }
        function ensureLineWrapped(lineView) {
            if (lineView.node == lineView.text) {
                lineView.node = elt("div", null, null, "position: relative");
                if (lineView.text.parentNode)
                    lineView.text.parentNode.replaceChild(lineView.node, lineView.text);
                lineView.node.appendChild(lineView.text);
                if (ie && ie_version < 8)
                    lineView.node.style.zIndex = 2
            }
            return lineView.node
        }
        function updateLineBackground(cm, lineView) {
            var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
            if (cls)
                cls += " CodeMirror-linebackground";
            if (lineView.background)
                if (cls)
                    lineView.background.className = cls;
                else {
                    lineView.background.parentNode.removeChild(lineView.background);
                    lineView.background = null
                }
            else if (cls) {
                var wrap = ensureLineWrapped(lineView);
                lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
                cm.display.input.setUneditable(lineView.background)
            }
        }
        function getLineContent(cm, lineView) {
            var ext = cm.display.externalMeasured;
            if (ext && ext.line == lineView.line) {
                cm.display.externalMeasured = null;
                lineView.measure = ext.measure;
                return ext.built
            }
            return buildLineContent(cm, lineView)
        }
        function updateLineText(cm, lineView) {
            var cls = lineView.text.className;
            var built = getLineContent(cm, lineView);
            if (lineView.text == lineView.node)
                lineView.node = built.pre;
            lineView.text.parentNode.replaceChild(built.pre, lineView.text);
            lineView.text = built.pre;
            if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
                lineView.bgClass = built.bgClass;
                lineView.textClass = built.textClass;
                updateLineClasses(cm, lineView)
            } else if (cls)
                lineView.text.className = cls
        }
        function updateLineClasses(cm, lineView) {
            updateLineBackground(cm, lineView);
            if (lineView.line.wrapClass)
                ensureLineWrapped(lineView).className = lineView.line.wrapClass;
            else if (lineView.node != lineView.text)
                lineView.node.className = "";
            var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
            lineView.text.className = textClass || ""
        }
        function updateLineGutter(cm, lineView, lineN, dims) {
            if (lineView.gutter) {
                lineView.node.removeChild(lineView.gutter);
                lineView.gutter = null
            }
            if (lineView.gutterBackground) {
                lineView.node.removeChild(lineView.gutterBackground);
                lineView.gutterBackground = null
            }
            if (lineView.line.gutterClass) {
                var wrap = ensureLineWrapped(lineView);
                lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass, "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px; width: " + dims.gutterTotalWidth + "px");
                cm.display.input.setUneditable(lineView.gutterBackground);
                wrap.insertBefore(lineView.gutterBackground, lineView.text)
            }
            var markers = lineView.line.gutterMarkers;
            if (cm.options.lineNumbers || markers) {
                var wrap$1 = ensureLineWrapped(lineView);
                var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px");
                gutterWrap.setAttribute("aria-hidden", "true");
                cm.display.input.setUneditable(gutterWrap);
                wrap$1.insertBefore(gutterWrap, lineView.text);
                if (lineView.line.gutterClass)
                    gutterWrap.className += " " + lineView.line.gutterClass;
                if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"]))
                    lineView.lineNumber = gutterWrap.appendChild(elt("div", lineNumberFor(cm.options, lineN), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + dims.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + cm.display.lineNumInnerWidth + "px"));
                if (markers)
                    for (var k = 0; k < cm.display.gutterSpecs.length; ++k) {
                        var id = cm.display.gutterSpecs[k].className
                          , found = markers.hasOwnProperty(id) && markers[id];
                        if (found)
                            gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", "left: " + dims.gutterLeft[id] + "px; width: " + dims.gutterWidth[id] + "px"))
                    }
            }
        }
        function updateLineWidgets(cm, lineView, dims) {
            if (lineView.alignable)
                lineView.alignable = null;
            var isWidget = classTest("CodeMirror-linewidget");
            for (var node = lineView.node.firstChild, next = void 0; node; node = next) {
                next = node.nextSibling;
                if (isWidget.test(node.className))
                    lineView.node.removeChild(node)
            }
            insertLineWidgets(cm, lineView, dims)
        }
        function buildLineElement(cm, lineView, lineN, dims) {
            var built = getLineContent(cm, lineView);
            lineView.text = lineView.node = built.pre;
            if (built.bgClass)
                lineView.bgClass = built.bgClass;
            if (built.textClass)
                lineView.textClass = built.textClass;
            updateLineClasses(cm, lineView);
            updateLineGutter(cm, lineView, lineN, dims);
            insertLineWidgets(cm, lineView, dims);
            return lineView.node
        }
        function insertLineWidgets(cm, lineView, dims) {
            insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);
            if (lineView.rest)
                for (var i = 0; i < lineView.rest.length; i++)
                    insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false)
        }
        function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
            if (!line.widgets)
                return;
            var wrap = ensureLineWrapped(lineView);
            for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
                var widget = ws[i]
                  , node = elt("div", [widget.node], "CodeMirror-linewidget" + (widget.className ? " " + widget.className : ""));
                if (!widget.handleMouseEvents)
                    node.setAttribute("cm-ignore-events", "true");
                positionLineWidget(widget, node, lineView, dims);
                cm.display.input.setUneditable(node);
                if (allowAbove && widget.above)
                    wrap.insertBefore(node, lineView.gutter || lineView.text);
                else
                    wrap.appendChild(node);
                signalLater(widget, "redraw")
            }
        }
        function positionLineWidget(widget, node, lineView, dims) {
            if (widget.noHScroll) {
                (lineView.alignable || (lineView.alignable = [])).push(node);
                var width = dims.wrapperWidth;
                node.style.left = dims.fixedPos + "px";
                if (!widget.coverGutter) {
                    width -= dims.gutterTotalWidth;
                    node.style.paddingLeft = dims.gutterTotalWidth + "px"
                }
                node.style.width = width + "px"
            }
            if (widget.coverGutter) {
                node.style.zIndex = 5;
                node.style.position = "relative";
                if (!widget.noHScroll)
                    node.style.marginLeft = -dims.gutterTotalWidth + "px"
            }
        }
        function widgetHeight(widget) {
            if (widget.height != null)
                return widget.height;
            var cm = widget.doc.cm;
            if (!cm)
                return 0;
            if (!contains(document.body, widget.node)) {
                var parentStyle = "position: relative;";
                if (widget.coverGutter)
                    parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;";
                if (widget.noHScroll)
                    parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;";
                removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle))
            }
            return widget.height = widget.node.parentNode.offsetHeight
        }
        function eventInWidget(display, e) {
            for (var n = e_target(e); n != display.wrapper; n = n.parentNode)
                if (!n || n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true" || n.parentNode == display.sizer && n != display.mover)
                    return true
        }
        function paddingTop(display) {
            return display.lineSpace.offsetTop
        }
        function paddingVert(display) {
            return display.mover.offsetHeight - display.lineSpace.offsetHeight
        }
        function paddingH(display) {
            if (display.cachedPaddingH)
                return display.cachedPaddingH;
            var e = removeChildrenAndAdd(display.measure, elt("pre", "x", "CodeMirror-line-like"));
            var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
            var data = {
                left: parseInt(style.paddingLeft),
                right: parseInt(style.paddingRight)
            };
            if (!isNaN(data.left) && !isNaN(data.right))
                display.cachedPaddingH = data;
            return data
        }
        function scrollGap(cm) {
            return scrollerGap - cm.display.nativeBarWidth
        }
        function displayWidth(cm) {
            return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth
        }
        function displayHeight(cm) {
            return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight
        }
        function ensureLineHeights(cm, lineView, rect) {
            var wrapping = cm.options.lineWrapping;
            var curWidth = wrapping && displayWidth(cm);
            if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
                var heights = lineView.measure.heights = [];
                if (wrapping) {
                    lineView.measure.width = curWidth;
                    var rects = lineView.text.firstChild.getClientRects();
                    for (var i = 0; i < rects.length - 1; i++) {
                        var cur = rects[i]
                          , next = rects[i + 1];
                        if (Math.abs(cur.bottom - next.bottom) > 2)
                            heights.push((cur.bottom + next.top) / 2 - rect.top)
                    }
                }
                heights.push(rect.bottom - rect.top)
            }
        }
        function mapFromLineView(lineView, line, lineN) {
            if (lineView.line == line)
                return {
                    map: lineView.measure.map,
                    cache: lineView.measure.cache
                };
            if (lineView.rest) {
                for (var i = 0; i < lineView.rest.length; i++)
                    if (lineView.rest[i] == line)
                        return {
                            map: lineView.measure.maps[i],
                            cache: lineView.measure.caches[i]
                        };
                for (var i$1 = 0; i$1 < lineView.rest.length; i$1++)
                    if (lineNo(lineView.rest[i$1]) > lineN)
                        return {
                            map: lineView.measure.maps[i$1],
                            cache: lineView.measure.caches[i$1],
                            before: true
                        }
            }
        }
        function updateExternalMeasurement(cm, line) {
            line = visualLine(line);
            var lineN = lineNo(line);
            var view = cm.display.externalMeasured = new LineView(cm.doc,line,lineN);
            view.lineN = lineN;
            var built = view.built = buildLineContent(cm, view);
            view.text = built.pre;
            removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
            return view
        }
        function measureChar(cm, line, ch, bias) {
            return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias)
        }
        function findViewForLine(cm, lineN) {
            if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo)
                return cm.display.view[findViewIndex(cm, lineN)];
            var ext = cm.display.externalMeasured;
            if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size)
                return ext
        }
        function prepareMeasureForLine(cm, line) {
            var lineN = lineNo(line);
            var view = findViewForLine(cm, lineN);
            if (view && !view.text)
                view = null;
            else if (view && view.changes) {
                updateLineForChanges(cm, view, lineN, getDimensions(cm));
                cm.curOp.forceUpdate = true
            }
            if (!view)
                view = updateExternalMeasurement(cm, line);
            var info = mapFromLineView(view, line, lineN);
            return {
                line: line,
                view: view,
                rect: null,
                map: info.map,
                cache: info.cache,
                before: info.before,
                hasHeights: false
            }
        }
        function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
            if (prepared.before)
                ch = -1;
            var key = ch + (bias || ""), found;
            if (prepared.cache.hasOwnProperty(key))
                found = prepared.cache[key];
            else {
                if (!prepared.rect)
                    prepared.rect = prepared.view.text.getBoundingClientRect();
                if (!prepared.hasHeights) {
                    ensureLineHeights(cm, prepared.view, prepared.rect);
                    prepared.hasHeights = true
                }
                found = measureCharInner(cm, prepared, ch, bias);
                if (!found.bogus)
                    prepared.cache[key] = found
            }
            return {
                left: found.left,
                right: found.right,
                top: varHeight ? found.rtop : found.top,
                bottom: varHeight ? found.rbottom : found.bottom
            }
        }
        var nullRect = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
        function nodeAndOffsetInLineMap(map, ch, bias) {
            var node, start, end, collapse, mStart, mEnd;
            for (var i = 0; i < map.length; i += 3) {
                mStart = map[i];
                mEnd = map[i + 1];
                if (ch < mStart) {
                    start = 0;
                    end = 1;
                    collapse = "left"
                } else if (ch < mEnd) {
                    start = ch - mStart;
                    end = start + 1
                } else if (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) {
                    end = mEnd - mStart;
                    start = end - 1;
                    if (ch >= mEnd)
                        collapse = "right"
                }
                if (start != null) {
                    node = map[i + 2];
                    if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right"))
                        collapse = bias;
                    if (bias == "left" && start == 0)
                        while (i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft) {
                            node = map[(i -= 3) + 2];
                            collapse = "left"
                        }
                    if (bias == "right" && start == mEnd - mStart)
                        while (i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft) {
                            node = map[(i += 3) + 2];
                            collapse = "right"
                        }
                    break
                }
            }
            return {
                node: node,
                start: start,
                end: end,
                collapse: collapse,
                coverStart: mStart,
                coverEnd: mEnd
            }
        }
        function getUsefulRect(rects, bias) {
            var rect = nullRect;
            if (bias == "left")
                for (var i = 0; i < rects.length; i++) {
                    if ((rect = rects[i]).left != rect.right)
                        break
                }
            else
                for (var i$1 = rects.length - 1; i$1 >= 0; i$1--)
                    if ((rect = rects[i$1]).left != rect.right)
                        break;
            return rect
        }
        function measureCharInner(cm, prepared, ch, bias) {
            var place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
            var node = place.node
              , start = place.start
              , end = place.end
              , collapse = place.collapse;
            var rect;
            if (node.nodeType == 3) {
                for (var i$1 = 0; i$1 < 4; i$1++) {
                    while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start)))
                        --start;
                    while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end)))
                        ++end;
                    if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart)
                        rect = node.parentNode.getBoundingClientRect();
                    else
                        rect = getUsefulRect(range(node, start, end).getClientRects(), bias);
                    if (rect.left || rect.right || start == 0)
                        break;
                    end = start;
                    start = start - 1;
                    collapse = "right"
                }
                if (ie && ie_version < 11)
                    rect = maybeUpdateRectForZooming(cm.display.measure, rect)
            } else {
                if (start > 0)
                    collapse = bias = "right";
                var rects;
                if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1)
                    rect = rects[bias == "right" ? rects.length - 1 : 0];
                else
                    rect = node.getBoundingClientRect()
            }
            if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
                var rSpan = node.parentNode.getClientRects()[0];
                if (rSpan)
                    rect = {
                        left: rSpan.left,
                        right: rSpan.left + charWidth(cm.display),
                        top: rSpan.top,
                        bottom: rSpan.bottom
                    };
                else
                    rect = nullRect
            }
            var rtop = rect.top - prepared.rect.top
              , rbot = rect.bottom - prepared.rect.top;
            var mid = (rtop + rbot) / 2;
            var heights = prepared.view.measure.heights;
            var i = 0;
            for (; i < heights.length - 1; i++)
                if (mid < heights[i])
                    break;
            var top = i ? heights[i - 1] : 0
              , bot = heights[i];
            var result = {
                left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
                right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
                top: top,
                bottom: bot
            };
            if (!rect.left && !rect.right)
                result.bogus = true;
            if (!cm.options.singleCursorHeightPerLine) {
                result.rtop = rtop;
                result.rbottom = rbot
            }
            return result
        }
        function maybeUpdateRectForZooming(measure, rect) {
            if (!window.screen || screen.logicalXDPI == null || screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure))
                return rect;
            var scaleX = screen.logicalXDPI / screen.deviceXDPI;
            var scaleY = screen.logicalYDPI / screen.deviceYDPI;
            return {
                left: rect.left * scaleX,
                right: rect.right * scaleX,
                top: rect.top * scaleY,
                bottom: rect.bottom * scaleY
            }
        }
        function clearLineMeasurementCacheFor(lineView) {
            if (lineView.measure) {
                lineView.measure.cache = {};
                lineView.measure.heights = null;
                if (lineView.rest)
                    for (var i = 0; i < lineView.rest.length; i++)
                        lineView.measure.caches[i] = {}
            }
        }
        function clearLineMeasurementCache(cm) {
            cm.display.externalMeasure = null;
            removeChildren(cm.display.lineMeasure);
            for (var i = 0; i < cm.display.view.length; i++)
                clearLineMeasurementCacheFor(cm.display.view[i])
        }
        function clearCaches(cm) {
            clearLineMeasurementCache(cm);
            cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
            if (!cm.options.lineWrapping)
                cm.display.maxLineChanged = true;
            cm.display.lineNumChars = null
        }
        function pageScrollX() {
            if (chrome && android)
                return -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft));
            return window.pageXOffset || (document.documentElement || document.body).scrollLeft
        }
        function pageScrollY() {
            if (chrome && android)
                return -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop));
            return window.pageYOffset || (document.documentElement || document.body).scrollTop
        }
        function widgetTopHeight(lineObj) {
            var ref = visualLine(lineObj);
            var widgets = ref.widgets;
            var height = 0;
            if (widgets)
                for (var i = 0; i < widgets.length; ++i)
                    if (widgets[i].above)
                        height += widgetHeight(widgets[i]);
            return height
        }
        function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
            if (!includeWidgets) {
                var height = widgetTopHeight(lineObj);
                rect.top += height;
                rect.bottom += height
            }
            if (context == "line")
                return rect;
            if (!context)
                context = "local";
            var yOff = heightAtLine(lineObj);
            if (context == "local")
                yOff += paddingTop(cm.display);
            else
                yOff -= cm.display.viewOffset;
            if (context == "page" || context == "window") {
                var lOff = cm.display.lineSpace.getBoundingClientRect();
                yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
                var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
                rect.left += xOff;
                rect.right += xOff
            }
            rect.top += yOff;
            rect.bottom += yOff;
            return rect
        }
        function fromCoordSystem(cm, coords, context) {
            if (context == "div")
                return coords;
            var left = coords.left
              , top = coords.top;
            if (context == "page") {
                left -= pageScrollX();
                top -= pageScrollY()
            } else if (context == "local" || !context) {
                var localBox = cm.display.sizer.getBoundingClientRect();
                left += localBox.left;
                top += localBox.top
            }
            var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
            return {
                left: left - lineSpaceBox.left,
                top: top - lineSpaceBox.top
            }
        }
        function charCoords(cm, pos, context, lineObj, bias) {
            if (!lineObj)
                lineObj = getLine(cm.doc, pos.line);
            return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context)
        }
        function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
            lineObj = lineObj || getLine(cm.doc, pos.line);
            if (!preparedMeasure)
                preparedMeasure = prepareMeasureForLine(cm, lineObj);
            function get(ch, right) {
                var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);
                if (right)
                    m.left = m.right;
                else
                    m.right = m.left;
                return intoCoordSystem(cm, lineObj, m, context)
            }
            var order = getOrder(lineObj, cm.doc.direction)
              , ch = pos.ch
              , sticky = pos.sticky;
            if (ch >= lineObj.text.length) {
                ch = lineObj.text.length;
                sticky = "before"
            } else if (ch <= 0) {
                ch = 0;
                sticky = "after"
            }
            if (!order)
                return get(sticky == "before" ? ch - 1 : ch, sticky == "before");
            function getBidi(ch, partPos, invert) {
                var part = order[partPos]
                  , right = part.level == 1;
                return get(invert ? ch - 1 : ch, right != invert)
            }
            var partPos = getBidiPartAt(order, ch, sticky);
            var other = bidiOther;
            var val = getBidi(ch, partPos, sticky == "before");
            if (other != null)
                val.other = getBidi(ch, other, sticky != "before");
            return val
        }
        function estimateCoords(cm, pos) {
            var left = 0;
            pos = clipPos(cm.doc, pos);
            if (!cm.options.lineWrapping)
                left = charWidth(cm.display) * pos.ch;
            var lineObj = getLine(cm.doc, pos.line);
            var top = heightAtLine(lineObj) + paddingTop(cm.display);
            return {
                left: left,
                right: left,
                top: top,
                bottom: top + lineObj.height
            }
        }
        function PosWithInfo(line, ch, sticky, outside, xRel) {
            var pos = Pos(line, ch, sticky);
            pos.xRel = xRel;
            if (outside)
                pos.outside = outside;
            return pos
        }
        function coordsChar(cm, x, y) {
            var doc = cm.doc;
            y += cm.display.viewOffset;
            if (y < 0)
                return PosWithInfo(doc.first, 0, null, -1, -1);
            var lineN = lineAtHeight(doc, y)
              , last = doc.first + doc.size - 1;
            if (lineN > last)
                return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, null, 1, 1);
            if (x < 0)
                x = 0;
            var lineObj = getLine(doc, lineN);
            for (; ; ) {
                var found = coordsCharInner(cm, lineObj, lineN, x, y);
                var collapsed = collapsedSpanAround(lineObj, found.ch + (found.xRel > 0 || found.outside > 0 ? 1 : 0));
                if (!collapsed)
                    return found;
                var rangeEnd = collapsed.find(1);
                if (rangeEnd.line == lineN)
                    return rangeEnd;
                lineObj = getLine(doc, lineN = rangeEnd.line)
            }
        }
        function wrappedLineExtent(cm, lineObj, preparedMeasure, y) {
            y -= widgetTopHeight(lineObj);
            var end = lineObj.text.length;
            var begin = findFirst(function(ch) {
                return measureCharPrepared(cm, preparedMeasure, ch - 1).bottom <= y
            }, end, 0);
            end = findFirst(function(ch) {
                return measureCharPrepared(cm, preparedMeasure, ch).top > y
            }, begin, end);
            return {
                begin: begin,
                end: end
            }
        }
        function wrappedLineExtentChar(cm, lineObj, preparedMeasure, target) {
            if (!preparedMeasure)
                preparedMeasure = prepareMeasureForLine(cm, lineObj);
            var targetTop = intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, target), "line").top;
            return wrappedLineExtent(cm, lineObj, preparedMeasure, targetTop)
        }
        function boxIsAfter(box, x, y, left) {
            return box.bottom <= y ? false : box.top > y ? true : (left ? box.left : box.right) > x
        }
        function coordsCharInner(cm, lineObj, lineNo, x, y) {
            y -= heightAtLine(lineObj);
            var preparedMeasure = prepareMeasureForLine(cm, lineObj);
            var widgetHeight = widgetTopHeight(lineObj);
            var begin = 0
              , end = lineObj.text.length
              , ltr = true;
            var order = getOrder(lineObj, cm.doc.direction);
            if (order) {
                var part = (cm.options.lineWrapping ? coordsBidiPartWrapped : coordsBidiPart)(cm, lineObj, lineNo, preparedMeasure, order, x, y);
                ltr = part.level != 1;
                begin = ltr ? part.from : part.to - 1;
                end = ltr ? part.to : part.from - 1
            }
            var chAround = null
              , boxAround = null;
            var ch = findFirst(function(ch) {
                var box = measureCharPrepared(cm, preparedMeasure, ch);
                box.top += widgetHeight;
                box.bottom += widgetHeight;
                if (!boxIsAfter(box, x, y, false))
                    return false;
                if (box.top <= y && box.left <= x) {
                    chAround = ch;
                    boxAround = box
                }
                return true
            }, begin, end);
            var baseX, sticky, outside = false;
            if (boxAround) {
                var atLeft = x - boxAround.left < boxAround.right - x
                  , atStart = atLeft == ltr;
                ch = chAround + (atStart ? 0 : 1);
                sticky = atStart ? "after" : "before";
                baseX = atLeft ? boxAround.left : boxAround.right
            } else {
                if (!ltr && (ch == end || ch == begin))
                    ch++;
                sticky = ch == 0 ? "after" : ch == lineObj.text.length ? "before" : measureCharPrepared(cm, preparedMeasure, ch - (ltr ? 1 : 0)).bottom + widgetHeight <= y == ltr ? "after" : "before";
                var coords = cursorCoords(cm, Pos(lineNo, ch, sticky), "line", lineObj, preparedMeasure);
                baseX = coords.left;
                outside = y < coords.top ? -1 : y >= coords.bottom ? 1 : 0
            }
            ch = skipExtendingChars(lineObj.text, ch, 1);
            return PosWithInfo(lineNo, ch, sticky, outside, x - baseX)
        }
        function coordsBidiPart(cm, lineObj, lineNo, preparedMeasure, order, x, y) {
            var index = findFirst(function(i) {
                var part = order[i]
                  , ltr = part.level != 1;
                return boxIsAfter(cursorCoords(cm, Pos(lineNo, ltr ? part.to : part.from, ltr ? "before" : "after"), "line", lineObj, preparedMeasure), x, y, true)
            }, 0, order.length - 1);
            var part = order[index];
            if (index > 0) {
                var ltr = part.level != 1;
                var start = cursorCoords(cm, Pos(lineNo, ltr ? part.from : part.to, ltr ? "after" : "before"), "line", lineObj, preparedMeasure);
                if (boxIsAfter(start, x, y, true) && start.top > y)
                    part = order[index - 1]
            }
            return part
        }
        function coordsBidiPartWrapped(cm, lineObj, _lineNo, preparedMeasure, order, x, y) {
            var ref = wrappedLineExtent(cm, lineObj, preparedMeasure, y);
            var begin = ref.begin;
            var end = ref.end;
            if (/\s/.test(lineObj.text.charAt(end - 1)))
                end--;
            var part = null
              , closestDist = null;
            for (var i = 0; i < order.length; i++) {
                var p = order[i];
                if (p.from >= end || p.to <= begin)
                    continue;
                var ltr = p.level != 1;
                var endX = measureCharPrepared(cm, preparedMeasure, ltr ? Math.min(end, p.to) - 1 : Math.max(begin, p.from)).right;
                var dist = endX < x ? x - endX + 1E9 : endX - x;
                if (!part || closestDist > dist) {
                    part = p;
                    closestDist = dist
                }
            }
            if (!part)
                part = order[order.length - 1];
            if (part.from < begin)
                part = {
                    from: begin,
                    to: part.to,
                    level: part.level
                };
            if (part.to > end)
                part = {
                    from: part.from,
                    to: end,
                    level: part.level
                };
            return part
        }
        var measureText;
        function textHeight(display) {
            if (display.cachedTextHeight != null)
                return display.cachedTextHeight;
            if (measureText == null) {
                measureText = elt("pre", null, "CodeMirror-line-like");
                for (var i = 0; i < 49; ++i) {
                    measureText.appendChild(document.createTextNode("x"));
                    measureText.appendChild(elt("br"))
                }
                measureText.appendChild(document.createTextNode("x"))
            }
            removeChildrenAndAdd(display.measure, measureText);
            var height = measureText.offsetHeight / 50;
            if (height > 3)
                display.cachedTextHeight = height;
            removeChildren(display.measure);
            return height || 1
        }
        function charWidth(display) {
            if (display.cachedCharWidth != null)
                return display.cachedCharWidth;
            var anchor = elt("span", "xxxxxxxxxx");
            var pre = elt("pre", [anchor], "CodeMirror-line-like");
            removeChildrenAndAdd(display.measure, pre);
            var rect = anchor.getBoundingClientRect()
              , width = (rect.right - rect.left) / 10;
            if (width > 2)
                display.cachedCharWidth = width;
            return width || 10
        }
        function getDimensions(cm) {
            var d = cm.display
              , left = {}
              , width = {};
            var gutterLeft = d.gutters.clientLeft;
            for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling,
            ++i) {
                var id = cm.display.gutterSpecs[i].className;
                left[id] = n.offsetLeft + n.clientLeft + gutterLeft;
                width[id] = n.clientWidth
            }
            return {
                fixedPos: compensateForHScroll(d),
                gutterTotalWidth: d.gutters.offsetWidth,
                gutterLeft: left,
                gutterWidth: width,
                wrapperWidth: d.wrapper.clientWidth
            }
        }
        function compensateForHScroll(display) {
            return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left
        }
        function estimateHeight(cm) {
            var th = textHeight(cm.display)
              , wrapping = cm.options.lineWrapping;
            var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
            return function(line) {
                if (lineIsHidden(cm.doc, line))
                    return 0;
                var widgetsHeight = 0;
                if (line.widgets)
                    for (var i = 0; i < line.widgets.length; i++)
                        if (line.widgets[i].height)
                            widgetsHeight += line.widgets[i].height;
                if (wrapping)
                    return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th;
                else
                    return widgetsHeight + th
            }
        }
        function estimateLineHeights(cm) {
            var doc = cm.doc
              , est = estimateHeight(cm);
            doc.iter(function(line) {
                var estHeight = est(line);
                if (estHeight != line.height)
                    updateLineHeight(line, estHeight)
            })
        }
        function posFromMouse(cm, e, liberal, forRect) {
            var display = cm.display;
            if (!liberal && e_target(e).getAttribute("cm-not-content") == "true")
                return null;
            var x, y, space = display.lineSpace.getBoundingClientRect();
            try {
                x = e.clientX - space.left;
                y = e.clientY - space.top
            } catch (e$1) {
                return null
            }
            var coords = coordsChar(cm, x, y), line;
            if (forRect && coords.xRel > 0 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
                var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
                coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff))
            }
            return coords
        }
        function findViewIndex(cm, n) {
            if (n >= cm.display.viewTo)
                return null;
            n -= cm.display.viewFrom;
            if (n < 0)
                return null;
            var view = cm.display.view;
            for (var i = 0; i < view.length; i++) {
                n -= view[i].size;
                if (n < 0)
                    return i
            }
        }
        function regChange(cm, from, to, lendiff) {
            if (from == null)
                from = cm.doc.first;
            if (to == null)
                to = cm.doc.first + cm.doc.size;
            if (!lendiff)
                lendiff = 0;
            var display = cm.display;
            if (lendiff && to < display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers > from))
                display.updateLineNumbers = from;
            cm.curOp.viewChanged = true;
            if (from >= display.viewTo) {
                if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo)
                    resetView(cm)
            } else if (to <= display.viewFrom)
                if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom)
                    resetView(cm);
                else {
                    display.viewFrom += lendiff;
                    display.viewTo += lendiff
                }
            else if (from <= display.viewFrom && to >= display.viewTo)
                resetView(cm);
            else if (from <= display.viewFrom) {
                var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
                if (cut) {
                    display.view = display.view.slice(cut.index);
                    display.viewFrom = cut.lineN;
                    display.viewTo += lendiff
                } else
                    resetView(cm)
            } else if (to >= display.viewTo) {
                var cut$1 = viewCuttingPoint(cm, from, from, -1);
                if (cut$1) {
                    display.view = display.view.slice(0, cut$1.index);
                    display.viewTo = cut$1.lineN
                } else
                    resetView(cm)
            } else {
                var cutTop = viewCuttingPoint(cm, from, from, -1);
                var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
                if (cutTop && cutBot) {
                    display.view = display.view.slice(0, cutTop.index).concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN)).concat(display.view.slice(cutBot.index));
                    display.viewTo += lendiff
                } else
                    resetView(cm)
            }
            var ext = display.externalMeasured;
            if (ext)
                if (to < ext.lineN)
                    ext.lineN += lendiff;
                else if (from < ext.lineN + ext.size)
                    display.externalMeasured = null
        }
        function regLineChange(cm, line, type) {
            cm.curOp.viewChanged = true;
            var display = cm.display
              , ext = cm.display.externalMeasured;
            if (ext && line >= ext.lineN && line < ext.lineN + ext.size)
                display.externalMeasured = null;
            if (line < display.viewFrom || line >= display.viewTo)
                return;
            var lineView = display.view[findViewIndex(cm, line)];
            if (lineView.node == null)
                return;
            var arr = lineView.changes || (lineView.changes = []);
            if (indexOf(arr, type) == -1)
                arr.push(type)
        }
        function resetView(cm) {
            cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
            cm.display.view = [];
            cm.display.viewOffset = 0
        }
        function viewCuttingPoint(cm, oldN, newN, dir) {
            var index = findViewIndex(cm, oldN), diff, view = cm.display.view;
            if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size)
                return {
                    index: index,
                    lineN: newN
                };
            var n = cm.display.viewFrom;
            for (var i = 0; i < index; i++)
                n += view[i].size;
            if (n != oldN) {
                if (dir > 0) {
                    if (index == view.length - 1)
                        return null;
                    diff = n + view[index].size - oldN;
                    index++
                } else
                    diff = n - oldN;
                oldN += diff;
                newN += diff
            }
            while (visualLineNo(cm.doc, newN) != newN) {
                if (index == (dir < 0 ? 0 : view.length - 1))
                    return null;
                newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
                index += dir
            }
            return {
                index: index,
                lineN: newN
            }
        }
        function adjustView(cm, from, to) {
            var display = cm.display
              , view = display.view;
            if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
                display.view = buildViewArray(cm, from, to);
                display.viewFrom = from
            } else {
                if (display.viewFrom > from)
                    display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view);
                else if (display.viewFrom < from)
                    display.view = display.view.slice(findViewIndex(cm, from));
                display.viewFrom = from;
                if (display.viewTo < to)
                    display.view = display.view.concat(buildViewArray(cm, display.viewTo, to));
                else if (display.viewTo > to)
                    display.view = display.view.slice(0, findViewIndex(cm, to))
            }
            display.viewTo = to
        }
        function countDirtyView(cm) {
            var view = cm.display.view
              , dirty = 0;
            for (var i = 0; i < view.length; i++) {
                var lineView = view[i];
                if (!lineView.hidden && (!lineView.node || lineView.changes))
                    ++dirty
            }
            return dirty
        }
        function updateSelection(cm) {
            cm.display.input.showSelection(cm.display.input.prepareSelection())
        }
        function prepareSelection(cm, primary) {
            if (primary === void 0)
                primary = true;
            var doc = cm.doc
              , result = {};
            var curFragment = result.cursors = document.createDocumentFragment();
            var selFragment = result.selection = document.createDocumentFragment();
            var customCursor = cm.options.$customCursor;
            if (customCursor)
                primary = true;
            for (var i = 0; i < doc.sel.ranges.length; i++) {
                if (!primary && i == doc.sel.primIndex)
                    continue;
                var range = doc.sel.ranges[i];
                if (range.from().line >= cm.display.viewTo || range.to().line < cm.display.viewFrom)
                    continue;
                var collapsed = range.empty();
                if (customCursor) {
                    var head = customCursor(cm, range);
                    if (head)
                        drawSelectionCursor(cm, head, curFragment)
                } else if (collapsed || cm.options.showCursorWhenSelecting)
                    drawSelectionCursor(cm, range.head, curFragment);
                if (!collapsed)
                    drawSelectionRange(cm, range, selFragment)
            }
            return result
        }
        function drawSelectionCursor(cm, head, output) {
            var pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);
            var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"));
            cursor.style.left = pos.left + "px";
            cursor.style.top = pos.top + "px";
            cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";
            if (/\bcm-fat-cursor\b/.test(cm.getWrapperElement().className)) {
                var charPos = charCoords(cm, head, "div", null, null);
                var width = charPos.right - charPos.left;
                cursor.style.width = (width > 0 ? width : cm.defaultCharWidth()) + "px"
            }
            if (pos.other) {
                var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"));
                otherCursor.style.display = "";
                otherCursor.style.left = pos.other.left + "px";
                otherCursor.style.top = pos.other.top + "px";
                otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px"
            }
        }
        function cmpCoords(a, b) {
            return a.top - b.top || a.left - b.left
        }
        function drawSelectionRange(cm, range, output) {
            var display = cm.display
              , doc = cm.doc;
            var fragment = document.createDocumentFragment();
            var padding = paddingH(cm.display)
              , leftSide = padding.left;
            var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;
            var docLTR = doc.direction == "ltr";
            function add(left, top, width, bottom) {
                if (top < 0)
                    top = 0;
                top = Math.round(top);
                bottom = Math.round(bottom);
                fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left + "px;\n                             top: " + top + "px; width: " + (width == null ? rightSide - left : width) + "px;\n                             height: " + (bottom - top) + "px"))
            }
            function drawForLine(line, fromArg, toArg) {
                var lineObj = getLine(doc, line);
                var lineLen = lineObj.text.length;
                var start, end;
                function coords(ch, bias) {
                    return charCoords(cm, Pos(line, ch), "div", lineObj, bias)
                }
                function wrapX(pos, dir, side) {
                    var extent = wrappedLineExtentChar(cm, lineObj, null, pos);
                    var prop = dir == "ltr" == (side == "after") ? "left" : "right";
                    var ch = side == "after" ? extent.begin : extent.end - (/\s/.test(lineObj.text.charAt(extent.end - 1)) ? 2 : 1);
                    return coords(ch, prop)[prop]
                }
                var order = getOrder(lineObj, doc.direction);
                iterateBidiSections(order, fromArg || 0, toArg == null ? lineLen : toArg, function(from, to, dir, i) {
                    var ltr = dir == "ltr";
                    var fromPos = coords(from, ltr ? "left" : "right");
                    var toPos = coords(to - 1, ltr ? "right" : "left");
                    var openStart = fromArg == null && from == 0
                      , openEnd = toArg == null && to == lineLen;
                    var first = i == 0
                      , last = !order || i == order.length - 1;
                    if (toPos.top - fromPos.top <= 3) {
                        var openLeft = (docLTR ? openStart : openEnd) && first;
                        var openRight = (docLTR ? openEnd : openStart) && last;
                        var left = openLeft ? leftSide : (ltr ? fromPos : toPos).left;
                        var right = openRight ? rightSide : (ltr ? toPos : fromPos).right;
                        add(left, fromPos.top, right - left, fromPos.bottom)
                    } else {
                        var topLeft, topRight, botLeft, botRight;
                        if (ltr) {
                            topLeft = docLTR && openStart && first ? leftSide : fromPos.left;
                            topRight = docLTR ? rightSide : wrapX(from, dir, "before");
                            botLeft = docLTR ? leftSide : wrapX(to, dir, "after");
                            botRight = docLTR && openEnd && last ? rightSide : toPos.right
                        } else {
                            topLeft = !docLTR ? leftSide : wrapX(from, dir, "before");
                            topRight = !docLTR && openStart && first ? rightSide : fromPos.right;
                            botLeft = !docLTR && openEnd && last ? leftSide : toPos.left;
                            botRight = !docLTR ? rightSide : wrapX(to, dir, "after")
                        }
                        add(topLeft, fromPos.top, topRight - topLeft, fromPos.bottom);
                        if (fromPos.bottom < toPos.top)
                            add(leftSide, fromPos.bottom, null, toPos.top);
                        add(botLeft, toPos.top, botRight - botLeft, toPos.bottom)
                    }
                    if (!start || cmpCoords(fromPos, start) < 0)
                        start = fromPos;
                    if (cmpCoords(toPos, start) < 0)
                        start = toPos;
                    if (!end || cmpCoords(fromPos, end) < 0)
                        end = fromPos;
                    if (cmpCoords(toPos, end) < 0)
                        end = toPos
                });
                return {
                    start: start,
                    end: end
                }
            }
            var sFrom = range.from()
              , sTo = range.to();
            if (sFrom.line == sTo.line)
                drawForLine(sFrom.line, sFrom.ch, sTo.ch);
            else {
                var fromLine = getLine(doc, sFrom.line)
                  , toLine = getLine(doc, sTo.line);
                var singleVLine = visualLine(fromLine) == visualLine(toLine);
                var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
                var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
                if (singleVLine)
                    if (leftEnd.top < rightStart.top - 2) {
                        add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
                        add(leftSide, rightStart.top, rightStart.left, rightStart.bottom)
                    } else
                        add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
                if (leftEnd.bottom < rightStart.top)
                    add(leftSide, leftEnd.bottom, null, rightStart.top)
            }
            output.appendChild(fragment)
        }
        function restartBlink(cm) {
            if (!cm.state.focused)
                return;
            var display = cm.display;
            clearInterval(display.blinker);
            var on = true;
            display.cursorDiv.style.visibility = "";
            if (cm.options.cursorBlinkRate > 0)
                display.blinker = setInterval(function() {
                    if (!cm.hasFocus())
                        onBlur(cm);
                    display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden"
                }, cm.options.cursorBlinkRate);
            else if (cm.options.cursorBlinkRate < 0)
                display.cursorDiv.style.visibility = "hidden"
        }
        function ensureFocus(cm) {
            if (!cm.hasFocus()) {
                cm.display.input.focus();
                if (!cm.state.focused)
                    onFocus(cm)
            }
        }
        function delayBlurEvent(cm) {
            cm.state.delayingBlurEvent = true;
            setTimeout(function() {
                if (cm.state.delayingBlurEvent) {
                    cm.state.delayingBlurEvent = false;
                    if (cm.state.focused)
                        onBlur(cm)
                }
            }, 100)
        }
        function onFocus(cm, e) {
            if (cm.state.delayingBlurEvent && !cm.state.draggingText)
                cm.state.delayingBlurEvent = false;
            if (cm.options.readOnly == "nocursor")
                return;
            if (!cm.state.focused) {
                signal(cm, "focus", cm, e);
                cm.state.focused = true;
                addClass(cm.display.wrapper, "CodeMirror-focused");
                if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
                    cm.display.input.reset();
                    if (webkit)
                        setTimeout(function() {
                            return cm.display.input.reset(true)
                        }, 20)
                }
                cm.display.input.receivedFocus()
            }
            restartBlink(cm)
        }
        function onBlur(cm, e) {
            if (cm.state.delayingBlurEvent)
                return;
            if (cm.state.focused) {
                signal(cm, "blur", cm, e);
                cm.state.focused = false;
                rmClass(cm.display.wrapper, "CodeMirror-focused")
            }
            clearInterval(cm.display.blinker);
            setTimeout(function() {
                if (!cm.state.focused)
                    cm.display.shift = false
            }, 150)
        }
        function updateHeightsInViewport(cm) {
            var display = cm.display;
            var prevBottom = display.lineDiv.offsetTop;
            var viewTop = Math.max(0, display.scroller.getBoundingClientRect().top);
            var oldHeight = display.lineDiv.getBoundingClientRect().top;
            var mustScroll = 0;
            for (var i = 0; i < display.view.length; i++) {
                var cur = display.view[i]
                  , wrapping = cm.options.lineWrapping;
                var height = void 0
                  , width = 0;
                if (cur.hidden)
                    continue;
                oldHeight += cur.line.height;
                if (ie && ie_version < 8) {
                    var bot = cur.node.offsetTop + cur.node.offsetHeight;
                    height = bot - prevBottom;
                    prevBottom = bot
                } else {
                    var box = cur.node.getBoundingClientRect();
                    height = box.bottom - box.top;
                    if (!wrapping && cur.text.firstChild)
                        width = cur.text.firstChild.getBoundingClientRect().right - box.left - 1
                }
                var diff = cur.line.height - height;
                if (diff > .005 || diff < -.005) {
                    if (oldHeight < viewTop)
                        mustScroll -= diff;
                    updateLineHeight(cur.line, height);
                    updateWidgetHeight(cur.line);
                    if (cur.rest)
                        for (var j = 0; j < cur.rest.length; j++)
                            updateWidgetHeight(cur.rest[j])
                }
                if (width > cm.display.sizerWidth) {
                    var chWidth = Math.ceil(width / charWidth(cm.display));
                    if (chWidth > cm.display.maxLineLength) {
                        cm.display.maxLineLength = chWidth;
                        cm.display.maxLine = cur.line;
                        cm.display.maxLineChanged = true
                    }
                }
            }
            if (Math.abs(mustScroll) > 2)
                display.scroller.scrollTop += mustScroll
        }
        function updateWidgetHeight(line) {
            if (line.widgets)
                for (var i = 0; i < line.widgets.length; ++i) {
                    var w = line.widgets[i]
                      , parent = w.node.parentNode;
                    if (parent)
                        w.height = parent.offsetHeight
                }
        }
        function visibleLines(display, doc, viewport) {
            var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
            top = Math.floor(top - paddingTop(display));
            var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;
            var from = lineAtHeight(doc, top)
              , to = lineAtHeight(doc, bottom);
            if (viewport && viewport.ensure) {
                var ensureFrom = viewport.ensure.from.line
                  , ensureTo = viewport.ensure.to.line;
                if (ensureFrom < from) {
                    from = ensureFrom;
                    to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight)
                } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
                    from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
                    to = ensureTo
                }
            }
            return {
                from: from,
                to: Math.max(to, from + 1)
            }
        }
        function maybeScrollWindow(cm, rect) {
            if (signalDOMEvent(cm, "scrollCursorIntoView"))
                return;
            var display = cm.display
              , box = display.sizer.getBoundingClientRect()
              , doScroll = null;
            if (rect.top + box.top < 0)
                doScroll = true;
            else if (rect.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight))
                doScroll = false;
            if (doScroll != null && !phantom) {
                var scrollNode = elt("div", "\u200b", null, "position: absolute;\n                         top: " + (rect.top - display.viewOffset - paddingTop(cm.display)) + "px;\n                         height: " + (rect.bottom - rect.top + scrollGap(cm) + display.barHeight) + "px;\n                         left: " + rect.left + "px; width: " + Math.max(2, rect.right - rect.left) + "px;");
                cm.display.lineSpace.appendChild(scrollNode);
                scrollNode.scrollIntoView(doScroll);
                cm.display.lineSpace.removeChild(scrollNode)
            }
        }
        function scrollPosIntoView(cm, pos, end, margin) {
            if (margin == null)
                margin = 0;
            var rect;
            if (!cm.options.lineWrapping && pos == end) {
                end = pos.sticky == "before" ? Pos(pos.line, pos.ch + 1, "before") : pos;
                pos = pos.ch ? Pos(pos.line, pos.sticky == "before" ? pos.ch - 1 : pos.ch, "after") : pos
            }
            for (var limit = 0; limit < 5; limit++) {
                var changed = false;
                var coords = cursorCoords(cm, pos);
                var endCoords = !end || end == pos ? coords : cursorCoords(cm, end);
                rect = {
                    left: Math.min(coords.left, endCoords.left),
                    top: Math.min(coords.top, endCoords.top) - margin,
                    right: Math.max(coords.left, endCoords.left),
                    bottom: Math.max(coords.bottom, endCoords.bottom) + margin
                };
                var scrollPos = calculateScrollPos(cm, rect);
                var startTop = cm.doc.scrollTop
                  , startLeft = cm.doc.scrollLeft;
                if (scrollPos.scrollTop != null) {
                    updateScrollTop(cm, scrollPos.scrollTop);
                    if (Math.abs(cm.doc.scrollTop - startTop) > 1)
                        changed = true
                }
                if (scrollPos.scrollLeft != null) {
                    setScrollLeft(cm, scrollPos.scrollLeft);
                    if (Math.abs(cm.doc.scrollLeft - startLeft) > 1)
                        changed = true
                }
                if (!changed)
                    break
            }
            return rect
        }
        function scrollIntoView(cm, rect) {
            var scrollPos = calculateScrollPos(cm, rect);
            if (scrollPos.scrollTop != null)
                updateScrollTop(cm, scrollPos.scrollTop);
            if (scrollPos.scrollLeft != null)
                setScrollLeft(cm, scrollPos.scrollLeft)
        }
        function calculateScrollPos(cm, rect) {
            var display = cm.display
              , snapMargin = textHeight(cm.display);
            if (rect.top < 0)
                rect.top = 0;
            var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
            var screen = displayHeight(cm)
              , result = {};
            if (rect.bottom - rect.top > screen)
                rect.bottom = rect.top + screen;
            var docBottom = cm.doc.height + paddingVert(display);
            var atTop = rect.top < snapMargin
              , atBottom = rect.bottom > docBottom - snapMargin;
            if (rect.top < screentop)
                result.scrollTop = atTop ? 0 : rect.top;
            else if (rect.bottom > screentop + screen) {
                var newTop = Math.min(rect.top, (atBottom ? docBottom : rect.bottom) - screen);
                if (newTop != screentop)
                    result.scrollTop = newTop
            }
            var gutterSpace = cm.options.fixedGutter ? 0 : display.gutters.offsetWidth;
            var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft - gutterSpace;
            var screenw = displayWidth(cm) - display.gutters.offsetWidth;
            var tooWide = rect.right - rect.left > screenw;
            if (tooWide)
                rect.right = rect.left + screenw;
            if (rect.left < 10)
                result.scrollLeft = 0;
            else if (rect.left < screenleft)
                result.scrollLeft = Math.max(0, rect.left + gutterSpace - (tooWide ? 0 : 10));
            else if (rect.right > screenw + screenleft - 3)
                result.scrollLeft = rect.right + (tooWide ? 0 : 10) - screenw;
            return result
        }
        function addToScrollTop(cm, top) {
            if (top == null)
                return;
            resolveScrollToPos(cm);
            cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top
        }
        function ensureCursorVisible(cm) {
            resolveScrollToPos(cm);
            var cur = cm.getCursor();
            cm.curOp.scrollToPos = {
                from: cur,
                to: cur,
                margin: cm.options.cursorScrollMargin
            }
        }
        function scrollToCoords(cm, x, y) {
            if (x != null || y != null)
                resolveScrollToPos(cm);
            if (x != null)
                cm.curOp.scrollLeft = x;
            if (y != null)
                cm.curOp.scrollTop = y
        }
        function scrollToRange(cm, range) {
            resolveScrollToPos(cm);
            cm.curOp.scrollToPos = range
        }
        function resolveScrollToPos(cm) {
            var range = cm.curOp.scrollToPos;
            if (range) {
                cm.curOp.scrollToPos = null;
                var from = estimateCoords(cm, range.from)
                  , to = estimateCoords(cm, range.to);
                scrollToCoordsRange(cm, from, to, range.margin)
            }
        }
        function scrollToCoordsRange(cm, from, to, margin) {
            var sPos = calculateScrollPos(cm, {
                left: Math.min(from.left, to.left),
                top: Math.min(from.top, to.top) - margin,
                right: Math.max(from.right, to.right),
                bottom: Math.max(from.bottom, to.bottom) + margin
            });
            scrollToCoords(cm, sPos.scrollLeft, sPos.scrollTop)
        }
        function updateScrollTop(cm, val) {
            if (Math.abs(cm.doc.scrollTop - val) < 2)
                return;
            if (!gecko)
                updateDisplaySimple(cm, {
                    top: val
                });
            setScrollTop(cm, val, true);
            if (gecko)
                updateDisplaySimple(cm);
            startWorker(cm, 100)
        }
        function setScrollTop(cm, val, forceScroll) {
            val = Math.max(0, Math.min(cm.display.scroller.scrollHeight - cm.display.scroller.clientHeight, val));
            if (cm.display.scroller.scrollTop == val && !forceScroll)
                return;
            cm.doc.scrollTop = val;
            cm.display.scrollbars.setScrollTop(val);
            if (cm.display.scroller.scrollTop != val)
                cm.display.scroller.scrollTop = val
        }
        function setScrollLeft(cm, val, isScroller, forceScroll) {
            val = Math.max(0, Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth));
            if ((isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) && !forceScroll)
                return;
            cm.doc.scrollLeft = val;
            alignHorizontally(cm);
            if (cm.display.scroller.scrollLeft != val)
                cm.display.scroller.scrollLeft = val;
            cm.display.scrollbars.setScrollLeft(val)
        }
        function measureForScrollbars(cm) {
            var d = cm.display
              , gutterW = d.gutters.offsetWidth;
            var docH = Math.round(cm.doc.height + paddingVert(cm.display));
            return {
                clientHeight: d.scroller.clientHeight,
                viewHeight: d.wrapper.clientHeight,
                scrollWidth: d.scroller.scrollWidth,
                clientWidth: d.scroller.clientWidth,
                viewWidth: d.wrapper.clientWidth,
                barLeft: cm.options.fixedGutter ? gutterW : 0,
                docHeight: docH,
                scrollHeight: docH + scrollGap(cm) + d.barHeight,
                nativeBarWidth: d.nativeBarWidth,
                gutterWidth: gutterW
            }
        }
        var NativeScrollbars = function(place, scroll, cm) {
            this.cm = cm;
            var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
            var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
            vert.tabIndex = horiz.tabIndex = -1;
            place(vert);
            place(horiz);
            on(vert, "scroll", function() {
                if (vert.clientHeight)
                    scroll(vert.scrollTop, "vertical")
            });
            on(horiz, "scroll", function() {
                if (horiz.clientWidth)
                    scroll(horiz.scrollLeft, "horizontal")
            });
            this.checkedZeroWidth = false;
            if (ie && ie_version < 8)
                this.horiz.style.minHeight = this.vert.style.minWidth = "18px"
        };
        NativeScrollbars.prototype.update = function(measure) {
            var needsH = measure.scrollWidth > measure.clientWidth + 1;
            var needsV = measure.scrollHeight > measure.clientHeight + 1;
            var sWidth = measure.nativeBarWidth;
            if (needsV) {
                this.vert.style.display = "block";
                this.vert.style.bottom = needsH ? sWidth + "px" : "0";
                var totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
                this.vert.firstChild.style.height = Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px"
            } else {
                this.vert.scrollTop = 0;
                this.vert.style.display = "";
                this.vert.firstChild.style.height = "0"
            }
            if (needsH) {
                this.horiz.style.display = "block";
                this.horiz.style.right = needsV ? sWidth + "px" : "0";
                this.horiz.style.left = measure.barLeft + "px";
                var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
                this.horiz.firstChild.style.width = Math.max(0, measure.scrollWidth - measure.clientWidth + totalWidth) + "px"
            } else {
                this.horiz.style.display = "";
                this.horiz.firstChild.style.width = "0"
            }
            if (!this.checkedZeroWidth && measure.clientHeight > 0) {
                if (sWidth == 0)
                    this.zeroWidthHack();
                this.checkedZeroWidth = true
            }
            return {
                right: needsV ? sWidth : 0,
                bottom: needsH ? sWidth : 0
            }
        }
        ;
        NativeScrollbars.prototype.setScrollLeft = function(pos) {
            if (this.horiz.scrollLeft != pos)
                this.horiz.scrollLeft = pos;
            if (this.disableHoriz)
                this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz")
        }
        ;
        NativeScrollbars.prototype.setScrollTop = function(pos) {
            if (this.vert.scrollTop != pos)
                this.vert.scrollTop = pos;
            if (this.disableVert)
                this.enableZeroWidthBar(this.vert, this.disableVert, "vert")
        }
        ;
        NativeScrollbars.prototype.zeroWidthHack = function() {
            var w = mac && !mac_geMountainLion ? "12px" : "18px";
            this.horiz.style.height = this.vert.style.width = w;
            this.horiz.style.visibility = this.vert.style.visibility = "hidden";
            this.disableHoriz = new Delayed;
            this.disableVert = new Delayed
        }
        ;
        NativeScrollbars.prototype.enableZeroWidthBar = function(bar, delay, type) {
            bar.style.visibility = "";
            function maybeDisable() {
                var box = bar.getBoundingClientRect();
                var elt = type == "vert" ? document.elementFromPoint(box.right - 1, (box.top + box.bottom) / 2) : document.elementFromPoint((box.right + box.left) / 2, box.bottom - 1);
                if (elt != bar)
                    bar.style.visibility = "hidden";
                else
                    delay.set(1E3, maybeDisable)
            }
            delay.set(1E3, maybeDisable)
        }
        ;
        NativeScrollbars.prototype.clear = function() {
            var parent = this.horiz.parentNode;
            parent.removeChild(this.horiz);
            parent.removeChild(this.vert)
        }
        ;
        var NullScrollbars = function() {};
        NullScrollbars.prototype.update = function() {
            return {
                bottom: 0,
                right: 0
            }
        }
        ;
        NullScrollbars.prototype.setScrollLeft = function() {}
        ;
        NullScrollbars.prototype.setScrollTop = function() {}
        ;
        NullScrollbars.prototype.clear = function() {}
        ;
        function updateScrollbars(cm, measure) {
            if (!measure)
                measure = measureForScrollbars(cm);
            var startWidth = cm.display.barWidth
              , startHeight = cm.display.barHeight;
            updateScrollbarsInner(cm, measure);
            for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
                if (startWidth != cm.display.barWidth && cm.options.lineWrapping)
                    updateHeightsInViewport(cm);
                updateScrollbarsInner(cm, measureForScrollbars(cm));
                startWidth = cm.display.barWidth;
                startHeight = cm.display.barHeight
            }
        }
        function updateScrollbarsInner(cm, measure) {
            var d = cm.display;
            var sizes = d.scrollbars.update(measure);
            d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
            d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";
            d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent";
            if (sizes.right && sizes.bottom) {
                d.scrollbarFiller.style.display = "block";
                d.scrollbarFiller.style.height = sizes.bottom + "px";
                d.scrollbarFiller.style.width = sizes.right + "px"
            } else
                d.scrollbarFiller.style.display = "";
            if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
                d.gutterFiller.style.display = "block";
                d.gutterFiller.style.height = sizes.bottom + "px";
                d.gutterFiller.style.width = measure.gutterWidth + "px"
            } else
                d.gutterFiller.style.display = ""
        }
        var scrollbarModel = {
            "native": NativeScrollbars,
            "null": NullScrollbars
        };
        function initScrollbars(cm) {
            if (cm.display.scrollbars) {
                cm.display.scrollbars.clear();
                if (cm.display.scrollbars.addClass)
                    rmClass(cm.display.wrapper, cm.display.scrollbars.addClass)
            }
            cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](function(node) {
                cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller);
                on(node, "mousedown", function() {
                    if (cm.state.focused)
                        setTimeout(function() {
                            return cm.display.input.focus()
                        }, 0)
                });
                node.setAttribute("cm-not-content", "true")
            }
            ,function(pos, axis) {
                if (axis == "horizontal")
                    setScrollLeft(cm, pos);
                else
                    updateScrollTop(cm, pos)
            }
            ,cm);
            if (cm.display.scrollbars.addClass)
                addClass(cm.display.wrapper, cm.display.scrollbars.addClass)
        }
        var nextOpId = 0;
        function startOperation(cm) {
            cm.curOp = {
                cm: cm,
                viewChanged: false,
                startHeight: cm.doc.height,
                forceUpdate: false,
                updateInput: 0,
                typing: false,
                changeObjs: null,
                cursorActivityHandlers: null,
                cursorActivityCalled: 0,
                selectionChanged: false,
                updateMaxLine: false,
                scrollLeft: null,
                scrollTop: null,
                scrollToPos: null,
                focus: false,
                id: ++nextOpId,
                markArrays: null
            };
            pushOperation(cm.curOp)
        }
        function endOperation(cm) {
            var op = cm.curOp;
            if (op)
                finishOperation(op, function(group) {
                    for (var i = 0; i < group.ops.length; i++)
                        group.ops[i].cm.curOp = null;
                    endOperations(group)
                })
        }
        function endOperations(group) {
            var ops = group.ops;
            for (var i = 0; i < ops.length; i++)
                endOperation_R1(ops[i]);
            for (var i$1 = 0; i$1 < ops.length; i$1++)
                endOperation_W1(ops[i$1]);
            for (var i$2 = 0; i$2 < ops.length; i$2++)
                endOperation_R2(ops[i$2]);
            for (var i$3 = 0; i$3 < ops.length; i$3++)
                endOperation_W2(ops[i$3]);
            for (var i$4 = 0; i$4 < ops.length; i$4++)
                endOperation_finish(ops[i$4])
        }
        function endOperation_R1(op) {
            var cm = op.cm
              , display = cm.display;
            maybeClipScrollbars(cm);
            if (op.updateMaxLine)
                findMaxLine(cm);
            op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null || op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom || op.scrollToPos.to.line >= display.viewTo) || display.maxLineChanged && cm.options.lineWrapping;
            op.update = op.mustUpdate && new DisplayUpdate(cm,op.mustUpdate && {
                top: op.scrollTop,
                ensure: op.scrollToPos
            },op.forceUpdate)
        }
        function endOperation_W1(op) {
            op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update)
        }
        function endOperation_R2(op) {
            var cm = op.cm
              , display = cm.display;
            if (op.updatedDisplay)
                updateHeightsInViewport(cm);
            op.barMeasure = measureForScrollbars(cm);
            if (display.maxLineChanged && !cm.options.lineWrapping) {
                op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
                cm.display.sizerWidth = op.adjustWidthTo;
                op.barMeasure.scrollWidth = Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
                op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm))
            }
            if (op.updatedDisplay || op.selectionChanged)
                op.preparedSelection = display.input.prepareSelection()
        }
        function endOperation_W2(op) {
            var cm = op.cm;
            if (op.adjustWidthTo != null) {
                cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";
                if (op.maxScrollLeft < cm.doc.scrollLeft)
                    setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true);
                cm.display.maxLineChanged = false
            }
            var takeFocus = op.focus && op.focus == activeElt();
            if (op.preparedSelection)
                cm.display.input.showSelection(op.preparedSelection, takeFocus);
            if (op.updatedDisplay || op.startHeight != cm.doc.height)
                updateScrollbars(cm, op.barMeasure);
            if (op.updatedDisplay)
                setDocumentHeight(cm, op.barMeasure);
            if (op.selectionChanged)
                restartBlink(cm);
            if (cm.state.focused && op.updateInput)
                cm.display.input.reset(op.typing);
            if (takeFocus)
                ensureFocus(op.cm)
        }
        function endOperation_finish(op) {
            var cm = op.cm
              , display = cm.display
              , doc = cm.doc;
            if (op.updatedDisplay)
                postUpdateDisplay(cm, op.update);
            if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos))
                display.wheelStartX = display.wheelStartY = null;
            if (op.scrollTop != null)
                setScrollTop(cm, op.scrollTop, op.forceScroll);
            if (op.scrollLeft != null)
                setScrollLeft(cm, op.scrollLeft, true, true);
            if (op.scrollToPos) {
                var rect = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from), clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
                maybeScrollWindow(cm, rect)
            }
            var hidden = op.maybeHiddenMarkers
              , unhidden = op.maybeUnhiddenMarkers;
            if (hidden)
                for (var i = 0; i < hidden.length; ++i)
                    if (!hidden[i].lines.length)
                        signal(hidden[i], "hide");
            if (unhidden)
                for (var i$1 = 0; i$1 < unhidden.length; ++i$1)
                    if (unhidden[i$1].lines.length)
                        signal(unhidden[i$1], "unhide");
            if (display.wrapper.offsetHeight)
                doc.scrollTop = cm.display.scroller.scrollTop;
            if (op.changeObjs)
                signal(cm, "changes", cm, op.changeObjs);
            if (op.update)
                op.update.finish()
        }
        function runInOp(cm, f) {
            if (cm.curOp)
                return f();
            startOperation(cm);
            try {
                return f()
            } finally {
                endOperation(cm)
            }
        }
        function operation(cm, f) {
            return function() {
                if (cm.curOp)
                    return f.apply(cm, arguments);
                startOperation(cm);
                try {
                    return f.apply(cm, arguments)
                } finally {
                    endOperation(cm)
                }
            }
        }
        function methodOp(f) {
            return function() {
                if (this.curOp)
                    return f.apply(this, arguments);
                startOperation(this);
                try {
                    return f.apply(this, arguments)
                } finally {
                    endOperation(this)
                }
            }
        }
        function docMethodOp(f) {
            return function() {
                var cm = this.cm;
                if (!cm || cm.curOp)
                    return f.apply(this, arguments);
                startOperation(cm);
                try {
                    return f.apply(this, arguments)
                } finally {
                    endOperation(cm)
                }
            }
        }
        function startWorker(cm, time) {
            if (cm.doc.highlightFrontier < cm.display.viewTo)
                cm.state.highlight.set(time, bind(highlightWorker, cm))
        }
        function highlightWorker(cm) {
            var doc = cm.doc;
            if (doc.highlightFrontier >= cm.display.viewTo)
                return;
            var end = +new Date + cm.options.workTime;
            var context = getContextBefore(cm, doc.highlightFrontier);
            var changedLines = [];
            doc.iter(context.line, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function(line) {
                if (context.line >= cm.display.viewFrom) {
                    var oldStyles = line.styles;
                    var resetState = line.text.length > cm.options.maxHighlightLength ? copyState(doc.mode, context.state) : null;
                    var highlighted = highlightLine(cm, line, context, true);
                    if (resetState)
                        context.state = resetState;
                    line.styles = highlighted.styles;
                    var oldCls = line.styleClasses
                      , newCls = highlighted.classes;
                    if (newCls)
                        line.styleClasses = newCls;
                    else if (oldCls)
                        line.styleClasses = null;
                    var ischange = !oldStyles || oldStyles.length != line.styles.length || oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);
                    for (var i = 0; !ischange && i < oldStyles.length; ++i)
                        ischange = oldStyles[i] != line.styles[i];
                    if (ischange)
                        changedLines.push(context.line);
                    line.stateAfter = context.save();
                    context.nextLine()
                } else {
                    if (line.text.length <= cm.options.maxHighlightLength)
                        processLine(cm, line.text, context);
                    line.stateAfter = context.line % 5 == 0 ? context.save() : null;
                    context.nextLine()
                }
                if (+new Date > end) {
                    startWorker(cm, cm.options.workDelay);
                    return true
                }
            });
            doc.highlightFrontier = context.line;
            doc.modeFrontier = Math.max(doc.modeFrontier, context.line);
            if (changedLines.length)
                runInOp(cm, function() {
                    for (var i = 0; i < changedLines.length; i++)
                        regLineChange(cm, changedLines[i], "text")
                })
        }
        var DisplayUpdate = function(cm, viewport, force) {
            var display = cm.display;
            this.viewport = viewport;
            this.visible = visibleLines(display, cm.doc, viewport);
            this.editorIsHidden = !display.wrapper.offsetWidth;
            this.wrapperHeight = display.wrapper.clientHeight;
            this.wrapperWidth = display.wrapper.clientWidth;
            this.oldDisplayWidth = displayWidth(cm);
            this.force = force;
            this.dims = getDimensions(cm);
            this.events = []
        };
        DisplayUpdate.prototype.signal = function(emitter, type) {
            if (hasHandler(emitter, type))
                this.events.push(arguments)
        }
        ;
        DisplayUpdate.prototype.finish = function() {
            for (var i = 0; i < this.events.length; i++)
                signal.apply(null, this.events[i])
        }
        ;
        function maybeClipScrollbars(cm) {
            var display = cm.display;
            if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
                display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
                display.heightForcer.style.height = scrollGap(cm) + "px";
                display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
                display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
                display.scrollbarsClipped = true
            }
        }
        function selectionSnapshot(cm) {
            if (cm.hasFocus())
                return null;
            var active = activeElt();
            if (!active || !contains(cm.display.lineDiv, active))
                return null;
            var result = {
                activeElt: active
            };
            if (window.getSelection) {
                var sel = window.getSelection();
                if (sel.anchorNode && sel.extend && contains(cm.display.lineDiv, sel.anchorNode)) {
                    result.anchorNode = sel.anchorNode;
                    result.anchorOffset = sel.anchorOffset;
                    result.focusNode = sel.focusNode;
                    result.focusOffset = sel.focusOffset
                }
            }
            return result
        }
        function restoreSelection(snapshot) {
            if (!snapshot || !snapshot.activeElt || snapshot.activeElt == activeElt())
                return;
            snapshot.activeElt.focus();
            if (!/^(INPUT|TEXTAREA)$/.test(snapshot.activeElt.nodeName) && snapshot.anchorNode && contains(document.body, snapshot.anchorNode) && contains(document.body, snapshot.focusNode)) {
                var sel = window.getSelection()
                  , range = document.createRange();
                range.setEnd(snapshot.anchorNode, snapshot.anchorOffset);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
                sel.extend(snapshot.focusNode, snapshot.focusOffset)
            }
        }
        function updateDisplayIfNeeded(cm, update) {
            var display = cm.display
              , doc = cm.doc;
            if (update.editorIsHidden) {
                resetView(cm);
                return false
            }
            if (!update.force && update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) && display.renderedView == display.view && countDirtyView(cm) == 0)
                return false;
            if (maybeUpdateLineNumberWidth(cm)) {
                resetView(cm);
                update.dims = getDimensions(cm)
            }
            var end = doc.first + doc.size;
            var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
            var to = Math.min(end, update.visible.to + cm.options.viewportMargin);
            if (display.viewFrom < from && from - display.viewFrom < 20)
                from = Math.max(doc.first, display.viewFrom);
            if (display.viewTo > to && display.viewTo - to < 20)
                to = Math.min(end, display.viewTo);
            if (sawCollapsedSpans) {
                from = visualLineNo(cm.doc, from);
                to = visualLineEndNo(cm.doc, to)
            }
            var different = from != display.viewFrom || to != display.viewTo || display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
            adjustView(cm, from, to);
            display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
            cm.display.mover.style.top = display.viewOffset + "px";
            var toUpdate = countDirtyView(cm);
            if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo))
                return false;
            var selSnapshot = selectionSnapshot(cm);
            if (toUpdate > 4)
                display.lineDiv.style.display = "none";
            patchDisplay(cm, display.updateLineNumbers, update.dims);
            if (toUpdate > 4)
                display.lineDiv.style.display = "";
            display.renderedView = display.view;
            restoreSelection(selSnapshot);
            removeChildren(display.cursorDiv);
            removeChildren(display.selectionDiv);
            display.gutters.style.height = display.sizer.style.minHeight = 0;
            if (different) {
                display.lastWrapHeight = update.wrapperHeight;
                display.lastWrapWidth = update.wrapperWidth;
                startWorker(cm, 400)
            }
            display.updateLineNumbers = null;
            return true
        }
        function postUpdateDisplay(cm, update) {
            var viewport = update.viewport;
            for (var first = true; ; first = false) {
                if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
                    if (viewport && viewport.top != null)
                        viewport = {
                            top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)
                        };
                    update.visible = visibleLines(cm.display, cm.doc, viewport);
                    if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo)
                        break
                } else if (first)
                    update.visible = visibleLines(cm.display, cm.doc, viewport);
                if (!updateDisplayIfNeeded(cm, update))
                    break;
                updateHeightsInViewport(cm);
                var barMeasure = measureForScrollbars(cm);
                updateSelection(cm);
                updateScrollbars(cm, barMeasure);
                setDocumentHeight(cm, barMeasure);
                update.force = false
            }
            update.signal(cm, "update", cm);
            if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
                update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
                cm.display.reportedViewFrom = cm.display.viewFrom;
                cm.display.reportedViewTo = cm.display.viewTo
            }
        }
        function updateDisplaySimple(cm, viewport) {
            var update = new DisplayUpdate(cm,viewport);
            if (updateDisplayIfNeeded(cm, update)) {
                updateHeightsInViewport(cm);
                postUpdateDisplay(cm, update);
                var barMeasure = measureForScrollbars(cm);
                updateSelection(cm);
                updateScrollbars(cm, barMeasure);
                setDocumentHeight(cm, barMeasure);
                update.finish()
            }
        }
        function patchDisplay(cm, updateNumbersFrom, dims) {
            var display = cm.display
              , lineNumbers = cm.options.lineNumbers;
            var container = display.lineDiv
              , cur = container.firstChild;
            function rm(node) {
                var next = node.nextSibling;
                if (webkit && mac && cm.display.currentWheelTarget == node)
                    node.style.display = "none";
                else
                    node.parentNode.removeChild(node);
                return next
            }
            var view = display.view
              , lineN = display.viewFrom;
            for (var i = 0; i < view.length; i++) {
                var lineView = view[i];
                if (lineView.hidden)
                    ;
                else if (!lineView.node || lineView.node.parentNode != container) {
                    var node = buildLineElement(cm, lineView, lineN, dims);
                    container.insertBefore(node, cur)
                } else {
                    while (cur != lineView.node)
                        cur = rm(cur);
                    var updateNumber = lineNumbers && updateNumbersFrom != null && updateNumbersFrom <= lineN && lineView.lineNumber;
                    if (lineView.changes) {
                        if (indexOf(lineView.changes, "gutter") > -1)
                            updateNumber = false;
                        updateLineForChanges(cm, lineView, lineN, dims)
                    }
                    if (updateNumber) {
                        removeChildren(lineView.lineNumber);
                        lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)))
                    }
                    cur = lineView.node.nextSibling
                }
                lineN += lineView.size
            }
            while (cur)
                cur = rm(cur)
        }
        function updateGutterSpace(display) {
            var width = display.gutters.offsetWidth;
            display.sizer.style.marginLeft = width + "px";
            signalLater(display, "gutterChanged", display)
        }
        function setDocumentHeight(cm, measure) {
            cm.display.sizer.style.minHeight = measure.docHeight + "px";
            cm.display.heightForcer.style.top = measure.docHeight + "px";
            cm.display.gutters.style.height = measure.docHeight + cm.display.barHeight + scrollGap(cm) + "px"
        }
        function alignHorizontally(cm) {
            var display = cm.display
              , view = display.view;
            if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter))
                return;
            var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
            var gutterW = display.gutters.offsetWidth
              , left = comp + "px";
            for (var i = 0; i < view.length; i++)
                if (!view[i].hidden) {
                    if (cm.options.fixedGutter) {
                        if (view[i].gutter)
                            view[i].gutter.style.left = left;
                        if (view[i].gutterBackground)
                            view[i].gutterBackground.style.left = left
                    }
                    var align = view[i].alignable;
                    if (align)
                        for (var j = 0; j < align.length; j++)
                            align[j].style.left = left
                }
            if (cm.options.fixedGutter)
                display.gutters.style.left = comp + gutterW + "px"
        }
        function maybeUpdateLineNumberWidth(cm) {
            if (!cm.options.lineNumbers)
                return false;
            var doc = cm.doc
              , last = lineNumberFor(cm.options, doc.first + doc.size - 1)
              , display = cm.display;
            if (last.length != display.lineNumChars) {
                var test = display.measure.appendChild(elt("div", [elt("div", last)], "CodeMirror-linenumber CodeMirror-gutter-elt"));
                var innerW = test.firstChild.offsetWidth
                  , padding = test.offsetWidth - innerW;
                display.lineGutter.style.width = "";
                display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
                display.lineNumWidth = display.lineNumInnerWidth + padding;
                display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
                display.lineGutter.style.width = display.lineNumWidth + "px";
                updateGutterSpace(cm.display);
                return true
            }
            return false
        }
        function getGutters(gutters, lineNumbers) {
            var result = []
              , sawLineNumbers = false;
            for (var i = 0; i < gutters.length; i++) {
                var name = gutters[i]
                  , style = null;
                if (typeof name != "string") {
                    style = name.style;
                    name = name.className
                }
                if (name == "CodeMirror-linenumbers")
                    if (!lineNumbers)
                        continue;
                    else
                        sawLineNumbers = true;
                result.push({
                    className: name,
                    style: style
                })
            }
            if (lineNumbers && !sawLineNumbers)
                result.push({
                    className: "CodeMirror-linenumbers",
                    style: null
                });
            return result
        }
        function renderGutters(display) {
            var gutters = display.gutters
              , specs = display.gutterSpecs;
            removeChildren(gutters);
            display.lineGutter = null;
            for (var i = 0; i < specs.length; ++i) {
                var ref = specs[i];
                var className = ref.className;
                var style = ref.style;
                var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + className));
                if (style)
                    gElt.style.cssText = style;
                if (className == "CodeMirror-linenumbers") {
                    display.lineGutter = gElt;
                    gElt.style.width = (display.lineNumWidth || 1) + "px"
                }
            }
            gutters.style.display = specs.length ? "" : "none";
            updateGutterSpace(display)
        }
        function updateGutters(cm) {
            renderGutters(cm.display);
            regChange(cm);
            alignHorizontally(cm)
        }
        function Display(place, doc, input, options) {
            var d = this;
            this.input = input;
            d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
            d.scrollbarFiller.setAttribute("cm-not-content", "true");
            d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
            d.gutterFiller.setAttribute("cm-not-content", "true");
            d.lineDiv = eltP("div", null, "CodeMirror-code");
            d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
            d.cursorDiv = elt("div", null, "CodeMirror-cursors");
            d.measure = elt("div", null, "CodeMirror-measure");
            d.lineMeasure = elt("div", null, "CodeMirror-measure");
            d.lineSpace = eltP("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv], null, "position: relative; outline: none");
            var lines = eltP("div", [d.lineSpace], "CodeMirror-lines");
            d.mover = elt("div", [lines], null, "position: relative");
            d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
            d.sizerWidth = null;
            d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;");
            d.gutters = elt("div", null, "CodeMirror-gutters");
            d.lineGutter = null;
            d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
            d.scroller.setAttribute("tabIndex", "-1");
            d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");
            d.wrapper.setAttribute("translate", "no");
            if (ie && ie_version < 8) {
                d.gutters.style.zIndex = -1;
                d.scroller.style.paddingRight = 0
            }
            if (!webkit && !(gecko && mobile))
                d.scroller.draggable = true;
            if (place)
                if (place.appendChild)
                    place.appendChild(d.wrapper);
                else
                    place(d.wrapper);
            d.viewFrom = d.viewTo = doc.first;
            d.reportedViewFrom = d.reportedViewTo = doc.first;
            d.view = [];
            d.renderedView = null;
            d.externalMeasured = null;
            d.viewOffset = 0;
            d.lastWrapHeight = d.lastWrapWidth = 0;
            d.updateLineNumbers = null;
            d.nativeBarWidth = d.barHeight = d.barWidth = 0;
            d.scrollbarsClipped = false;
            d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
            d.alignWidgets = false;
            d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
            d.maxLine = null;
            d.maxLineLength = 0;
            d.maxLineChanged = false;
            d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;
            d.shift = false;
            d.selForContextMenu = null;
            d.activeTouch = null;
            d.gutterSpecs = getGutters(options.gutters, options.lineNumbers);
            renderGutters(d);
            input.init(d)
        }
        var wheelSamples = 0
          , wheelPixelsPerUnit = null;
        if (ie)
            wheelPixelsPerUnit = -.53;
        else if (gecko)
            wheelPixelsPerUnit = 15;
        else if (chrome)
            wheelPixelsPerUnit = -.7;
        else if (safari)
            wheelPixelsPerUnit = -1 / 3;
        function wheelEventDelta(e) {
            var dx = e.wheelDeltaX
              , dy = e.wheelDeltaY;
            if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS)
                dx = e.detail;
            if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS)
                dy = e.detail;
            else if (dy == null)
                dy = e.wheelDelta;
            return {
                x: dx,
                y: dy
            }
        }
        function wheelEventPixels(e) {
            var delta = wheelEventDelta(e);
            delta.x *= wheelPixelsPerUnit;
            delta.y *= wheelPixelsPerUnit;
            return delta
        }
        function onScrollWheel(cm, e) {
            if (chrome && chrome_version == 102) {
                if (cm.display.chromeScrollHack == null)
                    cm.display.sizer.style.pointerEvents = "none";
                else
                    clearTimeout(cm.display.chromeScrollHack);
                cm.display.chromeScrollHack = setTimeout(function() {
                    cm.display.chromeScrollHack = null;
                    cm.display.sizer.style.pointerEvents = ""
                }, 100)
            }
            var delta = wheelEventDelta(e)
              , dx = delta.x
              , dy = delta.y;
            var pixelsPerUnit = wheelPixelsPerUnit;
            if (e.deltaMode === 0) {
                dx = e.deltaX;
                dy = e.deltaY;
                pixelsPerUnit = 1
            }
            var display = cm.display
              , scroll = display.scroller;
            var canScrollX = scroll.scrollWidth > scroll.clientWidth;
            var canScrollY = scroll.scrollHeight > scroll.clientHeight;
            if (!(dx && canScrollX || dy && canScrollY))
                return;
            if (dy && mac && webkit)
                outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode)
                    for (var i = 0; i < view.length; i++)
                        if (view[i].node == cur) {
                            cm.display.currentWheelTarget = cur;
                            break outer
                        }
            if (dx && !gecko && !presto && pixelsPerUnit != null) {
                if (dy && canScrollY)
                    updateScrollTop(cm, Math.max(0, scroll.scrollTop + dy * pixelsPerUnit));
                setScrollLeft(cm, Math.max(0, scroll.scrollLeft + dx * pixelsPerUnit));
                if (!dy || dy && canScrollY)
                    e_preventDefault(e);
                display.wheelStartX = null;
                return
            }
            if (dy && pixelsPerUnit != null) {
                var pixels = dy * pixelsPerUnit;
                var top = cm.doc.scrollTop
                  , bot = top + display.wrapper.clientHeight;
                if (pixels < 0)
                    top = Math.max(0, top + pixels - 50);
                else
                    bot = Math.min(cm.doc.height, bot + pixels + 50);
                updateDisplaySimple(cm, {
                    top: top,
                    bottom: bot
                })
            }
            if (wheelSamples < 20 && e.deltaMode !== 0)
                if (display.wheelStartX == null) {
                    display.wheelStartX = scroll.scrollLeft;
                    display.wheelStartY = scroll.scrollTop;
                    display.wheelDX = dx;
                    display.wheelDY = dy;
                    setTimeout(function() {
                        if (display.wheelStartX == null)
                            return;
                        var movedX = scroll.scrollLeft - display.wheelStartX;
                        var movedY = scroll.scrollTop - display.wheelStartY;
                        var sample = movedY && display.wheelDY && movedY / display.wheelDY || movedX && display.wheelDX && movedX / display.wheelDX;
                        display.wheelStartX = display.wheelStartY = null;
                        if (!sample)
                            return;
                        wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
                        ++wheelSamples
                    }, 200)
                } else {
                    display.wheelDX += dx;
                    display.wheelDY += dy
                }
        }
        var Selection = function(ranges, primIndex) {
            this.ranges = ranges;
            this.primIndex = primIndex
        };
        Selection.prototype.primary = function() {
            return this.ranges[this.primIndex]
        }
        ;
        Selection.prototype.equals = function(other) {
            if (other == this)
                return true;
            if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length)
                return false;
            for (var i = 0; i < this.ranges.length; i++) {
                var here = this.ranges[i]
                  , there = other.ranges[i];
                if (!equalCursorPos(here.anchor, there.anchor) || !equalCursorPos(here.head, there.head))
                    return false
            }
            return true
        }
        ;
        Selection.prototype.deepCopy = function() {
            var out = [];
            for (var i = 0; i < this.ranges.length; i++)
                out[i] = new Range(copyPos(this.ranges[i].anchor),copyPos(this.ranges[i].head));
            return new Selection(out,this.primIndex)
        }
        ;
        Selection.prototype.somethingSelected = function() {
            for (var i = 0; i < this.ranges.length; i++)
                if (!this.ranges[i].empty())
                    return true;
            return false
        }
        ;
        Selection.prototype.contains = function(pos, end) {
            if (!end)
                end = pos;
            for (var i = 0; i < this.ranges.length; i++) {
                var range = this.ranges[i];
                if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0)
                    return i
            }
            return -1
        }
        ;
        var Range = function(anchor, head) {
            this.anchor = anchor;
            this.head = head
        };
        Range.prototype.from = function() {
            return minPos(this.anchor, this.head)
        }
        ;
        Range.prototype.to = function() {
            return maxPos(this.anchor, this.head)
        }
        ;
        Range.prototype.empty = function() {
            return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch
        }
        ;
        function normalizeSelection(cm, ranges, primIndex) {
            var mayTouch = cm && cm.options.selectionsMayTouch;
            var prim = ranges[primIndex];
            ranges.sort(function(a, b) {
                return cmp(a.from(), b.from())
            });
            primIndex = indexOf(ranges, prim);
            for (var i = 1; i < ranges.length; i++) {
                var cur = ranges[i]
                  , prev = ranges[i - 1];
                var diff = cmp(prev.to(), cur.from());
                if (mayTouch && !cur.empty() ? diff > 0 : diff >= 0) {
                    var from = minPos(prev.from(), cur.from())
                      , to = maxPos(prev.to(), cur.to());
                    var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
                    if (i <= primIndex)
                        --primIndex;
                    ranges.splice(--i, 2, new Range(inv ? to : from,inv ? from : to))
                }
            }
            return new Selection(ranges,primIndex)
        }
        function simpleSelection(anchor, head) {
            return new Selection([new Range(anchor,head || anchor)],0)
        }
        function changeEnd(change) {
            if (!change.text)
                return change.to;
            return Pos(change.from.line + change.text.length - 1, lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0))
        }
        function adjustForChange(pos, change) {
            if (cmp(pos, change.from) < 0)
                return pos;
            if (cmp(pos, change.to) <= 0)
                return changeEnd(change);
            var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1
              , ch = pos.ch;
            if (pos.line == change.to.line)
                ch += changeEnd(change).ch - change.to.ch;
            return Pos(line, ch)
        }
        function computeSelAfterChange(doc, change) {
            var out = [];
            for (var i = 0; i < doc.sel.ranges.length; i++) {
                var range = doc.sel.ranges[i];
                out.push(new Range(adjustForChange(range.anchor, change),adjustForChange(range.head, change)))
            }
            return normalizeSelection(doc.cm, out, doc.sel.primIndex)
        }
        function offsetPos(pos, old, nw) {
            if (pos.line == old.line)
                return Pos(nw.line, pos.ch - old.ch + nw.ch);
            else
                return Pos(nw.line + (pos.line - old.line), pos.ch)
        }
        function computeReplacedSel(doc, changes, hint) {
            var out = [];
            var oldPrev = Pos(doc.first, 0)
              , newPrev = oldPrev;
            for (var i = 0; i < changes.length; i++) {
                var change = changes[i];
                var from = offsetPos(change.from, oldPrev, newPrev);
                var to = offsetPos(changeEnd(change), oldPrev, newPrev);
                oldPrev = change.to;
                newPrev = to;
                if (hint == "around") {
                    var range = doc.sel.ranges[i]
                      , inv = cmp(range.head, range.anchor) < 0;
                    out[i] = new Range(inv ? to : from,inv ? from : to)
                } else
                    out[i] = new Range(from,from)
            }
            return new Selection(out,doc.sel.primIndex)
        }
        function loadMode(cm) {
            cm.doc.mode = getMode(cm.options, cm.doc.modeOption);
            resetModeState(cm)
        }
        function resetModeState(cm) {
            cm.doc.iter(function(line) {
                if (line.stateAfter)
                    line.stateAfter = null;
                if (line.styles)
                    line.styles = null
            });
            cm.doc.modeFrontier = cm.doc.highlightFrontier = cm.doc.first;
            startWorker(cm, 100);
            cm.state.modeGen++;
            if (cm.curOp)
                regChange(cm)
        }
        function isWholeLineUpdate(doc, change) {
            return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" && (!doc.cm || doc.cm.options.wholeLineUpdateBefore)
        }
        function updateDoc(doc, change, markedSpans, estimateHeight) {
            function spansFor(n) {
                return markedSpans ? markedSpans[n] : null
            }
            function update(line, text, spans) {
                updateLine(line, text, spans, estimateHeight);
                signalLater(line, "change", line, change)
            }
            function linesFor(start, end) {
                var result = [];
                for (var i = start; i < end; ++i)
                    result.push(new Line(text[i],spansFor(i),estimateHeight));
                return result
            }
            var from = change.from
              , to = change.to
              , text = change.text;
            var firstLine = getLine(doc, from.line)
              , lastLine = getLine(doc, to.line);
            var lastText = lst(text)
              , lastSpans = spansFor(text.length - 1)
              , nlines = to.line - from.line;
            if (change.full) {
                doc.insert(0, linesFor(0, text.length));
                doc.remove(text.length, doc.size - text.length)
            } else if (isWholeLineUpdate(doc, change)) {
                var added = linesFor(0, text.length - 1);
                update(lastLine, lastLine.text, lastSpans);
                if (nlines)
                    doc.remove(from.line, nlines);
                if (added.length)
                    doc.insert(from.line, added)
            } else if (firstLine == lastLine)
                if (text.length == 1)
                    update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
                else {
                    var added$1 = linesFor(1, text.length - 1);
                    added$1.push(new Line(lastText + firstLine.text.slice(to.ch),lastSpans,estimateHeight));
                    update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
                    doc.insert(from.line + 1, added$1)
                }
            else if (text.length == 1) {
                update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
                doc.remove(from.line + 1, nlines)
            } else {
                update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
                update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
                var added$2 = linesFor(1, text.length - 1);
                if (nlines > 1)
                    doc.remove(from.line + 1, nlines - 1);
                doc.insert(from.line + 1, added$2)
            }
            signalLater(doc, "change", doc, change)
        }
        function linkedDocs(doc, f, sharedHistOnly) {
            function propagate(doc, skip, sharedHist) {
                if (doc.linked)
                    for (var i = 0; i < doc.linked.length; ++i) {
                        var rel = doc.linked[i];
                        if (rel.doc == skip)
                            continue;
                        var shared = sharedHist && rel.sharedHist;
                        if (sharedHistOnly && !shared)
                            continue;
                        f(rel.doc, shared);
                        propagate(rel.doc, doc, shared)
                    }
            }
            propagate(doc, null, true)
        }
        function attachDoc(cm, doc) {
            if (doc.cm)
                throw new Error("This document is already in use.");
            cm.doc = doc;
            doc.cm = cm;
            estimateLineHeights(cm);
            loadMode(cm);
            setDirectionClass(cm);
            cm.options.direction = doc.direction;
            if (!cm.options.lineWrapping)
                findMaxLine(cm);
            cm.options.mode = doc.modeOption;
            regChange(cm)
        }
        function setDirectionClass(cm) {
            (cm.doc.direction == "rtl" ? addClass : rmClass)(cm.display.lineDiv, "CodeMirror-rtl")
        }
        function directionChanged(cm) {
            runInOp(cm, function() {
                setDirectionClass(cm);
                regChange(cm)
            })
        }
        function History(prev) {
            this.done = [];
            this.undone = [];
            this.undoDepth = prev ? prev.undoDepth : Infinity;
            this.lastModTime = this.lastSelTime = 0;
            this.lastOp = this.lastSelOp = null;
            this.lastOrigin = this.lastSelOrigin = null;
            this.generation = this.maxGeneration = prev ? prev.maxGeneration : 1
        }
        function historyChangeFromChange(doc, change) {
            var histChange = {
                from: copyPos(change.from),
                to: changeEnd(change),
                text: getBetween(doc, change.from, change.to)
            };
            attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
            linkedDocs(doc, function(doc) {
                return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1)
            }, true);
            return histChange
        }
        function clearSelectionEvents(array) {
            while (array.length) {
                var last = lst(array);
                if (last.ranges)
                    array.pop();
                else
                    break
            }
        }
        function lastChangeEvent(hist, force) {
            if (force) {
                clearSelectionEvents(hist.done);
                return lst(hist.done)
            } else if (hist.done.length && !lst(hist.done).ranges)
                return lst(hist.done);
            else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
                hist.done.pop();
                return lst(hist.done)
            }
        }
        function addChangeToHistory(doc, change, selAfter, opId) {
            var hist = doc.history;
            hist.undone.length = 0;
            var time = +new Date, cur;
            var last;
            if ((hist.lastOp == opId || hist.lastOrigin == change.origin && change.origin && (change.origin.charAt(0) == "+" && hist.lastModTime > time - (doc.cm ? doc.cm.options.historyEventDelay : 500) || change.origin.charAt(0) == "*")) && (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
                last = lst(cur.changes);
                if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0)
                    last.to = changeEnd(change);
                else
                    cur.changes.push(historyChangeFromChange(doc, change))
            } else {
                var before = lst(hist.done);
                if (!before || !before.ranges)
                    pushSelectionToHistory(doc.sel, hist.done);
                cur = {
                    changes: [historyChangeFromChange(doc, change)],
                    generation: hist.generation
                };
                hist.done.push(cur);
                while (hist.done.length > hist.undoDepth) {
                    hist.done.shift();
                    if (!hist.done[0].ranges)
                        hist.done.shift()
                }
            }
            hist.done.push(selAfter);
            hist.generation = ++hist.maxGeneration;
            hist.lastModTime = hist.lastSelTime = time;
            hist.lastOp = hist.lastSelOp = opId;
            hist.lastOrigin = hist.lastSelOrigin = change.origin;
            if (!last)
                signal(doc, "historyAdded")
        }
        function selectionEventCanBeMerged(doc, origin, prev, sel) {
            var ch = origin.charAt(0);
            return ch == "*" || ch == "+" && prev.ranges.length == sel.ranges.length && prev.somethingSelected() == sel.somethingSelected() && new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500)
        }
        function addSelectionToHistory(doc, sel, opId, options) {
            var hist = doc.history
              , origin = options && options.origin;
            if (opId == hist.lastSelOp || origin && hist.lastSelOrigin == origin && (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin || selectionEventCanBeMerged(doc, origin, lst(hist.done), sel)))
                hist.done[hist.done.length - 1] = sel;
            else
                pushSelectionToHistory(sel, hist.done);
            hist.lastSelTime = +new Date;
            hist.lastSelOrigin = origin;
            hist.lastSelOp = opId;
            if (options && options.clearRedo !== false)
                clearSelectionEvents(hist.undone)
        }
        function pushSelectionToHistory(sel, dest) {
            var top = lst(dest);
            if (!(top && top.ranges && top.equals(sel)))
                dest.push(sel)
        }
        function attachLocalSpans(doc, change, from, to) {
            var existing = change["spans_" + doc.id]
              , n = 0;
            doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function(line) {
                if (line.markedSpans)
                    (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans;
                ++n
            })
        }
        function removeClearedSpans(spans) {
            if (!spans)
                return null;
            var out;
            for (var i = 0; i < spans.length; ++i)
                if (spans[i].marker.explicitlyCleared) {
                    if (!out)
                        out = spans.slice(0, i)
                } else if (out)
                    out.push(spans[i]);
            return !out ? spans : out.length ? out : null
        }
        function getOldSpans(doc, change) {
            var found = change["spans_" + doc.id];
            if (!found)
                return null;
            var nw = [];
            for (var i = 0; i < change.text.length; ++i)
                nw.push(removeClearedSpans(found[i]));
            return nw
        }
        function mergeOldSpans(doc, change) {
            var old = getOldSpans(doc, change);
            var stretched = stretchSpansOverChange(doc, change);
            if (!old)
                return stretched;
            if (!stretched)
                return old;
            for (var i = 0; i < old.length; ++i) {
                var oldCur = old[i]
                  , stretchCur = stretched[i];
                if (oldCur && stretchCur)
                    spans: for (var j = 0; j < stretchCur.length; ++j) {
                        var span = stretchCur[j];
                        for (var k = 0; k < oldCur.length; ++k)
                            if (oldCur[k].marker == span.marker)
                                continue spans;
                        oldCur.push(span)
                    }
                else if (stretchCur)
                    old[i] = stretchCur
            }
            return old
        }
        function copyHistoryArray(events, newGroup, instantiateSel) {
            var copy = [];
            for (var i = 0; i < events.length; ++i) {
                var event = events[i];
                if (event.ranges) {
                    copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
                    continue
                }
                var changes = event.changes
                  , newChanges = [];
                copy.push({
                    changes: newChanges
                });
                for (var j = 0; j < changes.length; ++j) {
                    var change = changes[j]
                      , m = void 0;
                    newChanges.push({
                        from: change.from,
                        to: change.to,
                        text: change.text
                    });
                    if (newGroup)
                        for (var prop in change)
                            if (m = prop.match(/^spans_(\d+)$/))
                                if (indexOf(newGroup, Number(m[1])) > -1) {
                                    lst(newChanges)[prop] = change[prop];
                                    delete change[prop]
                                }
                }
            }
            return copy
        }
        function extendRange(range, head, other, extend) {
            if (extend) {
                var anchor = range.anchor;
                if (other) {
                    var posBefore = cmp(head, anchor) < 0;
                    if (posBefore != cmp(other, anchor) < 0) {
                        anchor = head;
                        head = other
                    } else if (posBefore != cmp(head, other) < 0)
                        head = other
                }
                return new Range(anchor,head)
            } else
                return new Range(other || head,head)
        }
        function extendSelection(doc, head, other, options, extend) {
            if (extend == null)
                extend = doc.cm && (doc.cm.display.shift || doc.extend);
            setSelection(doc, new Selection([extendRange(doc.sel.primary(), head, other, extend)],0), options)
        }
        function extendSelections(doc, heads, options) {
            var out = [];
            var extend = doc.cm && (doc.cm.display.shift || doc.extend);
            for (var i = 0; i < doc.sel.ranges.length; i++)
                out[i] = extendRange(doc.sel.ranges[i], heads[i], null, extend);
            var newSel = normalizeSelection(doc.cm, out, doc.sel.primIndex);
            setSelection(doc, newSel, options)
        }
        function replaceOneSelection(doc, i, range, options) {
            var ranges = doc.sel.ranges.slice(0);
            ranges[i] = range;
            setSelection(doc, normalizeSelection(doc.cm, ranges, doc.sel.primIndex), options)
        }
        function setSimpleSelection(doc, anchor, head, options) {
            setSelection(doc, simpleSelection(anchor, head), options)
        }
        function filterSelectionChange(doc, sel, options) {
            var obj = {
                ranges: sel.ranges,
                update: function(ranges) {
                    this.ranges = [];
                    for (var i = 0; i < ranges.length; i++)
                        this.ranges[i] = new Range(clipPos(doc, ranges[i].anchor),clipPos(doc, ranges[i].head))
                },
                origin: options && options.origin
            };
            signal(doc, "beforeSelectionChange", doc, obj);
            if (doc.cm)
                signal(doc.cm, "beforeSelectionChange", doc.cm, obj);
            if (obj.ranges != sel.ranges)
                return normalizeSelection(doc.cm, obj.ranges, obj.ranges.length - 1);
            else
                return sel
        }
        function setSelectionReplaceHistory(doc, sel, options) {
            var done = doc.history.done
              , last = lst(done);
            if (last && last.ranges) {
                done[done.length - 1] = sel;
                setSelectionNoUndo(doc, sel, options)
            } else
                setSelection(doc, sel, options)
        }
        function setSelection(doc, sel, options) {
            setSelectionNoUndo(doc, sel, options);
            addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options)
        }
        function setSelectionNoUndo(doc, sel, options) {
            if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange"))
                sel = filterSelectionChange(doc, sel, options);
            var bias = options && options.bias || (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
            setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));
            if (!(options && options.scroll === false) && doc.cm && doc.cm.getOption("readOnly") != "nocursor")
                ensureCursorVisible(doc.cm)
        }
        function setSelectionInner(doc, sel) {
            if (sel.equals(doc.sel))
                return;
            doc.sel = sel;
            if (doc.cm) {
                doc.cm.curOp.updateInput = 1;
                doc.cm.curOp.selectionChanged = true;
                signalCursorActivity(doc.cm)
            }
            signalLater(doc, "cursorActivity", doc)
        }
        function reCheckSelection(doc) {
            setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false))
        }
        function skipAtomicInSelection(doc, sel, bias, mayClear) {
            var out;
            for (var i = 0; i < sel.ranges.length; i++) {
                var range = sel.ranges[i];
                var old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i];
                var newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear);
                var newHead = range.head == range.anchor ? newAnchor : skipAtomic(doc, range.head, old && old.head, bias, mayClear);
                if (out || newAnchor != range.anchor || newHead != range.head) {
                    if (!out)
                        out = sel.ranges.slice(0, i);
                    out[i] = new Range(newAnchor,newHead)
                }
            }
            return out ? normalizeSelection(doc.cm, out, sel.primIndex) : sel
        }
        function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
            var line = getLine(doc, pos.line);
            if (line.markedSpans)
                for (var i = 0; i < line.markedSpans.length; ++i) {
                    var sp = line.markedSpans[i]
                      , m = sp.marker;
                    var preventCursorLeft = "selectLeft"in m ? !m.selectLeft : m.inclusiveLeft;
                    var preventCursorRight = "selectRight"in m ? !m.selectRight : m.inclusiveRight;
                    if ((sp.from == null || (preventCursorLeft ? sp.from <= pos.ch : sp.from < pos.ch)) && (sp.to == null || (preventCursorRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
                        if (mayClear) {
                            signal(m, "beforeCursorEnter");
                            if (m.explicitlyCleared)
                                if (!line.markedSpans)
                                    break;
                                else {
                                    --i;
                                    continue
                                }
                        }
                        if (!m.atomic)
                            continue;
                        if (oldPos) {
                            var near = m.find(dir < 0 ? 1 : -1)
                              , diff = void 0;
                            if (dir < 0 ? preventCursorRight : preventCursorLeft)
                                near = movePos(doc, near, -dir, near && near.line == pos.line ? line : null);
                            if (near && near.line == pos.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0))
                                return skipAtomicInner(doc, near, pos, dir, mayClear)
                        }
                        var far = m.find(dir < 0 ? -1 : 1);
                        if (dir < 0 ? preventCursorLeft : preventCursorRight)
                            far = movePos(doc, far, dir, far.line == pos.line ? line : null);
                        return far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null
                    }
                }
            return pos
        }
        function skipAtomic(doc, pos, oldPos, bias, mayClear) {
            var dir = bias || 1;
            var found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, dir, true) || skipAtomicInner(doc, pos, oldPos, -dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, -dir, true);
            if (!found) {
                doc.cantEdit = true;
                return Pos(doc.first, 0)
            }
            return found
        }
        function movePos(doc, pos, dir, line) {
            if (dir < 0 && pos.ch == 0)
                if (pos.line > doc.first)
                    return clipPos(doc, Pos(pos.line - 1));
                else
                    return null;
            else if (dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length)
                if (pos.line < doc.first + doc.size - 1)
                    return Pos(pos.line + 1, 0);
                else
                    return null;
            else
                return new Pos(pos.line,pos.ch + dir)
        }
        function selectAll(cm) {
            cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll)
        }
        function filterChange(doc, change, update) {
            var obj = {
                canceled: false,
                from: change.from,
                to: change.to,
                text: change.text,
                origin: change.origin,
                cancel: function() {
                    return obj.canceled = true
                }
            };
            if (update)
                obj.update = function(from, to, text, origin) {
                    if (from)
                        obj.from = clipPos(doc, from);
                    if (to)
                        obj.to = clipPos(doc, to);
                    if (text)
                        obj.text = text;
                    if (origin !== undefined)
                        obj.origin = origin
                }
                ;
            signal(doc, "beforeChange", doc, obj);
            if (doc.cm)
                signal(doc.cm, "beforeChange", doc.cm, obj);
            if (obj.canceled) {
                if (doc.cm)
                    doc.cm.curOp.updateInput = 2;
                return null
            }
            return {
                from: obj.from,
                to: obj.to,
                text: obj.text,
                origin: obj.origin
            }
        }
        function makeChange(doc, change, ignoreReadOnly) {
            if (doc.cm) {
                if (!doc.cm.curOp)
                    return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
                if (doc.cm.state.suppressEdits)
                    return
            }
            if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
                change = filterChange(doc, change, true);
                if (!change)
                    return
            }
            var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
            if (split)
                for (var i = split.length - 1; i >= 0; --i)
                    makeChangeInner(doc, {
                        from: split[i].from,
                        to: split[i].to,
                        text: i ? [""] : change.text,
                        origin: change.origin
                    });
            else
                makeChangeInner(doc, change)
        }
        function makeChangeInner(doc, change) {
            if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0)
                return;
            var selAfter = computeSelAfterChange(doc, change);
            addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);
            makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
            var rebased = [];
            linkedDocs(doc, function(doc, sharedHist) {
                if (!sharedHist && indexOf(rebased, doc.history) == -1) {
                    rebaseHist(doc.history, change);
                    rebased.push(doc.history)
                }
                makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change))
            })
        }
        function makeChangeFromHistory(doc, type, allowSelectionOnly) {
            var suppress = doc.cm && doc.cm.state.suppressEdits;
            if (suppress && !allowSelectionOnly)
                return;
            var hist = doc.history, event, selAfter = doc.sel;
            var source = type == "undo" ? hist.done : hist.undone
              , dest = type == "undo" ? hist.undone : hist.done;
            var i = 0;
            for (; i < source.length; i++) {
                event = source[i];
                if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges)
                    break
            }
            if (i == source.length)
                return;
            hist.lastOrigin = hist.lastSelOrigin = null;
            for (; ; ) {
                event = source.pop();
                if (event.ranges) {
                    pushSelectionToHistory(event, dest);
                    if (allowSelectionOnly && !event.equals(doc.sel)) {
                        setSelection(doc, event, {
                            clearRedo: false
                        });
                        return
                    }
                    selAfter = event
                } else if (suppress) {
                    source.push(event);
                    return
                } else
                    break
            }
            var antiChanges = [];
            pushSelectionToHistory(selAfter, dest);
            dest.push({
                changes: antiChanges,
                generation: hist.generation
            });
            hist.generation = event.generation || ++hist.maxGeneration;
            var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");
            var loop = function(i) {
                var change = event.changes[i];
                change.origin = type;
                if (filter && !filterChange(doc, change, false)) {
                    source.length = 0;
                    return {}
                }
                antiChanges.push(historyChangeFromChange(doc, change));
                var after = i ? computeSelAfterChange(doc, change) : lst(source);
                makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
                if (!i && doc.cm)
                    doc.cm.scrollIntoView({
                        from: change.from,
                        to: changeEnd(change)
                    });
                var rebased = [];
                linkedDocs(doc, function(doc, sharedHist) {
                    if (!sharedHist && indexOf(rebased, doc.history) == -1) {
                        rebaseHist(doc.history, change);
                        rebased.push(doc.history)
                    }
                    makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change))
                })
            };
            for (var i$1 = event.changes.length - 1; i$1 >= 0; --i$1) {
                var returned = loop(i$1);
                if (returned)
                    return returned.v
            }
        }
        function shiftDoc(doc, distance) {
            if (distance == 0)
                return;
            doc.first += distance;
            doc.sel = new Selection(map(doc.sel.ranges, function(range) {
                return new Range(Pos(range.anchor.line + distance, range.anchor.ch),Pos(range.head.line + distance, range.head.ch))
            }),doc.sel.primIndex);
            if (doc.cm) {
                regChange(doc.cm, doc.first, doc.first - distance, distance);
                for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++)
                    regLineChange(doc.cm, l, "gutter")
            }
        }
        function makeChangeSingleDoc(doc, change, selAfter, spans) {
            if (doc.cm && !doc.cm.curOp)
                return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans);
            if (change.to.line < doc.first) {
                shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
                return
            }
            if (change.from.line > doc.lastLine())
                return;
            if (change.from.line < doc.first) {
                var shift = change.text.length - 1 - (doc.first - change.from.line);
                shiftDoc(doc, shift);
                change = {
                    from: Pos(doc.first, 0),
                    to: Pos(change.to.line + shift, change.to.ch),
                    text: [lst(change.text)],
                    origin: change.origin
                }
            }
            var last = doc.lastLine();
            if (change.to.line > last)
                change = {
                    from: change.from,
                    to: Pos(last, getLine(doc, last).text.length),
                    text: [change.text[0]],
                    origin: change.origin
                };
            change.removed = getBetween(doc, change.from, change.to);
            if (!selAfter)
                selAfter = computeSelAfterChange(doc, change);
            if (doc.cm)
                makeChangeSingleDocInEditor(doc.cm, change, spans);
            else
                updateDoc(doc, change, spans);
            setSelectionNoUndo(doc, selAfter, sel_dontScroll);
            if (doc.cantEdit && skipAtomic(doc, Pos(doc.firstLine(), 0)))
                doc.cantEdit = false
        }
        function makeChangeSingleDocInEditor(cm, change, spans) {
            var doc = cm.doc
              , display = cm.display
              , from = change.from
              , to = change.to;
            var recomputeMaxLength = false
              , checkWidthStart = from.line;
            if (!cm.options.lineWrapping) {
                checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
                doc.iter(checkWidthStart, to.line + 1, function(line) {
                    if (line == display.maxLine) {
                        recomputeMaxLength = true;
                        return true
                    }
                })
            }
            if (doc.sel.contains(change.from, change.to) > -1)
                signalCursorActivity(cm);
            updateDoc(doc, change, spans, estimateHeight(cm));
            if (!cm.options.lineWrapping) {
                doc.iter(checkWidthStart, from.line + change.text.length, function(line) {
                    var len = lineLength(line);
                    if (len > display.maxLineLength) {
                        display.maxLine = line;
                        display.maxLineLength = len;
                        display.maxLineChanged = true;
                        recomputeMaxLength = false
                    }
                });
                if (recomputeMaxLength)
                    cm.curOp.updateMaxLine = true
            }
            retreatFrontier(doc, from.line);
            startWorker(cm, 400);
            var lendiff = change.text.length - (to.line - from.line) - 1;
            if (change.full)
                regChange(cm);
            else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change))
                regLineChange(cm, from.line, "text");
            else
                regChange(cm, from.line, to.line + 1, lendiff);
            var changesHandler = hasHandler(cm, "changes")
              , changeHandler = hasHandler(cm, "change");
            if (changeHandler || changesHandler) {
                var obj = {
                    from: from,
                    to: to,
                    text: change.text,
                    removed: change.removed,
                    origin: change.origin
                };
                if (changeHandler)
                    signalLater(cm, "change", cm, obj);
                if (changesHandler)
                    (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj)
            }
            cm.display.selForContextMenu = null
        }
        function replaceRange(doc, code, from, to, origin) {
            var assign;
            if (!to)
                to = from;
            if (cmp(to, from) < 0)
                assign = [to, from],
                from = assign[0],
                to = assign[1];
            if (typeof code == "string")
                code = doc.splitLines(code);
            makeChange(doc, {
                from: from,
                to: to,
                text: code,
                origin: origin
            })
        }
        function rebaseHistSelSingle(pos, from, to, diff) {
            if (to < pos.line)
                pos.line += diff;
            else if (from < pos.line) {
                pos.line = from;
                pos.ch = 0
            }
        }
        function rebaseHistArray(array, from, to, diff) {
            for (var i = 0; i < array.length; ++i) {
                var sub = array[i]
                  , ok = true;
                if (sub.ranges) {
                    if (!sub.copied) {
                        sub = array[i] = sub.deepCopy();
                        sub.copied = true
                    }
                    for (var j = 0; j < sub.ranges.length; j++) {
                        rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
                        rebaseHistSelSingle(sub.ranges[j].head, from, to, diff)
                    }
                    continue
                }
                for (var j$1 = 0; j$1 < sub.changes.length; ++j$1) {
                    var cur = sub.changes[j$1];
                    if (to < cur.from.line) {
                        cur.from = Pos(cur.from.line + diff, cur.from.ch);
                        cur.to = Pos(cur.to.line + diff, cur.to.ch)
                    } else if (from <= cur.to.line) {
                        ok = false;
                        break
                    }
                }
                if (!ok) {
                    array.splice(0, i + 1);
                    i = 0
                }
            }
        }
        function rebaseHist(hist, change) {
            var from = change.from.line
              , to = change.to.line
              , diff = change.text.length - (to - from) - 1;
            rebaseHistArray(hist.done, from, to, diff);
            rebaseHistArray(hist.undone, from, to, diff)
        }
        function changeLine(doc, handle, changeType, op) {
            var no = handle
              , line = handle;
            if (typeof handle == "number")
                line = getLine(doc, clipLine(doc, handle));
            else
                no = lineNo(handle);
            if (no == null)
                return null;
            if (op(line, no) && doc.cm)
                regLineChange(doc.cm, no, changeType);
            return line
        }
        function LeafChunk(lines) {
            this.lines = lines;
            this.parent = null;
            var height = 0;
            for (var i = 0; i < lines.length; ++i) {
                lines[i].parent = this;
                height += lines[i].height
            }
            this.height = height
        }
        LeafChunk.prototype = {
            chunkSize: function() {
                return this.lines.length
            },
            removeInner: function(at, n) {
                for (var i = at, e = at + n; i < e; ++i) {
                    var line = this.lines[i];
                    this.height -= line.height;
                    cleanUpLine(line);
                    signalLater(line, "delete")
                }
                this.lines.splice(at, n)
            },
            collapse: function(lines) {
                lines.push.apply(lines, this.lines)
            },
            insertInner: function(at, lines, height) {
                this.height += height;
                this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
                for (var i = 0; i < lines.length; ++i)
                    lines[i].parent = this
            },
            iterN: function(at, n, op) {
                for (var e = at + n; at < e; ++at)
                    if (op(this.lines[at]))
                        return true
            }
        };
        function BranchChunk(children) {
            this.children = children;
            var size = 0
              , height = 0;
            for (var i = 0; i < children.length; ++i) {
                var ch = children[i];
                size += ch.chunkSize();
                height += ch.height;
                ch.parent = this
            }
            this.size = size;
            this.height = height;
            this.parent = null
        }
        BranchChunk.prototype = {
            chunkSize: function() {
                return this.size
            },
            removeInner: function(at, n) {
                this.size -= n;
                for (var i = 0; i < this.children.length; ++i) {
                    var child = this.children[i]
                      , sz = child.chunkSize();
                    if (at < sz) {
                        var rm = Math.min(n, sz - at)
                          , oldHeight = child.height;
                        child.removeInner(at, rm);
                        this.height -= oldHeight - child.height;
                        if (sz == rm) {
                            this.children.splice(i--, 1);
                            child.parent = null
                        }
                        if ((n -= rm) == 0)
                            break;
                        at = 0
                    } else
                        at -= sz
                }
                if (this.size - n < 25 && (this.children.length > 1 || !(this.children[0]instanceof LeafChunk))) {
                    var lines = [];
                    this.collapse(lines);
                    this.children = [new LeafChunk(lines)];
                    this.children[0].parent = this
                }
            },
            collapse: function(lines) {
                for (var i = 0; i < this.children.length; ++i)
                    this.children[i].collapse(lines)
            },
            insertInner: function(at, lines, height) {
                this.size += lines.length;
                this.height += height;
                for (var i = 0; i < this.children.length; ++i) {
                    var child = this.children[i]
                      , sz = child.chunkSize();
                    if (at <= sz) {
                        child.insertInner(at, lines, height);
                        if (child.lines && child.lines.length > 50) {
                            var remaining = child.lines.length % 25 + 25;
                            for (var pos = remaining; pos < child.lines.length; ) {
                                var leaf = new LeafChunk(child.lines.slice(pos, pos += 25));
                                child.height -= leaf.height;
                                this.children.splice(++i, 0, leaf);
                                leaf.parent = this
                            }
                            child.lines = child.lines.slice(0, remaining);
                            this.maybeSpill()
                        }
                        break
                    }
                    at -= sz
                }
            },
            maybeSpill: function() {
                if (this.children.length <= 10)
                    return;
                var me = this;
                do {
                    var spilled = me.children.splice(me.children.length - 5, 5);
                    var sibling = new BranchChunk(spilled);
                    if (!me.parent) {
                        var copy = new BranchChunk(me.children);
                        copy.parent = me;
                        me.children = [copy, sibling];
                        me = copy
                    } else {
                        me.size -= sibling.size;
                        me.height -= sibling.height;
                        var myIndex = indexOf(me.parent.children, me);
                        me.parent.children.splice(myIndex + 1, 0, sibling)
                    }
                    sibling.parent = me.parent
                } while (me.children.length > 10);
                me.parent.maybeSpill()
            },
            iterN: function(at, n, op) {
                for (var i = 0; i < this.children.length; ++i) {
                    var child = this.children[i]
                      , sz = child.chunkSize();
                    if (at < sz) {
                        var used = Math.min(n, sz - at);
                        if (child.iterN(at, used, op))
                            return true;
                        if ((n -= used) == 0)
                            break;
                        at = 0
                    } else
                        at -= sz
                }
            }
        };
        var LineWidget = function(doc, node, options) {
            if (options)
                for (var opt in options)
                    if (options.hasOwnProperty(opt))
                        this[opt] = options[opt];
            this.doc = doc;
            this.node = node
        };
        LineWidget.prototype.clear = function() {
            var cm = this.doc.cm
              , ws = this.line.widgets
              , line = this.line
              , no = lineNo(line);
            if (no == null || !ws)
                return;
            for (var i = 0; i < ws.length; ++i)
                if (ws[i] == this)
                    ws.splice(i--, 1);
            if (!ws.length)
                line.widgets = null;
            var height = widgetHeight(this);
            updateLineHeight(line, Math.max(0, line.height - height));
            if (cm) {
                runInOp(cm, function() {
                    adjustScrollWhenAboveVisible(cm, line, -height);
                    regLineChange(cm, no, "widget")
                });
                signalLater(cm, "lineWidgetCleared", cm, this, no)
            }
        }
        ;
        LineWidget.prototype.changed = function() {
            var this$1 = this;
            var oldH = this.height
              , cm = this.doc.cm
              , line = this.line;
            this.height = null;
            var diff = widgetHeight(this) - oldH;
            if (!diff)
                return;
            if (!lineIsHidden(this.doc, line))
                updateLineHeight(line, line.height + diff);
            if (cm)
                runInOp(cm, function() {
                    cm.curOp.forceUpdate = true;
                    adjustScrollWhenAboveVisible(cm, line, diff);
                    signalLater(cm, "lineWidgetChanged", cm, this$1, lineNo(line))
                })
        }
        ;
        eventMixin(LineWidget);
        function adjustScrollWhenAboveVisible(cm, line, diff) {
            if (heightAtLine(line) < (cm.curOp && cm.curOp.scrollTop || cm.doc.scrollTop))
                addToScrollTop(cm, diff)
        }
        function addLineWidget(doc, handle, node, options) {
            var widget = new LineWidget(doc,node,options);
            var cm = doc.cm;
            if (cm && widget.noHScroll)
                cm.display.alignWidgets = true;
            changeLine(doc, handle, "widget", function(line) {
                var widgets = line.widgets || (line.widgets = []);
                if (widget.insertAt == null)
                    widgets.push(widget);
                else
                    widgets.splice(Math.min(widgets.length, Math.max(0, widget.insertAt)), 0, widget);
                widget.line = line;
                if (cm && !lineIsHidden(doc, line)) {
                    var aboveVisible = heightAtLine(line) < doc.scrollTop;
                    updateLineHeight(line, line.height + widgetHeight(widget));
                    if (aboveVisible)
                        addToScrollTop(cm, widget.height);
                    cm.curOp.forceUpdate = true
                }
                return true
            });
            if (cm)
                signalLater(cm, "lineWidgetAdded", cm, widget, typeof handle == "number" ? handle : lineNo(handle));
            return widget
        }
        var nextMarkerId = 0;
        var TextMarker = function(doc, type) {
            this.lines = [];
            this.type = type;
            this.doc = doc;
            this.id = ++nextMarkerId
        };
        TextMarker.prototype.clear = function() {
            if (this.explicitlyCleared)
                return;
            var cm = this.doc.cm
              , withOp = cm && !cm.curOp;
            if (withOp)
                startOperation(cm);
            if (hasHandler(this, "clear")) {
                var found = this.find();
                if (found)
                    signalLater(this, "clear", found.from, found.to)
            }
            var min = null
              , max = null;
            for (var i = 0; i < this.lines.length; ++i) {
                var line = this.lines[i];
                var span = getMarkedSpanFor(line.markedSpans, this);
                if (cm && !this.collapsed)
                    regLineChange(cm, lineNo(line), "text");
                else if (cm) {
                    if (span.to != null)
                        max = lineNo(line);
                    if (span.from != null)
                        min = lineNo(line)
                }
                line.markedSpans = removeMarkedSpan(line.markedSpans, span);
                if (span.from == null && this.collapsed && !lineIsHidden(this.doc, line) && cm)
                    updateLineHeight(line, textHeight(cm.display))
            }
            if (cm && this.collapsed && !cm.options.lineWrapping)
                for (var i$1 = 0; i$1 < this.lines.length; ++i$1) {
                    var visual = visualLine(this.lines[i$1])
                      , len = lineLength(visual);
                    if (len > cm.display.maxLineLength) {
                        cm.display.maxLine = visual;
                        cm.display.maxLineLength = len;
                        cm.display.maxLineChanged = true
                    }
                }
            if (min != null && cm && this.collapsed)
                regChange(cm, min, max + 1);
            this.lines.length = 0;
            this.explicitlyCleared = true;
            if (this.atomic && this.doc.cantEdit) {
                this.doc.cantEdit = false;
                if (cm)
                    reCheckSelection(cm.doc)
            }
            if (cm)
                signalLater(cm, "markerCleared", cm, this, min, max);
            if (withOp)
                endOperation(cm);
            if (this.parent)
                this.parent.clear()
        }
        ;
        TextMarker.prototype.find = function(side, lineObj) {
            if (side == null && this.type == "bookmark")
                side = 1;
            var from, to;
            for (var i = 0; i < this.lines.length; ++i) {
                var line = this.lines[i];
                var span = getMarkedSpanFor(line.markedSpans, this);
                if (span.from != null) {
                    from = Pos(lineObj ? line : lineNo(line), span.from);
                    if (side == -1)
                        return from
                }
                if (span.to != null) {
                    to = Pos(lineObj ? line : lineNo(line), span.to);
                    if (side == 1)
                        return to
                }
            }
            return from && {
                from: from,
                to: to
            }
        }
        ;
        TextMarker.prototype.changed = function() {
            var this$1 = this;
            var pos = this.find(-1, true)
              , widget = this
              , cm = this.doc.cm;
            if (!pos || !cm)
                return;
            runInOp(cm, function() {
                var line = pos.line
                  , lineN = lineNo(pos.line);
                var view = findViewForLine(cm, lineN);
                if (view) {
                    clearLineMeasurementCacheFor(view);
                    cm.curOp.selectionChanged = cm.curOp.forceUpdate = true
                }
                cm.curOp.updateMaxLine = true;
                if (!lineIsHidden(widget.doc, line) && widget.height != null) {
                    var oldHeight = widget.height;
                    widget.height = null;
                    var dHeight = widgetHeight(widget) - oldHeight;
                    if (dHeight)
                        updateLineHeight(line, line.height + dHeight)
                }
                signalLater(cm, "markerChanged", cm, this$1)
            })
        }
        ;
        TextMarker.prototype.attachLine = function(line) {
            if (!this.lines.length && this.doc.cm) {
                var op = this.doc.cm.curOp;
                if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1)
                    (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this)
            }
            this.lines.push(line)
        }
        ;
        TextMarker.prototype.detachLine = function(line) {
            this.lines.splice(indexOf(this.lines, line), 1);
            if (!this.lines.length && this.doc.cm) {
                var op = this.doc.cm.curOp;
                (op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this)
            }
        }
        ;
        eventMixin(TextMarker);
        function markText(doc, from, to, options, type) {
            if (options && options.shared)
                return markTextShared(doc, from, to, options, type);
            if (doc.cm && !doc.cm.curOp)
                return operation(doc.cm, markText)(doc, from, to, options, type);
            var marker = new TextMarker(doc,type)
              , diff = cmp(from, to);
            if (options)
                copyObj(options, marker, false);
            if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false)
                return marker;
            if (marker.replacedWith) {
                marker.collapsed = true;
                marker.widgetNode = eltP("span", [marker.replacedWith], "CodeMirror-widget");
                if (!options.handleMouseEvents)
                    marker.widgetNode.setAttribute("cm-ignore-events", "true");
                if (options.insertLeft)
                    marker.widgetNode.insertLeft = true
            }
            if (marker.collapsed) {
                if (conflictingCollapsedRange(doc, from.line, from, to, marker) || from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker))
                    throw new Error("Inserting collapsed marker partially overlapping an existing one");
                seeCollapsedSpans()
            }
            if (marker.addToHistory)
                addChangeToHistory(doc, {
                    from: from,
                    to: to,
                    origin: "markText"
                }, doc.sel, NaN);
            var curLine = from.line, cm = doc.cm, updateMaxLine;
            doc.iter(curLine, to.line + 1, function(line) {
                if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine)
                    updateMaxLine = true;
                if (marker.collapsed && curLine != from.line)
                    updateLineHeight(line, 0);
                addMarkedSpan(line, new MarkedSpan(marker,curLine == from.line ? from.ch : null,curLine == to.line ? to.ch : null), doc.cm && doc.cm.curOp);
                ++curLine
            });
            if (marker.collapsed)
                doc.iter(from.line, to.line + 1, function(line) {
                    if (lineIsHidden(doc, line))
                        updateLineHeight(line, 0)
                });
            if (marker.clearOnEnter)
                on(marker, "beforeCursorEnter", function() {
                    return marker.clear()
                });
            if (marker.readOnly) {
                seeReadOnlySpans();
                if (doc.history.done.length || doc.history.undone.length)
                    doc.clearHistory()
            }
            if (marker.collapsed) {
                marker.id = ++nextMarkerId;
                marker.atomic = true
            }
            if (cm) {
                if (updateMaxLine)
                    cm.curOp.updateMaxLine = true;
                if (marker.collapsed)
                    regChange(cm, from.line, to.line + 1);
                else if (marker.className || marker.startStyle || marker.endStyle || marker.css || marker.attributes || marker.title)
                    for (var i = from.line; i <= to.line; i++)
                        regLineChange(cm, i, "text");
                if (marker.atomic)
                    reCheckSelection(cm.doc);
                signalLater(cm, "markerAdded", cm, marker)
            }
            return marker
        }
        var SharedTextMarker = function(markers, primary) {
            this.markers = markers;
            this.primary = primary;
            for (var i = 0; i < markers.length; ++i)
                markers[i].parent = this
        };
        SharedTextMarker.prototype.clear = function() {
            if (this.explicitlyCleared)
                return;
            this.explicitlyCleared = true;
            for (var i = 0; i < this.markers.length; ++i)
                this.markers[i].clear();
            signalLater(this, "clear")
        }
        ;
        SharedTextMarker.prototype.find = function(side, lineObj) {
            return this.primary.find(side, lineObj)
        }
        ;
        eventMixin(SharedTextMarker);
        function markTextShared(doc, from, to, options, type) {
            options = copyObj(options);
            options.shared = false;
            var markers = [markText(doc, from, to, options, type)]
              , primary = markers[0];
            var widget = options.widgetNode;
            linkedDocs(doc, function(doc) {
                if (widget)
                    options.widgetNode = widget.cloneNode(true);
                markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
                for (var i = 0; i < doc.linked.length; ++i)
                    if (doc.linked[i].isParent)
                        return;
                primary = lst(markers)
            });
            return new SharedTextMarker(markers,primary)
        }
        function findSharedMarkers(doc) {
            return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), function(m) {
                return m.parent
            })
        }
        function copySharedMarkers(doc, markers) {
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i]
                  , pos = marker.find();
                var mFrom = doc.clipPos(pos.from)
                  , mTo = doc.clipPos(pos.to);
                if (cmp(mFrom, mTo)) {
                    var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
                    marker.markers.push(subMark);
                    subMark.parent = marker
                }
            }
        }
        function detachSharedMarkers(markers) {
            var loop = function(i) {
                var marker = markers[i]
                  , linked = [marker.primary.doc];
                linkedDocs(marker.primary.doc, function(d) {
                    return linked.push(d)
                });
                for (var j = 0; j < marker.markers.length; j++) {
                    var subMarker = marker.markers[j];
                    if (indexOf(linked, subMarker.doc) == -1) {
                        subMarker.parent = null;
                        marker.markers.splice(j--, 1)
                    }
                }
            };
            for (var i = 0; i < markers.length; i++)
                loop(i)
        }
        var nextDocId = 0;
        var Doc = function(text, mode, firstLine, lineSep, direction) {
            if (!(this instanceof Doc))
                return new Doc(text,mode,firstLine,lineSep,direction);
            if (firstLine == null)
                firstLine = 0;
            BranchChunk.call(this, [new LeafChunk([new Line("",null)])]);
            this.first = firstLine;
            this.scrollTop = this.scrollLeft = 0;
            this.cantEdit = false;
            this.cleanGeneration = 1;
            this.modeFrontier = this.highlightFrontier = firstLine;
            var start = Pos(firstLine, 0);
            this.sel = simpleSelection(start);
            this.history = new History(null);
            this.id = ++nextDocId;
            this.modeOption = mode;
            this.lineSep = lineSep;
            this.direction = direction == "rtl" ? "rtl" : "ltr";
            this.extend = false;
            if (typeof text == "string")
                text = this.splitLines(text);
            updateDoc(this, {
                from: start,
                to: start,
                text: text
            });
            setSelection(this, simpleSelection(start), sel_dontScroll)
        };
        Doc.prototype = createObj(BranchChunk.prototype, {
            constructor: Doc,
            iter: function(from, to, op) {
                if (op)
                    this.iterN(from - this.first, to - from, op);
                else
                    this.iterN(this.first, this.first + this.size, from)
            },
            insert: function(at, lines) {
                var height = 0;
                for (var i = 0; i < lines.length; ++i)
                    height += lines[i].height;
                this.insertInner(at - this.first, lines, height)
            },
            remove: function(at, n) {
                this.removeInner(at - this.first, n)
            },
            getValue: function(lineSep) {
                var lines = getLines(this, this.first, this.first + this.size);
                if (lineSep === false)
                    return lines;
                return lines.join(lineSep || this.lineSeparator())
            },
            setValue: docMethodOp(function(code) {
                var top = Pos(this.first, 0)
                  , last = this.first + this.size - 1;
                makeChange(this, {
                    from: top,
                    to: Pos(last, getLine(this, last).text.length),
                    text: this.splitLines(code),
                    origin: "setValue",
                    full: true
                }, true);
                if (this.cm)
                    scrollToCoords(this.cm, 0, 0);
                setSelection(this, simpleSelection(top), sel_dontScroll)
            }),
            replaceRange: function(code, from, to, origin) {
                from = clipPos(this, from);
                to = to ? clipPos(this, to) : from;
                replaceRange(this, code, from, to, origin)
            },
            getRange: function(from, to, lineSep) {
                var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
                if (lineSep === false)
                    return lines;
                if (lineSep === "")
                    return lines.join("");
                return lines.join(lineSep || this.lineSeparator())
            },
            getLine: function(line) {
                var l = this.getLineHandle(line);
                return l && l.text
            },
            getLineHandle: function(line) {
                if (isLine(this, line))
                    return getLine(this, line)
            },
            getLineNumber: function(line) {
                return lineNo(line)
            },
            getLineHandleVisualStart: function(line) {
                if (typeof line == "number")
                    line = getLine(this, line);
                return visualLine(line)
            },
            lineCount: function() {
                return this.size
            },
            firstLine: function() {
                return this.first
            },
            lastLine: function() {
                return this.first + this.size - 1
            },
            clipPos: function(pos) {
                return clipPos(this, pos)
            },
            getCursor: function(start) {
                var range = this.sel.primary(), pos;
                if (start == null || start == "head")
                    pos = range.head;
                else if (start == "anchor")
                    pos = range.anchor;
                else if (start == "end" || start == "to" || start === false)
                    pos = range.to();
                else
                    pos = range.from();
                return pos
            },
            listSelections: function() {
                return this.sel.ranges
            },
            somethingSelected: function() {
                return this.sel.somethingSelected()
            },
            setCursor: docMethodOp(function(line, ch, options) {
                setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options)
            }),
            setSelection: docMethodOp(function(anchor, head, options) {
                setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options)
            }),
            extendSelection: docMethodOp(function(head, other, options) {
                extendSelection(this, clipPos(this, head), other && clipPos(this, other), options)
            }),
            extendSelections: docMethodOp(function(heads, options) {
                extendSelections(this, clipPosArray(this, heads), options)
            }),
            extendSelectionsBy: docMethodOp(function(f, options) {
                var heads = map(this.sel.ranges, f);
                extendSelections(this, clipPosArray(this, heads), options)
            }),
            setSelections: docMethodOp(function(ranges, primary, options) {
                if (!ranges.length)
                    return;
                var out = [];
                for (var i = 0; i < ranges.length; i++)
                    out[i] = new Range(clipPos(this, ranges[i].anchor),clipPos(this, ranges[i].head || ranges[i].anchor));
                if (primary == null)
                    primary = Math.min(ranges.length - 1, this.sel.primIndex);
                setSelection(this, normalizeSelection(this.cm, out, primary), options)
            }),
            addSelection: docMethodOp(function(anchor, head, options) {
                var ranges = this.sel.ranges.slice(0);
                ranges.push(new Range(clipPos(this, anchor),clipPos(this, head || anchor)));
                setSelection(this, normalizeSelection(this.cm, ranges, ranges.length - 1), options)
            }),
            getSelection: function(lineSep) {
                var ranges = this.sel.ranges, lines;
                for (var i = 0; i < ranges.length; i++) {
                    var sel = getBetween(this, ranges[i].from(), ranges[i].to());
                    lines = lines ? lines.concat(sel) : sel
                }
                if (lineSep === false)
                    return lines;
                else
                    return lines.join(lineSep || this.lineSeparator())
            },
            getSelections: function(lineSep) {
                var parts = []
                  , ranges = this.sel.ranges;
                for (var i = 0; i < ranges.length; i++) {
                    var sel = getBetween(this, ranges[i].from(), ranges[i].to());
                    if (lineSep !== false)
                        sel = sel.join(lineSep || this.lineSeparator());
                    parts[i] = sel
                }
                return parts
            },
            replaceSelection: function(code, collapse, origin) {
                var dup = [];
                for (var i = 0; i < this.sel.ranges.length; i++)
                    dup[i] = code;
                this.replaceSelections(dup, collapse, origin || "+input")
            },
            replaceSelections: docMethodOp(function(code, collapse, origin) {
                var changes = []
                  , sel = this.sel;
                for (var i = 0; i < sel.ranges.length; i++) {
                    var range = sel.ranges[i];
                    changes[i] = {
                        from: range.from(),
                        to: range.to(),
                        text: this.splitLines(code[i]),
                        origin: origin
                    }
                }
                var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);
                for (var i$1 = changes.length - 1; i$1 >= 0; i$1--)
                    makeChange(this, changes[i$1]);
                if (newSel)
                    setSelectionReplaceHistory(this, newSel);
                else if (this.cm)
                    ensureCursorVisible(this.cm)
            }),
            undo: docMethodOp(function() {
                makeChangeFromHistory(this, "undo")
            }),
            redo: docMethodOp(function() {
                makeChangeFromHistory(this, "redo")
            }),
            undoSelection: docMethodOp(function() {
                makeChangeFromHistory(this, "undo", true)
            }),
            redoSelection: docMethodOp(function() {
                makeChangeFromHistory(this, "redo", true)
            }),
            setExtending: function(val) {
                this.extend = val
            },
            getExtending: function() {
                return this.extend
            },
            historySize: function() {
                var hist = this.history
                  , done = 0
                  , undone = 0;
                for (var i = 0; i < hist.done.length; i++)
                    if (!hist.done[i].ranges)
                        ++done;
                for (var i$1 = 0; i$1 < hist.undone.length; i$1++)
                    if (!hist.undone[i$1].ranges)
                        ++undone;
                return {
                    undo: done,
                    redo: undone
                }
            },
            clearHistory: function() {
                var this$1 = this;
                this.history = new History(this.history);
                linkedDocs(this, function(doc) {
                    return doc.history = this$1.history
                }, true)
            },
            markClean: function() {
                this.cleanGeneration = this.changeGeneration(true)
            },
            changeGeneration: function(forceSplit) {
                if (forceSplit)
                    this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null;
                return this.history.generation
            },
            isClean: function(gen) {
                return this.history.generation == (gen || this.cleanGeneration)
            },
            getHistory: function() {
                return {
                    done: copyHistoryArray(this.history.done),
                    undone: copyHistoryArray(this.history.undone)
                }
            },
            setHistory: function(histData) {
                var hist = this.history = new History(this.history);
                hist.done = copyHistoryArray(histData.done.slice(0), null, true);
                hist.undone = copyHistoryArray(histData.undone.slice(0), null, true)
            },
            setGutterMarker: docMethodOp(function(line, gutterID, value) {
                return changeLine(this, line, "gutter", function(line) {
                    var markers = line.gutterMarkers || (line.gutterMarkers = {});
                    markers[gutterID] = value;
                    if (!value && isEmpty(markers))
                        line.gutterMarkers = null;
                    return true
                })
            }),
            clearGutter: docMethodOp(function(gutterID) {
                var this$1 = this;
                this.iter(function(line) {
                    if (line.gutterMarkers && line.gutterMarkers[gutterID])
                        changeLine(this$1, line, "gutter", function() {
                            line.gutterMarkers[gutterID] = null;
                            if (isEmpty(line.gutterMarkers))
                                line.gutterMarkers = null;
                            return true
                        })
                })
            }),
            lineInfo: function(line) {
                var n;
                if (typeof line == "number") {
                    if (!isLine(this, line))
                        return null;
                    n = line;
                    line = getLine(this, line);
                    if (!line)
                        return null
                } else {
                    n = lineNo(line);
                    if (n == null)
                        return null
                }
                return {
                    line: n,
                    handle: line,
                    text: line.text,
                    gutterMarkers: line.gutterMarkers,
                    textClass: line.textClass,
                    bgClass: line.bgClass,
                    wrapClass: line.wrapClass,
                    widgets: line.widgets
                }
            },
            addLineClass: docMethodOp(function(handle, where, cls) {
                return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function(line) {
                    var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";
                    if (!line[prop])
                        line[prop] = cls;
                    else if (classTest(cls).test(line[prop]))
                        return false;
                    else
                        line[prop] += " " + cls;
                    return true
                })
            }),
            removeLineClass: docMethodOp(function(handle, where, cls) {
                return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function(line) {
                    var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";
                    var cur = line[prop];
                    if (!cur)
                        return false;
                    else if (cls == null)
                        line[prop] = null;
                    else {
                        var found = cur.match(classTest(cls));
                        if (!found)
                            return false;
                        var end = found.index + found[0].length;
                        line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null
                    }
                    return true
                })
            }),
            addLineWidget: docMethodOp(function(handle, node, options) {
                return addLineWidget(this, handle, node, options)
            }),
            removeLineWidget: function(widget) {
                widget.clear()
            },
            markText: function(from, to, options) {
                return markText(this, clipPos(this, from), clipPos(this, to), options, options && options.type || "range")
            },
            setBookmark: function(pos, options) {
                var realOpts = {
                    replacedWith: options && (options.nodeType == null ? options.widget : options),
                    insertLeft: options && options.insertLeft,
                    clearWhenEmpty: false,
                    shared: options && options.shared,
                    handleMouseEvents: options && options.handleMouseEvents
                };
                pos = clipPos(this, pos);
                return markText(this, pos, pos, realOpts, "bookmark")
            },
            findMarksAt: function(pos) {
                pos = clipPos(this, pos);
                var markers = []
                  , spans = getLine(this, pos.line).markedSpans;
                if (spans)
                    for (var i = 0; i < spans.length; ++i) {
                        var span = spans[i];
                        if ((span.from == null || span.from <= pos.ch) && (span.to == null || span.to >= pos.ch))
                            markers.push(span.marker.parent || span.marker)
                    }
                return markers
            },
            findMarks: function(from, to, filter) {
                from = clipPos(this, from);
                to = clipPos(this, to);
                var found = []
                  , lineNo = from.line;
                this.iter(from.line, to.line + 1, function(line) {
                    var spans = line.markedSpans;
                    if (spans)
                        for (var i = 0; i < spans.length; i++) {
                            var span = spans[i];
                            if (!(span.to != null && lineNo == from.line && from.ch >= span.to || span.from == null && lineNo != from.line || span.from != null && lineNo == to.line && span.from >= to.ch) && (!filter || filter(span.marker)))
                                found.push(span.marker.parent || span.marker)
                        }
                    ++lineNo
                });
                return found
            },
            getAllMarks: function() {
                var markers = [];
                this.iter(function(line) {
                    var sps = line.markedSpans;
                    if (sps)
                        for (var i = 0; i < sps.length; ++i)
                            if (sps[i].from != null)
                                markers.push(sps[i].marker)
                });
                return markers
            },
            posFromIndex: function(off) {
                var ch, lineNo = this.first, sepSize = this.lineSeparator().length;
                this.iter(function(line) {
                    var sz = line.text.length + sepSize;
                    if (sz > off) {
                        ch = off;
                        return true
                    }
                    off -= sz;
                    ++lineNo
                });
                return clipPos(this, Pos(lineNo, ch))
            },
            indexFromPos: function(coords) {
                coords = clipPos(this, coords);
                var index = coords.ch;
                if (coords.line < this.first || coords.ch < 0)
                    return 0;
                var sepSize = this.lineSeparator().length;
                this.iter(this.first, coords.line, function(line) {
                    index += line.text.length + sepSize
                });
                return index
            },
            copy: function(copyHistory) {
                var doc = new Doc(getLines(this, this.first, this.first + this.size),this.modeOption,this.first,this.lineSep,this.direction);
                doc.scrollTop = this.scrollTop;
                doc.scrollLeft = this.scrollLeft;
                doc.sel = this.sel;
                doc.extend = false;
                if (copyHistory) {
                    doc.history.undoDepth = this.history.undoDepth;
                    doc.setHistory(this.getHistory())
                }
                return doc
            },
            linkedDoc: function(options) {
                if (!options)
                    options = {};
                var from = this.first
                  , to = this.first + this.size;
                if (options.from != null && options.from > from)
                    from = options.from;
                if (options.to != null && options.to < to)
                    to = options.to;
                var copy = new Doc(getLines(this, from, to),options.mode || this.modeOption,from,this.lineSep,this.direction);
                if (options.sharedHist)
                    copy.history = this.history;
                (this.linked || (this.linked = [])).push({
                    doc: copy,
                    sharedHist: options.sharedHist
                });
                copy.linked = [{
                    doc: this,
                    isParent: true,
                    sharedHist: options.sharedHist
                }];
                copySharedMarkers(copy, findSharedMarkers(this));
                return copy
            },
            unlinkDoc: function(other) {
                if (other instanceof CodeMirror)
                    other = other.doc;
                if (this.linked)
                    for (var i = 0; i < this.linked.length; ++i) {
                        var link = this.linked[i];
                        if (link.doc != other)
                            continue;
                        this.linked.splice(i, 1);
                        other.unlinkDoc(this);
                        detachSharedMarkers(findSharedMarkers(this));
                        break
                    }
                if (other.history == this.history) {
                    var splitIds = [other.id];
                    linkedDocs(other, function(doc) {
                        return splitIds.push(doc.id)
                    }, true);
                    other.history = new History(null);
                    other.history.done = copyHistoryArray(this.history.done, splitIds);
                    other.history.undone = copyHistoryArray(this.history.undone, splitIds)
                }
            },
            iterLinkedDocs: function(f) {
                linkedDocs(this, f)
            },
            getMode: function() {
                return this.mode
            },
            getEditor: function() {
                return this.cm
            },
            splitLines: function(str) {
                if (this.lineSep)
                    return str.split(this.lineSep);
                return splitLinesAuto(str)
            },
            lineSeparator: function() {
                return this.lineSep || "\n"
            },
            setDirection: docMethodOp(function(dir) {
                if (dir != "rtl")
                    dir = "ltr";
                if (dir == this.direction)
                    return;
                this.direction = dir;
                this.iter(function(line) {
                    return line.order = null
                });
                if (this.cm)
                    directionChanged(this.cm)
            })
        });
        Doc.prototype.eachLine = Doc.prototype.iter;
        var lastDrop = 0;
        function onDrop(e) {
            var cm = this;
            clearDragCursor(cm);
            if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
                return;
            e_preventDefault(e);
            if (ie)
                lastDrop = +new Date;
            var pos = posFromMouse(cm, e, true)
              , files = e.dataTransfer.files;
            if (!pos || cm.isReadOnly())
                return;
            if (files && files.length && window.FileReader && window.File) {
                var n = files.length
                  , text = Array(n)
                  , read = 0;
                var markAsReadAndPasteIfAllFilesAreRead = function() {
                    if (++read == n)
                        operation(cm, function() {
                            pos = clipPos(cm.doc, pos);
                            var change = {
                                from: pos,
                                to: pos,
                                text: cm.doc.splitLines(text.filter(function(t) {
                                    return t != null
                                }).join(cm.doc.lineSeparator())),
                                origin: "paste"
                            };
                            makeChange(cm.doc, change);
                            setSelectionReplaceHistory(cm.doc, simpleSelection(clipPos(cm.doc, pos), clipPos(cm.doc, changeEnd(change))))
                        })()
                };
                var readTextFromFile = function(file, i) {
                    if (cm.options.allowDropFileTypes && indexOf(cm.options.allowDropFileTypes, file.type) == -1) {
                        markAsReadAndPasteIfAllFilesAreRead();
                        return
                    }
                    var reader = new FileReader;
                    reader.onerror = function() {
                        return markAsReadAndPasteIfAllFilesAreRead()
                    }
                    ;
                    reader.onload = function() {
                        var content = reader.result;
                        if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) {
                            markAsReadAndPasteIfAllFilesAreRead();
                            return
                        }
                        text[i] = content;
                        markAsReadAndPasteIfAllFilesAreRead()
                    }
                    ;
                    reader.readAsText(file)
                };
                for (var i = 0; i < files.length; i++)
                    readTextFromFile(files[i], i)
            } else {
                if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
                    cm.state.draggingText(e);
                    setTimeout(function() {
                        return cm.display.input.focus()
                    }, 20);
                    return
                }
                try {
                    var text$1 = e.dataTransfer.getData("Text");
                    if (text$1) {
                        var selected;
                        if (cm.state.draggingText && !cm.state.draggingText.copy)
                            selected = cm.listSelections();
                        setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));
                        if (selected)
                            for (var i$1 = 0; i$1 < selected.length; ++i$1)
                                replaceRange(cm.doc, "", selected[i$1].anchor, selected[i$1].head, "drag");
                        cm.replaceSelection(text$1, "around", "paste");
                        cm.display.input.focus()
                    }
                } catch (e$1) {}
            }
        }
        function onDragStart(cm, e) {
            if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) {
                e_stop(e);
                return
            }
            if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
                return;
            e.dataTransfer.setData("Text", cm.getSelection());
            e.dataTransfer.effectAllowed = "copyMove";
            if (e.dataTransfer.setDragImage && !safari) {
                var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
                img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
                if (presto) {
                    img.width = img.height = 1;
                    cm.display.wrapper.appendChild(img);
                    img._top = img.offsetTop
                }
                e.dataTransfer.setDragImage(img, 0, 0);
                if (presto)
                    img.parentNode.removeChild(img)
            }
        }
        function onDragOver(cm, e) {
            var pos = posFromMouse(cm, e);
            if (!pos)
                return;
            var frag = document.createDocumentFragment();
            drawSelectionCursor(cm, pos, frag);
            if (!cm.display.dragCursor) {
                cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
                cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv)
            }
            removeChildrenAndAdd(cm.display.dragCursor, frag)
        }
        function clearDragCursor(cm) {
            if (cm.display.dragCursor) {
                cm.display.lineSpace.removeChild(cm.display.dragCursor);
                cm.display.dragCursor = null
            }
        }
        function forEachCodeMirror(f) {
            if (!document.getElementsByClassName)
                return;
            var byClass = document.getElementsByClassName("CodeMirror")
              , editors = [];
            for (var i = 0; i < byClass.length; i++) {
                var cm = byClass[i].CodeMirror;
                if (cm)
                    editors.push(cm)
            }
            if (editors.length)
                editors[0].operation(function() {
                    for (var i = 0; i < editors.length; i++)
                        f(editors[i])
                })
        }
        var globalsRegistered = false;
        function ensureGlobalHandlers() {
            if (globalsRegistered)
                return;
            registerGlobalHandlers();
            globalsRegistered = true
        }
        function registerGlobalHandlers() {
            var resizeTimer;
            on(window, "resize", function() {
                if (resizeTimer == null)
                    resizeTimer = setTimeout(function() {
                        resizeTimer = null;
                        forEachCodeMirror(onResize)
                    }, 100)
            });
            on(window, "blur", function() {
                return forEachCodeMirror(onBlur)
            })
        }
        function onResize(cm) {
            var d = cm.display;
            d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
            d.scrollbarsClipped = false;
            cm.setSize()
        }
        var keyNames = {
            3: "Pause",
            8: "Backspace",
            9: "Tab",
            13: "Enter",
            16: "Shift",
            17: "Ctrl",
            18: "Alt",
            19: "Pause",
            20: "CapsLock",
            27: "Esc",
            32: "Space",
            33: "PageUp",
            34: "PageDown",
            35: "End",
            36: "Home",
            37: "Left",
            38: "Up",
            39: "Right",
            40: "Down",
            44: "PrintScrn",
            45: "Insert",
            46: "Delete",
            59: ";",
            61: "=",
            91: "Mod",
            92: "Mod",
            93: "Mod",
            106: "*",
            107: "=",
            109: "-",
            110: ".",
            111: "/",
            145: "ScrollLock",
            173: "-",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "'",
            224: "Mod",
            63232: "Up",
            63233: "Down",
            63234: "Left",
            63235: "Right",
            63272: "Delete",
            63273: "Home",
            63275: "End",
            63276: "PageUp",
            63277: "PageDown",
            63302: "Insert"
        };
        for (var i = 0; i < 10; i++)
            keyNames[i + 48] = keyNames[i + 96] = String(i);
        for (var i$1 = 65; i$1 <= 90; i$1++)
            keyNames[i$1] = String.fromCharCode(i$1);
        for (var i$2 = 1; i$2 <= 12; i$2++)
            keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2;
        var keyMap = {};
        keyMap.basic = {
            "Left": "goCharLeft",
            "Right": "goCharRight",
            "Up": "goLineUp",
            "Down": "goLineDown",
            "End": "goLineEnd",
            "Home": "goLineStartSmart",
            "PageUp": "goPageUp",
            "PageDown": "goPageDown",
            "Delete": "delCharAfter",
            "Backspace": "delCharBefore",
            "Shift-Backspace": "delCharBefore",
            "Tab": "defaultTab",
            "Shift-Tab": "indentAuto",
            "Enter": "newlineAndIndent",
            "Insert": "toggleOverwrite",
            "Esc": "singleSelection"
        };
        keyMap.pcDefault = {
            "Ctrl-A": "selectAll",
            "Ctrl-D": "deleteLine",
            "Ctrl-Z": "undo",
            "Shift-Ctrl-Z": "redo",
            "Ctrl-Y": "redo",
            "Ctrl-Home": "goDocStart",
            "Ctrl-End": "goDocEnd",
            "Ctrl-Up": "goLineUp",
            "Ctrl-Down": "goLineDown",
            "Ctrl-Left": "goGroupLeft",
            "Ctrl-Right": "goGroupRight",
            "Alt-Left": "goLineStart",
            "Alt-Right": "goLineEnd",
            "Ctrl-Backspace": "delGroupBefore",
            "Ctrl-Delete": "delGroupAfter",
            "Ctrl-S": "save",
            "Ctrl-F": "find",
            "Ctrl-G": "findNext",
            "Shift-Ctrl-G": "findPrev",
            "Shift-Ctrl-F": "replace",
            "Shift-Ctrl-R": "replaceAll",
            "Ctrl-[": "indentLess",
            "Ctrl-]": "indentMore",
            "Ctrl-U": "undoSelection",
            "Shift-Ctrl-U": "redoSelection",
            "Alt-U": "redoSelection",
            "fallthrough": "basic"
        };
        keyMap.emacsy = {
            "Ctrl-F": "goCharRight",
            "Ctrl-B": "goCharLeft",
            "Ctrl-P": "goLineUp",
            "Ctrl-N": "goLineDown",
            "Ctrl-A": "goLineStart",
            "Ctrl-E": "goLineEnd",
            "Ctrl-V": "goPageDown",
            "Shift-Ctrl-V": "goPageUp",
            "Ctrl-D": "delCharAfter",
            "Ctrl-H": "delCharBefore",
            "Alt-Backspace": "delWordBefore",
            "Ctrl-K": "killLine",
            "Ctrl-T": "transposeChars",
            "Ctrl-O": "openLine"
        };
        keyMap.macDefault = {
            "Cmd-A": "selectAll",
            "Cmd-D": "deleteLine",
            "Cmd-Z": "undo",
            "Shift-Cmd-Z": "redo",
            "Cmd-Y": "redo",
            "Cmd-Home": "goDocStart",
            "Cmd-Up": "goDocStart",
            "Cmd-End": "goDocEnd",
            "Cmd-Down": "goDocEnd",
            "Alt-Left": "goGroupLeft",
            "Alt-Right": "goGroupRight",
            "Cmd-Left": "goLineLeft",
            "Cmd-Right": "goLineRight",
            "Alt-Backspace": "delGroupBefore",
            "Ctrl-Alt-Backspace": "delGroupAfter",
            "Alt-Delete": "delGroupAfter",
            "Cmd-S": "save",
            "Cmd-F": "find",
            "Cmd-G": "findNext",
            "Shift-Cmd-G": "findPrev",
            "Cmd-Alt-F": "replace",
            "Shift-Cmd-Alt-F": "replaceAll",
            "Cmd-[": "indentLess",
            "Cmd-]": "indentMore",
            "Cmd-Backspace": "delWrappedLineLeft",
            "Cmd-Delete": "delWrappedLineRight",
            "Cmd-U": "undoSelection",
            "Shift-Cmd-U": "redoSelection",
            "Ctrl-Up": "goDocStart",
            "Ctrl-Down": "goDocEnd",
            "fallthrough": ["basic", "emacsy"]
        };
        keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;
        function normalizeKeyName(name) {
            var parts = name.split(/-(?!$)/);
            name = parts[parts.length - 1];
            var alt, ctrl, shift, cmd;
            for (var i = 0; i < parts.length - 1; i++) {
                var mod = parts[i];
                if (/^(cmd|meta|m)$/i.test(mod))
                    cmd = true;
                else if (/^a(lt)?$/i.test(mod))
                    alt = true;
                else if (/^(c|ctrl|control)$/i.test(mod))
                    ctrl = true;
                else if (/^s(hift)?$/i.test(mod))
                    shift = true;
                else
                    throw new Error("Unrecognized modifier name: " + mod);
            }
            if (alt)
                name = "Alt-" + name;
            if (ctrl)
                name = "Ctrl-" + name;
            if (cmd)
                name = "Cmd-" + name;
            if (shift)
                name = "Shift-" + name;
            return name
        }
        function normalizeKeyMap(keymap) {
            var copy = {};
            for (var keyname in keymap)
                if (keymap.hasOwnProperty(keyname)) {
                    var value = keymap[keyname];
                    if (/^(name|fallthrough|(de|at)tach)$/.test(keyname))
                        continue;
                    if (value == "...") {
                        delete keymap[keyname];
                        continue
                    }
                    var keys = map(keyname.split(" "), normalizeKeyName);
                    for (var i = 0; i < keys.length; i++) {
                        var val = void 0
                          , name = void 0;
                        if (i == keys.length - 1) {
                            name = keys.join(" ");
                            val = value
                        } else {
                            name = keys.slice(0, i + 1).join(" ");
                            val = "..."
                        }
                        var prev = copy[name];
                        if (!prev)
                            copy[name] = val;
                        else if (prev != val)
                            throw new Error("Inconsistent bindings for " + name);
                    }
                    delete keymap[keyname]
                }
            for (var prop in copy)
                keymap[prop] = copy[prop];
            return keymap
        }
        function lookupKey(key, map, handle, context) {
            map = getKeyMap(map);
            var found = map.call ? map.call(key, context) : map[key];
            if (found === false)
                return "nothing";
            if (found === "...")
                return "multi";
            if (found != null && handle(found))
                return "handled";
            if (map.fallthrough) {
                if (Object.prototype.toString.call(map.fallthrough) != "[object Array]")
                    return lookupKey(key, map.fallthrough, handle, context);
                for (var i = 0; i < map.fallthrough.length; i++) {
                    var result = lookupKey(key, map.fallthrough[i], handle, context);
                    if (result)
                        return result
                }
            }
        }
        function isModifierKey(value) {
            var name = typeof value == "string" ? value : keyNames[value.keyCode];
            return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod"
        }
        function addModifierNames(name, event, noShift) {
            var base = name;
            if (event.altKey && base != "Alt")
                name = "Alt-" + name;
            if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl")
                name = "Ctrl-" + name;
            if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Mod")
                name = "Cmd-" + name;
            if (!noShift && event.shiftKey && base != "Shift")
                name = "Shift-" + name;
            return name
        }
        function keyName(event, noShift) {
            if (presto && event.keyCode == 34 && event["char"])
                return false;
            var name = keyNames[event.keyCode];
            if (name == null || event.altGraphKey)
                return false;
            if (event.keyCode == 3 && event.code)
                name = event.code;
            return addModifierNames(name, event, noShift)
        }
        function getKeyMap(val) {
            return typeof val == "string" ? keyMap[val] : val
        }
        function deleteNearSelection(cm, compute) {
            var ranges = cm.doc.sel.ranges
              , kill = [];
            for (var i = 0; i < ranges.length; i++) {
                var toKill = compute(ranges[i]);
                while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
                    var replaced = kill.pop();
                    if (cmp(replaced.from, toKill.from) < 0) {
                        toKill.from = replaced.from;
                        break
                    }
                }
                kill.push(toKill)
            }
            runInOp(cm, function() {
                for (var i = kill.length - 1; i >= 0; i--)
                    replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");
                ensureCursorVisible(cm)
            })
        }
        function moveCharLogically(line, ch, dir) {
            var target = skipExtendingChars(line.text, ch + dir, dir);
            return target < 0 || target > line.text.length ? null : target
        }
        function moveLogically(line, start, dir) {
            var ch = moveCharLogically(line, start.ch, dir);
            return ch == null ? null : new Pos(start.line,ch,dir < 0 ? "after" : "before")
        }
        function endOfLine(visually, cm, lineObj, lineNo, dir) {
            if (visually) {
                if (cm.doc.direction == "rtl")
                    dir = -dir;
                var order = getOrder(lineObj, cm.doc.direction);
                if (order) {
                    var part = dir < 0 ? lst(order) : order[0];
                    var moveInStorageOrder = dir < 0 == (part.level == 1);
                    var sticky = moveInStorageOrder ? "after" : "before";
                    var ch;
                    if (part.level > 0 || cm.doc.direction == "rtl") {
                        var prep = prepareMeasureForLine(cm, lineObj);
                        ch = dir < 0 ? lineObj.text.length - 1 : 0;
                        var targetTop = measureCharPrepared(cm, prep, ch).top;
                        ch = findFirst(function(ch) {
                            return measureCharPrepared(cm, prep, ch).top == targetTop
                        }, dir < 0 == (part.level == 1) ? part.from : part.to - 1, ch);
                        if (sticky == "before")
                            ch = moveCharLogically(lineObj, ch, 1)
                    } else
                        ch = dir < 0 ? part.to : part.from;
                    return new Pos(lineNo,ch,sticky)
                }
            }
            return new Pos(lineNo,dir < 0 ? lineObj.text.length : 0,dir < 0 ? "before" : "after")
        }
        function moveVisually(cm, line, start, dir) {
            var bidi = getOrder(line, cm.doc.direction);
            if (!bidi)
                return moveLogically(line, start, dir);
            if (start.ch >= line.text.length) {
                start.ch = line.text.length;
                start.sticky = "before"
            } else if (start.ch <= 0) {
                start.ch = 0;
                start.sticky = "after"
            }
            var partPos = getBidiPartAt(bidi, start.ch, start.sticky)
              , part = bidi[partPos];
            if (cm.doc.direction == "ltr" && part.level % 2 == 0 && (dir > 0 ? part.to > start.ch : part.from < start.ch))
                return moveLogically(line, start, dir);
            var mv = function(pos, dir) {
                return moveCharLogically(line, pos instanceof Pos ? pos.ch : pos, dir)
            };
            var prep;
            var getWrappedLineExtent = function(ch) {
                if (!cm.options.lineWrapping)
                    return {
                        begin: 0,
                        end: line.text.length
                    };
                prep = prep || prepareMeasureForLine(cm, line);
                return wrappedLineExtentChar(cm, line, prep, ch)
            };
            var wrappedLineExtent = getWrappedLineExtent(start.sticky == "before" ? mv(start, -1) : start.ch);
            if (cm.doc.direction == "rtl" || part.level == 1) {
                var moveInStorageOrder = part.level == 1 == dir < 0;
                var ch = mv(start, moveInStorageOrder ? 1 : -1);
                if (ch != null && (!moveInStorageOrder ? ch >= part.from && ch >= wrappedLineExtent.begin : ch <= part.to && ch <= wrappedLineExtent.end)) {
                    var sticky = moveInStorageOrder ? "before" : "after";
                    return new Pos(start.line,ch,sticky)
                }
            }
            var searchInVisualLine = function(partPos, dir, wrappedLineExtent) {
                var getRes = function(ch, moveInStorageOrder) {
                    return moveInStorageOrder ? new Pos(start.line,mv(ch, 1),"before") : new Pos(start.line,ch,"after")
                };
                for (; partPos >= 0 && partPos < bidi.length; partPos += dir) {
                    var part = bidi[partPos];
                    var moveInStorageOrder = dir > 0 == (part.level != 1);
                    var ch = moveInStorageOrder ? wrappedLineExtent.begin : mv(wrappedLineExtent.end, -1);
                    if (part.from <= ch && ch < part.to)
                        return getRes(ch, moveInStorageOrder);
                    ch = moveInStorageOrder ? part.from : mv(part.to, -1);
                    if (wrappedLineExtent.begin <= ch && ch < wrappedLineExtent.end)
                        return getRes(ch, moveInStorageOrder)
                }
            };
            var res = searchInVisualLine(partPos + dir, dir, wrappedLineExtent);
            if (res)
                return res;
            var nextCh = dir > 0 ? wrappedLineExtent.end : mv(wrappedLineExtent.begin, -1);
            if (nextCh != null && !(dir > 0 && nextCh == line.text.length)) {
                res = searchInVisualLine(dir > 0 ? 0 : bidi.length - 1, dir, getWrappedLineExtent(nextCh));
                if (res)
                    return res
            }
            return null
        }
        var commands = {
            selectAll: selectAll,
            singleSelection: function(cm) {
                return cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll)
            },
            killLine: function(cm) {
                return deleteNearSelection(cm, function(range) {
                    if (range.empty()) {
                        var len = getLine(cm.doc, range.head.line).text.length;
                        if (range.head.ch == len && range.head.line < cm.lastLine())
                            return {
                                from: range.head,
                                to: Pos(range.head.line + 1, 0)
                            };
                        else
                            return {
                                from: range.head,
                                to: Pos(range.head.line, len)
                            }
                    } else
                        return {
                            from: range.from(),
                            to: range.to()
                        }
                })
            },
            deleteLine: function(cm) {
                return deleteNearSelection(cm, function(range) {
                    return {
                        from: Pos(range.from().line, 0),
                        to: clipPos(cm.doc, Pos(range.to().line + 1, 0))
                    }
                })
            },
            delLineLeft: function(cm) {
                return deleteNearSelection(cm, function(range) {
                    return {
                        from: Pos(range.from().line, 0),
                        to: range.from()
                    }
                })
            },
            delWrappedLineLeft: function(cm) {
                return deleteNearSelection(cm, function(range) {
                    var top = cm.charCoords(range.head, "div").top + 5;
                    var leftPos = cm.coordsChar({
                        left: 0,
                        top: top
                    }, "div");
                    return {
                        from: leftPos,
                        to: range.from()
                    }
                })
            },
            delWrappedLineRight: function(cm) {
                return deleteNearSelection(cm, function(range) {
                    var top = cm.charCoords(range.head, "div").top + 5;
                    var rightPos = cm.coordsChar({
                        left: cm.display.lineDiv.offsetWidth + 100,
                        top: top
                    }, "div");
                    return {
                        from: range.from(),
                        to: rightPos
                    }
                })
            },
            undo: function(cm) {
                return cm.undo()
            },
            redo: function(cm) {
                return cm.redo()
            },
            undoSelection: function(cm) {
                return cm.undoSelection()
            },
            redoSelection: function(cm) {
                return cm.redoSelection()
            },
            goDocStart: function(cm) {
                return cm.extendSelection(Pos(cm.firstLine(), 0))
            },
            goDocEnd: function(cm) {
                return cm.extendSelection(Pos(cm.lastLine()))
            },
            goLineStart: function(cm) {
                return cm.extendSelectionsBy(function(range) {
                    return lineStart(cm, range.head.line)
                }, {
                    origin: "+move",
                    bias: 1
                })
            },
            goLineStartSmart: function(cm) {
                return cm.extendSelectionsBy(function(range) {
                    return lineStartSmart(cm, range.head)
                }, {
                    origin: "+move",
                    bias: 1
                })
            },
            goLineEnd: function(cm) {
                return cm.extendSelectionsBy(function(range) {
                    return lineEnd(cm, range.head.line)
                }, {
                    origin: "+move",
                    bias: -1
                })
            },
            goLineRight: function(cm) {
                return cm.extendSelectionsBy(function(range) {
                    var top = cm.cursorCoords(range.head, "div").top + 5;
                    return cm.coordsChar({
                        left: cm.display.lineDiv.offsetWidth + 100,
                        top: top
                    }, "div")
                }, sel_move)
            },
            goLineLeft: function(cm) {
                return cm.extendSelectionsBy(function(range) {
                    var top = cm.cursorCoords(range.head, "div").top + 5;
                    return cm.coordsChar({
                        left: 0,
                        top: top
                    }, "div")
                }, sel_move)
            },
            goLineLeftSmart: function(cm) {
                return cm.extendSelectionsBy(function(range) {
                    var top = cm.cursorCoords(range.head, "div").top + 5;
                    var pos = cm.coordsChar({
                        left: 0,
                        top: top
                    }, "div");
                    if (pos.ch < cm.getLine(pos.line).search(/\S/))
                        return lineStartSmart(cm, range.head);
                    return pos
                }, sel_move)
            },
            goLineUp: function(cm) {
                return cm.moveV(-1, "line")
            },
            goLineDown: function(cm) {
                return cm.moveV(1, "line")
            },
            goPageUp: function(cm) {
                return cm.moveV(-1, "page")
            },
            goPageDown: function(cm) {
                return cm.moveV(1, "page")
            },
            goCharLeft: function(cm) {
                return cm.moveH(-1, "char")
            },
            goCharRight: function(cm) {
                return cm.moveH(1, "char")
            },
            goColumnLeft: function(cm) {
                return cm.moveH(-1, "column")
            },
            goColumnRight: function(cm) {
                return cm.moveH(1, "column")
            },
            goWordLeft: function(cm) {
                return cm.moveH(-1, "word")
            },
            goGroupRight: function(cm) {
                return cm.moveH(1, "group")
            },
            goGroupLeft: function(cm) {
                return cm.moveH(-1, "group")
            },
            goWordRight: function(cm) {
                return cm.moveH(1, "word")
            },
            delCharBefore: function(cm) {
                return cm.deleteH(-1, "codepoint")
            },
            delCharAfter: function(cm) {
                return cm.deleteH(1, "char")
            },
            delWordBefore: function(cm) {
                return cm.deleteH(-1, "word")
            },
            delWordAfter: function(cm) {
                return cm.deleteH(1, "word")
            },
            delGroupBefore: function(cm) {
                return cm.deleteH(-1, "group")
            },
            delGroupAfter: function(cm) {
                return cm.deleteH(1, "group")
            },
            indentAuto: function(cm) {
                return cm.indentSelection("smart")
            },
            indentMore: function(cm) {
                return cm.indentSelection("add")
            },
            indentLess: function(cm) {
                return cm.indentSelection("subtract")
            },
            insertTab: function(cm) {
                return cm.replaceSelection("\t")
            },
            insertSoftTab: function(cm) {
                var spaces = []
                  , ranges = cm.listSelections()
                  , tabSize = cm.options.tabSize;
                for (var i = 0; i < ranges.length; i++) {
                    var pos = ranges[i].from();
                    var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
                    spaces.push(spaceStr(tabSize - col % tabSize))
                }
                cm.replaceSelections(spaces)
            },
            defaultTab: function(cm) {
                if (cm.somethingSelected())
                    cm.indentSelection("add");
                else
                    cm.execCommand("insertTab")
            },
            transposeChars: function(cm) {
                return runInOp(cm, function() {
                    var ranges = cm.listSelections()
                      , newSel = [];
                    for (var i = 0; i < ranges.length; i++) {
                        if (!ranges[i].empty())
                            continue;
                        var cur = ranges[i].head
                          , line = getLine(cm.doc, cur.line).text;
                        if (line) {
                            if (cur.ch == line.length)
                                cur = new Pos(cur.line,cur.ch - 1);
                            if (cur.ch > 0) {
                                cur = new Pos(cur.line,cur.ch + 1);
                                cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2), Pos(cur.line, cur.ch - 2), cur, "+transpose")
                            } else if (cur.line > cm.doc.first) {
                                var prev = getLine(cm.doc, cur.line - 1).text;
                                if (prev) {
                                    cur = new Pos(cur.line,1);
                                    cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() + prev.charAt(prev.length - 1), Pos(cur.line - 1, prev.length - 1), cur, "+transpose")
                                }
                            }
                        }
                        newSel.push(new Range(cur,cur))
                    }
                    cm.setSelections(newSel)
                })
            },
            newlineAndIndent: function(cm) {
                return runInOp(cm, function() {
                    var sels = cm.listSelections();
                    for (var i = sels.length - 1; i >= 0; i--)
                        cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input");
                    sels = cm.listSelections();
                    for (var i$1 = 0; i$1 < sels.length; i$1++)
                        cm.indentLine(sels[i$1].from().line, null, true);
                    ensureCursorVisible(cm)
                })
            },
            openLine: function(cm) {
                return cm.replaceSelection("\n", "start")
            },
            toggleOverwrite: function(cm) {
                return cm.toggleOverwrite()
            }
        };
        function lineStart(cm, lineN) {
            var line = getLine(cm.doc, lineN);
            var visual = visualLine(line);
            if (visual != line)
                lineN = lineNo(visual);
            return endOfLine(true, cm, visual, lineN, 1)
        }
        function lineEnd(cm, lineN) {
            var line = getLine(cm.doc, lineN);
            var visual = visualLineEnd(line);
            if (visual != line)
                lineN = lineNo(visual);
            return endOfLine(true, cm, line, lineN, -1)
        }
        function lineStartSmart(cm, pos) {
            var start = lineStart(cm, pos.line);
            var line = getLine(cm.doc, start.line);
            var order = getOrder(line, cm.doc.direction);
            if (!order || order[0].level == 0) {
                var firstNonWS = Math.max(start.ch, line.text.search(/\S/));
                var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
                return Pos(start.line, inWS ? 0 : firstNonWS, start.sticky)
            }
            return start
        }
        function doHandleBinding(cm, bound, dropShift) {
            if (typeof bound == "string") {
                bound = commands[bound];
                if (!bound)
                    return false
            }
            cm.display.input.ensurePolled();
            var prevShift = cm.display.shift
              , done = false;
            try {
                if (cm.isReadOnly())
                    cm.state.suppressEdits = true;
                if (dropShift)
                    cm.display.shift = false;
                done = bound(cm) != Pass
            } finally {
                cm.display.shift = prevShift;
                cm.state.suppressEdits = false
            }
            return done
        }
        function lookupKeyForEditor(cm, name, handle) {
            for (var i = 0; i < cm.state.keyMaps.length; i++) {
                var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
                if (result)
                    return result
            }
            return cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm) || lookupKey(name, cm.options.keyMap, handle, cm)
        }
        var stopSeq = new Delayed;
        function dispatchKey(cm, name, e, handle) {
            var seq = cm.state.keySeq;
            if (seq) {
                if (isModifierKey(name))
                    return "handled";
                if (/'$/.test(name))
                    cm.state.keySeq = null;
                else
                    stopSeq.set(50, function() {
                        if (cm.state.keySeq == seq) {
                            cm.state.keySeq = null;
                            cm.display.input.reset()
                        }
                    });
                if (dispatchKeyInner(cm, seq + " " + name, e, handle))
                    return true
            }
            return dispatchKeyInner(cm, name, e, handle)
        }
        function dispatchKeyInner(cm, name, e, handle) {
            var result = lookupKeyForEditor(cm, name, handle);
            if (result == "multi")
                cm.state.keySeq = name;
            if (result == "handled")
                signalLater(cm, "keyHandled", cm, name, e);
            if (result == "handled" || result == "multi") {
                e_preventDefault(e);
                restartBlink(cm)
            }
            return !!result
        }
        function handleKeyBinding(cm, e) {
            var name = keyName(e, true);
            if (!name)
                return false;
            if (e.shiftKey && !cm.state.keySeq)
                return dispatchKey(cm, "Shift-" + name, e, function(b) {
                    return doHandleBinding(cm, b, true)
                }) || dispatchKey(cm, name, e, function(b) {
                    if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion)
                        return doHandleBinding(cm, b)
                });
            else
                return dispatchKey(cm, name, e, function(b) {
                    return doHandleBinding(cm, b)
                })
        }
        function handleCharBinding(cm, e, ch) {
            return dispatchKey(cm, "'" + ch + "'", e, function(b) {
                return doHandleBinding(cm, b, true)
            })
        }
        var lastStoppedKey = null;
        function onKeyDown(e) {
            var cm = this;
            if (e.target && e.target != cm.display.input.getField())
                return;
            cm.curOp.focus = activeElt();
            if (signalDOMEvent(cm, e))
                return;
            if (ie && ie_version < 11 && e.keyCode == 27)
                e.returnValue = false;
            var code = e.keyCode;
            cm.display.shift = code == 16 || e.shiftKey;
            var handled = handleKeyBinding(cm, e);
            if (presto) {
                lastStoppedKey = handled ? code : null;
                if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey))
                    cm.replaceSelection("", null, "cut")
            }
            if (gecko && !mac && !handled && code == 46 && e.shiftKey && !e.ctrlKey && document.execCommand)
                document.execCommand("cut");
            if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
                showCrossHair(cm)
        }
        function showCrossHair(cm) {
            var lineDiv = cm.display.lineDiv;
            addClass(lineDiv, "CodeMirror-crosshair");
            function up(e) {
                if (e.keyCode == 18 || !e.altKey) {
                    rmClass(lineDiv, "CodeMirror-crosshair");
                    off(document, "keyup", up);
                    off(document, "mouseover", up)
                }
            }
            on(document, "keyup", up);
            on(document, "mouseover", up)
        }
        function onKeyUp(e) {
            if (e.keyCode == 16)
                this.doc.sel.shift = false;
            signalDOMEvent(this, e)
        }
        function onKeyPress(e) {
            var cm = this;
            if (e.target && e.target != cm.display.input.getField())
                return;
            if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey)
                return;
            var keyCode = e.keyCode
              , charCode = e.charCode;
            if (presto && keyCode == lastStoppedKey) {
                lastStoppedKey = null;
                e_preventDefault(e);
                return
            }
            if (presto && (!e.which || e.which < 10) && handleKeyBinding(cm, e))
                return;
            var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
            if (ch == "\b")
                return;
            if (handleCharBinding(cm, e, ch))
                return;
            cm.display.input.onKeyPress(e)
        }
        var DOUBLECLICK_DELAY = 400;
        var PastClick = function(time, pos, button) {
            this.time = time;
            this.pos = pos;
            this.button = button
        };
        PastClick.prototype.compare = function(time, pos, button) {
            return this.time + DOUBLECLICK_DELAY > time && cmp(pos, this.pos) == 0 && button == this.button
        }
        ;
        var lastClick, lastDoubleClick;
        function clickRepeat(pos, button) {
            var now = +new Date;
            if (lastDoubleClick && lastDoubleClick.compare(now, pos, button)) {
                lastClick = lastDoubleClick = null;
                return "triple"
            } else if (lastClick && lastClick.compare(now, pos, button)) {
                lastDoubleClick = new PastClick(now,pos,button);
                lastClick = null;
                return "double"
            } else {
                lastClick = new PastClick(now,pos,button);
                lastDoubleClick = null;
                return "single"
            }
        }
        function onMouseDown(e) {
            var cm = this
              , display = cm.display;
            if (signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch())
                return;
            display.input.ensurePolled();
            display.shift = e.shiftKey;
            if (eventInWidget(display, e)) {
                if (!webkit) {
                    display.scroller.draggable = false;
                    setTimeout(function() {
                        return display.scroller.draggable = true
                    }, 100)
                }
                return
            }
            if (clickInGutter(cm, e))
                return;
            var pos = posFromMouse(cm, e)
              , button = e_button(e)
              , repeat = pos ? clickRepeat(pos, button) : "single";
            window.focus();
            if (button == 1 && cm.state.selectingText)
                cm.state.selectingText(e);
            if (pos && handleMappedButton(cm, button, pos, repeat, e))
                return;
            if (button == 1)
                if (pos)
                    leftButtonDown(cm, pos, repeat, e);
                else {
                    if (e_target(e) == display.scroller)
                        e_preventDefault(e)
                }
            else if (button == 2) {
                if (pos)
                    extendSelection(cm.doc, pos);
                setTimeout(function() {
                    return display.input.focus()
                }, 20)
            } else if (button == 3)
                if (captureRightClick)
                    cm.display.input.onContextMenu(e);
                else
                    delayBlurEvent(cm)
        }
        function handleMappedButton(cm, button, pos, repeat, event) {
            var name = "Click";
            if (repeat == "double")
                name = "Double" + name;
            else if (repeat == "triple")
                name = "Triple" + name;
            name = (button == 1 ? "Left" : button == 2 ? "Middle" : "Right") + name;
            return dispatchKey(cm, addModifierNames(name, event), event, function(bound) {
                if (typeof bound == "string")
                    bound = commands[bound];
                if (!bound)
                    return false;
                var done = false;
                try {
                    if (cm.isReadOnly())
                        cm.state.suppressEdits = true;
                    done = bound(cm, pos) != Pass
                } finally {
                    cm.state.suppressEdits = false
                }
                return done
            })
        }
        function configureMouse(cm, repeat, event) {
            var option = cm.getOption("configureMouse");
            var value = option ? option(cm, repeat, event) : {};
            if (value.unit == null) {
                var rect = chromeOS ? event.shiftKey && event.metaKey : event.altKey;
                value.unit = rect ? "rectangle" : repeat == "single" ? "char" : repeat == "double" ? "word" : "line"
            }
            if (value.extend == null || cm.doc.extend)
                value.extend = cm.doc.extend || event.shiftKey;
            if (value.addNew == null)
                value.addNew = mac ? event.metaKey : event.ctrlKey;
            if (value.moveOnDrag == null)
                value.moveOnDrag = !(mac ? event.altKey : event.ctrlKey);
            return value
        }
        function leftButtonDown(cm, pos, repeat, event) {
            if (ie)
                setTimeout(bind(ensureFocus, cm), 0);
            else
                cm.curOp.focus = activeElt();
            var behavior = configureMouse(cm, repeat, event);
            var sel = cm.doc.sel, contained;
            if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() && repeat == "single" && (contained = sel.contains(pos)) > -1 && (cmp((contained = sel.ranges[contained]).from(), pos) < 0 || pos.xRel > 0) && (cmp(contained.to(), pos) > 0 || pos.xRel < 0))
                leftButtonStartDrag(cm, event, pos, behavior);
            else
                leftButtonSelect(cm, event, pos, behavior)
        }
        function leftButtonStartDrag(cm, event, pos, behavior) {
            var display = cm.display
              , moved = false;
            var dragEnd = operation(cm, function(e) {
                if (webkit)
                    display.scroller.draggable = false;
                cm.state.draggingText = false;
                if (cm.state.delayingBlurEvent)
                    if (cm.hasFocus())
                        cm.state.delayingBlurEvent = false;
                    else
                        delayBlurEvent(cm);
                off(display.wrapper.ownerDocument, "mouseup", dragEnd);
                off(display.wrapper.ownerDocument, "mousemove", mouseMove);
                off(display.scroller, "dragstart", dragStart);
                off(display.scroller, "drop", dragEnd);
                if (!moved) {
                    e_preventDefault(e);
                    if (!behavior.addNew)
                        extendSelection(cm.doc, pos, null, null, behavior.extend);
                    if (webkit && !safari || ie && ie_version == 9)
                        setTimeout(function() {
                            display.wrapper.ownerDocument.body.focus({
                                preventScroll: true
                            });
                            display.input.focus()
                        }, 20);
                    else
                        display.input.focus()
                }
            });
            var mouseMove = function(e2) {
                moved = moved || Math.abs(event.clientX - e2.clientX) + Math.abs(event.clientY - e2.clientY) >= 10
            };
            var dragStart = function() {
                return moved = true
            };
            if (webkit)
                display.scroller.draggable = true;
            cm.state.draggingText = dragEnd;
            dragEnd.copy = !behavior.moveOnDrag;
            on(display.wrapper.ownerDocument, "mouseup", dragEnd);
            on(display.wrapper.ownerDocument, "mousemove", mouseMove);
            on(display.scroller, "dragstart", dragStart);
            on(display.scroller, "drop", dragEnd);
            cm.state.delayingBlurEvent = true;
            setTimeout(function() {
                return display.input.focus()
            }, 20);
            if (display.scroller.dragDrop)
                display.scroller.dragDrop()
        }
        function rangeForUnit(cm, pos, unit) {
            if (unit == "char")
                return new Range(pos,pos);
            if (unit == "word")
                return cm.findWordAt(pos);
            if (unit == "line")
                return new Range(Pos(pos.line, 0),clipPos(cm.doc, Pos(pos.line + 1, 0)));
            var result = unit(cm, pos);
            return new Range(result.from,result.to)
        }
        function leftButtonSelect(cm, event, start, behavior) {
            if (ie)
                delayBlurEvent(cm);
            var display = cm.display
              , doc = cm.doc;
            e_preventDefault(event);
            var ourRange, ourIndex, startSel = doc.sel, ranges = startSel.ranges;
            if (behavior.addNew && !behavior.extend) {
                ourIndex = doc.sel.contains(start);
                if (ourIndex > -1)
                    ourRange = ranges[ourIndex];
                else
                    ourRange = new Range(start,start)
            } else {
                ourRange = doc.sel.primary();
                ourIndex = doc.sel.primIndex
            }
            if (behavior.unit == "rectangle") {
                if (!behavior.addNew)
                    ourRange = new Range(start,start);
                start = posFromMouse(cm, event, true, true);
                ourIndex = -1
            } else {
                var range = rangeForUnit(cm, start, behavior.unit);
                if (behavior.extend)
                    ourRange = extendRange(ourRange, range.anchor, range.head, behavior.extend);
                else
                    ourRange = range
            }
            if (!behavior.addNew) {
                ourIndex = 0;
                setSelection(doc, new Selection([ourRange],0), sel_mouse);
                startSel = doc.sel
            } else if (ourIndex == -1) {
                ourIndex = ranges.length;
                setSelection(doc, normalizeSelection(cm, ranges.concat([ourRange]), ourIndex), {
                    scroll: false,
                    origin: "*mouse"
                })
            } else if (ranges.length > 1 && ranges[ourIndex].empty() && behavior.unit == "char" && !behavior.extend) {
                setSelection(doc, normalizeSelection(cm, ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0), {
                    scroll: false,
                    origin: "*mouse"
                });
                startSel = doc.sel
            } else
                replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
            var lastPos = start;
            function extendTo(pos) {
                if (cmp(lastPos, pos) == 0)
                    return;
                lastPos = pos;
                if (behavior.unit == "rectangle") {
                    var ranges = []
                      , tabSize = cm.options.tabSize;
                    var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
                    var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
                    var left = Math.min(startCol, posCol)
                      , right = Math.max(startCol, posCol);
                    for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line)); line <= end; line++) {
                        var text = getLine(doc, line).text
                          , leftPos = findColumn(text, left, tabSize);
                        if (left == right)
                            ranges.push(new Range(Pos(line, leftPos),Pos(line, leftPos)));
                        else if (text.length > leftPos)
                            ranges.push(new Range(Pos(line, leftPos),Pos(line, findColumn(text, right, tabSize))))
                    }
                    if (!ranges.length)
                        ranges.push(new Range(start,start));
                    setSelection(doc, normalizeSelection(cm, startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex), {
                        origin: "*mouse",
                        scroll: false
                    });
                    cm.scrollIntoView(pos)
                } else {
                    var oldRange = ourRange;
                    var range = rangeForUnit(cm, pos, behavior.unit);
                    var anchor = oldRange.anchor, head;
                    if (cmp(range.anchor, anchor) > 0) {
                        head = range.head;
                        anchor = minPos(oldRange.from(), range.anchor)
                    } else {
                        head = range.anchor;
                        anchor = maxPos(oldRange.to(), range.head)
                    }
                    var ranges$1 = startSel.ranges.slice(0);
                    ranges$1[ourIndex] = bidiSimplify(cm, new Range(clipPos(doc, anchor),head));
                    setSelection(doc, normalizeSelection(cm, ranges$1, ourIndex), sel_mouse)
                }
            }
            var editorSize = display.wrapper.getBoundingClientRect();
            var counter = 0;
            function extend(e) {
                var curCount = ++counter;
                var cur = posFromMouse(cm, e, true, behavior.unit == "rectangle");
                if (!cur)
                    return;
                if (cmp(cur, lastPos) != 0) {
                    cm.curOp.focus = activeElt();
                    extendTo(cur);
                    var visible = visibleLines(display, doc);
                    if (cur.line >= visible.to || cur.line < visible.from)
                        setTimeout(operation(cm, function() {
                            if (counter == curCount)
                                extend(e)
                        }), 150)
                } else {
                    var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
                    if (outside)
                        setTimeout(operation(cm, function() {
                            if (counter != curCount)
                                return;
                            display.scroller.scrollTop += outside;
                            extend(e)
                        }), 50)
                }
            }
            function done(e) {
                cm.state.selectingText = false;
                counter = Infinity;
                if (e) {
                    e_preventDefault(e);
                    display.input.focus()
                }
                off(display.wrapper.ownerDocument, "mousemove", move);
                off(display.wrapper.ownerDocument, "mouseup", up);
                doc.history.lastSelOrigin = null
            }
            var move = operation(cm, function(e) {
                if (e.buttons === 0 || !e_button(e))
                    done(e);
                else
                    extend(e)
            });
            var up = operation(cm, done);
            cm.state.selectingText = up;
            on(display.wrapper.ownerDocument, "mousemove", move);
            on(display.wrapper.ownerDocument, "mouseup", up)
        }
        function bidiSimplify(cm, range) {
            var anchor = range.anchor;
            var head = range.head;
            var anchorLine = getLine(cm.doc, anchor.line);
            if (cmp(anchor, head) == 0 && anchor.sticky == head.sticky)
                return range;
            var order = getOrder(anchorLine);
            if (!order)
                return range;
            var index = getBidiPartAt(order, anchor.ch, anchor.sticky)
              , part = order[index];
            if (part.from != anchor.ch && part.to != anchor.ch)
                return range;
            var boundary = index + (part.from == anchor.ch == (part.level != 1) ? 0 : 1);
            if (boundary == 0 || boundary == order.length)
                return range;
            var leftSide;
            if (head.line != anchor.line)
                leftSide = (head.line - anchor.line) * (cm.doc.direction == "ltr" ? 1 : -1) > 0;
            else {
                var headIndex = getBidiPartAt(order, head.ch, head.sticky);
                var dir = headIndex - index || (head.ch - anchor.ch) * (part.level == 1 ? -1 : 1);
                if (headIndex == boundary - 1 || headIndex == boundary)
                    leftSide = dir < 0;
                else
                    leftSide = dir > 0
            }
            var usePart = order[boundary + (leftSide ? -1 : 0)];
            var from = leftSide == (usePart.level == 1);
            var ch = from ? usePart.from : usePart.to
              , sticky = from ? "after" : "before";
            return anchor.ch == ch && anchor.sticky == sticky ? range : new Range(new Pos(anchor.line,ch,sticky),head)
        }
        function gutterEvent(cm, e, type, prevent) {
            var mX, mY;
            if (e.touches) {
                mX = e.touches[0].clientX;
                mY = e.touches[0].clientY
            } else
                try {
                    mX = e.clientX;
                    mY = e.clientY
                } catch (e$1) {
                    return false
                }
            if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right))
                return false;
            if (prevent)
                e_preventDefault(e);
            var display = cm.display;
            var lineBox = display.lineDiv.getBoundingClientRect();
            if (mY > lineBox.bottom || !hasHandler(cm, type))
                return e_defaultPrevented(e);
            mY -= lineBox.top - display.viewOffset;
            for (var i = 0; i < cm.display.gutterSpecs.length; ++i) {
                var g = display.gutters.childNodes[i];
                if (g && g.getBoundingClientRect().right >= mX) {
                    var line = lineAtHeight(cm.doc, mY);
                    var gutter = cm.display.gutterSpecs[i];
                    signal(cm, type, cm, line, gutter.className, e);
                    return e_defaultPrevented(e)
                }
            }
        }
        function clickInGutter(cm, e) {
            return gutterEvent(cm, e, "gutterClick", true)
        }
        function onContextMenu(cm, e) {
            if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e))
                return;
            if (signalDOMEvent(cm, e, "contextmenu"))
                return;
            if (!captureRightClick)
                cm.display.input.onContextMenu(e)
        }
        function contextMenuInGutter(cm, e) {
            if (!hasHandler(cm, "gutterContextMenu"))
                return false;
            return gutterEvent(cm, e, "gutterContextMenu", false)
        }
        function themeChanged(cm) {
            cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
            clearCaches(cm)
        }
        var Init = {
            toString: function() {
                return "CodeMirror.Init"
            }
        };
        var defaults = {};
        var optionHandlers = {};
        function defineOptions(CodeMirror) {
            var optionHandlers = CodeMirror.optionHandlers;
            function option(name, deflt, handle, notOnInit) {
                CodeMirror.defaults[name] = deflt;
                if (handle)
                    optionHandlers[name] = notOnInit ? function(cm, val, old) {
                        if (old != Init)
                            handle(cm, val, old)
                    }
                    : handle
            }
            CodeMirror.defineOption = option;
            CodeMirror.Init = Init;
            option("value", "", function(cm, val) {
                return cm.setValue(val)
            }, true);
            option("mode", null, function(cm, val) {
                cm.doc.modeOption = val;
                loadMode(cm)
            }, true);
            option("indentUnit", 2, loadMode, true);
            option("indentWithTabs", false);
            option("smartIndent", true);
            option("tabSize", 4, function(cm) {
                resetModeState(cm);
                clearCaches(cm);
                regChange(cm)
            }, true);
            option("lineSeparator", null, function(cm, val) {
                cm.doc.lineSep = val;
                if (!val)
                    return;
                var newBreaks = []
                  , lineNo = cm.doc.first;
                cm.doc.iter(function(line) {
                    for (var pos = 0; ; ) {
                        var found = line.text.indexOf(val, pos);
                        if (found == -1)
                            break;
                        pos = found + val.length;
                        newBreaks.push(Pos(lineNo, found))
                    }
                    lineNo++
                });
                for (var i = newBreaks.length - 1; i >= 0; i--)
                    replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length))
            });
            option("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b\u200e\u200f\u2028\u2029\ufeff\ufff9-\ufffc]/g, function(cm, val, old) {
                cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"),"g");
                if (old != Init)
                    cm.refresh()
            });
            option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function(cm) {
                return cm.refresh()
            }, true);
            option("electricChars", true);
            option("inputStyle", mobile ? "contenteditable" : "textarea", function() {
                throw new Error("inputStyle can not (yet) be changed in a running editor");
            }, true);
            option("spellcheck", false, function(cm, val) {
                return cm.getInputField().spellcheck = val
            }, true);
            option("autocorrect", false, function(cm, val) {
                return cm.getInputField().autocorrect = val
            }, true);
            option("autocapitalize", false, function(cm, val) {
                return cm.getInputField().autocapitalize = val
            }, true);
            option("rtlMoveVisually", !windows);
            option("wholeLineUpdateBefore", true);
            option("theme", "default", function(cm) {
                themeChanged(cm);
                updateGutters(cm)
            }, true);
            option("keyMap", "default", function(cm, val, old) {
                var next = getKeyMap(val);
                var prev = old != Init && getKeyMap(old);
                if (prev && prev.detach)
                    prev.detach(cm, next);
                if (next.attach)
                    next.attach(cm, prev || null)
            });
            option("extraKeys", null);
            option("configureMouse", null);
            option("lineWrapping", false, wrappingChanged, true);
            option("gutters", [], function(cm, val) {
                cm.display.gutterSpecs = getGutters(val, cm.options.lineNumbers);
                updateGutters(cm)
            }, true);
            option("fixedGutter", true, function(cm, val) {
                cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
                cm.refresh()
            }, true);
            option("coverGutterNextToScrollbar", false, function(cm) {
                return updateScrollbars(cm)
            }, true);
            option("scrollbarStyle", "native", function(cm) {
                initScrollbars(cm);
                updateScrollbars(cm);
                cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
                cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft)
            }, true);
            option("lineNumbers", false, function(cm, val) {
                cm.display.gutterSpecs = getGutters(cm.options.gutters, val);
                updateGutters(cm)
            }, true);
            option("firstLineNumber", 1, updateGutters, true);
            option("lineNumberFormatter", function(integer) {
                return integer
            }, updateGutters, true);
            option("showCursorWhenSelecting", false, updateSelection, true);
            option("resetSelectionOnContextMenu", true);
            option("lineWiseCopyCut", true);
            option("pasteLinesPerSelection", true);
            option("selectionsMayTouch", false);
            option("readOnly", false, function(cm, val) {
                if (val == "nocursor") {
                    onBlur(cm);
                    cm.display.input.blur()
                }
                cm.display.input.readOnlyChanged(val)
            });
            option("screenReaderLabel", null, function(cm, val) {
                val = val === "" ? null : val;
                cm.display.input.screenReaderLabelChanged(val)
            });
            option("disableInput", false, function(cm, val) {
                if (!val)
                    cm.display.input.reset()
            }, true);
            option("dragDrop", true, dragDropChanged);
            option("allowDropFileTypes", null);
            option("cursorBlinkRate", 530);
            option("cursorScrollMargin", 0);
            option("cursorHeight", 1, updateSelection, true);
            option("singleCursorHeightPerLine", true, updateSelection, true);
            option("workTime", 100);
            option("workDelay", 100);
            option("flattenSpans", true, resetModeState, true);
            option("addModeClass", false, resetModeState, true);
            option("pollInterval", 100);
            option("undoDepth", 200, function(cm, val) {
                return cm.doc.history.undoDepth = val
            });
            option("historyEventDelay", 1250);
            option("viewportMargin", 10, function(cm) {
                return cm.refresh()
            }, true);
            option("maxHighlightLength", 1E4, resetModeState, true);
            option("moveInputWithCursor", true, function(cm, val) {
                if (!val)
                    cm.display.input.resetPosition()
            });
            option("tabindex", null, function(cm, val) {
                return cm.display.input.getField().tabIndex = val || ""
            });
            option("autofocus", null);
            option("direction", "ltr", function(cm, val) {
                return cm.doc.setDirection(val)
            }, true);
            option("phrases", null)
        }
        function dragDropChanged(cm, value, old) {
            var wasOn = old && old != Init;
            if (!value != !wasOn) {
                var funcs = cm.display.dragFunctions;
                var toggle = value ? on : off;
                toggle(cm.display.scroller, "dragstart", funcs.start);
                toggle(cm.display.scroller, "dragenter", funcs.enter);
                toggle(cm.display.scroller, "dragover", funcs.over);
                toggle(cm.display.scroller, "dragleave", funcs.leave);
                toggle(cm.display.scroller, "drop", funcs.drop)
            }
        }
        function wrappingChanged(cm) {
            if (cm.options.lineWrapping) {
                addClass(cm.display.wrapper, "CodeMirror-wrap");
                cm.display.sizer.style.minWidth = "";
                cm.display.sizerWidth = null
            } else {
                rmClass(cm.display.wrapper, "CodeMirror-wrap");
                findMaxLine(cm)
            }
            estimateLineHeights(cm);
            regChange(cm);
            clearCaches(cm);
            setTimeout(function() {
                return updateScrollbars(cm)
            }, 100)
        }
        function CodeMirror(place, options) {
            var this$1 = this;
            if (!(this instanceof CodeMirror))
                return new CodeMirror(place,options);
            this.options = options = options ? copyObj(options) : {};
            copyObj(defaults, options, false);
            var doc = options.value;
            if (typeof doc == "string")
                doc = new Doc(doc,options.mode,null,options.lineSeparator,options.direction);
            else if (options.mode)
                doc.modeOption = options.mode;
            this.doc = doc;
            var input = new CodeMirror.inputStyles[options.inputStyle](this);
            var display = this.display = new Display(place,doc,input,options);
            display.wrapper.CodeMirror = this;
            themeChanged(this);
            if (options.lineWrapping)
                this.display.wrapper.className += " CodeMirror-wrap";
            initScrollbars(this);
            this.state = {
                keyMaps: [],
                overlays: [],
                modeGen: 0,
                overwrite: false,
                delayingBlurEvent: false,
                focused: false,
                suppressEdits: false,
                pasteIncoming: -1,
                cutIncoming: -1,
                selectingText: false,
                draggingText: false,
                highlight: new Delayed,
                keySeq: null,
                specialChars: null
            };
            if (options.autofocus && !mobile)
                display.input.focus();
            if (ie && ie_version < 11)
                setTimeout(function() {
                    return this$1.display.input.reset(true)
                }, 20);
            registerEventHandlers(this);
            ensureGlobalHandlers();
            startOperation(this);
            this.curOp.forceUpdate = true;
            attachDoc(this, doc);
            if (options.autofocus && !mobile || this.hasFocus())
                setTimeout(function() {
                    if (this$1.hasFocus() && !this$1.state.focused)
                        onFocus(this$1)
                }, 20);
            else
                onBlur(this);
            for (var opt in optionHandlers)
                if (optionHandlers.hasOwnProperty(opt))
                    optionHandlers[opt](this, options[opt], Init);
            maybeUpdateLineNumberWidth(this);
            if (options.finishInit)
                options.finishInit(this);
            for (var i = 0; i < initHooks.length; ++i)
                initHooks[i](this);
            endOperation(this);
            if (webkit && options.lineWrapping && getComputedStyle(display.lineDiv).textRendering == "optimizelegibility")
                display.lineDiv.style.textRendering = "auto"
        }
        CodeMirror.defaults = defaults;
        CodeMirror.optionHandlers = optionHandlers;
        function registerEventHandlers(cm) {
            var d = cm.display;
            on(d.scroller, "mousedown", operation(cm, onMouseDown));
            if (ie && ie_version < 11)
                on(d.scroller, "dblclick", operation(cm, function(e) {
                    if (signalDOMEvent(cm, e))
                        return;
                    var pos = posFromMouse(cm, e);
                    if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e))
                        return;
                    e_preventDefault(e);
                    var word = cm.findWordAt(pos);
                    extendSelection(cm.doc, word.anchor, word.head)
                }));
            else
                on(d.scroller, "dblclick", function(e) {
                    return signalDOMEvent(cm, e) || e_preventDefault(e)
                });
            on(d.scroller, "contextmenu", function(e) {
                return onContextMenu(cm, e)
            });
            on(d.input.getField(), "contextmenu", function(e) {
                if (!d.scroller.contains(e.target))
                    onContextMenu(cm, e)
            });
            var touchFinished, prevTouch = {
                end: 0
            };
            function finishTouch() {
                if (d.activeTouch) {
                    touchFinished = setTimeout(function() {
                        return d.activeTouch = null
                    }, 1E3);
                    prevTouch = d.activeTouch;
                    prevTouch.end = +new Date
                }
            }
            function isMouseLikeTouchEvent(e) {
                if (e.touches.length != 1)
                    return false;
                var touch = e.touches[0];
                return touch.radiusX <= 1 && touch.radiusY <= 1
            }
            function farAway(touch, other) {
                if (other.left == null)
                    return true;
                var dx = other.left - touch.left
                  , dy = other.top - touch.top;
                return dx * dx + dy * dy > 20 * 20
            }
            on(d.scroller, "touchstart", function(e) {
                if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e) && !clickInGutter(cm, e)) {
                    d.input.ensurePolled();
                    clearTimeout(touchFinished);
                    var now = +new Date;
                    d.activeTouch = {
                        start: now,
                        moved: false,
                        prev: now - prevTouch.end <= 300 ? prevTouch : null
                    };
                    if (e.touches.length == 1) {
                        d.activeTouch.left = e.touches[0].pageX;
                        d.activeTouch.top = e.touches[0].pageY
                    }
                }
            });
            on(d.scroller, "touchmove", function() {
                if (d.activeTouch)
                    d.activeTouch.moved = true
            });
            on(d.scroller, "touchend", function(e) {
                var touch = d.activeTouch;
                if (touch && !eventInWidget(d, e) && touch.left != null && !touch.moved && new Date - touch.start < 300) {
                    var pos = cm.coordsChar(d.activeTouch, "page"), range;
                    if (!touch.prev || farAway(touch, touch.prev))
                        range = new Range(pos,pos);
                    else if (!touch.prev.prev || farAway(touch, touch.prev.prev))
                        range = cm.findWordAt(pos);
                    else
                        range = new Range(Pos(pos.line, 0),clipPos(cm.doc, Pos(pos.line + 1, 0)));
                    cm.setSelection(range.anchor, range.head);
                    cm.focus();
                    e_preventDefault(e)
                }
                finishTouch()
            });
            on(d.scroller, "touchcancel", finishTouch);
            on(d.scroller, "scroll", function() {
                if (d.scroller.clientHeight) {
                    updateScrollTop(cm, d.scroller.scrollTop);
                    setScrollLeft(cm, d.scroller.scrollLeft, true);
                    signal(cm, "scroll", cm)
                }
            });
            on(d.scroller, "mousewheel", function(e) {
                return onScrollWheel(cm, e)
            });
            on(d.scroller, "DOMMouseScroll", function(e) {
                return onScrollWheel(cm, e)
            });
            on(d.wrapper, "scroll", function() {
                return d.wrapper.scrollTop = d.wrapper.scrollLeft = 0
            });
            d.dragFunctions = {
                enter: function(e) {
                    if (!signalDOMEvent(cm, e))
                        e_stop(e)
                },
                over: function(e) {
                    if (!signalDOMEvent(cm, e)) {
                        onDragOver(cm, e);
                        e_stop(e)
                    }
                },
                start: function(e) {
                    return onDragStart(cm, e)
                },
                drop: operation(cm, onDrop),
                leave: function(e) {
                    if (!signalDOMEvent(cm, e))
                        clearDragCursor(cm)
                }
            };
            var inp = d.input.getField();
            on(inp, "keyup", function(e) {
                return onKeyUp.call(cm, e)
            });
            on(inp, "keydown", operation(cm, onKeyDown));
            on(inp, "keypress", operation(cm, onKeyPress));
            on(inp, "focus", function(e) {
                return onFocus(cm, e)
            });
            on(inp, "blur", function(e) {
                return onBlur(cm, e)
            })
        }
        var initHooks = [];
        CodeMirror.defineInitHook = function(f) {
            return initHooks.push(f)
        }
        ;
        function indentLine(cm, n, how, aggressive) {
            var doc = cm.doc, state;
            if (how == null)
                how = "add";
            if (how == "smart")
                if (!doc.mode.indent)
                    how = "prev";
                else
                    state = getContextBefore(cm, n).state;
            var tabSize = cm.options.tabSize;
            var line = getLine(doc, n)
              , curSpace = countColumn(line.text, null, tabSize);
            if (line.stateAfter)
                line.stateAfter = null;
            var curSpaceString = line.text.match(/^\s*/)[0], indentation;
            if (!aggressive && !/\S/.test(line.text)) {
                indentation = 0;
                how = "not"
            } else if (how == "smart") {
                indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
                if (indentation == Pass || indentation > 150) {
                    if (!aggressive)
                        return;
                    how = "prev"
                }
            }
            if (how == "prev")
                if (n > doc.first)
                    indentation = countColumn(getLine(doc, n - 1).text, null, tabSize);
                else
                    indentation = 0;
            else if (how == "add")
                indentation = curSpace + cm.options.indentUnit;
            else if (how == "subtract")
                indentation = curSpace - cm.options.indentUnit;
            else if (typeof how == "number")
                indentation = curSpace + how;
            indentation = Math.max(0, indentation);
            var indentString = ""
              , pos = 0;
            if (cm.options.indentWithTabs)
                for (var i = Math.floor(indentation / tabSize); i; --i) {
                    pos += tabSize;
                    indentString += "\t"
                }
            if (pos < indentation)
                indentString += spaceStr(indentation - pos);
            if (indentString != curSpaceString) {
                replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
                line.stateAfter = null;
                return true
            } else
                for (var i$1 = 0; i$1 < doc.sel.ranges.length; i$1++) {
                    var range = doc.sel.ranges[i$1];
                    if (range.head.line == n && range.head.ch < curSpaceString.length) {
                        var pos$1 = Pos(n, curSpaceString.length);
                        replaceOneSelection(doc, i$1, new Range(pos$1,pos$1));
                        break
                    }
                }
        }
        var lastCopied = null;
        function setLastCopied(newLastCopied) {
            lastCopied = newLastCopied
        }
        function applyTextInput(cm, inserted, deleted, sel, origin) {
            var doc = cm.doc;
            cm.display.shift = false;
            if (!sel)
                sel = doc.sel;
            var recent = +new Date - 200;
            var paste = origin == "paste" || cm.state.pasteIncoming > recent;
            var textLines = splitLinesAuto(inserted)
              , multiPaste = null;
            if (paste && sel.ranges.length > 1)
                if (lastCopied && lastCopied.text.join("\n") == inserted) {
                    if (sel.ranges.length % lastCopied.text.length == 0) {
                        multiPaste = [];
                        for (var i = 0; i < lastCopied.text.length; i++)
                            multiPaste.push(doc.splitLines(lastCopied.text[i]))
                    }
                } else if (textLines.length == sel.ranges.length && cm.options.pasteLinesPerSelection)
                    multiPaste = map(textLines, function(l) {
                        return [l]
                    });
            var updateInput = cm.curOp.updateInput;
            for (var i$1 = sel.ranges.length - 1; i$1 >= 0; i$1--) {
                var range = sel.ranges[i$1];
                var from = range.from()
                  , to = range.to();
                if (range.empty())
                    if (deleted && deleted > 0)
                        from = Pos(from.line, from.ch - deleted);
                    else if (cm.state.overwrite && !paste)
                        to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length));
                    else if (paste && lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == textLines.join("\n"))
                        from = to = Pos(from.line, 0);
                var changeEvent = {
                    from: from,
                    to: to,
                    text: multiPaste ? multiPaste[i$1 % multiPaste.length] : textLines,
                    origin: origin || (paste ? "paste" : cm.state.cutIncoming > recent ? "cut" : "+input")
                };
                makeChange(cm.doc, changeEvent);
                signalLater(cm, "inputRead", cm, changeEvent)
            }
            if (inserted && !paste)
                triggerElectric(cm, inserted);
            ensureCursorVisible(cm);
            if (cm.curOp.updateInput < 2)
                cm.curOp.updateInput = updateInput;
            cm.curOp.typing = true;
            cm.state.pasteIncoming = cm.state.cutIncoming = -1
        }
        function handlePaste(e, cm) {
            var pasted = e.clipboardData && e.clipboardData.getData("Text");
            if (pasted) {
                e.preventDefault();
                if (!cm.isReadOnly() && !cm.options.disableInput && cm.hasFocus())
                    runInOp(cm, function() {
                        return applyTextInput(cm, pasted, 0, null, "paste")
                    });
                return true
            }
        }
        function triggerElectric(cm, inserted) {
            if (!cm.options.electricChars || !cm.options.smartIndent)
                return;
            var sel = cm.doc.sel;
            for (var i = sel.ranges.length - 1; i >= 0; i--) {
                var range = sel.ranges[i];
                if (range.head.ch > 100 || i && sel.ranges[i - 1].head.line == range.head.line)
                    continue;
                var mode = cm.getModeAt(range.head);
                var indented = false;
                if (mode.electricChars)
                    for (var j = 0; j < mode.electricChars.length; j++) {
                        if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
                            indented = indentLine(cm, range.head.line, "smart");
                            break
                        }
                    }
                else if (mode.electricInput)
                    if (mode.electricInput.test(getLine(cm.doc, range.head.line).text.slice(0, range.head.ch)))
                        indented = indentLine(cm, range.head.line, "smart");
                if (indented)
                    signalLater(cm, "electricInput", cm, range.head.line)
            }
        }
        function copyableRanges(cm) {
            var text = []
              , ranges = [];
            for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
                var line = cm.doc.sel.ranges[i].head.line;
                var lineRange = {
                    anchor: Pos(line, 0),
                    head: Pos(line + 1, 0)
                };
                ranges.push(lineRange);
                text.push(cm.getRange(lineRange.anchor, lineRange.head))
            }
            return {
                text: text,
                ranges: ranges
            }
        }
        function disableBrowserMagic(field, spellcheck, autocorrect, autocapitalize) {
            field.setAttribute("autocorrect", autocorrect ? "" : "off");
            field.setAttribute("autocapitalize", autocapitalize ? "" : "off");
            field.setAttribute("spellcheck", !!spellcheck)
        }
        function hiddenTextarea() {
            var te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; min-height: 1em; outline: none");
            var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
            if (webkit)
                te.style.width = "1000px";
            else
                te.setAttribute("wrap", "off");
            if (ios)
                te.style.border = "1px solid black";
            disableBrowserMagic(te);
            return div
        }
        function addEditorMethods(CodeMirror) {
            var optionHandlers = CodeMirror.optionHandlers;
            var helpers = CodeMirror.helpers = {};
            CodeMirror.prototype = {
                constructor: CodeMirror,
                focus: function() {
                    window.focus();
                    this.display.input.focus()
                },
                setOption: function(option, value) {
                    var options = this.options
                      , old = options[option];
                    if (options[option] == value && option != "mode")
                        return;
                    options[option] = value;
                    if (optionHandlers.hasOwnProperty(option))
                        operation(this, optionHandlers[option])(this, value, old);
                    signal(this, "optionChange", this, option)
                },
                getOption: function(option) {
                    return this.options[option]
                },
                getDoc: function() {
                    return this.doc
                },
                addKeyMap: function(map, bottom) {
                    this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map))
                },
                removeKeyMap: function(map) {
                    var maps = this.state.keyMaps;
                    for (var i = 0; i < maps.length; ++i)
                        if (maps[i] == map || maps[i].name == map) {
                            maps.splice(i, 1);
                            return true
                        }
                },
                addOverlay: methodOp(function(spec, options) {
                    var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
                    if (mode.startState)
                        throw new Error("Overlays may not be stateful.");
                    insertSorted(this.state.overlays, {
                        mode: mode,
                        modeSpec: spec,
                        opaque: options && options.opaque,
                        priority: options && options.priority || 0
                    }, function(overlay) {
                        return overlay.priority
                    });
                    this.state.modeGen++;
                    regChange(this)
                }),
                removeOverlay: methodOp(function(spec) {
                    var overlays = this.state.overlays;
                    for (var i = 0; i < overlays.length; ++i) {
                        var cur = overlays[i].modeSpec;
                        if (cur == spec || typeof spec == "string" && cur.name == spec) {
                            overlays.splice(i, 1);
                            this.state.modeGen++;
                            regChange(this);
                            return
                        }
                    }
                }),
                indentLine: methodOp(function(n, dir, aggressive) {
                    if (typeof dir != "string" && typeof dir != "number")
                        if (dir == null)
                            dir = this.options.smartIndent ? "smart" : "prev";
                        else
                            dir = dir ? "add" : "subtract";
                    if (isLine(this.doc, n))
                        indentLine(this, n, dir, aggressive)
                }),
                indentSelection: methodOp(function(how) {
                    var ranges = this.doc.sel.ranges
                      , end = -1;
                    for (var i = 0; i < ranges.length; i++) {
                        var range = ranges[i];
                        if (!range.empty()) {
                            var from = range.from()
                              , to = range.to();
                            var start = Math.max(end, from.line);
                            end = Math.min(this.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
                            for (var j = start; j < end; ++j)
                                indentLine(this, j, how);
                            var newRanges = this.doc.sel.ranges;
                            if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0)
                                replaceOneSelection(this.doc, i, new Range(from,newRanges[i].to()), sel_dontScroll)
                        } else if (range.head.line > end) {
                            indentLine(this, range.head.line, how, true);
                            end = range.head.line;
                            if (i == this.doc.sel.primIndex)
                                ensureCursorVisible(this)
                        }
                    }
                }),
                getTokenAt: function(pos, precise) {
                    return takeToken(this, pos, precise)
                },
                getLineTokens: function(line, precise) {
                    return takeToken(this, Pos(line), precise, true)
                },
                getTokenTypeAt: function(pos) {
                    pos = clipPos(this.doc, pos);
                    var styles = getLineStyles(this, getLine(this.doc, pos.line));
                    var before = 0
                      , after = (styles.length - 1) / 2
                      , ch = pos.ch;
                    var type;
                    if (ch == 0)
                        type = styles[2];
                    else
                        for (; ; ) {
                            var mid = before + after >> 1;
                            if ((mid ? styles[mid * 2 - 1] : 0) >= ch)
                                after = mid;
                            else if (styles[mid * 2 + 1] < ch)
                                before = mid + 1;
                            else {
                                type = styles[mid * 2 + 2];
                                break
                            }
                        }
                    var cut = type ? type.indexOf("overlay ") : -1;
                    return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1)
                },
                getModeAt: function(pos) {
                    var mode = this.doc.mode;
                    if (!mode.innerMode)
                        return mode;
                    return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode
                },
                getHelper: function(pos, type) {
                    return this.getHelpers(pos, type)[0]
                },
                getHelpers: function(pos, type) {
                    var found = [];
                    if (!helpers.hasOwnProperty(type))
                        return found;
                    var help = helpers[type]
                      , mode = this.getModeAt(pos);
                    if (typeof mode[type] == "string") {
                        if (help[mode[type]])
                            found.push(help[mode[type]])
                    } else if (mode[type])
                        for (var i = 0; i < mode[type].length; i++) {
                            var val = help[mode[type][i]];
                            if (val)
                                found.push(val)
                        }
                    else if (mode.helperType && help[mode.helperType])
                        found.push(help[mode.helperType]);
                    else if (help[mode.name])
                        found.push(help[mode.name]);
                    for (var i$1 = 0; i$1 < help._global.length; i$1++) {
                        var cur = help._global[i$1];
                        if (cur.pred(mode, this) && indexOf(found, cur.val) == -1)
                            found.push(cur.val)
                    }
                    return found
                },
                getStateAfter: function(line, precise) {
                    var doc = this.doc;
                    line = clipLine(doc, line == null ? doc.first + doc.size - 1 : line);
                    return getContextBefore(this, line + 1, precise).state
                },
                cursorCoords: function(start, mode) {
                    var pos, range = this.doc.sel.primary();
                    if (start == null)
                        pos = range.head;
                    else if (typeof start == "object")
                        pos = clipPos(this.doc, start);
                    else
                        pos = start ? range.from() : range.to();
                    return cursorCoords(this, pos, mode || "page")
                },
                charCoords: function(pos, mode) {
                    return charCoords(this, clipPos(this.doc, pos), mode || "page")
                },
                coordsChar: function(coords, mode) {
                    coords = fromCoordSystem(this, coords, mode || "page");
                    return coordsChar(this, coords.left, coords.top)
                },
                lineAtHeight: function(height, mode) {
                    height = fromCoordSystem(this, {
                        top: height,
                        left: 0
                    }, mode || "page").top;
                    return lineAtHeight(this.doc, height + this.display.viewOffset)
                },
                heightAtLine: function(line, mode, includeWidgets) {
                    var end = false, lineObj;
                    if (typeof line == "number") {
                        var last = this.doc.first + this.doc.size - 1;
                        if (line < this.doc.first)
                            line = this.doc.first;
                        else if (line > last) {
                            line = last;
                            end = true
                        }
                        lineObj = getLine(this.doc, line)
                    } else
                        lineObj = line;
                    return intoCoordSystem(this, lineObj, {
                        top: 0,
                        left: 0
                    }, mode || "page", includeWidgets || end).top + (end ? this.doc.height - heightAtLine(lineObj) : 0)
                },
                defaultTextHeight: function() {
                    return textHeight(this.display)
                },
                defaultCharWidth: function() {
                    return charWidth(this.display)
                },
                getViewport: function() {
                    return {
                        from: this.display.viewFrom,
                        to: this.display.viewTo
                    }
                },
                addWidget: function(pos, node, scroll, vert, horiz) {
                    var display = this.display;
                    pos = cursorCoords(this, clipPos(this.doc, pos));
                    var top = pos.bottom
                      , left = pos.left;
                    node.style.position = "absolute";
                    node.setAttribute("cm-ignore-events", "true");
                    this.display.input.setUneditable(node);
                    display.sizer.appendChild(node);
                    if (vert == "over")
                        top = pos.top;
                    else if (vert == "above" || vert == "near") {
                        var vspace = Math.max(display.wrapper.clientHeight, this.doc.height)
                          , hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
                        if ((vert == "above" || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight)
                            top = pos.top - node.offsetHeight;
                        else if (pos.bottom + node.offsetHeight <= vspace)
                            top = pos.bottom;
                        if (left + node.offsetWidth > hspace)
                            left = hspace - node.offsetWidth
                    }
                    node.style.top = top + "px";
                    node.style.left = node.style.right = "";
                    if (horiz == "right") {
                        left = display.sizer.clientWidth - node.offsetWidth;
                        node.style.right = "0px"
                    } else {
                        if (horiz == "left")
                            left = 0;
                        else if (horiz == "middle")
                            left = (display.sizer.clientWidth - node.offsetWidth) / 2;
                        node.style.left = left + "px"
                    }
                    if (scroll)
                        scrollIntoView(this, {
                            left: left,
                            top: top,
                            right: left + node.offsetWidth,
                            bottom: top + node.offsetHeight
                        })
                },
                triggerOnKeyDown: methodOp(onKeyDown),
                triggerOnKeyPress: methodOp(onKeyPress),
                triggerOnKeyUp: onKeyUp,
                triggerOnMouseDown: methodOp(onMouseDown),
                execCommand: function(cmd) {
                    if (commands.hasOwnProperty(cmd))
                        return commands[cmd].call(null, this)
                },
                triggerElectric: methodOp(function(text) {
                    triggerElectric(this, text)
                }),
                findPosH: function(from, amount, unit, visually) {
                    var dir = 1;
                    if (amount < 0) {
                        dir = -1;
                        amount = -amount
                    }
                    var cur = clipPos(this.doc, from);
                    for (var i = 0; i < amount; ++i) {
                        cur = findPosH(this.doc, cur, dir, unit, visually);
                        if (cur.hitSide)
                            break
                    }
                    return cur
                },
                moveH: methodOp(function(dir, unit) {
                    var this$1 = this;
                    this.extendSelectionsBy(function(range) {
                        if (this$1.display.shift || this$1.doc.extend || range.empty())
                            return findPosH(this$1.doc, range.head, dir, unit, this$1.options.rtlMoveVisually);
                        else
                            return dir < 0 ? range.from() : range.to()
                    }, sel_move)
                }),
                deleteH: methodOp(function(dir, unit) {
                    var sel = this.doc.sel
                      , doc = this.doc;
                    if (sel.somethingSelected())
                        doc.replaceSelection("", null, "+delete");
                    else
                        deleteNearSelection(this, function(range) {
                            var other = findPosH(doc, range.head, dir, unit, false);
                            return dir < 0 ? {
                                from: other,
                                to: range.head
                            } : {
                                from: range.head,
                                to: other
                            }
                        })
                }),
                findPosV: function(from, amount, unit, goalColumn) {
                    var dir = 1
                      , x = goalColumn;
                    if (amount < 0) {
                        dir = -1;
                        amount = -amount
                    }
                    var cur = clipPos(this.doc, from);
                    for (var i = 0; i < amount; ++i) {
                        var coords = cursorCoords(this, cur, "div");
                        if (x == null)
                            x = coords.left;
                        else
                            coords.left = x;
                        cur = findPosV(this, coords, dir, unit);
                        if (cur.hitSide)
                            break
                    }
                    return cur
                },
                moveV: methodOp(function(dir, unit) {
                    var this$1 = this;
                    var doc = this.doc
                      , goals = [];
                    var collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected();
                    doc.extendSelectionsBy(function(range) {
                        if (collapse)
                            return dir < 0 ? range.from() : range.to();
                        var headPos = cursorCoords(this$1, range.head, "div");
                        if (range.goalColumn != null)
                            headPos.left = range.goalColumn;
                        goals.push(headPos.left);
                        var pos = findPosV(this$1, headPos, dir, unit);
                        if (unit == "page" && range == doc.sel.primary())
                            addToScrollTop(this$1, charCoords(this$1, pos, "div").top - headPos.top);
                        return pos
                    }, sel_move);
                    if (goals.length)
                        for (var i = 0; i < doc.sel.ranges.length; i++)
                            doc.sel.ranges[i].goalColumn = goals[i]
                }),
                findWordAt: function(pos) {
                    var doc = this.doc
                      , line = getLine(doc, pos.line).text;
                    var start = pos.ch
                      , end = pos.ch;
                    if (line) {
                        var helper = this.getHelper(pos, "wordChars");
                        if ((pos.sticky == "before" || end == line.length) && start)
                            --start;
                        else
                            ++end;
                        var startChar = line.charAt(start);
                        var check = isWordChar(startChar, helper) ? function(ch) {
                            return isWordChar(ch, helper)
                        }
                        : /\s/.test(startChar) ? function(ch) {
                            return /\s/.test(ch)
                        }
                        : function(ch) {
                            return !/\s/.test(ch) && !isWordChar(ch)
                        }
                        ;
                        while (start > 0 && check(line.charAt(start - 1)))
                            --start;
                        while (end < line.length && check(line.charAt(end)))
                            ++end
                    }
                    return new Range(Pos(pos.line, start),Pos(pos.line, end))
                },
                toggleOverwrite: function(value) {
                    if (value != null && value == this.state.overwrite)
                        return;
                    if (this.state.overwrite = !this.state.overwrite)
                        addClass(this.display.cursorDiv, "CodeMirror-overwrite");
                    else
                        rmClass(this.display.cursorDiv, "CodeMirror-overwrite");
                    signal(this, "overwriteToggle", this, this.state.overwrite)
                },
                hasFocus: function() {
                    return this.display.input.getField() == activeElt()
                },
                isReadOnly: function() {
                    return !!(this.options.readOnly || this.doc.cantEdit)
                },
                scrollTo: methodOp(function(x, y) {
                    scrollToCoords(this, x, y)
                }),
                getScrollInfo: function() {
                    var scroller = this.display.scroller;
                    return {
                        left: scroller.scrollLeft,
                        top: scroller.scrollTop,
                        height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
                        width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
                        clientHeight: displayHeight(this),
                        clientWidth: displayWidth(this)
                    }
                },
                scrollIntoView: methodOp(function(range, margin) {
                    if (range == null) {
                        range = {
                            from: this.doc.sel.primary().head,
                            to: null
                        };
                        if (margin == null)
                            margin = this.options.cursorScrollMargin
                    } else if (typeof range == "number")
                        range = {
                            from: Pos(range, 0),
                            to: null
                        };
                    else if (range.from == null)
                        range = {
                            from: range,
                            to: null
                        };
                    if (!range.to)
                        range.to = range.from;
                    range.margin = margin || 0;
                    if (range.from.line != null)
                        scrollToRange(this, range);
                    else
                        scrollToCoordsRange(this, range.from, range.to, range.margin)
                }),
                setSize: methodOp(function(width, height) {
                    var this$1 = this;
                    var interpret = function(val) {
                        return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val
                    };
                    if (width != null)
                        this.display.wrapper.style.width = interpret(width);
                    if (height != null)
                        this.display.wrapper.style.height = interpret(height);
                    if (this.options.lineWrapping)
                        clearLineMeasurementCache(this);
                    var lineNo = this.display.viewFrom;
                    this.doc.iter(lineNo, this.display.viewTo, function(line) {
                        if (line.widgets)
                            for (var i = 0; i < line.widgets.length; i++)
                                if (line.widgets[i].noHScroll) {
                                    regLineChange(this$1, lineNo, "widget");
                                    break
                                }
                        ++lineNo
                    });
                    this.curOp.forceUpdate = true;
                    signal(this, "refresh", this)
                }),
                operation: function(f) {
                    return runInOp(this, f)
                },
                startOperation: function() {
                    return startOperation(this)
                },
                endOperation: function() {
                    return endOperation(this)
                },
                refresh: methodOp(function() {
                    var oldHeight = this.display.cachedTextHeight;
                    regChange(this);
                    this.curOp.forceUpdate = true;
                    clearCaches(this);
                    scrollToCoords(this, this.doc.scrollLeft, this.doc.scrollTop);
                    updateGutterSpace(this.display);
                    if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5 || this.options.lineWrapping)
                        estimateLineHeights(this);
                    signal(this, "refresh", this)
                }),
                swapDoc: methodOp(function(doc) {
                    var old = this.doc;
                    old.cm = null;
                    if (this.state.selectingText)
                        this.state.selectingText();
                    attachDoc(this, doc);
                    clearCaches(this);
                    this.display.input.reset();
                    scrollToCoords(this, doc.scrollLeft, doc.scrollTop);
                    this.curOp.forceScroll = true;
                    signalLater(this, "swapDoc", this, old);
                    return old
                }),
                phrase: function(phraseText) {
                    var phrases = this.options.phrases;
                    return phrases && Object.prototype.hasOwnProperty.call(phrases, phraseText) ? phrases[phraseText] : phraseText
                },
                getInputField: function() {
                    return this.display.input.getField()
                },
                getWrapperElement: function() {
                    return this.display.wrapper
                },
                getScrollerElement: function() {
                    return this.display.scroller
                },
                getGutterElement: function() {
                    return this.display.gutters
                }
            };
            eventMixin(CodeMirror);
            CodeMirror.registerHelper = function(type, name, value) {
                if (!helpers.hasOwnProperty(type))
                    helpers[type] = CodeMirror[type] = {
                        _global: []
                    };
                helpers[type][name] = value
            }
            ;
            CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
                CodeMirror.registerHelper(type, name, value);
                helpers[type]._global.push({
                    pred: predicate,
                    val: value
                })
            }
        }
        function findPosH(doc, pos, dir, unit, visually) {
            var oldPos = pos;
            var origDir = dir;
            var lineObj = getLine(doc, pos.line);
            var lineDir = visually && doc.direction == "rtl" ? -dir : dir;
            function findNextLine() {
                var l = pos.line + lineDir;
                if (l < doc.first || l >= doc.first + doc.size)
                    return false;
                pos = new Pos(l,pos.ch,pos.sticky);
                return lineObj = getLine(doc, l)
            }
            function moveOnce(boundToLine) {
                var next;
                if (unit == "codepoint") {
                    var ch = lineObj.text.charCodeAt(pos.ch + (dir > 0 ? 0 : -1));
                    if (isNaN(ch))
                        next = null;
                    else {
                        var astral = dir > 0 ? ch >= 55296 && ch < 56320 : ch >= 56320 && ch < 57343;
                        next = new Pos(pos.line,Math.max(0, Math.min(lineObj.text.length, pos.ch + dir * (astral ? 2 : 1))),-dir)
                    }
                } else if (visually)
                    next = moveVisually(doc.cm, lineObj, pos, dir);
                else
                    next = moveLogically(lineObj, pos, dir);
                if (next == null)
                    if (!boundToLine && findNextLine())
                        pos = endOfLine(visually, doc.cm, lineObj, pos.line, lineDir);
                    else
                        return false;
                else
                    pos = next;
                return true
            }
            if (unit == "char" || unit == "codepoint")
                moveOnce();
            else if (unit == "column")
                moveOnce(true);
            else if (unit == "word" || unit == "group") {
                var sawType = null
                  , group = unit == "group";
                var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");
                for (var first = true; ; first = false) {
                    if (dir < 0 && !moveOnce(!first))
                        break;
                    var cur = lineObj.text.charAt(pos.ch) || "\n";
                    var type = isWordChar(cur, helper) ? "w" : group && cur == "\n" ? "n" : !group || /\s/.test(cur) ? null : "p";
                    if (group && !first && !type)
                        type = "s";
                    if (sawType && sawType != type) {
                        if (dir < 0) {
                            dir = 1;
                            moveOnce();
                            pos.sticky = "after"
                        }
                        break
                    }
                    if (type)
                        sawType = type;
                    if (dir > 0 && !moveOnce(!first))
                        break
                }
            }
            var result = skipAtomic(doc, pos, oldPos, origDir, true);
            if (equalCursorPos(oldPos, result))
                result.hitSide = true;
            return result
        }
        function findPosV(cm, pos, dir, unit) {
            var doc = cm.doc, x = pos.left, y;
            if (unit == "page") {
                var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
                var moveAmount = Math.max(pageSize - .5 * textHeight(cm.display), 3);
                y = (dir > 0 ? pos.bottom : pos.top) + dir * moveAmount
            } else if (unit == "line")
                y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
            var target;
            for (; ; ) {
                target = coordsChar(cm, x, y);
                if (!target.outside)
                    break;
                if (dir < 0 ? y <= 0 : y >= doc.height) {
                    target.hitSide = true;
                    break
                }
                y += dir * 5
            }
            return target
        }
        var ContentEditableInput = function(cm) {
            this.cm = cm;
            this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
            this.polling = new Delayed;
            this.composing = null;
            this.gracePeriod = false;
            this.readDOMTimeout = null
        };
        ContentEditableInput.prototype.init = function(display) {
            var this$1 = this;
            var input = this
              , cm = input.cm;
            var div = input.div = display.lineDiv;
            div.contentEditable = true;
            disableBrowserMagic(div, cm.options.spellcheck, cm.options.autocorrect, cm.options.autocapitalize);
            function belongsToInput(e) {
                for (var t = e.target; t; t = t.parentNode) {
                    if (t == div)
                        return true;
                    if (/\bCodeMirror-(?:line)?widget\b/.test(t.className))
                        break
                }
                return false
            }
            on(div, "paste", function(e) {
                if (!belongsToInput(e) || signalDOMEvent(cm, e) || handlePaste(e, cm))
                    return;
                if (ie_version <= 11)
                    setTimeout(operation(cm, function() {
                        return this$1.updateFromDOM()
                    }), 20)
            });
            on(div, "compositionstart", function(e) {
                this$1.composing = {
                    data: e.data,
                    done: false
                }
            });
            on(div, "compositionupdate", function(e) {
                if (!this$1.composing)
                    this$1.composing = {
                        data: e.data,
                        done: false
                    }
            });
            on(div, "compositionend", function(e) {
                if (this$1.composing) {
                    if (e.data != this$1.composing.data)
                        this$1.readFromDOMSoon();
                    this$1.composing.done = true
                }
            });
            on(div, "touchstart", function() {
                return input.forceCompositionEnd()
            });
            on(div, "input", function() {
                if (!this$1.composing)
                    this$1.readFromDOMSoon()
            });
            function onCopyCut(e) {
                if (!belongsToInput(e) || signalDOMEvent(cm, e))
                    return;
                if (cm.somethingSelected()) {
                    setLastCopied({
                        lineWise: false,
                        text: cm.getSelections()
                    });
                    if (e.type == "cut")
                        cm.replaceSelection("", null, "cut")
                } else if (!cm.options.lineWiseCopyCut)
                    return;
                else {
                    var ranges = copyableRanges(cm);
                    setLastCopied({
                        lineWise: true,
                        text: ranges.text
                    });
                    if (e.type == "cut")
                        cm.operation(function() {
                            cm.setSelections(ranges.ranges, 0, sel_dontScroll);
                            cm.replaceSelection("", null, "cut")
                        })
                }
                if (e.clipboardData) {
                    e.clipboardData.clearData();
                    var content = lastCopied.text.join("\n");
                    e.clipboardData.setData("Text", content);
                    if (e.clipboardData.getData("Text") == content) {
                        e.preventDefault();
                        return
                    }
                }
                var kludge = hiddenTextarea()
                  , te = kludge.firstChild;
                cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
                te.value = lastCopied.text.join("\n");
                var hadFocus = activeElt();
                selectInput(te);
                setTimeout(function() {
                    cm.display.lineSpace.removeChild(kludge);
                    hadFocus.focus();
                    if (hadFocus == div)
                        input.showPrimarySelection()
                }, 50)
            }
            on(div, "copy", onCopyCut);
            on(div, "cut", onCopyCut)
        }
        ;
        ContentEditableInput.prototype.screenReaderLabelChanged = function(label) {
            if (label)
                this.div.setAttribute("aria-label", label);
            else
                this.div.removeAttribute("aria-label")
        }
        ;
        ContentEditableInput.prototype.prepareSelection = function() {
            var result = prepareSelection(this.cm, false);
            result.focus = activeElt() == this.div;
            return result
        }
        ;
        ContentEditableInput.prototype.showSelection = function(info, takeFocus) {
            if (!info || !this.cm.display.view.length)
                return;
            if (info.focus || takeFocus)
                this.showPrimarySelection();
            this.showMultipleSelections(info)
        }
        ;
        ContentEditableInput.prototype.getSelection = function() {
            return this.cm.display.wrapper.ownerDocument.getSelection()
        }
        ;
        ContentEditableInput.prototype.showPrimarySelection = function() {
            var sel = this.getSelection()
              , cm = this.cm
              , prim = cm.doc.sel.primary();
            var from = prim.from()
              , to = prim.to();
            if (cm.display.viewTo == cm.display.viewFrom || from.line >= cm.display.viewTo || to.line < cm.display.viewFrom) {
                sel.removeAllRanges();
                return
            }
            var curAnchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
            var curFocus = domToPos(cm, sel.focusNode, sel.focusOffset);
            if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad && cmp(minPos(curAnchor, curFocus), from) == 0 && cmp(maxPos(curAnchor, curFocus), to) == 0)
                return;
            var view = cm.display.view;
            var start = from.line >= cm.display.viewFrom && posToDOM(cm, from) || {
                node: view[0].measure.map[2],
                offset: 0
            };
            var end = to.line < cm.display.viewTo && posToDOM(cm, to);
            if (!end) {
                var measure = view[view.length - 1].measure;
                var map = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
                end = {
                    node: map[map.length - 1],
                    offset: map[map.length - 2] - map[map.length - 3]
                }
            }
            if (!start || !end) {
                sel.removeAllRanges();
                return
            }
            var old = sel.rangeCount && sel.getRangeAt(0), rng;
            try {
                rng = range(start.node, start.offset, end.offset, end.node)
            } catch (e) {}
            if (rng) {
                if (!gecko && cm.state.focused) {
                    sel.collapse(start.node, start.offset);
                    if (!rng.collapsed) {
                        sel.removeAllRanges();
                        sel.addRange(rng)
                    }
                } else {
                    sel.removeAllRanges();
                    sel.addRange(rng)
                }
                if (old && sel.anchorNode == null)
                    sel.addRange(old);
                else if (gecko)
                    this.startGracePeriod()
            }
            this.rememberSelection()
        }
        ;
        ContentEditableInput.prototype.startGracePeriod = function() {
            var this$1 = this;
            clearTimeout(this.gracePeriod);
            this.gracePeriod = setTimeout(function() {
                this$1.gracePeriod = false;
                if (this$1.selectionChanged())
                    this$1.cm.operation(function() {
                        return this$1.cm.curOp.selectionChanged = true
                    })
            }, 20)
        }
        ;
        ContentEditableInput.prototype.showMultipleSelections = function(info) {
            removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
            removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection)
        }
        ;
        ContentEditableInput.prototype.rememberSelection = function() {
            var sel = this.getSelection();
            this.lastAnchorNode = sel.anchorNode;
            this.lastAnchorOffset = sel.anchorOffset;
            this.lastFocusNode = sel.focusNode;
            this.lastFocusOffset = sel.focusOffset
        }
        ;
        ContentEditableInput.prototype.selectionInEditor = function() {
            var sel = this.getSelection();
            if (!sel.rangeCount)
                return false;
            var node = sel.getRangeAt(0).commonAncestorContainer;
            return contains(this.div, node)
        }
        ;
        ContentEditableInput.prototype.focus = function() {
            if (this.cm.options.readOnly != "nocursor") {
                if (!this.selectionInEditor() || activeElt() != this.div)
                    this.showSelection(this.prepareSelection(), true);
                this.div.focus()
            }
        }
        ;
        ContentEditableInput.prototype.blur = function() {
            this.div.blur()
        }
        ;
        ContentEditableInput.prototype.getField = function() {
            return this.div
        }
        ;
        ContentEditableInput.prototype.supportsTouch = function() {
            return true
        }
        ;
        ContentEditableInput.prototype.receivedFocus = function() {
            var this$1 = this;
            var input = this;
            if (this.selectionInEditor())
                setTimeout(function() {
                    return this$1.pollSelection()
                }, 20);
            else
                runInOp(this.cm, function() {
                    return input.cm.curOp.selectionChanged = true
                });
            function poll() {
                if (input.cm.state.focused) {
                    input.pollSelection();
                    input.polling.set(input.cm.options.pollInterval, poll)
                }
            }
            this.polling.set(this.cm.options.pollInterval, poll)
        }
        ;
        ContentEditableInput.prototype.selectionChanged = function() {
            var sel = this.getSelection();
            return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset || sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset
        }
        ;
        ContentEditableInput.prototype.pollSelection = function() {
            if (this.readDOMTimeout != null || this.gracePeriod || !this.selectionChanged())
                return;
            var sel = this.getSelection()
              , cm = this.cm;
            if (android && chrome && this.cm.display.gutterSpecs.length && isInGutter(sel.anchorNode)) {
                this.cm.triggerOnKeyDown({
                    type: "keydown",
                    keyCode: 8,
                    preventDefault: Math.abs
                });
                this.blur();
                this.focus();
                return
            }
            if (this.composing)
                return;
            this.rememberSelection();
            var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
            var head = domToPos(cm, sel.focusNode, sel.focusOffset);
            if (anchor && head)
                runInOp(cm, function() {
                    setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);
                    if (anchor.bad || head.bad)
                        cm.curOp.selectionChanged = true
                })
        }
        ;
        ContentEditableInput.prototype.pollContent = function() {
            if (this.readDOMTimeout != null) {
                clearTimeout(this.readDOMTimeout);
                this.readDOMTimeout = null
            }
            var cm = this.cm
              , display = cm.display
              , sel = cm.doc.sel.primary();
            var from = sel.from()
              , to = sel.to();
            if (from.ch == 0 && from.line > cm.firstLine())
                from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length);
            if (to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine())
                to = Pos(to.line + 1, 0);
            if (from.line < display.viewFrom || to.line > display.viewTo - 1)
                return false;
            var fromIndex, fromLine, fromNode;
            if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
                fromLine = lineNo(display.view[0].line);
                fromNode = display.view[0].node
            } else {
                fromLine = lineNo(display.view[fromIndex].line);
                fromNode = display.view[fromIndex - 1].node.nextSibling
            }
            var toIndex = findViewIndex(cm, to.line);
            var toLine, toNode;
            if (toIndex == display.view.length - 1) {
                toLine = display.viewTo - 1;
                toNode = display.lineDiv.lastChild
            } else {
                toLine = lineNo(display.view[toIndex + 1].line) - 1;
                toNode = display.view[toIndex + 1].node.previousSibling
            }
            if (!fromNode)
                return false;
            var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
            var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));
            while (newText.length > 1 && oldText.length > 1)
                if (lst(newText) == lst(oldText)) {
                    newText.pop();
                    oldText.pop();
                    toLine--
                } else if (newText[0] == oldText[0]) {
                    newText.shift();
                    oldText.shift();
                    fromLine++
                } else
                    break;
            var cutFront = 0
              , cutEnd = 0;
            var newTop = newText[0]
              , oldTop = oldText[0]
              , maxCutFront = Math.min(newTop.length, oldTop.length);
            while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront))
                ++cutFront;
            var newBot = lst(newText)
              , oldBot = lst(oldText);
            var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0), oldBot.length - (oldText.length == 1 ? cutFront : 0));
            while (cutEnd < maxCutEnd && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1))
                ++cutEnd;
            if (newText.length == 1 && oldText.length == 1 && fromLine == from.line)
                while (cutFront && cutFront > from.ch && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
                    cutFront--;
                    cutEnd++
                }
            newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, "");
            newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "");
            var chFrom = Pos(fromLine, cutFront);
            var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);
            if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
                replaceRange(cm.doc, newText, chFrom, chTo, "+input");
                return true
            }
        }
        ;
        ContentEditableInput.prototype.ensurePolled = function() {
            this.forceCompositionEnd()
        }
        ;
        ContentEditableInput.prototype.reset = function() {
            this.forceCompositionEnd()
        }
        ;
        ContentEditableInput.prototype.forceCompositionEnd = function() {
            if (!this.composing)
                return;
            clearTimeout(this.readDOMTimeout);
            this.composing = null;
            this.updateFromDOM();
            this.div.blur();
            this.div.focus()
        }
        ;
        ContentEditableInput.prototype.readFromDOMSoon = function() {
            var this$1 = this;
            if (this.readDOMTimeout != null)
                return;
            this.readDOMTimeout = setTimeout(function() {
                this$1.readDOMTimeout = null;
                if (this$1.composing)
                    if (this$1.composing.done)
                        this$1.composing = null;
                    else
                        return;
                this$1.updateFromDOM()
            }, 80)
        }
        ;
        ContentEditableInput.prototype.updateFromDOM = function() {
            var this$1 = this;
            if (this.cm.isReadOnly() || !this.pollContent())
                runInOp(this.cm, function() {
                    return regChange(this$1.cm)
                })
        }
        ;
        ContentEditableInput.prototype.setUneditable = function(node) {
            node.contentEditable = "false"
        }
        ;
        ContentEditableInput.prototype.onKeyPress = function(e) {
            if (e.charCode == 0 || this.composing)
                return;
            e.preventDefault();
            if (!this.cm.isReadOnly())
                operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0)
        }
        ;
        ContentEditableInput.prototype.readOnlyChanged = function(val) {
            this.div.contentEditable = String(val != "nocursor")
        }
        ;
        ContentEditableInput.prototype.onContextMenu = function() {}
        ;
        ContentEditableInput.prototype.resetPosition = function() {}
        ;
        ContentEditableInput.prototype.needsContentAttribute = true;
        function posToDOM(cm, pos) {
            var view = findViewForLine(cm, pos.line);
            if (!view || view.hidden)
                return null;
            var line = getLine(cm.doc, pos.line);
            var info = mapFromLineView(view, line, pos.line);
            var order = getOrder(line, cm.doc.direction)
              , side = "left";
            if (order) {
                var partPos = getBidiPartAt(order, pos.ch);
                side = partPos % 2 ? "right" : "left"
            }
            var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
            result.offset = result.collapse == "right" ? result.end : result.start;
            return result
        }
        function isInGutter(node) {
            for (var scan = node; scan; scan = scan.parentNode)
                if (/CodeMirror-gutter-wrapper/.test(scan.className))
                    return true;
            return false
        }
        function badPos(pos, bad) {
            if (bad)
                pos.bad = true;
            return pos
        }
        function domTextBetween(cm, from, to, fromLine, toLine) {
            var text = ""
              , closing = false
              , lineSep = cm.doc.lineSeparator()
              , extraLinebreak = false;
            function recognizeMarker(id) {
                return function(marker) {
                    return marker.id == id
                }
            }
            function close() {
                if (closing) {
                    text += lineSep;
                    if (extraLinebreak)
                        text += lineSep;
                    closing = extraLinebreak = false
                }
            }
            function addText(str) {
                if (str) {
                    close();
                    text += str
                }
            }
            function walk(node) {
                if (node.nodeType == 1) {
                    var cmText = node.getAttribute("cm-text");
                    if (cmText) {
                        addText(cmText);
                        return
                    }
                    var markerID = node.getAttribute("cm-marker"), range;
                    if (markerID) {
                        var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));
                        if (found.length && (range = found[0].find(0)))
                            addText(getBetween(cm.doc, range.from, range.to).join(lineSep));
                        return
                    }
                    if (node.getAttribute("contenteditable") == "false")
                        return;
                    var isBlock = /^(pre|div|p|li|table|br)$/i.test(node.nodeName);
                    if (!/^br$/i.test(node.nodeName) && node.textContent.length == 0)
                        return;
                    if (isBlock)
                        close();
                    for (var i = 0; i < node.childNodes.length; i++)
                        walk(node.childNodes[i]);
                    if (/^(pre|p)$/i.test(node.nodeName))
                        extraLinebreak = true;
                    if (isBlock)
                        closing = true
                } else if (node.nodeType == 3)
                    addText(node.nodeValue.replace(/\u200b/g, "").replace(/\u00a0/g, " "))
            }
            for (; ; ) {
                walk(from);
                if (from == to)
                    break;
                from = from.nextSibling;
                extraLinebreak = false
            }
            return text
        }
        function domToPos(cm, node, offset) {
            var lineNode;
            if (node == cm.display.lineDiv) {
                lineNode = cm.display.lineDiv.childNodes[offset];
                if (!lineNode)
                    return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true);
                node = null;
                offset = 0
            } else
                for (lineNode = node; ; lineNode = lineNode.parentNode) {
                    if (!lineNode || lineNode == cm.display.lineDiv)
                        return null;
                    if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv)
                        break
                }
            for (var i = 0; i < cm.display.view.length; i++) {
                var lineView = cm.display.view[i];
                if (lineView.node == lineNode)
                    return locateNodeInLineView(lineView, node, offset)
            }
        }
        function locateNodeInLineView(lineView, node, offset) {
            var wrapper = lineView.text.firstChild
              , bad = false;
            if (!node || !contains(wrapper, node))
                return badPos(Pos(lineNo(lineView.line), 0), true);
            if (node == wrapper) {
                bad = true;
                node = wrapper.childNodes[offset];
                offset = 0;
                if (!node) {
                    var line = lineView.rest ? lst(lineView.rest) : lineView.line;
                    return badPos(Pos(lineNo(line), line.text.length), bad)
                }
            }
            var textNode = node.nodeType == 3 ? node : null
              , topNode = node;
            if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
                textNode = node.firstChild;
                if (offset)
                    offset = textNode.nodeValue.length
            }
            while (topNode.parentNode != wrapper)
                topNode = topNode.parentNode;
            var measure = lineView.measure
              , maps = measure.maps;
            function find(textNode, topNode, offset) {
                for (var i = -1; i < (maps ? maps.length : 0); i++) {
                    var map = i < 0 ? measure.map : maps[i];
                    for (var j = 0; j < map.length; j += 3) {
                        var curNode = map[j + 2];
                        if (curNode == textNode || curNode == topNode) {
                            var line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
                            var ch = map[j] + offset;
                            if (offset < 0 || curNode != textNode)
                                ch = map[j + (offset ? 1 : 0)];
                            return Pos(line, ch)
                        }
                    }
                }
            }
            var found = find(textNode, topNode, offset);
            if (found)
                return badPos(found, bad);
            for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
                found = find(after, after.firstChild, 0);
                if (found)
                    return badPos(Pos(found.line, found.ch - dist), bad);
                else
                    dist += after.textContent.length
            }
            for (var before = topNode.previousSibling, dist$1 = offset; before; before = before.previousSibling) {
                found = find(before, before.firstChild, -1);
                if (found)
                    return badPos(Pos(found.line, found.ch + dist$1), bad);
                else
                    dist$1 += before.textContent.length
            }
        }
        var TextareaInput = function(cm) {
            this.cm = cm;
            this.prevInput = "";
            this.pollingFast = false;
            this.polling = new Delayed;
            this.hasSelection = false;
            this.composing = null
        };
        TextareaInput.prototype.init = function(display) {
            var this$1 = this;
            var input = this
              , cm = this.cm;
            this.createField(display);
            var te = this.textarea;
            display.wrapper.insertBefore(this.wrapper, display.wrapper.firstChild);
            if (ios)
                te.style.width = "0px";
            on(te, "input", function() {
                if (ie && ie_version >= 9 && this$1.hasSelection)
                    this$1.hasSelection = null;
                input.poll()
            });
            on(te, "paste", function(e) {
                if (signalDOMEvent(cm, e) || handlePaste(e, cm))
                    return;
                cm.state.pasteIncoming = +new Date;
                input.fastPoll()
            });
            function prepareCopyCut(e) {
                if (signalDOMEvent(cm, e))
                    return;
                if (cm.somethingSelected())
                    setLastCopied({
                        lineWise: false,
                        text: cm.getSelections()
                    });
                else if (!cm.options.lineWiseCopyCut)
                    return;
                else {
                    var ranges = copyableRanges(cm);
                    setLastCopied({
                        lineWise: true,
                        text: ranges.text
                    });
                    if (e.type == "cut")
                        cm.setSelections(ranges.ranges, null, sel_dontScroll);
                    else {
                        input.prevInput = "";
                        te.value = ranges.text.join("\n");
                        selectInput(te)
                    }
                }
                if (e.type == "cut")
                    cm.state.cutIncoming = +new Date
            }
            on(te, "cut", prepareCopyCut);
            on(te, "copy", prepareCopyCut);
            on(display.scroller, "paste", function(e) {
                if (eventInWidget(display, e) || signalDOMEvent(cm, e))
                    return;
                if (!te.dispatchEvent) {
                    cm.state.pasteIncoming = +new Date;
                    input.focus();
                    return
                }
                var event = new Event("paste");
                event.clipboardData = e.clipboardData;
                te.dispatchEvent(event)
            });
            on(display.lineSpace, "selectstart", function(e) {
                if (!eventInWidget(display, e))
                    e_preventDefault(e)
            });
            on(te, "compositionstart", function() {
                var start = cm.getCursor("from");
                if (input.composing)
                    input.composing.range.clear();
                input.composing = {
                    start: start,
                    range: cm.markText(start, cm.getCursor("to"), {
                        className: "CodeMirror-composing"
                    })
                }
            });
            on(te, "compositionend", function() {
                if (input.composing) {
                    input.poll();
                    input.composing.range.clear();
                    input.composing = null
                }
            })
        }
        ;
        TextareaInput.prototype.createField = function(_display) {
            this.wrapper = hiddenTextarea();
            this.textarea = this.wrapper.firstChild
        }
        ;
        TextareaInput.prototype.screenReaderLabelChanged = function(label) {
            if (label)
                this.textarea.setAttribute("aria-label", label);
            else
                this.textarea.removeAttribute("aria-label")
        }
        ;
        TextareaInput.prototype.prepareSelection = function() {
            var cm = this.cm
              , display = cm.display
              , doc = cm.doc;
            var result = prepareSelection(cm);
            if (cm.options.moveInputWithCursor) {
                var headPos = cursorCoords(cm, doc.sel.primary().head, "div");
                var wrapOff = display.wrapper.getBoundingClientRect()
                  , lineOff = display.lineDiv.getBoundingClientRect();
                result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10, headPos.top + lineOff.top - wrapOff.top));
                result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10, headPos.left + lineOff.left - wrapOff.left))
            }
            return result
        }
        ;
        TextareaInput.prototype.showSelection = function(drawn) {
            var cm = this.cm
              , display = cm.display;
            removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
            removeChildrenAndAdd(display.selectionDiv, drawn.selection);
            if (drawn.teTop != null) {
                this.wrapper.style.top = drawn.teTop + "px";
                this.wrapper.style.left = drawn.teLeft + "px"
            }
        }
        ;
        TextareaInput.prototype.reset = function(typing) {
            if (this.contextMenuPending || this.composing)
                return;
            var cm = this.cm;
            if (cm.somethingSelected()) {
                this.prevInput = "";
                var content = cm.getSelection();
                this.textarea.value = content;
                if (cm.state.focused)
                    selectInput(this.textarea);
                if (ie && ie_version >= 9)
                    this.hasSelection = content
            } else if (!typing) {
                this.prevInput = this.textarea.value = "";
                if (ie && ie_version >= 9)
                    this.hasSelection = null
            }
        }
        ;
        TextareaInput.prototype.getField = function() {
            return this.textarea
        }
        ;
        TextareaInput.prototype.supportsTouch = function() {
            return false
        }
        ;
        TextareaInput.prototype.focus = function() {
            if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea))
                try {
                    this.textarea.focus()
                } catch (e) {}
        }
        ;
        TextareaInput.prototype.blur = function() {
            this.textarea.blur()
        }
        ;
        TextareaInput.prototype.resetPosition = function() {
            this.wrapper.style.top = this.wrapper.style.left = 0
        }
        ;
        TextareaInput.prototype.receivedFocus = function() {
            this.slowPoll()
        }
        ;
        TextareaInput.prototype.slowPoll = function() {
            var this$1 = this;
            if (this.pollingFast)
                return;
            this.polling.set(this.cm.options.pollInterval, function() {
                this$1.poll();
                if (this$1.cm.state.focused)
                    this$1.slowPoll()
            })
        }
        ;
        TextareaInput.prototype.fastPoll = function() {
            var missed = false
              , input = this;
            input.pollingFast = true;
            function p() {
                var changed = input.poll();
                if (!changed && !missed) {
                    missed = true;
                    input.polling.set(60, p)
                } else {
                    input.pollingFast = false;
                    input.slowPoll()
                }
            }
            input.polling.set(20, p)
        }
        ;
        TextareaInput.prototype.poll = function() {
            var this$1 = this;
            var cm = this.cm
              , input = this.textarea
              , prevInput = this.prevInput;
            if (this.contextMenuPending || !cm.state.focused || hasSelection(input) && !prevInput && !this.composing || cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq)
                return false;
            var text = input.value;
            if (text == prevInput && !cm.somethingSelected())
                return false;
            if (ie && ie_version >= 9 && this.hasSelection === text || mac && /[\uf700-\uf7ff]/.test(text)) {
                cm.display.input.reset();
                return false
            }
            if (cm.doc.sel == cm.display.selForContextMenu) {
                var first = text.charCodeAt(0);
                if (first == 8203 && !prevInput)
                    prevInput = "\u200b";
                if (first == 8666) {
                    this.reset();
                    return this.cm.execCommand("undo")
                }
            }
            var same = 0
              , l = Math.min(prevInput.length, text.length);
            while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same))
                ++same;
            runInOp(cm, function() {
                applyTextInput(cm, text.slice(same), prevInput.length - same, null, this$1.composing ? "*compose" : null);
                if (text.length > 1E3 || text.indexOf("\n") > -1)
                    input.value = this$1.prevInput = "";
                else
                    this$1.prevInput = text;
                if (this$1.composing) {
                    this$1.composing.range.clear();
                    this$1.composing.range = cm.markText(this$1.composing.start, cm.getCursor("to"), {
                        className: "CodeMirror-composing"
                    })
                }
            });
            return true
        }
        ;
        TextareaInput.prototype.ensurePolled = function() {
            if (this.pollingFast && this.poll())
                this.pollingFast = false
        }
        ;
        TextareaInput.prototype.onKeyPress = function() {
            if (ie && ie_version >= 9)
                this.hasSelection = null;
            this.fastPoll()
        }
        ;
        TextareaInput.prototype.onContextMenu = function(e) {
            var input = this
              , cm = input.cm
              , display = cm.display
              , te = input.textarea;
            if (input.contextMenuPending)
                input.contextMenuPending();
            var pos = posFromMouse(cm, e)
              , scrollPos = display.scroller.scrollTop;
            if (!pos || presto)
                return;
            var reset = cm.options.resetSelectionOnContextMenu;
            if (reset && cm.doc.sel.contains(pos) == -1)
                operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll);
            var oldCSS = te.style.cssText
              , oldWrapperCSS = input.wrapper.style.cssText;
            var wrapperBox = input.wrapper.offsetParent.getBoundingClientRect();
            input.wrapper.style.cssText = "position: static";
            te.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - wrapperBox.top - 5) + "px; left: " + (e.clientX - wrapperBox.left - 5) + "px;\n      z-index: 1000; background: " + (ie ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
            var oldScrollY;
            if (webkit)
                oldScrollY = window.scrollY;
            display.input.focus();
            if (webkit)
                window.scrollTo(null, oldScrollY);
            display.input.reset();
            if (!cm.somethingSelected())
                te.value = input.prevInput = " ";
            input.contextMenuPending = rehide;
            display.selForContextMenu = cm.doc.sel;
            clearTimeout(display.detectingSelectAll);
            function prepareSelectAllHack() {
                if (te.selectionStart != null) {
                    var selected = cm.somethingSelected();
                    var extval = "\u200b" + (selected ? te.value : "");
                    te.value = "\u21da";
                    te.value = extval;
                    input.prevInput = selected ? "" : "\u200b";
                    te.selectionStart = 1;
                    te.selectionEnd = extval.length;
                    display.selForContextMenu = cm.doc.sel
                }
            }
            function rehide() {
                if (input.contextMenuPending != rehide)
                    return;
                input.contextMenuPending = false;
                input.wrapper.style.cssText = oldWrapperCSS;
                te.style.cssText = oldCSS;
                if (ie && ie_version < 9)
                    display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos);
                if (te.selectionStart != null) {
                    if (!ie || ie && ie_version < 9)
                        prepareSelectAllHack();
                    var i = 0
                      , poll = function() {
                        if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 && te.selectionEnd > 0 && input.prevInput == "\u200b")
                            operation(cm, selectAll)(cm);
                        else if (i++ < 10)
                            display.detectingSelectAll = setTimeout(poll, 500);
                        else {
                            display.selForContextMenu = null;
                            display.input.reset()
                        }
                    };
                    display.detectingSelectAll = setTimeout(poll, 200)
                }
            }
            if (ie && ie_version >= 9)
                prepareSelectAllHack();
            if (captureRightClick) {
                e_stop(e);
                var mouseup = function() {
                    off(window, "mouseup", mouseup);
                    setTimeout(rehide, 20)
                };
                on(window, "mouseup", mouseup)
            } else
                setTimeout(rehide, 50)
        }
        ;
        TextareaInput.prototype.readOnlyChanged = function(val) {
            if (!val)
                this.reset();
            this.textarea.disabled = val == "nocursor";
            this.textarea.readOnly = !!val
        }
        ;
        TextareaInput.prototype.setUneditable = function() {}
        ;
        TextareaInput.prototype.needsContentAttribute = false;
        function fromTextArea(textarea, options) {
            options = options ? copyObj(options) : {};
            options.value = textarea.value;
            if (!options.tabindex && textarea.tabIndex)
                options.tabindex = textarea.tabIndex;
            if (!options.placeholder && textarea.placeholder)
                options.placeholder = textarea.placeholder;
            if (options.autofocus == null) {
                var hasFocus = activeElt();
                options.autofocus = hasFocus == textarea || textarea.getAttribute("autofocus") != null && hasFocus == document.body
            }
            function save() {
                textarea.value = cm.getValue()
            }
            var realSubmit;
            if (textarea.form) {
                on(textarea.form, "submit", save);
                if (!options.leaveSubmitMethodAlone) {
                    var form = textarea.form;
                    realSubmit = form.submit;
                    try {
                        var wrappedSubmit = form.submit = function() {
                            save();
                            form.submit = realSubmit;
                            form.submit();
                            form.submit = wrappedSubmit
                        }
                    } catch (e) {}
                }
            }
            options.finishInit = function(cm) {
                cm.save = save;
                cm.getTextArea = function() {
                    return textarea
                }
                ;
                cm.toTextArea = function() {
                    cm.toTextArea = isNaN;
                    save();
                    textarea.parentNode.removeChild(cm.getWrapperElement());
                    textarea.style.display = "";
                    if (textarea.form) {
                        off(textarea.form, "submit", save);
                        if (!options.leaveSubmitMethodAlone && typeof textarea.form.submit == "function")
                            textarea.form.submit = realSubmit
                    }
                }
            }
            ;
            textarea.style.display = "none";
            var cm = CodeMirror(function(node) {
                return textarea.parentNode.insertBefore(node, textarea.nextSibling)
            }, options);
            return cm
        }
        function addLegacyProps(CodeMirror) {
            CodeMirror.off = off;
            CodeMirror.on = on;
            CodeMirror.wheelEventPixels = wheelEventPixels;
            CodeMirror.Doc = Doc;
            CodeMirror.splitLines = splitLinesAuto;
            CodeMirror.countColumn = countColumn;
            CodeMirror.findColumn = findColumn;
            CodeMirror.isWordChar = isWordCharBasic;
            CodeMirror.Pass = Pass;
            CodeMirror.signal = signal;
            CodeMirror.Line = Line;
            CodeMirror.changeEnd = changeEnd;
            CodeMirror.scrollbarModel = scrollbarModel;
            CodeMirror.Pos = Pos;
            CodeMirror.cmpPos = cmp;
            CodeMirror.modes = modes;
            CodeMirror.mimeModes = mimeModes;
            CodeMirror.resolveMode = resolveMode;
            CodeMirror.getMode = getMode;
            CodeMirror.modeExtensions = modeExtensions;
            CodeMirror.extendMode = extendMode;
            CodeMirror.copyState = copyState;
            CodeMirror.startState = startState;
            CodeMirror.innerMode = innerMode;
            CodeMirror.commands = commands;
            CodeMirror.keyMap = keyMap;
            CodeMirror.keyName = keyName;
            CodeMirror.isModifierKey = isModifierKey;
            CodeMirror.lookupKey = lookupKey;
            CodeMirror.normalizeKeyMap = normalizeKeyMap;
            CodeMirror.StringStream = StringStream;
            CodeMirror.SharedTextMarker = SharedTextMarker;
            CodeMirror.TextMarker = TextMarker;
            CodeMirror.LineWidget = LineWidget;
            CodeMirror.e_preventDefault = e_preventDefault;
            CodeMirror.e_stopPropagation = e_stopPropagation;
            CodeMirror.e_stop = e_stop;
            CodeMirror.addClass = addClass;
            CodeMirror.contains = contains;
            CodeMirror.rmClass = rmClass;
            CodeMirror.keyNames = keyNames
        }
        defineOptions(CodeMirror);
        addEditorMethods(CodeMirror);
        var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");
        for (var prop in Doc.prototype)
            if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
                CodeMirror.prototype[prop] = function(method) {
                    return function() {
                        return method.apply(this.doc, arguments)
                    }
                }(Doc.prototype[prop]);
        eventMixin(Doc);
        CodeMirror.inputStyles = {
            "textarea": TextareaInput,
            "contenteditable": ContentEditableInput
        };
        CodeMirror.defineMode = function(name) {
            if (!CodeMirror.defaults.mode && name != "null")
                CodeMirror.defaults.mode = name;
            defineMode.apply(this, arguments)
        }
        ;
        CodeMirror.defineMIME = defineMIME;
        CodeMirror.defineMode("null", function() {
            return {
                token: function(stream) {
                    return stream.skipToEnd()
                }
            }
        });
        CodeMirror.defineMIME("text/plain", "null");
        CodeMirror.defineExtension = function(name, func) {
            CodeMirror.prototype[name] = func
        }
        ;
        CodeMirror.defineDocExtension = function(name, func) {
            Doc.prototype[name] = func
        }
        ;
        CodeMirror.fromTextArea = fromTextArea;
        addLegacyProps(CodeMirror);
        CodeMirror.version = "5.65.6";
        return CodeMirror
    });
    (function(mod) {
        if (typeof exports == "object" && typeof module == "object")
            mod(require("../../lib/codemirror"));
        else if (typeof define == "function" && define.amd)
            define(["../../lib/codemirror"], mod);
        else
            mod(CodeMirror)
    }
    )(function(CodeMirror) {
        CodeMirror.defineMode("javascript", function(config, parserConfig) {
            var indentUnit = config.indentUnit;
            var statementIndent = parserConfig.statementIndent;
            var jsonldMode = parserConfig.jsonld;
            var jsonMode = parserConfig.json || jsonldMode;
            var trackScope = parserConfig.trackScope !== false;
            var isTS = parserConfig.typescript;
            var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/;
            var keywords = function() {
                function kw(type) {
                    return {
                        type: type,
                        style: "keyword"
                    }
                }
                var A = kw("keyword a")
                  , B = kw("keyword b")
                  , C = kw("keyword c")
                  , D = kw("keyword d");
                var operator = kw("operator")
                  , atom = {
                    type: "atom",
                    style: "atom"
                };
                return {
                    "if": kw("if"),
                    "while": A,
                    "with": A,
                    "else": B,
                    "do": B,
                    "try": B,
                    "finally": B,
                    "return": D,
                    "break": D,
                    "continue": D,
                    "new": kw("new"),
                    "delete": C,
                    "void": C,
                    "throw": C,
                    "debugger": kw("debugger"),
                    "var": kw("var"),
                    "const": kw("var"),
                    "let": kw("var"),
                    "function": kw("function"),
                    "catch": kw("catch"),
                    "for": kw("for"),
                    "switch": kw("switch"),
                    "case": kw("case"),
                    "default": kw("default"),
                    "in": operator,
                    "typeof": operator,
                    "instanceof": operator,
                    "true": atom,
                    "false": atom,
                    "null": atom,
                    "undefined": atom,
                    "NaN": atom,
                    "Infinity": atom,
                    "this": kw("this"),
                    "class": kw("class"),
                    "super": kw("atom"),
                    "yield": C,
                    "export": kw("export"),
                    "import": kw("import"),
                    "extends": C,
                    "await": C
                }
            }();
            var isOperatorChar = /[+\-*&%=<>!?|~^@]/;
            var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;
            function readRegexp(stream) {
                var escaped = false, next, inSet = false;
                while ((next = stream.next()) != null) {
                    if (!escaped) {
                        if (next == "/" && !inSet)
                            return;
                        if (next == "[")
                            inSet = true;
                        else if (inSet && next == "]")
                            inSet = false
                    }
                    escaped = !escaped && next == "\\"
                }
            }
            var type, content;
            function ret(tp, style, cont) {
                type = tp;
                content = cont;
                return style
            }
            function tokenBase(stream, state) {
                var ch = stream.next();
                if (ch == '"' || ch == "'") {
                    state.tokenize = tokenString(ch);
                    return state.tokenize(stream, state)
                } else if (ch == "." && stream.match(/^\d[\d_]*(?:[eE][+\-]?[\d_]+)?/))
                    return ret("number", "number");
                else if (ch == "." && stream.match(".."))
                    return ret("spread", "meta");
                else if (/[\[\]{}\(\),;:\.]/.test(ch))
                    return ret(ch);
                else if (ch == "=" && stream.eat(">"))
                    return ret("=>", "operator");
                else if (ch == "0" && stream.match(/^(?:x[\dA-Fa-f_]+|o[0-7_]+|b[01_]+)n?/))
                    return ret("number", "number");
                else if (/\d/.test(ch)) {
                    stream.match(/^[\d_]*(?:n|(?:\.[\d_]*)?(?:[eE][+\-]?[\d_]+)?)?/);
                    return ret("number", "number")
                } else if (ch == "/")
                    if (stream.eat("*")) {
                        state.tokenize = tokenComment;
                        return tokenComment(stream, state)
                    } else if (stream.eat("/")) {
                        stream.skipToEnd();
                        return ret("comment", "comment")
                    } else if (expressionAllowed(stream, state, 1)) {
                        readRegexp(stream);
                        stream.match(/^\b(([gimyus])(?![gimyus]*\2))+\b/);
                        return ret("regexp", "string-2")
                    } else {
                        stream.eat("=");
                        return ret("operator", "operator", stream.current())
                    }
                else if (ch == "`") {
                    state.tokenize = tokenQuasi;
                    return tokenQuasi(stream, state)
                } else if (ch == "#" && stream.peek() == "!") {
                    stream.skipToEnd();
                    return ret("meta", "meta")
                } else if (ch == "#" && stream.eatWhile(wordRE))
                    return ret("variable", "property");
                else if (ch == "<" && stream.match("!--") || ch == "-" && stream.match("->") && !/\S/.test(stream.string.slice(0, stream.start))) {
                    stream.skipToEnd();
                    return ret("comment", "comment")
                } else if (isOperatorChar.test(ch)) {
                    if (ch != ">" || !state.lexical || state.lexical.type != ">")
                        if (stream.eat("=")) {
                            if (ch == "!" || ch == "=")
                                stream.eat("=")
                        } else if (/[<>*+\-|&?]/.test(ch)) {
                            stream.eat(ch);
                            if (ch == ">")
                                stream.eat(ch)
                        }
                    if (ch == "?" && stream.eat("."))
                        return ret(".");
                    return ret("operator", "operator", stream.current())
                } else if (wordRE.test(ch)) {
                    stream.eatWhile(wordRE);
                    var word = stream.current();
                    if (state.lastType != ".") {
                        if (keywords.propertyIsEnumerable(word)) {
                            var kw = keywords[word];
                            return ret(kw.type, kw.style, word)
                        }
                        if (word == "async" && stream.match(/^(\s|\/\*([^*]|\*(?!\/))*?\*\/)*[\[\(\w]/, false))
                            return ret("async", "keyword", word)
                    }
                    return ret("variable", "variable", word)
                }
            }
            function tokenString(quote) {
                return function(stream, state) {
                    var escaped = false, next;
                    if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)) {
                        state.tokenize = tokenBase;
                        return ret("jsonld-keyword", "meta")
                    }
                    while ((next = stream.next()) != null) {
                        if (next == quote && !escaped)
                            break;
                        escaped = !escaped && next == "\\"
                    }
                    if (!escaped)
                        state.tokenize = tokenBase;
                    return ret("string", "string")
                }
            }
            function tokenComment(stream, state) {
                var maybeEnd = false, ch;
                while (ch = stream.next()) {
                    if (ch == "/" && maybeEnd) {
                        state.tokenize = tokenBase;
                        break
                    }
                    maybeEnd = ch == "*"
                }
                return ret("comment", "comment")
            }
            function tokenQuasi(stream, state) {
                var escaped = false, next;
                while ((next = stream.next()) != null) {
                    if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
                        state.tokenize = tokenBase;
                        break
                    }
                    escaped = !escaped && next == "\\"
                }
                return ret("quasi", "string-2", stream.current())
            }
            var brackets = "([{}])";
            function findFatArrow(stream, state) {
                if (state.fatArrowAt)
                    state.fatArrowAt = null;
                var arrow = stream.string.indexOf("=>", stream.start);
                if (arrow < 0)
                    return;
                if (isTS) {
                    var m = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(stream.string.slice(stream.start, arrow));
                    if (m)
                        arrow = m.index
                }
                var depth = 0
                  , sawSomething = false;
                for (var pos = arrow - 1; pos >= 0; --pos) {
                    var ch = stream.string.charAt(pos);
                    var bracket = brackets.indexOf(ch);
                    if (bracket >= 0 && bracket < 3) {
                        if (!depth) {
                            ++pos;
                            break
                        }
                        if (--depth == 0) {
                            if (ch == "(")
                                sawSomething = true;
                            break
                        }
                    } else if (bracket >= 3 && bracket < 6)
                        ++depth;
                    else if (wordRE.test(ch))
                        sawSomething = true;
                    else if (/["'\/`]/.test(ch))
                        for (; ; --pos) {
                            if (pos == 0)
                                return;
                            var next = stream.string.charAt(pos - 1);
                            if (next == ch && stream.string.charAt(pos - 2) != "\\") {
                                pos--;
                                break
                            }
                        }
                    else if (sawSomething && !depth) {
                        ++pos;
                        break
                    }
                }
                if (sawSomething && !depth)
                    state.fatArrowAt = pos
            }
            var atomicTypes = {
                "atom": true,
                "number": true,
                "variable": true,
                "string": true,
                "regexp": true,
                "this": true,
                "import": true,
                "jsonld-keyword": true
            };
            function JSLexical(indented, column, type, align, prev, info) {
                this.indented = indented;
                this.column = column;
                this.type = type;
                this.prev = prev;
                this.info = info;
                if (align != null)
                    this.align = align
            }
            function inScope(state, varname) {
                if (!trackScope)
                    return false;
                for (var v = state.localVars; v; v = v.next)
                    if (v.name == varname)
                        return true;
                for (var cx = state.context; cx; cx = cx.prev)
                    for (var v = cx.vars; v; v = v.next)
                        if (v.name == varname)
                            return true
            }
            function parseJS(state, style, type, content, stream) {
                var cc = state.cc;
                cx.state = state;
                cx.stream = stream;
                cx.marked = null,
                cx.cc = cc;
                cx.style = style;
                if (!state.lexical.hasOwnProperty("align"))
                    state.lexical.align = true;
                while (true) {
                    var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
                    if (combinator(type, content)) {
                        while (cc.length && cc[cc.length - 1].lex)
                            cc.pop()();
                        if (cx.marked)
                            return cx.marked;
                        if (type == "variable" && inScope(state, content))
                            return "variable-2";
                        return style
                    }
                }
            }
            var cx = {
                state: null,
                column: null,
                marked: null,
                cc: null
            };
            function pass() {
                for (var i = arguments.length - 1; i >= 0; i--)
                    cx.cc.push(arguments[i])
            }
            function cont() {
                pass.apply(null, arguments);
                return true
            }
            function inList(name, list) {
                for (var v = list; v; v = v.next)
                    if (v.name == name)
                        return true;
                return false
            }
            function register(varname) {
                var state = cx.state;
                cx.marked = "def";
                if (!trackScope)
                    return;
                if (state.context)
                    if (state.lexical.info == "var" && state.context && state.context.block) {
                        var newContext = registerVarScoped(varname, state.context);
                        if (newContext != null) {
                            state.context = newContext;
                            return
                        }
                    } else if (!inList(varname, state.localVars)) {
                        state.localVars = new Var(varname,state.localVars);
                        return
                    }
                if (parserConfig.globalVars && !inList(varname, state.globalVars))
                    state.globalVars = new Var(varname,state.globalVars)
            }
            function registerVarScoped(varname, context) {
                if (!context)
                    return null;
                else if (context.block) {
                    var inner = registerVarScoped(varname, context.prev);
                    if (!inner)
                        return null;
                    if (inner == context.prev)
                        return context;
                    return new Context(inner,context.vars,true)
                } else if (inList(varname, context.vars))
                    return context;
                else
                    return new Context(context.prev,new Var(varname,context.vars),false)
            }
            function isModifier(name) {
                return name == "public" || name == "private" || name == "protected" || name == "abstract" || name == "readonly"
            }
            function Context(prev, vars, block) {
                this.prev = prev;
                this.vars = vars;
                this.block = block
            }
            function Var(name, next) {
                this.name = name;
                this.next = next
            }
            var defaultVars = new Var("this",new Var("arguments",null));
            function pushcontext() {
                cx.state.context = new Context(cx.state.context,cx.state.localVars,false);
                cx.state.localVars = defaultVars
            }
            function pushblockcontext() {
                cx.state.context = new Context(cx.state.context,cx.state.localVars,true);
                cx.state.localVars = null
            }
            pushcontext.lex = pushblockcontext.lex = true;
            function popcontext() {
                cx.state.localVars = cx.state.context.vars;
                cx.state.context = cx.state.context.prev
            }
            popcontext.lex = true;
            function pushlex(type, info) {
                var result = function() {
                    var state = cx.state
                      , indent = state.indented;
                    if (state.lexical.type == "stat")
                        indent = state.lexical.indented;
                    else
                        for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev)
                            indent = outer.indented;
                    state.lexical = new JSLexical(indent,cx.stream.column(),type,null,state.lexical,info)
                };
                result.lex = true;
                return result
            }
            function poplex() {
                var state = cx.state;
                if (state.lexical.prev) {
                    if (state.lexical.type == ")")
                        state.indented = state.lexical.indented;
                    state.lexical = state.lexical.prev
                }
            }
            poplex.lex = true;
            function expect(wanted) {
                function exp(type) {
                    if (type == wanted)
                        return cont();
                    else if (wanted == ";" || type == "}" || type == ")" || type == "]")
                        return pass();
                    else
                        return cont(exp)
                }
                return exp
            }
            function statement(type, value) {
                if (type == "var")
                    return cont(pushlex("vardef", value), vardef, expect(";"), poplex);
                if (type == "keyword a")
                    return cont(pushlex("form"), parenExpr, statement, poplex);
                if (type == "keyword b")
                    return cont(pushlex("form"), statement, poplex);
                if (type == "keyword d")
                    return cx.stream.match(/^\s*$/, false) ? cont() : cont(pushlex("stat"), maybeexpression, expect(";"), poplex);
                if (type == "debugger")
                    return cont(expect(";"));
                if (type == "{")
                    return cont(pushlex("}"), pushblockcontext, block, poplex, popcontext);
                if (type == ";")
                    return cont();
                if (type == "if") {
                    if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex)
                        cx.state.cc.pop()();
                    return cont(pushlex("form"), parenExpr, statement, poplex, maybeelse)
                }
                if (type == "function")
                    return cont(functiondef);
                if (type == "for")
                    return cont(pushlex("form"), pushblockcontext, forspec, statement, popcontext, poplex);
                if (type == "class" || isTS && value == "interface") {
                    cx.marked = "keyword";
                    return cont(pushlex("form", type == "class" ? type : value), className, poplex)
                }
                if (type == "variable")
                    if (isTS && value == "declare") {
                        cx.marked = "keyword";
                        return cont(statement)
                    } else if (isTS && (value == "module" || value == "enum" || value == "type") && cx.stream.match(/^\s*\w/, false)) {
                        cx.marked = "keyword";
                        if (value == "enum")
                            return cont(enumdef);
                        else if (value == "type")
                            return cont(typename, expect("operator"), typeexpr, expect(";"));
                        else
                            return cont(pushlex("form"), pattern, expect("{"), pushlex("}"), block, poplex, poplex)
                    } else if (isTS && value == "namespace") {
                        cx.marked = "keyword";
                        return cont(pushlex("form"), expression, statement, poplex)
                    } else if (isTS && value == "abstract") {
                        cx.marked = "keyword";
                        return cont(statement)
                    } else
                        return cont(pushlex("stat"), maybelabel);
                if (type == "switch")
                    return cont(pushlex("form"), parenExpr, expect("{"), pushlex("}", "switch"), pushblockcontext, block, poplex, poplex, popcontext);
                if (type == "case")
                    return cont(expression, expect(":"));
                if (type == "default")
                    return cont(expect(":"));
                if (type == "catch")
                    return cont(pushlex("form"), pushcontext, maybeCatchBinding, statement, poplex, popcontext);
                if (type == "export")
                    return cont(pushlex("stat"), afterExport, poplex);
                if (type == "import")
                    return cont(pushlex("stat"), afterImport, poplex);
                if (type == "async")
                    return cont(statement);
                if (value == "@")
                    return cont(expression, statement);
                return pass(pushlex("stat"), expression, expect(";"), poplex)
            }
            function maybeCatchBinding(type) {
                if (type == "(")
                    return cont(funarg, expect(")"))
            }
            function expression(type, value) {
                return expressionInner(type, value, false)
            }
            function expressionNoComma(type, value) {
                return expressionInner(type, value, true)
            }
            function parenExpr(type) {
                if (type != "(")
                    return pass();
                return cont(pushlex(")"), maybeexpression, expect(")"), poplex)
            }
            function expressionInner(type, value, noComma) {
                if (cx.state.fatArrowAt == cx.stream.start) {
                    var body = noComma ? arrowBodyNoComma : arrowBody;
                    if (type == "(")
                        return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, expect("=>"), body, popcontext);
                    else if (type == "variable")
                        return pass(pushcontext, pattern, expect("=>"), body, popcontext)
                }
                var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
                if (atomicTypes.hasOwnProperty(type))
                    return cont(maybeop);
                if (type == "function")
                    return cont(functiondef, maybeop);
                if (type == "class" || isTS && value == "interface") {
                    cx.marked = "keyword";
                    return cont(pushlex("form"), classExpression, poplex)
                }
                if (type == "keyword c" || type == "async")
                    return cont(noComma ? expressionNoComma : expression);
                if (type == "(")
                    return cont(pushlex(")"), maybeexpression, expect(")"), poplex, maybeop);
                if (type == "operator" || type == "spread")
                    return cont(noComma ? expressionNoComma : expression);
                if (type == "[")
                    return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
                if (type == "{")
                    return contCommasep(objprop, "}", null, maybeop);
                if (type == "quasi")
                    return pass(quasi, maybeop);
                if (type == "new")
                    return cont(maybeTarget(noComma));
                return cont()
            }
            function maybeexpression(type) {
                if (type.match(/[;\}\)\],]/))
                    return pass();
                return pass(expression)
            }
            function maybeoperatorComma(type, value) {
                if (type == ",")
                    return cont(maybeexpression);
                return maybeoperatorNoComma(type, value, false)
            }
            function maybeoperatorNoComma(type, value, noComma) {
                var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
                var expr = noComma == false ? expression : expressionNoComma;
                if (type == "=>")
                    return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);
                if (type == "operator") {
                    if (/\+\+|--/.test(value) || isTS && value == "!")
                        return cont(me);
                    if (isTS && value == "<" && cx.stream.match(/^([^<>]|<[^<>]*>)*>\s*\(/, false))
                        return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, me);
                    if (value == "?")
                        return cont(expression, expect(":"), expr);
                    return cont(expr)
                }
                if (type == "quasi")
                    return pass(quasi, me);
                if (type == ";")
                    return;
                if (type == "(")
                    return contCommasep(expressionNoComma, ")", "call", me);
                if (type == ".")
                    return cont(property, me);
                if (type == "[")
                    return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
                if (isTS && value == "as") {
                    cx.marked = "keyword";
                    return cont(typeexpr, me)
                }
                if (type == "regexp") {
                    cx.state.lastType = cx.marked = "operator";
                    cx.stream.backUp(cx.stream.pos - cx.stream.start - 1);
                    return cont(expr)
                }
            }
            function quasi(type, value) {
                if (type != "quasi")
                    return pass();
                if (value.slice(value.length - 2) != "${")
                    return cont(quasi);
                return cont(maybeexpression, continueQuasi)
            }
            function continueQuasi(type) {
                if (type == "}") {
                    cx.marked = "string-2";
                    cx.state.tokenize = tokenQuasi;
                    return cont(quasi)
                }
            }
            function arrowBody(type) {
                findFatArrow(cx.stream, cx.state);
                return pass(type == "{" ? statement : expression)
            }
            function arrowBodyNoComma(type) {
                findFatArrow(cx.stream, cx.state);
                return pass(type == "{" ? statement : expressionNoComma)
            }
            function maybeTarget(noComma) {
                return function(type) {
                    if (type == ".")
                        return cont(noComma ? targetNoComma : target);
                    else if (type == "variable" && isTS)
                        return cont(maybeTypeArgs, noComma ? maybeoperatorNoComma : maybeoperatorComma);
                    else
                        return pass(noComma ? expressionNoComma : expression)
                }
            }
            function target(_, value) {
                if (value == "target") {
                    cx.marked = "keyword";
                    return cont(maybeoperatorComma)
                }
            }
            function targetNoComma(_, value) {
                if (value == "target") {
                    cx.marked = "keyword";
                    return cont(maybeoperatorNoComma)
                }
            }
            function maybelabel(type) {
                if (type == ":")
                    return cont(poplex, statement);
                return pass(maybeoperatorComma, expect(";"), poplex)
            }
            function property(type) {
                if (type == "variable") {
                    cx.marked = "property";
                    return cont()
                }
            }
            function objprop(type, value) {
                if (type == "async") {
                    cx.marked = "property";
                    return cont(objprop)
                } else if (type == "variable" || cx.style == "keyword") {
                    cx.marked = "property";
                    if (value == "get" || value == "set")
                        return cont(getterSetter);
                    var m;
                    if (isTS && cx.state.fatArrowAt == cx.stream.start && (m = cx.stream.match(/^\s*:\s*/, false)))
                        cx.state.fatArrowAt = cx.stream.pos + m[0].length;
                    return cont(afterprop)
                } else if (type == "number" || type == "string") {
                    cx.marked = jsonldMode ? "property" : cx.style + " property";
                    return cont(afterprop)
                } else if (type == "jsonld-keyword")
                    return cont(afterprop);
                else if (isTS && isModifier(value)) {
                    cx.marked = "keyword";
                    return cont(objprop)
                } else if (type == "[")
                    return cont(expression, maybetype, expect("]"), afterprop);
                else if (type == "spread")
                    return cont(expressionNoComma, afterprop);
                else if (value == "*") {
                    cx.marked = "keyword";
                    return cont(objprop)
                } else if (type == ":")
                    return pass(afterprop)
            }
            function getterSetter(type) {
                if (type != "variable")
                    return pass(afterprop);
                cx.marked = "property";
                return cont(functiondef)
            }
            function afterprop(type) {
                if (type == ":")
                    return cont(expressionNoComma);
                if (type == "(")
                    return pass(functiondef)
            }
            function commasep(what, end, sep) {
                function proceed(type, value) {
                    if (sep ? sep.indexOf(type) > -1 : type == ",") {
                        var lex = cx.state.lexical;
                        if (lex.info == "call")
                            lex.pos = (lex.pos || 0) + 1;
                        return cont(function(type, value) {
                            if (type == end || value == end)
                                return pass();
                            return pass(what)
                        }, proceed)
                    }
                    if (type == end || value == end)
                        return cont();
                    if (sep && sep.indexOf(";") > -1)
                        return pass(what);
                    return cont(expect(end))
                }
                return function(type, value) {
                    if (type == end || value == end)
                        return cont();
                    return pass(what, proceed)
                }
            }
            function contCommasep(what, end, info) {
                for (var i = 3; i < arguments.length; i++)
                    cx.cc.push(arguments[i]);
                return cont(pushlex(end, info), commasep(what, end), poplex)
            }
            function block(type) {
                if (type == "}")
                    return cont();
                return pass(statement, block)
            }
            function maybetype(type, value) {
                if (isTS) {
                    if (type == ":")
                        return cont(typeexpr);
                    if (value == "?")
                        return cont(maybetype)
                }
            }
            function maybetypeOrIn(type, value) {
                if (isTS && (type == ":" || value == "in"))
                    return cont(typeexpr)
            }
            function mayberettype(type) {
                if (isTS && type == ":")
                    if (cx.stream.match(/^\s*\w+\s+is\b/, false))
                        return cont(expression, isKW, typeexpr);
                    else
                        return cont(typeexpr)
            }
            function isKW(_, value) {
                if (value == "is") {
                    cx.marked = "keyword";
                    return cont()
                }
            }
            function typeexpr(type, value) {
                if (value == "keyof" || value == "typeof" || value == "infer" || value == "readonly") {
                    cx.marked = "keyword";
                    return cont(value == "typeof" ? expressionNoComma : typeexpr)
                }
                if (type == "variable" || value == "void") {
                    cx.marked = "type";
                    return cont(afterType)
                }
                if (value == "|" || value == "&")
                    return cont(typeexpr);
                if (type == "string" || type == "number" || type == "atom")
                    return cont(afterType);
                if (type == "[")
                    return cont(pushlex("]"), commasep(typeexpr, "]", ","), poplex, afterType);
                if (type == "{")
                    return cont(pushlex("}"), typeprops, poplex, afterType);
                if (type == "(")
                    return cont(commasep(typearg, ")"), maybeReturnType, afterType);
                if (type == "<")
                    return cont(commasep(typeexpr, ">"), typeexpr);
                if (type == "quasi")
                    return pass(quasiType, afterType)
            }
            function maybeReturnType(type) {
                if (type == "=>")
                    return cont(typeexpr)
            }
            function typeprops(type) {
                if (type.match(/[\}\)\]]/))
                    return cont();
                if (type == "," || type == ";")
                    return cont(typeprops);
                return pass(typeprop, typeprops)
            }
            function typeprop(type, value) {
                if (type == "variable" || cx.style == "keyword") {
                    cx.marked = "property";
                    return cont(typeprop)
                } else if (value == "?" || type == "number" || type == "string")
                    return cont(typeprop);
                else if (type == ":")
                    return cont(typeexpr);
                else if (type == "[")
                    return cont(expect("variable"), maybetypeOrIn, expect("]"), typeprop);
                else if (type == "(")
                    return pass(functiondecl, typeprop);
                else if (!type.match(/[;\}\)\],]/))
                    return cont()
            }
            function quasiType(type, value) {
                if (type != "quasi")
                    return pass();
                if (value.slice(value.length - 2) != "${")
                    return cont(quasiType);
                return cont(typeexpr, continueQuasiType)
            }
            function continueQuasiType(type) {
                if (type == "}") {
                    cx.marked = "string-2";
                    cx.state.tokenize = tokenQuasi;
                    return cont(quasiType)
                }
            }
            function typearg(type, value) {
                if (type == "variable" && cx.stream.match(/^\s*[?:]/, false) || value == "?")
                    return cont(typearg);
                if (type == ":")
                    return cont(typeexpr);
                if (type == "spread")
                    return cont(typearg);
                return pass(typeexpr)
            }
            function afterType(type, value) {
                if (value == "<")
                    return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType);
                if (value == "|" || type == "." || value == "&")
                    return cont(typeexpr);
                if (type == "[")
                    return cont(typeexpr, expect("]"), afterType);
                if (value == "extends" || value == "implements") {
                    cx.marked = "keyword";
                    return cont(typeexpr)
                }
                if (value == "?")
                    return cont(typeexpr, expect(":"), typeexpr)
            }
            function maybeTypeArgs(_, value) {
                if (value == "<")
                    return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
            }
            function typeparam() {
                return pass(typeexpr, maybeTypeDefault)
            }
            function maybeTypeDefault(_, value) {
                if (value == "=")
                    return cont(typeexpr)
            }
            function vardef(_, value) {
                if (value == "enum") {
                    cx.marked = "keyword";
                    return cont(enumdef)
                }
                return pass(pattern, maybetype, maybeAssign, vardefCont)
            }
            function pattern(type, value) {
                if (isTS && isModifier(value)) {
                    cx.marked = "keyword";
                    return cont(pattern)
                }
                if (type == "variable") {
                    register(value);
                    return cont()
                }
                if (type == "spread")
                    return cont(pattern);
                if (type == "[")
                    return contCommasep(eltpattern, "]");
                if (type == "{")
                    return contCommasep(proppattern, "}")
            }
            function proppattern(type, value) {
                if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
                    register(value);
                    return cont(maybeAssign)
                }
                if (type == "variable")
                    cx.marked = "property";
                if (type == "spread")
                    return cont(pattern);
                if (type == "}")
                    return pass();
                if (type == "[")
                    return cont(expression, expect("]"), expect(":"), proppattern);
                return cont(expect(":"), pattern, maybeAssign)
            }
            function eltpattern() {
                return pass(pattern, maybeAssign)
            }
            function maybeAssign(_type, value) {
                if (value == "=")
                    return cont(expressionNoComma)
            }
            function vardefCont(type) {
                if (type == ",")
                    return cont(vardef)
            }
            function maybeelse(type, value) {
                if (type == "keyword b" && value == "else")
                    return cont(pushlex("form", "else"), statement, poplex)
            }
            function forspec(type, value) {
                if (value == "await")
                    return cont(forspec);
                if (type == "(")
                    return cont(pushlex(")"), forspec1, poplex)
            }
            function forspec1(type) {
                if (type == "var")
                    return cont(vardef, forspec2);
                if (type == "variable")
                    return cont(forspec2);
                return pass(forspec2)
            }
            function forspec2(type, value) {
                if (type == ")")
                    return cont();
                if (type == ";")
                    return cont(forspec2);
                if (value == "in" || value == "of") {
                    cx.marked = "keyword";
                    return cont(expression, forspec2)
                }
                return pass(expression, forspec2)
            }
            function functiondef(type, value) {
                if (value == "*") {
                    cx.marked = "keyword";
                    return cont(functiondef)
                }
                if (type == "variable") {
                    register(value);
                    return cont(functiondef)
                }
                if (type == "(")
                    return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, statement, popcontext);
                if (isTS && value == "<")
                    return cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondef)
            }
            function functiondecl(type, value) {
                if (value == "*") {
                    cx.marked = "keyword";
                    return cont(functiondecl)
                }
                if (type == "variable") {
                    register(value);
                    return cont(functiondecl)
                }
                if (type == "(")
                    return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, popcontext);
                if (isTS && value == "<")
                    return cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondecl)
            }
            function typename(type, value) {
                if (type == "keyword" || type == "variable") {
                    cx.marked = "type";
                    return cont(typename)
                } else if (value == "<")
                    return cont(pushlex(">"), commasep(typeparam, ">"), poplex)
            }
            function funarg(type, value) {
                if (value == "@")
                    cont(expression, funarg);
                if (type == "spread")
                    return cont(funarg);
                if (isTS && isModifier(value)) {
                    cx.marked = "keyword";
                    return cont(funarg)
                }
                if (isTS && type == "this")
                    return cont(maybetype, maybeAssign);
                return pass(pattern, maybetype, maybeAssign)
            }
            function classExpression(type, value) {
                if (type == "variable")
                    return className(type, value);
                return classNameAfter(type, value)
            }
            function className(type, value) {
                if (type == "variable") {
                    register(value);
                    return cont(classNameAfter)
                }
            }
            function classNameAfter(type, value) {
                if (value == "<")
                    return cont(pushlex(">"), commasep(typeparam, ">"), poplex, classNameAfter);
                if (value == "extends" || value == "implements" || isTS && type == ",") {
                    if (value == "implements")
                        cx.marked = "keyword";
                    return cont(isTS ? typeexpr : expression, classNameAfter)
                }
                if (type == "{")
                    return cont(pushlex("}"), classBody, poplex)
            }
            function classBody(type, value) {
                if (type == "async" || type == "variable" && (value == "static" || value == "get" || value == "set" || isTS && isModifier(value)) && cx.stream.match(/^\s+[\w$\xa1-\uffff]/, false)) {
                    cx.marked = "keyword";
                    return cont(classBody)
                }
                if (type == "variable" || cx.style == "keyword") {
                    cx.marked = "property";
                    return cont(classfield, classBody)
                }
                if (type == "number" || type == "string")
                    return cont(classfield, classBody);
                if (type == "[")
                    return cont(expression, maybetype, expect("]"), classfield, classBody);
                if (value == "*") {
                    cx.marked = "keyword";
                    return cont(classBody)
                }
                if (isTS && type == "(")
                    return pass(functiondecl, classBody);
                if (type == ";" || type == ",")
                    return cont(classBody);
                if (type == "}")
                    return cont();
                if (value == "@")
                    return cont(expression, classBody)
            }
            function classfield(type, value) {
                if (value == "!")
                    return cont(classfield);
                if (value == "?")
                    return cont(classfield);
                if (type == ":")
                    return cont(typeexpr, maybeAssign);
                if (value == "=")
                    return cont(expressionNoComma);
                var context = cx.state.lexical.prev
                  , isInterface = context && context.info == "interface";
                return pass(isInterface ? functiondecl : functiondef)
            }
            function afterExport(type, value) {
                if (value == "*") {
                    cx.marked = "keyword";
                    return cont(maybeFrom, expect(";"))
                }
                if (value == "default") {
                    cx.marked = "keyword";
                    return cont(expression, expect(";"))
                }
                if (type == "{")
                    return cont(commasep(exportField, "}"), maybeFrom, expect(";"));
                return pass(statement)
            }
            function exportField(type, value) {
                if (value == "as") {
                    cx.marked = "keyword";
                    return cont(expect("variable"))
                }
                if (type == "variable")
                    return pass(expressionNoComma, exportField)
            }
            function afterImport(type) {
                if (type == "string")
                    return cont();
                if (type == "(")
                    return pass(expression);
                if (type == ".")
                    return pass(maybeoperatorComma);
                return pass(importSpec, maybeMoreImports, maybeFrom)
            }
            function importSpec(type, value) {
                if (type == "{")
                    return contCommasep(importSpec, "}");
                if (type == "variable")
                    register(value);
                if (value == "*")
                    cx.marked = "keyword";
                return cont(maybeAs)
            }
            function maybeMoreImports(type) {
                if (type == ",")
                    return cont(importSpec, maybeMoreImports)
            }
            function maybeAs(_type, value) {
                if (value == "as") {
                    cx.marked = "keyword";
                    return cont(importSpec)
                }
            }
            function maybeFrom(_type, value) {
                if (value == "from") {
                    cx.marked = "keyword";
                    return cont(expression)
                }
            }
            function arrayLiteral(type) {
                if (type == "]")
                    return cont();
                return pass(commasep(expressionNoComma, "]"))
            }
            function enumdef() {
                return pass(pushlex("form"), pattern, expect("{"), pushlex("}"), commasep(enummember, "}"), poplex, poplex)
            }
            function enummember() {
                return pass(pattern, maybeAssign)
            }
            function isContinuedStatement(state, textAfter) {
                return state.lastType == "operator" || state.lastType == "," || isOperatorChar.test(textAfter.charAt(0)) || /[,.]/.test(textAfter.charAt(0))
            }
            function expressionAllowed(stream, state, backUp) {
                return state.tokenize == tokenBase && /^(?:operator|sof|keyword [bcd]|case|new|export|default|spread|[\[{}\(,;:]|=>)$/.test(state.lastType) || state.lastType == "quasi" && /\{\s*$/.test(stream.string.slice(0, stream.pos - (backUp || 0)))
            }
            return {
                startState: function(basecolumn) {
                    var state = {
                        tokenize: tokenBase,
                        lastType: "sof",
                        cc: [],
                        lexical: new JSLexical((basecolumn || 0) - indentUnit,0,"block",false),
                        localVars: parserConfig.localVars,
                        context: parserConfig.localVars && new Context(null,null,false),
                        indented: basecolumn || 0
                    };
                    if (parserConfig.globalVars && typeof parserConfig.globalVars == "object")
                        state.globalVars = parserConfig.globalVars;
                    return state
                },
                token: function(stream, state) {
                    if (stream.sol()) {
                        if (!state.lexical.hasOwnProperty("align"))
                            state.lexical.align = false;
                        state.indented = stream.indentation();
                        findFatArrow(stream, state)
                    }
                    if (state.tokenize != tokenComment && stream.eatSpace())
                        return null;
                    var style = state.tokenize(stream, state);
                    if (type == "comment")
                        return style;
                    state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
                    return parseJS(state, style, type, content, stream)
                },
                indent: function(state, textAfter) {
                    if (state.tokenize == tokenComment || state.tokenize == tokenQuasi)
                        return CodeMirror.Pass;
                    if (state.tokenize != tokenBase)
                        return 0;
                    var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical, top;
                    if (!/^\s*else\b/.test(textAfter))
                        for (var i = state.cc.length - 1; i >= 0; --i) {
                            var c = state.cc[i];
                            if (c == poplex)
                                lexical = lexical.prev;
                            else if (c != maybeelse && c != popcontext)
                                break
                        }
                    while ((lexical.type == "stat" || lexical.type == "form") && (firstChar == "}" || (top = state.cc[state.cc.length - 1]) && (top == maybeoperatorComma || top == maybeoperatorNoComma) && !/^[,\.=+\-*:?[\(]/.test(textAfter)))
                        lexical = lexical.prev;
                    if (statementIndent && lexical.type == ")" && lexical.prev.type == "stat")
                        lexical = lexical.prev;
                    var type = lexical.type
                      , closing = firstChar == type;
                    if (type == "vardef")
                        return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? lexical.info.length + 1 : 0);
                    else if (type == "form" && firstChar == "{")
                        return lexical.indented;
                    else if (type == "form")
                        return lexical.indented + indentUnit;
                    else if (type == "stat")
                        return lexical.indented + (isContinuedStatement(state, textAfter) ? statementIndent || indentUnit : 0);
                    else if (lexical.info == "switch" && !closing && parserConfig.doubleIndentSwitch != false)
                        return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
                    else if (lexical.align)
                        return lexical.column + (closing ? 0 : 1);
                    else
                        return lexical.indented + (closing ? 0 : indentUnit)
                },
                electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
                blockCommentStart: jsonMode ? null : "/*",
                blockCommentEnd: jsonMode ? null : "*/",
                blockCommentContinue: jsonMode ? null : " * ",
                lineComment: jsonMode ? null : "//",
                fold: "brace",
                closeBrackets: "()[]{}''\"\"``",
                helperType: jsonMode ? "json" : "javascript",
                jsonldMode: jsonldMode,
                jsonMode: jsonMode,
                expressionAllowed: expressionAllowed,
                skipExpression: function(state) {
                    parseJS(state, "atom", "atom", "true", new CodeMirror.StringStream("",2,null))
                }
            }
        });
        CodeMirror.registerHelper("wordChars", "javascript", /[\w$]/);
        CodeMirror.defineMIME("text/javascript", "javascript");
        CodeMirror.defineMIME("text/ecmascript", "javascript");
        CodeMirror.defineMIME("application/javascript", "javascript");
        CodeMirror.defineMIME("application/x-javascript", "javascript");
        CodeMirror.defineMIME("application/ecmascript", "javascript");
        CodeMirror.defineMIME("application/json", {
            name: "javascript",
            json: true
        });
        CodeMirror.defineMIME("application/x-json", {
            name: "javascript",
            json: true
        });
        CodeMirror.defineMIME("application/manifest+json", {
            name: "javascript",
            json: true
        });
        CodeMirror.defineMIME("application/ld+json", {
            name: "javascript",
            jsonld: true
        });
        CodeMirror.defineMIME("text/typescript", {
            name: "javascript",
            typescript: true
        });
        CodeMirror.defineMIME("application/typescript", {
            name: "javascript",
            typescript: true
        })
    });
}
).call(this);
/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var g, aa = function(a) {
    var b = 0;
    return function() {
        return b < a.length ? {
            done: !1,
            value: a[b++]
        } : {
            done: !0
        }
    }
}, ba = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
    if (a == Array.prototype || a == Object.prototype)
        return a;
    a[b] = c.value;
    return a
}
, ca = function(a) {
    a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
    for (var b = 0; b < a.length; ++b) {
        var c = a[b];
        if (c && c.Math == Math)
            return c
    }
    throw Error("Cannot find global object");
}, da = ca(this), ea = function(a, b) {
    if (b)
        a: {
            var c = da;
            a = a.split(".");
            for (var d = 0; d < a.length - 1; d++) {
                var e = a[d];
                if (!(e in c))
                    break a;
                c = c[e]
            }
            a = a[a.length - 1];
            d = c[a];
            b = b(d);
            b != d && null != b && ba(c, a, {
                configurable: !0,
                writable: !0,
                value: b
            })
        }
};
ea("Symbol", function(a) {
    if (a)
        return a;
    var b = function(f, h) {
        this.g = f;
        ba(this, "description", {
            configurable: !0,
            writable: !0,
            value: h
        })
    };
    b.prototype.toString = function() {
        return this.g
    }
    ;
    var c = "jscomp_symbol_" + (1E9 * Math.random() >>> 0) + "_"
      , d = 0
      , e = function(f) {
        if (this instanceof e)
            throw new TypeError("Symbol is not a constructor");
        return new b(c + (f || "") + "_" + d++,f)
    };
    return e
});
ea("Symbol.iterator", function(a) {
    if (a)
        return a;
    a = Symbol("Symbol.iterator");
    for (var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), c = 0; c < b.length; c++) {
        var d = da[b[c]];
        "function" === typeof d && "function" != typeof d.prototype[a] && ba(d.prototype, a, {
            configurable: !0,
            writable: !0,
            value: function() {
                return fa(aa(this))
            }
        })
    }
    return a
});
var fa = function(a) {
    a = {
        next: a
    };
    a[Symbol.iterator] = function() {
        return this
    }
    ;
    return a
}, ha = function(a) {
    var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
    if (b)
        return b.call(a);
    if ("number" == typeof a.length)
        return {
            next: aa(a)
        };
    throw Error(String(a) + " is not an iterable or ArrayLike");
}, ia = "function" == typeof Object.create ? Object.create : function(a) {
    var b = function() {};
    b.prototype = a;
    return new b
}
, ja;
if ("function" == typeof Object.setPrototypeOf)
    ja = Object.setPrototypeOf;
else {
    var ka;
    a: {
        var la = {
            a: !0
        }
          , ma = {};
        try {
            ma.__proto__ = la;
            ka = ma.a;
            break a
        } catch (a) {}
        ka = !1
    }
    ja = ka ? function(a, b) {
        a.__proto__ = b;
        if (a.__proto__ !== b)
            throw new TypeError(a + " is not extensible");
        return a
    }
    : null
}
var na = ja
  , oa = function(a, b) {
    a.prototype = ia(b.prototype);
    a.prototype.constructor = a;
    if (na)
        na(a, b);
    else
        for (var c in b)
            if ("prototype" != c)
                if (Object.defineProperties) {
                    var d = Object.getOwnPropertyDescriptor(b, c);
                    d && Object.defineProperty(a, c, d)
                } else
                    a[c] = b[c];
    a.l = b.prototype
}
  , pa = function(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b)
};
ea("WeakMap", function(a) {
    function b() {}
    function c(l) {
        var m = typeof l;
        return "object" === m && null !== l || "function" === m
    }
    function d(l) {
        if (!pa(l, f)) {
            var m = new b;
            ba(l, f, {
                value: m
            })
        }
    }
    function e(l) {
        var m = Object[l];
        m && (Object[l] = function(n) {
            if (n instanceof b)
                return n;
            Object.isExtensible(n) && d(n);
            return m(n)
        }
        )
    }
    if (function() {
        if (!a || !Object.seal)
            return !1;
        try {
            var l = Object.seal({})
              , m = Object.seal({})
              , n = new a([[l, 2], [m, 3]]);
            if (2 != n.get(l) || 3 != n.get(m))
                return !1;
            n.delete(l);
            n.set(m, 4);
            return !n.has(l) && 4 == n.get(m)
        } catch (w) {
            return !1
        }
    }())
        return a;
    var f = "$jscomp_hidden_" + Math.random();
    e("freeze");
    e("preventExtensions");
    e("seal");
    var h = 0
      , k = function(l) {
        this.g = (h += Math.random() + 1).toString();
        if (l) {
            l = ha(l);
            for (var m; !(m = l.next()).done; )
                m = m.value,
                this.set(m[0], m[1])
        }
    };
    k.prototype.set = function(l, m) {
        if (!c(l))
            throw Error("Invalid WeakMap key");
        d(l);
        if (!pa(l, f))
            throw Error("WeakMap key fail: " + l);
        l[f][this.g] = m;
        return this
    }
    ;
    k.prototype.get = function(l) {
        return c(l) && pa(l, f) ? l[f][this.g] : void 0
    }
    ;
    k.prototype.has = function(l) {
        return c(l) && pa(l, f) && pa(l[f], this.g)
    }
    ;
    k.prototype.delete = function(l) {
        return c(l) && pa(l, f) && pa(l[f], this.g) ? delete l[f][this.g] : !1
    }
    ;
    return k
});
ea("Map", function(a) {
    if (function() {
        if (!a || "function" != typeof a || !a.prototype.entries || "function" != typeof Object.seal)
            return !1;
        try {
            var k = Object.seal({
                x: 4
            })
              , l = new a(ha([[k, "s"]]));
            if ("s" != l.get(k) || 1 != l.size || l.get({
                x: 4
            }) || l.set({
                x: 4
            }, "t") != l || 2 != l.size)
                return !1;
            var m = l.entries()
              , n = m.next();
            if (n.done || n.value[0] != k || "s" != n.value[1])
                return !1;
            n = m.next();
            return n.done || 4 != n.value[0].x || "t" != n.value[1] || !m.next().done ? !1 : !0
        } catch (w) {
            return !1
        }
    }())
        return a;
    var b = new WeakMap
      , c = function(k) {
        this.j = {};
        this.g = f();
        this.size = 0;
        if (k) {
            k = ha(k);
            for (var l; !(l = k.next()).done; )
                l = l.value,
                this.set(l[0], l[1])
        }
    };
    c.prototype.set = function(k, l) {
        k = 0 === k ? 0 : k;
        var m = d(this, k);
        m.list || (m.list = this.j[m.id] = []);
        m.ha ? m.ha.value = l : (m.ha = {
            next: this.g,
            Qa: this.g.Qa,
            head: this.g,
            key: k,
            value: l
        },
        m.list.push(m.ha),
        this.g.Qa.next = m.ha,
        this.g.Qa = m.ha,
        this.size++);
        return this
    }
    ;
    c.prototype.delete = function(k) {
        k = d(this, k);
        return k.ha && k.list ? (k.list.splice(k.index, 1),
        k.list.length || delete this.j[k.id],
        k.ha.Qa.next = k.ha.next,
        k.ha.next.Qa = k.ha.Qa,
        k.ha.head = null,
        this.size--,
        !0) : !1
    }
    ;
    c.prototype.clear = function() {
        this.j = {};
        this.g = this.g.Qa = f();
        this.size = 0
    }
    ;
    c.prototype.has = function(k) {
        return !!d(this, k).ha
    }
    ;
    c.prototype.get = function(k) {
        return (k = d(this, k).ha) && k.value
    }
    ;
    c.prototype.entries = function() {
        return e(this, function(k) {
            return [k.key, k.value]
        })
    }
    ;
    c.prototype.keys = function() {
        return e(this, function(k) {
            return k.key
        })
    }
    ;
    c.prototype.values = function() {
        return e(this, function(k) {
            return k.value
        })
    }
    ;
    c.prototype.forEach = function(k, l) {
        for (var m = this.entries(), n; !(n = m.next()).done; )
            n = n.value,
            k.call(l, n[1], n[0], this)
    }
    ;
    c.prototype[Symbol.iterator] = c.prototype.entries;
    var d = function(k, l) {
        var m = l && typeof l;
        "object" == m || "function" == m ? b.has(l) ? m = b.get(l) : (m = "" + ++h,
        b.set(l, m)) : m = "p_" + l;
        var n = k.j[m];
        if (n && pa(k.j, m))
            for (k = 0; k < n.length; k++) {
                var w = n[k];
                if (l !== l && w.key !== w.key || l === w.key)
                    return {
                        id: m,
                        list: n,
                        index: k,
                        ha: w
                    }
            }
        return {
            id: m,
            list: n,
            index: -1,
            ha: void 0
        }
    }
      , e = function(k, l) {
        var m = k.g;
        return fa(function() {
            if (m) {
                for (; m.head != k.g; )
                    m = m.Qa;
                for (; m.next != m.head; )
                    return m = m.next,
                    {
                        done: !1,
                        value: l(m)
                    };
                m = null
            }
            return {
                done: !0,
                value: void 0
            }
        })
    }
      , f = function() {
        var k = {};
        return k.Qa = k.next = k.head = k
    }
      , h = 0;
    return c
});
ea("Array.prototype.find", function(a) {
    return a ? a : function(b, c) {
        a: {
            var d = this;
            d instanceof String && (d = String(d));
            for (var e = d.length, f = 0; f < e; f++) {
                var h = d[f];
                if (b.call(c, h, f, d)) {
                    b = h;
                    break a
                }
            }
            b = void 0
        }
        return b
    }
});
var qa = function(a, b) {
    a instanceof String && (a += "");
    var c = 0
      , d = !1
      , e = {
        next: function() {
            if (!d && c < a.length) {
                var f = c++;
                return {
                    value: b(f, a[f]),
                    done: !1
                }
            }
            d = !0;
            return {
                done: !0,
                value: void 0
            }
        }
    };
    e[Symbol.iterator] = function() {
        return e
    }
    ;
    return e
};
ea("Array.prototype.values", function(a) {
    return a ? a : function() {
        return qa(this, function(b, c) {
            return c
        })
    }
});
ea("Array.prototype.keys", function(a) {
    return a ? a : function() {
        return qa(this, function(b) {
            return b
        })
    }
});
ea("Array.prototype.entries", function(a) {
    return a ? a : function() {
        return qa(this, function(b, c) {
            return [b, c]
        })
    }
});
ea("Array.from", function(a) {
    return a ? a : function(b, c, d) {
        c = null != c ? c : function(k) {
            return k
        }
        ;
        var e = []
          , f = "undefined" != typeof Symbol && Symbol.iterator && b[Symbol.iterator];
        if ("function" == typeof f) {
            b = f.call(b);
            for (var h = 0; !(f = b.next()).done; )
                e.push(c.call(d, f.value, h++))
        } else
            for (f = b.length,
            h = 0; h < f; h++)
                e.push(c.call(d, b[h], h));
        return e
    }
});
ea("Math.sign", function(a) {
    return a ? a : function(b) {
        b = Number(b);
        return 0 === b || isNaN(b) ? b : 0 < b ? 1 : -1
    }
});
ea("Object.entries", function(a) {
    return a ? a : function(b) {
        var c = [], d;
        for (d in b)
            pa(b, d) && c.push([d, b[d]]);
        return c
    }
});
var ra = ra || {}
  , p = this || self
  , sa = function(a) {
    a.Ec = void 0;
    a.va = function() {
        return a.Ec ? a.Ec : a.Ec = new a
    }
}
  , ta = function(a) {
    var b = typeof a;
    b = "object" != b ? b : a ? Array.isArray(a) ? "array" : b : "null";
    return "array" == b || "object" == b && "number" == typeof a.length
}
  , ua = function(a) {
    var b = typeof a;
    return "object" == b && null != a || "function" == b
}
  , xa = function(a) {
    return Object.prototype.hasOwnProperty.call(a, va) && a[va] || (a[va] = ++wa)
}
  , va = "closure_uid_" + (1E9 * Math.random() >>> 0)
  , wa = 0
  , ya = function(a, b, c) {
    return a.call.apply(a.bind, arguments)
}
  , za = function(a, b, c) {
    if (!a)
        throw Error();
    if (2 < arguments.length) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function() {
            var e = Array.prototype.slice.call(arguments);
            Array.prototype.unshift.apply(e, d);
            return a.apply(b, e)
        }
    }
    return function() {
        return a.apply(b, arguments)
    }
}
  , Aa = function(a, b, c) {
    Aa = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ya : za;
    return Aa.apply(null, arguments)
}
  , Ba = function(a, b) {
    var c = Array.prototype.slice.call(arguments, 1);
    return function() {
        var d = c.slice();
        d.push.apply(d, arguments);
        return a.apply(this, d)
    }
}
  , q = function(a, b) {
    function c() {}
    c.prototype = b.prototype;
    a.l = b.prototype;
    a.prototype = new c;
    a.prototype.constructor = a;
    a.ne = function(d, e, f) {
        for (var h = Array(arguments.length - 2), k = 2; k < arguments.length; k++)
            h[k - 2] = arguments[k];
        return b.prototype[e].apply(d, h)
    }
}
  , Ca = function(a) {
    return a
};
var Da;
var Ea = Array.prototype.indexOf ? function(a, b) {
    return Array.prototype.indexOf.call(a, b, void 0)
}
: function(a, b) {
    if ("string" === typeof a)
        return "string" !== typeof b || 1 != b.length ? -1 : a.indexOf(b, 0);
    for (var c = 0; c < a.length; c++)
        if (c in a && a[c] === b)
            return c;
    return -1
}
  , Fa = Array.prototype.forEach ? function(a, b) {
    Array.prototype.forEach.call(a, b, void 0)
}
: function(a, b) {
    for (var c = a.length, d = "string" === typeof a ? a.split("") : a, e = 0; e < c; e++)
        e in d && b.call(void 0, d[e], e, a)
}
  , Ga = Array.prototype.map ? function(a, b) {
    return Array.prototype.map.call(a, b, void 0)
}
: function(a, b) {
    for (var c = a.length, d = Array(c), e = "string" === typeof a ? a.split("") : a, f = 0; f < c; f++)
        f in e && (d[f] = b.call(void 0, e[f], f, a));
    return d
}
;
function Ha(a, b) {
    return 0 <= Ea(a, b)
}
function Ia(a, b) {
    b = Ea(a, b);
    var c;
    (c = 0 <= b) && Array.prototype.splice.call(a, b, 1);
    return c
}
function Ja(a) {
    var b = a.length;
    if (0 < b) {
        for (var c = Array(b), d = 0; d < b; d++)
            c[d] = a[d];
        return c
    }
    return []
}
function Ka(a, b, c, d) {
    Array.prototype.splice.apply(a, La(arguments, 1))
}
function La(a, b, c) {
    return 2 >= arguments.length ? Array.prototype.slice.call(a, b) : Array.prototype.slice.call(a, b, c)
}
;var Ma = function(a, b) {
    return 0 == a.lastIndexOf(b, 0)
}
  , t = String.prototype.trim ? function(a) {
    return a.trim()
}
: function(a) {
    return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]
}
  , Na = /&/g
  , Oa = /</g
  , Pa = />/g
  , Qa = /"/g
  , Ra = /'/g
  , Sa = /\x00/g
  , Ta = /[\x00&<>"']/
  , Va = function(a, b) {
    var c = 0;
    a = t(String(a)).split(".");
    b = t(String(b)).split(".");
    for (var d = Math.max(a.length, b.length), e = 0; 0 == c && e < d; e++) {
        var f = a[e] || ""
          , h = b[e] || "";
        do {
            f = /(\d*)(\D*)(.*)/.exec(f) || ["", "", "", ""];
            h = /(\d*)(\D*)(.*)/.exec(h) || ["", "", "", ""];
            if (0 == f[0].length && 0 == h[0].length)
                break;
            c = Ua(0 == f[1].length ? 0 : parseInt(f[1], 10), 0 == h[1].length ? 0 : parseInt(h[1], 10)) || Ua(0 == f[2].length, 0 == h[2].length) || Ua(f[2], h[2]);
            f = f[3];
            h = h[3]
        } while (0 == c)
    }
    return c
}
  , Ua = function(a, b) {
    return a < b ? -1 : a > b ? 1 : 0
};
var Wa, Xa;
a: {
    for (var Ya = ["CLOSURE_FLAGS"], Za = p, $a = 0; $a < Ya.length; $a++)
        if (Za = Za[Ya[$a]],
        null == Za) {
            Xa = null;
            break a
        }
    Xa = Za
}
var ab = Xa && Xa[610401301];
Wa = null != ab ? ab : !1;
function bb() {
    var a = p.navigator;
    return a && (a = a.userAgent) ? a : ""
}
var cb, db = p.navigator;
cb = db ? db.userAgentData || null : null;
function eb(a) {
    return Wa ? cb ? cb.brands.some(function(b) {
        return (b = b.brand) && -1 != b.indexOf(a)
    }) : !1 : !1
}
function u(a) {
    return -1 != bb().indexOf(a)
}
;function fb() {
    return Wa ? !!cb && 0 < cb.brands.length : !1
}
function gb() {
    return fb() ? !1 : u("Opera")
}
function hb() {
    return u("Firefox") || u("FxiOS")
}
function ib() {
    return fb() ? eb("Chromium") : (u("Chrome") || u("CriOS")) && !(fb() ? 0 : u("Edge")) || u("Silk")
}
;function jb() {
    return Wa ? !!cb && !!cb.platform : !1
}
function kb() {
    return u("iPhone") && !u("iPod") && !u("iPad")
}
function lb() {
    return kb() || u("iPad") || u("iPod")
}
function mb() {
    return jb() ? "macOS" === cb.platform : u("Macintosh")
}
;var nb = function(a) {
    nb[" "](a);
    return a
};
nb[" "] = function() {}
;
var ob = function(a, b) {
    try {
        return nb(a[b]),
        !0
    } catch (c) {}
    return !1
};
var pb = gb(), v = fb() ? !1 : u("Trident") || u("MSIE"), qb = u("Edge"), rb = qb || v, x = u("Gecko") && !(-1 != bb().toLowerCase().indexOf("webkit") && !u("Edge")) && !(u("Trident") || u("MSIE")) && !u("Edge"), y = -1 != bb().toLowerCase().indexOf("webkit") && !u("Edge"), z = mb(), sb = jb() ? "Windows" === cb.platform : u("Windows"), tb = jb() ? "Android" === cb.platform : u("Android"), ub = kb(), vb = u("iPad"), wb = u("iPod"), xb = lb(), yb = function() {
    var a = p.document;
    return a ? a.documentMode : void 0
}, zb;
a: {
    var Ab = ""
      , Bb = function() {
        var a = bb();
        if (x)
            return /rv:([^\);]+)(\)|;)/.exec(a);
        if (qb)
            return /Edge\/([\d\.]+)/.exec(a);
        if (v)
            return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);
        if (y)
            return /WebKit\/(\S+)/.exec(a);
        if (pb)
            return /(?:Version)[ \/]?(\S+)/.exec(a)
    }();
    Bb && (Ab = Bb ? Bb[1] : "");
    if (v) {
        var Cb = yb();
        if (null != Cb && Cb > parseFloat(Ab)) {
            zb = String(Cb);
            break a
        }
    }
    zb = Ab
}
var Db = zb, Eb = {}, Fb;
if (p.document && v) {
    var Gb = yb();
    Fb = Gb ? Gb : parseInt(Db, 10) || void 0
} else
    Fb = void 0;
var Hb = Fb;
var Ib = function() {};
var Lb = function(a, b) {
    this.g = a === Jb && b || "";
    this.j = Kb
};
Lb.prototype.Dc = !0;
Lb.prototype.zc = function() {
    return this.g
}
;
var Mb = function(a) {
    return a instanceof Lb && a.constructor === Lb && a.j === Kb ? a.g : "type_error:Const"
}
  , Kb = {}
  , Jb = {};
var Nb, Ob = function() {
    if (void 0 === Nb) {
        var a = null
          , b = p.trustedTypes;
        if (b && b.createPolicy) {
            try {
                a = b.createPolicy("goog#html", {
                    createHTML: Ca,
                    createScript: Ca,
                    createScriptURL: Ca
                })
            } catch (c) {
                p.console && p.console.error(c.message)
            }
            Nb = a
        } else
            Nb = a
    }
    return Nb
};
var Pb = function(a) {
    this.g = a
};
Pb.prototype.toString = function() {
    return this.g + ""
}
;
Pb.prototype.Dc = !0;
Pb.prototype.zc = function() {
    return this.g.toString()
}
;
var Qb = {}
  , Rb = function(a) {
    var b = Ob();
    a = b ? b.createScriptURL(a) : a;
    return new Pb(a,Qb)
};
function Sb(a, b, c) {
    for (var d in a)
        b.call(c, a[d], d, a)
}
function Tb(a, b) {
    for (var c in a)
        if (b.call(void 0, a[c], c, a))
            return !0;
    return !1
}
function Ub(a, b, c) {
    if (null !== a && b in a)
        throw Error('The object already contains the key "' + b + '"');
    a[b] = c
}
function Vb(a) {
    var b = {}, c;
    for (c in a)
        b[a[c]] = c;
    return b
}
var Wb = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
function Xb(a, b) {
    for (var c, d, e = 1; e < arguments.length; e++) {
        d = arguments[e];
        for (c in d)
            a[c] = d[c];
        for (var f = 0; f < Wb.length; f++)
            c = Wb[f],
            Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
    }
}
;var Yb = {}
  , Zb = function(a) {
    this.g = a;
    this.Dc = !0
};
Zb.prototype.zc = function() {
    return this.g.toString()
}
;
Zb.prototype.toString = function() {
    return this.g.toString()
}
;
var $b = function(a) {
    return a instanceof Zb && a.constructor === Zb ? a.g : "type_error:SafeHtml"
}
  , ac = new Zb(p.trustedTypes && p.trustedTypes.emptyHTML || "",Yb);
var bc = function(a) {
    var b = !1, c;
    return function() {
        b || (c = a(),
        b = !0);
        return c
    }
}(function() {
    var a = document.createElement("div")
      , b = document.createElement("div");
    b.appendChild(document.createElement("div"));
    a.appendChild(b);
    b = a.firstChild.firstChild;
    a.innerHTML = $b(ac);
    return !b.parentElement
})
  , cc = function(a, b) {
    if (bc())
        for (; a.lastChild; )
            a.removeChild(a.lastChild);
    a.innerHTML = $b(b)
};
var A = function(a, b) {
    this.x = void 0 !== a ? a : 0;
    this.y = void 0 !== b ? b : 0
}
  , dc = function(a, b) {
    return new A(a.x - b.x,a.y - b.y)
};
A.prototype.ceil = function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this
}
;
A.prototype.floor = function() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this
}
;
A.prototype.round = function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this
}
;
var B = function(a, b) {
    this.width = a;
    this.height = b
};
B.prototype.aspectRatio = function() {
    return this.width / this.height
}
;
B.prototype.ceil = function() {
    this.width = Math.ceil(this.width);
    this.height = Math.ceil(this.height);
    return this
}
;
B.prototype.floor = function() {
    this.width = Math.floor(this.width);
    this.height = Math.floor(this.height);
    return this
}
;
B.prototype.round = function() {
    this.width = Math.round(this.width);
    this.height = Math.round(this.height);
    return this
}
;
var ec = function(a) {
    return a.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
}
  , D = function(a) {
    return encodeURIComponent(String(a))
}
  , fc = function(a) {
    Ta.test(a) && (-1 != a.indexOf("&") && (a = a.replace(Na, "&amp;")),
    -1 != a.indexOf("<") && (a = a.replace(Oa, "&lt;")),
    -1 != a.indexOf(">") && (a = a.replace(Pa, "&gt;")),
    -1 != a.indexOf('"') && (a = a.replace(Qa, "&quot;")),
    -1 != a.indexOf("'") && (a = a.replace(Ra, "&#39;")),
    -1 != a.indexOf("\x00") && (a = a.replace(Sa, "&#0;")));
    return a
}
  , gc = String.prototype.repeat ? function(a, b) {
    return a.repeat(b)
}
: function(a, b) {
    return Array(b + 1).join(a)
}
;
var ic = function(a) {
    return a ? new hc(E(a)) : Da || (Da = new hc)
}
  , jc = function(a, b) {
    return "string" === typeof b ? a.getElementById(b) : b
}
  , kc = function(a, b, c, d) {
    a = d || a;
    b = b && "*" != b ? String(b).toUpperCase() : "";
    if (a.querySelectorAll && a.querySelector && (b || c))
        return a.querySelectorAll(b + (c ? "." + c : ""));
    if (c && a.getElementsByClassName) {
        a = a.getElementsByClassName(c);
        if (b) {
            d = {};
            for (var e = 0, f = 0, h; h = a[f]; f++)
                b == h.nodeName && (d[e++] = h);
            d.length = e;
            return d
        }
        return a
    }
    a = a.getElementsByTagName(b || "*");
    if (c) {
        d = {};
        for (f = e = 0; h = a[f]; f++)
            b = h.className,
            "function" == typeof b.split && Ha(b.split(/\s+/), c) && (d[e++] = h);
        d.length = e;
        return d
    }
    return a
}
  , mc = function(a, b) {
    Sb(b, function(c, d) {
        c && "object" == typeof c && c.Dc && (c = c.zc());
        "style" == d ? a.style.cssText = c : "class" == d ? a.className = c : "for" == d ? a.htmlFor = c : lc.hasOwnProperty(d) ? a.setAttribute(lc[d], c) : Ma(d, "aria-") || Ma(d, "data-") ? a.setAttribute(d, c) : a[d] = c
    })
}
  , lc = {
    cellpadding: "cellPadding",
    cellspacing: "cellSpacing",
    colspan: "colSpan",
    frameborder: "frameBorder",
    height: "height",
    maxlength: "maxLength",
    nonce: "nonce",
    role: "role",
    rowspan: "rowSpan",
    type: "type",
    usemap: "useMap",
    valign: "vAlign",
    width: "width"
}
  , nc = function(a) {
    a = a.document.documentElement;
    return new B(a.clientWidth,a.clientHeight)
}
  , qc = function(a) {
    var b = oc(a);
    a = pc(a);
    return v && a.pageYOffset != b.scrollTop ? new A(b.scrollLeft,b.scrollTop) : new A(a.pageXOffset || b.scrollLeft,a.pageYOffset || b.scrollTop)
}
  , oc = function(a) {
    return a.scrollingElement ? a.scrollingElement : y ? a.body || a.documentElement : a.documentElement
}
  , rc = function(a) {
    return a ? pc(a) : window
}
  , pc = function(a) {
    return a.parentWindow || a.defaultView
}
  , tc = function(a, b, c) {
    return sc(document, arguments)
}
  , sc = function(a, b) {
    var c = b[1]
      , d = uc(a, String(b[0]));
    c && ("string" === typeof c ? d.className = c : Array.isArray(c) ? d.className = c.join(" ") : mc(d, c));
    2 < b.length && vc(a, d, b, 2);
    return d
}
  , vc = function(a, b, c, d) {
    function e(k) {
        k && b.appendChild("string" === typeof k ? a.createTextNode(k) : k)
    }
    for (; d < c.length; d++) {
        var f = c[d];
        if (!ta(f) || ua(f) && 0 < f.nodeType)
            e(f);
        else {
            a: {
                if (f && "number" == typeof f.length) {
                    if (ua(f)) {
                        var h = "function" == typeof f.item || "string" == typeof f.item;
                        break a
                    }
                    if ("function" === typeof f) {
                        h = "function" == typeof f.item;
                        break a
                    }
                }
                h = !1
            }
            Fa(h ? Ja(f) : f, e)
        }
    }
}
  , uc = function(a, b) {
    b = String(b);
    "application/xhtml+xml" === a.contentType && (b = b.toLowerCase());
    return a.createElement(b)
}
  , wc = function(a, b) {
    vc(E(a), a, arguments, 1)
}
  , xc = function(a) {
    for (var b; b = a.firstChild; )
        a.removeChild(b)
}
  , yc = function(a) {
    return a && a.parentNode ? a.parentNode.removeChild(a) : null
}
  , zc = function(a) {
    return void 0 != a.children ? a.children : Array.prototype.filter.call(a.childNodes, function(b) {
        return 1 == b.nodeType
    })
}
  , Ac = function(a) {
    if (void 0 !== a.firstElementChild)
        a = a.firstElementChild;
    else
        for (a = a.firstChild; a && 1 != a.nodeType; )
            a = a.nextSibling;
    return a
}
  , Bc = function(a, b) {
    if (!a || !b)
        return !1;
    if (a.contains && 1 == b.nodeType)
        return a == b || a.contains(b);
    if ("undefined" != typeof a.compareDocumentPosition)
        return a == b || !!(a.compareDocumentPosition(b) & 16);
    for (; b && a != b; )
        b = b.parentNode;
    return b == a
}
  , E = function(a) {
    return 9 == a.nodeType ? a : a.ownerDocument || a.document
}
  , Cc = function(a, b) {
    if ("textContent"in a)
        a.textContent = b;
    else if (3 == a.nodeType)
        a.data = String(b);
    else if (a.firstChild && 3 == a.firstChild.nodeType) {
        for (; a.lastChild != a.firstChild; )
            a.removeChild(a.lastChild);
        a.firstChild.data = String(b)
    } else
        xc(a),
        a.appendChild(E(a).createTextNode(String(b)))
}
  , Dc = {
    SCRIPT: 1,
    STYLE: 1,
    HEAD: 1,
    IFRAME: 1,
    OBJECT: 1
}
  , Ec = {
    IMG: " ",
    BR: "\n"
}
  , Fc = function(a, b) {
    b ? a.tabIndex = 0 : (a.tabIndex = -1,
    a.removeAttribute("tabIndex"))
}
  , Gc = function(a) {
    return a.hasAttribute("tabindex")
}
  , Hc = function(a) {
    a = a.tabIndex;
    return "number" === typeof a && 0 <= a && 32768 > a
}
  , Jc = function(a) {
    var b = [];
    Ic(a, b, !0);
    a = b.join("");
    a = a.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
    a = a.replace(/\u200B/g, "");
    a = a.replace(/ +/g, " ");
    " " != a && (a = a.replace(/^\s*/, ""));
    return a
}
  , Kc = function(a) {
    var b = [];
    Ic(a, b, !1);
    return b.join("")
}
  , Ic = function(a, b, c) {
    if (!(a.nodeName in Dc))
        if (3 == a.nodeType)
            c ? b.push(String(a.nodeValue).replace(/(\r\n|\r|\n)/g, "")) : b.push(a.nodeValue);
        else if (a.nodeName in Ec)
            b.push(Ec[a.nodeName]);
        else
            for (a = a.firstChild; a; )
                Ic(a, b, c),
                a = a.nextSibling
}
  , Lc = function(a) {
    try {
        var b = a && a.activeElement;
        return b && b.nodeName ? b : null
    } catch (c) {
        return null
    }
}
  , hc = function(a) {
    this.g = a || p.document || document
};
g = hc.prototype;
g.h = function(a) {
    return jc(this.g, a)
}
;
g.F = function(a, b, c) {
    return sc(this.g, arguments)
}
;
g.Sc = yc;
g.Bd = zc;
g.ed = Ac;
g.td = Bc;
g.Ra = Cc;
function Mc(a) {
    a && "function" == typeof a.S && a.S()
}
;var F = function() {
    this.Da = this.Da;
    this.Xa = this.Xa
};
F.prototype.Da = !1;
F.prototype.S = function() {
    this.Da || (this.Da = !0,
    this.C())
}
;
var Nc = function(a, b) {
    a.Da ? b() : (a.Xa || (a.Xa = []),
    a.Xa.push(b))
};
F.prototype.C = function() {
    if (this.Xa)
        for (; this.Xa.length; )
            this.Xa.shift()()
}
;
var G = function(a, b) {
    this.type = a;
    this.v = this.target = b;
    this.defaultPrevented = this.o = !1
};
G.prototype.A = function() {
    this.o = !0
}
;
G.prototype.j = function() {
    this.defaultPrevented = !0
}
;
var Oc = function() {
    if (!p.addEventListener || !Object.defineProperty)
        return !1;
    var a = !1
      , b = Object.defineProperty({}, "passive", {
        get: function() {
            a = !0
        }
    });
    try {
        var c = function() {};
        p.addEventListener("test", c, b);
        p.removeEventListener("test", c, b)
    } catch (d) {}
    return a
}();
var H = function(a, b) {
    G.call(this, a ? a.type : "");
    this.relatedTarget = this.v = this.target = null;
    this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0;
    this.key = "";
    this.D = this.g = 0;
    this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1;
    this.state = null;
    this.B = !1;
    this.pointerId = 0;
    this.pointerType = "";
    this.i = null;
    if (a) {
        var c = this.type = a.type
          , d = a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : null;
        this.target = a.target || a.srcElement;
        this.v = b;
        (b = a.relatedTarget) ? x && (ob(b, "nodeName") || (b = null)) : "mouseover" == c ? b = a.fromElement : "mouseout" == c && (b = a.toElement);
        this.relatedTarget = b;
        d ? (this.clientX = void 0 !== d.clientX ? d.clientX : d.pageX,
        this.clientY = void 0 !== d.clientY ? d.clientY : d.pageY,
        this.screenX = d.screenX || 0,
        this.screenY = d.screenY || 0) : (this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX,
        this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY,
        this.screenX = a.screenX || 0,
        this.screenY = a.screenY || 0);
        this.button = a.button;
        this.g = a.keyCode || 0;
        this.key = a.key || "";
        this.D = a.charCode || ("keypress" == c ? a.keyCode : 0);
        this.ctrlKey = a.ctrlKey;
        this.altKey = a.altKey;
        this.shiftKey = a.shiftKey;
        this.metaKey = a.metaKey;
        this.B = z ? a.metaKey : a.ctrlKey;
        this.pointerId = a.pointerId || 0;
        this.pointerType = "string" === typeof a.pointerType ? a.pointerType : Pc[a.pointerType] || "";
        this.state = a.state;
        this.i = a;
        a.defaultPrevented && H.l.j.call(this)
    }
};
q(H, G);
var Pc = {
    2: "touch",
    3: "pen",
    4: "mouse"
};
H.prototype.A = function() {
    H.l.A.call(this);
    this.i.stopPropagation ? this.i.stopPropagation() : this.i.cancelBubble = !0
}
;
H.prototype.j = function() {
    H.l.j.call(this);
    var a = this.i;
    a.preventDefault ? a.preventDefault() : a.returnValue = !1
}
;
var Qc = "closure_listenable_" + (1E6 * Math.random() | 0)
  , Rc = function(a) {
    return !(!a || !a[Qc])
};
var Sc = 0;
var Tc = function(a, b, c, d, e) {
    this.listener = a;
    this.proxy = null;
    this.src = b;
    this.type = c;
    this.capture = !!d;
    this.Yb = e;
    this.key = ++Sc;
    this.removed = this.Sb = !1
}
  , Uc = function(a) {
    a.removed = !0;
    a.listener = null;
    a.proxy = null;
    a.src = null;
    a.Yb = null
};
var Vc = function(a) {
    this.src = a;
    this.g = {};
    this.j = 0
};
Vc.prototype.add = function(a, b, c, d, e) {
    var f = a.toString();
    a = this.g[f];
    a || (a = this.g[f] = [],
    this.j++);
    var h = Wc(a, b, d, e);
    -1 < h ? (b = a[h],
    c || (b.Sb = !1)) : (b = new Tc(b,this.src,f,!!d,e),
    b.Sb = c,
    a.push(b));
    return b
}
;
var Xc = function(a, b) {
    var c = b.type;
    c in a.g && Ia(a.g[c], b) && (Uc(b),
    0 == a.g[c].length && (delete a.g[c],
    a.j--))
};
Vc.prototype.Hb = function(a, b, c, d) {
    a = this.g[a.toString()];
    var e = -1;
    a && (e = Wc(a, b, c, d));
    return -1 < e ? a[e] : null
}
;
Vc.prototype.hasListener = function(a, b) {
    var c = void 0 !== a
      , d = c ? a.toString() : ""
      , e = void 0 !== b;
    return Tb(this.g, function(f) {
        for (var h = 0; h < f.length; ++h)
            if (!(c && f[h].type != d || e && f[h].capture != b))
                return !0;
        return !1
    })
}
;
var Wc = function(a, b, c, d) {
    for (var e = 0; e < a.length; ++e) {
        var f = a[e];
        if (!f.removed && f.listener == b && f.capture == !!c && f.Yb == d)
            return e
    }
    return -1
};
var Yc = "closure_lm_" + (1E6 * Math.random() | 0)
  , Zc = {}
  , $c = 0
  , bd = function(a, b, c, d, e) {
    if (d && d.once)
        return ad(a, b, c, d, e);
    if (Array.isArray(b)) {
        for (var f = 0; f < b.length; f++)
            bd(a, b[f], c, d, e);
        return null
    }
    c = cd(c);
    return Rc(a) ? a.s(b, c, ua(d) ? !!d.capture : !!d, e) : dd(a, b, c, !1, d, e)
}
  , dd = function(a, b, c, d, e, f) {
    if (!b)
        throw Error("Invalid event type");
    var h = ua(e) ? !!e.capture : !!e
      , k = ed(a);
    k || (a[Yc] = k = new Vc(a));
    c = k.add(b, c, d, h, f);
    if (c.proxy)
        return c;
    d = fd();
    c.proxy = d;
    d.src = a;
    d.listener = c;
    if (a.addEventListener)
        Oc || (e = h),
        void 0 === e && (e = !1),
        a.addEventListener(b.toString(), d, e);
    else if (a.attachEvent)
        a.attachEvent(gd(b.toString()), d);
    else if (a.addListener && a.removeListener)
        a.addListener(d);
    else
        throw Error("addEventListener and attachEvent are unavailable.");
    $c++;
    return c
}
  , fd = function() {
    var a = hd
      , b = function(c) {
        return a.call(b.src, b.listener, c)
    };
    return b
}
  , ad = function(a, b, c, d, e) {
    if (Array.isArray(b)) {
        for (var f = 0; f < b.length; f++)
            ad(a, b[f], c, d, e);
        return null
    }
    c = cd(c);
    return Rc(a) ? a.Jc(b, c, ua(d) ? !!d.capture : !!d, e) : dd(a, b, c, !0, d, e)
}
  , id = function(a, b, c, d, e) {
    if (Array.isArray(b))
        for (var f = 0; f < b.length; f++)
            id(a, b[f], c, d, e);
    else
        d = ua(d) ? !!d.capture : !!d,
        c = cd(c),
        Rc(a) ? a.qa(b, c, d, e) : a && (a = ed(a)) && (b = a.Hb(b, c, d, e)) && jd(b)
}
  , jd = function(a) {
    if ("number" !== typeof a && a && !a.removed) {
        var b = a.src;
        if (Rc(b))
            Xc(b.Ha, a);
        else {
            var c = a.type
              , d = a.proxy;
            b.removeEventListener ? b.removeEventListener(c, d, a.capture) : b.detachEvent ? b.detachEvent(gd(c), d) : b.addListener && b.removeListener && b.removeListener(d);
            $c--;
            (c = ed(b)) ? (Xc(c, a),
            0 == c.j && (c.src = null,
            b[Yc] = null)) : Uc(a)
        }
    }
}
  , gd = function(a) {
    return a in Zc ? Zc[a] : Zc[a] = "on" + a
}
  , hd = function(a, b) {
    if (a.removed)
        a = !0;
    else {
        b = new H(b,this);
        var c = a.listener
          , d = a.Yb || a.src;
        a.Sb && jd(a);
        a = c.call(d, b)
    }
    return a
}
  , ed = function(a) {
    a = a[Yc];
    return a instanceof Vc ? a : null
}
  , kd = "__closure_events_fn_" + (1E9 * Math.random() >>> 0)
  , cd = function(a) {
    if ("function" === typeof a)
        return a;
    a[kd] || (a[kd] = function(b) {
        return a.handleEvent(b)
    }
    );
    return a[kd]
};
var J = function() {
    F.call(this);
    this.Ha = new Vc(this);
    this.zd = this;
    this.Lc = null
};
q(J, F);
J.prototype[Qc] = !0;
g = J.prototype;
g.Xb = function() {
    return this.Lc
}
;
g.Oc = function(a) {
    this.Lc = a
}
;
g.addEventListener = function(a, b, c, d) {
    bd(this, a, b, c, d)
}
;
g.removeEventListener = function(a, b, c, d) {
    id(this, a, b, c, d)
}
;
g.dispatchEvent = function(a) {
    var b = this.Xb();
    if (b) {
        var c = [];
        for (var d = 1; b; b = b.Xb())
            c.push(b),
            ++d
    }
    b = this.zd;
    d = a.type || a;
    if ("string" === typeof a)
        a = new G(a,b);
    else if (a instanceof G)
        a.target = a.target || b;
    else {
        var e = a;
        a = new G(d,b);
        Xb(a, e)
    }
    e = !0;
    if (c)
        for (var f = c.length - 1; !a.o && 0 <= f; f--) {
            var h = a.v = c[f];
            e = ld(h, d, !0, a) && e
        }
    a.o || (h = a.v = b,
    e = ld(h, d, !0, a) && e,
    a.o || (e = ld(h, d, !1, a) && e));
    if (c)
        for (f = 0; !a.o && f < c.length; f++)
            h = a.v = c[f],
            e = ld(h, d, !1, a) && e;
    return e
}
;
g.C = function() {
    J.l.C.call(this);
    if (this.Ha) {
        var a = this.Ha, b = 0, c;
        for (c in a.g) {
            for (var d = a.g[c], e = 0; e < d.length; e++)
                ++b,
                Uc(d[e]);
            delete a.g[c];
            a.j--
        }
    }
    this.Lc = null
}
;
g.s = function(a, b, c, d) {
    return this.Ha.add(String(a), b, !1, c, d)
}
;
g.Jc = function(a, b, c, d) {
    return this.Ha.add(String(a), b, !0, c, d)
}
;
g.qa = function(a, b, c, d) {
    var e = this.Ha;
    a = String(a).toString();
    if (a in e.g) {
        var f = e.g[a];
        b = Wc(f, b, c, d);
        -1 < b ? (Uc(f[b]),
        Array.prototype.splice.call(f, b, 1),
        0 == f.length && (delete e.g[a],
        e.j--),
        e = !0) : e = !1
    } else
        e = !1;
    return e
}
;
var ld = function(a, b, c, d) {
    b = a.Ha.g[String(b)];
    if (!b)
        return !0;
    b = b.concat();
    for (var e = !0, f = 0; f < b.length; ++f) {
        var h = b[f];
        if (h && !h.removed && h.capture == c) {
            var k = h.listener
              , l = h.Yb || h.src;
            h.Sb && Xc(a.Ha, h);
            e = !1 !== k.call(l, d) && e
        }
    }
    return e && !d.defaultPrevented
};
J.prototype.Hb = function(a, b, c, d) {
    return this.Ha.Hb(String(a), b, c, d)
}
;
J.prototype.hasListener = function(a, b) {
    return this.Ha.hasListener(void 0 !== a ? String(a) : void 0, b)
}
;
var md = function(a, b, c) {
    if ("function" === typeof a)
        c && (a = Aa(a, c));
    else if (a && "function" == typeof a.handleEvent)
        a = Aa(a.handleEvent, a);
    else
        throw Error("Invalid listener argument");
    return 2147483647 < Number(b) ? -1 : p.setTimeout(a, b || 0)
};
var nd = function() {};
nd.prototype.g = null;
var pd = function(a) {
    var b;
    (b = a.g) || (b = {},
    od(a) && (b[0] = !0,
    b[1] = !0),
    b = a.g = b);
    return b
};
var qd, rd = function() {};
q(rd, nd);
var sd = function(a) {
    return (a = od(a)) ? new ActiveXObject(a) : new XMLHttpRequest
}
  , od = function(a) {
    if (!a.j && "undefined" == typeof XMLHttpRequest && "undefined" != typeof ActiveXObject) {
        for (var b = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"], c = 0; c < b.length; c++) {
            var d = b[c];
            try {
                return new ActiveXObject(d),
                a.j = d
            } catch (e) {}
        }
        throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");
    }
    return a.j
};
qd = new rd;
var td = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$")
  , ud = function(a, b) {
    if (a) {
        a = a.split("&");
        for (var c = 0; c < a.length; c++) {
            var d = a[c].indexOf("=")
              , e = null;
            if (0 <= d) {
                var f = a[c].substring(0, d);
                e = a[c].substring(d + 1)
            } else
                f = a[c];
            b(f, e ? decodeURIComponent(e.replace(/\+/g, " ")) : "")
        }
    }
};
var vd = function(a) {
    J.call(this);
    this.headers = new Map;
    this.D = a || null;
    this.g = !1;
    this.o = this.I = null;
    this.ca = "";
    this.j = this.N = this.i = this.B = !1;
    this.A = 0;
    this.v = null;
    this.ba = "";
    this.ga = this.ka = !1
};
q(vd, J);
var wd = /^https?$/i
  , xd = ["POST", "PUT"]
  , yd = [];
vd.prototype.bb = function() {
    this.S();
    Ia(yd, this)
}
;
var Cd = function(a, b) {
    if (a.I)
        throw Error("[goog.net.XhrIo] Object is active with another request=" + a.ca + "; newUri=compile");
    a.ca = "compile";
    a.B = !1;
    a.g = !0;
    a.I = a.D ? sd(a.D) : sd(qd);
    a.o = a.D ? pd(a.D) : pd(qd);
    a.I.onreadystatechange = Aa(a.R, a);
    try {
        a.N = !0,
        a.I.open("POST", "compile", !0),
        a.N = !1
    } catch (f) {
        zd(a);
        return
    }
    b = b || "";
    var c = new Map(a.headers)
      , d = Array.from(c.keys()).find(function(f) {
        return "content-type" == f.toLowerCase()
    })
      , e = p.FormData && b instanceof p.FormData;
    !Ha(xd, "POST") || d || e || c.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    c = ha(c);
    for (d = c.next(); !d.done; d = c.next())
        e = ha(d.value),
        d = e.next().value,
        e = e.next().value,
        a.I.setRequestHeader(d, e);
    a.ba && (a.I.responseType = a.ba);
    "withCredentials"in a.I && a.I.withCredentials !== a.ka && (a.I.withCredentials = a.ka);
    try {
        Ad(a),
        0 < a.A && (a.ga = Bd(a.I),
        a.ga ? (a.I.timeout = a.A,
        a.I.ontimeout = Aa(a.W, a)) : a.v = md(a.W, a.A, a)),
        a.i = !0,
        a.I.send(b),
        a.i = !1
    } catch (f) {
        zd(a)
    }
}
  , Bd = function(a) {
    return v && "number" === typeof a.timeout && void 0 !== a.ontimeout
};
vd.prototype.W = function() {
    "undefined" != typeof ra && this.I && (this.dispatchEvent("timeout"),
    this.abort(8))
}
;
var zd = function(a) {
    a.g = !1;
    a.I && (a.j = !0,
    a.I.abort(),
    a.j = !1);
    Dd(a);
    Ed(a)
}
  , Dd = function(a) {
    a.B || (a.B = !0,
    a.dispatchEvent("complete"),
    a.dispatchEvent("error"))
};
vd.prototype.abort = function() {
    this.I && this.g && (this.g = !1,
    this.j = !0,
    this.I.abort(),
    this.j = !1,
    this.dispatchEvent("complete"),
    this.dispatchEvent("abort"),
    Ed(this))
}
;
vd.prototype.C = function() {
    this.I && (this.g && (this.g = !1,
    this.j = !0,
    this.I.abort(),
    this.j = !1),
    Ed(this, !0));
    vd.l.C.call(this)
}
;
vd.prototype.R = function() {
    this.Da || (this.N || this.i || this.j ? Fd(this) : this.Ga())
}
;
vd.prototype.Ga = function() {
    Fd(this)
}
;
var Fd = function(a) {
    if (a.g && "undefined" != typeof ra && (!a.o[1] || 4 != Gd(a) || 2 != Hd(a)))
        if (a.i && 4 == Gd(a))
            md(a.R, 0, a);
        else if (a.dispatchEvent("readystatechange"),
        4 == Gd(a)) {
            a.g = !1;
            try {
                var b = Hd(a);
                a: switch (b) {
                case 200:
                case 201:
                case 202:
                case 204:
                case 206:
                case 304:
                case 1223:
                    var c = !0;
                    break a;
                default:
                    c = !1
                }
                var d;
                if (!(d = c)) {
                    var e;
                    if (e = 0 === b) {
                        var f = String(a.ca).match(td)[1] || null;
                        !f && p.self && p.self.location && (f = p.self.location.protocol.slice(0, -1));
                        e = !wd.test(f ? f.toLowerCase() : "")
                    }
                    d = e
                }
                d ? (a.dispatchEvent("complete"),
                a.dispatchEvent("success")) : Dd(a)
            } finally {
                Ed(a)
            }
        }
}
  , Ed = function(a, b) {
    if (a.I) {
        Ad(a);
        var c = a.I
          , d = a.o[0] ? function() {}
        : null;
        a.I = null;
        a.o = null;
        b || a.dispatchEvent("ready");
        try {
            c.onreadystatechange = d
        } catch (e) {}
    }
}
  , Ad = function(a) {
    a.I && a.ga && (a.I.ontimeout = null);
    a.v && (p.clearTimeout(a.v),
    a.v = null)
};
vd.prototype.isActive = function() {
    return !!this.I
}
;
var Gd = function(a) {
    return a.I ? a.I.readyState : 0
}
  , Hd = function(a) {
    try {
        return 2 < Gd(a) ? a.I.status : -1
    } catch (b) {
        return -1
    }
};
var Id = function() {
    this.g = [];
    this.i = [];
    this.j = []
};
g = Id.prototype;
g.hd = "";
g.tc = "SIMPLE_OPTIMIZATIONS";
g.Rc = null;
g.yc = "";
g.qd = !1;
g.ad = !1;
g.Ic = null;
g.Hc = null;
g.Qc = !1;
g.rc = !1;
g.Mc = !1;
g.cd = !1;
var Jd = function(a) {
    if (a.Rc)
        return a.Rc;
    a = a.tc.toLowerCase();
    if ("whitespace_only" === a)
        return "quiet";
    if ("simple_optimizations" == a)
        return "default";
    if ("advanced_optimizations" == a)
        return "verbose";
    throw Error("Unknown compilationLevel: " + a);
}
  , Kd = function(a, b) {
    b = b.target;
    var c = Hd(b);
    if (200 == c) {
        try {
            var d = b.I ? b.I.responseText : ""
        } catch (f) {
            d = ""
        }
        var e = JSON.parse(d)
    } else {
        d = {};
        d.code = c;
        try {
            e = 2 < Gd(b) ? b.I.statusText : ""
        } catch (f) {
            e = ""
        }
        403 == c && (e = "Forbidden");
        d.error = e;
        e = {};
        e.serverErrors = [d]
    }
    a(e)
};
var Ld = function(a, b) {
    this.v = a.serverErrors;
    if (!this.v) {
        var c = a.statistics;
        this.B = c.originalSize;
        this.D = c.originalGzipSize;
        this.o = c.compressedSize;
        this.A = c.compressedGzipSize;
        this.i = a.compiledCode;
        this.j = a.warnings;
        this.g = a.errors;
        this.N = a.outputFilePath;
        this.Da = b
    }
};
var Md = function(a, b) {
    F.call(this);
    this.g = a;
    this.j = b
};
oa(Md, F);
var Pd = function(a, b, c, d) {
    var e = Nd(a);
    if (e) {
        var f = Od(b, e, !0)
          , h = e.lines
          , k = null == f;
        k ? e = e.end : (e = "number" === typeof f ? f : f.pop(),
        d && e++);
        (k || d) && Ka(h, e, 0, "");
        c ? h[e] = "// @" + b + " " + c : Array.prototype.splice.call(h, e, 1);
        a.g.setValue(h.join("\n"))
    }
}
  , Qd = function(a) {
    a = a.replace(/(\r\n|\r|\n)/g, "\n").split("\n");
    for (var b = 0; b < a.length; b++)
        a[b] = a[b].replace(/[\s\xa0]+$/, "");
    return a
}
  , Nd = function(a) {
    for (var b = a.g.getValue(), c = Qd(b), d, e, f = 0; f < c.length; ++f) {
        var h = c[f];
        if (void 0 === d) {
            if (/^\/\/ ==ClosureCompiler==\s*$/.test(h) || /^\/\/ ==PageTuner==\s*$/.test(h) || /^\/\/ ==GiffyConfig==\s*$/.test(h))
                d = f,
                h[f] = "// ==ClosureCompiler=="
        } else if (void 0 === e && (/^\/\/ ==\/ClosureCompiler==\s*$/.test(h) || /^\/\/ ==\/PageTuner==\s*$/.test(h) || /^\/\/ ==\/GiffyConfig==\s*$/.test(h))) {
            e = f;
            h[f] = "// ==/ClosureCompiler==";
            break
        }
    }
    if (void 0 !== e)
        return {
            start: d,
            end: e,
            lines: c
        };
    c = ["// ==ClosureCompiler==", "// @output_file_name default.js"];
    a: {
        d = a.j.g.g["input-options"].optimization;
        for (e = 0; e < d.length; ++e)
            if (d[e].checked) {
                d = d[e].value;
                break a
            }
        d = null
    }
    d && c.push("// @compilation_level " + d);
    d = a.j;
    e = [];
    d.g.h("pretty_print").checked && e.push("pretty_print");
    d.g.h("print_input_delimiter").checked && e.push("print_input_delimiter");
    e.length && c.push("// @formatting " + e.join());
    c.push("// ==/ClosureCompiler==");
    b = c.join("\n") + "\n\n" + b;
    a.g.setValue(b);
    return {
        start: 0,
        end: c.length - 1,
        lines: Qd(b)
    }
};
Md.prototype.reset = function() {
    var a = this.g;
    a.setValue("");
    Nd(this);
    a.setValue(a.getValue() + "\n\n")
}
;
var Od = function(a, b, c) {
    a = new RegExp("^\\/\\/ @" + a + " ");
    for (var d = b.lines, e = [], f = b.start + 1; f < b.end; ++f)
        if (a.test(d[f])) {
            if (!c)
                return f;
            e.push(f)
        }
    return e.length ? e : null
}
  , K = function(a, b, c) {
    var d = Nd(a);
    if (d) {
        a = new RegExp("^\\/\\/ @" + b + "\\s+(.*)\\s*$");
        b = Od(b, d, c);
        c = d.lines;
        if (null == b)
            return null;
        if ("number" === typeof b)
            return c[b].match(a)[1];
        d = [];
        for (var e = 0; e < b.length; ++e)
            d.push(c[b[e]].match(a)[1]);
        return d
    }
    return null
};
Md.prototype.C = function() {
    F.prototype.C.call(this)
}
;
var Rd = function(a) {
    this.g = a
};
var Td = function(a) {
    this.j = this.g = null;
    this.i = a || null
}
  , Ud = function(a) {
    a.g || (a.g = new Map,
    a.j = 0,
    a.i && ud(a.i, function(b, c) {
        a.add(decodeURIComponent(b.replace(/\+/g, " ")), c)
    }))
};
Td.prototype.add = function(a, b) {
    Ud(this);
    this.i = null;
    a = String(a);
    var c = this.g.get(a);
    c || this.g.set(a, c = []);
    c.push(b);
    this.j = this.j + 1;
    return this
}
;
var Vd = function(a, b) {
    Ud(a);
    b = String(b);
    return a.g.has(b)
};
g = Td.prototype;
g.forEach = function(a, b) {
    Ud(this);
    this.g.forEach(function(c, d) {
        c.forEach(function(e) {
            a.call(b, e, d, this)
        }, this)
    }, this)
}
;
g.Ac = function(a) {
    Ud(this);
    var b = [];
    if ("string" === typeof a)
        Vd(this, a) && (b = b.concat(this.g.get(String(a))));
    else {
        a = Array.from(this.g.values());
        for (var c = 0; c < a.length; c++)
            b = b.concat(a[c])
    }
    return b
}
;
g.set = function(a, b) {
    Ud(this);
    this.i = null;
    a = String(a);
    Vd(this, a) && (this.j = this.j - this.g.get(a).length);
    this.g.set(a, [b]);
    this.j = this.j + 1;
    return this
}
;
g.get = function(a, b) {
    if (!a)
        return b;
    a = this.Ac(a);
    return 0 < a.length ? String(a[0]) : b
}
;
g.toString = function() {
    if (this.i)
        return this.i;
    if (!this.g)
        return "";
    for (var a = [], b = Array.from(this.g.keys()), c = 0; c < b.length; c++) {
        var d = b[c]
          , e = D(d);
        d = this.Ac(d);
        for (var f = 0; f < d.length; f++) {
            var h = e;
            "" !== d[f] && (h += "=" + D(d[f]));
            a.push(h)
        }
    }
    return this.i = a.join("&")
}
;
var Wd = function(a) {
    return "string" == typeof a.className ? a.className : a.getAttribute && a.getAttribute("class") || ""
}
  , Xd = function(a) {
    return a.classList ? a.classList : Wd(a).match(/\S+/g) || []
}
  , Yd = function(a, b) {
    "string" == typeof a.className ? a.className = b : a.setAttribute && a.setAttribute("class", b)
}
  , Zd = function(a, b) {
    return a.classList ? a.classList.contains(b) : Ha(Xd(a), b)
}
  , L = function(a, b) {
    if (a.classList)
        a.classList.add(b);
    else if (!Zd(a, b)) {
        var c = Wd(a);
        Yd(a, c + (0 < c.length ? " " + b : b))
    }
}
  , $d = function(a, b) {
    if (a.classList)
        Array.prototype.forEach.call(b, function(e) {
            L(a, e)
        });
    else {
        var c = {};
        Array.prototype.forEach.call(Xd(a), function(e) {
            c[e] = !0
        });
        Array.prototype.forEach.call(b, function(e) {
            c[e] = !0
        });
        b = "";
        for (var d in c)
            b += 0 < b.length ? " " + d : d;
        Yd(a, b)
    }
}
  , ae = function(a, b) {
    a.classList ? a.classList.remove(b) : Zd(a, b) && Yd(a, Array.prototype.filter.call(Xd(a), function(c) {
        return c != b
    }).join(" "))
}
  , be = function(a, b) {
    a.classList ? Array.prototype.forEach.call(b, function(c) {
        ae(a, c)
    }) : Yd(a, Array.prototype.filter.call(Xd(a), function(c) {
        return !Ha(b, c)
    }).join(" "))
};
var M = function(a) {
    F.call(this);
    this.j = a;
    this.g = {}
};
q(M, F);
var ce = [];
M.prototype.s = function(a, b, c, d) {
    Array.isArray(b) || (b && (ce[0] = b.toString()),
    b = ce);
    for (var e = 0; e < b.length; e++) {
        var f = bd(a, b[e], c || this.handleEvent, d || !1, this.j || this);
        if (!f)
            break;
        this.g[f.key] = f
    }
    return this
}
;
M.prototype.Jc = function(a, b, c, d) {
    return de(this, a, b, c, d)
}
;
var de = function(a, b, c, d, e, f) {
    if (Array.isArray(c))
        for (var h = 0; h < c.length; h++)
            de(a, b, c[h], d, e, f);
    else {
        b = ad(b, c, d || a.handleEvent, e, f || a.j || a);
        if (!b)
            return a;
        a.g[b.key] = b
    }
    return a
};
M.prototype.qa = function(a, b, c, d, e) {
    if (Array.isArray(b))
        for (var f = 0; f < b.length; f++)
            this.qa(a, b[f], c, d, e);
    else
        c = c || this.handleEvent,
        d = ua(d) ? !!d.capture : !!d,
        e = e || this.j || this,
        c = cd(c),
        d = !!d,
        b = Rc(a) ? a.Hb(b, c, d, e) : a ? (a = ed(a)) ? a.Hb(b, c, d, e) : null : null,
        b && (jd(b),
        delete this.g[b.key]);
    return this
}
;
var ee = function(a) {
    Sb(a.g, function(b, c) {
        this.g.hasOwnProperty(c) && jd(b)
    }, a);
    a.g = {}
};
M.prototype.C = function() {
    M.l.C.call(this);
    ee(this)
}
;
M.prototype.handleEvent = function() {
    throw Error("EventHandler.handleEvent not implemented");
}
;
var fe = "Y Z E P T G M K  m u n".split(" ")
  , ge = {
    "": 1,
    n: Math.pow(1024, -3),
    u: Math.pow(1024, -2),
    m: 1 / 1024,
    k: 1024,
    K: 1024,
    M: Math.pow(1024, 2),
    G: Math.pow(1024, 3),
    T: Math.pow(1024, 4),
    P: Math.pow(1024, 5),
    E: Math.pow(1024, 6),
    Z: Math.pow(1024, 7),
    Y: Math.pow(1024, 8)
}
  , he = function(a) {
    return 32 >= a || 4096 <= a && (8192 <= a && 8198 >= a || 8200 <= a && 8203 >= a || 5760 == a || 6158 == a || 8232 == a || 8233 == a || 8287 == a || 12288 == a)
}
  , ke = function(a, b) {
    var c = ie;
    b = b || 10;
    if (b > a.length)
        return a;
    for (var d = [], e = 0, f = 0, h = 0, k = 0, l = 0; l < a.length; l++) {
        var m = k;
        k = a.charCodeAt(l);
        m = 768 <= k && !c(m, k, !0);
        e >= b && !he(k) && !m && (d.push(a.substring(h, l), je),
        h = l,
        e = 0);
        f ? 62 == k && 60 == f ? f = 0 : 59 == k && 38 == f && (f = 0,
        e++) : 60 == k || 38 == k ? f = k : he(k) ? e = 0 : 8204 <= k && 8207 >= k || 8234 <= k && 8238 >= k || e++
    }
    d.push(a.slice(h));
    return d.join("")
}
  , ie = function(a, b) {
    return 1024 <= b && 1315 > b
}
  , je = y ? "<wbr></wbr>" : v ? "&#8203;" : "<wbr>";
var le = function(a, b, c, d) {
    this.top = a;
    this.right = b;
    this.bottom = c;
    this.left = d
};
le.prototype.ceil = function() {
    this.top = Math.ceil(this.top);
    this.right = Math.ceil(this.right);
    this.bottom = Math.ceil(this.bottom);
    this.left = Math.ceil(this.left);
    return this
}
;
le.prototype.floor = function() {
    this.top = Math.floor(this.top);
    this.right = Math.floor(this.right);
    this.bottom = Math.floor(this.bottom);
    this.left = Math.floor(this.left);
    return this
}
;
le.prototype.round = function() {
    this.top = Math.round(this.top);
    this.right = Math.round(this.right);
    this.bottom = Math.round(this.bottom);
    this.left = Math.round(this.left);
    return this
}
;
var N = function(a, b, c, d) {
    this.left = a;
    this.top = b;
    this.width = c;
    this.height = d
};
N.prototype.ceil = function() {
    this.left = Math.ceil(this.left);
    this.top = Math.ceil(this.top);
    this.width = Math.ceil(this.width);
    this.height = Math.ceil(this.height);
    return this
}
;
N.prototype.floor = function() {
    this.left = Math.floor(this.left);
    this.top = Math.floor(this.top);
    this.width = Math.floor(this.width);
    this.height = Math.floor(this.height);
    return this
}
;
N.prototype.round = function() {
    this.left = Math.round(this.left);
    this.top = Math.round(this.top);
    this.width = Math.round(this.width);
    this.height = Math.round(this.height);
    return this
}
;
var me = function(a, b) {
    var c = E(a);
    return c.defaultView && c.defaultView.getComputedStyle && (a = c.defaultView.getComputedStyle(a, null)) ? a[b] || a.getPropertyValue(b) || "" : ""
}
  , ne = function(a, b) {
    return me(a, b) || (a.currentStyle ? a.currentStyle[b] : null) || a.style && a.style[b]
}
  , oe = function(a) {
    return ne(a, "position")
}
  , qe = function(a, b, c) {
    if (b instanceof A) {
        var d = b.x;
        b = b.y
    } else
        d = b,
        b = c;
    a.style.left = pe(d, !1);
    a.style.top = pe(b, !1)
}
  , re = function(a) {
    return new A(a.offsetLeft,a.offsetTop)
}
  , se = function(a) {
    try {
        return a.getBoundingClientRect()
    } catch (b) {
        return {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        }
    }
}
  , te = function(a) {
    if (v && !(8 <= Number(Hb)))
        return a.offsetParent;
    var b = E(a)
      , c = ne(a, "position")
      , d = "fixed" == c || "absolute" == c;
    for (a = a.parentNode; a && a != b; a = a.parentNode)
        if (11 == a.nodeType && a.host && (a = a.host),
        c = ne(a, "position"),
        d = d && "static" == c && a != b.documentElement && a != b.body,
        !d && (a.scrollWidth > a.clientWidth || a.scrollHeight > a.clientHeight || "fixed" == c || "absolute" == c || "relative" == c))
            return a;
    return null
}
  , ve = function(a) {
    for (var b = new le(0,Infinity,Infinity,0), c = ic(a), d = c.g.body, e = c.g.documentElement, f = oc(c.g); a = te(a); )
        if (!(v && 0 == a.clientWidth || y && 0 == a.clientHeight && a == d) && a != d && a != e && "visible" != ne(a, "overflow")) {
            var h = ue(a)
              , k = new A(a.clientLeft,a.clientTop);
            h.x += k.x;
            h.y += k.y;
            b.top = Math.max(b.top, h.y);
            b.right = Math.min(b.right, h.x + a.clientWidth);
            b.bottom = Math.min(b.bottom, h.y + a.clientHeight);
            b.left = Math.max(b.left, h.x)
        }
    d = f.scrollLeft;
    f = f.scrollTop;
    b.left = Math.max(b.left, d);
    b.top = Math.max(b.top, f);
    c = nc(pc(c.g) || window);
    b.right = Math.min(b.right, d + c.width);
    b.bottom = Math.min(b.bottom, f + c.height);
    return 0 <= b.top && 0 <= b.left && b.bottom > b.top && b.right > b.left ? b : null
}
  , ue = function(a) {
    var b = E(a)
      , c = new A(0,0);
    var d = b ? E(b) : document;
    var e;
    (e = !v || 9 <= Number(Hb)) || (ic(d),
    e = !0);
    if (a == (e ? d.documentElement : d.body))
        return c;
    a = se(a);
    b = qc(ic(b).g);
    c.x = a.left + b.x;
    c.y = a.top + b.y;
    return c
}
  , we = function(a) {
    a = se(a);
    return new A(a.left,a.top)
}
  , xe = function(a) {
    if (1 == a.nodeType)
        return we(a);
    a = a.changedTouches ? a.changedTouches[0] : a;
    return new A(a.clientX,a.clientY)
}
  , ye = function(a, b, c) {
    if (b instanceof B)
        c = b.height,
        b = b.width;
    else if (void 0 == c)
        throw Error("missing height argument");
    a.style.width = pe(b, !0);
    a.style.height = pe(c, !0)
}
  , pe = function(a, b) {
    "number" == typeof a && (a = (b ? Math.round(a) : a) + "px");
    return a
}
  , Ae = function(a) {
    var b = ze;
    if ("none" != ne(a, "display"))
        return b(a);
    var c = a.style
      , d = c.display
      , e = c.visibility
      , f = c.position;
    c.visibility = "hidden";
    c.position = "absolute";
    c.display = "inline";
    a = b(a);
    c.display = d;
    c.position = f;
    c.visibility = e;
    return a
}
  , ze = function(a) {
    var b = a.offsetWidth
      , c = a.offsetHeight
      , d = y && !b && !c;
    return (void 0 === b || d) && a.getBoundingClientRect ? (a = se(a),
    new B(a.right - a.left,a.bottom - a.top)) : new B(b,c)
}
  , Be = function(a, b) {
    a = a.style;
    "opacity"in a ? a.opacity = b : "MozOpacity"in a ? a.MozOpacity = b : "filter"in a && (a.filter = "" === b ? "" : "alpha(opacity=" + 100 * Number(b) + ")")
}
  , O = function(a, b) {
    a.style.display = b ? "" : "none"
}
  , Ce = function(a) {
    return "rtl" == ne(a, "direction")
}
  , De = x ? "MozUserSelect" : y || qb ? "WebkitUserSelect" : null
  , Ee = function(a, b, c) {
    c = c ? null : a.getElementsByTagName("*");
    if (De) {
        if (b = b ? "none" : "",
        a.style && (a.style[De] = b),
        c) {
            a = 0;
            for (var d; d = c[a]; a++)
                d.style && (d.style[De] = b)
        }
    } else if (v && (b = b ? "on" : "",
    a.setAttribute("unselectable", b),
    c))
        for (a = 0; d = c[a]; a++)
            d.setAttribute("unselectable", b)
}
  , Fe = function(a) {
    return new B(a.offsetWidth,a.offsetHeight)
}
  , Je = function(a) {
    var b = E(a), c = v && a.currentStyle, d;
    if (d = c)
        ic(b),
        d = !0;
    if (d && "auto" != c.width && "auto" != c.height && !c.boxSizing)
        return b = Ge(a, c.width, "width", "pixelWidth"),
        a = Ge(a, c.height, "height", "pixelHeight"),
        new B(b,a);
    c = Fe(a);
    if (v) {
        b = He(a, "paddingLeft");
        d = He(a, "paddingRight");
        var e = He(a, "paddingTop")
          , f = He(a, "paddingBottom");
        b = new le(e,d,f,b)
    } else
        b = me(a, "paddingLeft"),
        d = me(a, "paddingRight"),
        e = me(a, "paddingTop"),
        f = me(a, "paddingBottom"),
        b = new le(parseFloat(e),parseFloat(d),parseFloat(f),parseFloat(b));
    a = Ie(a);
    return new B(c.width - a.left - b.left - b.right - a.right,c.height - a.top - b.top - b.bottom - a.bottom)
}
  , Ke = function(a, b) {
    a = a.style;
    x ? a.MozBoxSizing = "border-box" : y ? a.WebkitBoxSizing = "border-box" : a.boxSizing = "border-box";
    a.width = Math.max(b.width, 0) + "px";
    a.height = Math.max(b.height, 0) + "px"
}
  , Ge = function(a, b, c, d) {
    if (/^\d+px?$/.test(b))
        return parseInt(b, 10);
    var e = a.style[c]
      , f = a.runtimeStyle[c];
    a.runtimeStyle[c] = a.currentStyle[c];
    a.style[c] = b;
    b = a.style[d];
    a.style[c] = e;
    a.runtimeStyle[c] = f;
    return +b
}
  , He = function(a, b) {
    return (b = a.currentStyle ? a.currentStyle[b] : null) ? Ge(a, b, "left", "pixelLeft") : 0
}
  , Le = {
    thin: 2,
    medium: 4,
    thick: 6
}
  , Me = function(a, b) {
    if ("none" == (a.currentStyle ? a.currentStyle[b + "Style"] : null))
        return 0;
    b = a.currentStyle ? a.currentStyle[b + "Width"] : null;
    return b in Le ? Le[b] : Ge(a, b, "left", "pixelLeft")
}
  , Ie = function(a) {
    if (v && !(9 <= Number(Hb))) {
        var b = Me(a, "borderLeft")
          , c = Me(a, "borderRight")
          , d = Me(a, "borderTop");
        a = Me(a, "borderBottom");
        return new le(d,c,a,b)
    }
    b = me(a, "borderLeftWidth");
    c = me(a, "borderRightWidth");
    d = me(a, "borderTopWidth");
    a = me(a, "borderBottomWidth");
    return new le(parseFloat(d),parseFloat(c),parseFloat(a),parseFloat(b))
};
var Oe = function(a) {
    if (a.altKey && !a.ctrlKey || a.metaKey || 112 <= a.g && 123 >= a.g)
        return !1;
    if (Ne(a.g))
        return !0;
    switch (a.g) {
    case 18:
    case 20:
    case 93:
    case 17:
    case 40:
    case 35:
    case 27:
    case 36:
    case 45:
    case 37:
    case 224:
    case 91:
    case 144:
    case 12:
    case 34:
    case 33:
    case 19:
    case 255:
    case 44:
    case 39:
    case 145:
    case 16:
    case 38:
    case 252:
    case 224:
    case 92:
        return !1;
    case 0:
        return !x;
    default:
        return 166 > a.g || 183 < a.g
    }
}
  , Qe = function(a, b, c, d, e, f) {
    if (z && e)
        return Ne(a);
    if (e && !d)
        return !1;
    if (!x) {
        "number" === typeof b && (b = Pe(b));
        var h = 17 == b || 18 == b || z && 91 == b;
        if ((!c || z) && h || z && 16 == b && (d || f))
            return !1
    }
    if ((y || qb) && d && c)
        switch (a) {
        case 220:
        case 219:
        case 221:
        case 192:
        case 186:
        case 189:
        case 187:
        case 188:
        case 190:
        case 191:
        case 192:
        case 222:
            return !1
        }
    if (v && d && b == a)
        return !1;
    switch (a) {
    case 13:
        return x ? f || e ? !1 : !(c && d) : !0;
    case 27:
        return !(y || qb || x)
    }
    return x && (d || e || f) ? !1 : Ne(a)
}
  , Ne = function(a) {
    if (48 <= a && 57 >= a || 96 <= a && 106 >= a || 65 <= a && 90 >= a || (y || qb) && 0 == a)
        return !0;
    switch (a) {
    case 32:
    case 43:
    case 63:
    case 64:
    case 107:
    case 109:
    case 110:
    case 111:
    case 186:
    case 59:
    case 189:
    case 187:
    case 61:
    case 188:
    case 190:
    case 191:
    case 192:
    case 222:
    case 219:
    case 220:
    case 221:
    case 163:
    case 58:
        return !0;
    case 173:
        return x;
    default:
        return !1
    }
}
  , Pe = function(a) {
    if (x)
        a = Re(a);
    else if (z && y)
        switch (a) {
        case 93:
            a = 91
        }
    return a
}
  , Re = function(a) {
    switch (a) {
    case 61:
        return 187;
    case 59:
        return 186;
    case 173:
        return 189;
    case 224:
        return 91;
    case 0:
        return 224;
    default:
        return a
    }
};
var Se = function(a) {
    J.call(this);
    this.g = null;
    this.j = a;
    a = v || qb;
    this.i = new M(this);
    this.i.s(this.j, a ? ["keydown", "paste", "cut", "drop", "input"] : "input", this)
};
q(Se, J);
Se.prototype.handleEvent = function(a) {
    if ("input" == a.type)
        v && 0 == a.g && 0 == a.D || (Te(this),
        this.dispatchEvent(Ue(a)));
    else if ("keydown" != a.type || Oe(a)) {
        var b = "keydown" == a.type ? this.j.value : null;
        v && 229 == a.g && (b = null);
        var c = Ue(a);
        Te(this);
        this.g = md(function() {
            this.g = null;
            this.j.value != b && this.dispatchEvent(c)
        }, 0, this)
    }
}
;
var Te = function(a) {
    null != a.g && (p.clearTimeout(a.g),
    a.g = null)
}
  , Ue = function(a) {
    a = new H(a.i);
    a.type = "input";
    return a
};
Se.prototype.C = function() {
    Se.l.C.call(this);
    this.i.S();
    Te(this);
    delete this.j
}
;
var Ve = function(a, b, c, d) {
    H.call(this, d);
    this.type = "key";
    this.g = a;
    this.D = b;
    this.repeat = c
};
q(Ve, H);
var Xe = function(a, b) {
    J.call(this);
    a && We(this, a, b)
};
q(Xe, J);
g = Xe.prototype;
g.kb = null;
g.bc = null;
g.Fc = null;
g.cc = null;
g.ma = -1;
g.Pa = -1;
g.qc = !1;
var Ye = {
    3: 13,
    12: 144,
    63232: 38,
    63233: 40,
    63234: 37,
    63235: 39,
    63236: 112,
    63237: 113,
    63238: 114,
    63239: 115,
    63240: 116,
    63241: 117,
    63242: 118,
    63243: 119,
    63244: 120,
    63245: 121,
    63246: 122,
    63247: 123,
    63248: 44,
    63272: 46,
    63273: 36,
    63275: 35,
    63276: 33,
    63277: 34,
    63289: 144,
    63302: 45
}
  , Ze = {
    Up: 38,
    Down: 40,
    Left: 37,
    Right: 39,
    Enter: 13,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    "U+007F": 46,
    Home: 36,
    End: 35,
    PageUp: 33,
    PageDown: 34,
    Insert: 45
}
  , $e = z && x;
Xe.prototype.g = function(a) {
    if (y || qb)
        if (17 == this.ma && !a.ctrlKey || 18 == this.ma && !a.altKey || z && 91 == this.ma && !a.metaKey)
            this.Pa = this.ma = -1;
    -1 == this.ma && (a.ctrlKey && 17 != a.g ? this.ma = 17 : a.altKey && 18 != a.g ? this.ma = 18 : a.metaKey && 91 != a.g && (this.ma = 91));
    Qe(a.g, this.ma, a.shiftKey, a.ctrlKey, a.altKey, a.metaKey) ? (this.Pa = Pe(a.g),
    $e && (this.qc = a.altKey)) : this.handleEvent(a)
}
;
Xe.prototype.j = function(a) {
    this.Pa = this.ma = -1;
    this.qc = a.altKey
}
;
Xe.prototype.handleEvent = function(a) {
    var b = a.i
      , c = b.altKey;
    if (v && "keypress" == a.type) {
        var d = this.Pa;
        var e = 13 != d && 27 != d ? b.keyCode : 0
    } else
        (y || qb) && "keypress" == a.type ? (d = this.Pa,
        e = 0 <= b.charCode && 63232 > b.charCode && Ne(d) ? b.charCode : 0) : ("keypress" == a.type ? ($e && (c = this.qc),
        b.keyCode == b.charCode ? 32 > b.keyCode ? (d = b.keyCode,
        e = 0) : (d = this.Pa,
        e = b.charCode) : (d = b.keyCode || this.Pa,
        e = b.charCode || 0)) : (d = b.keyCode || this.Pa,
        e = b.charCode || 0),
        z && 63 == e && 224 == d && (d = 191));
    var f = d = Pe(d);
    d ? 63232 <= d && d in Ye ? f = Ye[d] : 25 == d && a.shiftKey && (f = 9) : b.keyIdentifier && b.keyIdentifier in Ze && (f = Ze[b.keyIdentifier]);
    if (!x || "keypress" != a.type || Qe(f, this.ma, a.shiftKey, a.ctrlKey, c, a.metaKey))
        a = f == this.ma,
        this.ma = f,
        b = new Ve(f,e,a,b),
        b.altKey = c,
        this.dispatchEvent(b)
}
;
Xe.prototype.h = function() {
    return this.kb
}
;
var We = function(a, b, c) {
    a.cc && af(a);
    a.kb = b;
    a.bc = bd(a.kb, "keypress", a, c);
    a.Fc = bd(a.kb, "keydown", a.g, c, a);
    a.cc = bd(a.kb, "keyup", a.j, c, a)
}
  , af = function(a) {
    a.bc && (jd(a.bc),
    jd(a.Fc),
    jd(a.cc),
    a.bc = null,
    a.Fc = null,
    a.cc = null);
    a.kb = null;
    a.ma = -1;
    a.Pa = -1
};
Xe.prototype.C = function() {
    Xe.l.C.call(this);
    af(this)
}
;
var bf = function() {
    if (sb) {
        var a = /Windows NT ([0-9.]+)/;
        return (a = a.exec(bb())) ? a[1] : "0"
    }
    return z ? (a = /1[0|1][_.][0-9_.]+/,
    (a = a.exec(bb())) ? a[0].replace(/_/g, ".") : "10") : tb ? (a = /Android\s+([^\);]+)(\)|;)/,
    (a = a.exec(bb())) ? a[1] : "") : ub || vb || wb ? (a = /(?:iPhone|CPU)\s+OS\s+(\S+)/,
    (a = a.exec(bb())) ? a[1].replace(/_/g, ".") : "") : ""
}();
var cf = hb()
  , df = kb() || u("iPod")
  , ef = u("iPad")
  , ff = u("Android") && !(ib() || hb() || gb() || u("Silk"))
  , gf = ib()
  , hf = u("Safari") && !(ib() || (fb() ? 0 : u("Coast")) || gb() || (fb() ? 0 : u("Edge")) || (fb() ? eb("Microsoft Edge") : u("Edg/")) || (fb() ? eb("Opera") : u("OPR")) || hb() || u("Silk") || u("Android")) && !lb();
var jf = function(a) {
    return (a = a.exec(bb())) ? a[1] : ""
}
  , kf = function() {
    if (cf)
        return jf(/Firefox\/([0-9.]+)/);
    if (v || qb || pb)
        return Db;
    if (gf) {
        if (lb() || mb()) {
            var a = jf(/CriOS\/([0-9.]+)/);
            if (a)
                return a
        }
        return jf(/Chrome\/([0-9.]+)/)
    }
    if (hf && !lb())
        return jf(/Version\/([0-9.]+)/);
    if (df || ef) {
        if (a = /Version\/(\S+).*Mobile\/(\S+)/.exec(bb()))
            return a[1] + "." + a[2]
    } else if (ff)
        return (a = jf(/Android\s+([0-9.]+)/)) ? a : jf(/Version\/([0-9.]+)/);
    return ""
}();
var mf = function(a, b, c, d, e, f, h, k) {
    var l;
    if (l = c.offsetParent) {
        var m = "HTML" == l.tagName || "BODY" == l.tagName;
        if (!m || "static" != oe(l)) {
            var n = ue(l);
            if (!m) {
                m = Ce(l);
                var w;
                if (w = m) {
                    w = hf && 0 <= Va(kf, 10);
                    var I;
                    if (I = xb)
                        I = 0 <= Va(bf, 10);
                    var C = gf && 0 <= Va(kf, 85);
                    w = x || w || I || C
                }
                m = w ? -l.scrollLeft : m && !rb && "visible" != ne(l, "overflowX") ? l.scrollWidth - l.clientWidth - l.scrollLeft : l.scrollLeft;
                n = dc(n, new A(m,l.scrollTop))
            }
        }
    }
    l = n || new A;
    n = ue(a);
    m = Ae(a);
    n = new N(n.x,n.y,m.width,m.height);
    if (m = ve(a))
        C = new N(m.left,m.top,m.right - m.left,m.bottom - m.top),
        m = Math.max(n.left, C.left),
        w = Math.min(n.left + n.width, C.left + C.width),
        m <= w && (I = Math.max(n.top, C.top),
        C = Math.min(n.top + n.height, C.top + C.height),
        I <= C && (n.left = m,
        n.top = I,
        n.width = w - m,
        n.height = C - I));
    m = ic(a);
    w = ic(c);
    if (m.g != w.g) {
        m = m.g.body;
        w = pc(w.g);
        I = new A(0,0);
        C = rc(E(m));
        if (ob(C, "parent")) {
            var Sd = m;
            do {
                var Tf = C == w ? ue(Sd) : we(Sd);
                I.x += Tf.x;
                I.y += Tf.y
            } while (C && C != w && C != C.parent && (Sd = C.frameElement) && (C = C.parent))
        }
        m = dc(I, ue(m));
        n.left += m.x;
        n.top += m.y
    }
    a = lf(a, b);
    b = n.left;
    a & 4 ? b += n.width : a & 2 && (b += n.width / 2);
    b = new A(b,n.top + (a & 1 ? n.height : 0));
    b = dc(b, l);
    e && (b.x += (a & 4 ? -1 : 1) * e.x,
    b.y += (a & 1 ? -1 : 1) * e.y);
    if (f)
        if (k)
            var r = k;
        else if (r = ve(c))
            r.top -= l.y,
            r.right -= l.x,
            r.bottom -= l.y,
            r.left -= l.x;
    e = b;
    e = new A(e.x,e.y);
    k = lf(c, d);
    d = Ae(c);
    a = h ? new B(h.width,h.height) : new B(d.width,d.height);
    h = e;
    e = a;
    h = new A(h.x,h.y);
    e = new B(e.width,e.height);
    a = 0;
    0 != k && (k & 4 ? h.x -= e.width + 0 : k & 2 && (h.x -= e.width / 2),
    k & 1 && (h.y -= e.height + 0));
    f && (r ? (k = h,
    a = e,
    b = 0,
    65 == (f & 65) && (k.x < r.left || k.x >= r.right) && (f &= -2),
    132 == (f & 132) && (k.y < r.top || k.y >= r.bottom) && (f &= -5),
    k.x < r.left && f & 1 && (k.x = r.left,
    b |= 1),
    f & 16 && (l = k.x,
    k.x < r.left && (k.x = r.left,
    b |= 4),
    k.x + a.width > r.right && (a.width = Math.min(r.right - k.x, l + a.width - r.left),
    a.width = Math.max(a.width, 0),
    b |= 4)),
    k.x + a.width > r.right && f & 1 && (k.x = Math.max(r.right - a.width, r.left),
    b |= 1),
    f & 2 && (b |= (k.x < r.left ? 16 : 0) | (k.x + a.width > r.right ? 32 : 0)),
    k.y < r.top && f & 4 && (k.y = r.top,
    b |= 2),
    f & 32 && (l = k.y,
    k.y < r.top && (k.y = r.top,
    b |= 8),
    k.y + a.height > r.bottom && (a.height = Math.min(r.bottom - k.y, l + a.height - r.top),
    a.height = Math.max(a.height, 0),
    b |= 8)),
    k.y + a.height > r.bottom && f & 4 && (k.y = Math.max(r.bottom - a.height, r.top),
    b |= 2),
    f & 8 && (b |= (k.y < r.top ? 64 : 0) | (k.y + a.height > r.bottom ? 128 : 0)),
    f = b) : f = 256,
    a = f);
    f = new N(0,0,0,0);
    f.left = h.x;
    f.top = h.y;
    f.width = e.width;
    f.height = e.height;
    h = a;
    h & 496 || (qe(c, new A(f.left,f.top)),
    a = new B(f.width,f.height),
    d == a || d && a && d.width == a.width && d.height == a.height || Ke(c, a));
    return h
}
  , lf = function(a, b) {
    return (b & 8 && Ce(a) ? b ^ 4 : b) & -9
};
var nf = function() {};
nf.prototype.j = function() {}
;
var of = function(a, b, c) {
    this.g = a;
    this.i = b;
    this.o = c
};
q(of, nf);
of.prototype.j = function(a, b) {
    mf(this.g, this.i, a, b, void 0, this.o)
}
;
var pf = function(a, b, c, d) {
    of.call(this, a, b);
    this.A = c ? 5 : 0;
    this.v = d || void 0
};
q(pf, of);
pf.prototype.j = function(a, b) {
    var c = mf(this.g, this.i, a, b, null, 10, void 0, this.v);
    if (c & 496) {
        var d = qf(c, this.i);
        b = qf(c, b);
        c = mf(this.g, d, a, b, null, 10, void 0, this.v);
        c & 496 && (d = qf(c, d),
        b = qf(c, b),
        mf(this.g, d, a, b, null, this.A, void 0, this.v))
    }
}
;
var qf = function(a, b) {
    a & 48 && (b ^= 4);
    a & 192 && (b ^= 1);
    return b
};
var rf = function(a, b, c, d) {
    pf.call(this, a, b, c || d);
    if (c || d)
        this.A = 65 | (d ? 32 : 132)
};
q(rf, pf);
var sf = function() {};
sa(sf);
sf.prototype.g = 0;
var P = function(a) {
    J.call(this);
    this.g = a || ic();
    this.bb = tf;
    this.ga = null;
    this.J = !1;
    this.j = null;
    this.ca = void 0;
    this.D = this.A = this.v = this.Eb = null;
    this.Qb = !1
};
q(P, J);
P.prototype.xd = sf.va();
var tf = null
  , uf = function(a, b) {
    switch (a) {
    case 1:
        return b ? "disable" : "enable";
    case 2:
        return b ? "highlight" : "unhighlight";
    case 4:
        return b ? "activate" : "deactivate";
    case 8:
        return b ? "select" : "unselect";
    case 16:
        return b ? "check" : "uncheck";
    case 32:
        return b ? "focus" : "blur";
    case 64:
        return b ? "open" : "close"
    }
    throw Error("Invalid component state");
}
  , vf = function(a) {
    return a.ga || (a.ga = ":" + (a.xd.g++).toString(36))
}
  , wf = function(a, b) {
    if (a.v && a.v.D) {
        var c = a.v.D
          , d = a.ga;
        d in c && delete c[d];
        Ub(a.v.D, b, a)
    }
    a.ga = b
};
P.prototype.h = function() {
    return this.j
}
;
var Q = function(a) {
    a.ca || (a.ca = new M(a));
    return a.ca
};
P.prototype.N = function() {
    return this.v
}
;
P.prototype.Oc = function(a) {
    if (this.v && this.v != a)
        throw Error("Method not supported");
    P.l.Oc.call(this, a)
}
;
P.prototype.ra = function() {
    this.j = uc(this.g.g, "DIV")
}
;
var xf = function(a, b, c) {
    if (a.J)
        throw Error("Component already rendered");
    a.j || a.ra();
    b ? b.insertBefore(a.j, c || null) : a.g.g.body.appendChild(a.j);
    a.v && !a.v.J || a.O()
}
  , yf = function(a, b) {
    if (a.J)
        throw Error("Component already rendered");
    if (b && a.lb(b)) {
        a.Qb = !0;
        var c = E(b);
        a.g && a.g.g == c || (a.g = ic(b));
        a.ua(b);
        a.O()
    } else
        throw Error("Invalid element to decorate");
};
g = P.prototype;
g.lb = function() {
    return !0
}
;
g.ua = function(a) {
    this.j = a
}
;
g.O = function() {
    this.J = !0;
    zf(this, function(a) {
        !a.J && a.h() && a.O()
    })
}
;
g.la = function() {
    zf(this, function(a) {
        a.J && a.la()
    });
    this.ca && ee(this.ca);
    this.J = !1
}
;
g.C = function() {
    this.J && this.la();
    this.ca && (this.ca.S(),
    delete this.ca);
    zf(this, function(a) {
        a.S()
    });
    !this.Qb && this.j && yc(this.j);
    this.v = this.Eb = this.j = this.D = this.A = null;
    P.l.C.call(this)
}
;
g.eb = function(a, b) {
    this.oc(a, Af(this), b)
}
;
g.oc = function(a, b, c) {
    if (a.J && (c || !this.J))
        throw Error("Component already rendered");
    if (0 > b || b > Af(this))
        throw Error("Child component index out of bounds");
    this.D && this.A || (this.D = {},
    this.A = []);
    if (a.N() == this) {
        var d = vf(a);
        this.D[d] = a;
        Ia(this.A, a)
    } else
        Ub(this.D, vf(a), a);
    if (a == this)
        throw Error("Unable to set parent component");
    if (d = this && a.v && a.ga) {
        var e = a.v;
        d = a.ga;
        e.D && d ? (e = e.D,
        d = (null !== e && d in e ? e[d] : void 0) || null) : d = null
    }
    if (d && a.v != this)
        throw Error("Unable to set parent component");
    a.v = this;
    P.l.Oc.call(a, this);
    Ka(this.A, b, 0, a);
    a.J && this.J && a.N() == this ? (c = this.xb(),
    (c.childNodes[b] || null) != a.h() && (a.h().parentElement == c && c.removeChild(a.h()),
    b = c.childNodes[b] || null,
    c.insertBefore(a.h(), b))) : c ? (this.j || this.ra(),
    b = Bf(this, b + 1),
    xf(a, this.xb(), b ? b.j : null)) : this.J && !a.J && a.j && a.j.parentNode && 1 == a.j.parentNode.nodeType && a.O()
}
;
g.xb = function() {
    return this.j
}
;
var Cf = function(a) {
    null == a.bb && (a.bb = Ce(a.J ? a.j : a.g.g.body));
    return a.bb
}
  , Af = function(a) {
    return a.A ? a.A.length : 0
}
  , Bf = function(a, b) {
    return a.A ? a.A[b] || null : null
}
  , zf = function(a, b, c) {
    a.A && a.A.forEach(b, c)
}
  , Df = function(a, b) {
    return a.A && b ? a.A.indexOf(b) : -1
};
var Ef = function(a, b, c) {
    G.call(this, a, b);
    this.item = c
};
q(Ef, G);
var Ff;
var Gf = function(a, b) {
    b ? a.setAttribute("role", b) : a.removeAttribute("role")
}
  , R = function(a, b, c) {
    Array.isArray(c) && (c = c.join(" "));
    var d = "aria-" + b;
    "" === c || void 0 == c ? (Ff || (c = {},
    Ff = (c.atomic = !1,
    c.autocomplete = "none",
    c.dropeffect = "none",
    c.haspopup = !1,
    c.live = "off",
    c.multiline = !1,
    c.multiselectable = !1,
    c.orientation = "vertical",
    c.readonly = !1,
    c.relevant = "additions text",
    c.required = !1,
    c.sort = "none",
    c.busy = !1,
    c.disabled = !1,
    c.hidden = !1,
    c.invalid = "false",
    c)),
    c = Ff,
    b in c ? a.setAttribute(d, c[b]) : a.removeAttribute(d)) : a.setAttribute(d, c)
};
var S = function(a, b) {
    P.call(this, b);
    this.i = a || ""
}, Hf;
q(S, P);
S.prototype.B = null;
var If = function() {
    null == Hf && (Hf = "placeholder"in uc(document, "INPUT"));
    return Hf
};
g = S.prototype;
g.Jb = !1;
g.ra = function() {
    this.j = this.g.F("INPUT", {
        type: "text"
    })
}
;
g.ua = function(a) {
    S.l.ua.call(this, a);
    this.i || (this.i = a.getAttribute("label") || "");
    Lc(E(a)) == a && (this.Jb = !0,
    a = this.h(),
    ae(a, "label-input-label"));
    If() && (this.h().placeholder = this.i);
    a = this.h();
    R(a, "label", this.i)
}
;
g.O = function() {
    S.l.O.call(this);
    var a = new M(this);
    a.s(this.h(), "focus", this.fd);
    a.s(this.h(), "blur", this.Ed);
    if (If())
        this.o = a;
    else {
        x && a.s(this.h(), ["keypress", "keydown", "keyup"], this.Md);
        var b = E(this.h());
        a.s(rc(b), "load", this.Wd);
        this.o = a;
        Jf(this)
    }
    Kf(this);
    this.h().X = this
}
;
g.la = function() {
    S.l.la.call(this);
    this.o && (this.o.S(),
    this.o = null);
    this.h().X = null
}
;
var Jf = function(a) {
    !a.ba && a.o && a.h().form && (a.o.s(a.h().form, "submit", a.Nd),
    a.ba = !0)
};
g = S.prototype;
g.C = function() {
    S.l.C.call(this);
    this.o && (this.o.S(),
    this.o = null)
}
;
g.fd = function() {
    this.Jb = !0;
    var a = this.h();
    ae(a, "label-input-label");
    if (!If() && !Lf(this) && !this.W) {
        var b = this;
        a = function() {
            b.h() && (b.h().value = "")
        }
        ;
        v ? md(a, 10) : a()
    }
}
;
g.Ed = function() {
    If() || (this.o.qa(this.h(), "click", this.fd),
    this.B = null);
    this.Jb = !1;
    Kf(this)
}
;
g.Md = function(a) {
    27 == a.g && ("keydown" == a.type ? this.B = this.h().value : "keypress" == a.type ? this.h().value = this.B : "keyup" == a.type && (this.B = null),
    a.j())
}
;
g.Nd = function() {
    Lf(this) || (this.h().value = "",
    md(this.Dd, 10, this))
}
;
g.Dd = function() {
    Lf(this) || (this.h().value = this.i)
}
;
g.Wd = function() {
    Kf(this)
}
;
var Lf = function(a) {
    return !!a.h() && "" != a.h().value && a.h().value != a.i
};
S.prototype.reset = function() {
    Lf(this) && (this.h().value = "",
    null != this.B && (this.B = ""),
    Kf(this))
}
;
var Mf = function(a, b) {
    null != a.B && (a.B = b);
    a.h().value = b;
    Kf(a)
};
S.prototype.getValue = function() {
    return null != this.B ? this.B : Lf(this) ? this.h().value : ""
}
;
var Kf = function(a) {
    var b = a.h();
    If() ? a.h().placeholder != a.i && (a.h().placeholder = a.i) : Jf(a);
    R(b, "label", a.i);
    Lf(a) ? (b = a.h(),
    ae(b, "label-input-label")) : (a.W || a.Jb || (b = a.h(),
    L(b, "label-input-label")),
    If() || md(a.R, 10, a))
};
S.prototype.Ja = function(a) {
    this.h().disabled = !a;
    var b = this.h();
    a ? ae(b, "label-input-label-disabled") : L(b, "label-input-label-disabled")
}
;
S.prototype.isEnabled = function() {
    return !this.h().disabled
}
;
S.prototype.R = function() {
    !this.h() || Lf(this) || this.Jb || (this.h().value = this.i)
}
;
var T = {
    ob: "mousedown",
    pb: "mouseup",
    Db: "mousecancel",
    ke: "mousemove",
    me: "mouseover",
    le: "mouseout",
    ie: "mouseenter",
    je: "mouseleave"
};
var Of = function(a, b) {
    if (!a)
        throw Error("Invalid class name " + a);
    if ("function" !== typeof b)
        throw Error("Invalid decorator function " + b);
    Nf[a] = b
}
  , Pf = function(a) {
    a = Xd(a);
    for (var b = 0, c = a.length; b < c; b++) {
        var d = a[b];
        if (d = d in Nf ? Nf[d]() : null)
            return d
    }
    return null
}
  , Qf = {}
  , Nf = {};
var Rf = function(a) {
    this.o = a
};
sa(Rf);
var Sf = function(a, b) {
    a && (a.tabIndex = b ? 0 : -1)
};
Rf.prototype.i = function(a) {
    return "DIV" == a.tagName
}
;
var Vf = function(a, b, c) {
    c.id && wf(b, c.id);
    var d = a.g()
      , e = !1
      , f = Xd(c);
    f && Array.prototype.forEach.call(f, function(h) {
        h == d ? e = !0 : h && this.B(b, h, d)
    }, a);
    e || L(c, d);
    Uf(a, b, c);
    return c
};
Rf.prototype.B = function(a, b, c) {
    b == c + "-disabled" ? a.Ja(!1) : b == c + "-horizontal" ? Wf(a, "horizontal") : b == c + "-vertical" && Wf(a, "vertical")
}
;
var Uf = function(a, b, c) {
    if (c)
        for (var d = c.firstChild, e; d && d.parentNode == c; ) {
            e = d.nextSibling;
            if (1 == d.nodeType) {
                var f = a.D(d);
                f && (f.j = d,
                b.isEnabled() || f.Ja(!1),
                b.eb(f),
                yf(f, d))
            } else
                d.nodeValue && "" != t(d.nodeValue) || c.removeChild(d);
            d = e
        }
};
Rf.prototype.D = function(a) {
    return Pf(a)
}
;
Rf.prototype.A = function(a) {
    a = a.h();
    Ee(a, !0, x);
    v && (a.hideFocus = !0);
    var b = this.o;
    b && Gf(a, b)
}
;
Rf.prototype.g = function() {
    return "goog-container"
}
;
Rf.prototype.v = function(a) {
    var b = this.g()
      , c = [b, "horizontal" == a.Ta ? b + "-horizontal" : b + "-vertical"];
    a.isEnabled() || c.push(b + "-disabled");
    return c
}
;
var Xf = function() {}, Yf;
sa(Xf);
var Zf = {
    button: "pressed",
    checkbox: "checked",
    menuitem: "selected",
    menuitemcheckbox: "checked",
    menuitemradio: "checked",
    radio: "checked",
    tab: "selected",
    treeitem: "selected"
};
g = Xf.prototype;
g.mb = function() {}
;
g.Ea = function(a) {
    return a.g.F("DIV", $f(this, a).join(" "), a.Fa)
}
;
g.Sa = function(a) {
    return a
}
;
g.jc = function() {
    return !0
}
;
g.wa = function(a, b) {
    b.id && wf(a, b.id);
    var c = this.Sa(b);
    c && c.firstChild ? ag(a, c.firstChild.nextSibling ? Ja(c.childNodes) : c.firstChild) : a.Fa = null;
    var d = 0
      , e = this.V()
      , f = this.V()
      , h = !1
      , k = !1
      , l = Ja(Xd(b));
    l.forEach(function(m) {
        h || m != e ? k || m != f ? d |= this.i(m) : k = !0 : (h = !0,
        f == e && (k = !0));
        1 == this.i(m) && Gc(c) && Hc(c) && Fc(c, !1)
    }, this);
    a.L = d;
    h || (l.push(e),
    f == e && (k = !0));
    k || l.push(f);
    (a = a.vc) && l.push.apply(l, a);
    h && k && !a || Yd(b, l.join(" "));
    return b
}
;
g.Tc = function(a) {
    Cf(a) && this.Vc(a.h(), !0);
    a.isEnabled() && this.yb(a, a.isVisible())
}
;
var bg = function(a, b, c) {
    if (a = c || a.mb())
        c = b.getAttribute("role") || null,
        a != c && Gf(b, a)
}
  , cg = function(a, b, c) {
    b.isVisible() || R(c, "hidden", !b.isVisible());
    b.isEnabled() || a.Ka(c, 1, !b.isEnabled());
    b.U & 8 && a.Ka(c, 8, !!(b.L & 8));
    b.U & 16 && a.Ka(c, 16, !!(b.L & 16));
    b.U & 64 && a.Ka(c, 64, !!(b.L & 64))
};
g = Xf.prototype;
g.kc = function(a, b) {
    Ee(a, !b, !v)
}
;
g.Vc = function(a, b) {
    var c = this.V() + "-rtl";
    (a = a.h ? a.h() : a) && (b ? $d : be)(a, [c])
}
;
g.Uc = function(a) {
    var b;
    return a.U & 32 && (b = a.h()) ? Gc(b) && Hc(b) : !1
}
;
g.yb = function(a, b) {
    var c;
    if (a.U & 32 && (c = a.h())) {
        if (!b && a.L & 32) {
            try {
                c.blur()
            } catch (d) {}
            a.L & 32 && a.Wc(null)
        }
        (Gc(c) && Hc(c)) != b && Fc(c, b)
    }
}
;
g.lc = function(a, b, c) {
    var d = a.h();
    if (d) {
        var e = this.g(b);
        e && (a = a.h ? a.h() : a) && (c ? $d : be)(a, [e]);
        this.Ka(d, b, c)
    }
}
;
g.Ka = function(a, b, c) {
    Yf || (Yf = {
        1: "disabled",
        8: "selected",
        16: "checked",
        64: "expanded"
    });
    b = Yf[b];
    var d = a.getAttribute("role") || null;
    d && (d = Zf[d] || b,
    b = "checked" == b || "selected" == b ? d : b);
    b && R(a, b, c)
}
;
g.Mb = function(a, b) {
    var c = this.Sa(a);
    c && (xc(c),
    b && ("string" === typeof b ? Cc(c, b) : (a = function(d) {
        if (d) {
            var e = E(c);
            c.appendChild("string" === typeof d ? e.createTextNode(d) : d)
        }
    }
    ,
    Array.isArray(b) ? b.forEach(a) : !ta(b) || "nodeType"in b ? a(b) : Ja(b).forEach(a))))
}
;
g.V = function() {
    return "goog-control"
}
;
var $f = function(a, b) {
    var c = a.V()
      , d = [c]
      , e = a.V();
    e != c && d.push(e);
    c = b.L;
    for (e = []; c; ) {
        var f = c & -c;
        e.push(a.g(f));
        c &= ~f
    }
    d.push.apply(d, e);
    (a = b.vc) && d.push.apply(d, a);
    return d
};
Xf.prototype.g = function(a) {
    this.j || dg(this);
    return this.j[a]
}
;
Xf.prototype.i = function(a) {
    this.A || (this.j || dg(this),
    this.A = Vb(this.j));
    a = parseInt(this.A[a], 10);
    return isNaN(a) ? 0 : a
}
;
var dg = function(a) {
    var b = a.V();
    b.replace(/\xa0|\s/g, " ");
    a.j = {
        1: b + "-disabled",
        2: b + "-hover",
        4: b + "-active",
        8: b + "-selected",
        16: b + "-checked",
        32: b + "-focused",
        64: b + "-open"
    }
};
var U = function(a, b, c) {
    P.call(this, c);
    if (!b) {
        for (b = this.constructor; b; ) {
            var d = xa(b);
            if (d = Qf[d])
                break;
            b = (b = Object.getPrototypeOf(b.prototype)) && b.constructor
        }
        b = d ? "function" === typeof d.va ? d.va() : new d : null
    }
    this.i = b;
    this.Fa = void 0 !== a ? a : null
};
q(U, P);
g = U.prototype;
g.Fa = null;
g.L = 0;
g.U = 39;
g.Fb = 255;
g.jb = 0;
g.Ob = !0;
g.vc = null;
g.Cc = !0;
var fg = function(a) {
    a.J && 0 != a.Cc && eg(a, !1);
    a.Cc = !1
};
g = U.prototype;
g.ra = function() {
    var a = this.i.Ea(this);
    this.j = a;
    bg(this.i, a, this.zb());
    this.i.kc(a, !1);
    this.isVisible() || (O(a, !1),
    a && R(a, "hidden", !0))
}
;
g.zb = function() {
    return null
}
;
g.xb = function() {
    return this.i.Sa(this.h())
}
;
g.lb = function(a) {
    return this.i.jc(a)
}
;
g.ua = function(a) {
    this.j = a = this.i.wa(this, a);
    bg(this.i, a, this.zb());
    this.i.kc(a, !1);
    this.Ob = "none" != a.style.display
}
;
g.O = function() {
    U.l.O.call(this);
    cg(this.i, this, this.j);
    this.i.Tc(this);
    if (this.U & -2 && (this.Cc && eg(this, !0),
    this.U & 32)) {
        var a = this.h();
        if (a) {
            var b = this.o || (this.o = new Xe);
            We(b, a);
            Q(this).s(b, "key", this.xa).s(a, "focus", this.ud).s(a, "blur", this.Wc)
        }
    }
}
;
var eg = function(a, b) {
    var c = Q(a)
      , d = a.h();
    b ? (c.s(d, T.ob, a.Nb).s(d, [T.pb, T.Db], a.tb).s(d, "mouseover", a.Ga).s(d, "mouseout", a.ka),
    a.B != Ib && c.s(d, "contextmenu", a.B),
    v && !a.R && (a.R = new gg(a),
    Nc(a, Ba(Mc, a.R)))) : (c.qa(d, T.ob, a.Nb).qa(d, [T.pb, T.Db], a.tb).qa(d, "mouseover", a.Ga).qa(d, "mouseout", a.ka),
    a.B != Ib && c.qa(d, "contextmenu", a.B),
    v && (Mc(a.R),
    a.R = null))
};
U.prototype.la = function() {
    U.l.la.call(this);
    this.o && af(this.o);
    this.isVisible() && this.isEnabled() && this.i.yb(this, !1)
}
;
U.prototype.C = function() {
    U.l.C.call(this);
    this.o && (this.o.S(),
    delete this.o);
    delete this.i;
    this.R = this.vc = this.Fa = null
}
;
var ag = function(a, b) {
    a.Fa = b
};
U.prototype.Va = function() {
    var a = this.Fa;
    if (!a)
        return "";
    a = "string" === typeof a ? a : Array.isArray(a) ? a.map(Kc).join("") : Jc(a);
    return ec(a)
}
;
U.prototype.isVisible = function() {
    return this.Ob
}
;
U.prototype.isEnabled = function() {
    return !(this.L & 1)
}
;
U.prototype.Ja = function(a) {
    var b = this.N();
    b && "function" == typeof b.isEnabled && !b.isEnabled() || !hg(this, 1, !a) || (a || (ig(this, !1),
    jg(this, !1)),
    this.isVisible() && this.i.yb(this, a),
    kg(this, 1, !a, !0))
}
;
var jg = function(a, b) {
    hg(a, 2, b) && kg(a, 2, b)
};
U.prototype.isActive = function() {
    return !!(this.L & 4)
}
;
var ig = function(a, b) {
    hg(a, 4, b) && kg(a, 4, b)
}
  , lg = function(a, b) {
    hg(a, 8, b) && kg(a, 8, b)
}
  , mg = function(a, b) {
    hg(a, 64, b) && kg(a, 64, b)
}
  , kg = function(a, b, c, d) {
    d || 1 != b ? a.U & b && c != !!(a.L & b) && (a.i.lc(a, b, c),
    a.L = c ? a.L | b : a.L & ~b) : a.Ja(!c)
};
U.prototype.ea = function(a, b) {
    if (this.J && this.L & a && !b)
        throw Error("Component already rendered");
    !b && this.L & a && kg(this, a, !1);
    this.U = b ? this.U | a : this.U & ~a
}
;
var ng = function(a, b) {
    return !!(a.Fb & b) && !!(a.U & b)
}
  , hg = function(a, b, c) {
    return !!(a.U & b) && !!(a.L & b) != c && (!(a.jb & b) || a.dispatchEvent(uf(b, c))) && !a.Da
};
U.prototype.Ga = function(a) {
    !og(a, this.h()) && this.dispatchEvent("enter") && this.isEnabled() && ng(this, 2) && jg(this, !0)
}
;
U.prototype.ka = function(a) {
    !og(a, this.h()) && this.dispatchEvent("leave") && (ng(this, 4) && ig(this, !1),
    ng(this, 2) && jg(this, !1))
}
;
U.prototype.B = Ib;
var og = function(a, b) {
    return !!a.relatedTarget && Bc(b, a.relatedTarget)
};
g = U.prototype;
g.Nb = function(a) {
    this.isEnabled() && (ng(this, 2) && jg(this, !0),
    0 != a.i.button || z && a.ctrlKey || (ng(this, 4) && ig(this, !0),
    this.i && this.i.Uc(this) && this.h().focus()));
    0 != a.i.button || z && a.ctrlKey || a.j()
}
;
g.tb = function(a) {
    this.isEnabled() && (ng(this, 2) && jg(this, !0),
    this.isActive() && this.ub(a) && ng(this, 4) && ig(this, !1))
}
;
g.ub = function(a) {
    if (ng(this, 16)) {
        var b = !(this.L & 16);
        hg(this, 16, b) && kg(this, 16, b)
    }
    ng(this, 8) && lg(this, !0);
    ng(this, 64) && mg(this, !(this.L & 64));
    b = new G("action",this);
    a && (b.altKey = a.altKey,
    b.ctrlKey = a.ctrlKey,
    b.metaKey = a.metaKey,
    b.shiftKey = a.shiftKey,
    b.B = a.B);
    return this.dispatchEvent(b)
}
;
g.ud = function() {
    ng(this, 32) && hg(this, 32, !0) && kg(this, 32, !0)
}
;
g.Wc = function() {
    ng(this, 4) && ig(this, !1);
    ng(this, 32) && hg(this, 32, !1) && kg(this, 32, !1)
}
;
g.xa = function(a) {
    return this.isVisible() && this.isEnabled() && this.Ab(a) ? (a.j(),
    a.A(),
    !0) : !1
}
;
g.Ab = function(a) {
    return 13 == a.g && this.ub(a)
}
;
if ("function" !== typeof U)
    throw Error("Invalid component class " + U);
if ("function" !== typeof Xf)
    throw Error("Invalid renderer class " + Xf);
var pg = xa(U);
Qf[pg] = Xf;
Of("goog-control", function() {
    return new U(null)
});
var gg = function(a) {
    F.call(this);
    this.j = a;
    this.g = !1;
    this.i = new M(this);
    Nc(this, Ba(Mc, this.i));
    a = this.j.j;
    this.i.s(a, T.ob, this.A).s(a, T.pb, this.o).s(a, "click", this.v)
};
q(gg, F);
var qg = !v || 9 <= Number(Hb);
gg.prototype.A = function() {
    this.g = !1
}
;
gg.prototype.o = function() {
    this.g = !0
}
;
var rg = function(a, b) {
    if (!qg)
        return a.button = 0,
        a.type = b,
        a;
    var c = document.createEvent("MouseEvents");
    c.initMouseEvent(b, a.bubbles, a.cancelable, a.view || null, a.detail, a.screenX, a.screenY, a.clientX, a.clientY, a.ctrlKey, a.altKey, a.shiftKey, a.metaKey, 0, a.relatedTarget || null);
    return c
};
gg.prototype.v = function(a) {
    if (this.g)
        this.g = !1;
    else {
        var b = a.i
          , c = b.button
          , d = b.type
          , e = rg(b, "mousedown");
        this.j.Nb(new H(e,a.v));
        e = rg(b, "mouseup");
        this.j.tb(new H(e,a.v));
        qg || (b.button = c,
        b.type = d)
    }
}
;
gg.prototype.C = function() {
    this.j = null;
    gg.l.C.call(this)
}
;
var V = function(a, b, c) {
    P.call(this, c);
    this.ab = b || Rf.va();
    this.Ta = a || "vertical"
};
q(V, P);
g = V.prototype;
g.Gc = null;
g.Za = null;
g.ab = null;
g.Ta = null;
g.La = !0;
g.Ya = !0;
g.sb = !0;
g.ja = -1;
g.aa = null;
g.hb = !1;
g.fb = null;
var sg = function(a) {
    return a.Gc || a.h()
};
g = V.prototype;
g.ra = function() {
    this.j = this.g.F("DIV", this.ab.v(this).join(" "))
}
;
g.xb = function() {
    return this.h()
}
;
g.lb = function(a) {
    return this.ab.i(a)
}
;
g.ua = function(a) {
    this.j = Vf(this.ab, this, a);
    "none" == a.style.display && (this.La = !1)
}
;
g.O = function() {
    V.l.O.call(this);
    zf(this, function(b) {
        b.J && tg(this, b)
    }, this);
    var a = this.h();
    this.ab.A(this);
    this.nb(this.La, !0);
    Q(this).s(this, "enter", this.Bc).s(this, "highlight", this.Od).s(this, "unhighlight", this.Vd).s(this, "open", this.Qd).s(this, "close", this.Gd).s(a, T.ob, this.vd).s(E(a), [T.pb, T.Db], this.Hd).s(a, [T.ob, T.pb, T.Db, "mouseover", "mouseout", "contextmenu"], this.Fd);
    this.sb && ug(this, !0)
}
;
var ug = function(a, b) {
    var c = Q(a)
      , d = sg(a);
    b ? c.s(d, "focus", a.mc).s(d, "blur", a.Xc).s(a.Za || (a.Za = new Xe(sg(a))), "key", a.xa) : c.qa(d, "focus", a.mc).qa(d, "blur", a.Xc).qa(a.Za || (a.Za = new Xe(sg(a))), "key", a.xa)
};
g = V.prototype;
g.la = function() {
    this.Ba(-1);
    this.aa && mg(this.aa, !1);
    this.hb = !1;
    V.l.la.call(this)
}
;
g.C = function() {
    V.l.C.call(this);
    this.Za && (this.Za.S(),
    this.Za = null);
    this.ab = this.aa = this.fb = this.Gc = null
}
;
g.Bc = function() {
    return !0
}
;
g.Od = function(a) {
    var b = Df(this, a.target);
    if (-1 < b && b != this.ja) {
        var c = vg(this);
        c && jg(c, !1);
        this.ja = b;
        c = vg(this);
        this.hb && ig(c, !0);
        this.aa && c != this.aa && (c.U & 64 ? mg(c, !0) : mg(this.aa, !1))
    }
    b = this.h();
    null != a.target.h() && R(b, "activedescendant", a.target.h().id)
}
;
g.Vd = function(a) {
    a.target == vg(this) && (this.ja = -1);
    this.h().removeAttribute("aria-activedescendant")
}
;
g.Qd = function(a) {
    (a = a.target) && a != this.aa && a.N() == this && (this.aa && mg(this.aa, !1),
    this.aa = a)
}
;
g.Gd = function(a) {
    a.target == this.aa && (this.aa = null);
    var b = this.h()
      , c = a.target.h();
    b && a.target.L & 2 && c && (a = "",
    c && (a = c.id),
    R(b, "activedescendant", a))
}
;
g.vd = function(a) {
    this.Ya && (this.hb = !0);
    var b = sg(this);
    b && Gc(b) && Hc(b) ? b.focus() : a.j()
}
;
g.Hd = function() {
    this.hb = !1
}
;
g.Fd = function(a) {
    a: {
        var b = a.target;
        if (this.fb)
            for (var c = this.h(); b && b !== c; ) {
                var d = b.id;
                if (d in this.fb) {
                    b = this.fb[d];
                    break a
                }
                b = b.parentNode
            }
        b = null
    }
    if (b)
        switch (a.type) {
        case T.ob:
            b.Nb(a);
            break;
        case T.pb:
        case T.Db:
            b.tb(a);
            break;
        case "mouseover":
            b.Ga(a);
            break;
        case "mouseout":
            b.ka(a);
            break;
        case "contextmenu":
            b.B(a)
        }
}
;
g.mc = function() {}
;
g.Xc = function() {
    this.Ba(-1);
    this.hb = !1;
    this.aa && mg(this.aa, !1)
}
;
g.xa = function(a) {
    return this.isEnabled() && this.isVisible() && (0 != Af(this) || this.Gc) && this.nc(a) ? (a.j(),
    a.A(),
    !0) : !1
}
;
g.nc = function(a) {
    var b = vg(this);
    if (b && "function" == typeof b.xa && b.xa(a) || this.aa && this.aa != b && "function" == typeof this.aa.xa && this.aa.xa(a))
        return !0;
    if (a.shiftKey || a.ctrlKey || a.metaKey || a.altKey)
        return !1;
    switch (a.g) {
    case 27:
        if (this.sb)
            sg(this).blur();
        else
            return !1;
        break;
    case 36:
        wg(this);
        break;
    case 35:
        xg(this);
        break;
    case 38:
        if ("vertical" == this.Ta)
            yg(this);
        else
            return !1;
        break;
    case 37:
        if ("horizontal" == this.Ta)
            Cf(this) ? zg(this) : yg(this);
        else
            return !1;
        break;
    case 40:
        if ("vertical" == this.Ta)
            zg(this);
        else
            return !1;
        break;
    case 39:
        if ("horizontal" == this.Ta)
            Cf(this) ? yg(this) : zg(this);
        else
            return !1;
        break;
    default:
        return !1
    }
    return !0
}
;
var tg = function(a, b) {
    var c = b.h();
    c = c.id || (c.id = vf(b));
    a.fb || (a.fb = {});
    a.fb[c] = b
};
V.prototype.eb = function(a, b) {
    V.l.eb.call(this, a, b)
}
;
V.prototype.oc = function(a, b, c) {
    a.jb |= 2;
    a.jb |= 64;
    a.ea(32, !1);
    fg(a);
    var d = a.N() == this ? Df(this, a) : -1;
    V.l.oc.call(this, a, b, c);
    a.J && this.J && tg(this, a);
    a = d;
    -1 == a && (a = Af(this));
    a == this.ja ? this.ja = Math.min(Af(this) - 1, b) : a > this.ja && b <= this.ja ? this.ja++ : a < this.ja && b > this.ja && this.ja--
}
;
var Wf = function(a, b) {
    if (a.h())
        throw Error("Component already rendered");
    a.Ta = b
};
V.prototype.isVisible = function() {
    return this.La
}
;
V.prototype.nb = function(a, b) {
    if (b || this.La != a && this.dispatchEvent(a ? "show" : "hide")) {
        this.La = a;
        var c = this.h();
        c && (O(c, a),
        this.sb && Sf(sg(this), this.Ya && this.La),
        b || this.dispatchEvent(this.La ? "aftershow" : "afterhide"));
        return !0
    }
    return !1
}
;
V.prototype.isEnabled = function() {
    return this.Ya
}
;
V.prototype.Ja = function(a) {
    this.Ya != a && this.dispatchEvent(a ? "enable" : "disable") && (a ? (this.Ya = !0,
    zf(this, function(b) {
        b.sd ? delete b.sd : b.Ja(!0)
    })) : (zf(this, function(b) {
        b.isEnabled() ? b.Ja(!1) : b.sd = !0
    }),
    this.hb = this.Ya = !1),
    this.sb && Sf(sg(this), a && this.La))
}
;
var Ag = function(a) {
    0 != a.sb && a.J && ug(a, !1);
    a.sb = !1;
    a.Ya && a.La && Sf(sg(a), !1)
};
V.prototype.Ba = function(a) {
    (a = Bf(this, a)) ? jg(a, !0) : -1 < this.ja && jg(vg(this), !1)
}
;
var vg = function(a) {
    return Bf(a, a.ja)
}
  , wg = function(a) {
    Bg(a, function(b, c) {
        return (b + 1) % c
    }, Af(a) - 1)
}
  , xg = function(a) {
    Bg(a, function(b, c) {
        b--;
        return 0 > b ? c - 1 : b
    }, 0)
}
  , zg = function(a) {
    Bg(a, function(b, c) {
        return (b + 1) % c
    }, a.ja)
}
  , yg = function(a) {
    Bg(a, function(b, c) {
        b--;
        return 0 > b ? c - 1 : b
    }, a.ja)
}
  , Bg = function(a, b, c) {
    c = 0 > c ? Df(a, a.aa) : c;
    var d = Af(a);
    c = b.call(a, c, d);
    for (var e = 0; e <= d; ) {
        var f = Bf(a, c);
        if (f && a.bd(f)) {
            a.Nc(c);
            break
        }
        e++;
        c = b.call(a, c, d)
    }
};
V.prototype.bd = function(a) {
    return a.isVisible() && a.isEnabled() && !!(a.U & 2)
}
;
V.prototype.Nc = function(a) {
    this.Ba(a)
}
;
var Cg = function() {};
q(Cg, Xf);
sa(Cg);
Cg.prototype.V = function() {
    return "goog-menuheader"
}
;
var Dg = function(a, b, c) {
    U.call(this, a, c || Cg.va(), b);
    this.ea(1, !1);
    this.ea(2, !1);
    this.ea(4, !1);
    this.ea(32, !1);
    this.L = 1
};
q(Dg, U);
Of("goog-menuheader", function() {
    return new Dg(null)
});
var Eg = function() {
    this.v = []
};
q(Eg, Xf);
sa(Eg);
var Fg = function(a, b) {
    var c = a.v[b];
    if (!c) {
        switch (b) {
        case 0:
            c = a.V() + "-highlight";
            break;
        case 1:
            c = a.V() + "-checkbox";
            break;
        case 2:
            c = a.V() + "-content"
        }
        a.v[b] = c
    }
    return c
};
g = Eg.prototype;
g.mb = function() {
    return "menuitem"
}
;
g.Ea = function(a) {
    var b = a.g.F("DIV", $f(this, a).join(" "), Gg(this, a.Fa, a.g));
    Hg(this, a, b, !!(a.U & 8) || !!(a.U & 16));
    return b
}
;
g.Sa = function(a) {
    return a && a.firstChild
}
;
g.wa = function(a, b) {
    var c = Ac(b)
      , d = Fg(this, 2);
    c && Zd(c, d) || b.appendChild(Gg(this, b.childNodes, a.g));
    Zd(b, "goog-option") && (a.hc(!0),
    this.hc(a, b, !0));
    return Eg.l.wa.call(this, a, b)
}
;
g.Mb = function(a, b) {
    var c = this.Sa(a)
      , d = Ig(this, a) ? c.firstChild : null;
    Eg.l.Mb.call(this, a, b);
    d && !Ig(this, a) && c.insertBefore(d, c.firstChild || null)
}
;
var Gg = function(a, b, c) {
    a = Fg(a, 2);
    return c.F("DIV", a, b)
};
Eg.prototype.od = function(a, b, c) {
    a && b && Hg(this, a, b, c)
}
;
Eg.prototype.hc = function(a, b, c) {
    a && b && Hg(this, a, b, c)
}
;
var Ig = function(a, b) {
    return (b = a.Sa(b)) ? (b = b.firstChild,
    a = Fg(a, 1),
    !!b && ua(b) && 1 == b.nodeType && Zd(b, a)) : !1
}
  , Hg = function(a, b, c, d) {
    bg(a, c, b.zb());
    cg(a, b, c);
    d != Ig(a, c) && (d ? L(c, "goog-option") : ae(c, "goog-option"),
    c = a.Sa(c),
    d ? (a = Fg(a, 1),
    c.insertBefore(b.g.F("DIV", a), c.firstChild || null)) : c.removeChild(c.firstChild))
};
Eg.prototype.g = function(a) {
    switch (a) {
    case 2:
        return Fg(this, 0);
    case 16:
    case 8:
        return "goog-option-selected";
    default:
        return Eg.l.g.call(this, a)
    }
}
;
Eg.prototype.i = function(a) {
    var b = Fg(this, 0);
    switch (a) {
    case "goog-option-selected":
        return 16;
    case b:
        return 2;
    default:
        return Eg.l.i.call(this, a)
    }
}
;
Eg.prototype.V = function() {
    return "goog-menuitem"
}
;
var W = function(a, b, c, d) {
    U.call(this, a, d || Eg.va(), c);
    this.Eb = b
};
q(W, U);
g = W.prototype;
g.getValue = function() {
    var a = this.Eb;
    return null != a ? a : this.Va()
}
;
g.ea = function(a, b) {
    W.l.ea.call(this, a, b);
    switch (a) {
    case 8:
        this.L & 16 && !b && hg(this, 16, !1) && kg(this, 16, !1);
        (a = this.h()) && this.i.od(this, a, b);
        break;
    case 16:
        (a = this.h()) && this.i.hc(this, a, b)
    }
}
;
g.od = function(a) {
    this.ea(8, a)
}
;
g.hc = function(a) {
    this.ea(16, a)
}
;
g.Va = function() {
    var a = this.Fa;
    return Array.isArray(a) ? (a = Ga(a, function(b) {
        return ua(b) && 1 == b.nodeType && (Zd(b, "goog-menuitem-accel") || Zd(b, "goog-menuitem-mnemonic-separator")) ? "" : Kc(b)
    }).join(""),
    ec(a)) : W.l.Va.call(this)
}
;
g.tb = function(a) {
    var b = this.N();
    if (b) {
        var c = b.o;
        b.o = null;
        if (b = c && "number" === typeof a.clientX)
            b = new A(a.clientX,a.clientY),
            b = c == b ? !0 : c && b ? c.x == b.x && c.y == b.y : !1;
        if (b)
            return
    }
    W.l.tb.call(this, a)
}
;
g.Ab = function(a) {
    return a.g == this.kd && this.ub(a) ? !0 : W.l.Ab.call(this, a)
}
;
g.Cd = function() {
    return this.kd
}
;
Of("goog-menuitem", function() {
    return new W(null)
});
W.prototype.zb = function() {
    return this.U & 16 ? "menuitemcheckbox" : this.U & 8 ? "menuitemradio" : W.l.zb.call(this)
}
;
W.prototype.N = function() {
    return U.prototype.N.call(this)
}
;
W.prototype.Xb = function() {
    return U.prototype.Xb.call(this)
}
;
var Jg = function() {};
q(Jg, Xf);
sa(Jg);
Jg.prototype.Ea = function(a) {
    return a.g.F("DIV", this.V())
}
;
Jg.prototype.wa = function(a, b) {
    b.id && wf(a, b.id);
    if ("HR" == b.tagName) {
        var c = b;
        b = this.Ea(a);
        c.parentNode && c.parentNode.insertBefore(b, c);
        yc(c)
    } else
        L(b, this.V());
    return b
}
;
Jg.prototype.Mb = function() {}
;
Jg.prototype.V = function() {
    return "goog-menuseparator"
}
;
var Kg = function(a, b) {
    U.call(this, null, a || Jg.va(), b);
    this.ea(1, !1);
    this.ea(2, !1);
    this.ea(4, !1);
    this.ea(32, !1);
    this.L = 1
};
q(Kg, U);
Kg.prototype.O = function() {
    Kg.l.O.call(this);
    var a = this.h();
    Gf(a, "separator")
}
;
Of("goog-menuseparator", function() {
    return new Kg
});
var Lg = function(a) {
    this.o = a || "menu"
};
q(Lg, Rf);
sa(Lg);
Lg.prototype.i = function(a) {
    return "UL" == a.tagName || Lg.l.i.call(this, a)
}
;
Lg.prototype.D = function(a) {
    return "HR" == a.tagName ? new Kg : Lg.l.D.call(this, a)
}
;
Lg.prototype.g = function() {
    return "goog-menu"
}
;
Lg.prototype.A = function(a) {
    Lg.l.A.call(this, a);
    a = a.h();
    R(a, "haspopup", "true")
}
;
Of("goog-menuseparator", function() {
    return new Kg
});
var Mg = function(a, b) {
    V.call(this, "vertical", b || Lg.va(), a);
    Ag(this)
};
q(Mg, V);
g = Mg.prototype;
g.pc = !0;
g.Zc = !1;
g.nb = function(a, b) {
    (b = Mg.l.nb.call(this, a, b)) && a && this.J && this.pc && sg(this).focus();
    this.o = null;
    return b
}
;
g.Bc = function(a) {
    this.pc && sg(this).focus();
    return Mg.l.Bc.call(this, a)
}
;
g.bd = function(a) {
    return (this.Zc || a.isEnabled()) && a.isVisible() && !!(a.U & 2)
}
;
g.ua = function(a) {
    for (var b = this.ab, c = kc(this.g.g, "DIV", b.g() + "-content", a), d = c.length, e = 0; e < d; e++)
        Uf(b, this, c[e]);
    Mg.l.ua.call(this, a)
}
;
g.nc = function(a) {
    var b = Mg.l.nc.call(this, a);
    b || zf(this, function(c) {
        !b && c.Cd && c.kd == a.g && (this.isEnabled() && this.Ba(Df(this, c)),
        b = c.xa(a))
    }, this);
    return b
}
;
g.Ba = function(a) {
    Mg.l.Ba.call(this, a);
    if (a = Bf(this, a)) {
        var b = a.h();
        a = this.h() || oc(document);
        var c = a || oc(document);
        var d = ue(b)
          , e = ue(c)
          , f = Ie(c);
        if (c == oc(document)) {
            var h = d.x - c.scrollLeft;
            d = d.y - c.scrollTop;
            !v || 10 <= Number(Hb) || (h += f.left,
            d += f.top)
        } else
            h = d.x - e.x - f.left,
            d = d.y - e.y - f.top;
        b = ze(b);
        f = c.clientHeight - b.height;
        e = c.scrollLeft;
        var k = c.scrollTop;
        e += Math.min(h, Math.max(h - (c.clientWidth - b.width), 0));
        k += Math.min(d, Math.max(d - f, 0));
        c = new A(e,k);
        a.scrollLeft = c.x;
        a.scrollTop = c.y
    }
}
;
var Ng = function(a, b, c) {
    P.call(this, a);
    this.X = c || new S;
    this.i = !0;
    a = this.H = b || new Mg(this.g);
    a.nb(!1);
    a.pc = !1;
    a.Zc = !0
};
q(Ng, P);
g = Ng.prototype;
g.Zb = null;
g.jd = null;
g.X = null;
g.H = null;
g.Lb = -1;
g.Aa = null;
g.Kc = Ma;
g.rb = null;
g.uc = "";
g.Ub = null;
g.rd = !1;
g.ra = function() {
    this.Aa = this.g.F("INPUT", {
        name: "",
        type: "text",
        autocomplete: "off"
    });
    this.rb = this.g.F("SPAN", "goog-combobox-button");
    this.j = this.g.F("SPAN", "goog-combobox", this.Aa, this.rb);
    this.rd && (Cc(this.rb, "\u25bc"),
    Ee(this.rb, !0));
    this.Aa.setAttribute("label", this.uc);
    yf(this.X, this.Aa);
    Ag(this.H);
    this.H.J || this.eb(this.H, !0)
}
;
g.Ja = function(a) {
    this.i = a;
    this.X.Ja(a);
    var b = this.h();
    a ? ae(b, "goog-combobox-disabled") : L(b, "goog-combobox-disabled")
}
;
g.isEnabled = function() {
    return this.i
}
;
g.O = function() {
    Ng.l.O.call(this);
    var a = Q(this);
    a.s(this.h(), "mousedown", this.ae);
    a.s(this.g.g, "mousedown", this.be);
    a.s(this.Aa, "blur", this.de);
    this.o = new Xe(this.Aa);
    a.s(this.o, "key", this.xa);
    this.Zb = new Se(this.Aa);
    a.s(this.Zb, "input", this.ee);
    a.s(this.H, "action", this.fe)
}
;
g.la = function() {
    this.o.S();
    delete this.o;
    this.Zb.S();
    this.Zb = null;
    Ng.l.la.call(this)
}
;
g.lb = function() {
    return !1
}
;
g.C = function() {
    Ng.l.C.call(this);
    this.Tb();
    this.X.S();
    this.H.S();
    this.rb = this.Aa = this.H = this.X = null
}
;
g.gb = function() {
    this.Tb();
    Og(this);
    this.H.Ba(-1)
}
;
var Qg = function(a, b) {
    a.X.getValue() != b && (Mf(a.X, b),
    Pg(a))
};
Ng.prototype.getValue = function() {
    return this.X.getValue()
}
;
var Tg = function(a, b) {
    var c = a.H.isVisible(), d;
    if (-1 == a.Lb) {
        for (var e = d = 0, f = Af(a.H); e < f; e++)
            Bf(a.H, e).isVisible() && d++;
        a.Lb = d
    }
    d = a.Lb;
    c && 0 == d ? Og(a) : !c && 0 < d && (b && (Rg(a, ""),
    Sg(a, t(a.X.getValue().toLowerCase()))),
    md(a.Tb, 1, a),
    a.H.nb(!0),
    L(a.h(), "goog-combobox-active"));
    a.H && a.H.isVisible() && (new rf(a.h(),9,!0)).j(a.H.h(), 8)
}
  , Og = function(a) {
    a.H.nb(!1);
    ae(a.h(), "goog-combobox-active")
};
g = Ng.prototype;
g.Tb = function() {
    this.Ub && (p.clearTimeout(this.Ub),
    this.Ub = null)
}
;
g.ae = function(a) {
    this.i && (a.target == this.h() || a.target == this.Aa || Bc(this.rb, a.target)) && (this.H.isVisible() ? this.gb() : (Tg(this, !0),
    this.Aa.select(),
    this.H.hb = !0,
    a.j()));
    a.A()
}
;
g.be = function(a) {
    Bc(this.H.h(), a.target) || this.gb()
}
;
g.fe = function(a) {
    var b = a.target;
    this.dispatchEvent(new Ef("action",this,b)) && (b = b.Va(),
    this.X.getValue() != b && (Mf(this.X, b),
    this.dispatchEvent("change")),
    this.gb());
    a.A()
}
;
g.de = function() {
    this.Tb();
    this.Ub = md(this.gb, 250, this)
}
;
g.xa = function(a) {
    var b = this.H.isVisible();
    if (b && this.H.xa(a))
        return !0;
    var c = !1;
    switch (a.g) {
    case 27:
        b && (this.X.getValue(),
        this.gb(),
        c = !0);
        break;
    case 9:
        b && (b = vg(this.H)) && (this.X.getValue(),
        b.ub(a),
        c = !0);
        break;
    case 38:
    case 40:
        b || (Tg(this, !0),
        c = !0)
    }
    c && a.j();
    return c
}
;
g.ee = function() {
    this.X.getValue();
    Pg(this)
}
;
var Pg = function(a) {
    var b = t(a.X.getValue().toLowerCase());
    Rg(a, b);
    Lc(a.g.g) == a.Aa && Tg(a, !1);
    var c = vg(a.H);
    "" != b && c && c.isVisible() || Sg(a, b);
    a.jd = b;
    a.dispatchEvent("change")
}
  , Rg = function(a, b) {
    for (var c = !1, d = 0, e = !a.Kc(b, a.jd), f = 0, h = Af(a.H); f < h; f++) {
        var k = Bf(a.H, f);
        if (k instanceof W) {
            if (!k.isVisible() && !e)
                continue;
            var l = k.Va();
            l = "function" == typeof k.W && k.qb || l && a.Kc(l.toLowerCase(), b);
            "function" == typeof k.ba && k.ba(b);
            var m = k
              , n = !!l;
            if (m.Ob != n && m.dispatchEvent(n ? "show" : "hide")) {
                var w = m.h();
                if (w) {
                    var I = n;
                    O(w, I);
                    w && R(w, "hidden", !I)
                }
                m.isEnabled() && m.i.yb(m, n);
                m.Ob = n
            }
            c = l || c
        } else
            c = k.isVisible() || c;
        k.isVisible() && d++
    }
    a.Lb = d
}
  , Sg = function(a, b) {
    if ("" == b)
        a.H.Ba(-1);
    else {
        for (var c = 0, d = Af(a.H); c < d; c++) {
            var e = Bf(a.H, c)
              , f = e.Va();
            if (f && a.Kc(f.toLowerCase(), b)) {
                a.H.Ba(c);
                e.ba && e.ba(b);
                return
            }
        }
        a.H.Ba(-1)
    }
}
  , Ug = function(a, b, c, d) {
    W.call(this, a, b, c, d)
};
q(Ug, W);
Of("goog-combobox-item", function() {
    return new Ug(null)
});
Ug.prototype.qb = !1;
Ug.prototype.W = function() {
    return !1
}
;
Ug.prototype.ba = function(a) {
    if (this.isEnabled()) {
        var b = this.Va()
          , c = b.toLowerCase().indexOf(a);
        if (0 <= c) {
            var d = this.g;
            a = [d.g.createTextNode(String(b.slice(0, c))), d.F("B", null, b.slice(c, c + a.length)), d.g.createTextNode(String(b.slice(c + a.length)))];
            this.i.Mb(this.h(), a);
            this.Fa = a
        }
    }
}
;
var Vg = function() {};
q(Vg, Xf);
sa(Vg);
g = Vg.prototype;
g.mb = function() {
    return "button"
}
;
g.Ka = function(a, b, c) {
    switch (b) {
    case 8:
    case 16:
        R(a, "pressed", c);
        break;
    default:
    case 64:
    case 1:
        Vg.l.Ka.call(this, a, b, c)
    }
}
;
g.Ea = function(a) {
    var b = Vg.l.Ea.call(this, a);
    this.Wa(b, a.Oa());
    var c = a.getValue();
    c && this.Yc(b, c);
    a.U & 16 && this.Ka(b, 16, !!(a.L & 16));
    return b
}
;
g.wa = function(a, b) {
    b = Vg.l.wa.call(this, a, b);
    var c = this.getValue(b);
    a.cb = c;
    a.ic(this.Oa(b));
    a.U & 16 && this.Ka(b, 16, !!(a.L & 16));
    return b
}
;
g.getValue = function() {}
;
g.Yc = function() {}
;
g.Oa = function(a) {
    return a.title
}
;
g.Wa = function(a, b) {
    a && (b ? a.title = b : a.removeAttribute("title"))
}
;
g.V = function() {
    return "goog-button"
}
;
var Wg = function() {};
q(Wg, Vg);
sa(Wg);
g = Wg.prototype;
g.mb = function() {}
;
g.Ea = function(a) {
    fg(a);
    a.Fb &= -256;
    a.ea(32, !1);
    return a.g.F("BUTTON", {
        "class": $f(this, a).join(" "),
        disabled: !a.isEnabled(),
        title: a.Oa() || "",
        value: a.getValue() || ""
    }, a.Va() || "")
}
;
g.jc = function(a) {
    return "BUTTON" == a.tagName || "INPUT" == a.tagName && ("button" == a.type || "submit" == a.type || "reset" == a.type)
}
;
g.wa = function(a, b) {
    fg(a);
    a.Fb &= -256;
    a.ea(32, !1);
    if (b.disabled) {
        var c = this.g(1);
        L(b, c)
    }
    return Wg.l.wa.call(this, a, b)
}
;
g.Tc = function(a) {
    Q(a).s(a.h(), "click", a.ub)
}
;
g.kc = function() {}
;
g.Vc = function() {}
;
g.Uc = function(a) {
    return a.isEnabled()
}
;
g.yb = function() {}
;
g.lc = function(a, b, c) {
    Wg.l.lc.call(this, a, b, c);
    (a = a.h()) && 1 == b && (a.disabled = c)
}
;
g.getValue = function(a) {
    return a.value
}
;
g.Yc = function(a, b) {
    a && (a.value = b)
}
;
g.Ka = function() {}
;
var Xg = function(a, b, c) {
    U.call(this, a, b || Wg.va(), c)
};
q(Xg, U);
g = Xg.prototype;
g.getValue = function() {
    return this.cb
}
;
g.Oa = function() {
    return this.W
}
;
g.Wa = function(a) {
    this.W = a;
    this.i.Wa(this.h(), a)
}
;
g.ic = function(a) {
    this.W = a
}
;
g.C = function() {
    Xg.l.C.call(this);
    delete this.cb;
    delete this.W
}
;
g.O = function() {
    Xg.l.O.call(this);
    if (this.U & 32) {
        var a = this.h();
        a && Q(this).s(a, "keyup", this.Ab)
    }
}
;
g.Ab = function(a) {
    return 13 == a.g && "key" == a.type || 32 == a.g && "keyup" == a.type ? this.ub(a) : 32 == a.g
}
;
Of("goog-button", function() {
    return new Xg(null)
});
var Yg = function() {};
q(Yg, Vg);
sa(Yg);
Yg.prototype.Ea = function(a) {
    var b = $f(this, a);
    b = a.g.F("DIV", "goog-inline-block " + b.join(" "), Zg(this, a.Fa, a.g));
    this.Wa(b, a.Oa());
    return b
}
;
Yg.prototype.mb = function() {
    return "button"
}
;
Yg.prototype.Sa = function(a) {
    return a && a.firstChild && a.firstChild.firstChild
}
;
var Zg = function(a, b, c) {
    return c.F("DIV", "goog-inline-block " + (a.V() + "-outer-box"), c.F("DIV", "goog-inline-block " + (a.V() + "-inner-box"), b))
};
Yg.prototype.jc = function(a) {
    return "DIV" == a.tagName
}
;
Yg.prototype.wa = function(a, b) {
    $g(b, !0);
    $g(b, !1);
    a: {
        var c = a.g.ed(b);
        var d = this.V() + "-outer-box";
        if (c && Zd(c, d) && (c = a.g.ed(c),
        d = this.V() + "-inner-box",
        c && Zd(c, d))) {
            c = !0;
            break a
        }
        c = !1
    }
    c || b.appendChild(Zg(this, b.childNodes, a.g));
    $d(b, ["goog-inline-block", this.V()]);
    return Yg.l.wa.call(this, a, b)
}
;
Yg.prototype.V = function() {
    return "goog-custom-button"
}
;
var $g = function(a, b) {
    if (a)
        for (var c = b ? a.firstChild : a.lastChild, d; c && c.parentNode == a; ) {
            d = b ? c.nextSibling : c.previousSibling;
            if (3 == c.nodeType) {
                var e = c.nodeValue;
                if ("" == t(e))
                    a.removeChild(c);
                else {
                    c.nodeValue = b ? e.replace(/^[\s\xa0]+/, "") : e.replace(/[\s\xa0]+$/, "");
                    break
                }
            } else
                break;
            c = d
        }
};
var ah = function(a, b, c) {
    Xg.call(this, a, b || Yg.va(), c)
};
q(ah, Xg);
Of("goog-custom-button", function() {
    return new ah(null)
});
var ch = function(a, b, c) {
    J.call(this);
    this.target = a;
    this.handle = b || a;
    this.o = c || new N(NaN,NaN,NaN,NaN);
    this.i = E(a);
    this.g = new M(this);
    Nc(this, Ba(Mc, this.g));
    this.deltaY = this.deltaX = this.N = this.B = this.screenY = this.screenX = this.clientY = this.clientX = 0;
    this.A = !0;
    this.j = !1;
    bd(this.handle, ["touchstart", "mousedown"], this.pd, !1, this);
    this.v = bh
};
q(ch, J);
var bh = p.document && p.document.documentElement && !!p.document.documentElement.setCapture && !!p.document.releaseCapture
  , dh = function(a, b) {
    a.o = b || new N(NaN,NaN,NaN,NaN)
};
g = ch.prototype;
g.Ja = function(a) {
    this.A = a
}
;
g.C = function() {
    ch.l.C.call(this);
    id(this.handle, ["touchstart", "mousedown"], this.pd, !1, this);
    ee(this.g);
    this.v && this.i.releaseCapture();
    this.handle = this.target = null
}
;
g.pd = function(a) {
    var b = "mousedown" == a.type;
    if (!this.A || this.j || b && (0 != a.i.button || z && a.ctrlKey))
        this.dispatchEvent("earlycancel");
    else if (this.dispatchEvent(new eh("start",this,a.clientX,a.clientY,a))) {
        this.j = !0;
        b && a.j();
        b = this.i;
        var c = b.documentElement
          , d = !this.v;
        this.g.s(b, ["touchmove", "mousemove"], this.Pd, {
            capture: d,
            passive: !1
        });
        this.g.s(b, ["touchend", "mouseup"], this.Vb, d);
        this.v ? (c.setCapture(!1),
        this.g.s(c, "losecapture", this.Vb)) : this.g.s(rc(b), "blur", this.Vb);
        this.ga && this.g.s(this.ga, "scroll", this.ca, d);
        this.clientX = this.B = a.clientX;
        this.clientY = this.N = a.clientY;
        this.screenX = a.screenX;
        this.screenY = a.screenY;
        this.deltaX = this.target.offsetLeft;
        this.deltaY = this.target.offsetTop;
        this.D = qc(ic(this.i).g)
    }
}
;
g.Vb = function(a, b) {
    ee(this.g);
    this.v && this.i.releaseCapture();
    this.j ? (this.j = !1,
    this.dispatchEvent(new eh("end",this,a.clientX,a.clientY,a,fh(this, this.deltaX),gh(this, this.deltaY),b || "touchcancel" == a.type))) : this.dispatchEvent("earlycancel")
}
;
g.Pd = function(a) {
    if (this.A) {
        var b = a.clientX - this.clientX
          , c = a.clientY - this.clientY;
        this.clientX = a.clientX;
        this.clientY = a.clientY;
        this.screenX = a.screenX;
        this.screenY = a.screenY;
        if (!this.j) {
            var d = this.B - this.clientX
              , e = this.N - this.clientY;
            if (0 < d * d + e * e)
                if (this.dispatchEvent(new eh("start",this,a.clientX,a.clientY,a)))
                    this.j = !0;
                else {
                    this.Da || this.Vb(a);
                    return
                }
        }
        c = hh(this, b, c);
        b = c.x;
        c = c.y;
        this.j && this.dispatchEvent(new eh("beforedrag",this,a.clientX,a.clientY,a,b,c)) && (ih(this, a, b, c),
        a.j())
    }
}
;
var hh = function(a, b, c) {
    var d = qc(ic(a.i).g);
    b += d.x - a.D.x;
    c += d.y - a.D.y;
    a.D = d;
    a.deltaX += b;
    a.deltaY += c;
    return new A(fh(a, a.deltaX),gh(a, a.deltaY))
};
ch.prototype.ca = function(a) {
    var b = hh(this, 0, 0);
    a.clientX = this.clientX;
    a.clientY = this.clientY;
    ih(this, a, b.x, b.y)
}
;
var ih = function(a, b, c, d) {
    a.target.style.left = c + "px";
    a.target.style.top = d + "px";
    a.dispatchEvent(new eh("drag",a,b.clientX,b.clientY,b,c,d))
}
  , fh = function(a, b) {
    var c = a.o;
    a = isNaN(c.left) ? null : c.left;
    c = isNaN(c.width) ? 0 : c.width;
    return Math.min(null != a ? a + c : Infinity, Math.max(null != a ? a : -Infinity, b))
}
  , gh = function(a, b) {
    var c = a.o;
    a = isNaN(c.top) ? null : c.top;
    c = isNaN(c.height) ? 0 : c.height;
    return Math.min(null != a ? a + c : Infinity, Math.max(null != a ? a : -Infinity, b))
}
  , eh = function(a, b, c, d, e, f, h) {
    G.call(this, a);
    this.clientX = c;
    this.clientY = d;
    this.left = void 0 !== f ? f : b.deltaX;
    this.top = void 0 !== h ? h : b.deltaY
};
q(eh, G);
var jh = function(a) {
    this.Ua = new Map;
    var b = arguments.length;
    if (1 < b) {
        if (b % 2)
            throw Error("Uneven number of arguments");
        for (var c = 0; c < b; c += 2)
            this.set(arguments[c], arguments[c + 1])
    } else if (a)
        if (a instanceof jh)
            for (b = ha(a.Ua),
            c = b.next(); !c.done; c = b.next()) {
                var d = ha(c.value);
                c = d.next().value;
                d = d.next().value;
                this.Ua.set(c, d)
            }
        else if (a)
            for (b = ha(Object.entries(a)),
            c = b.next(); !c.done; c = b.next())
                d = ha(c.value),
                c = d.next().value,
                d = d.next().value,
                this.Ua.set(c, d)
};
jh.prototype.Ac = function() {
    return Array.from(this.Ua.values())
}
;
jh.prototype.get = function(a, b) {
    return this.Ua.has(a) ? this.Ua.get(a) : b
}
;
jh.prototype.set = function(a, b) {
    this.Ua.set(a, b);
    return this
}
;
jh.prototype.forEach = function(a, b) {
    var c = this;
    b = void 0 === b ? this : b;
    this.Ua.forEach(function(d, e) {
        return a.call(b, d, e, c)
    })
}
;
(function() {
    for (var a = ["ms", "moz", "webkit", "o"], b, c = 0; b = a[c] && !p.requestAnimationFrame; ++c)
        p.requestAnimationFrame = p[b + "RequestAnimationFrame"],
        p.cancelAnimationFrame = p[b + "CancelAnimationFrame"] || p[b + "CancelRequestAnimationFrame"];
    if (!p.requestAnimationFrame) {
        var d = 0;
        p.requestAnimationFrame = function(e) {
            var f = (new Date).getTime()
              , h = Math.max(0, 16 - (f - d));
            d = f + h;
            return p.setTimeout(function() {
                e(f + h)
            }, h)
        }
        ;
        p.cancelAnimationFrame || (p.cancelAnimationFrame = function(e) {
            clearTimeout(e)
        }
        )
    }
}
)();
var kh = [[], []]
  , lh = 0
  , mh = !1
  , nh = 0
  , ph = function(a, b) {
    var c = nh++
      , d = {
        Xd: {
            id: c,
            Gb: a.measure,
            context: b
        },
        Zd: {
            id: c,
            Gb: a.Yd,
            context: b
        },
        state: {},
        sa: void 0,
        ac: !1
    };
    return function() {
        0 < arguments.length ? (d.sa || (d.sa = []),
        d.sa.length = 0,
        d.sa.push.apply(d.sa, arguments),
        d.sa.push(d.state)) : d.sa && 0 != d.sa.length ? (d.sa[0] = d.state,
        d.sa.length = 1) : d.sa = [d.state];
        d.ac || (d.ac = !0,
        kh[lh].push(d));
        mh || (mh = !0,
        window.requestAnimationFrame(oh))
    }
}
  , oh = function() {
    mh = !1;
    var a = kh[lh]
      , b = a.length;
    lh = (lh + 1) % 2;
    for (var c, d = 0; d < b; ++d) {
        c = a[d];
        var e = c.Xd;
        c.ac = !1;
        e.Gb && e.Gb.apply(e.context, c.sa)
    }
    for (d = 0; d < b; ++d)
        c = a[d],
        e = c.Zd,
        c.ac = !1,
        e.Gb && e.Gb.apply(e.context, c.sa),
        c.state = {};
    a.length = 0
};
var qh = v ? Rb(Mb(new Lb(Jb,'javascript:""'))) : Rb(Mb(new Lb(Jb,"about:blank")));
v ? Rb(Mb(new Lb(Jb,'javascript:""'))) : Rb(Mb(new Lb(Jb,"javascript:undefined")));
var rh = function(a) {
    J.call(this);
    this.g = a;
    a = v ? "focusout" : "blur";
    this.j = bd(this.g, v ? "focusin" : "focus", this, !v);
    this.i = bd(this.g, a, this, !v)
};
q(rh, J);
rh.prototype.handleEvent = function(a) {
    var b = new H(a.i);
    b.type = "focusin" == a.type || "focus" == a.type ? "focusin" : "focusout";
    this.dispatchEvent(b)
}
;
rh.prototype.C = function() {
    rh.l.C.call(this);
    jd(this.j);
    jd(this.i);
    delete this.g
}
;
var sh = function(a, b) {
    this.i = a;
    this.j = b
};
var th = function(a, b) {
    P.call(this, b);
    this.Ad = !!a;
    this.B = null;
    this.qb = ph({
        Yd: this.fc
    }, this)
};
q(th, P);
g = th.prototype;
g.xc = null;
g.Pb = !1;
g.ta = null;
g.fa = null;
g.Ca = null;
g.sc = !1;
g.Bb = function() {
    return "goog-modalpopup"
}
;
g.Wb = function() {
    return this.ta
}
;
g.ra = function() {
    th.l.ra.call(this);
    var a = this.h();
    $d(a, t(this.Bb()).split(" "));
    Fc(a, !0);
    O(a, !1);
    uh(this);
    vh(this)
}
;
var uh = function(a) {
    if (a.Ad && !a.fa) {
        var b = a.g.F("IFRAME", {
            frameborder: 0,
            style: "border:0;vertical-align:bottom;"
        });
        b.src = (qh instanceof Pb && qh.constructor === Pb ? qh.g : "type_error:TrustedResourceUrl").toString();
        a.fa = b;
        a.fa.className = a.Bb() + "-bg";
        O(a.fa, !1);
        Be(a.fa, 0)
    }
    a.ta || (a.ta = a.g.F("DIV", a.Bb() + "-bg"),
    O(a.ta, !1))
}
  , vh = function(a) {
    a.Ca || (a.Ca = uc(a.g.g, "SPAN"),
    O(a.Ca, !1),
    Fc(a.Ca, !0),
    a.Ca.style.position = "absolute")
};
g = th.prototype;
g.md = function() {
    this.sc = !1
}
;
g.lb = function(a) {
    return !!a && "DIV" == a.tagName
}
;
g.ua = function(a) {
    th.l.ua.call(this, a);
    a = t(this.Bb()).split(" ");
    $d(this.h(), a);
    uh(this);
    vh(this);
    Fc(this.h(), !0);
    O(this.h(), !1)
}
;
g.O = function() {
    if (this.fa) {
        var a = this.h();
        a.parentNode && a.parentNode.insertBefore(this.fa, a)
    }
    a = this.h();
    a.parentNode && a.parentNode.insertBefore(this.ta, a);
    th.l.O.call(this);
    a = this.h();
    a.parentNode && a.parentNode.insertBefore(this.Ca, a.nextSibling);
    this.xc = new rh(this.g.g);
    Q(this).s(this.xc, "focusin", this.ce);
    wh(this, !1)
}
;
g.la = function() {
    this.isVisible() && this.Ma(!1);
    Mc(this.xc);
    th.l.la.call(this);
    yc(this.fa);
    yc(this.ta);
    yc(this.Ca)
}
;
g.Ma = function(a) {
    if (a != this.Pb)
        if (this.ba && this.ba.stop(),
        this.ka && this.ka.stop(),
        this.R && this.R.stop(),
        this.W && this.W.stop(),
        this.J && wh(this, a),
        a) {
            if (this.dispatchEvent("beforeshow")) {
                try {
                    this.B = this.g.g.activeElement
                } catch (e) {}
                this.fc();
                var b = rc(this.g.g) || window;
                if ("fixed" == oe(this.h()))
                    var c = a = 0;
                else
                    c = qc(this.g.g),
                    a = c.x,
                    c = c.y;
                var d = Ae(this.h());
                b = nc(b || window);
                a = Math.max(a + b.width / 2 - d.width / 2, 0);
                c = Math.max(c + b.height / 2 - d.height / 2, 0);
                qe(this.h(), a, c);
                qe(this.Ca, a, c);
                Q(this).s(pc(this.g.g), "resize", this.fc).s(pc(this.g.g), "orientationchange", this.qb);
                xh(this, !0);
                this.dd();
                this.Pb = !0;
                this.ba && this.ka ? (ad(this.ba, "end", this.ec, !1, this),
                this.ka.play(),
                this.ba.play()) : this.ec()
            }
        } else if (this.dispatchEvent("beforehide")) {
            Q(this).qa(pc(this.g.g), "resize", this.fc).qa(pc(this.g.g), "orientationchange", this.qb);
            this.Pb = !1;
            this.R && this.W ? (ad(this.R, "end", this.dc, !1, this),
            this.W.play(),
            this.R.play()) : this.dc();
            a: {
                try {
                    c = this.g;
                    d = c.g.body;
                    b = c.g.activeElement || d;
                    if (!this.B || this.B == d) {
                        this.B = null;
                        break a
                    }
                    (b == d || c.td(this.h(), b)) && this.B.focus()
                } catch (e) {}
                this.B = null
            }
        }
}
;
var wh = function(a, b) {
    a.Ga || (a.Ga = new sh(a.j,a.g));
    a = a.Ga;
    if (b) {
        a.g || (a.g = []);
        b = a.j.Bd(a.j.g.body);
        for (var c = 0; c < b.length; c++) {
            var d = b[c], e;
            if (e = d != a.i)
                e = d.getAttribute("aria-hidden"),
                e = !(null == e || void 0 == e ? 0 : String(e));
            e && (R(d, "hidden", !0),
            a.g.push(d))
        }
    } else if (a.g) {
        for (c = 0; c < a.g.length; c++)
            a.g[c].removeAttribute("aria-hidden");
        a.g = null
    }
}
  , xh = function(a, b) {
    a.fa && O(a.fa, b);
    a.ta && O(a.ta, b);
    O(a.h(), b);
    O(a.Ca, b)
};
g = th.prototype;
g.ec = function() {
    this.dispatchEvent("show")
}
;
g.dc = function() {
    xh(this, !1);
    this.dispatchEvent("hide")
}
;
g.isVisible = function() {
    return this.Pb
}
;
g.fc = function() {
    this.fa && O(this.fa, !1);
    this.ta && O(this.ta, !1);
    var a = this.g.g
      , b = nc(rc(a) || window || window)
      , c = Math.max(b.width, Math.max(a.body.scrollWidth, a.documentElement.scrollWidth));
    a = Math.max(b.height, Math.max(a.body.scrollHeight, a.documentElement.scrollHeight));
    this.fa && (O(this.fa, !0),
    ye(this.fa, c, a));
    this.ta && (O(this.ta, !0),
    ye(this.ta, c, a))
}
;
g.ce = function(a) {
    this.sc ? this.md() : a.target == this.Ca && md(this.dd, 0, this)
}
;
g.dd = function() {
    try {
        v && this.g.g.body.focus(),
        this.h().focus()
    } catch (a) {}
}
;
g.C = function() {
    Mc(this.ba);
    this.ba = null;
    Mc(this.R);
    this.R = null;
    Mc(this.ka);
    this.ka = null;
    Mc(this.W);
    this.W = null;
    th.l.C.call(this)
}
;
var Y = function(a, b, c) {
    th.call(this, b, c);
    this.o = a || "modal-dialog";
    this.i = X(X(new yh, zh, !0), Ah, !1, !0)
};
q(Y, th);
g = Y.prototype;
g.ld = !0;
g.Rb = .5;
g.Pc = "";
g.Cb = null;
g.Na = null;
g.oa = null;
g.pa = null;
g.Kb = null;
g.na = null;
g.za = null;
g.da = null;
g.Bb = function() {
    return this.o
}
;
g.xb = function() {
    this.h() || xf(this);
    return this.za
}
;
g.Wb = function() {
    this.h() || xf(this);
    return Y.l.Wb.call(this)
}
;
var Bh = function(a, b) {
    a.Rb = b;
    a.h() && (b = a.Wb()) && Be(b, a.Rb)
};
Y.prototype.wd = function() {}
;
var Ch = function(a, b) {
    var c = t(a.o + "-title-draggable").split(" ");
    a.h() && (b ? $d(a.oa, c) : be(a.oa, c));
    b && !a.Na ? (b = new ch(a.h(),a.oa),
    a.Na = b,
    $d(a.oa, c),
    bd(a.Na, "start", a.he, !1, a),
    bd(a.Na, "drag", a.wd, !1, a)) : !b && a.Na && (a.Na.S(),
    a.Na = null)
};
g = Y.prototype;
g.ra = function() {
    Y.l.ra.call(this);
    var a = this.h()
      , b = this.g;
    this.Kb = vf(this);
    var c = vf(this) + ".contentEl";
    this.oa = b.F("DIV", this.o + "-title", this.pa = b.F("SPAN", {
        className: this.o + "-title-text",
        id: this.Kb
    }, this.Pc), this.na = b.F("SPAN", this.o + "-title-close"));
    wc(a, this.oa, this.za = b.F("DIV", {
        className: this.o + "-content",
        id: c
    }), this.da = b.F("DIV", this.o + "-buttons"));
    Gf(this.pa, "heading");
    Gf(this.na, "button");
    Fc(this.na, !0);
    R(this.na, "label", "Close");
    Gf(a, "dialog");
    R(a, "labelledby", this.Kb || "");
    this.Cb && cc(this.za, this.Cb);
    O(this.na, !0);
    this.i && (a = this.i,
    a.g = this.da,
    Dh(a));
    O(this.da, !!this.i);
    Bh(this, this.Rb)
}
;
g.ua = function(a) {
    Y.l.ua.call(this, a);
    a = this.h();
    var b = this.o + "-content";
    this.za = kc(document, null, b, a)[0];
    this.za || (this.za = this.g.F("DIV", b),
    this.Cb && cc(this.za, this.Cb),
    a.appendChild(this.za));
    b = this.o + "-title";
    var c = this.o + "-title-text"
      , d = this.o + "-title-close";
    (this.oa = kc(document, null, b, a)[0]) ? (this.pa = kc(document, null, c, this.oa)[0],
    this.na = kc(document, null, d, this.oa)[0]) : (this.oa = this.g.F("DIV", b),
    a.insertBefore(this.oa, this.za));
    this.pa ? (this.Pc = Jc(this.pa),
    this.pa.id || (this.pa.id = vf(this))) : (this.pa = tc("SPAN", {
        className: c,
        id: vf(this)
    }),
    this.oa.appendChild(this.pa));
    this.Kb = this.pa.id;
    R(a, "labelledby", this.Kb || "");
    this.na || (this.na = this.g.F("SPAN", d),
    this.oa.appendChild(this.na));
    O(this.na, !0);
    b = this.o + "-buttons";
    if (this.da = kc(document, null, b, a)[0]) {
        if (a = this.i = new yh(this.g),
        (b = this.da) && 1 == b.nodeType) {
            a.g = b;
            b = (a.g || document).getElementsByTagName("BUTTON");
            c = 0;
            for (var e, f; d = b[c]; c++)
                if (e = d.name || d.id,
                f = Jc(d) || d.value,
                e) {
                    var h = 0 == c;
                    a.set(e, f, h, "cancel" == d.name);
                    h && L(d, "goog-buttonset-default")
                }
        }
    } else
        this.da = this.g.F("DIV", b),
        a.appendChild(this.da),
        this.i && (a = this.i,
        a.g = this.da,
        Dh(a)),
        O(this.da, !!this.i);
    Bh(this, this.Rb)
}
;
g.O = function() {
    Y.l.O.call(this);
    Q(this).s(this.h(), "keydown", this.cb).s(this.h(), "keypress", this.cb);
    Q(this).s(this.da, "click", this.yd);
    Ch(this, !0);
    Q(this).s(this.na, "click", this.ge);
    var a = this.h();
    Gf(a, "dialog");
    "" !== this.pa.id && R(a, "labelledby", this.pa.id);
    if (!this.ld) {
        this.ld = !1;
        if (this.J) {
            a = this.g;
            var b = this.Wb();
            a.Sc(this.fa);
            a.Sc(b)
        }
        this.isVisible() && wh(this, !1)
    }
}
;
g.la = function() {
    this.isVisible() && this.Ma(!1);
    Ch(this, !1);
    Y.l.la.call(this)
}
;
g.Ma = function(a) {
    a != this.isVisible() && (this.J || xf(this),
    Y.l.Ma.call(this, a))
}
;
g.ec = function() {
    Y.l.ec.call(this);
    this.dispatchEvent("aftershow")
}
;
g.dc = function() {
    Y.l.dc.call(this);
    this.dispatchEvent("afterhide")
}
;
g.he = function() {
    var a = this.g.g
      , b = nc(rc(a) || window || window)
      , c = Math.max(a.body.scrollWidth, b.width);
    a = Math.max(a.body.scrollHeight, b.height);
    var d = Ae(this.h());
    "fixed" == oe(this.h()) ? dh(this.Na, new N(0,0,Math.max(0, b.width - d.width),Math.max(0, b.height - d.height))) : dh(this.Na, new N(0,0,c - d.width,a - d.height))
}
;
g.ge = function() {
    Eh(this)
}
;
var Eh = function(a) {
    var b = a.i
      , c = b && b.j;
    c ? (b = b.get(c),
    a.dispatchEvent(new Fh(c,b)) && a.Ma(!1)) : a.Ma(!1)
};
Y.prototype.C = function() {
    this.da = this.na = null;
    Y.l.C.call(this)
}
;
Y.prototype.yd = function(a) {
    a: {
        for (a = a.target; null != a && a != this.da; ) {
            if ("BUTTON" == a.tagName)
                break a;
            a = a.parentNode
        }
        a = null
    }
    if (a && !a.disabled) {
        a = a.name;
        var b = this.i.get(a);
        this.dispatchEvent(new Fh(a,b)) && this.Ma(!1)
    }
}
;
Y.prototype.cb = function(a) {
    var b = !1
      , c = !1
      , d = this.i
      , e = a.target;
    if ("keydown" == a.type)
        if (27 == a.g) {
            var f = d && d.j;
            e = "SELECT" == e.tagName && !e.disabled;
            f && !e ? (c = !0,
            b = d.get(f),
            b = this.dispatchEvent(new Fh(f,b))) : e || (b = !0)
        } else {
            if (9 == a.g && a.shiftKey && e == this.h()) {
                this.sc = !0;
                try {
                    this.Ca.focus()
                } catch (n) {}
                md(this.md, 0, this)
            }
        }
    else if (13 == a.g) {
        if ("BUTTON" == e.tagName && !e.disabled)
            f = e.name;
        else if (e == this.na)
            Eh(this);
        else if (d) {
            var h = d.i, k;
            if (k = h)
                a: {
                    k = (d.g || document).getElementsByTagName("BUTTON");
                    for (var l = 0, m; m = k[l]; l++)
                        if (m.name == h || m.id == h) {
                            k = m;
                            break a
                        }
                    k = null
                }
            e = ("TEXTAREA" == e.tagName || "SELECT" == e.tagName || "A" == e.tagName) && !e.disabled;
            !k || k.disabled || e || (f = h)
        }
        f && d && (c = !0,
        b = this.dispatchEvent(new Fh(f,String(d.get(f)))))
    } else
        e != this.na || 32 != a.g && " " != a.key || Eh(this);
    if (b || c)
        a.A(),
        a.j();
    b && this.Ma(!1)
}
;
var Fh = function(a, b) {
    this.type = "dialogselect";
    this.key = a;
    this.caption = b
};
q(Fh, G);
var yh = function(a) {
    jh.call(this);
    a || ic();
    this.j = this.g = this.i = null
};
q(yh, jh);
yh.prototype.set = function(a, b, c, d) {
    jh.prototype.set.call(this, a, b);
    c && (this.i = a);
    d && (this.j = a);
    return this
}
;
var X = function(a, b, c, d) {
    return a.set(b.key, b.caption, c, d)
}
  , Dh = function(a) {
    if (a.g) {
        cc(a.g, ac);
        var b = ic(a.g);
        a.forEach(function(c, d) {
            c = b.F("BUTTON", {
                name: d
            }, c);
            d == this.i && (c.className = "goog-buttonset-default");
            this.g.appendChild(c)
        }, a)
    }
};
yh.prototype.h = function() {
    return this.g
}
;
var zh = {
    key: "ok",
    caption: "OK"
}
  , Ah = {
    key: "cancel",
    caption: "Cancel"
}
  , Gh = {
    key: "yes",
    caption: "Yes"
}
  , Hh = {
    key: "no",
    caption: "No"
}
  , Ih = {
    key: "save",
    caption: "Save"
}
  , Jh = {
    key: "continue",
    caption: "Continue"
};
"undefined" != typeof document && (X(new yh, zh, !0, !0),
X(X(new yh, zh, !0), Ah, !1, !0),
X(X(new yh, Gh, !0), Hh, !1, !0),
X(X(X(new yh, Gh), Hh, !0), Ah, !1, !0),
X(X(X(new yh, Jh), Ih), Ah, !0, !0));
var Kh = function(a, b, c, d) {
    P.call(this, d);
    this.R = c;
    this.o = a;
    this.eb(a);
    this.B = b;
    this.eb(b);
    this.i = null
};
q(Kh, P);
g = Kh.prototype;
g.ib = null;
g.ia = null;
g.vb = null;
g.Ib = 5;
g.gd = null;
g.nd = null;
g.wc = null;
g.Ia = null;
g.ra = function() {
    var a = this.g
      , b = a.F("DIV", "goog-splitpane-first-container")
      , c = a.F("DIV", "goog-splitpane-second-container")
      , d = a.F("DIV", "goog-splitpane-handle");
    this.j = a.F("DIV", "goog-splitpane", b, c, d);
    this.ia = b;
    this.vb = c;
    this.i = d;
    Lh(this);
    Mh(this)
}
;
g.lb = function(a) {
    var b = Nh(a, "goog-splitpane-first-container");
    if (!b)
        return !1;
    this.ia = b;
    b = Nh(a, "goog-splitpane-second-container");
    if (!b)
        return !1;
    this.vb = b;
    a = Nh(a, "goog-splitpane-handle");
    if (!a)
        return !1;
    this.i = a;
    return !0
}
;
var Nh = function(a, b) {
    for (var c = zc(a), d = 0; d < c.length; d++) {
        var e = c[d];
        if (Zd(e, b))
            return e
    }
    return kc(document, null, b, a)[0]
};
Kh.prototype.ua = function(a) {
    Kh.l.ua.call(this, a);
    Lh(this);
    a = Fe(a);
    Oh(this, new B(a.width,a.height));
    Mh(this)
}
;
var Mh = function(a) {
    a.o.h() || a.o.ra();
    var b = a.o.h();
    a.ia.appendChild(b);
    a.B.h() || a.B.ra();
    b = a.B.h();
    a.vb.appendChild(b);
    a.ib = new ch(a.i,a.i);
    a.ia.style.position = "absolute";
    a.vb.style.position = "absolute";
    a = a.i.style;
    a.position = "absolute";
    a.overflow = "hidden";
    a.zIndex = 2
};
Kh.prototype.O = function() {
    Kh.l.O.call(this);
    var a = this.h();
    "static" == oe(a) && (a.style.position = "relative");
    Q(this).s(this.i, "dblclick", this.Id).s(this.ib, "start", this.Kd).s(this.ib, "drag", this.Ld).s(this.ib, "end", this.Jd);
    Ph(this, this.gd)
}
;
var Qh = function(a) {
    return "vertical" == a.R
}
  , Lh = function(a) {
    Qh(a) ? (a.i.style.height = a.Ib + "px",
    L(a.i, "goog-splitpane-handle-vertical")) : (a.i.style.width = a.Ib + "px",
    L(a.i, "goog-splitpane-handle-horizontal"))
}
  , Rh = function(a, b) {
    qe(a, b.left, b.top);
    Ke(a, new B(Math.max(b.width, 0),Math.max(b.height, 0)))
}
  , Ph = function(a, b) {
    Sh(a, Fe(a.h()), b)
}
  , Sh = function(a, b, c) {
    var d = Qh(a);
    c = "number" === typeof c ? c : "number" === typeof a.wc ? a.wc : Math.floor((d ? b.height : b.width) / 2);
    a.wc = c;
    if (d) {
        var e = d = b.width;
        var f = a.Ib;
        var h = b.height - c - f;
        var k = b.width;
        var l = 0 + c;
        var m = 0;
        var n = l + f;
        b = 0
    } else
        d = c,
        c = b.height,
        e = a.Ib,
        f = b.height,
        k = b.width - d - e,
        h = b.height,
        m = 0 + d,
        l = 0,
        b = m + e,
        n = 0;
    Rh(a.ia, new N(0,0,d,c));
    "function" == typeof a.o.resize && a.o.resize(new B(d,c));
    Rh(a.i, new N(m,l,e,f));
    Rh(a.vb, new N(b,n,k,h));
    "function" == typeof a.B.resize && a.B.resize(new B(k,h));
    a.dispatchEvent("change")
}
  , Oh = function(a, b) {
    var c = a.h();
    Ke(c, b);
    a.Ia && Ke(a.Ia, b);
    Sh(a, b)
};
g = Kh.prototype;
g.Kd = function() {
    this.Ia || (this.Ia = this.g.F("DIV", {
        style: "position: relative"
    }),
    this.h().appendChild(this.Ia));
    this.Ia.style.zIndex = 1;
    var a = Fe(this.h());
    Ke(this.Ia, a);
    var b = re(this.ia)
      , c = a = 0
      , d = b.x;
    b = b.y;
    var e = Fe(this.ia)
      , f = Je(this.ia)
      , h = Je(this.vb);
    Qh(this) ? (c = f.height + h.height,
    b += e.height - f.height) : (a = f.width + h.width,
    d += e.width - f.width);
    dh(this.ib, new N(d,b,a,c))
}
;
g.Ld = function(a) {
    Qh(this) ? Ph(this, a.top - re(this.ia).y) : Ph(this, a.left - re(this.ia).x);
    this.dispatchEvent("handle_drag")
}
;
g.Jd = function() {
    this.Ia.style.zIndex = -1;
    this.dispatchEvent("handle_drag_end")
}
;
g.Id = function() {
    var a = this.ia;
    var b = xe(this.i);
    a = xe(a);
    a = new A(b.x - a.x,b.y - a.y);
    var c = Fe(this.ia)
      , d = Je(this.ia);
    (b = Qh(this)) ? (c = c.height - d.height,
    a = a.y) : (c = c.width - d.width,
    a = a.x);
    c == a ? Ph(this, this.nd) : (this.nd = b ? Fe(this.ia).height : Fe(this.ia).width,
    Ph(this, c));
    this.dispatchEvent("handle_snap")
}
;
g.C = function() {
    Mc(this.ib);
    this.ib = null;
    yc(this.Ia);
    this.Ia = null;
    Kh.l.C.call(this)
}
;
var Th = function() {};
q(Th, Xf);
sa(Th);
g = Th.prototype;
g.V = function() {
    return "goog-tab"
}
;
g.mb = function() {
    return "tab"
}
;
g.Ea = function(a) {
    var b = Th.l.Ea.call(this, a);
    (a = a.Oa()) && this.Wa(b, a);
    return b
}
;
g.wa = function(a, b) {
    b = Th.l.wa.call(this, a, b);
    var c = this.Oa(b);
    c && a.ic(c);
    a.L & 8 && (c = a.N()) && "function" === typeof c.wb && (kg(a, 8, !1),
    c.wb(a));
    return b
}
;
g.Oa = function(a) {
    return a.title || ""
}
;
g.Wa = function(a, b) {
    a && (a.title = b || "")
}
;
var Uh = function(a, b, c) {
    U.call(this, a, b || Th.va(), c);
    this.ea(8, !0);
    this.jb |= 9
};
q(Uh, U);
Uh.prototype.Oa = function() {
    return this.W
}
;
Uh.prototype.Wa = function(a) {
    this.i.Wa(this.h(), a);
    this.ic(a)
}
;
Uh.prototype.ic = function(a) {
    this.W = a
}
;
Of("goog-tab", function() {
    return new Uh(null)
});
var Vh = function() {
    this.o = "tablist"
};
q(Vh, Rf);
sa(Vh);
Vh.prototype.g = function() {
    return "goog-tab-bar"
}
;
Vh.prototype.B = function(a, b, c) {
    this.N || (this.j || Wh(this),
    this.N = Vb(this.j));
    var d = this.N[b];
    d ? (Wf(a, Xh(d)),
    a.i = d) : Vh.l.B.call(this, a, b, c)
}
;
Vh.prototype.v = function(a) {
    var b = Vh.l.v.call(this, a);
    this.j || Wh(this);
    b.push(this.j[a.i]);
    return b
}
;
var Wh = function(a) {
    var b = a.g();
    a.j = {
        top: b + "-top",
        bottom: b + "-bottom",
        start: b + "-start",
        end: b + "-end"
    }
};
var Zh = function(a, b, c) {
    a = a || "top";
    Wf(this, Xh(a));
    this.i = a;
    V.call(this, this.Ta, b || Vh.va(), c);
    Yh(this)
};
q(Zh, V);
g = Zh.prototype;
g.ya = null;
g.O = function() {
    Zh.l.O.call(this);
    Yh(this)
}
;
g.C = function() {
    Zh.l.C.call(this);
    this.ya = null
}
;
g.Nc = function(a) {
    Zh.l.Nc.call(this, a);
    this.wb(Bf(this, a))
}
;
g.wb = function(a) {
    a ? lg(a, !0) : this.ya && lg(this.ya, !1)
}
;
var $h = function(a, b) {
    if (b && b == a.ya) {
        for (var c = Df(a, b), d = c - 1; b = Bf(a, d); d--) {
            var e = b;
            if (e.isVisible() && e.isEnabled()) {
                a.wb(b);
                return
            }
        }
        for (c += 1; b = Bf(a, c); c++)
            if (d = b,
            d.isVisible() && d.isEnabled()) {
                a.wb(b);
                return
            }
        a.wb(null)
    }
};
g = Zh.prototype;
g.Td = function(a) {
    this.ya && this.ya != a.target && lg(this.ya, !1);
    this.ya = a.target
}
;
g.Ud = function(a) {
    a.target == this.ya && (this.ya = null)
}
;
g.Rd = function(a) {
    $h(this, a.target)
}
;
g.Sd = function(a) {
    $h(this, a.target)
}
;
g.mc = function() {
    vg(this) || this.Ba(Df(this, this.ya || Bf(this, 0)))
}
;
var Yh = function(a) {
    Q(a).s(a, "select", a.Td).s(a, "unselect", a.Ud).s(a, "disable", a.Rd).s(a, "hide", a.Sd)
}
  , Xh = function(a) {
    return "start" == a || "end" == a ? "vertical" : "horizontal"
};
Of("goog-tab-bar", function() {
    return new Zh
});
var ai = function(a, b, c) {
    Xg.call(this, a, b || Yg.va(), c);
    this.ea(16, !0)
};
q(ai, Xg);
Of("goog-toggle-button", function() {
    return new ai(null)
});
var bi = function(a) {
    var b = Pf(a);
    b && yf(b, a);
    return b
};
/*

 SPDX-License-Identifier: Apache-2.0
*/
function ci(a) {
    a = null === a ? "null" : void 0 === a ? "undefined" : a;
    var b = Ob();
    a = b ? b.createHTML(a) : a;
    return new Zb(a,Yb)
}
;var Z = function(a) {
    F.call(this);
    this.g = a;
    this.j = new M(this);
    var b = new Kh(new P,new P,"horizontal");
    b.gd = 600;
    b.Ib = 10;
    yf(b, this.g.h("splitpane-container"));
    Oh(b, new B(800,600));
    this.j.s(b, "change", this.Qb);
    this.ca = b;
    var c = [{
        caption: "Closure Library",
        data: "/closure/goog/base.js"
    }, {
        caption: "Chrome Frame",
        data: " http://ajax.googleapis.com/ajax/libs/chrome-frame/1.0.2/CFInstall.js"
    }, {
        caption: "Dojo",
        data: "http://ajax.googleapis.com/ajax/libs/dojo/1.7.2/dojo/dojo.js.uncompressed.js"
    }, {
        caption: "Ext Core",
        data: "http://ajax.googleapis.com/ajax/libs/ext-core/3.1.0/ext-core-debug.js"
    }, {
        caption: "jQuery",
        data: "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js"
    }, {
        caption: "jQuery UI",
        data: "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.js"
    }, {
        caption: "MooTools",
        data: "http://ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools.js"
    }, {
        caption: "Prototype",
        data: "http://ajax.googleapis.com/ajax/libs/prototype/1.7.0.0/prototype.js"
    }, {
        caption: "script.aculo.us",
        data: "http://ajax.googleapis.com/ajax/libs/scriptaculous/1.9.0/scriptaculous.js"
    }, {
        caption: "SWFObject",
        data: "http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject_src.js"
    }, {
        caption: "Yahoo! User Interface Library (YUI)",
        data: "http://ajax.googleapis.com/ajax/libs/yui/3.3.0/build/yui/yui.js"
    }, {
        caption: "WebFont Loader",
        data: "http://ajax.googleapis.com/ajax/libs/webfont/1.0.28/webfont_debug.js"
    }];
    b = new Ng;
    b.rd = !0;
    for (var d = this.g, e = 0; e < c.length; ++e) {
        var f = c[e]
          , h = b;
        f = new Ug(f.caption,f.data,d);
        h.H.eb(f, !0);
        h.Lb = -1
    }
    b.uc = "http://";
    b.X && (c = b.X,
    e = b.uc,
    h = c.h(),
    If() ? (h && (h.placeholder = e),
    c.i = e) : Lf(c) || (h && (h.value = ""),
    c.i = e,
    c.R()),
    h && R(h, "label", c.i));
    c = d.h("library-list");
    xf(b, c);
    this.j.s(b, "action", this.Ga);
    this.B = bi(d.h("add-url"));
    this.j.s(this.B, "action", this.W);
    this.o = b;
    b = this.g;
    d = this.j;
    d.s(b.h("whitespace_only"), "click", this.D);
    d.s(b.h("simple_optimizations"), "click", this.D);
    d.s(b.h("advanced_optimizations"), "click", this.D);
    d.s(b.h("pretty_print"), "click", this.R);
    d.s(b.h("print_input_delimiter"), "click", this.R);
    d.s(b.h("reset"), "click", this.cb);
    d.s(b.h("compileForm"), "submit", this.qb);
    b = bi(this.g.h("compile"));
    this.j.s(b, "action", this.bb);
    this.ba = b;
    b = new Zh;
    yf(b, this.g.h("tabs"));
    this.j.s(b, "select", this.Eb);
    this.ga = b;
    this.A = CodeMirror.fromTextArea(this.g.h("source-code"), {
        tabSize: 2,
        autofocus: !0
    });
    this.i = new Md(this.A,new Rd(this.g));
    this.j.s(pc(a.g), "resize", this.N);
    this.N()
};
oa(Z, F);
Z.prototype.Qb = function() {
    Ae(this.g.h("input-controls"))
}
;
Z.prototype.Ga = function(a) {
    var b = this.o;
    Qg(b, a.item.getValue());
    b.gb();
    return !1
}
;
Z.prototype.W = function() {
    di(this)
}
;
var di = function(a) {
    var b = a.o.getValue();
    /^[\s\xa0]*$/.test(b) || ("/closure/goog/base.js" == b ? Pd(a.i, "use_closure_library", "true", !1) : (b = t(b),
    Pd(a.i, "code_url", b, !0)),
    Qg(a.o, ""))
};
Z.prototype.qb = function(a) {
    a.j();
    di(this);
    this.o.gb()
}
;
Z.prototype.D = function(a) {
    Pd(this.i, "compilation_level", a.target.value)
}
;
Z.prototype.R = function(a) {
    var b = this.i
      , c = a.target.id;
    a = a.target.checked;
    var d = K(b, "formatting");
    d = null == d ? [] : d.split(",");
    d.forEach(t);
    a ? Ha(d, c) || d.push(c) : Ia(d, c);
    Pd(b, "formatting", d.join())
}
;
Z.prototype.cb = function() {
    this.i.reset();
    this.A.focus()
}
;
var ei = function(a) {
    var b = window.location.hash;
    b && (b = decodeURIComponent(b.substring(1)),
    (b = (new Td(b)).get("code")) && a.A.setValue(b))
};
Z.prototype.bb = function() {
    var a = new Td;
    a.set("code", this.A.getValue());
    window.location.hash = "#" + encodeURIComponent(a.toString());
    fi(this, "Compiling...", "status-waiting");
    gi(this);
    this.v = null;
    hi(this, null);
    a = new Id;
    var b = this.i;
    var c = Nd(b);
    c.lines.splice(c.start, c.end - c.start + 1);
    c = t(c.lines.join("\n"));
    null != c && (a.hd = c);
    c = K(b, "compilation_level");
    null != c && (a.tc = c);
    c = K(b, "warning_level");
    a.Rc = c;
    c = K(b, "code_url", !0);
    null != c && (a.g = c);
    c = K(b, "js_externs", !0);
    null != c && (a.j = c);
    c = K(b, "externs_url", !0);
    null != c && (a.i = c);
    c = K(b, "formatting");
    null != c && (a.yc = c);
    c = K(b, "exclude_default_externs");
    a.cd = "true" == c;
    c = K(b, "output_file_name");
    a.v = c;
    c = "true" == K(b, "use_closure_library");
    a.qd = c;
    c = "true" == K(b, "debug");
    a.ad = c;
    c = K(b, "language");
    a.Ic = c;
    c = K(b, "language_out");
    a.Hc = c;
    c = "true" == K(b, "use_types_for_optimization");
    a.Qc = c;
    c = "true" == K(b, "angular_pass");
    a.rc = c;
    K(b, "generate_exports");
    K(b, "disable_property_renaming");
    b = "true" == K(b, "rewrite_polyfills");
    a.Mc = b;
    c = Aa(this.ka, this, a);
    b = "output_format=json&output_info=compiled_code&output_info=warnings&output_info=errors&output_info=statistics&compilation_level=" + D(a.tc) + "&warning_level=" + D(Jd(a));
    if (a.yc) {
        var d = a.yc.split(",");
        d.forEach(t);
        for (var e = 0; e < d.length; ++e)
            b += "&formatting=" + D(d[e])
    }
    a.qd && (b += "&use_closure_library=true");
    a.ad && (b += "&debug=true");
    a.Ic && (b += "&language=" + D(a.Ic));
    a.Hc && (b += "&language_out=" + D(a.Hc));
    a.Qc && (b += "&use_types_for_optimization=" + D(a.Qc));
    a.rc && (b += "&angular_pass=" + D(a.rc));
    a.Mc && (b += "&rewrite_polyfills=" + D(a.Mc));
    a.v && (b += "&output_file_name=" + D(a.v));
    a.cd && (b += "&exclude_default_externs=true");
    for (e = 0; e < a.i.length; ++e)
        b += "&externs_url=" + D(a.i[e]);
    for (e = 0; e < a.j.length; ++e)
        b += "&js_externs=" + D(a.j[e]);
    for (e = 0; e < a.g.length; ++e)
        b += "&code_url=" + D(a.g[e]);
    b += "&js_code=" + D(a.hd);
    a.A = b;
    a = Ba(Kd, c);
    c = new vd;
    yd.push(c);
    a && c.s("complete", a);
    c.Jc("ready", c.bb);
    c.A = 4E4;
    Cd(c, b)
}
;
Z.prototype.Eb = function(a) {
    a = vf(a.target);
    this.v && hi(this, a)
}
;
var hi = function(a, b) {
    var c = ""
      , d = "&nbsp;";
    if ("compiled-code" == b) {
        b = a.v;
        var e = b.i;
        e ? d = ii(e) : c = b.g ? "<b>No compiled code because there were errors.</b>" : b.j ? "<b>No compiled code because there were warnings.</b>" : '<b>Your code compiled to down to 0 bytes. Perhaps you should export some functions? <a href="http://code.google.com/closure/compiler/docs/api-tutorial3.html#export" target="_blank">Learn more</a></b>'
    } else if ("warnings" == b)
        if (b = [],
        e = a.v.j) {
            c = "<b>Number of warnings: " + e.length + "</b>";
            d = 0;
            for (var f = e.length; d < f; ++d)
                b.push(ji(e[d], !1));
            d = b.join("<br>")
        } else
            c = "<b>No warnings</b>";
    else if ("errors" == b)
        if (b = [],
        e = a.v.g) {
            c = "<b>Number of errors: " + e.length + "</b>";
            d = 0;
            for (f = e.length; d < f; ++d)
                b.push(ji(e[d], !0));
            d = b.join("<br>")
        } else
            c = "<b>No errors</b>";
    else if ("post-data" == b) {
        d = "";
        c = 'Below is the POST data that was used to make the REST request to the Closure Compiler web service. The documentation for the <a target="_blank" href="http://code.google.com/closure/compiler/docs/api-ref.html">REST API</a> explains how to use the Closure Compiler programmatically.';
        b = a.v.Da.A.split("&");
        e = [];
        for (f = 0; f < b.length; ++f) {
            var h = b[f].split("=")
              , k = e
              , l = k.push
              , m = '<span class="kwd">' + fc(h[0]) + '</span><span class="pun">=</span>';
            h = h[1];
            h = fc(h);
            ki && (h = ke(h, 60));
            l.call(k, m + h + "<br>")
        }
        d += '<code class="prettyprint">' + e.join('<span class="pun">&amp;</span>') + "</code>"
    }
    a = a.g;
    b = jc(a.g, "output-heading");
    c = ci("<p>" + c + "</p>");
    cc(b, c);
    c = jc(a.g, "output-html");
    a = ci(d);
    cc(c, a)
}
  , ii = function(a) {
    function b(h) {
        var k = e
          , l = k.push;
        h = fc(h);
        h = ke(h, 40);
        l.call(k, '<code class="prettyprint lang-js">' + h + "</code>")
    }
    for (var c = a.length, d = 0, e = []; d < c; ) {
        var f = a.indexOf("\n", d + 2E3);
        if (0 > f) {
            b(a.substring(d, c));
            break
        } else
            b(a.substring(d, f)),
            d = f
    }
    return e.join("")
};
Z.prototype.ka = function(a, b) {
    b = new Ld(b,a);
    gi(this, b);
    var c = b.v;
    if (c) {
        b = new Y;
        var d = '<textarea onclick="this.focus();this.select()" rows="15" cols="60">\n';
        b.Pc = "Error";
        b.pa && Cc(b.pa, "Error");
        for (var e = 0, f = c.length; e < f; ++e) {
            var h = c[e];
            d += h.code + ": " + h.error + "\n"
        }
        d = d + "Original Post Data: \n" + (fc(a.A) + "\n");
        d = ci(d + "</textarea>");
        b.Cb = d;
        b.za && cc(b.za, d);
        d = X(new yh, zh, !0, !0);
        b.i = d;
        b.da && (b.i ? (d = b.i,
        d.g = b.da,
        Dh(d)) : cc(b.da, ac),
        O(b.da, !!b.i));
        b.Ma(!0);
        fi(this, "Compilation failed.", "status-failure")
    } else {
        var k = b.B
          , l = b.o
          , m = b.D
          , n = b.A;
        f = b.j;
        h = b.g;
        e = !b.j && !b.g || !!b.i;
        a = li(m) + " gzipped (" + li(k) + " uncompressed)";
        c = li(n) + " gzipped (" + li(l) + " uncompressed)";
        l = "Saved " + (0 < m ? (100 * (1 - n / m)).toFixed(2) : 0) + "% off the gzipped size (" + (0 < k ? (100 * (1 - l / k)).toFixed(2) : 0) + "% without gzip)";
        e ? (k = "Compilation was a success!",
        f = f || h ? "status-has-warnings" : "status-success") : (k = "Compilation did not complete successfully. See " + (h ? "errors" : "warnings") + " pane for details.",
        f = "status-failure");
        (h = b.N) && e && (d = h.substring(h.lastIndexOf("/") + 1),
        d = 'The code may also be accessed at <a href="' + fc(h) + '">' + fc(d) + "</a>.");
        fi(this, k, f, d, a, c, l);
        this.v = b;
        b = vf(this.ga.ya);
        this.v && hi(this, b)
    }
}
;
var ji = function(a, b) {
    var c = a.line
      , d = a.charno;
    b = a.type + ": " + a[b ? "error" : "warning"] + " at line " + a.lineno;
    b = fc(0 > d ? b + (" beyond character " + -1 * d) : b + (" character " + d));
    if ((a = a.file) && !Ma(a, "Input_")) {
        var e = a.lastIndexOf("/");
        b += ' in <a href="' + (gf ? "view-source:" : "") + fc(a) + '" target="_blank">' + fc(a.substring(e + 1)) + "</a>"
    }
    c ? (a = c.length,
    80 < a ? 77 > d ? (c = c.substring(0, 77) + "...",
    a = 0) : d > a - 40 - 3 ? (c = "..." + c.substring(a - 77, a),
    a -= 80) : (c = "..." + c.substring(d - 37, d + 37) + "...",
    a = d - 40) : a = 0,
    a = [c, a],
    c = a[1],
    a = fc(a[0]),
    b = b + ("<br>" + a + "<br>") + (gc(" ", d - c) + "^")) : b += "<br>";
    return b
}
  , li = function(a) {
    var b = a;
    a = b;
    var c = ""
      , d = 1;
    0 > b && (b = -b);
    if (Infinity === b)
        a = (Infinity * Math.sign(a)).toString();
    else {
        for (var e = 0; e < fe.length; e++) {
            var f = fe[e];
            d = ge[f];
            if (b >= d || 1 >= d && b > .1 * d) {
                c = f;
                break
            }
        }
        c ? c += "B" : d = 1;
        b = Math.pow(10, 2);
        a = Math.round(a / d * b) / b + "" + c
    }
    /\d$/.test(a) && (a += " bytes");
    return a
}
  , fi = function(a, b, c, d, e, f, h) {
    a = a.g;
    var k = a.h("compile-status-message");
    k.className = c;
    a.Ra(k, b);
    b = jc(a.g, "output-file-link");
    d = ci(d || "&nbsp;");
    cc(b, d);
    a.Ra(a.h("original-size"), e || "\u00a0");
    a.Ra(a.h("compiled-size"), f || "\u00a0");
    a.Ra(a.h("compression"), h || "\u00a0")
}
  , gi = function(a, b) {
    a = a.g;
    var c = a.h("compiled-code")
      , d = a.h("warnings")
      , e = a.h("errors")
      , f = a.h("warnings")
      , h = a.h("errors");
    if (b) {
        var k = b.g;
        b = b.j;
        k || b ? (b && (L(d, "output-has-warnings"),
        a.Ra(f, "Warnings (" + b.length + ")")),
        k && (L(e, "output-failure"),
        a.Ra(h, "Errors (" + k.length + ")"))) : L(c, "output-success")
    } else
        ae(c, "output-success"),
        ae(d, "output-has-warnings"),
        a.Ra(f, "Warnings"),
        ae(e, "output-failure"),
        a.Ra(h, "Errors")
};
Z.prototype.N = function() {
    var a = nc(pc(this.g.g) || window)
      , b = re(this.g.h("content")).y;
    Oh(this.ca, new B(a.width,a.height - b - (this.g.h("footer").offsetHeight + 2)))
}
;
Z.prototype.C = function() {
    F.prototype.C.call(this);
    this.i.S();
    this.j.S();
    this.ca.S();
    this.o.S();
    this.B.S();
    this.ga.S();
    this.ba.S();
    this.A.toTextArea()
}
;
var mi;
(mi = !x) || (mi = !(Object.prototype.hasOwnProperty.call(Eb, "1.9") ? Eb["1.9"] : Eb["1.9"] = 0 <= Va(Db, "1.9")));
var ki = mi;
var ni = function() {
    var a = new Z(new hc);
    ei(a);
    ad(window, "unload", function() {
        a.S()
    })
}
  , oi = ["giffy", "main"]
  , pi = p;
oi[0]in pi || "undefined" == typeof pi.execScript || pi.execScript("var " + oi[0]);
for (var qi; oi.length && (qi = oi.shift()); )
    oi.length || void 0 === ni ? pi[qi] && pi[qi] !== Object.prototype[qi] ? pi = pi[qi] : pi = pi[qi] = {} : pi[qi] = ni;
