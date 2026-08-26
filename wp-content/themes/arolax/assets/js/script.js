/***************************************************
==================== JS INDEX ======================
****************************************************
01. Mobile menu Start
02. Preloader
03. Magnific Image Popup
04. Magnific Video Popup
05. Sticky Menu

****************************************************/

(function ($) {
  "use strict";

  // Using an object literal for a jQuery arolax Theme module
  var arolax_theme_module = {
    init: function (settings) {
      arolax_theme_module.config = {
        responsive_menu_width: 1199,
        header_menu: $('.lawyer-header__inner'),
        header: $(".default-blog-header"),
        video_pop: $(".video-popup"),
        image_pop: $(".image-popup"),
      };
      // Allow overriding the default config
      $.extend(arolax_theme_module.config, settings);
      arolax_theme_module.setup();
    },
    setup: function () {

      arolax_theme_module.header_menu();
      arolax_theme_module.sticky_header();
      arolax_theme_module.video_poup_global();
      arolax_theme_module.image_popup_global();
      arolax_theme_module.preloader();

      arolax_theme_module.scroll_preogress();
      arolax_theme_module.woo();
    },

    scroll_preogress: function () {
      var progressPath = document.querySelector('.progress-wrap path');

      if (progressPath) {
        var pathLength = progressPath.getTotalLength();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
        progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        progressPath.getBoundingClientRect();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
        var updateProgress = function () {
          var scroll = $(window).scrollTop();
          var height = $(document).height() - $(window).height();
          var progress = pathLength - (scroll * pathLength / height);
          progressPath.style.strokeDashoffset = progress;
        }
        updateProgress();
        $(window).scroll(updateProgress);
        var offset = 50;
        var duration = 550;
        jQuery(window).on('scroll', function () {
          if (jQuery(this).scrollTop() > offset) {
            jQuery('.progress-wrap').addClass('active-progress');
          } else {
            jQuery('.progress-wrap').removeClass('active-progress');
          }
        });
        jQuery('.progress-wrap').on('click', function (event) {
          event.preventDefault();
          jQuery('html, body').animate({ scrollTop: 0 }, duration);
          return false;
        })
      }
    },
    header_menu: function () {

      // 01. Mobile menu Start
      let header_wrapper = arolax_theme_module.config.header_menu;
      if ('offcanvas_responsive_menu_width' in arolax_obj) {
        arolax_theme_module.config.responsive_menu_width = arolax_obj.offcanvas_responsive_menu_width;
      }

      var $menu_obj = {
        meanScreenWidth: arolax_theme_module.config.responsive_menu_width,
        meanMenuContainer: '.offcanvas__menu-wrapper',
        meanMenuCloseSize: '36px',
      };

      if ('offcanvas_menu_icon_plus' in arolax_obj) {
        $menu_obj.meanExpand = arolax_obj.offcanvas_menu_icon_plus;
      }

      if ('offcanvas_menu_icon_minus' in arolax_obj) {
        $menu_obj.meanContract = arolax_obj.offcanvas_menu_icon_minus;
      }
      // meanmenu activition
      $('.main-menu-js').meanmenu($menu_obj);

      if ($('.lawyer-header__inner .main-menu-js').css('display') === 'none') {
        header_wrapper.find('.info-default-offcanvas').show();
        header_wrapper.addClass('wcf-mobile-nav-active');
      } else {
        header_wrapper.find('.info-default-offcanvas').hide();
      }

      window.addEventListener("resize", function () {

        if (header_wrapper.find('.main-menu-js').css('display') == 'block') {
          header_wrapper.removeClass('wcf-mobile-nav-active');
        } else {
          header_wrapper.addClass('wcf-mobile-nav-active');
        }

        if (header_wrapper.find('.main-menu-js').css('display') == 'block') {
          header_wrapper.find('.info-default-offcanvas').hide();
        } else {
          header_wrapper.find('.info-default-offcanvas').show();
        }

      });
    },

    // 02. Preloader
    preloader: function () {
      var $prealoder_container = $('.wcf_prealoder');
      $(document).ready(function () {
        setTimeout(() => {
          $('body').removeClass('arolax-preloader-active');
          $prealoder_container.remove();
        }, 500)
      });
    },


    // 03. Magnific Image Popup
    image_popup_global: function () {
      arolax_theme_module.config.image_pop.magnificPopup({
        type: "image",
        gallery: {
          enabled: true,
        },
      });
    },


    // 04. Magnific Video Popup
    video_poup_global: function () {
      arolax_theme_module.config.video_pop.magnificPopup({
        type: 'iframe',
      });
    },

    // 05. Header Sticky
    sticky_header: function () {
      if ('sticky_enable' in arolax_obj) {
        const toggleClass = "wcf-is-sticky";
        const sticky_top = arolax_obj.sticky_header_top || 150;
        $(window).scroll(function () {
          if ($(this).scrollTop() > sticky_top) {
            arolax_theme_module.config.header.addClass(toggleClass);
          }
          else {
            arolax_theme_module.config.header.removeClass(toggleClass);
          }
        });
      }
    },
    
    woo: function(){
      let qty =  0;
      let input = null;
      $(document).on('click', '.quantity .plus', function(){
         input = $(this).parents('.quantity').find('input');
         qty = parseInt( input.val() ); 
         input.val(++qty);
         jQuery( "[name='update_cart']" ).prop('disabled', false);
        if(arolax_obj.cart_update_qty_change){
          jQuery( "[name='update_cart']" ).trigger( "click" );
        }
       
      });
      $(document).on('click', '.quantity .minus', function(){
        input = $(this).parents('.quantity').find('input');
        qty = parseInt( input.val() ); 
        qty = --qty;
        if(qty === 0){
          qty = 1;
        }
        input.val(qty);
        jQuery( "[name='update_cart']" ).prop('disabled', false);
        if(arolax_obj.cart_update_qty_change){
          jQuery( "[name='update_cart']" ).trigger( "click" );
        }

       
      });
    }

  };
  $(document).ready(arolax_theme_module.init);

})(jQuery);



