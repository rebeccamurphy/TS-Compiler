module TSC{
	
	export class Node{
		constructor(private type:String, private ID:String,private line:number,private declared?:boolean, private initialized?:boolean, private used?:boolean) {
		    this.type = type;
		    this.ID = ID;
		    this.line =line;
		    this.declared = false;
		    this.initialized = false;
		    this.used = false;
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