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
        months: ['January','February','March','April','May','June','July','August','September','October','November','December']
    },
    


    /**
     * Templating functions to abstract HTML rendering
     */

    renderControl = function() {
        var currentYear = getCurrentYear();

        var html = '';
        html += `<div class="button-group">
                    <button type="button" class="left-button" value="prev">◄</button>
                    <button type="button" class="center-button" value="${currentYear}">${currentYear}</button>
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

        // self._v = true; // Initially set visible status to true


        self._onClick = function(e) {
            e = e || window.event;
            var target = e.target || e.srcElement,
                pEl = target;
            if (!target) {
                return;
            }
            if (!hasEventListeners && hasClass(target, 'pika-select')) {
                if (!target.onchange) {
                    target.setAttribute('onchange', 'return;');
                    addEvent(target, 'change', self._onChange);
                }
            }
            do {
                if (hasClass(pEl, 'pika-single') || pEl === opts.trigger) {
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


        if(!opts.bound) {
            this.hide();
            self.el.className += ' is-bound';
            addEvent(opts.trigger, 'click', self._onInputClick);
            // addEvent(opts.trigger, 'focus', self._onInputFocus);
            // addEvent(opts.trigger, 'blur', self._onInputBlur);
        } else {
            this.show();
            console.log('showing');
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
                    // this.adjustPosition();
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
        }
    };

    return PikaMonth;
}));