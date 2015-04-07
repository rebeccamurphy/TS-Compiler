module TSC
{
	export class TreeNode {
	private chr;
	constructor(private value:any, private parent:TreeNode, private children?:Array<TreeNode>) {
        this.value = value;
        this.parent = parent;
        this.children =[];
        this.chr = [];
    }
    public getValue(){
    	return this.value;
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
    public toString(){
    	return this.value.toUpperCase();
    }

	}
    	
}