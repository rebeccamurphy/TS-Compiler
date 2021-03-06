module TSC {
	export class StaticTable {
		public entrys;
		constructor() {
		    this.entrys = [];
		}

		public add(varName, scope, type, address) {
			var tempName = "T"+this.entrys.length;
	        _Messenger.putMessage("Adding item " + varName + "@" + scope + " as " + tempName + "XX to static table.");
	        this.entrys.push(new StaticTableEntry(tempName, varName, scope, type, address===true)); 
	        return tempName;
	    }

	    public get(origin:TreeNode) {
	    	var node:any =origin;
	    	var parent = true;	
    		for(var i=0; i<this.entrys.length;i++){
        		if((this.entrys[i].id === node.getValue()) 
        			&& (this.entrys[i].scope === node.scope)){
        			parent=false;
        			return this.entrys[i];	
        			break;
        		}
            }
            if(parent===true){
            	var node = _SymbolTableRoot.findVarInParent(origin);
            	node = (node===undefined||node===null)? _varInParentScope:node;
            	for(var i=0; i<this.entrys.length;i++){
            		if((this.entrys[i].id === node.ID) 
            			&& (node.type === this.entrys[i].type)
            			&& (_parentScope ===this.entrys[i].scope)){
            			node=null;
            			return this.entrys[i];	
            			break;
            		}
	            }
    		}
	            
        	return null;
    	}

    	
		public display(){
			var output ="<tr><th>Temp</th><th>Var</th><th>Scope</th><th>Offset</th></tr>";
			var rowID="";
			for (var i=0; i<this.entrys.length; i++){
				var offset = (this.entrys[i].offset===undefined)? "none" : this.entrys[i].offset;
				output+= "<tr><td>"+this.entrys[i].temp + "</td><td>"+this.entrys[i].id +"</td>"
					+ "</td><td>"+this.entrys[i].scope +"</td>" 
					+ "</td><td>"+offset +"</td></tr>";
			}
			document.getElementById("ST").innerHTML = output;
		}
	}
}