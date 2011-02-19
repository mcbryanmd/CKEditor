//GLOBAL OBJECT&VARIABLES//
//{
var search = {
	plugin : {
		currentInstance : "",
		global : {
			x : "",
			y : "",
			m : false,
			n : "",
			client : "none",
			currentclient : "none",
			dir : "",
			label : "Add Media",
			name : "search",
			query : ""
		},
		results : {},
		history : []
	},
	profiles : {
		Ezine : {
			details : {
				label : "Ezine",
				icon : "/icons/ezine.ico",
				ajax : "default",
				results : [1, 5]
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/ezine",
				data : {
					format : "json"
				}
			}
		},
		Flickr : {
			details : {
				label : "Flickr",
				icon : "/icons/flickr.ico",
				ajax : "default",
				results : [3, 5]
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/flickr",
				data : {
					license : function () { return ($('#search_licensecheck').attr('checked')) ? 4 : "all"},
					format : "json"
				}
			}
		},
		Thesaurus: {
			details : {
				label : "Thesaurus",
				icon : "/icons/altervista.ico",
				ajax : "default",
				results : [1, 5]
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/thesaurus",
				data : {
					format : "json"
				}
			}
		},
		Wikipedia : {
			details : {
				label : "Wikipedia",
				icon : "/icons/wikipedia.ico",
				ajax : "default",
				results : [1, 5]
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/mediawiki",
				data : {
					format : "json"
				}
			}
		},
		Youtube : {
			details : {
				label : "Youtube",
				icon : "/icons/youtube.ico",
				ajax : "default",
				results : [1, 5]
			},
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/youtube",
				data : {
					format : "json"
				}
			}
		}
	}
};
//}
//CKEDITOR PLUGIN SETUP//
//{
CKEDITOR.plugins.add('search',
{
    init: function (editor)
    {
		for(var instanceName in CKEDITOR.instances) {
			search.plugin.currentInstance = instanceName;
		}
		search.plugin.global.dir = this.path;
		var icon = search.plugin.global.dir + 'logo.gif';
		search.plugin.files();
        editor.addCommand(search.plugin.global.name, {
			exec: function (editor, data) {
				var mySelection = editor.getSelection(), selectedText;
				if (CKEDITOR.env.ie) {
					mySelection.unlock(true);
					selectedText = mySelection.getNative().createRange().text;
				} else {
					selectedText = mySelection.getNative();
				}
				search.plugin.begin(selectedText, data);
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
//}
//LOAD EXTERNAL FILES//
//{
search.plugin.loadCSS = function (filename) {
	$("head").first().append($("<link>", {rel : "stylesheet", type : "text/css", href : filename}));
};
search.plugin.files = function () {
	search.plugin.loadCSS(search.plugin.global.dir + "/jquery/msdropdown/dd.css");
	search.plugin.loadCSS(search.plugin.global.dir + "/jquery/ui/css/start/jquery-ui-1.8.9.custom.css");
	search.plugin.loadCSS(search.plugin.global.dir + "/search_plugin.css");
	if (jQuery.ui) {
		uiloader();
	}
	else {
		$.getScript("http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js", function(){uiloader();});
		//"http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.min.js"
		//"http://www.troynotes.com/r/jquery/jquery-ui-1.8.9.custom/js/jquery-ui-1.8.9.custom.min.js"
	}
	if (!(jQuery().msDropDown)) {
		$.getScript(search.plugin.global.dir + "/jquery/msdropdown/js/jquery.dd.js");
	}
	function uiloader(){
		if (jQuery.ui.position){
			loadmouse();
		}
		else {
			$.getScript(search.plugin.global.dir + "/jquery/ui/js/jquery.ui.position.min.js", function(){loadmouse();});
		}
		function loadmouse(){
			if (jQuery.ui.mouse){
				loadwidget();
			}
			else {
				$.getScript(search.plugin.global.dir + "/jquery/ui/js/jquery.ui.mouse.min.js", function(){loadwidget();});
			}
			function loadwidget(){
				if (jQuery.ui.widget){
					loadwidgets();
				}
				else {
					$.getScript(search.plugin.global.dir + "/jquery/ui/js/jquery.ui.widget.min.js", function () {loadwidgets();});
				}
				function loadwidgets() {
					if (!(jQuery().draggable)){
						$.getScript(search.plugin.global.dir + "/jquery/ui/js/jquery.ui.draggable.min.js");
					}
					if (!(jQuery().button)){
						$.getScript(search.plugin.global.dir + "/jquery/ui/js/jquery.ui.button.min.js");
					}
					if (!(jQuery().autocomplete)){
						$.getScript(search.plugin.global.dir + "/jquery/ui/js/jquery.ui.autocomplete.min.js");
					}
					if (!(jQuery().selectmenu)){
						$.getScript(search.plugin.global.dir + "/jquery/ui/js/jquery.ui.selectmenu.js");
					}
				}
			}
		}
	}
};
//}
//PLUGIN FUNCTIONS//
//{
search.plugin.begin = function (txt, client) {
	if ($("#search_overlay_wrapper_wrapper").length) {
		search.plugin.results.table(1, 1, 1);
	}
	else {
		search.plugin.generate(client);
	}
	//search.plugin.generate(client);
	search.plugin.clientchange();
	if(!(!txt||txt=="")) {
		$("#search_input").attr("value",txt);
		if(client !== undefined){
			search.plugin.handler(false,1);
		}
	}
	$("#search_overlay_wrapper_wrapper").center();
	$("#search_overlay_button_history, #search_overlay_button_reload, #search_navigation button"/* #search_tooblar_insert #search_toolbar_option_insert_after"*/,"#search_overlay_wrapper").button( "disable" );
};
search.plugin.end = function () {
	$("#search_overlay_wrapper_wrapper").remove();
};
search.plugin.generate = function (client) {
	search.plugin.end();
	var generator = $("<div>", {id : "search_overlay_wrapper_wrapper", "class" : "ui-widget ui-corner-all"});
		$(generator).draggable({handle : "#search_title"}).append($("<table>", {id : "search_overlay_wrapper", "class" : "ui-dropshadow ui-corner-all"}));
	$(generator).find("#search_overlay_wrapper").append($("<tr>").append($("<td>").append($("<div>", {id : "search_overlay", "class" : "ui-corner-all"}))))
	$(generator).find("#search_overlay").append(
		$("<div>", { id : "search_title", text : search.plugin.global.label}),
		$("<button>", {id : "search_close_button"}).button({
			text: false,
			icons:{
				primary : "ui-icon-closethick"
			}
		}).removeClass("ui-button").removeClass("ui-button-icon-only").addClass("ui-dialog-titlebar-close").empty().append(
			$("<span>", {"class" : "ui-icon ui-icon-closethick"})
		),
		$("<span>", { id : "search_toolbar_header", "class" : "ui-widget-header ui-corner-top"}).append(
			/*$("<button>", {id : "search_overlay_button_history", text : "Previous Search History"}).button({
				text : false,
				icons:{
					secondary : "ui-icon-note"
				}
			})*/
			$("<select>", {id : "search_overlay_button_history"}).change(function () {
				//search.plugin.clientchange();
				alert("Test");
			}).append(
				$("<option>", {value : "none", text : "History"})
			),
			$("<span>", { id : "search_tooblar_searching"}).append(
				$("<select>", {id : "search_client_chooser"}).change(function () {
					search.plugin.clientchange();
				}).append(
					$("<option>", {value : "none", text : "Select Client"})
				).append( function () {
					var options = "";
					for (key in search.profiles) {
						if(search.profiles.hasOwnProperty(key)) {
							options += '<option value="' + key + '" class="avatar" title="' + search.plugin.global.dir + search.profiles[key].details.icon + '"';
							options += (search.profiles[key].details.label==client) ? ' selected="selected">' : '>';
							options += search.profiles[key].details.label + '</option>';
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
				$("<span>").append(
					$("<button>", {id : "search_overlay_button_search", text : "Search"}).button({
						text : false,
						icons:{
							secondary : "ui-icon-search"
						}
					}).removeClass("ui-corner-all").addClass("ui-corner-right")
				)
			)
		),
		$("<table>", {id : "search_results_table", "class" : "ui-widget-content"}).append(
			$("<tr>").append(
				$("<td>", {id : "search_results_wrapper", "class" : "ui-widget-content"}).append(
					$("<div>", {id : "search_results_element"}).html("&nbsp;")
				)
			)
		),
		$("<span>", { id : "search_toolbar_footer", "class" : "ui-widget-header ui-corner-bottom", style: "white-space: normal"}).append(
			$("<span>", { id : "search_navigation"}).append(
				$("<button>", {id : "search_overlay_button_navigation_first", text : "First"}),
				$("<button>", {id : "search_overlay_button_navigation_prev", text : "Prev"}).button({
					icons:{
						primary : "ui-icon-carat-1-w"
					}
				}),
				$("<div>", {id : "search_overlay_button_navigation_pages", "class" : "ui-button ui-widget ui-button-text-only ui-corner-left", "aria-disabled" : "false"}).append(
					$("<span>", { "class" : "ui-button-text", text : "Page Info"})
				),
				$("<button>", {id : "search_overlay_button_navigation_next", text : "Next"}).button({
					icons:{
						secondary : "ui-icon-carat-1-e"
					}
				}),
				$("<button>", {id : "search_overlay_button_navigation_last", text : "Last"})
			).buttonset(),
			$("<button>", {id : "search_overlay_button_cancel", text : "Close"}).button({
				icons:{
					secondary : "ui-icon-closethick"
				}
			})
		)
	);
	$("#search_client_chooser",generator).selectmenu({
		width : 122,
		icons: [
			{find: '.avatar'}
		],
		bgImage: function () {
			return 'url(' + $(this).attr("title") + ')';
		}
	});
	$("#search_overlay_button_history",generator).selectmenu({
		width : 122
	});
	$("body").append(generator);
};
//}
//BUTTON PREP//
//{
$(document).ready(function () {
	$("body").delegate("#search_overlay_button_search","click",function () {search.plugin.handler(false,1);});
	$("body").delegate("#search_close_button, #search_overlay_button_cancel","click",function (){search.plugin.end();});
	$("body").delegate("#search_overlay_button_more","click",function () {
		$("#search_overlay_button_reload").attr("value",$("#search_input").attr("value"));
		search.plugin.global.n++;
		search.plugin.handler(true,search.plugin.global.n);
	});
	$("body").delegate("#search_overlay_button_reload","click",function () {
		$("#search_input").attr("value",$("#search_overlay_button_reload").attr("value"));
		search.plugin.handler(false,1);
	});
	$("body").delegate("#search_input","keypress",function (e) {
		if(e.keyCode==13) {
			search.plugin.handler(false,1);
			return false;
		}
	});
	$("body").delegate("#search_results .search_results_result","mouseover",function () {
		//$(this).removeClass("ui-state-default").addClass("ui-state-hover");
		var result = $("td",this), offset = result.offset();
		result.append(
			$("<div>", {"class" : "preview", style : "position:absolute"}).append(
				$("<span>", { "class" : "search_tooblar_insert"}).append(
					$("<button>", {"class" : "search_toolbar_option_insert_beginning", text : "Beginning"}).button({
						text : false, icons:{primary : "ui-icon-arrowthickstop-1-n"}}),
					$("<button>", {"class" : "search_toolbar_option_replace_selection", text : "Selection"}).button({
						text : false, icons:{primary : "ui-icon-arrowthick-2-e-w"}}),
					$("<button>", {"class" : "search_toolbar_option_insert_after", text : "Cursor"}).button({
						text : false, icons:{primary : "ui-icon-arrowthick-1-s"}}),
					$("<button>", {"class" : "search_toolbar_option_insert_end", text : "End"}).button({
						text : false, icons:{primary : "ui-icon-arrowthickstop-1-s"}}),
					$("<button>", {"class" : "search_toolbar_option_replace_all", text : "All"}).button({
						text : false,icons:{primary : "ui-icon-arrow-4"}})
				).buttonset(),
				$("<button>", {"class": "search_tool_option_preview", text : "Preview"}).button({
					text : false, icons:{primary : "ui-icon-newwin"}})
			).css({"left" : "50%", "top" : offset.top})/*.position({
				of: result,
				my: "left",
				at: "left",
				offset: 0,
				collision: "none"
			})*/
		)
	});
	$("body").delegate("#search_results .search_results_result","mouseout",function () {
		//$(this).removeClass("ui-state-hover").addClass("ui-state-default");
		$("td",this).children().last().remove();
	});
	$("body").delegate("#search_results .search_overlay_button_embed","click",function () {
		search.plugin.embed($(this).parent().parent());
	});
	$("body").delegate("#search_results .search_overlay_button_result_embed","click",function () {
		search.plugin.embed(this);
	});
	$("body").delegate("#search_results .search_overlay_button_preview","click",function () {
		search.plugin.preview($(this).parent().parent());
	});
});
search.plugin.handler = function (more,current) {
	search.plugin.global.m = more;
	search.plugin.global.n = current;
	search.plugin.fetch();
};
//}
//TABLE PREP//
//{
search.plugin.results.table = function (x,y,n) {
	search.plugin.global.x = x;search.plugin.global.y = y;search.plugin.global.n = n;
	if(n==1) {$("#search_results_element").html('<table id="search_results"></table>');}
	var	trn="<tr value='" + n + "'></tr>",tdn="<td value='" + n + "'></td>";
	for (i = 1;i<y;i++) {trn+="<tr value='" + n + "'></tr>";}
	for (i = 1;i<x;i++) {tdn+="<td value='" + n + "'></td>";}
	$("#search_results").html($("#search_results").html() + trn);
	$("#search_results tr[value='" + n + "']").html(tdn);
};
//}
//SEARCH FUNCTIONS//
//{
search.plugin.message = function (o) {
	var state = (typeof o.type !== "undefined") ? o.type : "highlight",
		icon = (typeof o.icon !== "undefined") ? o.icon : "info",
		delay = (typeof o.delay !== "undefined") ? o.delay : 4000;
	$("#search_results_table").before(
		$("<div>", {style : "padding: 0pt 0.7em; display: none", "class" : "ui-state-" + state}).append(
			$("<span>", { style : "float: left; margin-right: 0.3em;", "class" : "ui-icon ui-icon-" + icon}),
			$("<strong>", {text : o.status + ": "}),
			o.message
		)
	).prev().animate({
		height : "toggle"
	}, "fast").delay(delay).animate({
		height : "toggle"
	}, "fast");
}
search.plugin.clientchange = function () {
	search.plugin.global.client=$("#search_client_chooser","#search_overlay_wrapper_wrapper").attr("value");
	$("#search_overlay_button_search").parent().find("input").button("destroy").parent().children().not("button").remove();
	if(search.plugin.global.client!=="none"){
		if (typeof search.profiles[search.plugin.global.client].option !== "undefined") {
			$("#search_overlay_button_search").parent().prepend(search.profiles[search.plugin.global.client].option).buttonset().find("label").removeClass("ui-corner-left")
		}
		else {
			$("#search_input").css("width","395px");
		}
	}
	else {
		$("#search_input").css("width","395px");
	}
	$("#search_input").focus();

};
search.plugin.preview = function (result) {
	var $dialog = $("<div></div>")
		.html(unescape(search.profiles[search.plugin.global.currentclient].embed(result)))
		//.html("Test")
		.dialog({
			autoOpen: false,
			title: $(result).find(".title").text(),
			width:610,
			height: 300
		});
	$dialog.dialog("open")
};
search.plugin.embed = function (result) {
	var method = $("input:radio:checked","#search_overlay_wrapper_wrapper #search_toolbar_footer").val();
	if (typeof method !== "undefined"){
		switch (method) {
			case "beg":
				CKEDITOR.instances[search.plugin.currentInstance].setData(
					unescape(search.profiles[search.plugin.global.currentclient].embed(result))
					+CKEDITOR.instances[search.plugin.currentInstance].getSnapshot()
				);
				break;
			case "aft":
			/*
				exec: function (editor, data) {
					var mySelection = editor.getSelection(), selectedText;
					if (CKEDITOR.env.ie) {
						mySelection.unlock(true);
						selectedText = mySelection.getNative().createRange().text;
					} else {
						selectedText = mySelection.getNative();
					}
					search.plugin.begin(selectedText, data);
				}
			*/
				var sel, range, node, CKSelection = CKEDITOR.instances[search.plugin.currentInstance].getSelection();
				if (CKEDITOR.env.ie) {
					CKSelection.unlock(true);
					range = CKSelection.getNative().createRange().text;
					alert(range);
					/*
					range.setStart(CKSelection.anchorNode,CKSelection.anchorOffset);
					range.setEnd(CKSelection.focusNode,CKSelection.focusOffset);
					*/
					//range.collapse(false);
					//range.pasteHTML(unescape(search.profiles[search.plugin.global.currentclient].embed(result)));
				} else {
					range = CKSelection.getNative().getRangeAt(0);
					range.collapse(false);
					node = range.createContextualFragment(unescape(search.profiles[search.plugin.global.currentclient].embed(result)));
					range.insertNode(node);
				}
				CKEDITOR.instances[search.plugin.currentInstance].setData(
					CKEDITOR.instances[search.plugin.currentInstance].getSnapshot()
				);
				break;
			case "end":
				CKEDITOR.instances[search.plugin.currentInstance].setData(
					CKEDITOR.instances[search.plugin.currentInstance].getSnapshot()
					+unescape(search.profiles[search.plugin.global.currentclient].embed(result))
				);
				break;
			case "sel":
				CKEDITOR.instances[search.plugin.currentInstance].insertHtml(unescape(search.profiles[search.plugin.global.currentclient].embed(result)));
				break;
			case "all":
				CKEDITOR.instances[search.plugin.currentInstance].setData(unescape(search.profiles[search.plugin.global.currentclient].embed(result)));
				break;
		}
	}
	else {
		search.plugin.message({
			type : "error",
			icon : "alert",
			status : "Error",
			message : "Please select an embedding method."
		});
	}
};
search.plugin.fetch = function () {
	search.plugin.global.currentclient = search.plugin.global.client;
	switch(search.plugin.global.client) {
		case 'none':
			search.plugin.message({
				type : "error",
				icon : "alert",
				status : "Error",
				message : "Please select a client."
			});
			break;
		default:
			var	m = search.plugin.global.m,
				n = search.plugin.global.n,
				tx = search.profiles[search.plugin.global.client].details.results[0],
				ty = search.profiles[search.plugin.global.client].details.results[1];
			search.plugin.results.table(tx, ty,(m==false)?1:n);
			$("#search_input").addClass("ui-search-loading");
			search.plugin.global.query = search.profiles[search.plugin.global.client].query;
			var x = search.plugin.global.x,
				y = search.plugin.global.y,
				l = x*y*(n-1) + 1,
				u = x*y*n;
			if (m==false){
				search.plugin.history[(search.plugin.history.length > 0) ? search.plugin.history.length++ : 0] = {
					client : search.plugin.global.client,
					data : $.extend({}, search.plugin.global.query.data, {query : $("#search_input").attr("value"), b : l, e : u})
				}
				$("#search_overlay_button_history").append(
					$("<option>", {value : "none", text : "History22"})
				),
			}
			if(search.profiles[search.plugin.global.client].details.ajax=="default") {
				function fetcher(erst) {
					$.ajax({
						url : search.plugin.global.query.url,
						dataType : 'jsonp',
						data : $.extend({}, search.plugin.global.query.data, {query : $("#search_input").attr("value"), b : l, e : u}),
						error : function(jqXHR, status, error){
							search.plugin.message({
								type : "error",
								icon : "alert",
								status : "Error",
								message : status + ": " + jqXHR.status
							});
						},
						success : function(data){
							$("#search_input").removeClass("ui-search-loading");
							if(data.error === undefined && data.query !== undefined) {
								if(data.query.count !== 0){
									search.profiles[search.plugin.global.currentclient].success(data);
								}
								else {
									search.plugin.message({
										status : "Uh-oh!",
										message : "No Results."
									});
								}
							}
							else {
								if (erst < 3){
									fetcher(erst + 1);
								}
								else {
									search.plugin.message({
										type : "error",
										icon : "alert",
										status : "Error",
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
};
//}
//GENERIC RESULT-TYPES
//{
search.plugin.results.formats = function (o) {
	var rml = $("<table>", {"class" : "search_results_result ui-corner-all"}).append("<tr>");
	switch (o.type) {
	case 'photowall':
		$(rml).find("tr").append($("<td>", { style : "text-align:center !important;"}).append($("<img/>",o.img)));
		break;
	case 'singular':
		$(rml).find("tr").append($("<td>"));
		$(rml).find("td").append(
			$("<span>", {"class" : "title", style : "height:15px;overflow:hidden"}).append(
				$("<b>").append(
					o.title
				)
			),
			$("<div>", {"class" : "content",  style : "height:80px;white-space:normal;overflow:auto"})
		);
		$(o.content).map(function(n) {
			$(rml).find(".content").append(
				$("<button>", {"class" : "search_overlay_button_result_embed", text : o.content[n]}).button()
			);
		});
		break;
	case 'complex' :
		$(rml).find("tr").append($("<td>"));
		if (o.img !== undefined){
			$(rml).find("td").append($("<img/>",o.img));
		}
		$(rml).find("td").append(
			$("<span>", {"class" : "title", style : "height:15px;overflow:hidden"}).append(
				$("<b>").append(
					o.title
				)
			),
			$("<div>", {"class" : "content",  style : "height:80px;white-space:normal;overflow:hidden"}).append(
				o.content
			)
		);
	}
	return rml;
};
//}
//PROFILES//
//{
//PROFILE -- Ezine
//{
search.profiles.Ezine.embed = function (selection) {
	return $("<div>").append(
		"<br/>",
		$(selection).find(".content").html(),
		"<br/>"
	).html();
};
search.profiles.Ezine.success = function (data) {
	var contentarray = [];
	data = data.query.results.json;
	if (data[0] === undefined) {data[0] = data;}
	for (i = 0;i<$(data).size();i++) {
		contentarray[i] = search.plugin.results.formats({
			type : "complex",
			title : data[i].Title,
			content : (data[i].Content !== null) ? data[i].Content.replace("<br/><br/>","") : $("<div>").append(
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
		$(this).empty().append(contentarray[index]);
	});
};
//}
//PROFILE -- Flickr
//{
search.profiles.Flickr.option = function () {
	$("#search_input").css("width","311px");
	return '<input type="checkbox" id="search_licensecheck" /><label for="search_licensecheck">Commons</label>';
};
search.profiles.Flickr.embed = function (selection) {
	return $("<div>").append(
		$("<a>", { href : $("img", selection).attr("alt")}).append(
			$("<img/>", {src : $("img", selection).attr("src")})
		)
	).html();
};
search.profiles.Flickr.success = function (data) {
	var contentarray = [];
	data = data.query.results.photo;
	if (data[0] === undefined) {data[0] = data;}
	for (i = 0;i<$(data).size();i++) {
		contentarray[i] = search.plugin.results.formats({
			type : "photowall",
			img : {
				src : 'http://farm' + data[i].farm + '.static.flickr.com/' + data[i].server + '/' + data[i].id + '_' + data[i].secret + '.jpg',
				alt : data[i].urls.url,
				style : "max-height:110px;max-width:205px;cursor:pointer;"
			}
		});
	}
	$("td[value='" + search.plugin.global.n + "']","#search_results").each(function (index) {
		if(contentarray[index] === undefined) { return false; }
		$(this).empty().append(contentarray[index]);
	});
};
//}
//PROFILE -- Thesaurus
//{
search.profiles.Thesaurus.embed = function (selection) {
	return	$(selection).text();
};
search.profiles.Thesaurus.success = function (data) {
	var contentarray=[];
	data = data.query.results.response.list;
	if (data[0] === undefined) {data[0] = data;}
	for (i = 0;i<$(data).size();i++) {
		contentarray[i] = search.plugin.results.formats({
			type : "singular",
			title : data[i].category,
			content : data[i].synonyms.split("|"),
		});
	}
	$("td[value='" + search.plugin.global.n + "']","#search_results").each(function (index) {
		if(contentarray[index] === undefined) { return false; }
		$(this).empty().append(contentarray[index]);
	});
};
//}
//PROFILE -- Wikipedia
//{
search.profiles.Wikipedia.option = function () {
	$("#search_input").css("width","308px");
	return '<input type="checkbox" id="search_linkcheck" /><label for="search_linkcheck">Hyperlinks</label>';
};
search.profiles.Wikipedia.embed = function (selection) {
	return $("<div>").append(
		$("<a>", {href : "http://en.wikipedia.org/wiki/" + $(selection).find(".title").text().replace(/ /g,"_"), text : "From Wikipedia"}),
		":<br/>",
		$(selection).find(".content").first().html(),
		"<br/>"
	).html();
};
search.profiles.Wikipedia.success = function (data) {
	var contentarray = [];
	data = data.query.results;
	if (data.item[0] === undefined) {data.item[0] = data.item;}
	for (i = 0;i<$(data.item).size();i++) {
		if (data.item[i].title !== undefined) {
			contentarray[i] = search.plugin.results.formats({
				type : "complex",
				title : unescape(unescape(data.item[i].title)),
				content : $("<div>", {id : "content"+i, "class" : "search_loader_img"})
			});
		}
	}
	$("td[value='" + search.plugin.global.n + "']","#search_results").each(function (index) {
		if(contentarray[index] === undefined) { return false; }
		$(this).empty().append(contentarray[index]);
		$.ajax({
			url: 'http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?',
			dataType: 'jsonp',
			data: { text: unescape(unescape(data.item[index].rev.content)) },
			error : function(jqXHR, status, error){
				search.plugin.message({
					type : "error",
					icon : "alert",
					status : "Error",
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
};
//}
//PROFILE -- Youtube
//{
search.profiles.Youtube.embed = function (selection) {
	var vurl = "http://www.youtube.com/v/" + $(selection).find("img").attr("id") + "?fs=1&amp;hl=en_US";
	return	$("<div>").append(
		$("<object>", {width : "480px", height : "385px"}).append(
			$("<param>", {name : "movie", value : vurl}),
			$("<param>", {name : "allowFullScreen", value : "true"}),
			$("<param>", {name : "allowscriptaccess", value : "always"}),
			$("<embed>", {
				src : vurl,
				type : "application/x-shockwave-flash",
				allowscriptaccess : "always",
				allowfullscreen : "true",
				width : "480px",
				height : "385px"
			})
		)
	).html();
};
search.profiles.Youtube.success = function (data) {
	var contentarray=[];
	data = data.query.results.video;
	if (data[0] === undefined) {data[0] = data;}
	for (i = 0;i<$(data).size();i++) {
		contentarray[i] = search.plugin.results.formats({
			type : "complex",
			title : data[i].title,
			content : data[i].content,
			img : {
				id : data[i].id,
				src : "http://i.ytimg.com/vi/" + data[i].id + "/hqdefault.jpg",
				alt : "http://i.ytimg.com/vi/" + data[i].id + "/",
				style : "margin:3px 3px 0px 3px; height:90px; width:120px; position:relative; left:0px; float: left",
				onmouseover : "slideshow(this)"
			}
		});
	}
	$("td[value='" + search.plugin.global.n + "']","#search_results").each(function (index) {
		if(contentarray[index] === undefined) { return false; }
		$(this).empty().append(contentarray[index]);
	});
};
//}
//}
//CLIENT-SPECIFIC FUNCTIONS//
//{
//Youtube -- Thumbnail slideshow
//{
function slideshow(img) {
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
//}
//}
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", ( $(window).height() - this.outerHeight() ) / 2+$(window).scrollTop() + "px");
    this.css("left", ( $(window).width() - this.outerWidth() ) / 2+$(window).scrollLeft() + "px");
    return this;
};
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