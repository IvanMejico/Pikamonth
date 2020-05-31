(function (root, factory) {
    'use strict';

    root.PikaMonth = factory(root.moment);
}(this, function(moment){

    'use strict';

    var hasMoment = typeof moment === 'function',

    hasEventListeners = !!window.addEventListener,

    document = window.document,

    sto = window.setTimeout,

    addEvent = function(el, e, callback, capture) {
        if(hasEventListeners) {
            el.addEventListener(e, callback, !!capture);
        } else {
            el.attachEvent('on' + e, callback);
        }
    },

    trim = function(str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
    },

    removeEvent = function(el, e, callback, capture) {
        if(hasEventListeners) {
            el.addEventListener(e, callback, !!capture);
        } else {
            el.attachEvent('on' + e, callback);
        }
    },

    hasClass = function(el, cn) {
        return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
    },

    addClass = function(el, cn) {
        if (!hasClass(el, cn)) {
            el.className = (el.className === '') ? cn : el.className + ' ' + cn;
        }
    },

    removeClass = function(el, cn) {
        el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
    },

    isArray = function(obj)
    {
        return (/Array/).test(Object.prototype.toString.call(obj));
    },

    extend = function(to, from, overwrite) {
        var prop, hasProp;
        for (prop in from) {
            hasProp = to[prop] !== undefined;
            if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
                if (isDate(from[prop])) {
                    if (overwrite) {
                        to[prop] = new Date(from[prop].getTime());
                    }
                }
                else if (isArray(from[prop])) {
                    if (overwrite) {
                        to[prop] = from[prop].slice(0);
                    }
                } else {
                    to[prop] = extend({}, from[prop], overwrite);
                }
            } else if (overwrite || !hasProp) {
                to[prop] = from[prop];
            }
        }
        return to;
    },

    getCurrentYear = function() {
        return hasMoment ? moment().format('YYYY') : String(new Date().getFullYear());
    },

    defaults = {
        field: null,
        trigger: null,
        bound: undefined,
        minYear: 0,
        maxYear: 9999,
        container: undefined,
        position: 'bottom-left',
        reposition: true,
        months: ['January','February','March','April','May','June','July','August','September','October','November','December'],

        // callback functions
        onSelect: null,
        onOpen: null,
        onClose: null,
        onDraw: null
    },
    


    /**
     * Templating functions to abstract HTML rendering
     */

    renderControl = function() {
        var currentYear = getCurrentYear();

        var html = '';
        html += `<div class="button-group">
                    <button type="button" class="left-button" value="prev">◄</button>
                    <button type="button" class="mp-year" value="${currentYear}">${currentYear}</button>
                    <button type="button" class="right-button" value="next">◄</button>
                </div>`;
        return html;
    },

    renderMonths = function() {
        var html = '<div class="month-selection">';
        for(var i=0; i<12; i++) {
            html += `<span class=mp-month data-month='${i}'>${defaults.months[i]}</span>`;
        }
        return html + '</div>';
    },


    renderYear = function() {

    },

    renderTitle = function() {

    },

    PikaMonth = function(options) {
        var self = this,
            opts = self.config(options);

        self._onMouseDown = function(e) {
            if(!self._v) {
                return;
            }

            e = e || window.event;
            var target = e.target || e.srcElement;
            if(!target) {
                return;
            }

            if(!hasClass(target, 'is-disabled')) {
                if(hasClass(target, 'mp-month')) {
                    self.setMonth(target.getAttribute('data-month'));
                    if(opts.bound) {
                        sto(function() {
                            self.hide();
                            if(opts.blurFieldOnSelect && opts.field) {
                                opts.field.blur();
                            }
                        }, 100);
                    }
                }
            }
        };

        self._onInputClick = function() {
            self.show();
        };

        self._onClick = function(e) {
            e = e || window.event;
            var target = e.target || e.srcElement,
                pEl = target;
            if (!target) {
                return;
            }
            if (!hasEventListeners && hasClass(target, 'mp-year')) {
                if (!target.onchange) {
                    target.setAttribute('onchange', 'return;');
                    addEvent(target, 'change', self._onChange);
                }
            }
            do {
                if (hasClass(pEl, 'mp-single') || pEl === opts.trigger) {
                    return;
                }
            }
            while ((pEl = pEl.parentNode));
            if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
                self.hide();
            }
        };



        self.el = document.createElement('div');
        self.el.className = 'mp-single';
        self.el.innerHTML = renderControl() + renderMonths();
        document.body.append(self.el);


        addEvent(self.el, 'mousedown', self._onMouseDown, true);
        // addEvent(self.el, 'touchend', self._onMouseDown, true);
        // addEvent(self.el, 'change', self._onChange);

        if(opts.bound) {
            this.hide();
            self.el.className += ' is-bound';
            addEvent(opts.trigger, 'click', self._onInputClick);
            // addEvent(opts.trigger, 'focus', self._onInputFocus);
            // addEvent(opts.trigger, 'blur', self._onInputBlur);
        } else {
            this.show();
        }


    };
    
    PikaMonth.prototype = {
        config: function(options)  {
            if(!this._o) {
                this._o = extend({}, defaults, true);
            }

            var opts = extend(this._o, options, true);

            opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;
            opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;
            opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

            return opts;
        },

        setMonth: function(month) {
            this.month = month;

            if(this._o.field) {
                this._o.field.value = defaults.months[this.month];
            }

            if(typeof this._o.onSelect === 'function') {
                this._o.onSelect.call(this, this.month);
            }
        },

        isVisible: function() {
            return this._v;
        },

        show: function() {
            // If not visible, show it
            if(!this.isVisible()) {
                this._v = true;
                removeClass(this.el, 'is-hidden');
                if (this._o.bound) {
                    addEvent(document, 'click', this._onClick);
                    this.adjustPosition();
                }
                
            }
        },

        hide: function() {
            // If visible, hide it
            var v = this._v;
            if (v !== false) {
                if (this._o.bound) {
                    removeEvent(document, 'click', this._onClick);
                }
                this.el.style.position = 'static'; // reset
                this.el.style.left = 'auto';
                this.el.style.top = 'auto';
                addClass(this.el, 'is-hidden');
                this._v = false;
                if(v !== undefined && typeof this._o.onClose === 'function') {
                    this._o.onClose.call(this);
                }
            }
        },

        adjustPosition: function() {
            var field, pEl, width, height, viewportWidth, viewportHeight, scrollTop, left, top, clientRect, leftAligned, bottomAligned;

            if (this._o.container) return;

            this.el.style.position = 'absolute';

            field = this._o.trigger;
            pEl = field;
            width = this.el.offsetWidth;
            height = this.el.offsetHeight;
            viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
            leftAligned = true;
            bottomAligned = true;

            if (typeof field.getBoundingClientRect === 'function') {
                clientRect = field.getBoundingClientRect();
                left = clientRect.left + window.pageXOffset;
                top = clientRect.bottom + window.pageYOffset;
            } else {
                left = pEl.offsetLeft;
                top  = pEl.offsetTop + pEl.offsetHeight;
                while((pEl = pEl.offsetParent)) {
                    left += pEl.offsetLeft;
                    top  += pEl.offsetTop;
                }
            }

            // default position is bottom & left
            if ((this._o.reposition && left + width > viewportWidth) ||
                (
                    this._o.position.indexOf('right') > -1 &&
                    left - width + field.offsetWidth > 0
                )
            ) {
                left = left - width + field.offsetWidth;
                leftAligned = false;
            }
            if ((this._o.reposition && top + height > viewportHeight + scrollTop) ||
                (
                    this._o.position.indexOf('top') > -1 &&
                    top - height - field.offsetHeight > 0
                )
            ) {
                top = top - height - field.offsetHeight;
                bottomAligned = false;
            }

            this.el.style.left = left + 'px';
            this.el.style.top = top + 'px';

            addClass(this.el, leftAligned ? 'left-aligned' : 'right-aligned');
            addClass(this.el, bottomAligned ? 'bottom-aligned' : 'top-aligned');
            removeClass(this.el, !leftAligned ? 'left-aligned' : 'right-aligned');
            removeClass(this.el, !bottomAligned ? 'bottom-aligned' : 'top-aligned');
        }
    };

    return PikaMonth;
}));