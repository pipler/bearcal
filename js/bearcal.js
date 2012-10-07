(function() {

  (function($, window, document) {
    return $.widget("a07.BearCal", {
      options: {
        startDate: new Date(),
        period: 12,
        scrollPeriod: 4,
        monthFullName: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        nthMonth: 4,
        nthMonthClass: "endrow",
        animateSpeed: 500,
        boxClass: {
          am: "am_box",
          pm: "pm_box",
          fullDay: "day_box"
        },
        trackClass: "track",
        defaultStatusType: "available",
        hoverStates: {
          am: "hover_am",
          pm: "hover_pm"
        },
        highlightStates: {
          am: "highlight_am",
          pm: "highlight_pm"
        },
        setStates: {
          am: {
            available: "",
            unavailable: "unavailable am",
            booked: "booked am"
          },
          pm: {
            available: "",
            unavailable: "unavailable pm",
            booked: "booked pm"
          }
        },
        json: false,
        jsonUrl: ""
      },
      _options: {
        loadedData: {},
        loadedMonths: [],
        displayedMonths: [],
        startDate: null,
        endDate: null
      },
      getJSON: function() {
        var json, _this;
        _this = this;
        json = {
          "availability": []
        };
        this.element.find('.' + this.options.boxClass.fullDay).each(function() {
          var elem;
          elem = $(this);
          json.availability.push({
            "date": elem.find('.' + _this.options.boxClass.am).attr('data-date'),
            "type": elem.find('.' + _this.options.boxClass.am).attr('data-status-type')
          });
          return json.availability.push({
            "date": elem.find('.' + _this.options.boxClass.pm).attr('data-date'),
            "type": elem.find('.' + _this.options.boxClass.pm).attr('data-status-type')
          });
        });
        return json;
      },
      _compareDates: function(s_date, e_date, operator) {
        switch (operator) {
          case "<":
            return new Date(s_date).getTime() < new Date(e_date).getTime();
          case ">":
            return new Date(s_date).getTime() > new Date(e_date).getTime();
          case ">=":
            return new Date(s_date).getTime() >= new Date(e_date).getTime();
          case "<=":
            return new Date(s_date).getTime() <= new Date(e_date).getTime();
          case "==":
            return new Date(s_date).getTime() === new Date(e_date).getTime();
        }
      },
      _track: function() {
        var _this;
        _this = this;
        return $("." + this.element.attr("class")).on({
          mousemove: function(event) {
            if (_this._getLocation(this, event)) {
              if (!_this._highlightable()) {
                $(this).find('div').removeClass(_this._getAllClasses(_this.options.hoverStates));
                return $(this).find('.' + _this.options.boxClass.am).addClass(_this.options.hoverStates.am);
              } else {
                _this._eraseHighlights();
                return _this._trackHighlights(this, "T00:00:00");
              }
            } else {
              if (!_this._highlightable()) {
                $(this).find('div').removeClass(_this._getAllClasses(_this.options.hoverStates));
                return $(this).find('.' + _this.options.boxClass.pm).addClass(_this.options.hoverStates.pm);
              } else {
                _this._eraseHighlights();
                return _this._trackHighlights(this, "T12:00:00");
              }
            }
          },
          mouseleave: function(event) {
            return $(this).find('div').removeClass(_this._getAllClasses(_this.options.hoverStates));
          },
          click: function(event) {
            if (_this._getLocation(this, event)) {
              return _this._setDates(this, "T00:00:00");
            } else {
              return _this._setDates(this, "T12:00:00");
            }
          }
        }, "." + this.options.trackClass);
      },
      _getLocation: function(that, event) {
        var h, offset;
        offset = $(that).offset();
        h = $(that).height() + offset.top;
        return (h - event.pageY) > (event.pageX - offset.left);
      },
      _highlightable: function() {
        return this._options.startDate && !this._options.endDate;
      },
      _eraseHighlights: function() {
        return $("." + this.options.boxClass.am + ", ." + this.options.boxClass.pm).removeClass(this._getAllClasses(this.options.highlightStates));
      },
      _trackHighlights: function(that, pos) {
        var cursorPos, _this;
        _this = this;
        cursorPos = $(that).attr("data-date") + pos;
        return $("." + this.options.boxClass.fullDay).each(function() {
          var cursorAdj, each_box;
          if (cursorPos < _this._options.startDate) {
            cursorAdj = $(that).attr("data-date") + "T00:00:00";
            each_box = $(this).attr("data-date") + "T00:00:00";
            if (_this._compareDates(each_box, cursorAdj, ">=") && _this._compareDates(each_box, _this._options.startDate, "<=")) {
              if (_this._compareDates(each_box, cursorAdj, "==") && ~cursorPos.indexOf("T12:00:00")) {
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.highlightStates.pm);
              } else if (_this._compareDates(each_box, _this._options.startDate, "==")) {
                return $(this).find("." + _this.options.boxClass.am).addClass(_this.options.highlightStates.am);
              } else {
                $(this).find("." + _this.options.boxClass.am).addClass(_this.options.highlightStates.am);
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.highlightStates.pm);
              }
            }
          } else if (cursorPos > _this._options.startDate) {
            cursorAdj = $(that).attr("data-date") + "T12:00:00";
            each_box = $(this).attr("data-date") + "T12:00:00";
            if (_this._compareDates(each_box, cursorAdj, "<=") && _this._compareDates(each_box, _this._options.startDate, ">=")) {
              if (_this._compareDates(each_box, cursorAdj, "==") && ~cursorPos.indexOf("T00:00:00")) {
                return $(this).find("." + _this.options.boxClass.am).addClass(_this.options.highlightStates.am);
              } else if (_this._compareDates(each_box, _this._options.startDate, "==")) {
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.highlightStates.pm);
              } else {
                $(this).find("." + _this.options.boxClass.am).addClass(_this.options.highlightStates.am);
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.highlightStates.pm);
              }
            }
          } else if (cursorPos === _this._options.startDate) {
            each_box = $(this).attr("data-date") + "T00:00:00";
            if (_this._compareDates(each_box, cursorPos, "==")) {
              $(this).find("." + _this.options.boxClass.am).addClass(_this.options.highlightStates.am);
            }
            each_box = $(this).attr("data-date") + "T12:00:00";
            if (_this._compareDates(each_box, cursorPos, "==")) {
              return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.highlightStates.pm);
            }
          }
        });
      },
      _setDates: function(that, pos) {
        var _this;
        _this = this;
        if (this._options.startDate && this._options.endDate) {
          this._options.startDate = this._options.endDate = null;
        }
        if (this._options.startDate) {
          this._options.endDate = $(that).attr("data-date") + pos;
          if (this._compareDates(this._options.startDate, this._options.endDate, "<")) {
            $("." + this.options.boxClass.fullDay).each(function() {
              if (_this._compareDates(_this._options.startDate, $(this).attr("data-date") + "T12:00:00", "<") && _this._compareDates(_this._options.endDate, $(this).attr("data-date") + "T00:00:00", ">")) {
                $(this).find("." + _this.options.boxClass.am).addClass(_this.options.setStates.am.unavailable);
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.setStates.pm.unavailable);
              } else if (_this._compareDates(_this._options.startDate, $(this).attr("data-date") + "T12:00:00", "==")) {
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.setStates.pm.unavailable);
              } else if (_this._compareDates(_this._options.endDate, $(this).attr("data-date") + "T00:00:00", "==")) {
                return $(this).find("." + _this.options.boxClass.am).addClass(_this.options.setStates.am.unavailable);
              }
            });
            this._eraseHighlights();
            return true;
          } else if (this._compareDates(this._options.startDate, this._options.endDate, ">")) {
            $("." + this.options.boxClass.fullDay).each(function() {
              if (_this._compareDates(_this._options.startDate, $(this).attr("data-date") + "T00:00:00", ">") && _this._compareDates(_this._options.endDate, $(this).attr("data-date") + "T12:00:00", "<")) {
                $(this).find("." + _this.options.boxClass.am).addClass(_this.options.setStates.am.unavailable);
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.setStates.pm.unavailable);
              } else if (_this._compareDates(_this._options.startDate, $(this).attr("data-date") + "T00:00:00", "==")) {
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.setStates.am.unavailable);
              } else if (_this._compareDates(_this._options.endDate, $(this).attr("data-date") + "T12:00:00", "==")) {
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.setStates.pm.unavailable);
              }
            });
            this._eraseHighlights();
            return true;
          } else {
            $("." + this.options.boxClass.fullDay).each(function() {
              if (_this._compareDates(_this._options.startDate, $(this).attr("data-date") + "T00:00:00", "==")) {
                return $(this).find("." + _this.options.boxClass.am).addClass(_this.options.setStates.am.unavailable);
              } else if (_this._compareDates(_this._options.startDate, $(this).attr("data-date") + "T12:00:00", "==")) {
                return $(this).find("." + _this.options.boxClass.pm).addClass(_this.options.setStates.pm.unavailable);
              }
            });
            return true;
          }
        } else {
          this._options.startDate = $(that).attr("data-date") + pos;
          return false;
        }
      },
      _getAllClasses: function(obj) {
        var results;
        results = "";
        $.each(obj, function(index, value) {
          return results += value + " ";
        });
        return results;
      },
      _toDate: function(date) {
        return new Date(date);
      },
      _setDate: function() {
        var date;
        if (typeof this.options.startDate !== "object") {
          date = this.options.startDate.split('/');
          return this.options.startDate = new Date(date[0], date[1], date[2]);
        }
      },
      _getDayOfWeek: function(year, month, day) {
        return new Date(year, month, day).getDay();
      },
      _getDaysInMonth: function(year, month) {
        return new Date(year, month + 1, 0).getDate();
      },
      _getWeekdaysHtml: function() {
        var day, weekdayshtml, _i, _len, _ref;
        weekdayshtml = "";
        _ref = this.options.days;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          day = _ref[_i];
          weekdayshtml += "<div class=\"wday_box\">" + (day.charAt(0)) + "</div>\n";
        }
        return weekdayshtml;
      },
      _getDaysHtml: function(year, month) {
        var blanks, daycount, dayshtml, fulldate, i, states, status, _i, _len, _ref;
        dayshtml = "";
        daycount = 0;
        blanks = this._getDayOfWeek(year, month, 1);
        if (blanks > 0) {
          i = 0;
          while (i < blanks) {
            dayshtml += "<div class=\"empty_day_box\"></div>";
            daycount++;
            i++;
          }
        }
        states = {};
        i = 0;
        while (i < this._getDaysInMonth(year, month)) {
          states = {
            am: {
              type: this.options.defaultStatusType
            },
            pm: {
              type: this.options.defaultStatusType
            }
          };
          fulldate = "" + year + "-" + (this._pad(parseInt(month) + 1, 2)) + "-" + (this._pad(i + 1, 2));
          if (this._options.loadedData.availability != null) {
            _ref = this._options.loadedData.availability;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              status = _ref[_i];
              if (status.date === fulldate + "T00:00:00") {
                states.am.type = status.type;
              } else if (status.date === fulldate + "T12:00:00") {
                states.pm.type = status.type;
              }
            }
          }
          dayshtml += "<div class=\"" + this.options.boxClass.fullDay + " " + this.options.trackClass + "\" data-date=\"" + fulldate + "\">\n  <div class=\"" + this.options.boxClass.am + " " + this.options.setStates.am[states.am.type] + "\" data-date=\"" + fulldate + "T00:00:00\" data-status-type=\"" + states.am.type + "\">\n    <div class=\"" + this.options.boxClass.pm + " " + this.options.setStates.pm[states.pm.type] + "\" data-date=\"" + fulldate + "T12:00:00\" data-status-type=\"" + states.pm.type + "\">\n      " + (i + 1) + "\n    </div>\n  </div>\n</div>";
          daycount++;
          i++;
        }
        while (daycount < 42) {
          dayshtml += "<div class=\"empty_day_box\"></div>";
          daycount++;
        }
        return dayshtml;
      },
      _pad: function(num, places) {
        var zero;
        zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
      },
      _getMonth: function(year, month) {
        var nth;
        this._setLoadedMonths(year, month);
        if (this._options.displayedMonths.length < this.options.period) {
          this._setDisplayedMonths(year, month);
        }
        nth = this._options.loadedMonths.length % this.options.nthMonth;
        return "<div class=\"month_box " + (nth === 0 ? this.options.nthMonthClass : "") + "\">\n  <div class=\"month_header\">" + this.options.monthFullName[month] + " " + year + "</div>\n  <div class=\"month_wrapper\">\n    " + (this._getWeekdaysHtml()) + "\n    " + (this._getDaysHtml(year, month)) + "\n  </div>\n</div>";
      },
      _setLoadedMonths: function(year, month) {
        this._options.loadedMonths.push(year + "-" + month);
        return this._options.loadedMonths.sort(this._dateCompare);
      },
      _setDisplayedMonths: function(year, month, direction) {
        this._options.displayedMonths.push(year + "-" + month);
        this._options.displayedMonths.sort(this._dateCompare);
        if (typeof direction !== "undefined") {
          if (direction === -1) {
            this._options.displayedMonths.pop();
          }
          if (direction === 1) {
            return this._options.displayedMonths.shift();
          }
        }
      },
      _dateCompare: function(a, b) {
        a = a.split("-");
        b = b.split("-");
        return (new Date(a[0], a[1]).getTime()) - (new Date(b[0], b[1]).getTime());
      },
      _getCalendar: function() {
        var calendarhtml, i, month, year;
        this._trigger("beforebuild");
        calendarhtml = "<a href=\"#\" class=\"prev_months\">Previous " + this.options.scrollPeriod + " Months</a>";
        calendarhtml += "<div class=\"year_box clearfix\">\n  <div class=\"slider_container clearfix\">\n";
        year = this.options.startDate.getFullYear();
        month = this.options.startDate.getMonth();
        i = 0;
        while (i < this.options.period) {
          if (month > 11) {
            month = 0;
            year++;
          }
          calendarhtml += this._getMonth(year, month);
          month++;
          i++;
        }
        calendarhtml += "</div></div>";
        return calendarhtml += "<a href=\"#\" class=\"next_months\">Next " + this.options.scrollPeriod + " Months</a>";
      },
      _getMonthsByPeriod: function(year, month, period) {
        var date, html, i, movement, result, results, tmp, _i, _len, _month;
        movement = period < 0 ? -1 : 1;
        i = Math.abs(period);
        results = [];
        html = "";
        while (i !== 0) {
          month += movement;
          tmp = month % 12;
          _month = tmp < 0 ? tmp + 12 : tmp;
          if (movement === -1) {
            year = _month === 11 ? year + movement : year;
          } else {
            year = _month === 0 ? year + movement : year;
          }
          results.push(year + "-" + _month);
          --i;
        }
        if (movement === -1) {
          results.reverse();
        }
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          date = result.split("-");
          if (~$.inArray(result, this._options.loadedMonths) === 0) {
            html += this._getMonth(date[0], date[1]);
          }
          this._setDisplayedMonths(date[0], date[1], movement);
        }
        return html;
      },
      _splitDate: function(index, source) {
        var date, i;
        date = source[index].split("-");
        i = 0;
        while (i < date.length) {
          date[i] = parseInt(date[i]);
          i++;
        }
        return date;
      },
      _getPrevMonths: function() {
        var animatemargin, currentpos, date, html, rowheight, rows;
        if (!$('.slider_container').is(':animated')) {
          currentpos = parseFloat($('.slider_container').css('marginTop'));
          rowheight = $('.month_box').outerHeight(true);
          rows = this.options.scrollPeriod / this.options.nthMonth;
          animatemargin = currentpos + (rowheight * rows);
          animatemargin = animatemargin === (rowheight * rows) ? 0 : animatemargin;
          date = this._splitDate(0, this._options.displayedMonths);
          html = this._getMonthsByPeriod(date[0], date[1], -this.options.scrollPeriod);
          if (html.length > 0) {
            return $('.slider_container').prepend(html).css({
              "marginTop": (currentpos - (rowheight * rows)) + "px"
            }).animate({
              marginTop: animatemargin + "px"
            }, this.options.animateSpeed);
          } else {
            return $('.slider_container').animate({
              marginTop: animatemargin + "px"
            }, this.options.animateSpeed);
          }
        }
      },
      _getNextMonths: function() {
        var animatemargin, currentpos, date, rowheight, rows;
        if (!$('.slider_container').is(':animated')) {
          currentpos = parseFloat($('.slider_container').css('marginTop'));
          rowheight = $('.month_box').outerHeight(true);
          rows = this.options.scrollPeriod / this.options.nthMonth;
          animatemargin = currentpos - (rowheight * rows);
          date = this._splitDate(this._options.displayedMonths.length - 1, this._options.displayedMonths);
          return $('.slider_container').append(this._getMonthsByPeriod(date[0], date[1], this.options.scrollPeriod)).animate({
            marginTop: animatemargin + "px"
          }, this.options.animateSpeed);
        }
      },
      _startup: function() {
        var _this = this;
        this.element.append(this._getCalendar());
        $('.prev_months').click(function() {
          _this._getPrevMonths();
          return false;
        });
        $('.next_months').click(function() {
          _this._getNextMonths();
          return false;
        });
        return this._track();
      },
      _create: function() {
        var _this;
        _this = this;
        if (this.options.json) {
          return $.getJSON(this.options.jsonUrl, function(data) {
            $.extend(_this._options.loadedData, data);
            return _this._startup();
          });
        } else {
          return _this._startup();
        }
      },
      _init: function() {
        var _this;
        _this = this;
        return this._setDate();
      },
      destroy: function() {},
      _setOption: function(key, value) {}
    });
  })(jQuery, window, document);

}).call(this);
