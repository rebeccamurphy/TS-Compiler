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
			debugger;
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
	        for(var i=0; i<currNode.getChildren().length; i++){
	        	switch(currNode.getChildren()[i].type){
		        	case "BLOCK":
					case "VARDECL":
					case "ASSIGN":
					case "PRINT":
					case "WHILE":
					case "IF":
		            	this.SemanticAnalysis(currNode.getChildren()[i],symbolTable);
	        	}
	        }
		}
		private analysis(currNode, symbolTable?){
			debugger;
			switch(currNode.type){
				case"BLOCK":
					return this.analyzeBLOCK(currNode, symbolTable);
				case"VARDECL":
					return this.analyzeVARDECL(currNode, symbolTable);
				case "ASSIGN":
					return this.analyzeASSIGN(currNode, symbolTable);
				case "PRINT":
					return this.analyzePRINT(currNode, symbolTable);
				case "WHILE":
				case "IF":
					return this.analyzeIFWHILE(currNode, symbolTable);
			}
			return symbolTable;
		}
			
		private analyzeBLOCK(currNode, symbolTable){
			debugger;
			//entering a newscopeso we add a new scope to symbol table
			var tempST = new SymbolTable();
			//this will probably be ok but apologizes to future me if its not
			tempST.setParent(symbolTable);
			symbolTable.addChild(tempST);
			symbolTable = tempST;
			return symbolTable;
		}
		private analyzeVARDECL(currNode, symbolTable){
			debugger;
			var valueChild = currNode.getChildren()[1];
			var idChild = currNode.getChildren()[0];
			if (_Verbose)
				_Messenger.putMessage("Checking (" + valueChild.value+ ", Line: " +valueChild.line+
					") declaration");
			var varInScope = symbolTable.findValueInScope(valueChild.value);
			if (varInScope===null){
				var temp = new Node(idChild.type, valueChild.value, idChild.line);
				temp.setDeclared();
				if (_Verbose)
				_Messenger.putMessage("(" + valueChild.value+ ", Line: " +valueChild.line+
					") Declared properly");
				symbolTable.addNode(temp);
			}
			else{
				_Messenger.putError(idChild.line, ErrorType.Redeclared);
				//queue error of redeclared identifiers
			}

			return symbolTable;
		}
		private analyzeIFWHILE(currNode, symbolTable){
			debugger;
			var idChild = currNode.getChildren()[0].getChildren()[0];
			var compChild = currNode.getChildren()[0];
			var valueChild = currNode.getChildren()[0].getChildren()[1];
			if (idChild.type === "ID" && valueChild!=="ID")
				return this.varValueIFWHILE(idChild, valueChild,currNode, symbolTable);
			else if (idChild.type !== "ID" && valueChild==="ID")
				return this.varValueIFWHILE(valueChild, idChild, currNode, symbolTable);
			else if (idChild.type !== "ID" && valueChild!=="ID")
				return this.twoValueIFWHILE(valueChild, idChild, currNode, symbolTable);
			else 
				return this.twovarIFWHILE(valueChild, idChild, currNode, symbolTable);
		}
		private twoValueIFWHILE(idChild, valueChild,currNode, symbolTable){
			if (_Verbose)
				_Messenger.putMessage("Checking Comparison at Line: " +currNode.line);
		
			if (_Verbose)
				_Messenger.putMessage("Comparing two values.");

			if ((idChild.type ==="DIGIT" && valueChild.type ==="DIGIT")||
				(idChild.type==="STRING" && valueChild.type==="STRING")||
				(idChild.type==="BOOL" && valueChild.type==="BOOL")
				){
				//match!
				if (_Verbose)
					_Messenger.putMessage("(Line: " +idChild.line+") Type Comparison has matching types.");
			}
			else{
				_Messenger.putError(idChild.line, ErrorType.TypeMismatchComp);
			}
			
			return symbolTable;


		}
		private twovarIFWHILE(idChild, valueChild,currNode, symbolTable){
			
			if (_Verbose)
				_Messenger.putMessage("Checking Comparison at Line: " +currNode.line);

			if (_Verbose)
				_Messenger.putMessage("Comparing two IDs");

			var tempL =this.findVarType(idChild, symbolTable);
			var leftVarType = tempL[0];
			symbolTable = tempL[1];
			var tempR =this.findVarType(valueChild, symbolTable);
			var rightVarType = tempR[0];
			symbolTable = tempR[1];
			
			if (_Verbose)
				_Messenger.putMessage("Checking Comparison at Line: " +currNode.line);

			if (_Verbose)
				_Messenger.putMessage("Comparing two IDs");

			if (leftVarType === rightVarType){
				//match!
				if (_Verbose)
					_Messenger.putMessage("(Line: " +idChild.line+") Type Comparison has matching types.");	
			}
			else if (leftVarType=="" && rightVarType ==""){
				if (_Verbose)
					_Messenger.putWarning(idChild.line,"Neither variable has been declared so they are uncomparable.");		

				_Messenger.putError(idChild.line, ErrorType.TypeMismatchComp);	
			}
			else if (leftVarType==""){
				if (_Verbose)
					_Messenger.putWarning(idChild.line,idChild.ID +" has not been declared so it is not comparable.");		

				_Messenger.putError(idChild.line, ErrorType.TypeMismatchComp);	
			}
			else if (rightVarType ==""){
				if (_Verbose)
					_Messenger.putWarning(valueChild.line, valueChild.ID +" has not been declared so it is not comparable.");		

				_Messenger.putErrorv(valueChild.line, ErrorType.TypeMismatchComp);	
			}

			return symbolTable;

		}
		private varValueIFWHILE(idChild, valueChild,currNode, symbolTable){
			var varInScope = symbolTable.findValueInScope(idChild.value);
			var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
			
			if (_Verbose)
				_Messenger.putMessage("Checking Comparison at Line: " +currNode.line);

			if (_Verbose)
				_Messenger.putMessage("Comparing an ID and value.");
			var temp =this.findVarType(idChild, symbolTable);
			var varType = temp[0];
			symbolTable = temp[1];

			if (varType === valueChild.type){
				//match!
				if (_Verbose)
					_Messenger.putMessage("(Line: " +idChild.line+") Type Comparison has matching types.");
				if (!varInScope.initialized)
					_Messenger.putWarning(idChild.line,"ID has not been initialized, but used in comparison.");
				//so create a new instance of the variable for the symbol table
				varInScope.setUsed();
				symbolTable.replace(varInScope);
			}
			else{
				_Messenger.putError(idChild.line, ErrorType.TypeMismatchComp);
			}
			return symbolTable;

		}
		private analyzeASSIGN(currNode, symbolTable){
			var valueChild = currNode.getChildren()[1];
			var idChild = currNode.getChildren()[0];
			//TODO add check for addition in assignment
			if (_Verbose)
				_Messenger.putMessage("Checking assignment at Line: " +currNode.line);

			if (idChild.type ==="ID" && valueChild.type==="ID")//two ids
				return this.twoIDASSIGN(idChild, valueChild, currNode, symbolTable);
			else if()
				return this.idValASSIGN(idChild, valueChild, currNode, symbolTable);
			
		}
		private idValASSIGN(idChild, valueChild,currNode, symbolTable){
			var varinScope = this.findVarType(idChild)
			if ((varInScope.type ==="INT" && valueChild.type ==="DIGIT")||
					(varInScope.type==="STR" && valueChild.type==="STRING")||
					(varInScope.type==="BOOL" && valueChild.type==="BOOL")
					){
					//match!
					if (_Verbose)
						_Messenger.putMessage("(" + idChild.value+ ", Line: " +idChild.line+
					") Type Declaration matches assignment value.");
		}
		private twoIDASSIGN(idChild, valueChild,currNode, symbolTable){
			var tempL =this.findVarType(idChild, symbolTable, true);
			var leftVarType = tempL[0];
			symbolTable = tempL[1];
			var tempR =this.findVarType(valueChild, symbolTable, true);
			var rightVarType = tempR[0];
			symbolTable = tempR[1];

			if (_Verbose)
				_Messenger.putMessage("Assigning one ID to another ID.");

			if (leftVarType===rightVarType){
				if (_Verbose)
					_Messenger.putMessage("Assignment types match.");
				if (!idChild.initialized)
					_Messenger.putWarning(idChild.line, valueChild.ID +" has not been assigned a value. So the assignment is pointless.");
			}
			else {
				_Messenger.putError(idChild.line, ErrorType.TypeMismatchAssign);
			}

		}
		private analyzePRINT(currNode, symbolTable){
			debugger;
			var idChild = currNode.getChildren()[0];
			var varInScope = symbolTable.findValueInScope(idChild.value);
			var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
			if (_Verbose)
				_Messenger.putMessage("Checking (" +idChild.value+ ", Line: " +idChild.line+
					") print statement");
			if (varInScope!==null){
				//so the variable has been declared...
				//but does the type match?
				if (_Verbose)
					_Messenger.putMessage("ID has been declared in current scope.");
				if (varInScope.initialized){
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
				if (varInParentScope.initialized){
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
				_Messenger.putError(idChild.line, ErrorType.Undeclared);
			}
			return symbolTable;
		}

		private findVarType(idChild, symbolTable, assign?){
			var type="";
			var varInScope = symbolTable.findValueInScope(idChild.value);
			var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
			
			if (varInScope !== null){
				type = varInScope.type;
				if (_Verbose)
					_Messenger.putMessage("Found" +varInScope.ID+" ID in current scope.");

				if (varInScope.initialized)
					_Messenger.putWarning(idChild.line,varInScope.ID+" has not been initialized, but used in comparison.");
				if (assign)
					varInScope.setInitialized();
				else
					varInScope.setUsed();
				symbolTable.replace(varInScope);
			}
			else if (varInParentScope !==null){
				type = varInParentScope.type;
				if (_Verbose)
					_Messenger.putMessage("Found "+ varInParentScope.ID +" ID in parent scope.");
				if (!varInParentScope.initialized)
					_Messenger.putWarning(idChild.line,varInParentScope.ID+" has not been initialized, but used in comparison.");
				if (assign)
					varInScope.setInitialized();
				else
					varInParentScope.setUsed();
				symbolTable.replace(varInParentScope);
			}
			else{
				_Messenger.putError(idChild.line, ErrorType.Undeclared, idChild.ID);
			}

			return [type, symbolTable];
		}
	}
}