module TSC
{
	export class SymbolTable {
		constructor(private nodes?:Array<Node>,private parent?:SymbolTable, private scope?:number) {
		    this.nodes = (nodes===undefined)? []:nodes;
		    this.parent = (parent===undefined)?null:parent;
		    this.scope = ++_SemanticAnalysis.currScope;
		}
		public addNode(node:Node){
			this.nodes.push(node);
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