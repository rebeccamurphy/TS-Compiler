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
                this.putMessage("-----------------------------------------");
                this.putMessage(msg);
                this.putMessage("-----------------------------------------");
            }
            else
                this.putMessage(msg);
        };
        Messenger.prototype.putError = function (line, msg, part) {
            if (typeof msg !== "number") {
                this.putMessage("*****(Line: " + line + ") Error: " + msg + "*****");
                if (part === "Lexer")
                    _LexerError = true;
                document.getElementById("Errors").innerHTML += "<div>(Line: " + line + ") Error: " + msg + "</div>";
            }
            else if (part === undefined) {
                this.putMessage("*****(Line: " + line + ") Error: " + ErrorStr[msg] + "*****");
                document.getElementById("Errors").innerHTML += "<div>(Line: " + line + ") Error: " + ErrorStr[msg] + "</div>";
            }
            else {
                this.putMessage("*****(Line: " + line + ") Error: " + ErrorStr[msg] + "*****");
                document.getElementById("Errors").innerHTML += "<div>(Line: " + line + ") ID: " + part + "  Error: " + ErrorStr[msg] + "</div>";
            }
            _ErrorCount++;
        };
        Messenger.prototype.putWarning = function (line, msg) {
            if (typeof msg !== "number") {
                this.putMessage("***(Line: " + line + ") Warning: " + msg + "***");
                document.getElementById("Warnings").innerHTML += "<div>(Line: " + line + ") Warning: " + msg + "</div>";
            }
            else {
                this.putMessage("***(Line: " + line + ") Warning: " + WarningStr[msg] + "***");
                document.getElementById("Warnings").innerHTML += "<div>(Line: " + line + ") Warning: " + WarningStr[msg] + "</div>";
            }
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
