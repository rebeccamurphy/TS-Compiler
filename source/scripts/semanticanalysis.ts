module TSC
{
	export class SemanticAnalysis {
		public currScope:number;
		public ID:string;
		public numComps:number =0;
		public firstType:String ="";
		constructor(private rootNode: TreeNode, ID:string) {
			this.rootNode = rootNode;
			this.currScope = -1;
			this.ID = ID;
		}

		public SemanticAnalysis(currNode:TreeNode, symbolTable?){
			//debugger;
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
			//debugger;
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
			//debugger;
			//entering a newscopeso we add a new scope to symbol table
			var tempST = new SymbolTable();
			//this will probably be ok but apologizes to future me if its not
			tempST.setParent(symbolTable);
			symbolTable.addChild(tempST);
			symbolTable = tempST;
			return symbolTable;
		}
		private analyzeVARDECL(currNode, symbolTable){
			//debugger;
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
			else {
				_Messenger.putError(idChild.line, ErrorType.Redeclared);
				//queue error of redeclared identifiers
			}

			return symbolTable;
		}
		private analyzeIFWHILE(currNode, symbolTable){
			debugger;
			if (currNode.getChildren()[0].type==="COMP"){
				var left = currNode.getChildren()[0].getChildren()[0];
				var compChild = currNode.getChildren()[0];
				var right = currNode.getChildren()[0].getChildren()[1];
				if (_Verbose)
					_Messenger.putMessage("Checking comparison at Line: " +left.line);
				//this.firstType=left.type;
				var type = left.type;
				if (left.type =="ID"){
					var temp = this.findVarType(left, symbolTable, true);
					type = temp[0];
					symbolTable = temp[1];
				}

				symbolTable = this.checkType(type, currNode, symbolTable);
				this.numComps =0;
			}
			//else dont do anything because type was already checked in parser
		}
		private analyzeASSIGN(currNode, symbolTable){
			debugger;
			var valueChild = currNode.getChildren()[1];
			var idChild = currNode.getChildren()[0];
			//TODO add check for addition in assignment
			if (_Verbose)
				_Messenger.putMessage("Checking assignment at Line: " +idChild.line);
			var temp = this.findVarType(idChild, symbolTable, true);
			var idType = temp[0];
			symbolTable = temp[1];
			symbolTable = this.checkType(idType, currNode, symbolTable, true)
			
		}
		private analyzePRINT(currNode, symbolTable){
			debugger;
			var idChild = currNode.getChildren()[0];
			var valueChild = currNode.getChildren()[1];
			if (idChild.type==="ADD")
				idChild = currNode.getChildren()[0].getChildren()[0];
			if (_Verbose)
				_Messenger.putMessage("Checking (" +idChild.value+ ", Line: " +idChild.line+
					") print statement");
			var temp = this.findVarType(idChild,symbolTable, true);
			var type = temp[0];
			symbolTable = temp[1];
			if (type ==="DIGIT")
				type = "INT";
			else if (type ==="STRING")
				type= "STR";
			symbolTable= this.checkType(type,valueChild,  symbolTable);
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
			var varInParentScope = (varInParentScope===undefined)? _varInParentScope: varInParentScope;
			_varInParentScope = null;
			if (varInScope !== null){
				type = varInScope.type;
				if (_Verbose &&!assign)
					_Messenger.putMessage("Found " +varInScope.ID+" ID in current scope.");

				if (!varInScope.initialized && !assign)
					_Messenger.putWarning(idChild.line,varInScope.ID+" has not been initialized, but used in statement.");
				if (assign)
					varInScope.setInitialized();
				else
					varInScope.setUsed();
				symbolTable.replace(varInScope);
			}
			else if (varInParentScope !==null){
				type = varInParentScope.type;
				if (_Verbose &&!assign)
					_Messenger.putMessage("Found "+ varInParentScope.ID +" ID in parent scope.");
				if (!varInParentScope.initialized &&!assign)
					_Messenger.putWarning(idChild.line,varInParentScope.ID+" has not been initialized, but used in statement.");
				if (assign)
					varInParentScope.setInitialized();
				else
					varInParentScope.setUsed();
				symbolTable.replace(varInParentScope);
			}
			else if (!assign){
				_Messenger.putError(idChild.line, ErrorType.Undeclared, idChild.ID);
			}

			return [type, symbolTable];
		}
		private checkType(type, node, symbolTable, assign?){
			debugger;
			if (node.type =="ID"||node.type =="DIGIT" ||node.type =="BOOL"||node.type==="STRING"){
				if (node.type ==="ID"){
					var temp = this.findVarType(node, symbolTable);
					var nodeType = temp[0];
					symbolTable = temp[1];
				}
				else{ 
					var nodeType = null;
					nodeType = (node.type==="DIGIT") ? "INT" :node.type;
					nodeType = (node.type==="STRING") ? "STR":nodeType;	
				}
				if (type !== nodeType){
					if (_Verbose){
						_Messenger.putMessage("(Line: " +node.line +") "+ node.value + " does not match type " + type);
					}
					_Messenger.putError(node.line, ErrorType.TypeMismatch);

				}
				else if (_Verbose){
					_Messenger.putMessage("(Line: "+ node.line+") "+ node.value +" Matches type: " +type);	
				}
			}
			for(var i=0; i<node.children.length; i++){
				if (node.children[i].type ==="COMP"){
					this.numComps++;
					if (node.children[i].children[0].type=="ADD" ||node.children[i].children[0].type=="DIGIT"){
						if (_Verbose)
							_Messenger.putMessage("Comparing DIGIT...");
						type = "INT";
						this.checkType(type, node.children[i], symbolTable);
					}
					else if (node.children[i].children[0].type!=="COMP"){
						if (_Verbose)
							_Messenger.putMessage("Comparing " +node.children[i].children[0].type +"...");

						type = (node.children[i].children[0].type==="ID")?type:node.children[i].children[0].type ;
						type = (type==="DIGIT") ? "INT" :type;
						type = (type==="STRING") ? "STR":type;	
						
						if (type==="BOOL"&&node.children[i].children[0].type==="ID"){
							//type shouldnt be for bool it should be for id type									
							var temp = this.findVarType(node.children[i].children[0], symbolTable, true);
							var nodeType = temp[0];
							type=nodeType;
						}
						this.checkType(type, node.children[i], symbolTable);
					}
					else
						this.checkType(type, node.children[i], symbolTable);
				
				}	
						
				else if (node.children[i+1]!==undefined){
					if (node.children[i+1].type==="COMP")
						this.checkType("BOOL", node.children[i], symbolTable);
					else
						this.checkType(type, node.children[i], symbolTable);
				}
				else
					this.checkType(type, node.children[i], symbolTable);
			}
			
			return symbolTable;
		}
	}
}