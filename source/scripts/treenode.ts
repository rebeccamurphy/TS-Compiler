module TSC
{
	export class TreeNode {
	private chr;
	constructor(private type:string, private parent:TreeNode, private value?:any, private children?:Array<TreeNode>, private item?) {
        //for CST
        this.type = type;
        this.value = value;
        this.parent = parent;
        this.item = null;
        this.children = (children===undefined)? []: children;
        this.chr = [];
    }
    /*
    constructor(private value:any) {
        //for symbol table
        this.value = value;
        this.parent = null;
        this.item = null;
        this.children =[];
        this.chr = [];
    }*/
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
    public setValue(val:any){
        this.value = val;
    }
    public getItem(){
    	return this.item;
    }
    public setItem(val:any){
        this.item = val;
    }
    public setParent(parent:TreeNode){
    	this.parent=parent;
    }

    public getParent(){
    	return this.parent;
    }
    public addChild(child:any, value?:string){
        debugger;
        if (typeof child ==="string")
           var ch = new TreeNode(child, this, '');
        else if (value===undefined)
    	   var ch = new TreeNode(TokenTypeString[child], this, TokenTypeChar[child]);
        else 
            var ch = new TreeNode(TokenTypeString[child], this, value);
        this.children.push(ch);
        return ch;
    }
    
    public addChildNode(child:TreeNode) {
        child.setParent(this); 
        this.children.push(child);
        return child;
    }
    public getChilden(){
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
    public createRoot(rootTreeNode:TreeNode){
    	var tree = new TreeModel();
    	var root = tree.parse({
    		id: rootTreeNode.value,
    		chr: rootTreeNode.chr
    	});
    }
    
    public printTree(depth?:number, id?:string){
        if(depth===null)
            depth = 0;
        this.nodeHTML(depth, id);
        for(var i=0; i<this.children.length; i++)
            this.children[i].printTree(depth+1, id);
    }
    public toString(){
    	return this.value.toUpperCase();
    }
    public nodeHTML(depth:number, id?:string){
        var output = (this.value===''||this.value===undefined)? this.type : this.type +", <b>" +this.value + "</b>";
    	document.getElementById(id).innerHTML = document.getElementById(id).innerHTML + 
            "<div>" +this.tabs(depth) + output +"</div>";
    }
	}
    	
}