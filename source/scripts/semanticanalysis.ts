module TSC
{
	export class SemanticAnalysis {
		public currScope:number;
		public ID:string;
		constructor(private rootNode: TreeNode, ID:string) {
			this.rootNode = rootNode;
			this.currScope = -1;
			this.ID = ID;
		}

		public SemanticAnalysis(currNode:TreeNode, symbolTable?){
			if (this.currScope===-1){
				_Messenger.putHeaderMessage("Starting Semantic Analysis...");
				_SymbolTableRoot = new SymbolTable();
				symbolTable=_SymbolTableRoot;
				if(_Verbose){
					_Messenger.putMessage("Creating Symbol Table Root");
				}
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
					symbolTable.addChild(tempST);
					symbolTable = tempST;
					break;
				case"VARDECL":
					var valueChild = currNode.getChildren()[1];
					var typeChild = currNode.getChildren()[0];
					if (_Verbose)
						_Messenger.putMessage("Checking (" + valueChild.value+ ", Line: " +valueChild.line+
							") declaration");
					var varInScope = symbolTable.findValueInScope(valueChild.value);
					if (varInScope===null){
						var temp = new Node(typeChild.type, valueChild.value, valueChild.line);
						temp.setDeclared();
						if (_Verbose)
						_Messenger.putMessage("(" + valueChild.value+ ", Line: " +valueChild.line+
							") Declared properly");
						symbolTable.addNode(temp);
					}
					else{
						_Messenger.putError(valueChild.line, ErrorType.Redeclared);
						//queue error of redeclared identifiers
					}
					break;
				case "ASSIGN":
					var valueChild = currNode.getChildren()[1];
					var typeChild = currNode.getChildren()[0];
					var varInScope = symbolTable.findValueInScope(valueChild.value);
					var varInParentScope = symbolTable.findValueInParentScope(valueChild.value);
					if (_Verbose)
						_Messenger.putMessage("Checking (" +typeChild.value+ ", Line: " +valueChild.line+
							") assignment");
					if (varInScope!==null){
						//so the variable has been declared...
						//but does the type match?
						if (_Verbose)
							_Messenger.putMessage("ID has been declared in current scope.");
						if ((varInScope.type ==="INT" && valueChild.type ==="DIGIT")||
							(varInScope.type==="STRING" && valueChild.type==="STRING")||
							(varInScope.type==="BOOL" && valueChild.type==="BOOL")
							){
							//match!
							if (_Verbose)
								_Messenger.putMessage("(" + valueChild.value+ ", Line: " +valueChild.line+
							") Type Declaration matches assignment value.");
							varInScope.setInitialized();
							symbolTable.replace(varInScope);
						}
						else{
							//TODO
							//type mismatch error!
							_Messenger.putError(valueChild.line, ErrorType.TypeMismatchAssign);
						}
					}
					else if(varInParentScope!==null){
						//so the variable has been declared in the parent scope...
						//but does the type match?
						if(_Verbose){
							_Messenger.putMessage("ID has not been declared in current scope. Checking parent...");
							_Messenger.putMessage("ID has been declared in parent scope.");
						}
						if ((varInParentScope.type ==="INT" && valueChild.type ==="DIGIT")||
							(varInParentScope.type==="STRING" && valueChild.type==="STRING")||
							(varInParentScope.type==="BOOL" && valueChild.type==="BOOL")
							){
							//match!
							if (_Verbose)
								_Messenger.putMessage("(" + valueChild.value+ ", Line: " +valueChild.line+
							") Type Declaration matches assignment value.");
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
						_Messenger.putError(valueChild.line, ErrorType.Undeclared);
					}
					break;
				case "PRINT":
					var idChild = currNode.getChildren()[0];
					var varInScope = symbolTable.findValueInScope(idChild.value);
					var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
					if (_Verbose)
						_Messenger.putMessage("Checking (" +typeChild.value+ ", Line: " +valueChild.line+
							") assignment");
					if (varInScope!==null){
						//so the variable has been declared...
						//but does the type match?
						if (_Verbose)
							_Messenger.putMessage("ID has been declared in current scope.");
						if (varInScope.Initialized){
							//var has value to print
							if (_Verbose)
								_Messenger.putMessage("ID has been initialized in current scope.");								
							varInScope.setUsed();
							symbolTable.replace(varInScope);
						}
						else{
							//var has been declared in this scope but not initilized
							if (_Verbose)
								_Messenger.putWarning(idChild.line, "ID has not been initialized in current scope.");								
							varInScope.setUsed();
							symbolTable.replace(varInScope);	
						}
						
					}
					else if(varInParentScope!==null){
						//so the variable has been declared in the parent scope...
						//but does the type match?
						if(_Verbose){
							_Messenger.putMessage("ID has not been declared in current scope. Checking parent...");
							_Messenger.putMessage("ID has been declared in parent scope.");
						}
						if (varInParentScope.Initialized){
							//var has value to print
							if (_Verbose)
								_Messenger.putMessage("ID has been initialized in parent scope.");								
							varInParentScope.setUsed();
							symbolTable.replace(varInParentScope);
						}
						else{
							//var has been declared in this scope but not initilized
							if (_Verbose)
								_Messenger.putWarning(idChild.line, "ID has not been initialized in parent scope.");								
							varInParentScope.setUsed();
							symbolTable.replace(varInParentScope);	
						}
					}	
					else{
						//TODO
						//ERROR
						//undeclared identifier
						_Messenger.putError(valueChild.line, ErrorType.UndeclaredUsed);
					}
					break;
				
				case "WHILE":
					break;
				case "IF":
					break;
				}
				return symbolTable;
			}
			
		
	}
}