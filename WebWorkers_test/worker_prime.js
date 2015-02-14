importScripts("prime.js");
onmessage = function(event){
	var parameter = event.data;
	var N = parameter.N;
	var workerNum = parameter.workerNum;
	var wn = parameter.wn;
	var str = " ";
	var primeNum = 0;

	var flag = true;
	for(var i = 3 + 2 * wn; i <= N; i += 2 * workerNum){
		if(prime(i)){
			primeNum++;
			str += i + " ";
		}
	}
	postMessage({primeNum:primeNum, str:str});
}

