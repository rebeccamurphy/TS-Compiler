module TSC
{
	export class TreeNode {
        private children;
        public scope;
	constructor(private type:string, private parent:TreeNode, private value?:any, private line?:number) {
        //for CST
        this.type = type;
        this.value = (value===undefined)? '':value;
        this.parent = parent;
        this.line = (line===undefined)? -1:line;
        this.children =[];
        this.scope =-1;
    }
    public toString(){
        var s = (this.scope===-1)? "" : this.scope;
        return this.type +", " +this.value +" "+ this.scope;
    }
    private tabs(n) {
        var str = "";
        for(var i=0; i<n; i++)
            str += "&nbsp&nbsp";
        return str;
    }
    public equals(node:TreeNode){
        return this.value===node.value &&this.parent === this.parent;
    }
    public getType(){
    	return this.type;
    }
    public getValue(){
        return this.value;
    }
    public getLine(){
        return this.line;
    }
    public setValue(val:any){
        this.value = val;
    }
    public setParent(parent:TreeNode){
    	this.parent=parent;
    }

    public getParent(){
    	return this.parent;
    }

    public addChild(child:any, value?:string){
        ////debugger;
        if (typeof child ==="string")
           var ch = new TreeNode(child, this, '');
        else if (value===undefined)
    	   var ch = new TreeNode(TokenTypeString[child], this, TokenTypeChar[child], _CurrentToken.line);
        else 
            var ch = new TreeNode(TokenTypeString[child], this, value, _CurrentToken.line);
        this.children.push(ch);
        return ch;
    }
    
    public addChildNode(child:TreeNode) {
        child.setParent(this); 
        this.children.push(child);
        return child;
    }
    public addChildren(node){
       // debugger;
        var temp = null;
        if (this.type ==="DIGIT"|| this.type=="CHARLIST"|| this.type=="BOOL"||this.type==="ADD" ||this.type==="BOOLOP"||this.type=="ID"){
            if (this.type=="CHARLIST"){
                var str = TSC.Utils.charsToString(this);
                temp =(str!=="")? new TreeNode("STRING", null, str, this.children[0].line):new TreeNode("STRING", null, str, this.line);

            }
            else if (this.type==="BOOLOP"){
                temp = new TreeNode("COMP", null, this.value, this.line)
            }
            else{
                temp = new TreeNode(this.type, null, this.value, this.line);
            }
            node.addChildNode(temp);
            node = temp;

        }
        if (node.type!=="STRING"){
            for(var i=0; i<this.children.length; i++){
                if (this.children[i+1] !==undefined){
                    if (this.children[i+1].type==="ADD" || this.children[i+1].type==="BOOLOP"){
                        this.children[i+1].addChildren(node);
                        this.children[i].addChildren(node.getNewestChild());
                        this.children[i+2].addChildren(node.getNewestChild());
                        i+=2;
                    }
                    else
                        this.children[i].addChildren(node);
                }

                else
                    this.children[i].addChildren(node);

            }
        }

    }
    public getChildren(){
    	return this.children;
    }
    public getNewestChild(){
    	return this.children[this.children.length-1];
    }
    public getChild(value){
    	//token or index don't ask
    	if (typeof value === "number")
    		return this.children[value];
    	else
	    	for (var i=0;i<this.children.length; i++){
	    		if (this.children[i]===(value))
	    			return this.children[i];
	    	}

    }

    public printCST(depth?:number, id?:string){
        if(depth===null)
            depth = 0;
        this.nodeHTML(depth, id);
        for(var i=0; i<this.children.length; i++)
            this.children[i].printCST(depth+1, id);
    }
    public makeAST(depth?:number, currnode?:TreeNode){
        ////debugger;
        if (depth===-1 && this.type==="BLOCK"){
            _ASTRoot = new TreeNode("BLOCK", null);
            currnode = _ASTRoot
            depth=0;
        }
        for(var i=0; i<this.children.length; i++){
            ////debugger;
            if (this.type!=="PROGRAM"){
                switch(this.children[i].type){
                    case 'BLOCK':
                        var temp = new TreeNode("BLOCK", null, '', this.children[i].line);
                        currnode.addChildNode(temp);
                        currnode = temp;
                        this.children[i].makeAST(depth+1, currnode); 
                        break;
                    case 'ASSIGNMENTSTATEMENT':
                        var temp =new TreeNode('ASSIGN', null,'', this.children[i].line);
                        //id
                        //temp.addChildNode(this.children[i].children[0]);
                        this.children[i].addChildren(temp);
                        currnode.addChildNode(temp);
                        break; 
                    case 'WHILESTATEMENT':
                    case 'IFSTATEMENT':
                        var str = (this.children[i].type==='IFSTATEMENT')? "IF" :"WHILE";
                        var temp =new TreeNode(str, null,'', this.children[i].line);
                        //debugger;
                        if (this.children[i].children[1].children[0].type !=="LPAREN"){
                            //where case with if true/false
                            temp.addChildNode(this.children[i].children[1].children[0]);
                        }
                        else {
                            var comp = new TreeNode('COMP',null, this.children[i].children[1].children[2].getValue(),this.children[i].line);
                                                //WhileSTATEMENT     /boolexp    //expr      //id                    
                            this.children[i].children[1].children[1].addChildren(comp);
                            this.children[i].children[1].children[3].addChildren(comp);
                            temp.addChildNode(comp);
                        }
                        currnode.addChildNode(temp);
                        //block
                        this.children[i].makeAST(depth+1, currnode); 
                        break;
                    case 'PRINTSTATEMENT':
                        var temp = new TreeNode("PRINT", null,'', this.children[i].line);
                        var type = this.children[i].children[2].children[0];//int, string, boolean, id
                        this.children[i].addChildren(temp);
                        currnode.addChildNode(temp);
                        break;
                    case 'VARDECL':
                        currnode.addChildNode(this.children[i]);
                        break;
                    default:
                        this.children[i].makeAST(depth, currnode); 
                }
            }
            else
                this.children[i].makeAST(depth, currnode);        
        }
        
    }
    public printAST(depth?:number, id?:string){
       ////debugger;
        if(depth===null)
            depth = 0;
        this.nodeHTML(depth, id);
        for(var i=0; i<this.children.length; i++)
            this.children[i].printAST(depth+1, id);
        

    }
    public nodeHTML(depth:number, id?:string){
        var output = (this.value===''||this.value===undefined)? this.type : this.type +", <b>" +this.value + "</b>";
    	document.getElementById(id).innerHTML = document.getElementById(id).innerHTML + 
            "<div>" +this.tabs(depth) + output +"</div>";
    }
	
    }
    	
}