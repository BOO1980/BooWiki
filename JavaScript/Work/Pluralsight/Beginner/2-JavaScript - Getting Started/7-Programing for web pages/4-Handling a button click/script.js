let paragraph = document.getElementById('text-area');
paragraph.innerText = "this is paragraph text";

let okButton = document.getElementById('ok-button');

okButton.addEventListener('click', function(){
	paragraph.innerText = "Button clicked!" ;
});