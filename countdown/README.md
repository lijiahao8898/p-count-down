lib.countdown - 倒计时
-----------------

#### 最新版本 v1.0.0

#### 使用 Usage

```
<script type="text/javascript" src="http://g.tbcdn.cn/mtb/lib-countdown/1.0.0/countdown.js"></script>
<script type="text/javascript">
//初始化倒计时
var cd = lib.countdown(options);
//启动倒计时
cd.start();
//停止倒计时
cd.stop();
</script>
```

`lib.countdown(options)`返回一个倒计时`CountDown`对象，此对象为内部对象，无法直接实例化。


#### 参数 Options

 * `endDate` - 倒计时的结束时间点。倒计时必需有此属性，否则会抛错。此属性可以是：
    * `Date` - 标准值。
    * `Number` - 表示结束时间点相对于`January 1, 1970, 00:00:00 UTC`的绝对值，单位是`秒`。比如：new Date('2014-12-30 23:00:00').getTime() / 1000。
    * `String` - 当为字符串时，则：
        * 若以`+`或`-`开始，则结束时间点以当前时间即`new Date()`为相对时间点，再`加上`或`减去`字符串后半部分所表示的时长。后半部分，若是一个数值则为秒数，或为字符串，则会按照`日:小时:分钟:秒`的格式进行解析。
        * 其他，则尝试直接通过`new Date(endDate)`转换为`Date`。
    * 其他情况，则尝试直接通过`new Date(endDate)`转换为`Date`。

 * `stringFormatter` - 倒计时数据的字符串格式。跟大多数语言的日期格式化类似，比如：`dd:hh:mm:ss`。 此字串中的特殊字符有：
    * `d` - 天数。
    * `h` - 小时。
    * `m` - 分钟。
    * `s` - 秒。

    其中，多个相同的字符表示数值的位数，若最高位不够，则用`0`补齐。注意：若要格式字串里加入特殊字符，需要用`\\`进行转义。比如：`d\\day\\s, hh\\hour\\s, mm\\minute\\s, ss\\secon\\d\\s`。
    默认值为：`d天hh时mm分ss秒`。

 * `interval` - 倒计时更新的间隔频率。单位为`毫秒`。 默认值为：`1000`，即1秒。
 * `correctDateOffset` - 修正倒计时的时间偏差值。单位为`秒`。此属性可用来修正服务端与客户端的时间差。

 * `onUpdate` - 倒计时每次更新的回调函数。它接收一个参数`data`，包含倒计时相关数据：
    * `stringValue` - 通过`stringFormatter`格式化后的倒计时`字符串值`。
    * `totalSeconds` - 倒计时的`总秒数`。
    * `days` - 倒计时的天数部分。
    * `hours` - 倒计时的小时部分。
    * `minutes` - 倒计时的分钟部分。
    * `seconds` - 倒计时的秒数部分。

 * `updateElement` - 倒计时的更新元素。可快捷的把倒计时结果通过innerHTML更新到此元素中。

 * `onEnd` - 倒计时结束的回调函数。

#### 方法 APIs

 * `start` - 启动倒计时。
 * `stop` - 停止倒计时。
 * `setEndDate(date)` - 设置结束时间。


#### 示例 Examples

```
var cd = lib.countdown({
    endDate: '2014/12/30 23:00:00',
    stringFormatter: 'd天 hh小时mm分ss秒',
    onUpdate: function(data){
        elem.innerHTML = data.stringValue;
    },
    onEnd: function(){
        console.log('countdown ended');
    }
}).start();
```

```
var cd = lib.countdown({
    endDate: '+3600',
    correctDateOffset: 10*60, //服务端时间比客户端时间快10分钟
    stringFormatter: 'hh:mm:ss',
    onUpdate: function(data){
        elem.innerHTML = data.stringValue;
    },
    onEnd: function(){
        console.log('countdown ended');
    }
}).start();
```

```
var cd = lib.countdown({
    endDate: '+1:20:13:45',
    stringFormatter: 'd\\day\\s, hh\\hour\\s, mm\\minute\\s, ss\\secon\\d\\s',
    onUpdate: function(data){
        elem.innerHTML = data.stringValue;
    },
    onEnd: function(){
        console.log('countdown ended');
    }
}).start();
```

更多示例可以参考：[index.html](index.html)