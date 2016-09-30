/* kangxi preview*/
const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;


const Preview=React.createClass({
	getInitialState:function(){
		const parts=this.parseText(this.props.data);
		return {parts};

		return {parts:[
				["z","林傳韓生推詩之意而爲內外傳數萬言其語頗與齊魯閒殊然其歸一也"+
"　又少也顏延之庭誥文選書務一不尚煩密何承天答顏永嘉書竊願吾子舍兼而遵一也"+
"　又增韻純也易繫辭天下之動貞夫一老子道德經天得一以淸地得一以寧"],
				
				["br"],
				["wh","一"],
				["an"],
				["wh","弌"],
				["z","唐韻韻會於悉切集韻正韻益悉切𡘋漪入聲"
				+"說文惟初大始道立於一造分天地化成萬物廣韻數之始也"
				+"物之極也易繫辭天一地二老子道德經道生一一生二　"
				+"又廣韻同也禮樂記禮樂𠛬政其極一也史記儒"],
				
				["br"],
				["wh","　　一部"],
				
				["br"],
				["wh","　子集上" ],
				
				["br"],
				["wh","康熙字典"]

			]}
	}
	,getTextFirstCh:function(str,count){
		var i=0;
		while (i<str.length && count){
			const code=str.charCodeAt(i);
			if (code>=0xd800&&code<=0xd900) i++;
			i++;count--;
		}
		return str.substr(0,i);
	}
	,chcount:function(str){
		var i=0,c=0;
		while (i<str.length){
			const code=str.charCodeAt(i);
			if (code>=0xd800&&code<=0xd900) i++;
			i++;c++;
		}
		return c;
	}
	,parseText:function(str){
		var lines=str.split("/");
		var parts=[],part;
		for (var i=lines.length-1;i>=0;i--) {
			part=[];
			var  line=lines[i];
			line=line.replace(/[─「」，、．；《》：。〈〉\n]/g,"");
			line=line.replace(/#\d+/g,"");

			var previdx=0;
			line.replace(/\{(.*?)\}/g,function(m,m1,idx){
				if (idx) part.push(["z",line.substr(previdx,idx)]);
			
				part.push(["wh",m1]);
				previdx=idx+m.length;
			});
			if (previdx<line.length-1) part.push(["z",line.substr(previdx).trim()]);
			part.push(["br"]);

			parts=parts.concat(part);
		}
		return parts;
	}
	,renderPart:function(part){
		var out=[];
		const type=part[0],text=part[1];
		if (type==="wh") {
			out.push(E("span",{className:"wh"},text));
		} else if (type==="br") {
			out.push(E("br"));
		} else if (type==="an") {
			out.push(E("span",{className:"an"},"古文"));
		} else if (type==="z") {
			var w=Math.floor(this.chcount(text)/2);
			if (this.chcount(text)%2==1) w++;
			const right=this.getTextFirstCh(text,w);
			const left=text.substr(right.length);
			out.push(E("span",{className:"warichu warichu"+w},
				E("span",{className:"warichu-right"},right)
				,E("span",{className:"warichu-left"},left)
			));
		}
		return out;
	}
	,render:function(){
		return E("div",{className:"v"},this.state.parts.map(this.renderPart) );
	}
});
module.exports=Preview;