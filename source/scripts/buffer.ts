/*
Class to handle buffer stuff
*/

module TSC
{
	export class Buffer {
		constructor(public str:string='') {
            this.str = str;
        }
		public push(ch) {
			//adds character to buffer
		    this.str+=ch;
		}
		
		public clear(){
			//clears the buffer
			this.str='';
		}              
		public get(){
			//returns the buffer
			return this.str;
		} 
		public isEmpty(){
			return this.str ==="";
		}
		public flush(){
			//returns and clears the buffer
			var text =this.str;
			this.str= '';
			return text;
		}

	}
}


