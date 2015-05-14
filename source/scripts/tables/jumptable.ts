module TSC {
	export class JumpTable {
		public entrys;
		constructor() {
			this.entrys =[];
		}
		public add(temp?, distance?){
    		if(temp!==undefined) {
            	for(var i =0; i<this.entrys.length; i++){
                	if(this.entrys[i].temp === temp)
                    	this.entrys[i].distance = distance;
            	}
        	} 
        	else {
        		this.entrys.push(new JumpTableEntry());
            	if (_Verbose)
            		_Messenger.putMessage("Adding item " + ("J" + (this.entrys.length - 1)) + " to jump table.");
            	return "J" + (this.entrys.length - 1);
        	}

    	}
    	public get(id:string, scope:number){
    		for (var i=0; i<this.entrys.length; i++){
    			if (this.entrys[i].id ===id && this.entrys[i].scope===scope)
    				return this.entrys[i];
    		}
    		return null;
    	}

		public display(){
			var output ="<tr><th>Temp</th><th>Distance</th></tr>";
			var rowID="";
			for (var i=0; i<this.entrys.length; i++){
				output+= "<tr><td>"+this.entrys[i].temp + "</td><td>"+this.entrys[i].distance +"</td></tr>";
			}
			document.getElementById("JT").innerHTML = output;
		}

	}
}