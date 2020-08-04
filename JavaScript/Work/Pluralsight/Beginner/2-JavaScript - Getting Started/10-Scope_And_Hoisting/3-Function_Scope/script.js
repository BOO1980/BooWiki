var message = 'no';

function foo(message) {
	message = 'yes';
}

foo(message);
console.log(message)