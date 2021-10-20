$(document).ready(function () {
    
    // When the user scrolls the page, execute myFunction 
    window.onscroll = function() {myFunction()};

    $(document).find(".slida").hide();

    if($(window).width() <= 1536) {
        $('.hide3').hide();
    }
    else {
        $('.hide4').hide();
    }
});

$( window ).resize(function() {
    // $( "#log" ).append( "<div>Handler for .resize() called.</div>" );
    if($(window).width() <= 1536) {
        $('.hide3').hide();
    }
    else {
        $('.hide3').show();
        $('.hide4').hide();
    }
});

function myFunction() {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;
    document.getElementById("myBar").style.width = scrolled + "%";
}

$(".card").mouseup(function(){
    if($(this).find('.cardUpper').find('span').css('opacity') == 0) {
        $(this).find('.cardUpper').find('span').animate({opacity: '1'}, 400);
        $(this).find('.cardUpper').find('a').css('visibility', 'visible');
        $(this).find('.arrow').animate({opacity: '0'}, 400);
    }
    else {
        console.log('second')
        $(this).find('.cardUpper').find('span').animate({opacity: '0'}, 400);
        $(this).find('.cardUpper').find('a').css('visibility', 'hidden');
        $(this).find('.arrow').animate({opacity: '1'}, 400);
    }
});


hid3 = false;
hid4 = false;



$('.button').mouseup(function() {

    if($(window).width() <= 1536) {

        if(hid3) {
            $('.hide3').animate({opacity: '0'}, 800,
                function() {    
                    $('.hide3').animate({height: '0'}, 800,
                        function() {   
                            $('.hide3').hide();
                            $('.button').html('Show More');
                            hid3 = false;
                            $('.hide3').clearQueue();
                            $('.button').clearQueue();
                        }
                    );
                }
            );
        }
        else {
            $('.hide3').css('opacity', '0');
            $('.hide3').show();
            $('.hide3').animate({height: '100%'}, 200);
            $('.hide3').animate({opacity: '1'}, 800,
                function() {
                    $('.hide3').clearQueue();
                    $('.button').clearQueue();
                }    
            );
            $('.button').html('Show Less');
            hid3 = true;
        }
    }
    else {
        console.log("else");
        if(hid4) {
            $('.hide4').animate({opacity: '0'}, 800,
                function() {    
                    $('.hide4').animate({height: '0'}, 800,
                        function() {   
                            $('.hide4').hide();
                            $('.button').html('Show More');
                            hid4 = false;
                            $('.hide4').clearQueue();
                            $('.button').clearQueue();
                        }
                    );
                }
            );
        }
        else {
            $('.hide4').css('opacity', '0');
            $('.hide4').show();
            $('.hide4').animate({height: '100%'}, 200);
            $('.hide4').animate({opacity: '1'}, 800,
                function() {
                    $('.hide4').clearQueue();
                    $('.button').clearQueue();
                }    
            );
            $('.button').html('Show Less');
            hid4 = true;
        }
    }
});

