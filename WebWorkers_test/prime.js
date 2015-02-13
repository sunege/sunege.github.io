function prime(n){
	var flag = true;
	for(var i=3; i<n; i+=2){
		if(n%i == 0){
			flag = false;
			break;
		}
	}
	return flag;
}
