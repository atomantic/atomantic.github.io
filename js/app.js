/*global $,Reveal,hljs,document,window*/
(function(){
    'use strict';
var fnNext = function(){
        // override normal flow of jumping to the first row of the next column
        // try instead to jump to the same row of the next column (will fall back to latest row)
        var ind = Reveal.getIndices(), // { h: 0, v: 0 } }
            //hash = window.location.hash.replace('#/').split('/'),
            newHash = '#/'+(ind.h+1)+'/'+ind.v;
        /*
        // if we are on a lightbox subsection, see if we can go to the next lightbox
        if(hash.length > 2){
            var h3 = hash[2]+1,
                lb = $('[rel='+hash[0]+hash[1]+h3+']');
            if(lb.length){
                newHash+='/'+h3;
            }
        }
        */
        window.location.hash = newHash;
    },
    fnPrev = function(){
        var ind = Reveal.getIndices(); // { h: 0, v: 0 } }
            //hash = window.location.hash.replace('#/').split('/'); 
        window.location.hash = '#/'+(ind.h-1)+'/'+ind.v;
    };

Reveal.addEventListener( 'ready', function( /*event*/ ) {
     // event.currentSlide, event.indexh, event.indexv

     // grab all lightbox images and throw them in the body (outside of reveal)
     // so they show full-screen zoomed
     $('body').prepend($('.lightbox'));//.css({zoom:$('.slides').css('zoom')}));
     // Lightbox effects for figures:
     /*
     $('.lightbox_image').click(function(){
        var $t = $(this),
            $img = $t.siblings().filter('[rel='+$t.attr('rel')+']');
        $img.css({zoom:$('.slides').css('zoom')}).data('origin',$t);
        $('body').prepend($img);
     });*/
     /*
     $('.lightbox').click(function(){
        var $t = $(this);
        $t.data('origin').after($t);
     });*/
});


// Configure Reveal
// Full list of configuration options available here:
// https://github.com/hakimel/reveal.js#configuration

Reveal.initialize({
     progress: false,
     history: true,
     mouseWheel: true,
     previewLinks: true,
     keyboard: {
          13: fnNext, // go to the next slide when the ENTER key is pressed
          // right
          39: fnNext,
          // left
          37: fnPrev
     },
     theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
     transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

     // Optional libraries used to extend on reveal.js
     dependencies: [
          { src: 'bower_components/reveal.js/lib/js/classList.js', condition: function() { return !document.body.classList; } },
          { src: 'bower_components/reveal.js/plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
          { src: 'bower_components/reveal.js/plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
          { src: 'bower_components/reveal.js/plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
          { src: 'bower_components/reveal.js/plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
          { src: 'bower_components/reveal.js/plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } },
          // { src: 'bower_components/reveal.js/plugin/search/search.js', async: true, condition: function() { return !!document.body.classList; } }
          //{ src: 'bower_components/reveal.js/plugin/remotes/remotes.js', async: true, condition: function() { return !!document.body.classList; } }

          { src: 'js/loadhtmlslides.js', condition: function() { return !!document.querySelector( '[data-html]' ); } }
     ]
});

})();