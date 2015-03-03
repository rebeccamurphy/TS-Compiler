/*
Class to handle buffer stuff
*/
var TSC;
(function (TSC) {
    var Buffer = (function () {
        function Buffer(str) {
            if (str === void 0) { str = ''; }
            this.str = str;
            this.str = str;
        }
        Buffer.prototype.push = function (ch) {
            //adds character to buffer
            this.str += ch;
        };
        Buffer.prototype.clear = function () {
            //clears the buffer
            this.str = '';
        };
        Buffer.prototype.get = function () {
            //returns the buffer
            return this.str;
        };
        Buffer.prototype.isEmpty = function () {
            return this.str === "";
        };
        Buffer.prototype.flush = function () {
            //returns and clears the buffer
            var text = this.str;
            this.str = '';
            return text;
        };
        Buffer.prototype.pop = function () {
            var temp = this.str.charAt(0);
            this.str = this.str.slice(1);
            return temp;
        };
        return Buffer;
    })();
    TSC.Buffer = Buffer;
})(TSC || (TSC = {}));
