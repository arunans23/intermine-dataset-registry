/**
 *
 * Header Text Animation .js
 *
 */


 /**
  * Call Animation init when page is loaded
  */
jQuery_2_1_3(window).load(function(){
	animText();
});

/**
 * Animation Init
 * @element Container of text to animate. Has to be empty.
 * @text Text to Animate
 * @delay Delay time before animation starts
 *
 */
jQuery_2_1_3.fn.type = function(text, delay) {
	var element = jQuery_2_1_3(this);
	setInterval('cursorAnimation()', 100);
	setTimeout(function() { anim(element, text); }, delay);
}

// Text Animation
function animText(){
	$('.header-text').animate({opacity: 1}, 'slow', 'linear');
}
