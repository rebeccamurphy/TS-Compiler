module TSC
{
	export class SemanticAnalysis {
		private currNode :TreeNode;
		private astNode :TreeNode;
		private currScope:number;
		constructor(private rootNode: TreeNode, private rootScope: Scope) {
			this.currentNode = this.rootNode;
			this.currentScopeNumber = 0;
		}
	}
}