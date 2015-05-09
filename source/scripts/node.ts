module TSC{
	
	export class Node{
		constructor(public type:String, public ID:String,public line:number,
			public declared?:boolean, public initialized?:boolean, public used?:boolean) {
		    this.type = type;
		    this.ID = ID;
		    this.line =line;
		    this.declared = false;
		    this.initialized = false;
		    this.used = false;
		}
		public toString(){
			return "Type: "+ this.type+ ", ID: " +this.ID +", Line: " +this.line +
				", Declared: " + this.declared +", Initialized: " + this.initialized +
				", Used: " + this.used;

		}
		public toHTML(){
			return "<td>"+ this.type+ "</td><td>" +this.ID +"</td><td>" +this.line +
				"</td><td>" + this.declared +"</td><td>" + this.initialized +
				"</td><td>" + this.used +"</td>";
		}
		public setDeclared(){
			this.declared =true;
		}
		public setInitialized(){
			this.initialized=true;
		}
		public setUsed(){
			this.used = true;
		}
		public equals(node){
			return this.type === node.type && this.ID === node.ID;
			/*return this.type === node.type && this.ID === node.ID && this.line ===node.line &&
				this.declared===node.declared &&this.initialized === node.initialized &&
				this.used === node.used;*/
		}

	}
}