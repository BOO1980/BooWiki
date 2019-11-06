let paragraph = document.getElementById('text-area');
paragraph.innerText = "this is paragraph text";

let okButton = document.getElementById('ok-button');

paragraph.style.display = 'none'

okButton.addEventListener('click', function(){
	paragraph.style.display = 'block';
});

