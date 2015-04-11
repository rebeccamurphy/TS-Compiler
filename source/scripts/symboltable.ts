module TSC
{
	export class SymbolTable {
		constructor(private nodes?:Array<Node>,private parent?:SymbolTable,private children?:Array<SymbolTable>, private scope?:number) {
		    this.nodes = (nodes===undefined)? []:nodes;
		    this.parent = (parent===undefined)?null:parent;
		    this.scope = ++_SemanticAnalysis.currScope;
		    this.children = children;
		}
		public print(ID){
        	this.nodeHTML(ID);
        	for(var i=0; i<this.children.length; i++)
            	this.children[i].print(ID);
		}
		public nodeHTML(ID){
			var str = "";
			for (var i=0; i<this.nodes.length; i++)
				str+="<tr><td><b>" + this.scope +"</b></td>"+this.nodes[i].toHTML +"</tr>";
			document.getElementById(ID).innerHTML = document.getElementById(ID).innerHTML + str;
		}
		public toString(){
			if (this.parent!==null)
				return "(Scope: " +this.scope +", Parent: " +this.parent.toString() +")";
			return "(Scope: " +this.scope +")";
		}
		public addNode(node:Node){
			if (_Verbose)
				_Messenger.putMessage("Adding to Scope " +this.scope +": "+ node.toString());
			this.nodes.push(node);
		}
		public getChildren(){
			return this.children;
		}
		public addChild(ST:SymbolTable){
			if (_Verbose)
				_Messenger.putMessage("Creating new scope in Symbol Table: "+ST.toString());
			this.children.push(ST);
		}
		public setParent(parent:SymbolTable){
			this.parent=parent;
		}
		public getParent(){
			return this.parent;
		}
		public findValueInScope(id):any{
			//find closest to recently declared
			for(var i=this.nodes.length-1; i>=0;i--){
				if (id === this.nodes[i]){
					return this.nodes[i];
				}
			}
			return null;
		}
		public findValueInParentScope(id):any{
			//find closest to recently declared
			for(var i=this.parent.nodes.length-1; i>=0;i--){
				if (id === this.parent.nodes[i]){
					return this.parent.nodes[i];
				}
			}
			return null;
		}	
		public replace(node:Node){
			for(var i =0; i<this.nodes.length; i++)
				if (this.nodes[i].equals(node)){
					this.nodes[i] = node;
					return true;
				}
			return false;
		}
	}
}