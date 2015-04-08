module TSC
{
	export class TreeNode {
	private chr;
	constructor(private value:any, private parent:TreeNode, private children?:Array<TreeNode>, private item?) {
        //for CST
        this.value = value;
        this.parent = parent;
        this.item = null;
        this.children =[];
        this.chr = [];
    }
    constructor(private value:any) {
        //for symbol table
        this.value = value;
        this.parent = null;
        this.item = null;
        this.children =[];
        this.chr = [];
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
    public addChild(child:string){
    	var ch = new TreeNode(child, this);
    	this.children.push(ch);
    	this.chr.push({id:child});
    	return ch;
    }
    public addChildNode(child:TreeNode) {
        child.setParent(this); 
        this.children.push(child);        
    	this.chr.push({id:child.value});
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
    public displayTree(rootNode:TreeNode){
        debugger;
        var currentNode = rootNode;
        var children = rootNode.children;
        var children2 =[];
        var lastchild = rootNode.children[rootNode.children.length-1]
        var htmlArray=[];
        var html ="";
        var level=0;
        htmlArray.push(["<ul><li>" +currentNode.value +"</li>"]);
        for (var i =0; i< children.length; i++){
            currentNode = rootNode.children[i];
            children2= currentNode.children;
            htmlArray[++level] =htmlArray[level] += "<ul><li>" +currentNode.value +"</li><ul>";
            while(children2.length !==0){
                level++;
                var x = children2.length;
                for (var j =0; j<x; j++ ){
                    var curr = children2.shift();
                    htmlArray[level]=htmlArray[level] +"<li>"+curr.value +"</li>";
                    children2 = children2.concat(curr.children);
                }
                htmlArray[level]= htmlArray[level]+"</ul>";
            }
        }
        for (var b=0; b<htmlArray.length;b++)
            html+=htmlArray[b];
        html+="</ul>";
        document.getElementById("tree").innerHTML = html;
    }
    public printTree(depth:number){
        if(!depth)
            depth = 0;
        document.getElementById("tree").innerHTML = document.getElementById("tree").innerHTML + 
            "<div>" +this.tabs(depth) + this.value +"</div>";
        for(var i=0; i<this.children.length; i++)
            this.children[i].printTree(depth+1);
    }
    public toString(){
    	return this.value.toUpperCase();
    }

	}
    	
}