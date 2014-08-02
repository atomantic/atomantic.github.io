/*global $,Reveal*/
Reveal.addEventListener( 'ready', function( /*event*/ ) {
	'use strict';
     // event.currentSlide, event.indexh, event.indexv


     // Lightbox effects for figures:
     // TODO: dynamically add id attributes and hrefs based on position in <section>
     // and number of figures per section
     $('.lightbox_image').click(function(){
     	//$('.slides').css({zoom:1});
     	var $t = $(this),
     		$img = $t.siblings().filter('.lightbox');
     	$img.css({zoom:$('.slides').css('zoom')}).data('origin',$t);
     	$('body').prepend($img);
     });
     $('.lightbox').click(function(){
     	var $t = $(this);
     	$t.data('origin').after($t);
     });
});