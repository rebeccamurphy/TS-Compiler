var TSC;
(function (TSC) {
    var Messenger = (function () {
        function Messenger(ID) {
            this.ID = ID;
            this.ID = ID;
        }
        Messenger.prototype.putMessage = function (msg) {
            document.getElementById(this.ID).innerHTML += msg + "\n";
        };
        Messenger.prototype.putHeaderMessage = function (msg) {
            if (_Verbose) {
                this.putMessage("-------------------------");
                this.putMessage(msg);
                this.putMessage("-------------------------");
            }
            else
                this.putMessage(msg);
        };
        Messenger.prototype.putError = function (line, part, msg) {
            if (typeof msg !== "number") {
                this.putMessage("*****(Line: " + line + ") " + part + " Error: " + msg + "*****");
                if (part === "Lexer")
                    _LexerError = true;
            }
            else
                this.putMessage("*****(Line: " + line + "), Error: " + ErrorStr[msg] + "*****");
        };
        Messenger.prototype.putWarning = function (line, part, msg) {
            if (typeof msg !== "number")
                this.putMessage("***(Line: " + line + ") " + part + " Warning " + msg + "***");
            else
                this.putMessage("***(Line: " + line + ") " + part + " Warning " + WarningStr[msg] + "***");
        };
        Messenger.prototype.putExpectingCorrect = function (line, part, expected, found) {
            this.putMessage("(Line: " + line + ") " + part + " Expected " + expected + ", Found " + found);
        };
        Messenger.prototype.putExpectingWrong = function (line, part, expected, found) {
            this.putMessage("(Line: " + line + ") " + part + " Error: Expected " + expected + ", Found " + found);
        };
        Messenger.prototype.putFailed = function (part) {
            this.putHeaderMessage(part + ": Failed. Compilation has been terminated.");
        };
        Messenger.prototype.putSuccess = function (part) {
            this.putHeaderMessage(part + ": Completed Successfully.");
        };
        return Messenger;
    })();
    TSC.Messenger = Messenger;
})(TSC || (TSC = {}));
