module TSC
{
	export class SymbolTable {
		constructor(private nodes?:Array<Node>,private parent?:SymbolTable,private children?:Array<SymbolTable>, private scope?:number) {
		    this.nodes = (nodes===undefined)? []:nodes;
		    this.parent = (parent===undefined)?null:parent;
		    this.scope = ++_SemanticAnalysis.currScope;
		    this.children = (parent===undefined)?[]:children;
		    
		}

		public print(){
        	this.nodeHTML();
        	for(var i=0; i<this.children.length; i++)
            	this.children[i].print();
		}
		public nodeHTML(){
			var str = "";
			for (var i=0; i<this.nodes.length; i++){
				var parent = (this.parent===null)? "None" : this.parent.scope;
				str+="<tr><td><b>" + this.scope +"</b></td>" +"<td>"+parent +"</td>" +this.nodes[i].toHTML() +"</tr>";
				//symbol table analysis warnings
				if(this.nodes[i].declared && this.nodes[i].initialized &&!this.nodes[i].used)
					_Messenger.putWarning(this.nodes[i].line, WarningType.UnusedDI)
				else if (this.nodes[i].declared && !this.nodes[i].initialized)
					_Messenger.putWarning(this.nodes[i].line, WarningType.Unused)
				else if (!this.nodes[i].initialized)
					_Messenger.putWarning(this.nodes[i].line, WarningType.Uninit)
			}
			document.getElementById(_SemanticAnalysis.ID).innerHTML = document.getElementById(_SemanticAnalysis.ID).innerHTML + str;
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
		public findVarInParent(node:TreeNode){
			debugger;

			if (this.scope===node.scope){
				if (this.findValueInScope(node.getValue())===null){
					_varInParentScope =null;
					this.findValueInParentScope(node.getValue());
				}
			}
			else{
				for (var i=0; i<this.children.length; i++){
					this.children[i].findVarInParent(node);
				}
			}

		}
		public findValueInScope(id):any{
			//find closest to recently declared
			for(var i=this.nodes.length-1; i>=0;i--){
				if (id === this.nodes[i].ID){
					return this.nodes[i];
				}
			}
			return null;
		}
		public findValueInParentScope(id):any{
			
			if (this===null || this.parent===null)
				return null; 
			//find closest to recently declared
			for(var i=this.parent.nodes.length-1; i>=0;i--){
				if (id === this.parent.nodes[i].ID){
					_varInParentScope = (_varInParentScope===null)? this.parent.nodes[i]: _varInParentScope;
					_parentScope = this.parent.scope;
					return this.parent.nodes[i];
				}
			}
			this.parent.findValueInParentScope(id);
		}	
		public replace(node:Node){
			if (this===null || this.parent===null)
				return false;
			for(var i =0; i<this.nodes.length; i++)
				if (this.nodes[i].equals(node)){
					this.nodes[i] = node;
					return true;
				}
			this.parent.replace(node);
		}
	}
}