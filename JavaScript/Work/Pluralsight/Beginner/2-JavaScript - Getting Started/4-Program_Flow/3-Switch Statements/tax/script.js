let state = 'TX';
let taxPercent = 0;

switch(state){
	case 'NY':
		console.log('New York');
		break; //code exectution will drop to the next statement if this break is not provided
	case 'TX':
		console.log('Texas');
		console.log('Austin');
		break;
	default:
	 	console.log('Unknown');
	 	break	
}

console.log(taxPercent);
