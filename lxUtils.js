var lxUtils = function () {
    /**
     * getComputedStyle
     * 向DOM中添加元素之后，
     * 使用getComputedStyle强制浏览器重新计算并识别刚刚添加的元素，
     * 这样CSS动画就有了一个起点
     */
    var $this = this;
    //正则汉字
    var char = new RegExp(/^[\u4e00-\u9fa5]+$/);
    //行内元素
    var elLabel = ["a", "span", "strong", "u", "em", "i", "sub", "sup"];
    //判断动画结束类型
    this.transitionEnd = document.createElement("div").style.WebkitTransition ? "webkitTransitionEnd" : "transitionend";
    //json转换成form
    this.jsonToFrom = function (data) {
        var res = new FormData();
        for (var i in data)
            res.append(i, data[i]);
        return res;
    };
    //原生ajax请求
    this.ajax_method = function (url, data, method, success) {
        var ajax = new XMLHttpRequest();
        ajax.open(method, url);
        ajax.setRequestHeader("Content-type", "application/json;charset=utf-8");
        if (data) {
            ajax.send(JSON.stringify(data));
        } else {
            ajax.send();
        }

        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200) {
                success(ajax.responseText);
            }
        }
    };
    //插入样式文件
    this.insertStyle = function () {
        var dir = "";

        for (var i = 0; i < document.scripts.length; i++) {
            if (document.scripts[i].src.indexOf("utils") > -1) {
                dir = document.scripts[i].src;
            }
        }

        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = dir.substr(0, dir.length - 2) + "css";
        document.getElementsByTagName("head")[0].appendChild(link);
    };
    //获取屏幕宽高
    this.getWindow = function () {
        return {height: document.body.clientHeight, width: document.body.clientWidth};
    };
    //vh=>px
    this.vh2px = function (vh) {
        return this.getWindow().height / 100 * vh;
    };
    //vw=>px
    this.vw2px = function () {
        return this.getWindow().width / 100 * vw;
    };
    //扩展options
    this.extendDefaults = function (source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property]
            }
        }
        return source;
    };
    //延迟transition动画
    this.transitionDelay = function (el) {
        el.style.transition = "500ms transform 500ms ease";
    };
    //恢复延迟的transition动画
    this.transitionNormal = function (el) {
        el.style.transition = "500ms transform ease";
    };
    //创建modal-overlay
    this.createMask = function (className) {
        var mask = document.createElement("div");
        mask.className = "modal-overlay " + className;
        return mask;
    };
    //模态对话框，confirm提示框，prompt提示输入框
    this.Modal = function () {
        var _this = this;
        this.closeButton = null;
        this.modal = null;
        this.overlay = null;
        this.prompt = null;
        this.options = {
            className: "fade-and-drop",
            closeButton: true,
            content: "",
            maxWidth: "600px",
            minWidth: "80vw",
            overlay: true,
            autoOpen: false,
            closeFn: null,
            type: "",//confirm prompt,
            title: "提示",
            header: true,
            closeText: "X",
            promptFn: null,
            promptClassName: "",
            buttonClassName: "",
            buttons: [{
                title: "取消", fn: function () {
                    _this.close();
                }
            }, {
                title: "确认", fn: function () {
                    _this.close();
                }
            }]
        };

        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = $this.extendDefaults(this.options, arguments[0]);
        }

        function buildOut() {
            var content, contentHolder, docFrag;

            if (typeof _this.options.content === "string") {
                content = _this.options.content;
            } else {
                content = _this.options.content.innerHTML;
            }

            docFrag = document.createDocumentFragment();

            _this.modal = document.createElement("div");
            _this.modal.className = "modal " + _this.options.className;
            _this.modal.style.minWidth = _this.options.minWidth;
            _this.modal.style.maxWidth = _this.options.maxWidth;

            if (_this.options.closeButton) {
                _this.closeButton = document.createElement("button");
                _this.closeButton.className = "modal-close close-button";
                _this.closeButton.innerHTML = _this.options.closeText;
                _this.modal.appendChild(_this.closeButton);
            }

            if (_this.options.overlay) {
                _this.overlay = $this.createMask(_this.options.className);
                docFrag.appendChild(_this.overlay);
            }

            if (_this.options.header) {
                var header = document.createElement("div");
                header.className = "modal-header";
                header.innerHTML = _this.options.title;
                _this.modal.appendChild(header);
            }

            contentHolder = document.createElement("div");
            contentHolder.className = "modal-content";
            contentHolder.innerHTML = content;
            _this.modal.appendChild(contentHolder);

            if (_this.options.type == "confirm") {
                var buttons = document.createElement("div");
                buttons.className = "modal-button" + _this.options.buttonClassName;
                _this.options.buttons.forEach(function (item) {
                    var button = document.createElement("button");
                    button.innerHTML = item.title;
                    button.onclick = item.fn ? item.fn : _this.close;
                    buttons.appendChild(button);
                });
                _this.modal.appendChild(buttons);
            }

            if (_this.options.type == "prompt") {
                _this.prompt = document.createElement("div");
                _this.prompt.className = "modal-prompt" + _this.options.promptClassName;
                var input = document.createElement("input");
                _this.prompt.appendChild(input);
                _this.modal.appendChild(_this.prompt);

                var promptButtons = document.createElement("div");
                promptButtons.className = "modal-button" + _this.options.buttonClassName;
                _this.options.buttons.forEach(function (item) {
                    var button = document.createElement("button");
                    button.innerHTML = item.title;
                    button.onclick = function () {
                        if (item.fn) {
                            item.fn(input.value);
                            _this.close();
                        } else {
                            _this.close();
                        }
                    };
                    promptButtons.appendChild(button);
                });
                _this.modal.appendChild(promptButtons);
            }

            docFrag.appendChild(_this.modal);

            document.body.appendChild(docFrag);
        }

        function initEvents() {
            if (_this.closeButton) {
                _this.closeButton.addEventListener("click", _this.close.bind(this));
            }

            if (_this.overlay) {
                _this.overlay.addEventListener("click", _this.close.bind(this));
            }
        }

        $this.Modal.prototype.open = function () {

            buildOut.call(_this);

            initEvents.call(_this);

            window.getComputedStyle(_this.modal).height;

            _this.modal.className = _this.modal.className + " modal-open";

            _this.overlay.className = _this.overlay.className + " modal-open";
        };

        $this.Modal.prototype.close = function () {

            if (_this.options.closeFn) {
                _this.options.closeFn();
            }

            if (_this.options.type == "prompt" && _this.options.promptFn) {
                _this.options.promptFn(_this.prompt.getElementsByTagName("input")[0].value);
            }

            _this.modal.className = _this.modal.className.replace("modal-open", "");
            _this.overlay.className = _this.overlay.className.replace("modal-open", "");

            _this.modal.addEventListener($this.transitionEnd, function () {
                _this.modal.parentNode.removeChild(_this.modal);
            });

            _this.overlay.addEventListener($this.transitionEnd, function () {
                if (_this.overlay.parentNode) {
                    _this.overlay.parentNode.removeChild(_this.overlay);
                }
            });
        };

        if (this.options.autoOpen) {
            this.open();
        }
    };
    //底部弹出选项菜单
    this.ActionSheet = function () {
        var _this = this;

        this.actionSheet = null;
        this.cancelButton = null;
        this.overlay = null;
        this.actionCallback = null;
        this.actionIndex = 0;
        this.options = {
            actions: [{title: "拍照"}, {title: "相册"}],
            cancelButton: true,
            cancelClass: "",
            cancelText: "取消",
            overlay: true,
            autoShow: false,
            optionName: "",
            actionSheetClass: "",
            animationType: "up",
            textLabel: "title"
        };

        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = $this.extendDefaults(this.options, arguments[0]);
        }

        function build() {

            var doc = document.createDocumentFragment();

            _this.actionSheet = document.createElement("div");
            _this.actionSheet.className = _this.options.animationType + "-out action-sheet " + _this.options.actionSheetClass;

            var actions = document.createElement("div");
            actions.className = "actions";

            _this.options.actions.forEach(function (item, index) {
                var option = document.createElement("div");
                option.innerHTML = item[_this.options.textLabel];
                option.className = "actions-item " + _this.options.optionName;
                option.onclick = function () {
                    _this.actionIndex = index;
                    _this.hide();
                };
                actions.appendChild(option);
            });

            _this.actionSheet.appendChild(actions);

            if (_this.options.cancelButton) {
                _this.cancelButton = document.createElement("div");
                _this.cancelButton.className = "cancel-button " + _this.options.cancelClass;
                _this.cancelButton.innerHTML = _this.options.cancelText;
                _this.actionSheet.appendChild(_this.cancelButton);
            }

            if (_this.options.overlay) {
                _this.overlay = $this.createMask("");
                doc.appendChild(_this.overlay);
            }

            _this.actionSheet.appendChild(_this.cancelButton);

            doc.appendChild(_this.actionSheet);

            document.body.appendChild(doc);
        }

        function initEvents() {
            _this.cancelButton.addEventListener("click", _this.hide.bind(this));
        }

        $this.ActionSheet.prototype.show = function () {
            build.call(_this);

            initEvents.call(_this);

            window.getComputedStyle(_this.actionSheet).height;

            $this.transitionDelay(_this.actionSheet);

            _this.actionSheet.className = _this.actionSheet.className.replace(_this.options.animationType + "-out", _this.options.animationType + "-in");

            _this.overlay.className = _this.overlay.className + "modal-open";
        };

        $this.ActionSheet.prototype.hide = function () {

            $this.transitionNormal(_this.actionSheet);

            if (_this.actionCallback) {
                _this.actionCallback(_this.actionIndex);
            }

            _this.actionSheet.className = _this.actionSheet.className.replace(_this.options.animationType + "-in", _this.options.animationType + "-out");
            _this.overlay.className = _this.overlay.className.replace("modal-open", "");

            _this.actionSheet.addEventListener($this.transitionEnd, function () {
                _this.actionSheet.parentNode.removeChild(_this.actionSheet);
            });

            _this.overlay.addEventListener($this.transitionEnd, function () {
                if (_this.overlay.parentNode) {
                    _this.overlay.parentNode.removeChild(_this.overlay);
                }
            });
        };

        if (_this.options.autoShow) {
            _this.show();
        }
    };
    //给元素添加动画
    this.addAnimation = function (el, type) {

        if (elLabel.indexOf(el.localName) > -1 && el.style.display == "") {
            el.setAttribute("is-add", true);
            el.style.display = "inline-block";
        }

        if (el.classList.contains(type + "-in")) {
            el.classList.replace(type + "-in", type + "-out")
        } else if (el.classList.contains(type + "-out")) {
            if (el.getAttribute("is-add")) {
                el.style.display = "";
                el.removeAttribute("is-add");
            }
            el.classList.replace(type + "-out", type + "-in");
        } else if (el.classList.length == 0) {
            el.classList.add(type + "-out");
        }
    };
    //滚动区域，可回弹
    this.myScroll = function (ctx) {
        var ol = ctx.firstElementChild || ctx.firstChild,
            //最大溢出值
            offset = 50,
            //列表滑动位置
            cur = 0,
            isDown = false,
            //滑动的力度
            vy = 0,
            //弹力,值越大,到度或到顶后,可以继续拉的越远
            fl = 150,
            //是否在滚动中
            isInTransition = false;
        //touch事件适配手机
        ctx.addEventListener("touchstart", function (e) {
            if (isInTransition) return;//如果在滚动中，则中止执行
            clearTimeout(this._timer);//清除定时器
            vy = 0;
            this._oy = e.changedTouches[0].clientY - cur;//计算鼠标按下位置与列表当前位置的差值,列表位置初始值为0
            this._cy = e.changedTouches[0].clientY;//鼠标按下的位置
            this._oh = this.scrollHeight;//列表的高度
            this._ch = this.clientHeight;//容器的高度
            this._startTime = e.timeStamp;//鼠标按下时的时间戳
            isDown = true;//鼠标是否有按下，主要防止用户是从容器外开始滑动的
        });

        ctx.addEventListener("touchmove", function (e) {
            if (isDown) {//如果鼠标是从容器里开始滑动的
                if (e.timeStamp - this._startTime > 40) {//如果是慢速滑动，就不会产生力度，列表是跟着鼠标移动的
                    this._startTime = e.timeStamp;//慢速滑动不产生力度，所以需要实时更新时间戳
                    cur = e.changedTouches[0].clientY - this._oy;//列表位置应为 鼠标当前位置减去鼠标按下时与列表位置的差值,如:列表初始位置为0,鼠标在 5的位置按,那么差值为 5,此处假如鼠标从5滑动到了4,向上滑,cur = 4-5 =-1  ,假如鼠标从5滑动到了6,向下滑,cur= 6 - 5 = 1


                    if (cur > 0) {//如果列表位置大于0,既鼠标向下滑动并到顶时
                        cur *= fl / (fl + cur);//列表位置带入弹力模拟,公式只能死记硬背了,公式为:位置 *=弹力/(弹力+位置)
                    } else if (cur < this._ch - this._oh) {//如果列表位置小于 容器高度减列表高度(因为需要负数,所以反过来减),既向上滑动到最底部时。
                        //当列表滑动到最底部时,cur的值其实是等于 容器高度减列表高度的,假设窗口高度为10,列表为30,那此时cur为 10 - 30 = -20,但这里的判断是小于,所以当cur<-20时才会触发,如 -21;
                        cur += this._oh - this._ch;//列表位置加等于 列表高度减容器高度(这是与上面不同,这里是正减,得到了一个正数) ,这里 cur 为负数,加上一个正数,延用上面的假设,此时 cur = -21 + (30-10=20) = -1 ,所以这里算的是溢出数

//                        console.log(cur);
                        cur = cur * fl / (fl - cur) - this._oh + this._ch;//然后给溢出数带入弹力,延用上面的假设,这里为   cur = -1 * 150 /(150 - -1 = 151)~= -0.99 再减去 30  等于 -30.99  再加上容器高度 -30.99+10=-20.99  ,这也是公式,要死记。。
                    }
                    setPos(cur);//移动列表
                }

                vy = e.changedTouches[0].clientY - this._cy;//记录本次移动后,与前一次鼠标位置的滑动的距离,快速滑动时才有效,慢速滑动时差值为 1 或 0,vy可以理解为滑动的力度

//                console.log(vy);
                this._cy = e.changedTouches[0].clientY;//更新前一次位置为现在的位置,以备下一次比较
            }
        }, false);

        ctx.addEventListener("touchend", mleave, false);

        ctx.addEventListener("mousedown", function (e) {
            if (isInTransition) return;//如果在滚动中，则中止执行
            clearTimeout(this._timer);//清除定时器
            vy = 0;
            this._oy = e.clientY - cur;//计算鼠标按下位置与列表当前位置的差值,列表位置初始值为0
            this._cy = e.clientY;//鼠标按下的位置
            this._oh = this.scrollHeight;//列表的高度
            this._ch = this.clientHeight;//容器的高度
            this._startTime = e.timeStamp;//鼠标按下时的时间戳
            isDown = true;//鼠标是否有按下，主要防止用户是从容器外开始滑动的

        });

        ctx.addEventListener("mousemove", function (e) {
            if (isDown) {//如果鼠标是从容器里开始滑动的
                if (e.timeStamp - this._startTime > 40) {//如果是慢速滑动，就不会产生力度，列表是跟着鼠标移动的
                    this._startTime = e.timeStamp;//慢速滑动不产生力度，所以需要实时更新时间戳
                    cur = e.clientY - this._oy;//列表位置应为 鼠标当前位置减去鼠标按下时与列表位置的差值,如:列表初始位置为0,鼠标在 5的位置按,那么差值为 5,此处假如鼠标从5滑动到了4,向上滑,cur = 4-5 =-1  ,假如鼠标从5滑动到了6,向下滑,cur= 6 - 5 = 1


                    if (cur > 0) {//如果列表位置大于0,既鼠标向下滑动并到顶时
                        cur *= fl / (fl + cur);//列表位置带入弹力模拟,公式只能死记硬背了,公式为:位置 *=弹力/(弹力+位置)
                    } else if (cur < this._ch - this._oh) {//如果列表位置小于 容器高度减列表高度(因为需要负数,所以反过来减),既向上滑动到最底部时。
                        //当列表滑动到最底部时,cur的值其实是等于 容器高度减列表高度的,假设窗口高度为10,列表为30,那此时cur为 10 - 30 = -20,但这里的判断是小于,所以当cur<-20时才会触发,如 -21;
                        cur += this._oh - this._ch;//列表位置加等于 列表高度减容器高度(这是与上面不同,这里是正减,得到了一个正数) ,这里 cur 为负数,加上一个正数,延用上面的假设,此时 cur = -21 + (30-10=20) = -1 ,所以这里算的是溢出数

//                        console.log(cur);
                        cur = cur * fl / (fl - cur) - this._oh + this._ch;//然后给溢出数带入弹力,延用上面的假设,这里为   cur = -1 * 150 /(150 - -1 = 151)~= -0.99 再减去 30  等于 -30.99  再加上容器高度 -30.99+10=-20.99  ,这也是公式,要死记。。
                    }
                    setPos(cur);//移动列表
                }
                vy = e.clientY - this._cy;//记录本次移动后,与前一次鼠标位置的滑动的距离,快速滑动时才有效,慢速滑动时差值为 1 或 0,vy可以理解为滑动的力度
                this._cy = e.clientY;//更新前一次位置为现在的位置,以备下一次比较
            }
        }, false);

        ctx.addEventListener("mouseleave", mleave, false);

        ctx.addEventListener("mouseup", mleave, false);

        function setPos(y) {//传们列表y轴位置,移动列表
            ol.style.transform = "translateY(" + y + "px) translateZ(0)";
        }

        function ease(target) {
            isInTransition = true;
            //回弹算法为  当前位置 减 目标位置 取2个百分点 递减
            ctx._timer = setInterval(function () {
                cur -= (cur - target) * 0.2;
                //减到 当前位置 与 目标位置相差小于1 之后直接归位
                if (Math.abs(cur - target) < 1) {
                    cur = target;
                    clearInterval(ctx._timer);
                    isInTransition = false;
                }
                setPos(cur);
            }, 20);
        }

        function mleave() {
            if (isDown) {
                isDown = false;
                var t = this,
                    //根据力度套用公式计算出惯性大小,公式要记住
                    friction = ((vy >> 31) * 2 + 1) * 0.5,
                    oh = this.scrollHeight - this.clientHeight;
                this._timer = setInterval(function () {
                    //力度按 惯性的大小递减
                    vy -= friction;
                    //转换为额外的滑动距离
                    cur += vy;
                    //滑动列表
                    setPos(cur);
                    //如果列表底部超出了
                    if (-cur - oh > offset) {
                        clearTimeout(t._timer);
                        //回弹
                        ease(-oh);
                        return;
                    }
                    //如果列表顶部超出了
                    if (cur > offset) {
                        clearTimeout(t._timer);
                        //回弹
                        ease(0);
                        return;
                    }
                    //如果力度减小到小于1了,再做超出回弹
                    if (Math.abs(vy) < 1) {
                        clearTimeout(t._timer);
                        if (cur > 0) {
                            ease(0);
                            return;
                        }
                        if (-cur > oh) {
                            ease(-oh);
                        }
                    }
                }, 20);
            }
        }
    };
    //时间
    this.lxDate = function () {
        var _this = this;
        this.date = new Date();
        this.options = {
            isTen: true,
            date: null,
            format: null,
            action: "",
            number: 0
        };

        if (arguments.length == 1) {
            var str = arguments[0];
            if (typeof str == 'object') {
                this.options = $this.extendDefaults(this.options, arguments[0]);
            } else {
                if (str == "Y" || str == "M" || str == "D" || str == "h" || str == "m" || str == "s" || str == "d") {
                    this.date = getDate()[str];
                } else {
                    dateFormat(arguments[0]);
                }
            }
        }

        //获取处理后的时间
        function getDate() {
            var date = _this.date;
            var obj = {
                Y: date.getFullYear(),
                M: date.getMonth() + 1,
                D: date.getDate(),
                h: date.getHours(),
                m: date.getMinutes(),
                s: date.getSeconds(),
                d: date.getDay()
            };

            if ((_this.options && _this.options.isTen) || !_this.options) {
                for (var i in obj) {
                    if (i != "Y" && i != "d") {
                        obj[i] = isTen(obj[i]);
                    }
                }
            }
            return obj;
        }

        //是否大于10
        function isTen(data) {
            if (data > 10) {
                return data;
            }
            return '0' + data;
        }

        //格式化，必须是YYYY,yyyy,MM,DD,dd,hh,HH,mm,ss,SS格式
        function dateFormat(format) {
            var obj = getDate();
            format = format.replace(/Y{1,4}|y{1,4}/, obj.Y);
            format = format.replace(/M{1,2}/, obj.M);
            format = format.replace(/D{1,2}|d{1,2}/, obj.D);
            format = format.replace(/h{1,2}|H{1,2}/, obj.h);
            format = format.replace(/m{1,2}/, obj.m);
            format = format.replace(/s{1,2}|S{1,2}/, obj.s);
            _this.date = format;
        }

        if (this.options.date) {
            this.date = new Date(this.options.date);
        }

        if (this.options.action != "") {
            var now = this.date.valueOf();
            if (this.options.action == "day") {
                this.date = now + 1000 * 3600 * 24 * this.options.number;
            } else if (this.options.action == "hour") {
                this.date = now + 3600 * this.options.number;
            } else if (this.options.action == "minutes") {
                this.date = now + 60 * this.options.number;
            }
        }

        if (this.options.format) {
            if (this.date instanceof Date) {
                dateFormat(this.options.format);
            } else if (typeof this.date == "number") {
                this.date = new Date(this.date);
                dateFormat(this.options.format);
            }
        }

        return this.date;
    };
    //picker-scroll
    this.pickerScroll = function (el, h, callback) {
        var ol = el.firstElementChild || el.firstChild,
            vy = 0,
            cur = 0,
            fl = 150,
            offset = 50,
            current = null,
            isDown = false,
            isInScroll = false,
            allItem = ol.querySelectorAll(".picker-item");

        h = parseFloat(h);

        setActive(1);

        el.removeEventListener("touchstart", start, false);
        el.removeEventListener("touchmove", move, false);
        el.removeEventListener("touchend", leave, false);

        el.addEventListener("touchstart", start, false);

        el.addEventListener("touchmove", move, false);

        el.addEventListener("touchend", leave, false);

        function start(e) {
            if (isInScroll) return;
            vy = 0;
            clearTimeout(this._timer);
            this._oy = e.changedTouches[0].clientY - cur;
            this._cy = e.changedTouches[0].clientY;
            this._oh = this.scrollHeight;
            this._ch = this.clientHeight;
            this._startTime = e.timeStamp;
            isDown = true;
        }

        function move(e) {
            if (isDown) {
                if (e.timeStamp - this._startTime > 40) {
                    this._startTime = e.timeStamp;
                    cur = e.changedTouches[0].clientY - this._oy;
                    if (cur > 0) {
                        cur *= fl / (fl + cur);
                    } else if (cur < this._ch - this._oh) {
                        cur += this._oh - this._ch;
                        cur = cur * fl / (fl - cur) - this._oh + this._ch;
                    }
                    setPos(cur);
                }
                vy = e.changedTouches[0].clientY - this._cy;
                this._cy = e.changedTouches[0].clientY;
            }
        }

        function setPos(y) {
            setActive();
            ol.style.transform = "translateY(" + y + "px) translateZ(0)";
        }

        function removeActive() {
            [].forEach.call(allItem, function (item) {
                item.classList.remove("active");
            });
        }

        function addClass(index, type) {
            current = ol.getElementsByClassName("picker-item").item(index);
            if (current.classList.contains("active"))
                return;
            removeActive();
            current.classList.add("active");
            if (type)
                return;
            callback(index - 5);
        }

        function setActive(type) {
            var index = 0;
            if (cur % h >= -h && cur % h <= h) {
                index = Math.round(cur / h);
                if (Math.abs(index) >= allItem.length - 10)
                    index = allItem.length - 10 + 5;
                else
                    index = index > 0 ? 5 : Math.abs(index) + 5;
                addClass(index, type);
            }
        }

        function ease(target) {
            isInScroll = true;
            el._timer = setInterval(function () {
                setActive();
                cur -= (cur - target) * 0.2;
                if (Math.abs(cur - target) < 1) {
                    cur = target;
                    clearInterval(el._timer);
                    isInScroll = false;
                }
                setPos(cur);
            }, 20);
        }

        function leave() {
            if (isDown) {
                isDown = false;
                var t = this,
                    friction = ((vy >> 31) * 2 + 1) * 0.5,
                    oh = this.scrollHeight - this.clientHeight;

                this._timer = setInterval(function () {
                    vy -= friction;
                    cur += vy;
                    setPos(cur);
                    if (-cur - oh > offset) {
                        clearTimeout(t._timer);
                        ease(-oh);
                        return;
                    }
                    if (cur > offset) {
                        clearTimeout(t._timer);
                        ease(0);
                        return;
                    }
                    if (Math.abs(vy) < 1) {
                        clearTimeout(t._timer);
                        if (cur > 0) {
                            ease(0);
                            return;
                        }
                        if (-cur > oh) {
                            ease(-oh);
                            return;
                        }
                        if (cur % h != 0) {
                            cur = Math.round(cur / h) * h;
                            ease(cur);
                        }
                    }
                }, 20);
            }
        }
    };
    //picker
    this.Picker = function () {
        var _this = this;
        this.cancel = null;
        this.picker = null;
        this.options = {
            data: [{name: "123"}],
            label: "name",
            value: "name",
            child: "",
            type: "address",
            cancel: false,
            cancelText: "取消",
            okText: "确认",
            dataIndex: [10, 0, 0]
        };

        if (arguments[0] && typeof arguments[0] == "object") {
            this.options = $this.extendDefaults(this.options, arguments[0]);
        }

        function createList(list, index) {
            var listDiv = document.createElement("div");
            listDiv.className = "picker-list";
            var scrollDiv = document.createElement("div");
            scrollDiv.className = "picker-scroll";
            listDiv.appendChild(scrollDiv);
            for (var i in list) {
                var data = list[i];
                var div = document.createElement("div");
                div.className = "picker-item";
                div.setAttribute("value", data[_this.options.value]);
                div.setAttribute("index", i);
                div.innerHTML = data[_this.options.label];
                scrollDiv.appendChild(div);
            }
            if (index) {
                _this.picker.children[index].children[0].appendChild(listDiv);
            } else {
                _this.picker.appendChild(listDiv);
            }
        }

        function addBlock(index) {
            function setBlock(el) {
                for (var i = 0; i < 5; i++) {
                    var divFirst = document.createElement("div");
                    divFirst.className = "picker-item";
                    divFirst.innerHTML = i.toString();
                    divFirst.style.visibility = "hidden";
                    el.prepend(divFirst);
                }
                for (var j = 0; j < 4; j++) {
                    var divLast = document.createElement("div");
                    divLast.className = "picker-item";
                    divLast.innerHTML = i.toString();
                    divLast.style.visibility = "hidden";
                    el.appendChild(divLast);
                }
            }

            [].forEach.call(_this.picker.querySelectorAll(".picker-scroll"), function (el, k) {
                if (index) {
                    if (index == k) {
                        setBlock(el);
                    }
                } else {
                    setBlock(el);
                }
            });
        }

        function calcPosition() {
            var position = document.createElement("div");
            var top = _this.showHeight * 5 + parseInt($this.vh2px(1));
            var style = "top:" + top + "px;opacity:0.3;position:absolute;background-color:red;width:100%;height:" + _this.showHeight + "px";
            position.setAttribute("style", style);
            _this.picker.appendChild(position);
            addBlock();
        }

        function build() {
            var doc = document.createDocumentFragment();

            _this.picker = document.createElement("div");
            _this.picker.className = "picker-panel";

            if (_this.options.cancel) {
                var header = document.createElement("div");
                header.className = "picker-header";
                var cancel = document.createElement("div");
                cancel.className = "picker-cancel";
                cancel.innerHTML = _this.options.cancelText;
                var ok = document.createElement("div");
                ok.className = "picker-ok";
                ok.innerHTML = _this.options.okText;
                header.appendChild(cancel);
                header.appendChild(ok);
                _this.picker.appendChild(header);
            }

            createList(_this.options.data);

            if (_this.options.type == "address") {
                if (_this.options.child != "") {
                    var cityList = _this.options.data[_this.options.dataIndex[0]][_this.options.child];
                    createList(cityList);
                    var countyList = cityList[_this.options.dataIndex[1]][_this.options.child];
                    createList(countyList);
                }
            }

            doc.appendChild($this.createMask("modal-open"));

            doc.appendChild(_this.picker);

            document.body.appendChild(doc);
        }

        function reCopy(list, i) {
            var pickerList = _this.picker.getElementsByClassName("picker-list")[i];
            var itemDivList = pickerList.getElementsByClassName("picker-item");
            for (var j = 0; j < itemDivList.length; j++) {
                var itemDiv = itemDivList[j];
                var index = itemDiv.getAttribute("index");
                if (index) {
                    index = parseInt(index);
                    itemDiv.innerHTML = list[index][_this.options.label];
                    itemDiv.setAttribute("value", list[index][_this.options.value]);
                }
            }
        }

        function initScrollListener() {
            [].forEach.call(_this.picker.querySelectorAll(".picker-list"), function (el, i) {
                $this.pickerScroll(el, _this.showHeight, function (index) {
                    if (i == 0) {
                        var list = _this.options.data[index][_this.options.child];
                        reCopy(list, 1);
                    }
                });
            });
        }

        $this.Picker.prototype.show = function () {
            build.call(this);
            window.getComputedStyle(_this.picker).height;
            this.showHeight = $this.vh2px(3.9).toFixed(3);
            calcPosition.call(this);
            initScrollListener.call(this);
        };
    };
    //swipe
    this.Swipe = function () {
        var _this = this;
        this.swipe = null;
        this.swipeWrapper = null;
        this.swipeDot = null;
        this.swipeLength = 0;
        this.startPoint = [0, 0];
        this.swipeTimer = null;

        this.options = {
            el: "",
            list: [],
            index: 0,
            width: "100%",
            height: 120,
            time: 2000,
            is3d: false,
            isShowDot: true,
            autoplay: false,
            isVertical: false,
            swipeContainerName: ""
        };

        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = $this.extendDefaults(this.options, arguments[0]);
        }

        function build() {
            _this.swipe = document.getElementById(_this.options.el);
            _this.swipe.className = "swipe-container "+ _this.options.swipeContainerName;
            if (_this.options.is3d) {
                _this.swipe.classList.add("third");
            }

            _this.swipeWrapper = document.createElement("div");
            _this.swipeWrapper.className = "swipe-wrapper";

            if (_this.options.is3d) {
                _this.swipeWrapper.classList.add("third");
            }

            _this.swipeLength = _this.options.list.length;

            _this.options.index = -_this.options.index - 1;

            //根据传入的宽高计算图片宽高，已经容器的宽高
            if (typeof _this.options.height == "number") {
                _this.swipe.style.height = _this.options.height + "px";
            } else {
                _this.swipe.style.height = _this.options.height;
                var height = window.getComputedStyle(_this.swipe).getPropertyValue("height");
                _this.options.height = parseFloat(height.replace("px", ""));
            }

            if (typeof _this.options.width == "number") {
                _this.swipe.style.width = _this.options.width + "px";
            } else {
                _this.swipe.style.width = _this.options.width;
                var width = window.getComputedStyle(_this.swipe).getPropertyValue("width");
                _this.options.width = parseFloat(width.replace("px", ""));
            }

            //把轮播图添加进容器
            for (var i = 0; i < _this.options.list.length; i++) {
                var item = _this.options.list[i];
                if (typeof item == "string") {
                    var img = document.createElement("img");
                    img.src = item;
                    img.className = "swipe-item";
                    img.style = "width:" + _this.options.width + "px;height:" + _this.options.height + "px";
                    if (_this.options.isVertical) {
                        img.classList.add("block");
                    }
                    if (_this.options.is3d) {
                        img.classList.add("third");
                    }
                    _this.swipeWrapper.appendChild(img);
                }
            }

            var first = _this.swipeWrapper.children[0].cloneNode(true);
            var last = _this.swipeWrapper.children[_this.swipeLength - 1].cloneNode(true);
            _this.swipeWrapper.prepend(last);
            _this.swipeWrapper.appendChild(first);

            if (_this.options.isShowDot) {
                _this.swipeDot = document.createElement("div");
                _this.swipeDot.className = "swipe-dot";
                for (var j = 0; j < _this.swipeLength; j++) {
                    var dot = document.createElement("div");
                    dot.className = "swipe-dot-item";
                    if (-j - 1 == _this.options.index) {
                        dot.classList.add("active");
                    }
                    _this.swipeDot.appendChild(dot);
                }

                if (_this.options.isVertical) {
                    _this.swipeDot.classList.add("swipe-dot-vertical");
                }

                _this.swipe.appendChild(_this.swipeDot);
            }

            if (_this.options.isVertical) {
                _this.swipeWrapper.style.width = _this.options.width + "px";
                _this.swipeWrapper.style.height = (_this.swipeLength + 2) * _this.options.height + "px";
                _this.swipeWrapper.style.transform = "translate(0," + -_this.options.height + "px)";
            } else {
                _this.swipeWrapper.style.height = _this.options.height + "px";
                _this.swipeWrapper.style.width = (_this.swipeLength + 2) * _this.options.width + "px";
                _this.swipeWrapper.style.transform = "translate(" + -_this.options.width + "px,0)";
            }

            _this.swipe.appendChild(_this.swipeWrapper);
        }

        function initEvent() {
            var isDown = false;
            _this.swipeWrapper.addEventListener("touchstart", function (e) {
                isDown = true;
                //移动端手指点下，则取消自动轮播
                _this.swipeTimer && clearInterval(_this.swipeTimer);
                _this.startPoint = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
            }, false);

            _this.swipeWrapper.addEventListener("touchend", function (e) {
                if (isDown) {
                    isDown = false;
                    var endPoint = e.changedTouches[0];
                    if (_this.options.isVertical) {
                        if (endPoint.clientY - _this.startPoint[1] > 0) {
                            _this.options.index++;
                        } else {
                            _this.options.index--;
                        }
                        scrollToIndex();
                    } else {
                        if (endPoint.clientX - _this.startPoint[0] > 0) {
                            _this.options.index++;
                        } else {
                            _this.options.index--;
                        }
                        scrollToIndex();
                    }
                }

                if (_this.options.autoplay) {
                    autoplay();
                }
            }, false);

        }

        function scrollToIndex() {
            _this.swipeWrapper.style.transition = "500ms transform ease";
            if (_this.options.isVertical) {
                _this.swipeWrapper.style.transform = "translate(0," + _this.options.index * _this.options.height + "px)";
            } else {
                _this.swipeWrapper.style.transform = "translate(" + _this.options.index * _this.options.width + "px,0)";
            }

            //切换指示器
            if (_this.options.isShowDot) {
                [].forEach.call(_this.swipeDot.children, function (el) {
                    el.classList.remove("active");
                });
                if (_this.options.index == 0) {
                    _this.swipeDot.children[_this.swipeLength - 1].classList.add("active");
                } else if (Math.abs(_this.options.index) == _this.swipeLength + 1) {
                    _this.swipeDot.children[0].classList.add("active");
                } else {
                    _this.swipeDot.children[-_this.options.index - 1].classList.add("active");
                }
            }

            function resetFirst() {
                _this.options.index = -1;
                _this.swipeWrapper.style.transition = "none";
                if (_this.options.isVertical) {
                    _this.swipeWrapper.style.transform = "translate(0," + -_this.options.height + "px)";
                } else {
                    _this.swipeWrapper.style.transform = "translate(" + -_this.options.width + "px,0)";
                }
                _this.swipeWrapper.removeEventListener($this.transitionEnd, resetFirst);
            }

            function resetLast() {
                _this.options.index = -_this.swipeLength;
                _this.swipeWrapper.style.transition = "none";
                if (_this.options.isVertical) {
                    _this.swipeWrapper.style.transform = "translate(0," + _this.options.height * _this.options.index + "px)";
                } else {
                    _this.swipeWrapper.style.transform = "translate(" + _this.options.width * _this.options.index + "px,0)";
                }
                _this.swipeWrapper.removeEventListener($this.transitionEnd, resetLast);
            }

            //判断是否到达最后一张或者第一张的副本，
            //是则在移动之后，取消动画，移动整个wrapper
            if (_this.options.index == 0) {
                _this.swipeWrapper.addEventListener($this.transitionEnd, resetLast);
            }

            if (Math.abs(_this.options.index) == _this.swipeLength + 1) {
                _this.swipeWrapper.addEventListener($this.transitionEnd, resetFirst);
            }

        }

        function autoplay() {
            if (_this.options.autoplay) {
                _this.swipeTimer = setInterval(function () {
                    _this.options.index--;
                    scrollToIndex();
                }, _this.options.time);
            }
        }

        $this.Swipe.prototype.create = function () {
            build.call(this);
            autoplay.call(this);
            initEvent.call(this);
        };
    };
    //select
    this.Select = function () {
        this.select = null;
        this.options = {
            list: []
        };

        if (arguments[0] && typeof arguments[0] == "object") {
            this.options = $this.extendDefaults(this.options, arguments[0]);
        }


        function build() {

        }

        $this.Select.prototype.show = function () {

        };

    };
    //自动调用插入css
    this.insertStyle();
};