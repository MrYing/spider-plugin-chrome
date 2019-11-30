(function(){
var $$ = window.$$ = {};
$$.isFunc = function(a){  return 'function' == typeof(a);};
$$.map = function(arrays, fun){
	var dist = [];
	for(var i = 0; i < arrays.length; i++ ){
		dist.push(fun(arrays[i]));
	}
	return dist;
};
$$.copy = function(source, dist, arg1, arg2){
	var ingoreExists = arg1 || true;
	var ignoreFunc = arg2 || true;
	for(var f in source){
		if(ingoreExists && dist.hasOwnProperty(f)){
			continue;
		}else{
			if(ignoreFunc && $$.isFunc(source[f])){
				continue;
			}else{
				dist[f] = source[f];
			}
		}
	}
	return dist;
}

})();





$(function(){

	var port = chrome.extension.connect({ name : "WeExps" });
	var tables = {};
	tables.ths = function(heads){
		return $$.map(heads, function(head){
			return "<th>$VALUE</th>".replace("$VALUE", head);
		}).join("");
	};
	tables.thead = function(heads){
		return "<thead><tr>$VALUE</tr></thead>".replace("$VALUE", this.ths(heads));
	};
	tables.tds = function(eles){
		return $$.map(eles, function(ele){
			if(!ele.href) {
				return '<td>$VALUE</td>'.replace("$VALUE", ele);
			}
			return '<td> <a href="$HERF" target="_blank">$VALUE</a></td>'.replace("$VALUE", ele.value).replace("$HERF",ele.href);
			
		}).join("");
	};
	tables.tr = function(eles){
		return '<tr>$VALUE</tr>'.replace("$VALUE", this.tds(eles));
	};

	tables.trs = function(elesArray){
		return $$.map(elesArray, function(eles){
			return tables.tr(eles);
		}).join("\n");
	};

	function TablePanel(data){
		var PANEL_SOURCE = '<div class="table-panel" style="background:#fff;width: 800px; border-sizing:border-box; padding:10px 10px; border: 1px solid #ccc;">	<div style="padding: 3px; text-align: center; font-size: 14px;">		<span class="title">标题</span>	</div>	<div style="text-align: left; padding-right: 1px; padding: 2px;">		<span style="background: #ccc; border-radius: 5px; padding: 0 5px; font-size: 10px;">			<span>记录数:</span>			<span class="size"></span>		</span>	</div>	<div style="max-height: 80%; overflow: auto; height: auto;">		<table class="table" style="width: 100px; min-height: 100px;"></table>	</div>	<div style="text-align: right; margin-top: 15px; padding: 0px; font-size:12px;font-size:12px;">		<span class="close" style="display: inline-block; padding: 5px 20px; background: #ccc; border-radius: 5px;">关闭</span>		<span class="submit" style="display: inline-block; padding: 5px 20px; background: #66bb6a; border-radius: 5px; margin-left: 30px;">提交</span>	</div></div>';
		var self = this;
		this.data = data;
		var panel = this.panel = $(PANEL_SOURCE);
		var title = panel.find("span.title");
		var size  = panel.find("span.size");
		var table = this.table = panel.find(".table");
		var closeBtn =  this.closeBtn  = panel.find("span.close");
		var submitBtn = this.submitBtn = panel.find("span.submit");
		submitBtn.click(function(){ 
			port.postMessage(self.data);
		});
		closeBtn.click( function(){  self.hide();});
		$(window).resize(function(){
			if(panel.__showed__){
				self.resize();
			}
		});


		this.show = function(){
			var data = self.data;
			title.html(self.data.title);
			size.html(self.data.rows.length);
			table.append($(tables.thead(data.head)).css({ background:"#ccc", width:"100%" }));
			table.append(tables.trs(data.rows)).css({ background:"#eee", width:"100%" });
			table.css({"border-collapse":"collapse", "border-spacing":0, border:"1px solid #ccc;"})
			table.find("th").css({border: "1px solid #ccc", "text-align":"center", 'pddding':"3px 0" })
			table.find("td").css({border: "1px solid #ccc", "text-align":"center"});

			this.draw();
		};


		this.draw = function(){
			
			var height = Math.max(Math.min($(window).height() * 0.8 , 600), 480);
			panel.css({
				position:"fixed",
				height: height ,
				top:  Math.max(0, ($(window).height() - height ) / 2 ),
				left: Math.max(0, ($(window).width()  - panel.width()) / 2 ),
				"z-index":99,
				"box-shadow":"1px 1px 2px #ccc, -1px -1px 2px #ccc",					
			});
			panel.__showed__ = true;
			panel.appendTo($("body"));
			panel.show();	

		};

		var clear = function() {
			title.html("");
			size.html("");
			table.children().remove();
		};


		this.resize = function() {
			panel.hide();
			this.draw();
		};

		this.hide = function(){
			panel.__showed__ = false;
			panel.hide();
			clear();
		};

	}



  	


   	function Btns(){
   		var self = this;
   		function createBtn(name){
	   		var btn = $('<div class="btn" style="display:table-row; width: 100%; height: 40px; text-align: center; box-sizing:inherit;">'
	    	  + '<div style="display: table-cell; height: 40px; vertical-align: middle;">'
	    	  + name
	    	  +'</div></div>');
	   		return btn;

	   	};

	   	function createBtns(){
	   		return window._btns_ || (window._btns_ = $('<div id="we-exps-btns" style="position: fixed; z-index: 100; left: 10px; bottom: 200px; display: table;  background: #ccc; border: 1px solid #999; width: 40px; height:auto; box-sizing: border-box;font-size: 8px; word-spacing: all; border-radius: 1px 1px 1px 1px ;">'));
	   	};

		var btns = this.btns = createBtns(); 
		this.add = function(name,dbuilder){
			var btn = createBtn(name);
			btn[0].datasource = dbuilder;
			btn.appendTo(btns);

		};
		this.show = function(){
			btns.appendTo($('body'));
			btns.show();
		};
		this.hide = function(){
			btns.hide();
		};
		$(btns).delegate('.btn','click', function(){
			var datasource = this.datasource;
			var data = $$.copy(datasource,  {
				title: datasource.title,
				head : datasource.head,
				rows : datasource.rows(),
				submit: datasource.submit
			});
			self.panel = new TablePanel(data)
			self.panel.show();
		});
  	}


   var btns = new Btns();
   btns.add("We");
   btns.add("淘宝", { 
   		title: '淘宝搜索排行',
   		type:'tb_search_zhph',
   		href: 'http://spider.cokebook.xyz/data/save',
   		head: ['名称','价格', '人数','店铺'],
   		ext:{
   			q: $("input[name=q]").val(),
   			page:$("#mainsrp-pager li.active span").html()		
   		},
   		rows: function(){
   				return $$.map($("body .m-itemlist .item"),function(ele){

   					return [
	   						{ 
	   						value:  $(ele).find(".ctx-box .title a").html().replace(/<.*?>/g,"").trim(), 
	   					  	href:  $(ele).find(".ctx-box .title a").attr("href")
	   					    },
	   						$(ele).find(".ctx-box .price strong").html(),
	   						$(ele).find(".ctx-box .deal-cnt").html().replace("人付款",""),
	   						{ 
	   							value: $(ele).find(".ctx-box .shop a").html().replace(/<.*?>/g,"").trim(),
	   							href: $(ele).find(".ctx-box .shop a").attr("href")
	   						}
   					]

   				});
   		}
   });
   btns.add("店铺<br/>排行", {
   		title: '行业排行-店铺',
   		href: 'http://spider.cokebook.xyz/data/save',
   		type: 'sycm_ranking_shop',
   		head: ['排行','店铺', '交易指数'],
   		rows: function(){
   			var result = [];
   			return $$.map( $("#floor-industry div.oui-card-content .home-card-module:eq(0) .ant-table-content .ant-table-tbody tr"), function(ele){
   				var tr = $(ele);
   				return [
   					tr.find('td:eq(0)').html().replace(/<.*?>/g, ""),
   					{
   						value: tr.find('td:eq(1) .shopName a').html(),
   						href: tr.find('td:eq(1) .shopName a').attr("href")
   					},
   					tr.find("td:eq(2) span:eq(0)").html()
   				];
   			});
   		},

   });

   btns.add("商品<br/>排行", {
   		title: '行业排行-商品',
   		href: 'http://spider.cokebook.xyz/data/save',
   		type: 'sycm_ranking_goods',
   		head: ['排行','商品', '交易指数'],
   		rows: function(){
   			var result = [];
   			return $$.map( $("#floor-industry div.oui-card-content .home-card-module:eq(1) .ant-table-content .ant-table-tbody tr"), function(ele){
   				var tr = $(ele);
   				return [
   					tr.find('td:eq(0)').html().replace(/<.*?>/g, ""),
   					{
   						value: tr.find('td:eq(1) .goodsName a').html(),
   						href: tr.find('td:eq(1) .goodsName a').attr("href")
   					},
   					tr.find("td:eq(2) span:eq(0)").html()
   				];
   			});
   		},

   });

   btns.add("搜索<br/>排行", {
   		title: '行业排行-搜索词',
   		href: 'http://spider.cokebook.xyz/data/save',
   		type: 'sycm_ranking_goods',
   		head: ['排行','搜索词', '交易指数'],
   		rows: function(){
   			var result = [];
   			return $$.map( $("#floor-industry div.oui-card-content .home-card-module:eq(2) .ant-table-content .ant-table-tbody tr"), function(ele){
   				var tr = $(ele);
   				return [
   					tr.find('td:eq(0)').html().replace(/<.*?>/g, ""),
   					{
   						value: tr.find('td:eq(1)  a').html(),
   						href: tr.find('td:eq(1) a').attr("href")
   					},
   					tr.find("td:eq(2) span:eq(0)").html()
   				];
   			});
   		},

   });

   btns.show();

});