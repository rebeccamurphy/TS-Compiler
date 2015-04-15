var TSC;
(function (TSC) {
    var TreeNode = (function () {
        function TreeNode(type, parent, value, line, children) {
            if (children === void 0) { children = []; }
            this.type = type;
            this.parent = parent;
            this.value = value;
            this.line = line;
            this.children = children;
            //for CST
            this.type = type;
            this.value = (value === undefined) ? '' : value;
            this.parent = parent;
            this.line = (line === undefined) ? -1 : line;
        }
        TreeNode.prototype.toString = function () {
            return this.type + ", " + this.value;
        };
        TreeNode.prototype.tabs = function (n) {
            var str = "";
            for (var i = 0; i < n; i++)
                str += "&nbsp&nbsp";
            return str;
        };
        TreeNode.prototype.equals = function (node) {
            return this.value === node.value && this.parent === this.parent;
        };
        TreeNode.prototype.getType = function () {
            return this.type;
        };
        TreeNode.prototype.getValue = function () {
            return this.value;
        };
        TreeNode.prototype.setValue = function (val) {
            this.value = val;
        };
        TreeNode.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        TreeNode.prototype.getParent = function () {
            return this.parent;
        };
        TreeNode.prototype.addChild = function (child, value) {
            //debugger;
            if (typeof child === "string")
                var ch = new TreeNode(child, this, '');
            else if (value === undefined)
                var ch = new TreeNode(TokenTypeString[child], this, TokenTypeChar[child], _CurrentToken.line);
            else
                var ch = new TreeNode(TokenTypeString[child], this, value, _CurrentToken.line);
            this.children.push(ch);
            return ch;
        };
        TreeNode.prototype.addChildNode = function (child) {
            child.setParent(this);
            this.children.push(child);
            return child;
        };
        TreeNode.prototype.getChildren = function () {
            return this.children;
        };
        TreeNode.prototype.getNewestChild = function () {
            return this.children[this.children.length - 1];
        };
        TreeNode.prototype.getChild = function (value) {
            //token or index don't ask
            if (typeof value === "number")
                return this.children[value];
            else
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i] === (value))
                        return this.children[i];
                }
        };
        TreeNode.prototype.printCST = function (depth, id) {
            if (depth === null)
                depth = 0;
            this.nodeHTML(depth, id);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].printCST(depth + 1, id);
        };
        TreeNode.prototype.makeAST = function (depth, currnode) {
            //debugger;
            if (depth === -1 && this.type === "BLOCK") {
                _ASTRoot = new TreeNode("BLOCK", null);
                currnode = _ASTRoot;
                depth = 0;
            }
            for (var i = 0; i < this.children.length; i++) {
                //debugger;
                if (this.type !== "PROGRAM") {
                    switch (this.children[i].type) {
                        case 'BLOCK':
                            var temp = new TreeNode("BLOCK", null, '', this.children[i].line);
                            currnode.addChildNode(temp);
                            currnode = temp;
                            this.children[i].makeAST(depth + 1, currnode);
                            break;
                        case 'ASSIGNMENTSTATEMENT':
                            var temp = new TreeNode('ASSIGN', null, '', this.children[i].line);
                            temp.addChildNode(this.children[i].children[0]);
                            //if this works i can't defend myself
                            if (this.children[i].children[2].children[0].type === "BOOLEANEXPR") {
                                temp.addChildNode(this.children[i].children[2].children[0].children[0]);
                            }
                            else if (this.children[i].children[2].children[0].type === "INTEXPR") {
                                debugger;
                                if (this.children[i].children[2].children[0].children[1] !== undefined) {
                                    //addition in assignment
                                    var temp2 = new TreeNode("ADD", null, "+");
                                    temp2.addChildNode(this.children[i].children[2].children[0].children[0]);
                                    temp2.addChildNode(this.children[i].children[2].children[0].children[2].children[0].children[0]);
                                    temp.addChildNode(temp2);
                                }
                                else {
                                    temp.addChildNode(this.children[i].children[2].children[0].children[0]);
                                }
                            }
                            else {
                                //debugger;
                                var charString = "";
                                charString = TSC.Utils.charsToString(this.children[i].children[2].children[0].children[1]);
                                temp.addChildNode(new TreeNode("STRING", null, charString, this.children[i].line));
                            }
                            currnode.addChildNode(temp);
                            break;
                        case 'WHILESTATEMENT':
                            var temp = new TreeNode('WHILE', null, '', this.children[i].line);
                            var comp = new TreeNode('COMP', null, this.children[i].children[1].children[2].getValue(), this.children[i].line);
                            //WhileSTATEMENT     /boolexp    //expr      //id                    
                            comp.addChildNode(this.children[i].children[1].children[1].children[0]);
                            comp.addChildNode(this.children[i].children[1].children[3].children[0]);
                            temp.addChildNode(comp);
                            currnode.addChildNode(temp);
                            //block
                            this.children[i].makeAST(depth + 1, currnode);
                            break;
                        case 'IFSTATEMENT':
                            var temp = new TreeNode('IF', null, '', this.children[i].line);
                            var comp = new TreeNode('COMP', null, this.children[i].children[1].children[2].getValue(), this.children[i].line);
                            //IFSTATEMENT     /boolexp    //expr      //id                    
                            comp.addChildNode(this.children[i].children[1].children[1].children[0]);
                            comp.addChildNode(this.children[i].children[1].children[3].children[0]);
                            temp.addChildNode(comp);
                            currnode.addChildNode(temp);
                            //block
                            this.children[i].makeAST(depth + 1, currnode);
                            break;
                        case 'PRINTSTATEMENT':
                            var temp = new TreeNode("PRINT", null, '', this.children[i].line);
                            var type = this.children[i].children[2].children[0]; //int, string, boolean, id
                            switch (type.type) {
                                case "ID":
                                    temp.addChildNode(type);
                                    break;
                                case "INTEXPR":
                                case "BOOLEANEXP":
                                    temp.addChildNode(type.children[0]);
                                    break;
                                case "STRINGEXPR":
                                    var charString = "";
                                    charString = TSC.Utils.charsToString(this.children[i].children[2].children[0]);
                                    temp.addChildNode(new TreeNode("STRING", null, charString));
                                    break;
                            }
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
        };
        TreeNode.prototype.printAST = function (depth, id) {
            //debugger;
            if (depth === null)
                depth = 0;
            this.nodeHTML(depth, id);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].printAST(depth + 1, id);
        };
        TreeNode.prototype.nodeHTML = function (depth, id) {
            var output = (this.value === '' || this.value === undefined) ? this.type : this.type + ", <b>" + this.value + "</b>";
            document.getElementById(id).innerHTML = document.getElementById(id).innerHTML +
                "<div>" + this.tabs(depth) + output + "</div>";
        };
        return TreeNode;
    })();
    TSC.TreeNode = TreeNode;
})(TSC || (TSC = {}));
