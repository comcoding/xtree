/**
 * 基于jquery的树结构-xtree
 * @author bin
 * @email qazzhoubin@163.com
 * @time 2012-4-20 在xoopar
 * @link http://www.cnblogs.com/laoxi/archive/2012/04/20/2459597.html
 * */
function xtree(t){
	
	if(this==window){
		return new xtree(t);
	};

	//根
	this.xroot = $(t);
	    
    //右键菜单
    this.menu = {};
    
    this.props = {"id":true, "pid":true, "name":true, "is_final":true};
    
    //叶子节点
    this.leaf = $('<li class="xtree-item xtree-item-close"><button hidefocus="true" type="button" class="xtree-noswitch"></button><a hidefocus="true" href="#" class="xtree-label"><button type="button" hidefocus="true" class="xtree-label-file"></button><span class="xtree-label-words xtree-label-node"></span></a></li>');
    
    //枝节点
    this.branch = $('<li class="xtree-item xtree-item-close"><button hidefocus="true" type="button" class="xtree-switch"></button><a hidefocus="true" href="#" class="xtree-label"><button type="button" hidefocus="true" class="xtree-label-folder"></button><span class="xtree-label-words xtree-label-node"></span></a><ul class="xtree-line" style="display:none;"></ul></li>');

    //树结构
    this.component = {
        ul : $(document.createElement('ul')),
        li : $(document.createElement('li')),
        a : $(document.createElement('a')),
        switchButton : $(document.createElement('button')),
        icoButton : $(document.createElement('button')),
        labelSpan : $(document.createElement('span'))
    };

};
xtree.prototype = {
	init:function(json, status){
		/***
		 * @name 初始化
		 * @param mixed json xthis.nodes,配置
         * @param status='close' 'open'打开,'close'关闭,
		 */
        var self = this;
        status = status || 'close';
        function _swicth(){

            $(this).parent(".xtree-item").toggleClass("xtree-item-close").children("ul:first").slideToggle(200);

        };

		//初始化
		function _init(c){
			switch(c){
				case 'open':
				  self.xroot.find(".xtree-item").removeClass("xtree-item-close");
				  self.xroot.find("ul").show();
				  break;
				default :
				  self.xroot.find(".xtree-item").addClass("xtree-item-close");
				  self.xroot.find("ul").hide();
			};			
		};

        this.component.switchButton.bind("click", _swicth);
        //this.component.a.bind('click', _swicth);

        /**
         * 构造树节点
         */
        this.xroot.prepend(this.bulidTree(json));
        _init(status.toLowerCase());

	    //节点对象
	    this.labelnode = this.xroot.find(".xtree-label-node");
		
		return this;
		
	},
    bulidTree:function(json){

        var nodes = document.createDocumentFragment();
        var deep = 1;
        var _parents = [];//pid=0的节点
        var _childs = [];//pid!=0的节点
        var ff = {};
        var self = this;

        //排序pid越小越靠前
        json.sort(function(a, b){
             return a.pid - b.pid;
        });

        var root = json[0].pid;

        for(var i=0,len=json.length;i<len;i++){

            ff = $.extend({ico:'',cls:'',url:'javascript:;'},json[i]);

            if(ff.pid==root){
                _parents.push(ff);
            }else{
                _childs.push(ff);
            }

        };
        json = null;//释放f;
        _parents.sort(function(a, b){
            if(a.seq!=undefined && b.seq!=undefined){
                return a.seq - b.seq;
            };
            return 0;
        });

        _bulid(_parents, nodes);

        //主方法
        function _bulid(data, container){
            var first = data.shift();
            var last = data.pop();
            var isLast = false;

            //li
            var li = self.component.li.clone(true);
            li.addClass('xtree-item').addClass('node_'+first.id).addClass(first.cls);
            if(!parseInt(first.open) && (first.pid!=first.id))li.addClass('xtree-item-close');
            li.attr('final', first.is_final);
            li.attr('nodeid', first['id']);
            delete first['id'];
            li.attr(first);

            //switchButton
            var switchButton = self.component.switchButton.clone(true);
            switchButton.attr({
                'hidefocus' : true,
                'type' : 'button'
            });
            if(!parseInt(first.is_final)){
                switchButton.addClass('xtree-switch');
            }else{
                switchButton.addClass('xtree-noswitch');
            };

            if(last==undefined){
                if(parseInt(first.is_final)){
                    switchButton.addClass('xtree-line-bottom');
                }else{
                    switchButton.addClass('xtree-bottom');
                };
                isLast = true;
            }else{
                if(parseInt(first.is_final)){
                    switchButton.addClass('xtree-line-mid');
                }else if(first.pid!=0){
                    switchButton.addClass('xtree-mid');
                }else{
                    switchButton.addClass('xtree-top');
                }
            };

            //a
            var a = self.component.a.clone(true);
            a.attr({
                'hidefocus' : true,
                'href' : first.url,
                'target' : '_blank'
            });
            if(first.id!=first.pid)a.addClass('xtree-label');

            //判断是否有子节点
            var icoButton = self.component.icoButton.clone(true);
            icoButton.attr({
                'type' : 'button',
                'hideFocus' : true
            });

            if(!parseInt(first.is_final)){
                icoButton.addClass('xtree-label-folder');
            }else{
                icoButton.addClass('xtree-label-file');
            };
            icoButton.addClass(first.ico);

            //label
            var labelSpan = self.component.labelSpan.clone(true);
            labelSpan.addClass('xtree-label-words xtree-label-node');
            labelSpan.html(first.name);
            a.append(icoButton);
            a.append(labelSpan);
            li.append(a);
            switchButton.insertBefore(li.children(':first-child'));
            //构造字节点
            _bulidChild(li.attr("nodeid"), isLast, li);
            li.append("<div class='xtree-clear'></div>");
            container.appendChild(li.get(0));

            //迭代_parents;
            var _p = data.shift();

            do{

                if(_p==undefined)break;
                li = self.component.li.clone(true);
                li.addClass('xtree-item').addClass('node_'+_p.id).addClass(_p.cls);
                if(!parseInt(_p.open))li.addClass('xtree-item-close');
                li.attr({
                    'final' : _p.is_final
                });
                li.attr('nodeid', _p['id']);
                delete _p['id'];
                li.attr(_p);

                var switchButton = self.component.switchButton.clone(true);
                switchButton.attr({
                    'hidefocus' : true,
                    'type' : 'button'
                });
                if(!parseInt(_p.is_final)){
                    switchButton.addClass('xtree-switch xtree-mid');
                }else{
                    switchButton.addClass('xtree-noswitch xtree-line-mid');
                };

                //a
                a = self.component.a.clone(true);
                a.attr({
                    'hidefocus' : true,
                    'href' : _p.url,
                    'target' : '_blank'
                });
                a.addClass('xtree-label');

                //icobutton
                icoButton = self.component.icoButton.clone(true);
                icoButton.attr({
                    'hidefocus' : true,
                    'type' : 'button'
                });
                if(!parseInt(_p.is_final)){
                    icoButton.addClass( 'xtree-label-folder');
                }else{
                    icoButton.addClass('xtree-label-file');
                };
                icoButton.addClass(_p.ico);

                //label
                var labelSpan = self.component.labelSpan.clone(true);
                labelSpan.addClass('xtree-label-words xtree-label-node');
                labelSpan.html(_p.name);
                a.append(icoButton);
                a.append(labelSpan);
                li.append(a);
                switchButton.insertBefore(li.children(':first-child'));
                //构造字节点
                _bulidChild(li.attr("nodeid"), false, li);
                li.append("<div class='xtree-clear'></div>");
                container.appendChild(li.get(0));
                _p = data.shift();

            }while(_p);

            //最后一个父节点
            if(last!=undefined){

                li = self.component.li.clone(true);
                li.addClass('xtree-item node_'+last.id+' '+last.cls);
                if(!parseInt(last.open))li.addClass('xtree-item-close');
                li.attr({
                    'final' : last.is_final
                });
                li.attr('nodeid', last['id']);
                delete last['id'];
                li.attr(last);

                //判断是否只有一个节点
                switchButton = self.component.switchButton.clone(true);
                switchButton.attr({
                    'hidefocus' : true,
                    'type' : 'button'
                });

                if(!parseInt(last.is_final)){
                    switchButton.addClass('xtree-switch xtree-bottom');
                }else{
                    switchButton.addClass('xtree-noswitch xtree-line-bottom');
                }

                //a
                a = self.component.a.clone(true);
                a.attr({
                    'hidefocus' : true,
                    'href' : last.url,
                    'target' : '_blank'
                });
                a.addClass('xtree-label');

                //判断是否有子节点
                icoButton = self.component.icoButton.clone(true);
                icoButton.attr({
                    'type' : 'button',
                    'hidefocus' : true
                });
                if(!parseInt(last.is_final)){
                    icoButton.addClass('xtree-label-folder');
                }else{
                    icoButton.addClass('xtree-label-file');
                };
                icoButton.addClass(last.ico);
                var labelSpan = self.component.labelSpan.clone(true);
                labelSpan.addClass('xtree-label-words xtree-label-node');
                labelSpan.html(last.name);
                a.append(icoButton);
                a.append(labelSpan);
                li.append(a);
                switchButton.insertBefore(li.children(':first-child'));
                //构造字节点
                _bulidChild(li.attr("nodeid"), true, li);
                li.append("<div class='xtree-clear'></div>");
                container.appendChild(li.get(0));

            };
        };

        /**
         * 获取子节点
         */
        function _getChild(pid){

            var _last = [];

            var _child = [];

            var _c = _childs.shift();

            do{

                if(_c!=undefined){

                    if(_c.pid == pid){

                        _child.push(_c);

                    }else{

                        _last.push(_c);

                    };

                };

                _c = _childs.shift();

            }while(_c!=undefined);

            _childs = _last;

            _last = null;

            _child.sort(function(a, b){
                if(a.seq!=undefined && b.seq!=undefined){
                    return a.seq - b.seq;
                };
                return 0;
            });

            return _child.length>0 ? _child : false;

        };

        /**
         * 构造下级节点
         */
        function _bulidChild(pid, last, container){

            last = last || false;

            var _child = _getChild(pid);

            var ul = self.component.ul.clone(true);
            var cls = 'xtree-line ';
            if(last)cls += ' xtree-line-none ';
            cls += ' deep_'+deep;
            ul.addClass(cls);
            container.append(ul);
            container.toggleClass("xtree-item-close").children("ul:first");

            if(_child!==false){
                deep++;
                _bulid(_child, ul.get(0));
                deep--;
            };

        };

        var clear = document.createElement('div');
        clear.className = 'xtree-clear';
        nodes.appendChild(clear);

        return nodes;
    },
	bindLabelNode:function(evt, callback){
		/**
		 * 给文字节点添加事件
		 * @param evt 事件名称
		 * @param callback 处理函数
		 */
		this.labelnode.bind(evt, callback);
        this.component.labelSpan.bind(evt, callback);
		
		return this;
		
	},
	contextMenu:function(menu){
		/**
		 * 右键菜单
		 * @param opt {}键值对,键名会显示为菜单名
		 */
		menu = menu || {};
        this.menu = $.extend(this.menu, menu);
		var div = document.createElement("div");
        div.addEventListener('click', sentContext, true);
		div.className = "xtree-context-menu";
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.setAttribute("href", "javascript:;");
		for(var i in this.menu){
            a = a.cloneNode(false);
            li = li.cloneNode(false);
            if(this.menu[i].constructor !== Function){
                a.className = this.menu[i].ico;
                //delete this.menu[i].ico;
            };
            a.appendChild(document.createTextNode(i));
            li.appendChild(a);
			div.appendChild(li);
		};
		document.body.appendChild(div);
		var $div  =  $(div);
		
		//上下文
		var self = this;
		var context = false;
		
		this.bindLabelNode("mousedown", function(e){
			
			if(e.button==2){
				var $this = $(this);
				var offset = $this.offset();
                $div.css({
					"left":offset.left,
					"top":offset.top + $this.height()
				}).show();
				//屏蔽右键
				$(document).bind("contextmenu", function(e){
					e.preventDefault();
				}).bind("mousedown", function(e){

                    if (div.contains) {

                        var p =  div != e.target && div.contains(e.target);

                    } else {

                        var p =  !!(div.compareDocumentPosition(e.target) & 16);

                    };

                    if(!p){
                        $div.hide();
                        $(document).unbind("contextmenu");
                    }

                });
                e.stopPropagation();
				context = this;
			};
			
		});
		
		//发送上下文对象
		function sentContext(e){
            e = e || event;
            var o = e.target || e.srcElement;
            if(o.nodeType!=1 && o.nodeName.toLowerCase()!='a')return;
			var i = o.innerHTML;
			var p  = context.parentNode.parentNode;
			var btn = $(context.parentNode).prev();
			var first = last = false;
			var firstClass = lastClass = "";
			if(btn.hasClass("xtree-line-bottom")){
				lastClass = "xtree-line-bottom";
				last = true;
			}else if(btn.hasClass("xtree-bottom")){
				lastClass = "xtree-bottom";
				last = true;
			};
			if(btn.hasClass("xtree-line-top")){
				firstClass = "xtree-line-top";
				first = true;
			}else if(btn.hasClass("xtree-top")){
				firstClass = "xtree-top";
				first = true;
			};

            var callback = self.menu[i];

            if(callback.constructor !== Function){
                callback = callback.callback;
            };

            callback.call(context, {
				item:p,
				target:context,
				last:last,
				isFinal:parseInt(p.getAttribute("final")),
				first:first,
				handler:self
			});
			
			$div.hide();

		};
		
		return this;
	},
	extend:function(name, func){
		this.prototype[name] = func;
		return this;
	},
	append:function(data, target){
		/**
		 * 追加
		 * @param target 父节点
		 * @prama data xtree标准节点对象[{id,pid,name,is_final}]
		 */
		if(data.constructor != Array)data = [data];
        var node = $(target);
        var childNodes = node.children("ul:last");
		var len = data.length-1;
        var checkbox = node.children('.xtree-checkbox');

        if(checkbox.get(0)!=undefined){
            var checked = false;
            if(checkbox.hasClass('xtree-checkbox-checked')){
               checked = true;
            };
            checkbox = true;
        }else{
            checkbox = false;
        };
		
		if(node.next().get(0)==undefined){
			
			childNodes.addClass("xtree-line-none")
			
		};

        var newNode = this.bulidTree(data);
        var _nodes = $(newNode.childNodes);
        if(checkbox && checked){
            _nodes.find('.xtree-checkbox').addClass('xtree-checkbox-checked');
        };

        var prev = childNodes.children(':last-child');
		childNodes.append(newNode);

		//更改前一个兄弟节点的css样式
        prev.children("button:first").addClass(function(idx, cls){
							
			var reg = new RegExp("(^|\\s)([a-z-]+)-bottom(\\s|$)");

			if(reg.test(cls)){
				
				var mch = reg.exec(cls);
				
				return mch[2] + "-mid";
					
			}
			
		}).removeClass(function(idx, cls){
						
			var reg = new RegExp("(^|\\s)([a-z-]+)-bottom(\\s|$)");
			
			if(reg.test(cls)){
				
				var mch = reg.exec(cls);
				
				return mch[0];
					
			}
			
		});

        prev.children('ul').removeClass('xtree-line-none');
		
	},
	prepend:function(data, target){
		/**
		 * 前置
		 * @param node 父节点
		 * @prama data xtree标准节点对象[{id,pid,name,is_final}]
		 */

        if(data.constructor != Array)data = [data];
        var node = $(target);
        var childNodes = node.children("ul:last");
        var len = data.length-1;
        var checkbox = node.children('.xtree-checkbox');

        if(checkbox.get(0)!=undefined){
            var checked = false;
            if(checkbox.hasClass('xtree-checkbox-checked')){
                checked = true;
            };
            checkbox = true;
        }else{
            checkbox = false;
        };

        var newNode = this.bulidTree(data);
        var _nodes = $(newNode.childNodes);
        _nodes.children('ul').removeClass('xtree-line-none');
        if(checkbox && checked){
            _nodes.find('.xtree-checkbox').addClass('xtree-checkbox-checked');
        };

		if($(node).hasClass("xtree-root")){
			
			$(newNode).insertAfter(node);
			
		}else{
			
		   childNodes.prepend(newNode);
			
		}
		
	},
	remove:function(node){
		
		var p  = node.parentNode;
		var next = $(node).next().get(0);
		if(next==undefined || next.nodeName.toLowerCase() != "li"){

			//如果是最后一个节点,更改前一个兄弟节点的css样式
			var prev = $(node).prev();

			$(prev).children("button:first").addClass(function(idx, cls){
								
				var reg = new RegExp("(^|\\s)([a-z-]+)-mid(\\s|$)");
				
				if(reg.test(cls)){
					
					var mch = reg.exec(cls);
					
					return mch[2] + "-bottom";
						
				}
				
			}).removeClass(function(idx, cls){
							
				var reg = new RegExp("(^|\\s)([a-z-]+)-mid(\\s|$)");
				
				if(reg.test(cls)){
					
					var mch = reg.exec(cls);
					
					return mch[0];
						
				}
				
			});
		
		};

        //ie彻底清除
        var div = document.createElement('div');
        div.appendChild(node);
        div.innerHTML = "";
        div = null;
		
	},
	onSwitch:function(callback){
		/**
		 * xtree switch事件
		 */
		var self = this;
		callback = callback || function(){};
        function _f(){
            return callback.call(this, {
                item:this.parentNode,
                handler:self
            });
        };


	    this.xroot.find(".xtree-switch,.xtree-label").bind("click", _f);

        this.component.a.bind('click', _f);
        this.component.switchButton.bind('click', _f);

        return this;
	    		
	},
    checkbox:function(callback){
        /**
         * 添加多选功能
         * */
         callback = callback || function(){};
         var self = this;

         var con = callback.constructor;

         if(con == String || con == Array){

             var id = (con == Array ? callback.join(",") : callback);

             id = id.replace(/([0-9]+)/g, ".node_$1");

             this.xroot.find('.xtree-checkbox').removeClass('xtree-checkbox-checked').removeClass('xtree-checkbox-half');

             this.xroot.find(id).children('.xtree-checkbox').trigger('click');

             return this;

         };

         var relateCheck = arguments[1]===false ? arguments[1] : true;//关联选择

         var checkbox = $('<button hidefocus="true" type="button" class="xtree-checkbox" />').bind("click", function(e){

                                                 var $this = $(this);
                                                 var checked = 0;
                                                 if(relateCheck){
                                                     var chk =  $(this.parentNode).find(".xtree-checkbox");
                                                 }else{
                                                     var chk =  $(this.parentNode).children(".xtree-checkbox");
                                                 };
                                                 if($this.hasClass('xtree-checkbox-checked') && e.button != undefined){
                                                     $this.removeClass('xtree-checkbox-checked');
                                                     chk.removeClass('xtree-checkbox-checked').removeClass('xtree-checkbox-half');
                                                 }else{
                                                     $this.removeClass('xtree-checkbox-half').addClass('xtree-checkbox-checked');
                                                     chk.removeClass('xtree-checkbox-half').addClass('xtree-checkbox-checked');
                                                     checked = 1;
                                                 };
                                                 if(relateCheck)_checkParent(this);
                                                 callback.call(this,{
                                                     item:this.parentNode,
                                                     handler:self,
                                                     target:this,
                                                     checked:checked,
                                                     event:e
                                                 });
                                          }).mouseover(function(){
                                              var $this = $(this);
                                              if($this.hasClass('xtree-checkbox-checked')){
                                                  $this.addClass('xtree-checkbox-checked-over');
                                              }else{
                                                  $this.addClass('xtree-checkbox-over');
                                              }
                                          }).mouseout(function(){
                                             var $this = $(this);
                                             $this.removeClass('xtree-checkbox-checked-over');
                                             $this.removeClass('xtree-checkbox-over');
                                          }).mousedown(function(){
                                             var $this = $(this);
                                             if($this.hasClass('xtree-checkbox-checked')){
                                                 $this.addClass('xtree-checkbox-down');
                                             }else{
                                                 $this.addClass('xtree-checkbox-checked-down');
                                             }
                                          }).mouseup(function(){
                                             var $this = $(this);
                                             $this.removeClass('xtree-checkbox-checked-down');
                                             $this.removeClass('xtree-checkbox-down');
                                             $this.removeClass('xtree-checkbox-checked-over');
                                          });

         checkbox.insertAfter(this.xroot.find(".xtree-switch,.xtree-noswitch"));
         checkbox.clone(true).appendTo(this.component.li);

         /**
          * 递归查找
          * */
        function _checkParent(node){

             if(node==undefined)return;

             var p = node.parentNode;

             if(p==undefined)return;

             var siblings = $(p).siblings();

             var checked = len = siblings.length + 1;

             var half = false;

             if(!$(node).hasClass('xtree-checkbox-checked') && !$(node).hasClass('xtree-checkbox-half')){
                 checked--;
             };

             if($(node).hasClass('xtree-checkbox-half')){
                 half = true;
             }

             siblings.each(function(){
                 var chk = $(this).find(".xtree-checkbox");
                 if(!chk.hasClass('xtree-checkbox-checked') && !chk.hasClass('xtree-checkbox-half')){
                     checked--;
                 }
                 if(chk.hasClass('xtree-checkbox-half')){
                     half = true
                 }
             });

             var pNode = $(p.parentNode.parentNode).children(".xtree-checkbox:first");
             if((checked>0 && checked<len) || half){
                 pNode.removeClass('xtree-checkbox-checked').addClass("xtree-checkbox-half");
             }else if(checked == len){
                 pNode.removeClass("xtree-checkbox-half").addClass('xtree-checkbox-checked');
             }else{
                 pNode.removeClass("xtree-checkbox-half").removeClass('xtree-checkbox-checked');
             };
             _checkParent(pNode.get(0));

        };
        return this;
     },
    getChecked:function(deep){
        deep = deep || 0;
        var checked = [];
        var checkbox = false;
        if(deep == 0){
            checkbox = this.xroot.find(".xtree-checkbox");
        }else{
            checkbox = this.xroot.find(".deep_"+deep).find('.xtree-checkbox');
        }
        checkbox.each(function(){
            var $this = $(this);
            var self = this;
            if($this.hasClass('xtree-checkbox-checked') || $this.hasClass('xtree-checkbox-half')){
                checked.push(this.parentNode.getAttribute("nodeId"));
            }
        });
        return checked;
    },
    open:function(deep){
        //打开
        deep = deep || false;
        var ul = this.xroot.find("ul");
        ul.hide();
        this.xroot.find(".xtree-item").removeClass("xtree-item-close");
        if(!deep){
            this.xroot.find("li>ul:first").show().find("li").addClass('xtree-item-close');
        }else{
            ul.show();
        }
        return this;
     },
    find:function(id){
       //根据节点id查找
       return this.xroot.find('.node_'+id).get(0);
    },
    sortable:function(opt, callback){
        var that = this;
        var li = this.xroot.find('li>ul:first .xtree-item');
        var cb = callback || function(){};
        opt = opt || {};
        opt = $.extend({
            'placeholder':'ui-state-highlight',
            forceHelperSize:true,
            handle:'.xtree-label',
            containment: 'parent'
        }, opt);
        opt['update'] = function(event, uiHandler){
            cb.call(that.xroot, uiHandler.item[0]);
        };

        var _item = this.xroot.find("ul");
        _item.sortable(opt);

        this.xroot.disableSelection();
        return this;
    }
};
