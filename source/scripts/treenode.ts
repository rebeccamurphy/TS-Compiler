module TSC
{
	export class Treenode {

	constructor(private token:Token, private parent:Node, private children:Array<Node>) {
        this.token = token;
        this.parent = parent;
        this.children =[];
    }
    public getToken(){
    	return this.token;
    }
    public setParent(parent:Node){
    	this.parent=parent;
    }

    public getParent(){
    	return this.parent;
    }
    public addChild(child:Node) {
        child.setParent(this); 
        this.children.push(child);
        return child;
    }
    public getChilden(){
    	return this.children;
    }

    public getChild(token){
    	//token or index don't ask
    	if (typeof token === "number")
    		return this.children[token];
    	else
	    	for (var i=0;i<this.children.length; i++){
	    		if (this.children[i].token.equals(token))
	    			return this.children[i];
	    	}

    }
    public toString(){
    	return this.token.type +", " +this.token.value;
    }
	}
    	
}