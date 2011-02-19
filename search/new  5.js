eval("menuitemsarray[search.plugin.global.name + '_' + search.profiles[key].details[0]]={label:search.profiles[key].details[0],icon:search.plugin.global.dir + search.profiles[key].details[1],group: search.plugin.global.name,onClick:function () {editor.execCommand(search.plugin.global.name, '" + search.profiles[key].details[0] + "')}}");

var ocfx=new Function("editor.execCommand(search.plugin.global.name, '" + search.profiles[key].details[0] + "');");
menuitemsarray[search.plugin.global.name + '_' + search.profiles[key].details[0]]={
	label: search.profiles[key].details[0],
	icon: search.plugin.global.dir + search.profiles[key].details[1],
	group: search.plugin.global.name,
	onClick: ocfx
}
