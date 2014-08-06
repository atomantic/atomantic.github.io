/*global $,Reveal,hljs,document,window*/
(function(){
    'use strict';
        /**
         * @param direction {number} 1 or -1
         */
    var fnNav = function(direction){
            // override normal flow of jumping to the first row of the next/prev column
            // try instead to jump to the same row of the next/prev column (will fall back to latest row)
            var ind = Reveal.getIndices(), // { h: 0, v: 0 } }
                hash = window.location.hash.replace('#/','').split('/'),
                $lb;
            // if we are on a lightbox subsection, see if we can go to the next/prev lightbox
            if(hash.length > 2){
                // if we find a next/prev item, click it
                $lb = $('.lightbox_image[rel='+hash[0]+hash[1]+(Number(hash[2])+direction)+']');
            }
            if($lb && $lb.length){
                window.location.href = $lb.attr('href');
            }else{
                window.location.hash = '#/'+(ind.h+direction)+'/'+ind.v;
            }
        },
        fnNext = function(){
            fnNav(1);
        },
        fnPrev = function(){
            fnNav(-1);
        };

    Reveal.addEventListener( 'ready', function( /*event*/ ) {
         // event.currentSlide, event.indexh, event.indexv

         // grab all lightbox images and throw them in the body (outside of reveal)
         // so they show full-screen zoomed
         $('body').prepend($('.lightbox'));//.css({zoom:$('.slides').css('zoom')}));
         // Lightbox effects for figures:
         
         $('.lightbox').click(function(){
            // can't put the href on the element or reveal will not allow it to navigate thereafter
            window.location.href = '#_';
         });
         // make sure swipes pass through the lightbox detection nav
         Reveal.navigateRight = fnNext;
         Reveal.navigateLeft = fnPrev;
         Reveal.navigateUp = fnPrev;
         Reveal.navigateDown = fnNext;
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
          // enter
          13: fnNext,
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