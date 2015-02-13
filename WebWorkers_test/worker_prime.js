importScripts("prime.js");
onmessage = function(event){
	var N = event.data;
	var primeNum = 1;
	for(var i=3; i<=N ;i+=2){
		if(prime(i))
			primeNum++;
	}
	var results = primeNum;
	postMessage(results);
}
