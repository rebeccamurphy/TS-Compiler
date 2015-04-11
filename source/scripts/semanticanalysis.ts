module TSC
{
	export class SemanticAnalysis {
		public currScope:number;

		constructor(private rootNode: TreeNode) {
			this.rootNode = rootNode;
			this.currScope = -1;
		}
		public SemanticAnalysis(currNode:TreeNode, symbolTable?){
			if (this.currScope===-1){
				_SymbolTableRoot = new SymbolTable();
				symbolTable=_SymbolTableRoot;
			}
			else
				symbolTable =this.analysis(currNode, symbolTable);
	        for(var i=0; i<currNode.getChildren().length; i++)
	            this.SemanticAnalysis(currNode.getChildren()[i],symbolTable);
		}
		private analysis(currNode, symbolTable?){
			switch(currNode.type){
				case"BLOCK":
					//entering a newscopeso we add a new scope to symbol table
					var tempST = new SymbolTable();
					//this will probably be ok but apologizes to future me if its not
					tempST.setParent(symbolTable);
					symbolTable = tempST;
					break;
				case"VARDECL":
					var valueChild = currNode.getChildren()[1];
					var typeChild = currNode.getChildren()[0];
					var varInScope = symbolTable.findValueInScope(valueChild.value);
					if (varInScope===null){
						var temp = new Node(typeChild.type, valueChild.value, valueChild.line);
						temp.setDeclared();
						symbolTable.addNode(temp);
					}
					else{
						//TODO 
						//well thats embarrassing
						//queue error of redeclared identifiers
					}
					break;
				case "ASSIGN":
					var valueChild = currNode.getChildren()[1];
					var typeChild = currNode.getChildren()[0];
					var varInScope = symbolTable.findValueInScope(valueChild.value);
					var varInParentScope = symbolTable.findValueInParentScope(valueChild.value);

					if (varInScope!==null){
						//so the variable has been declared...
						//but does the type match?
						if ((varInScope.type ==="INT" && valueChild.type ==="DIGIT")||
							(varInScope.type==="STRING" && valueChild.type==="STRING")||
							(varInScope.type==="BOOL" && valueChild.type==="BOOL")
							){
							//match!
							varInScope.setInitialized();
							symbolTable.replace(varInScope);
						}
						else{
							//TODO
							//type mismatch error!
						}
					}
					else if(varInParentScope!==null){
						//so the variable has been declared in the parent scope...
						//but does the type match?
						if ((varInParentScope.type ==="INT" && valueChild.type ==="DIGIT")||
							(varInParentScope.type==="STRING" && valueChild.type==="STRING")||
							(varInParentScope.type==="BOOL" && valueChild.type==="BOOL")
							){
							//match!
							//so create a new instance of the variable for the symbol table
							var tempNode = new Node(typeChild.type, typeChild.value, typeChild.line);
							tempNode.setDeclared();
							tempNode.setInitialized();
							symbolTable.addNode(tempNode);
						}
					}	
					else{
						//TODO
						//ERROR
						//undeclared identifier
					}
					break;
				case "PRINT":
					var idChild = currNode.getChildren()[0];
					//varInScope = 
					//if ()
					break;
				}
				return symbolTable;
			}
		
	}
}