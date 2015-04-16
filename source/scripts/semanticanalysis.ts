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
				case "IF"://iftrue
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
				_Messenger.putMessage("Checking assignment at Line: " +idChild.line);
			var temp = this.findVarType(idChild, symbolTable, true);
			var idType = temp[0];
			symbolTable = temp[1];
			symbolTable = this.checkType(idType, currNode, symbolTable)
			
			/*
			if (valueChild.value ==="+"){ //increment assign
				return this.incASSIGN(currNode, symbolTable);
			}
			else if (valueChild.type ==="COMP") //boolean comparison in assignment
				return this.booleanCompASSIGN(currNode, symbolTable);
			else if (idChild.type ==="ID" && valueChild.type==="ID")//two ids
				return this.twoIDASSIGN(idChild, valueChild, currNode, symbolTable);
			else
				return this.idValASSIGN(idChild, valueChild, currNode, symbolTable);
			*/
		}
		private booleanCompASSIGN(currNode, symbolTable){
			var temp = this.findVarType(currNode.getChildren()[0], symbolTable, true);
			var idChildType = temp[0];
			var symbolTable = temp[1];
			temp = this.findVarType(currNode.getChildren()[1].getChildren()[0], symbolTable);
			var left = temp[0];
			symbolTable = temp[1];
			temp = this.findVarType(currNode.getChildren()[1].getChildren()[1], symbolTable);
			var right = temp[0];
			symbolTable = temp[1];
			if (left!==right){
				//put error cannot compare  mismatched type
				//cannot assign mismatched types
				_Messenger.putError(currNode.getChildren()[0].line, ErrorType.TypeMismatchComp);
				_Messenger.putError(currNode.getChildren()[0].line, ErrorType.TypeMismatchAssign);
			}
			else if (idChildType ===left &&idChildType===right){
				//assignment matches
				if(_Verbose)
					_Messenger.putMessage("Assignment Types Match.");
			}
			else{
				//assignment types dont match
				_Messenger.putError(currNode.getChildren()[0].line, ErrorType.TypeMismatchAssign);
			}
			//b ==b
			//b==1
			//1==b
			//1 ==1


		}
		private analyzePRINT(currNode, symbolTable){
			debugger;
			var idChild = currNode.getChildren()[0];
			if (_Verbose)
				_Messenger.putMessage("Checking (" +idChild.value+ ", Line: " +idChild.line+
					") print statement");
			symbolTable = this.findVarType(idChild,symbolTable)[1];
			return symbolTable;
		}

		private findVarType(idChild, symbolTable:SymbolTable, assign?){
			debugger;
			if (idChild.type !=="ID"){
				return [idChild.type, symbolTable];
			}
			var type="";
			var varInScope = symbolTable.findValueInScope(idChild.value);
			var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
			
			if (varInScope !== null){
				type = varInScope.type;
				if (_Verbose)
					_Messenger.putMessage("Found " +varInScope.ID+" ID in current scope.");

				if (!varInScope.initialized && !assign)
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
				if (!varInParentScope.initialized &&!assign)
					_Messenger.putWarning(idChild.line,varInParentScope.ID+" has not been initialized, but used in comparison.");
				if (assign)
					varInParentScope.setInitialized();
				else
					varInParentScope.setUsed();
				symbolTable.replace(varInParentScope);
			}
			else{
				_Messenger.putError(idChild.line, ErrorType.Undeclared, idChild.ID);
			}

			return [type, symbolTable];
		}
		private checkType(type, node, symbolTable){
			debugger;
			if (node.type =="ID"||node.type =="DIGIT" ||node.type =="BOOL"||node.type==="STRING"){
				if (node.type ==="ID"){
					var temp = this.findVarType(node, symbolTable);
					var nodeType = temp[0];
					var symbolTable = temp[1];
				}
				else{ 
					var nodeType = null;
					nodeType = (node.type==="DIGIT") ? "INT" :node.type;
					nodeType = (node.type==="STRING" && nodeType===null) ? "STR":nodeType;	
				}
				if (type !== nodeType){
					_Messenger.putError(node.line, ErrorType.TypeMismatch);
				}
				else if (_Verbose){
					_Messenger.putMessage("(Line: "+ node.line+") "+ node.value +" Matches type: " +type);	
				}
			}
			for(var i=0; i<node.children.length; i++){
				this.checkType(type, node.children[i], symbolTable);
			}
			return symbolTable;
		}
	}
}