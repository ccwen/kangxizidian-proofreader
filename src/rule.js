/*
usable prefix
@
$
%
*
+
# foot note
~ page break
^ paragraph
*/
/* convert simple markup to tag */
/* give warning for */
var PBLINE=[];
var initpage="";
const fs=require("ksana2015-proofreader").socketfs;
var doc=null;
var footnote=null;
const {action}=require("ksana2015-proofreader").model;
const pdfs=["kx-06-0001-0200","kx-06-0201-0400",
"kx-06-0401-0600","kx-06-0601-0800","kx-06-0801-1000",
"kx-06-1001-1200","kx-06-1201-1400","kx-06-1401-1600"];

var getPDFPage=function(pageid) {
	if (!pageid)return;
	var m=pageid.match(/(\d+)/);
	if (!m)return ;

	const page=parseInt(m[1],10);
	const f=Math.round(page/200);

	var pdffn="pdf/"+pdfs[f]+".pdf";
	console.log(pdffn)
	return {pdffn,page};
}
var init=function(){
	fs.setDataroot("kangxizidian-corpus/out/")	;
	var c=fs.readFile("notes.json",function(err,data){
		footnote=JSON.parse(data);
		console.log(Object.keys(footnote).length);	
	});
}
var onTagClick=function(e) {
		var marker=e.target.marker;
		var pos=marker.find();
		doc.setCursor(pos.to);
		doc.cm.focus();
		marker.clear();
}
var createMarker=function(classname,tag) {
		var element=document.createElement("SPAN");
		element.className=classname;
		element.innerHTML=tag;
		element.onclick=onTagClick;
		return element;
}

var markLine=function(i,rebuild) {
		if (i>doc.lineCount())return;
		var M=doc.findMarks({line:i,ch:0},{line:i,ch:65536});
		M.forEach(function(m){m.clear()});
		var line=doc.getLine(i);
		var dirty=false;
		line.replace(/~(\d+)/g,function(m,pg,idx){
			var element=createMarker("pbmarker",pg);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});

		line.replace(/\^([0-9.]+)/g,function(m,m1,idx){
			var element=createMarker("paragraph",m1);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});

		line.replace(/#(\d+)/g,function(m,m1,idx){
			var element=createMarker("footnote",m1);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});

		line.replace(/\{(.+?)\}/g,function(m,m1,idx){
			var element=createMarker("correction",m1);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});

		//sutta name, has more than 2 leading space
		line.replace(/ {2,}\[(.+?)\]/g,function(m,m1,idx){
			var element=createMarker("sutta",m1);
			var s=idx+m.length-m1.length-2; // [ ] take 2 bytes
			var marker=doc.markText({line:i,ch:s},{line:i,ch:s+m1.length+2},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});


		setTimeout(function(){
			if (rebuild && dirty) buildPBLINE();
		},100);//<pb id="1.2b"/>
	}

var markAllLine=function() {
	var M=doc.getAllMarks();
	M.forEach(function(m){m.clear()});
	for (var i=0;i<doc.lineCount();i++){
		markLine(i);
	}
	buildPBLINE();
}
var prevpageid=function(pageid){
	var m=pageid.match(/(\d+)/);
	if (!m) return pageid;
	return (parseInt(m[1])-1);
}
var buildPBLINE=function() {
		//var t=new Date();
		var marks=doc.getAllMarks();
		if (!marks.length)return;
		PBLINE=[];
		for (var i=0;i<marks.length;i++) {
			var m=marks[i];
			if (m.replacedWith.className=="pbmarker") {
				var pos=m.find();
				PBLINE.push([pos.from.line,m.replacedWith.innerHTML]);
			}
		}
		PBLINE.sort(function(a,b){
			return a[0]-b[0];
		});

		if (PBLINE[0][0]>0) { //append previous PB
			PBLINE.unshift([1,prevpageid(PBLINE[0][1])]);
		}
		//console.log("rebuild pbline",new Date()-t);
	}
var setDoc=function(_doc){
	doc=_doc;
}
var getPageByLine=function(line) {
	if (!PBLINE.length)return;
		for (var i=1;i<PBLINE.length;i++) {
			var pbline=PBLINE[i];
			if (pbline[0]>line) {
				return PBLINE[i-1][1];
			}
		}
		return PBLINE[PBLINE.length-1][1];//default
}
var getFootnote=function(str,pg){
	var m=str.match(/#(\d+)/);
	if (m){
		var footnoteinpage=footnote[pg];
		if (footnoteinpage){
			return pg+"#" +footnoteinpage[parseInt(m[1])-1];
		}
	}
	return "";
}
var setHotkeys=function(cm){
		cm.setOption("extraKeys", {
	  	"Ctrl-S": function(cm) {
	  		action("savefile");
	  	}
	  });
}
const onBeforeChange=function(){

}
const validateMark=function(){

}
var helpmessage="#footnote, ^paragraph";
module.exports={markAllLine,markLine,initpage,setDoc,onBeforeChange,validateMark
,getPageByLine,init,getFootnote,setHotkeys,helpmessage,getPDFPage};