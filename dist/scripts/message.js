var TSC;
(function (TSC) {
    var Messager = (function () {
        function Messager(ID) {
            this.putExpectingWrong = function (line, part, expected, found) {
                this.putMessage("(Line: " + line + ") " + part + " Error: Expected " + expected + ", Found " + found);
            };
            this.ID = ID;
        }
        Messager.prototype.putMessage = function (msg) {
            document.getElementById(this.ID).innerHTML += msg + "\n";
        };
        Messager.prototype.putHeaderMessage = function (msg) {
            if (_Verbose) {
                this.putMessage("-------------------------");
                this.putMessage(msg);
                this.putMessage("-------------------------");
            }
            else
                this.putMessage(msg);
        };
        Messager.prototype.putError = function (line, part, msg) {
            if (typeof msg !== "number") {
                this.putMessage("*****(Line: " + line + ") " + part + " Error: " + msg + "*****");
                if (part === "Lexer")
                    _LexerError = true;
            }
            else
                this.putMessage("*****(Line: " + line + ") " + part + " Error: " + Error[msg] + "*****");
        };
        Messager.prototype.putWarning = function (line, part, msg) {
            if (typeof msg !== "number")
                this.putMessage("***(Line: " + line + ") " + part + " Warning " + msg + "***");
            else
                this.putMessage("***(Line: " + line + ") " + part + " Warning " + Warning[msg] + "***");
        };
        Messager.prototype.putExpectingCorrect = function (line, part, expected, found) {
            this.putMessage("(Line: " + line + ") " + part + " Expected " + expected + ", Found " + found);
        };
        Messager.prototype.putFailed = function (part) {
            this.putMessage(part + ": Failed. Compilation has been terminated.");
        };
        Messager.prototype.putSuccess = function (part) {
            this.putMessage(part + ": Completed Successfully.");
        };
        return Messager;
    })();
    TSC.Messager = Messager;
})(TSC || (TSC = {}));
