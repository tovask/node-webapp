
var log = console.log;

document.addEventListener("DOMContentLoaded", function() {

// listen for all filter changes and apply them immediately
document.querySelectorAll('.filter-container > form input[type="checkbox"]').forEach(function(checkbox){
	checkbox.addEventListener('click',function(){
		this.form.submit();
	});
});

// extract/collapse tree filter's childs if the user click on the toggle
document.querySelectorAll('.filter-container > form > fieldset li > span').forEach(function(toggle){
	
	// collapse on init
	toggle.nextElementSibling.style.display='none';
	toggle.style.background = 'url("http://www.thecssninja.com/demo/css_tree/toggle-small-expand.png") no-repeat';
	
	// handle expand/collapse
	toggle.addEventListener('click',function(){
		if (toggle.nextElementSibling.style.display=='none') {
			toggle.nextElementSibling.style.display='block';
			toggle.style.background = 'url("http://www.thecssninja.com/demo/css_tree/toggle-small.png") no-repeat';
		} else {
			toggle.nextElementSibling.style.display='none';
			toggle.style.background = 'url("http://www.thecssninja.com/demo/css_tree/toggle-small-expand.png") no-repeat';
		}
	});
	
	// handle checked state change: check or uncheck all it's childs
	toggle.previousElementSibling.previousElementSibling.addEventListener('click',function(){
		var newState = toggle.previousElementSibling.previousElementSibling.checked;
		toggle.nextElementSibling.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox){
			checkbox.checked = newState;
		});
	});
	
});


});