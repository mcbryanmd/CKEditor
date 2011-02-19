(function( $, window, document, undefined ) {
window.search = {
	plugin : {
		currentInstance : "",
		fn : function () {},
		global : {
			x : "",
			y : "",
			p : 1,
			n : "",
			client : "none",
			currentclient : "none",
			dir : "",
			label : "Add Media",
			name : "search",
			query : "",
			toolbar : ""
		},
		history : []
	},
	profiles : {
		Ezine : {
			details : {
				label : "Ezine",
				icon : "/icons/ezine.ico",
				ajax : "default",
				results : [1, 5],
				pagination : "finite"
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/ezine",
				data : {
					format : "json"
				}
			},
			embed : function (o) {
				return $("<div>").append(
					"<br/>",
					$(o).find(".content").html(),
					"<br/>"
				).html();
			},
			success : function (o) {
				var contentarray = [];
				o = o.query.results.json;
				if (o[0] === undefined) {o[0] = o;}
				for (i = 0;i<$(o).size();i++) {
					contentarray[i] = $s.formats({
						type : "complex",
						title : o[i].Title,
						content : (o[i].Content !== null) ? o[i].Content.replace("<br/><br/>","") : $("<div>").append(
							$("<div>", { id : "search_error", style : "padding: 0pt 0.7em", "class" : "ui-state-error ui-corner-all"}).append(
								$("<p>").append(
									$("<span>", { style : "float: left; margin-right: 0.3em;", "class" : "ui-icon ui-icon-alert"}),
									$("<strong>", {text : "Error: "}),
									"No content returned."
								)
							)
						).html()
					});
				}
				$("td[value='" + search.plugin.global.n + "']","#search_results").each(function (index) {
					if(contentarray[index] === undefined) { return false; }
					$(this).html(contentarray[index]);
				});
			}
		},
		Flickr : {
			details : {
				label : "Flickr",
				icon : "/icons/flickr.ico",
				ajax : "default",
				results : [3, 5],
				pagination : "infinite"
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/flickr",
				data : {
					format : "json"
				},
				option : {"license" : function () { return ($('#search_licensecheck').attr('checked')) ? 4 : "all"}}
			},
			option : function () {
				$("#search_input").css("width","309px");
				return '<input type="checkbox" id="search_licensecheck" /><label for="search_licensecheck">Commons</label>';
			},
			embed : function (o) {
				return $("<div>").append(
					$("<a>", { href : $("img", o).attr("alt")}).append(
						$("<img/>", {src : $("img", o).attr("src")})
					)
				).html();
			},
			success : function (o) {
				var contentarray = [];
				o = o.query.results.photo;
				if (o[0] === undefined) {o[0] = o;}
				for (i = 0;i<$(o).size();i++) {
					contentarray[i] = $s.formats({
						type : "photowall",
						img : {
							src : 'http://farm' + o[i].farm + '.static.flickr.com/' + o[i].server + '/' + o[i].id + '_' + o[i].secret + '.jpg',
							alt : o[i].urls.url,
							style : "max-height:110px;max-width:205px;cursor:pointer;"
						}
					});
				}
				$("td[value='" + search.plugin.global.n + "']","#search_results").each(function (index) {
					if(contentarray[index] === undefined) { return false; }
					$(this).html(contentarray[index]);
				});
			}
		},
		Thesaurus: {
			details : {
				label : "Thesaurus",
				icon : "/icons/altervista.ico",
				ajax : "default",
				results : [1, 5],
				pagination : "singular"
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/thesaurus",
				data : {
					format : "json"
				}
			},
			embed : function (o) {
				return	$(o).text();
			},
			success : function (o) {
				var contentarray=[];
				o = o.query.results.response.list;
				if (o[0] === undefined) {o[0] = o;}
				for (i = 0;i<$(o).size();i++) {
					contentarray[i] = $s.formats({
						type : "singular",
						title : o[i].category,
						content : o[i].synonyms.split("|"),
					});
				}
				$("td[value='" + search.plugin.global.n + "']","#search_results").each(function (index) {
					if(contentarray[index] === undefined) { return false; }
					$(this).html(contentarray[index]);
				});
			}
		},
		Wikipedia : {
			details : {
				label : "Wikipedia",
				icon : "/icons/wikipedia.ico",
				ajax : "default",
				results : [1, 5],
				pagination : "infinite"
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/mediawiki",
				data : {
					format : "json"
				}
			},
			option : function () {
				$("#search_input").css("width","306px");
				return '<input type="checkbox" id="search_linkcheck" /><label for="search_linkcheck">Hyperlinks</label>';
			},
			embed : function (o) {
				return $("<div>").append(
					$("<a>", {href : "http://en.wikipedia.org/wiki/" + $(o).find(".title").text().replace(/ /g,"_"), text : "From Wikipedia"}),
					":<br/>",
					$(o).find(".content").first().html(),
					"<br/>"
				).html();
			},
			success : function (o) {
				var contentarray = [];
				o = o.query.results;
				if (o.item[0] === undefined) {o.item[0] = o.item;}
				for (i = 0;i<$(o.item).size();i++) {
					if (o.item[i].title !== undefined) {
						contentarray[i] = $s.formats({
							type : "complex",
							title : unescape(unescape(o.item[i].title)),
							content : $("<div>", {id : "content"+i, "class" : "search_loader_img"})
						});
					}
				}
				$("td[value='" + search.plugin.global.n + "']","#search_results").each(function (index) {
					if(contentarray[index] === undefined) { return false; }
					$(this).html(contentarray[index]);
					$.ajax({
						url: 'http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?',
						dataType: 'jsonp',
						data: { text: unescape(unescape(data.item[index].rev.content)) },
						error : function(jqXHR, status, error){
							$s.message({
								message : status + ": " + jqXHR.status
							});
						},
						success: function (data) {
							var text=$("<div>" + data.parse.text["*"] + "</div>");
							$("table,sup",text).remove();
							if(!$('#search_linkcheck').attr('checked')) {
								$("a",text).map(function (index) {
									$(this).replaceWith($(this).contents());
								});
							}
							$("p",text).each( function(){
								if( $(this).html().length < 10 ) { return;}
								text = $(this).html();
								return false;
							});
							$("td[value='" + search.plugin.global.n + "'] #content" + index,"#search_results").replaceWith(text);
						}
					});
				});
			}
		},
		Youtube : {
			details : {
				label : "Youtube",
				icon : "/icons/youtube.ico",
				ajax : "default",
				results : [1, 10],
				pagination : "infinite"
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/youtube",
				data : {
					format : "json"
				}
			},
			embed : function (o) {
				var vurl = "http://www.youtube.com/v/" + $(o).find("img").attr("id") + "?fs=1&amp;hl=en_US";
				return	'<object width="480" height="385"><param name="movie" value="' + vurl + '"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="' + vurl + '" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="480" height="385"></embed></object>';
			},
			success : function (o) {
				var contentarray=[];
				o = o.query.results.video;
				if (o[0] === undefined) {o[0] = o;}
				for (i = 0;i<$(o).size();i++) {
					contentarray[i] = $s.formats({
						type : "complex",
						title : o[i].title,
						content : o[i].content,
						img : {
							id : o[i].id,
							src : "http://i.ytimg.com/vi/" + o[i].id + "/hqdefault.jpg",
							alt : "http://i.ytimg.com/vi/" + o[i].id + "/",
							style : "margin:3px 3px 0px 3px; height:90px; width:120px; position:relative; left:0px; float: left",
							onmouseover : "window.search.profiles.Youtube.slideshow(this)"
						}
					});
				}
				$("td[value='" + search.plugin.global.n + "']","#search_results").each(function (index) {
					if(contentarray[index] === undefined) { return false; }
					$(this).html(contentarray[index]);
				});
			},
			slideshow : function (img) {
				function imageloop() {
					$(img).attr('src',$(img).attr('alt') + e + '.jpg');
					switch(c) {
						case 1:e = 2;c++;break;
						case 2:e = 1;c++;break;
						case 3:e = 3;c++;break;
						case 4:e='hqdefault';break;
						case 5:clearInterval(timer);break;
					}
				}
				var timer = setInterval(imageloop,1000),c = 1,e = 2;
			}
		}
	}
};
CKEDITOR.plugins.add('search',
{
    init: function (editor)
    {
		for(var instanceName in CKEDITOR.instances) {
			search.plugin.currentInstance = instanceName;
		}
		var icon = this.path + 'logo.gif';
		search.plugin.global.dir = this.path;
		$s.files();
        editor.addCommand(search.plugin.global.name, {
			exec: function (editor, data) {
				var CKSelection = editor.getSelection(), input;
				if (CKEDITOR.env.ie) {
					CKSelection.unlock(true);
					input = CKSelection.getNative().createRange().text;
				}
				else {
					input = CKSelection.getNative();
				}
				$s.begin({input : input, client : data});
			}
		});
        editor.ui.addButton(search.plugin.global.name,
            {
                label: search.plugin.global.label,
				icon: icon,
				command: search.plugin.global.name
            }
		);
		if (editor.addMenuItem) {
			var menuitemsarray = {};
			editor.addMenuGroup(search.plugin.global.name);
			menuitemsarray[search.plugin.global.name] = {
				label: search.plugin.global.label,
				icon: icon,
				group: search.plugin.global.name,
				getItems : function () {
					var clientitems = [];
					for (key in search.profiles) {
						if(search.profiles.hasOwnProperty(key)) {
							clientitems["search_" + search.profiles[key].details.label] = "CKEDITOR.TRISTATE_OFF";
						}
					}
					return clientitems;
				}
			};
			for (key in search.profiles) {
				if(search.profiles.hasOwnProperty(key)) {
					var ocfx=new Function("CKEDITOR.instances[search.plugin.currentInstance].execCommand(search.plugin.global.name, '" + key + "');");
					menuitemsarray[search.plugin.global.name + '_' + search.profiles[key].details.label] = {
						label: search.profiles[key].details.label,
						icon: search.plugin.global.dir + search.profiles[key].details.icon,
						group: search.plugin.global.name,
						onClick: ocfx
					};
				}
			}
			editor.addMenuItems(menuitemsarray);
		}
		if (editor.contextMenu) {
			editor.contextMenu.addListener(function (element, selection) {
				return { search: CKEDITOR.TRISTATE_ON };
			});
		}
	}
});
$(document).ready(function () {
	$.each({
		"#search_overlay_button_search" : function () {$s.fetch(1,1);},
		"#search_close_button, #search_overlay_button_cancel" : function (){$s.end();},
		"#search_overlay_button_reload" : function () {
			$("#search_input").val($("#search_overlay_button_reload").val());
			$s.fetch(1,1);
		},
		"#search_navigation button" : function () {
			$s.pagination({task : $(this).attr("value")});
		},
		"#search_results .search_overlay_button_embed" : function () {
			$s.embed({method : $(this).val(), result : $(this).parents("td").first()});
		},
		"#search_results .search_overlay_button_preview" : function () {
			$s.preview($(this).parents("td").first());
		}
	}, function (key, value) {
			$("body").delegate(key, "click", value);
		}
	);
	$("body").delegate("#search_input","keypress",function (e) {
		if(e.keyCode==13) {
			$s.fetch(1,1);
			return false;
		}
	});
});
window.$s = search.plugin.fn.prototype = {
	files : function () {
		var dir = search.plugin.global.dir;
		$.map(
			["/jquery/msdropdown/dd.css","/jquery/ui/css/start/jquery-ui-1.8.9.custom.css","/search_plugin.css"],
			function (filename) {
				$("head").first().append($("<link>", {rel : "stylesheet", type : "text/css", href : search.plugin.global.dir + filename}));
			}
		);
		if (jQuery.ui) {uil();}
		else {$.getScript("http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js", function(){uil();});}
		if (!(jQuery().msDropDown)) {$.getScript(dir + "/jquery/msdropdown/js/jquery.dd.js");}
		function uil(){
			if (jQuery.ui.position){ml();}
			else {$.getScript(dir + "/jquery/ui/js/jquery.ui.position.min.js", function(){ml();});}
			function ml(){
				if (jQuery.ui.mouse){wl();}
				else {$.getScript(dir + "/jquery/ui/js/jquery.ui.mouse.min.js", function(){wl();});}
				function wl(){
					if (jQuery.ui.widget){pl();}
					else {$.getScript(dir + "/jquery/ui/js/jquery.ui.widget.min.js", function () {pl();});}
					function pl() {
						if (!(jQuery().draggable)){$.getScript(dir + "/jquery/ui/js/jquery.ui.draggable.min.js");}
						if (!(jQuery().button)){$.getScript(dir + "/jquery/ui/js/jquery.ui.button.min.js");}
						if (!(jQuery().autocomplete)){$.getScript(dir + "/jquery/ui/js/jquery.ui.autocomplete.min.js");}
						if (!(jQuery().selectmenu)){$.getScript(dir + "/jquery/ui/js/jquery.ui.selectmenu.js");}
					}
				}
			}
		}
	},
	begin : function (o) {
		var s = {
			client : "none",
			input : []
		};
		$.extend(s,o);
		//alert("test o:"+o.input+"\\ns:"+s.input+"\\ntypeof s:"+(typeof s.input));
		if ($("#search_overlay_wrapper_wrapper").length) {
			$s.table(1, 1, 1);
		}
		else {
			$s.generate(s.client);
		}
		$("#search_overlay_wrapper_wrapper").center();
		$("#search_client_chooser","#search_overlay").selectmenu("value", s.client);
		$s.clientchange();
		if(typeof s.input !== "array") {
			$("#search_input").val(s.input);
			if(s.client !== "none"){
				$s.fetch(1,1);
			}
		}
	},
	end : function () {
		$("#search_overlay_wrapper_wrapper").remove();
		search.plugin.history = [];
	},
	generate : function () {
		$s.end();
		var generator = $("<div>", {id : "search_overlay_wrapper_wrapper", "class" : "ui-widget ui-corner-all"});
			$(generator).draggable({handle : "#search_title"}).html($("<table>", {id : "search_overlay_wrapper", "class" : "ui-dropshadow ui-corner-all"}));
		$("#search_overlay_wrapper", generator).html($("<tr>").html($("<td>").html($("<div>", {id : "search_overlay", "class" : "ui-corner-all"}))));
		$("#search_overlay", generator).append(
			$("<div>", { id : "search_title", text : search.plugin.global.label}),
			$("<button>", {id : "search_close_button"}).button({
				text: false,
				icons:{primary : "ui-icon-closethick"}
			}).removeClass("ui-button").removeClass("ui-button-icon-only").addClass("ui-dialog-titlebar-close").html(
				$("<span>", {"class" : "ui-icon ui-icon-closethick"})
			),
			$("<span>", { id : "search_toolbar_header", "class" : "ui-widget-header ui-corner-top"}).append(
				$("<select>", {id : "search_overlay_button_history"}).change(function () {
					//$s.clientchange();
					alert("Test");
				}).html(
					$("<optgroup>", {label : "History"})
				),
				$("<span>", { id : "search_tooblar_searching"}).append(
					$("<select>", {id : "search_client_chooser"}).change(function () {
						$s.clientchange();
					}).html(
						$("<option>", {value : "none", text : "Select Client"})
					).append( function () {
						var options = "";
						for (key in search.profiles) {
							if(search.profiles.hasOwnProperty(key)) {
								options += '<option value="' + key + '" class="avatar" title="' + search.plugin.global.dir + search.profiles[key].details.icon + '">' + search.profiles[key].details.label + '</option>';
							}
						}
						return options;
					}),
					$("<input/>", {id : "search_input", type : "text", size : "25", value : "Search Tag(s)", onFocus : "if(this.value==\'Search Tag(s)\') {this.value=\'\';this.style.color=\'#000000\'}", onBlur : "if(this.value==\'\') {this.value=\'Search Tag(s)\';this.style.color=\'#9E9E9E\'}"}).autocomplete({
						source: function(request, response) {
							$.ajax({
								url: "http://suggestqueries.google.com/complete/search",
								dataType: 'jsonp',
								data: { qu : request.term},
								success: function( data ) {
									response( $.map( data[1], function(item) {
										return {
											label: item[0],
											value: item[0]
										}
									}));
								}
							});
						}
					}),
					$("<span>").html(
						$("<button>", {id : "search_overlay_button_search", text : "Search"}).button({
							text : false,
							icons:{secondary : "ui-icon-search"}
						}).removeClass("ui-corner-all").addClass("ui-corner-right")
					)
				)
			),
			$("<table>", {id : "search_results_table", "class" : "ui-widget-content"}).html(
				$("<tr>").html(
					$("<td>", {id : "search_results_wrapper", "class" : "ui-widget-content"}).html(
						$("<div>", {id : "search_results_element"}).html("&nbsp;")
					)
				)
			),
			$("<span>", { id : "search_toolbar_footer", "class" : "ui-widget-header ui-corner-bottom", style: "white-space: normal"}).append(
				$("<span>", { id : "search_navigation"}).append(
					$("<button>", {id : "search_overlay_button_navigation_first", value : "first", text : "First"}),
					$("<button>", {id : "search_overlay_button_navigation_prev", value : "previous", text : "Prev"}).button({
						icons:{primary : "ui-icon-carat-1-w"}
					}),
					$("<div>", {id : "search_overlay_button_navigation_pages", "class" : "ui-button ui-widget ui-button-text-only ui-corner-left", "aria-disabled" : "false"}).append(
						$("<span>", { "class" : "ui-button-text", text : "Page Info"})
					),
					$("<button>", {id : "search_overlay_button_navigation_next", value : "next", text : "Next"}).button({
						icons:{secondary : "ui-icon-carat-1-e"}
					}),
					$("<button>", {id : "search_overlay_button_navigation_last", value : "last", text : "Last"})
				).buttonset(),
				$("<button>", {id : "search_overlay_button_cancel", text : "Close"}).button({
					icons:{secondary : "ui-icon-closethick"}
				})
			)
		);
		$("#search_client_chooser",generator).selectmenu({
			width : 122,
			icons: [{find: '.avatar'}],
			bgImage: function () {return 'url(' + $(this).attr("title") + ')';}
		});
		$("#search_overlay_button_history",generator).selectmenu({
			width : 122
		});
		$("#search_client_chooser-button",generator).addClass("ui-corner-left");
		$("#search_overlay_button_history-button",generator)
			.addClass("ui-corner-all")
			.attr({style : "margin-right:30px", title : "History"})
			.find("span").first().removeClass("ui-selectmenu-status").addClass("ui-selectmenu-hidden ui-button-text").html("&nbsp;")
			.next().addClass("ui-button-icon-secondary ui-icon-note");
		$("body").append(generator);
	},
	table : function (x,y,n) {
		search.plugin.global.x = x;search.plugin.global.y = y;search.plugin.global.n = n;
		if(n==1) {$("#search_results_element").html($("<table>", {id : "search_results"}));}
		var	trn=Array(y+1).join("<tr value='" + n + "'></tr>"),tdn=Array(x+1).join("<td value='" + n + "'></td>");
		$("#search_results").append($(trn).append(tdn));
	},
	message : function (o) {
		var s = {
			status : "Error",
			type : "error",
			icon : "alert",
			context : "#search_results_table",
			position : "before",
			delay : 4000,
			animate : {height : "toggle"},
			speed : "fast"
		};
		$.extend(s,o);
		$(s.context)[s.position](
			$("<div>", {style : "padding: 0pt 0.7em; display: none", "class" : "ui-state-" + s.type}).append(
				$("<span>", { style : "float: left; margin-right: 0.3em;", "class" : "ui-icon ui-icon-" + s.icon}),
				$("<strong>", {text : s.status + ": "}),
				s.message
			)
		)[(s.position == "before")?"prev":"next"]().animate(s.animate, s.speed).delay(s.delay).animate(s.animate, s.speed);
	},
	clientchange : function () {
		search.plugin.global.client=$("#search_client_chooser","#search_overlay_wrapper_wrapper").val();
		$("input", $("#search_overlay_button_search").parent()).button("destroy").siblings().not("button").remove();
		if(search.plugin.global.client!=="none"){
			if (search.profiles[search.plugin.global.client].option !== undefined) {
				$("#search_overlay_button_search").parent().prepend(search.profiles[search.plugin.global.client].option).buttonset().find("label").removeClass("ui-corner-left")
			}
			else {
				$("#search_input").css("width","394px");
			}
		}
		else {
			$("#search_input").css("width","394px");
		}
		$("#search_input").focus();
	},
	pagination : function (o) {
		var	p = search.plugin.global.p,
			n = search.plugin.global.n,
			x = search.plugin.global.x,
			y = search.plugin.global.y,
			mode = search.profiles[search.plugin.global.currentclient].details.pagination;
		function page(v) {
			$("#search_results tr[value]","#search_overlay").hide().filter("[value='" + v + "']").show();
		}
		switch(o.task){
			case "first":
				n = 1;
				search.plugin.global.n = n;
				page(n);
				break;
			case "previous":
				n--;
				search.plugin.global.n = n;
				page(n);
				break;
			case "current":
				page(n);
				break;
			case "next":
				n++;
				if (n>p){
					$s.fetch(n,n);
				}
				else {
					search.plugin.global.n = n;
					page(n);
				}
				break;
			case "last":
				switch(mode) {
					case "finite":
						alert("finite mode");
						break;
					case "infinite":
						n = p
						search.plugin.global.n = n;
						page(n);
						break;
				}
				break;
		}
		switch(mode){
			case "singular":
				$("#search_navigation button","#search_overlay").button("disable");
				$("#search_overlay_button_navigation_pages span").html("Page Info");
				break;
			case "finite":
				if (n==1){
					$("#search_navigation button","#search_overlay").button("enable")
						.filter("#search_overlay_button_navigation_first,#search_overlay_button_navigation_prev").button("disable").removeClass("ui-state-focus ui-state-hover");
				}
				else if (n<p) {
					$("#search_navigation button","#search_overlay").button("enable");
				}
				else {
					$("#search_navigation button","#search_overlay").button("enable")
						.filter("#search_overlay_button_navigation_last,#search_overlay_button_navigation_next").button("disable").removeClass("ui-state-focus ui-state-hover");
				}
				if ($(".search_results_result","#search_results tr[value='" + n + "']").size() == 0) {
					$("#search_overlay_button_navigation_pages span").html("Loading");
				}
				else {
					$("#search_overlay_button_navigation_pages span").html((((n - 1) * (x * y)) + 1) + "-" + (((n - 1) * (x * y)) + $("#search_results tr[value='" + n + "'] .search_results_result").size()) + " of #####");
				}
				break;
			case "infinite":
				if (n==1){
					$("#search_navigation button","#search_overlay").button("enable").not("#search_overlay_button_navigation_next").button("disable").removeClass("ui-state-focus ui-state-hover");
					if (n<p) {
						$("#search_navigation #search_overlay_button_navigation_last","#search_overlay").button("enable");
					}
				}
				else if (n<p) {
					$("#search_navigation button","#search_overlay").button("enable");
				}
				else {
					$("#search_navigation button","#search_overlay").button("enable")
						.filter("#search_overlay_button_navigation_last").button("disable").removeClass("ui-state-focus ui-state-hover");
				}
				if ($(".search_results_result","#search_results tr[value='" + n + "']").size() == 0) {
					$("#search_overlay_button_navigation_pages span").html("Loading");
				}
				else {
					$("#search_overlay_button_navigation_pages span").html((((n - 1) * (x * y)) + 1) + "-" + (((n - 1) * (x * y)) + $(".search_results_result","#search_results tr[value='" + n + "']").size()));
				}
				break;
		}
	},
	preview : function (result) {
		$("<div>", {"class" : "search_plugin_preview"})
			.html(unescape(search.profiles[search.plugin.global.currentclient].embed(result)))
			.dialog({
				title: $(result).find(".title").text(),
				width: 610,
				height: 300,
				buttons: {
					Beginning: function() {$s.embed({method : "beg", preview : this});},
					Cursor: function() {$s.embed({method : "aft", preview : this});},
					End: function() {$s.embed({method : "end", preview : this});},
					Selection: function() {$s.embed({method : "sel", preview : this});},
					All: function() {$s.embed({method : "all", preview : this});},
				},
				open: function() {
					$(this).siblings(".ui-dialog-buttonpane").first().find("button").button({
						icons: { primary: 'ui-icon-arrowthickstop-1-n' }
					}).next().button({
						icons: { primary: 'ui-icon-arrowthick-1-s' }
					}).next().button({
						icons: { primary: 'ui-icon-arrowthickstop-1-s' }
					}).next().button({
						icons: { primary: 'ui-icon-arrowthick-2-e-w' }
					}).next().button({
						icons: { primary: 'ui-icon-arrow-4' }
					}).parents(".ui-dialog-buttonpane").removeClass("ui-dialog-buttonpane").addClass("ui-widget-header ui-corner-all").css({
						"border-width" : "1px 0 0",
						"margin" : "0.5em 0 0"
					});
				}
			});
	},
	toolbar : function (result, preview) {
		var mode = (preview === true) ? "preview" : search.plugin.global.toolbar;
		switch(mode){
			case "singular":
				$("td",result).first().append(
					$("<div>", {"class" : "preview ui-widget-header ui-corner-top", style : "position:absolute"}).html(
						$("<span>", { "class" : "search_tooblar_insert"}).append(
							$("<span>", { id : "search_tooblar_insert"}).append(
								$("<div>", {id : "search_toolbar_option_insert", "class" : "ui-button ui-widget ui-button-text-only ui-corner-left", "aria-disabled" : "false"}).html(
									$("<span>", { "class" : "ui-button-text", text : "Insert:"})
								),
								$("<input/>", {id : "search_toolbar_option_insert_beginning", type : "radio", name : "search_toolbar_option", value : "beg"}),
								$("<label>", { "for" : "search_toolbar_option_insert_beginning", text : "Beginning"}),
								$("<input/>", {id : "search_toolbar_option_insert_after", type : "radio", name : "search_toolbar_option", value : "aft"}),
								$("<label>", { "for" : "search_toolbar_option_insert_after", text : "After"}),
								$("<input/>", {id : "search_toolbar_option_insert_end", type : "radio", name : "search_toolbar_option", value : "end"}),
								$("<label>", { "for" : "search_toolbar_option_insert_end", text : "End"})
							).buttonset().queue( function (next) {
								$("#search_toolbar_option_insert_beginning",this).button({
									text : false, icons:{primary : "ui-icon-arrowthickstop-1-n"}})
								.siblings("#search_toolbar_option_insert_after").button({
									text : false, icons:{primary : "ui-icon-arrowthick-1-s"}})
								.siblings("#search_toolbar_option_insert_end").button({
									text : false, icons:{primary : "ui-icon-arrowthickstop-1-s"}});
								next();
							}),
							$("<span>", { id : "search_tooblar_replace"}).append(
								$("<div>", {id : "search_toolbar_option_replace", "class" : "ui-button ui-widget ui-button-text-only ui-corner-left", "aria-disabled" : "false"}).html(
									$("<span>", { "class" : "ui-button-text", text : "Replace:"})
								),
								$("<input/>", {id : "search_toolbar_option_replace_selection", type : "radio", name : "search_toolbar_option", value : "sel", checked : "checked"}),
								$("<label>", {"for" : "search_toolbar_option_replace_selection", text : "Selection"}),
								$("<input/>", {id : "search_toolbar_option_replace_all", type : "radio", name : "search_toolbar_option", value : "all"}),
								$("<label>", {"for" : "search_toolbar_option_replace_all", text : "All"})
							).buttonset().queue( function (next) {
								$("#search_toolbar_option_replace_selection",this).first().button({
									text : false, icons:{primary : "ui-icon-arrowthick-2-e-w"}})
								.siblings("#search_toolbar_option_replace_all").button({
									text : false, icons:{primary : "ui-icon-arrow-4"}});
								next();
							})
						)
					)
				).find(".preview").css({"margin-left" : function(){ return ($(result).outerWidth()/2)-($(this).outerWidth()/2)+"px";}, "margin-top" : function(){ return "-" + (parseInt($(result).css("margin-bottom"),10) + parseInt($(result).css("border-bottom-width"),10) + $(this).height()) + "px";}, "z-index" : "2"});
				break;
			case "photowall":
				$("td",result).first().append(
					$("<div>", {"class" : "preview ui-widget-header ui-corner-top", style : "position:absolute"}).html(
						$("<span>", { "class" : "search_tooblar_insert"}).append(
							$("<span>").append(
								$("<button>", {"class" : "search_overlay_button_embed", value : "beg", text : "Beginning"}).button({
									text : false, icons:{primary : "ui-icon-arrowthickstop-1-n"}}),
								$("<button>", {"class" : "search_overlay_button_embed", value : "aft", text : "Cursor"}).button({
									text : false, icons:{primary : "ui-icon-arrowthick-1-s"}}),
								$("<button>", {"class" : "search_overlay_button_embed", value : "end", text : "End"}).button({
									text : false, icons:{primary : "ui-icon-arrowthickstop-1-s"}})
							).buttonset(),
							$("<span>").append(
								$("<button>", {"class" : "search_overlay_button_embed", value : "sel", text : "Selection"}).button({
									text : false, icons:{primary : "ui-icon-arrowthick-2-e-w"}}),
								$("<button>", {"class" : "search_overlay_button_embed", value : "all", text : "All"}).button({
									text : false,icons:{primary : "ui-icon-arrow-4"}})
							).buttonset()
						)
					)
				).find(".preview").css({"margin-left" : function(){ return ($(result).outerWidth()/2)-($(this).outerWidth()/2)+"px";}, "margin-top" : function(){ return "-" + (parseInt($(result).css("margin-bottom"),10) + parseInt($(result).css("border-bottom-width"),10) + $(this).height()) + "px";}, "z-index" : "2"});
				break;
			case "complex":
				$("td",result).first().append(
					$("<div>", {"class" : "preview ui-widget-header ui-corner-top", style : "position:absolute"}).append(
						$("<span>", { "class" : "search_tooblar_insert"}).append(
							$("<div>", {"class" : "ui-button ui-widget ui-button-text-only ui-corner-left", "aria-disabled" : "false"}).append(
								$("<span>", {"class" : "ui-button-text", text : "Insert"})
							),
							$("<span>").append(
								$("<button>", {"class" : "search_overlay_button_embed", value : "beg", text : "Beginning"}).button({
									text : false, icons:{primary : "ui-icon-arrowthickstop-1-n"}}),
								$("<button>", {"class" : "search_overlay_button_embed", value : "aft", text : "Cursor"}).button({
									text : false, icons:{primary : "ui-icon-arrowthick-1-s"}}),
								$("<button>", {"class" : "search_overlay_button_embed", value : "end", text : "End"}).button({
									text : false, icons:{primary : "ui-icon-arrowthickstop-1-s"}})
							).buttonset(),
							$("<div>", {"class" : "ui-button ui-widget ui-button-text-only ui-corner-left", "aria-disabled" : "false"}).append(
								$("<span>", {"class" : "ui-button-text", text : "Replace"})
							),
							$("<span>").append(
								$("<button>", {"class" : "search_overlay_button_embed", value : "sel", text : "Selection"}).button({
									text : false, icons:{primary : "ui-icon-arrowthick-2-e-w"}}),
								$("<button>", {"class" : "search_overlay_button_embed", value : "all", text : "All"}).button({
									text : false,icons:{primary : "ui-icon-arrow-4"}})
							).buttonset()
						),
						$("<button>", {"class": "search_overlay_button_preview", text : "Preview"}).button({
							text : false, icons:{primary : "ui-icon-newwin"}})
					)
				).find(".preview").css({"margin-left" : function(){ return ($(result).outerWidth()/2)-($(this).outerWidth()/2)+"px";}, "margin-top" : function(){ return "-" + (parseInt($(result).css("margin-bottom"),10) + parseInt($(result).css("border-bottom-width"),10) + $(this).height()) + "px";}, "z-index" : "2"});
				break;
		}
	},
	embed : function (o) {
		if (o.preview !== undefined) {
			o.embed = unescape($(o.preview).parents(".ui-dialog").find(".ui-dialog-content").html());
		}
		else {
			o.embed = unescape(search.profiles[search.plugin.global.currentclient].embed(o.result));
		}
		if (o.method !== undefined){
			switch (o.method) {
				case "beg":
					CKEDITOR.instances[search.plugin.currentInstance].setData(
						o.embed
						+CKEDITOR.instances[search.plugin.currentInstance].getSnapshot()
					);
					break;
				case "aft":
					var range, node, CKSelection = CKEDITOR.instances[search.plugin.currentInstance].getSelection();
					if (CKEDITOR.env.ie) {
						try {
							var range = CKSelection.getRanges()[0],
								selIsLocked = CKSelection.isLocked;
							if ( selIsLocked ) {CKSelection.unlock();}
							var $sel = CKSelection.getNative();
							if ( $sel.type == 'Control' ) {$sel.clear();}
							$sel = $sel.createRange();
							$sel.collapse(false);
							$sel.pasteHTML( o.embed );
							if ( selIsLocked )
								CKEDITOR.instances[search.plugin.currentInstance].getSelection().lock();
							CKEDITOR.instances[search.plugin.currentInstance].setData(
								CKEDITOR.instances[search.plugin.currentInstance].getSnapshot()
							);
						}
						catch(e) {
							try {
								CKEDITOR.instances[search.plugin.currentInstance].insertHtml(o.embed);
							}
							catch(e) {}
						}
					} else {
						range = CKSelection.getNative().getRangeAt(0);
						range.collapse(false);
						node = range.createContextualFragment(o.embed);
						range.insertNode(node);
						CKEDITOR.instances[search.plugin.currentInstance].setData(
							CKEDITOR.instances[search.plugin.currentInstance].getSnapshot()
						);
					}			
					break;
				case "end":
					CKEDITOR.instances[search.plugin.currentInstance].setData(
						CKEDITOR.instances[search.plugin.currentInstance].getSnapshot()
						+o.embed
					);
					break;
				case "sel":
					CKEDITOR.instances[search.plugin.currentInstance].insertHtml(o.embed);
					break;
				case "all":
					CKEDITOR.instances[search.plugin.currentInstance].setData(o.embed);
					break;
			}
		}
		else {
			$s.message({
				message : "Please select an embedding method."
			});
		}
	},
	fetch : function (next,current,history) {
		var p = search.plugin.global.p = next,
			n = search.plugin.global.n = current;
		search.plugin.global.currentclient = search.plugin.global.client;
		switch(search.plugin.global.client) {
			case 'none':
				$s.message({
					message : "Please select a client."
				});
				break;
			default:
				var	tx = search.profiles[search.plugin.global.client].details.results[0],
					ty = search.profiles[search.plugin.global.client].details.results[1];
				$s.table(tx, ty,(p==1)?1:n);
				$("#search_input").addClass("ui-search-loading");
				$("#search_overlay_button_navigation_pages span").html("Loading");
				$("#search_navigation button","#search_overlay").button("disable");
				var x = search.plugin.global.x,
					y = search.plugin.global.y,
					b = x*y,
					l = x*y*(n-1) + 1,
					u = x*y*n;
				if (p==1){
					search.plugin.global.query = search.profiles[search.plugin.global.client].query;
					if (search.plugin.global.query.option !== undefined) {
						var temp = {};
						for (key in search.plugin.global.query.option) {
							if(search.plugin.global.query.option.hasOwnProperty(key)) {
								temp[key] = search.plugin.global.query.option[key]();
							}
						}
						$.extend(search.plugin.global.query.data, temp);
					}
					$.extend(search.plugin.global.query.data, {query : $("#search_input").val(), b : l, e : u, l : b});
					search.plugin.history[(search.plugin.history.length > 0) ? search.plugin.history.length++ : 0] = {
						client : search.plugin.global.client,
						data : search.plugin.global.query.data
					};
					$("optgroup","#search_overlay_button_history").prepend(
						$("<option>", {value : search.plugin.history.length, "class" : "avatar", title : search.plugin.global.dir + search.profiles[search.plugin.global.client].details.icon, text : search.plugin.global.query.data.query})
					).parent().selectmenu({
						width : 122,
						icons: [
							{find: '.avatar'}
						],
						bgImage: function () {
							return 'url(' + $(this).attr("title") + ')';
						}
					});
					$s.message({
						type : "highlight",
						icon : "info",
						status : "History Update",
						message : dump(search.plugin.history[search.plugin.history.length-1]),
						position : "after"
					});
				}
				if(search.profiles[search.plugin.global.client].details.ajax=="default") {
					function fetcher(doover) {
						$.ajax({
							url : search.plugin.global.query.url,
							dataType : 'jsonp',
							data : $.extend({}, search.plugin.global.query.data, {b : l, e : u, l : b}),
							error : function(jqXHR, status, error){
								$s.message({
									message : status + ": " + jqXHR.status
								});
							},
							success : function (data, textStatus, jqXHR) {
								$("#search_input").removeClass("ui-search-loading");
								if(data.error === undefined && data.query !== undefined) {
									if(data.query.count !== 0){
										search.profiles[search.plugin.global.currentclient].success(data);
										$s.pagination({task : "current"});
										$(".search_results_result","#search_results tr[value='" + n + "']").hover(function () {
											$s.toolbar(this);
										},function () {
											$(".preview","#search_results").remove();
										});
									}
									else {
										$s.message({
											type : "highlight",
											icon : "info",
											status : "Uh-oh!",
											message : "No Results."
										});
									}
								}
								else {
									if (doover < 3){
										fetcher(doover++);
									}
									else {
										$s.message({
											message : data.error.description
										});
									}
								}
							}
						});
					}
					fetcher(1);
				}
		}
	},
	formats : function (o) {
		search.plugin.global.toolbar = o.type;
		var rml = $("<table>", {"class" : "search_results_result ui-corner-all"}).html($("<tr>"));
		switch (o.type) {
			case 'photowall':
				$("tr", rml).html($("<td>", { style : "text-align:center !important;"}).html($("<img/>",o.img)));
				break;
			case 'singular':
				$("tr", rml).html($("<td>").append(
					$("<span>", {"class" : "title", style : "height:15px;overflow:hidden"}).html(
						$("<b>").html(o.title)
					),
					$("<div>", {"class" : "content",  style : "height:80px;white-space:normal;overflow:auto"})
				));
				$(o.content).map(function(n) {
					$(rml).find(".content").append(
						$("<button>", {"class" : "search_overlay_button_result_embed", text : o.content[n]}).button()
					);
				});
				break;
			case 'complex' :
				$("tr", rml).html($("<td>"));
				if (o.img !== undefined){
					$("td", rml).html($("<img/>",o.img));
				}
				$("td", rml).append(
					$("<span>", {"class" : "title", style : "height:15px;overflow:hidden"}).html(
						$("<b>").html(o.title)
					),
					$("<div>", {"class" : "content",  style : "height:80px;white-space:normal;overflow:hidden"}).html(
						o.content
					)
				);
		}
		return rml;
	}
}
//}
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", ( $(window).height() - this.outerHeight() ) / 2+$(window).scrollTop() + "px");
    this.css("left", ( $(window).width() - this.outerWidth() ) / 2+$(window).scrollLeft() + "px");
    return this;
};
})(jQuery, window, window.document);
function dump(arr,level) {
	var dumped_text = "";
	if(!level) {level = 0;}
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) {level_padding += "    ";}
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}