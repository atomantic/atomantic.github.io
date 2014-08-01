Reveal.addEventListener( 'ready', function( event ) {
     // event.currentSlide, event.indexh, event.indexv
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