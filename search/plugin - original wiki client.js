//GLOBAL OBJECT&VARIABLES//
//{
var search = {}, x, y, m = false, n;
search.plugin = {};
search.plugin.id = $(".jquery_ckeditor").attr("id");
search.plugin.global = {};
search.plugin.global.client = "none";
search.plugin.global.currentclient = "";
search.plugin.global.dir = "";
search.plugin.global.imgarray = [];
search.plugin.global.label = "Add Media";
search.plugin.global.linkarray = [];
search.plugin.global.name = "search";
search.plugin.global.query = "";
search.profiles = {};
search.profiles.Flickr = {};
search.profiles.Flickr.details = ["Flickr", "/icons/flickr.ico", "default", "data.query.results.photo"];
search.profiles.Wikipedia = {};
search.profiles.Wikipedia.details = ["Wikipedia", "/icons/wikipedia.ico", "override"];
search.profiles.Wikipedia.special = {};
search.profiles.Wikipedia.special.resultset = [];
search.profiles.Wikipedia.special.wikis = [];
search.profiles.Youtube = {};
search.profiles.Youtube.details = ["Youtube", "/icons/youtube.ico", "default", "data.query.results.video"];
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
					var ocfx=new Function("CKEDITOR.instances[search.plugin.id].execCommand(search.plugin.global.name, '" + search.profiles[key].details[0] + "');");
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
		case "js":
			var fileref = document.createElement("script");
			fileref.setAttribute("type", "text/javascript");
			fileref.setAttribute("src", filename);
			break;
		case "css":
			var fileref = document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", filename);
			break;
	}
	if(typeof fileref !== "undefined") {
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}
};
search.plugin.files = function () {
	search.plugin.loader(search.plugin.global.dir + "/msdropdown/dd.css", "css");
	search.plugin.loader(search.plugin.global.dir + "/search_plugin.css", "css");
	search.plugin.loader("http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.7/jquery-ui.min.js", "js");
	search.plugin.loader("http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.7/i18n/jquery-ui-i18n.min.js", "js");
	search.plugin.loader(search.plugin.global.dir + "/msdropdown/js/jquery.dd.js", "js");
};
//}
//PLUGIN FUNCTIONS//
//{
search.plugin.begin = function (txt, client) {
	search.plugin.generate(client);
	$("#search_overlay_wrapper_wrapper").css('display','block');
	$("#search_overlay_wrapper").draggable({handle:"#search_title"});
	search.plugin.clientchange();
	if(!(!txt||txt=="")) {
		$("#search_input").attr("value",txt);
		if(typeof client !== "undefined"){
			search.plugin.handler(false,1);
		}
	}
	$("#search_overlay_wrapper_wrapper #client_chooser").msDropDown().data("dd");
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
			options += '<option value="' + search.profiles[key].details[0] + '" title="' + search.plugin.global.dir + search.profiles[key].details[1] + '"';
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
		n++;
		search.plugin.handler(true,n);
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
	jQuery.ajax = (function (_ajax) {
		return function (o) {
			if (/get/i.test(o.type)&&!/json/i.test(o.dataType)) {
				var querysx = o.query.replace("{TEXT}",o.search);
				o.url='http://query.yahooapis.com/v1/public/yql?format=json&callback=?';
				o.dataType='json';
				o.data={
					q:querysx,
					format:'json'
				};
				if (!o.success && o.complete) {
					o.success = o.complete;
					delete o.complete;
				}
				o.success=(function (_success) {
					return function (data) {
						if(_success) {
							_success.call(
								this,
								{responseText:(data.query.results == null)?"No Results":eval(o.resultstring)},
								'success'
							);
						}
					};
				})(o.success);
			}
			return _ajax.apply(this,arguments);  
		};
	})(jQuery.ajax);
}
);
search.plugin.handler = function (more,current) {
	m = more;
	n = current;
	search.plugin.fetch();
};
//}
//TABLE PREP//
//{
search.plugin.table = function (w,z,t) {
	x = w;y = z;n = t;
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
	search.plugin.global.imgarray=[];
	search.plugin.global.linkarray=[];
	switch(search.plugin.global.client) {
		case 'none':
			$("#search_results_element").html("Please choose a client.");
			break;
		default:
			search.profiles[search.plugin.global.client].fetch();
			if(search.profiles[search.plugin.global.client].details[2]=="default") {
				$.ajax({
					search: $("#search_input").attr("value"),
					query: search.plugin.global.query,
					resultstring: search.profiles[search.plugin.global.client].details[3],
					type: "GET",
					success: function (data) {
						//alert("query success: client: "+search.plugin.global.client+" , currentclient: "+search.plugin.global.currentclient+" ,query:"+search.plugin.global.query);
						search.profiles[search.plugin.global.currentclient].success(data);
					}
				});
			}
	}
};
//}
//PROFILES//
//{
//PROFILE -- Flickr
//{
search.profiles.Flickr.option="<input id='search_licensecheck' type='checkbox'>Creative Commons</input>";
search.profiles.Flickr.embed = function (selection) {
	return '<a href="' + $(selection).find("img").attr("alt") + '"><img src="' + $(selection).find("img").attr("src") + '" style="height:142px;width:190px" /></a>';
};
search.profiles.Flickr.fetch = function () {
	(m==false)?search.plugin.table(2,5,1):search.plugin.table(2,5,n);
	search.plugin.global.query=($('#search_licensecheck').attr('checked'))?"select farm,id,secret,server,owner.username,owner.nsid,urls.url.content from flickr.photos.info where photo_id in (select id from flickr.photos.search(" + (x*y*(n-1) + 1) + "," + x*y*n + ") where text='{TEXT}' and license=4)":"select farm,id,secret,server,owner.username,owner.nsid,urls.url.content from flickr.photos.info where photo_id in (select id from flickr.photos.search(" + (x*y*(n-1) + 1) + "," + x*y*n + ") where text='{TEXT}')";
};
search.profiles.Flickr.success = function (data) {
	alert(dump(data.responseText));
	if(data.responseText&&data.responseText!=="No Results") {
		for (i = 0;i<data.responseText.length;i++) {
			search.plugin.global.imgarray[i]='http://farm' + data.responseText[i].farm + '.static.flickr.com/' + data.responseText[i].server + '/' + data.responseText[i].id + '_' + data.responseText[i].secret + '.jpg';
			search.plugin.global.linkarray[i]=data.responseText[i].urls.url;
		}
		$("#search_results td[value='" + n + "']").each(function (index) {
			$(this).html('<img src="' + search.plugin.global.imgarray[index] + '" alt="' + search.plugin.global.linkarray[index] + '" style="cursor:pointer;"/>');
		});
	}
	else if(data.responseText&&data.responseText=="No Results"){$("#search_results").html("No Results.");}
	else {$("#search_results").html("Error!");}
};
//}
//PROFILE -- Wikipedia
//{
search.profiles.Wikipedia.option="<input id='search_linkcheck' type='checkbox'>Include Hyperlinks</input>";
search.profiles.Wikipedia.embed = function (selection) {
	return '<a href="http://en.wikipedia.org/wiki/' + $(selection).find(".title").text().replace(/ /g,"_") + '">From Wikipedia</a> :<br>' + $(selection).find(".content").html() + '<br>';
};
search.profiles.Wikipedia.fetch = function () {
	if(m==false) {
		search.plugin.table(1,5,1);
		$.ajax({
			url:'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=50&callback=?',
			dataType:'json',
			data:{search: $("#search_input").attr("value")},
			success:function (data) {
				search.profiles[search.plugin.global.currentclient].success(data);
			}
		});
	}
	else if(m==true) {
		search.plugin.table(1,5,n);
		search.profiles.Wikipedia.ajax();
	}
};
search.profiles.Wikipedia.success = function (data) {
	search.profiles.Wikipedia.special.wikis=[];
	for (i = 0;i<data[1].length;i++) {
		search.profiles.Wikipedia.special.wikis[i]=data[1][i];
	}
	search.profiles.Wikipedia.ajax();
};
search.profiles.Wikipedia.ajax = function () {
	search.profiles.Wikipedia.special.resultset=[];
	if(search.profiles.Wikipedia.special.wikis.length>0) {
		for (i=(n*5)-5,t = 0;i<(n*5)&&i<search.profiles.Wikipedia.special.wikis.length;i++,t++) {
			search.profiles.Wikipedia.special.resultset[t]= 
				'<div class="search_results_result">'+
					'<div id="title' + i + '" class="title" style="height:15px;width:100%;overflow:auto;cursor:pointer;"><b>'+
						search.profiles.Wikipedia.special.wikis[i] + 
					'</b></div>'+
					'<div id="content'+i+'" class="content" style="height:80px;width:100%;white-space:normal;overflow:auto">'+
						'<img src="../plugins/search/course-search-ajax-loading-icon.gif" />'+
					'</div>'+
				'</div>';
		}
		$("#search_results td[value='" + n + "']").each(function (index) {
			$(this).html(search.profiles.Wikipedia.special.resultset[index]);
		});
		for (i=(n*5)-5;i<(n*5)&&i<search.profiles.Wikipedia.special.wikis.length;i++) {
			search.profiles.Wikipedia.content(i);
		}
	} else {
		$("#search_results").html("No Results.");
	}
};
search.profiles.Wikipedia.content = function (x) {
	$.ajax({
		url:'http://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&rvprop=content&rvsection=0&rvlimit=1&callback=?&redirects',
		dataType:'json',
		data:{titles:search.profiles.Wikipedia.special.wikis[x]},
		success:function (contentdata) {
			if(contentdata.query.pages) {
				for(pageid in contentdata.query.pages) break;
				$.ajax({
					url: 'http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?',
					dataType: 'json',
					data: { text: contentdata.query.pages[pageid].revisions[0]['*'] },
					success: function (parsedata) {
						var text=$("<div>" + parsedata.parse.text['*'] + "</div>");
						$(text).find('table,sup').remove();
						if(!$('#search_linkcheck').attr('checked')) {
							$(text).find('a').map(function (index) {
								$(this).replaceWith($(this).contents());
							});
						}
						text=$(text).find('p').html();
						$("#search_results td[value='" + n + "'] #content" + x).html(text);
					}
				});
			}
		}
	});
};
//}
//PROFILE -- Youtube
//{
search.profiles.Youtube.option="&nbsp;";
search.profiles.Youtube.embed = function (selection) {
	var id=$(selection).find("img").attr("id");
	return	'<object width="480" height="385">'+
			'<param name="movie" value="http://www.youtube.com/v/' + id + '?fs=1&amp;hl=en_US"></param>'+
			'<param name="allowFullScreen" value="true"></param>'+
			'<param name="allowscriptaccess" value="always"></param>'+
			'<embed src="http://www.youtube.com/v/' + id + '?fs=1&amp;hl=en_US" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="480" height="385"></embed>'+
		'</object>';
};
search.profiles.Youtube.fetch = function () {
	(m==false)?search.plugin.table(1,5,1):search.plugin.table(1,5,n);
	search.plugin.global.query = "use 'https://github.com/yql/yql-tables/raw/master/youtube/youtube.search.xml' as searchtable; select id,title,content,thumbnails from searchtable(" + (x*y*(n-1) + 1) + "," + x*y*n + ") where query='{TEXT}'";
};
search.profiles.Youtube.success = function (data) {
	if(data.responseText&&data.responseText!=="No Results") {
		var id=[],title=[],content=[];
		for (i = 0;i<data.responseText.length;i++) {
			id[i]=data.responseText[i].id;
			title[i]=data.responseText[i].title;
			content[i]=data.responseText[i].content;
			search.plugin.global.imgarray[i]='http://i.ytimg.com/vi/' + id[i] + '/';
		}
		$("#search_results td[value='" + n + "']").each(function (index) {
			$(this).html(
				'<div class="search_results_result">'+
					'<img id="' + id[index] + '" src="' + search.plugin.global.imgarray[index] + 'hqdefault.jpg" alt="' + search.plugin.global.imgarray[index] + '" align="left" style="margin:3px 3px 0px 3px;height:90px;width:120px;position:relative;left:0px" onmouseover="slideshow(this)"/>'+
					'<div>'+
						'<div style="height:15px;width:252px;overflow:auto"><b>'+
							title[index] +
						'</b></div>'+
						'<div style="height:80px;width:252px;white-space:normal;overflow:auto">'+
							content[index] +
						'</div>'+
					'</div>'+
				'</div>'
			);
		});
	}
	else if(data.responseText&&data.responseText=="No Results"){$("#search_results").html("No Results.");}
	else {$("#search_results").html("Error!");}
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
	if(!level) level = 0;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
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