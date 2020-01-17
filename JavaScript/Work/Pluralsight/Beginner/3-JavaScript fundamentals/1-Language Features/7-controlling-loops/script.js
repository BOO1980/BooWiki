let i = 0; //in this loop we actually initialise i before we get to the for loop
for(;i<12;i++){
	if(i === 8){
		break; //break will exit the loop
	}
}

console.log(i);


for (let i=0; i<4;i++){
	if(i === 2){
		continue; //continue the loop, which will be i++ (the console log will be missed out)
	}
	console.log(i); //0 1 3
}
