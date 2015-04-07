module TSC
{
	export class TreeNode {

	constructor(private value:any, private parent:TreeNode, private children?:Array<TreeNode>) {
        this.value = value;
        this.parent = parent;
        this.children =[];
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
    public toString(){
    	return this.value.toUpperCase();
    }
	}
    	
}