module TSC
{
	export class SemanticAnalysis {
		constructor() {
			this.head = null;
    		this.currNode = head;
    		this.maxScope = -1;    
		}
		public scopeIn() {
	        if(head) {
	            var newScope = new TreeNode(++maxScope);
	            newScope.setItem([]);
	            currentNode.addChild(newScope);
	            currentNode = newScope;
	        } else {
	            head = new TreeNode(++maxScope);
	            head.setParent(null);
	            currentNode = head;
	        }
	        /*if(currentNode.getValue() >= 0)
				put message about changing scope
	        */
		}
		public scopeOut() {
	        if(currentNode.getParent()) {
	            currentNode = currentNode.getParent();
	            /*message about changing scope*/
	        }
		}
	}
}