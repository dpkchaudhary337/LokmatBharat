$(function ($) {
    "use strict";

    jQuery(document).ready(function () {

        // Serch option toggle

        $('.mobile-search').on('click', function () {
            alert('Called');
            $('.mobile-form-area').css({
                'display': 'block !important'
            });
        });

        // Mobile Menu js
        
        $('.navsm .toogle-icon').on('click', function () {
            $('.mobile-menu').css({
                'left': '0%',
                'opacity': '1'
            });
        });

        $('.mobile-menu .logo-area .close-menu').on('click', function () {
            $('.mobile-menu').css({
                'left': '-100%',
                'opacity': '0'
            });
        });


        // dropdown mega menu - only show the clicked dropdown, close others
        $('.mega-menu .nav-link.dropdown-toggle').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close all other dropdown menus first
            $('.mega-menu .dropdown-menu').css({
                'display': 'none'
            });
            
            // Toggle only the clicked dropdown menu
            const $dropdownMenu = $(this).closest('.mega-menu').find('.dropdown-menu');
            const isVisible = $dropdownMenu.css('display') === 'block';
            
            $dropdownMenu.css({
                'display': isVisible ? 'none' : 'block'
            });
        });


        $('.go-dropdown .main-link').on('click', function (e) {
            e.preventDefault();
            $(this).next('.go-dropdown-menu').toggle('slow');
            $(this).toggleClass('active');

            if ($('.go-dropdown .toggle-icon i').hasClass('fas fa-plus')) {

                $('.go-dropdown .toggle-icon i').removeClass('fas fa-plus')
                $('.go-dropdown .toggle-icon i').addClass('fas fa-minus');
            }
            else {
                if ($('.go-dropdown .toggle-icon i').hasClass('fas fa-minus')) {

                    $('.go-dropdown .toggle-icon i').removeClass('fas fa-minus')
                    $('.go-dropdown .toggle-icon i').addClass('fas fa-plus');
                }
            }
        });

        


    });

    /*-------------------------------
        back to top
    ------------------------------*/
    $(document).on('click', '.bottomtotop', function () {
        $("html,body").animate({
            scrollTop: 0
        }, 2000);
    });

    //define variable for store last scrolltop
    var lastScrollTop = '';
    $(window).on('scroll', function () {
        var $window = $(window);
        if ($window.scrollTop() > 110) {
            $(".mainmenu-area").addClass('nav-fixed');
        } else {
            $(".mainmenu-area").removeClass('nav-fixed');
        }

        /*---------------------------
            back to top show / hide
        ---------------------------*/
        var st = $(this).scrollTop();
        var ScrollTop = $('.bottomtotop');
        if ($(window).scrollTop() > 1000) {
            ScrollTop.fadeIn(1000);
        } else {
            ScrollTop.fadeOut(1000);
        }
        lastScrollTop = st;

    });

    $(window).on('load', function () {

        /*---------------------
            Preloader
        -----------------------*/
        var preLoder = $("#preloader");
        preLoder.addClass('hide');
        var backtoTop = $('.back-to-top')
        /*-----------------------------
            back to top
        -----------------------------*/
        var backtoTop = $('.bottomtotop')
        backtoTop.fadeOut(100);
    });

});