;(function(win, lib){

var DAY_SECONDS = 86400,
    HOUR_SECONDS = 3600,
    MINUTE_SECONDS = 60,
    MICRO_SECONDS = 0.01,
    MICROSECOND_PER_SECOND = 1000,
    FORMATTER_DEFAULT = 'd天hh时mm分ss秒';
    FORMATTER_REGEXP = /(\\)?(dd*|hh?|mm?|ss?)/gi;

/**
 * 倒计时。此类无法直接实例化，请使用 lib.countdown(options) 进行实例化。
 * @class CountDown
 * @param {Object} options 倒计时参数。
 * @param {CountDown~DateSource} options.endDate 倒计时的结束时间点。倒计时必需有此属性，否则会抛错。
 * @param {CountDown~StringFormatter} options.stringFormatter 倒计时数据的字符串格式。
 * @param {Int} options.interval 倒计时更新的间隔频率。单位为毫秒。 默认值为：1000，即1秒。
 * @param {Int} options.correctDateOffset 修正倒计时的时间偏差值。单位为秒。此属性可用来修正服务端与客户端的时间差。
 * @param {CountDown~onUpdate} options.onUpdate 倒计时每次更新的回调函数。
 * @param {HTMLElement} options.updateElement 倒计时的更新元素。可快捷的把倒计时结果通过innerHTML更新到此元素中。
 * @param {Function} options.onEnd 倒计时结束时的回调函数。
 */
var CountDown = function(options){
    options = options || {};

    //parse end date
    var me = this, endDate = parseDate(options.endDate);
    if(!endDate || !endDate.getTime()){
        throw new Error('Invalid endDate');
    }else{
        me.endDate = endDate;
    }

    me.onUpdate = options.onUpdate;
    me.onEnd = options.onEnd;
    me.interval = options.interval || 1000;
    me.stringFormatter = options.stringFormatter || FORMATTER_DEFAULT;
    me.correctDateOffset = options.correctDateOffset || 0;
    me.updateElement = options.updateElement;

    //internal use
    me._data = {days:0, hours:0, minutes:0, seconds:0};
};

CountDown.prototype = {
    /**
     * 启动倒计时。
     * @memberOf CountDown.prototype
     */
    start: function(){
        var me = this;
        me.stop();

        if(me._update()){
            me._intervalId = setInterval(function(){
                me._update();
            }, me.interval);
        }
        
        return me;
    },

    /**
     * @private
     */
    _update: function(){
        var me = this, data = me._data,
            elem = me.updateElement, callback,
            now = +new Date() + me.correctDateOffset * 1000, 
            diff = Math.max(0, Math.round((me.endDate.getTime() - now))),
            ended = diff <= 0;

        //calc diff segment
        data.totalMicroSeconds = diff;
        diff -= (data.days = Math.floor(diff / (DAY_SECONDS * MICROSECOND_PER_SECOND))) * DAY_SECONDS * MICROSECOND_PER_SECOND;
        diff -= (data.hours = Math.floor(diff / (HOUR_SECONDS * MICROSECOND_PER_SECOND))) * HOUR_SECONDS * MICROSECOND_PER_SECOND;
        diff -= (data.minutes = Math.floor(diff / (MINUTE_SECONDS * MICROSECOND_PER_SECOND))) * MINUTE_SECONDS * MICROSECOND_PER_SECOND;
        diff -= (data.seconds = Math.floor(diff / MICROSECOND_PER_SECOND)) * MICROSECOND_PER_SECOND;
        data.microSeconds = Math.floor(diff * MICRO_SECONDS);

        //format string value
        data.stringValue = formatDateTime(data, me.stringFormatter);

        //simple way to update element's content
        if(elem) elem.innerHTML = data.stringValue;

        //callback
        (callback = me.onUpdate) && callback.call(me, data);
        if(ended){
            me.stop();
            (callback = me.onEnd) && callback.call(me);
            return false;
        }

        return true;
    },

    /**
     * 停止计时器。
     * @memberOf CountDown.prototype
     */
    stop: function(){
        var me = this;
        if(me._intervalId){
            clearInterval(me._intervalId);
            me._intervalId = null;
        }
        return me;
    },

    /**
     * 设置结束时间。
     * @memberOf CountDown.prototype
     * @param {CountDown~DateSource} date 要设置的结束时间。 
     */
    setEndDate: function(date){
        var me = this;
        me.endDate = parseDate(date);
        return me;
    }
};

function parseDate(source){
    var date;

    if(typeof source === 'number'){
        date = new Date(source * 1000);
    }else if(typeof source === 'string'){
        var firstChar = source.charAt(0),
            plus = firstChar === '+',
            minus = firstChar === '-';

        if(plus || minus){ //offset date formate
            var value = source.substr(1), offsetValue,
            arr = value.split(':'),
            time = [0, 0, 0, 0], index = 4;

            while(arr.length && --index >= 0){
                time[index] = parseInt(arr.pop()) || 0;
            }
            offsetValue = DAY_SECONDS * time[0] + HOUR_SECONDS * time[1] + MINUTE_SECONDS * time[2] + time[3];

            date = new Date();
            date.setSeconds(date.getSeconds() + offsetValue * (minus ? -1 : 1));
            date.setMilliseconds(0);
        }
    }

    if(!date) date = new Date(source);

    return date;
}

function formatDateTime(data, formatter){
    return formatter.replace(FORMATTER_REGEXP, function(m){
        var len = m.length, firstChar = m.charAt(0);
        //escape character
        if(firstChar === '\\') return m.replace('\\', '');
        var value = (firstChar === 'd' ? data.days :
                    firstChar === 'h' ? data.hours :
                    firstChar === 'm' ? data.minutes :
                    firstChar === 's' ? data.seconds :
                    firstChar === 'ms' ? data.microSeconds : 0) + '';

        //5 zero should be enough
        return ('00000' + value).substr(-Math.max(value.length, len));
    });
}

/**
 * 倒计时的日期源数据。
 * @typedef {(Date|String|Number)} CountDown~DateSource
 * @desc 当日期源数据类型为：
 * <ul>
 * <li>Date - 标准值。</li>
 * <li>Number - 表示结束时间点相对于January 1, 1970, 00:00:00 UTC的绝对值，单位是秒。比如：new Date('2014-12-30 23:00:00').getTime() / 1000。</li>
 * <li>String - 当为字符串时，则：
 * <ul>
 * <li>若以+或-开始，则结束时间点以当前时间即new Date()为相对时间点，再加上或减去字符串后半部分所表示的时长。后半部分，若是一个数值则为秒数，或为字符串，则会按照日:小时:分钟:秒的格式进行解析。</li>
 * <li>其他，则尝试直接通过new Date(endDate)转换为Date。</li>
 * </ul></li>
 * <li>其他情况，则尝试直接通过new Date(endDate)转换为Date。</li>
 * </ul>
 */

/**
 * 倒计时数据的字符串格式。
 * @typedef {String} CountDown~StringFormatter
 * @desc 跟大多数语言的日期格式化类似，比如：dd:hh:mm:ss。 此字串中的特殊字符有：
 * <ul>
 * <li>d - 天数。</li>
 * <li>h - 小时。</li>
 * <li>m - 分钟。</li>
 * <li>s - 秒。</li>
 * </ul>
 * 其中，多个相同的字符表示数值的位数，若最高位不够，则用0补齐。注意：若要格式字串里加入特殊字符，需要用\\进行转义。比如：d\\day\\s, hh\\hour\\s, mm\\minute\\s, ss\\secon\\d\\s。 默认值为：d天hh时mm分ss秒。
 */

/**
 * 倒计时每次更新的回调函数。
 * @callback CountDown~onUpdate
 * @param {Object} data 更新回调的参数。
 * @param {String} data.stringValue 通过stringFormatter格式化后的倒计时字符串值。
 * @param {Int} data.totalMicroSeconds 倒计时的总毫秒数。
 * @param {Int} data.days 倒计时的天数部分。
 * @param {Int} data.hours 倒计时的小时部分。
 * @param {Int} data.minutes 倒计时的分钟部分。
 * @param {Int} data.seconds 倒计时的秒数部分。
 * @param {Int} data.microSeconds 倒计时的毫秒数部分。
 */

/**
 * 返回一个倒计时 {@link CountDown} 对象。
 * @memberOf lib
 * @function
 * @param {Object} options 倒计时参数，与 {@link CountDown} 构造函数参数一致。
 * @example
 * var cd = lib.countdown({
 *   endDate: '2014-12-30 23:00:00',
 *   stringFormatter: 'd天 hh小时mm分ss秒',
 *   onUpdate: function(data){
 *     elem.innerHTML = data.stringValue;
 *   },
 *   onEnd: function(){
 *       console.log('countdown ended');
 *   }
 * }).start();
 */
lib.countdown = function(options){
    return new CountDown(options);
}

/**
 * @namespace lib
 */

})(window, window.lib || (window.lib = {}));