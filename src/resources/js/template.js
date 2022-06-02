$(document).ready(function () {

    $(".tpl-faq-item__title").click(function () {
        if ($(this).hasClass("active")) {
            $(this)
                .removeClass("active")
                .siblings(".tpl-faq-item__text").slideUp()
        } else {
            $(this)
                .addClass("active")
                .siblings(".tpl-faq-item__text").slideDown()
                .closest(".tpl-faq__item").addClass("active")
                .siblings(".tpl-faq__item.active").removeClass("active")
                .find(".tpl-faq-item__text").slideUp()
                .closest(".tpl-faq-item").find(".tpl-faq-item__title").removeClass("active")
        }
    });

    const reviews = new Swiper('.tpl-reviews-slider', {
        slidesPerView: 2,
        spaceBetween: 24,
        loop: true,
        navigation: {
            nextEl: '.tpl-reviews__arrow_next',
            prevEl: '.tpl-reviews__arrow_prev',
        },
        breakpoints: {
            300: {
                slidesPerView: 1,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
        },
    });

});