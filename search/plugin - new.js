//GLOBAL OBJECT&VARIABLES//
//{
var search = {
	plugin : {
		id : $(".jquery_ckeditor").attr("id"),
		global : {
			x : "",
			y : "",
			m : false,
			n : "",
			client : "none",
			currentclient : "",
			dir : "",
			label : "Add Media",
			name : "search",
			query : ""
		}
	},
	profiles : {
		Ezine : {
			details : ["Ezine", "/icons/ezine.ico", "default", 1, 5],
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/ezine",
				data : {
					format : "json"
				}
			}
		},
		Flickr : {
			details : ["Flickr", "/icons/flickr.ico", "default", 3, 5],
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/flickr",
				data : {
					license : ($('#search_licensecheck').attr('checked')) ? 4 : "all",
					format : "json"
				}
			}
		},
		Wikipedia : {
			details : ["Wikipedia", "/icons/wikipedia.ico", "default", 1, 5],
			query : {
				url : "http://query.yahooapis.com/v1/public/yql/mcbryanmd/mediawiki",
				data : {
					format : "json"
				}
			}
		},
		Youtube : {
			details : ["Youtube", "/icons/youtube.ico", "default", 1, 5],
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
							clientitems["search_" + search.profiles[key].details[0]] = "CKEDITOR.TRISTATE_OFF";
						}
					}
					return clientitems;
				}
			};
			for (key in search.profiles) {
				if(search.profiles.hasOwnProperty(key)) {
					var ocfx=new Function("CKEDITOR.instances[search.plugin.id].execCommand(search.plugin.global.name, '" + key + "');");
					menuitemsarray[search.plugin.global.name + '_' + search.profiles[key].details[0]] = {
						label: search.profiles[key].details[0],
						icon: search.plugin.global.dir + search.profiles[key].details[1],
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
search.plugin.loader = function (filename, filetype) {
	switch(filetype) {
		case "css":
			var fileref = document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", filename);
			break;
	}
	if(fileref !== undefined) {
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}
};
search.plugin.files = function () {
	search.plugin.loader(search.plugin.global.dir + "/msdropdown/dd.css", "css");
	search.plugin.loader(search.plugin.global.dir + "/search_plugin.css", "css");
};
//}
//PLUGIN FUNCTIONS//
//{
search.plugin.begin = function (txt, client) {
	search.plugin.generate(client);
	$("#search_overlay_wrapper_wrapper").css('display','block');
	search.plugin.clientchange();
	if(!(!txt||txt=="")) {
		$("#search_input").attr("value",txt);
		if(client !== undefined){
			search.plugin.handler(false,1);
		}
	}
	if (!(jQuery().draggable)) {
		$.ajax({
			url : "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.min.js",
			dataType : "script",
			success : function () {
				$("#search_overlay_wrapper").draggable({handle : "#search_title"});
			}
		});
	}
	else {
		$("#search_overlay_wrapper").draggable({handle : "#search_title"});
	}
	if (!(jQuery().msDropDown)) {
		$.ajax({
			url : search.plugin.global.dir + "/msdropdown/js/jquery.dd.js",
			dataType : "script",
			success : function () {
				$("#search_overlay_wrapper_wrapper #client_chooser").msDropDown().data("dd");
			}
		});
	}
	else {
		$("#search_overlay_wrapper_wrapper #client_chooser").msDropDown().data("dd");
	}
};
search.plugin.end = function () {
	$("#search_overlay_wrapper_wrapper").remove();
};
search.plugin.generate = function (client) {
	search.plugin.end();
	$("#editor1").after(
		'<div id="search_overlay_wrapper_wrapper"><table id="search_overlay_wrapper"><tr><td>'
			+'<div id="search_overlay">'
				+'<div id="search_title">' + search.plugin.global.label + '</div>'
				+'<a id="search_close_button"  onclick="window.search.plugin.end();"></a>'
				+'<div id="search_overlay_header">'
					+'<table id="search_overlay_ui"><tr class="search_overlay_ui_col">'
						+'<td class="search_overlay_ui_row_first" style="width:102px">'
							+'<select id="client_chooser" onchange="search.plugin.clientchange()">'
								+'<option value="none">Choose Client</option>'
								+search.plugin.dropdown(client)
							+'</select>'
						+'</td>'
						+'<td class="search_overlay_ui_row_last">'
							+'<input id="search_input" type="text" size="25" value="Search Tag(s)" onFocus="if(this.value==\'Search Tag(s)\') {this.value=\'\';this.style.color=\'#000000\'}" onBlur="if(this.value==\'\') {this.value=\'Search Tag(s)\';this.style.color=\'#9E9E9E\'}" />'
						+'</td>'
						+'<td class="search_overlay_ui_row_last" style="width:80px">'
							+'<a id="search_overlay_button" class="search_overlay_button search_overlay_button_right">'
								+'<span class="search_overlay_button_span">Search</span>'
							+'</a>'
						+'</td>'								
					+'</tr></table>'
				+'</div>'
				+'<table id="search_results_table"><tr><td id="search_results_wrapper">'
					+'<div id="search_results_element">'
						+'&nbsp;'
					+'</div>'
				+'</td></tr></table>'
				+'<div id="search_overlay_header">'
					+'<table id="search_overlay_ui"><tr class="search_overlay_ui_col">'
						+'<td id="search_options" class="search_overlay_ui_row_first">&nbsp;</td>'
							+'<td class="search_overlay_ui_row_first" style="width:80px">'
								+'<a id="search_overlay_button_reload" class="search_overlay_button search_overlay_button_left">'
									+'<span class="search_overlay_button_span">Reload</span>'
								+'</a>'
							+'</td>'
							+'<td class="search_overlay_ui_row_first" style="width:80px">'
								+'<a id="search_overlay_button_more"  class="search_overlay_button search_overlay_button_more">'
									+'<span class="search_overlay_button_span">More</span>'
								+'</a>'
							+'</td>'
							+'<td class="search_overlay_ui_row_last" style="width:80px">'
								+'<a class="search_overlay_button search_overlay_button_cancel search_overlay_button_right" onclick="window.search.plugin.end();">'
									+'<span class="search_overlay_button_span search_overlay_button_span_cancel">Cancel</span>'
								+'</a>'
							+'</td>'
					+'</tr></table>'
				+'</div>'
			+'</div>'
		+'</td></tr></table></div>'
	);
};
search.plugin.dropdown = function (client) {
	var options="";
	for (key in search.profiles) {
		if(search.profiles.hasOwnProperty(key)) {
			options += '<option value="' + key + '" title="' + search.plugin.global.dir + search.profiles[key].details[1] + '"';
			options += (search.profiles[key].details[0]==client) ? ' selected="selected">' : '>';
			options += search.profiles[key].details[0] + '</option>';
		}
	}
	return options;
};
//}
//BUTTON PREP//
//{
$(document).ready(function () {
	$("#search_overlay_button").live('click',function () {search.plugin.handler(false,1);});
	$("#search_overlay_button_more").live('click',function () {
		$("#search_overlay_button_reload").attr("value",$("#search_input").attr("value"));
		search.plugin.global.n++;
		search.plugin.handler(true,search.plugin.global.n);
	});
	$("#search_overlay_button_reload").live('click',function () {
		$("#search_input").attr("value",$("#search_overlay_button_reload").attr("value"));
		search.plugin.handler(false,1);
	});
	$('#search_input').live('keypress',function (e) {
		if(e.keyCode==13) {
			search.plugin.handler(false,1);
			return false;
		}
	});
	$("#search_results td").live("click",function () {search.plugin.embed(this);});
});
search.plugin.handler = function (more,current) {
	search.plugin.global.m = more;
	search.plugin.global.n = current;
	search.plugin.fetch();
};
//}
//TABLE PREP//
//{
search.plugin.table = function (x,y,n) {
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
search.plugin.clientchange = function () {
	search.plugin.global.client=$("#client_chooser").attr("value");
	if(search.plugin.global.client!=="none"){$("#search_options").html(search.profiles[search.plugin.global.client].option);}
};
search.plugin.embed = function (result) {
	CKEDITOR.instances[search.plugin.id].insertHtml(unescape(search.profiles[search.plugin.global.currentclient].embed(result)));
};
search.plugin.fetch = function () {
	search.plugin.global.currentclient = search.plugin.global.client;
	switch(search.plugin.global.client) {
		case 'none':
			$("#search_results_element").html("Please choose a client.");
			break;
		default:
			var	m = search.plugin.global.m,
				n = search.plugin.global.n,
				tx = search.profiles[search.plugin.global.client].details[3],
				ty = search.profiles[search.plugin.global.client].details[4];
			search.plugin.table(tx, ty,(m==false)?1:n);
			$("#search_results td[value='" + n + "']").first().html('<div id="search_loader_img"></div>');
			search.plugin.global.query = search.profiles[search.plugin.global.client].query;
			var x = search.plugin.global.x,
				y = search.plugin.global.y,
				l = x*y*(n-1) + 1,
				u = x*y*n;
			if(search.profiles[search.plugin.global.client].details[2]=="default") {
				function fetcher(erst) {
					$.ajax({
						url : search.plugin.global.query.url,
						dataType : 'jsonp',
						data : $.extend({}, search.plugin.global.query.data, {query : $("#search_input").attr("value"), b : l, e : u}),
						error : function(request, status){
							$("#search_results").html("Error handling search: " + status);
						},
						success : function(data){
							if(data.error === undefined && data.query !== undefined) {
								if(data.query.count !== 0){
									search.profiles[search.plugin.global.currentclient].success(data);
								}
								else {$("#search_results").html("No results.");}
							}
							else {
								if (erst < 3){
									fetcher(erst + 1);
								}
								else {
									$("#search_results").html(data.error.description);
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
//PROFILES//
//{
//PROFILE -- Ezine
//{
search.profiles.Ezine.option="&nbsp;";
search.profiles.Ezine.embed = function (selection) {
	return '<br/>' + $(selection).find(".content").html() + '<br/>';
};
search.profiles.Ezine.success = function (data) {
	var linkarray = [];
	data = data.query.results.json;
	if (data[0] === undefined) {data[0] = data;}
	for (i = 0;i<$(data).size();i++) {
		linkarray[i]= $(
			'<div class="search_results_result">'+
				'<div id="title' + i + '" class="title" style="height:15px;width:100%;overflow:auto;cursor:pointer;">'+
					'<b>' + data[i].Title + '</b>'+
				'</div>'+
				'<div id="content'+i+'" class="content" style="height:80px;width:100%;white-space:normal;overflow:auto">'+
					data[i].Content.replace("<br/><br/>","") + 
				'</div>'+
			'</div>'
		);
	}
	$("#search_results td[value='" + search.plugin.global.n + "']").each(function (index) {
		if(linkarray[index] === undefined) { return false; }
		$(this).empty().append(linkarray[index]);
	});
};
//}
//PROFILE -- Flickr
//{
search.profiles.Flickr.option="<input id='search_licensecheck' type='checkbox'>Creative Commons</input>";
search.profiles.Flickr.embed = function (selection) {
	return '<a href="' + $(selection).find("img").attr("alt") + '"><img src="' + $(selection).find("img").attr("src") + '"/></a>';
};
search.profiles.Flickr.success = function (data) {
	var imgarray = [];
	data = data.query.results.photo;
	if (data[0] === undefined) {data[0] = data;}
	for (i = 0;i<$(data).size();i++) {
		imgarray[i]= $("<img />",{
			src : 'http://farm' + data[i].farm + '.static.flickr.com/' + data[i].server + '/' + data[i].id + '_' + data[i].secret + '.jpg',
			alt : data[i].urls.url,
			style : "max-height:110px;max-width:205px;cursor:pointer;"
		});
	}
	$("#search_results td[value='" + search.plugin.global.n + "']").each(function (index) {
		if(imgarray[index] === undefined) { return false; }
		$(this).empty().append(imgarray[index]);
	});
};
//}
//PROFILE -- Wikipedia
//{
search.profiles.Wikipedia.option="<input id='search_linkcheck' type='checkbox'>Include Hyperlinks</input>";
search.profiles.Wikipedia.embed = function (selection) {
	return '<a href="http://en.wikipedia.org/wiki/' + $(selection).find(".title").text().replace(/ /g,"_") + '">From Wikipedia</a> :<br/>' + $(selection).find(".content").html() + '<br/>';
};
search.profiles.Wikipedia.success = function (data) {
	var wikiarray = [];
	data = data.query.results;
	CKEDITOR.instances[search.plugin.id].insertText(dump(data));
	if (data.item[0] === undefined) {data.item[0] = data.item;}
	for (i = 0;i<$(data.item).size();i++) {
		if (data.item[i].title !== undefined) {
			alert( "Test:" + unescape(unescape(data.item[i].parsed)) );
			/*
			var text=$("<div>" + data.item[i].parsed + "</div>");
			$(text).find('table,sup').remove();
			if(!$('#search_linkcheck').attr('checked')) {
				$(text).find('a').map(function (index) {
					$(this).replaceWith($(this).contents());
				});
			}
			$(text).find('p').each( function(){
				if( $(this).html().length < 10 ) { return;}
				text = $(this).html();
				return false;
			});
			wikiarray[i] = $(
				'<div class="search_results_result">'+
					'<div id="title' + i + '" class="title" style="height:15px;width:100%;overflow:auto;cursor:pointer;">'+
						'<b>' + unescape(unescape(data.item[i].title)) + '</b>'+
					'</div>'+
					'<div id="content'+i+'" class="content" style="height:80px;width:100%;white-space:normal;overflow:auto">'+
						text + 
					'</div>'+
				'</div>'
			);
			*/
		}
	}
	$("#search_results td[value='" + search.plugin.global.n + "']").each(function (index) {
		if(wikiarray[index] === undefined) { return false; }
		$(this).empty().append(wikiarray[index]);
	});
};
//}
//PROFILE -- Youtube
//{
search.profiles.Youtube.option="&nbsp;";
search.profiles.Youtube.embed = function (selection) {
	var id = $(selection).find("img").attr("id"),
		vurl = 'http://www.youtube.com/v/' + id + '?fs=1&amp;hl=en_US';
	return	'<object width="480" height="385">'+
			'<param name="movie" value="' + vurl + '"></param>'+
			'<param name="allowFullScreen" value="true"></param>'+
			'<param name="allowscriptaccess" value="always"></param>'+
			'<embed src="' + vurl + '" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="480" height="385"></embed>'+
		'</object>';
};
search.profiles.Youtube.success = function (data) {
	var contentarray=[];
	data = data.query.results.video;
	if (data[0] === undefined) {data[0] = data;}
	for (i = 0;i<$(data).size();i++) {
		contentarray[i] = $(
			'<div class="search_results_result">'+
				'<img id="' + data[i].id + '" src="http://i.ytimg.com/vi/' + data[i].id + '/hqdefault.jpg" alt="http://i.ytimg.com/vi/' + data[i].id + '/" align="left" style="margin:3px 3px 0px 3px;height:90px;width:120px;position:relative;left:0px" onmouseover="slideshow(this)"/>'+
				'<div>'+
					'<div style="height:15px;width:252px;overflow:auto"><b>'+
						data[i].title +
					'</b></div>'+
					'<div style="height:80px;width:252px;white-space:normal;overflow:auto">'+
						data[i].content +
					'</div>'+
				'</div>'+
			'</div>'
		);
	}
	$("#search_results td[value='" + search.plugin.global.n + "']").each(function (index) {
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