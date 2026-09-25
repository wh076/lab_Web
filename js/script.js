$(function () {
  "use strict";

  var savedTheme = localStorage.getItem("theme");

  if (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    savedTheme = "dark";
  }

  if (savedTheme) {
    $("html").attr("data-theme", savedTheme);
  }

  $(".js-theme-toggle").on("click", function () {
    var newTheme = $("html").attr("data-theme") === "dark" ? "light" : "dark";
    $("html").attr("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  var $navToggle = $(".js-nav-toggle");
  var $navList = $(".js-nav-list");

  $navToggle.on("click", function () {
    var isOpen = $navList.toggleClass("nav__list--open").hasClass("nav__list--open");
    $(this).attr("aria-expanded", isOpen);
  });

  $navList.on("click", ".js-nav-link", function () {
    if ($navToggle.is(":visible")) {
      $navList.removeClass("nav__list--open");
      $navToggle.attr("aria-expanded", "false");
    }
  });

  function openModal($modal) {
    $modal.attr("aria-hidden", "false").addClass("modal--open");
    $("body").addClass("page--locked");
  }

  function closeModal($modal) {
    $modal.attr("aria-hidden", "true").removeClass("modal--open");
    $("body").removeClass("page--locked");
  }

  $(".js-modal-open").on("click", function () {
    var target = $(this).data("modal-target");
    openModal($(target));
  });

  $(".js-modal").on("click", function (e) {
    if (e.target === this) {
      closeModal($(this));
    }
  });

  $(".js-modal-close").on("click", function () {
    closeModal($(this).closest(".js-modal"));
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $(".js-modal.modal--open").each(function () {
        closeModal($(this));
      });
    }
  });

  var $form = $("#feedbackForm");
  var $status = $("#fbStatus");
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(fieldId, message) {
    $("#" + fieldId).closest(".js-form-field").addClass("form-field--invalid");
    $('[data-error-for="' + fieldId + '"]').text(message);
  }

  function clearError(fieldId) {
    $("#" + fieldId).closest(".js-form-field").removeClass("form-field--invalid");
    $('[data-error-for="' + fieldId + '"]').text("");
  }

  function validateForm() {
    var isValid = true;
    var name = $.trim($("#fbName").val());
    var email = $.trim($("#fbEmail").val());
    var message = $.trim($("#fbMessage").val());

    if (!name) {
      showError("fbName", "Введите имя");
      isValid = false;
    } else {
      clearError("fbName");
    }

    if (!email) {
      showError("fbEmail", "Введите email");
      isValid = false;
    } else if (!emailPattern.test(email)) {
      showError("fbEmail", "Некорректный email");
      isValid = false;
    } else {
      clearError("fbEmail");
    }

    if (!message) {
      showError("fbMessage", "Введите сообщение");
      isValid = false;
    } else {
      clearError("fbMessage");
    }

    return isValid;
  }

  $form.on("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      $status.text("Проверьте правильность заполнения полей.").removeClass("form__status--success").addClass("form__status--error");
      return;
    }

    var $submitBtn = $("#fbSubmit");
    $submitBtn.prop("disabled", true).text("Отправка...");
    $status.text("").removeClass("form__status--success form__status--error");

    $.ajax({
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "POST",
      dataType: "json",
      data: {
        name: $("#fbName").val(),
        email: $("#fbEmail").val(),
        message: $("#fbMessage").val()
      }
    })
      .done(function () {
        $status.text("Сообщение отправлено! Спасибо, я скоро отвечу.").removeClass("form__status--error").addClass("form__status--success");
        $form[0].reset();
      })
      .fail(function () {
        $status.text("Не удалось отправить сообщение. Попробуйте позже.").removeClass("form__status--success").addClass("form__status--error");
      })
      .always(function () {
        $submitBtn.prop("disabled", false).text("Отправить");
      });
  });

  var $carousel = $(".js-carousel");
  var $track = $(".js-carousel-track");
  var $dots = $(".js-carousel-dots");
  var currentSlide = 0;
  var autoplayTimer = null;

  function renderSlide(item) {
    return $(
      '<li class="carousel__slide js-carousel-slide">' +
        '<article class="portfolio-card">' +
        '<img class="portfolio-card__image" src="' + item.image + '" alt="Превью проекта ' + item.title + '" loading="lazy">' +
        '<div class="portfolio-card__body">' +
        '<p class="portfolio-card__text">' + item.description + "</p>" +
        '<a href="' + item.repo + '" target="_blank" rel="noopener noreferrer" class="portfolio-card__link">Репозиторий на GitHub →</a>' +
        "</div>" +
        "</article>" +
        "</li>"
    );
  }

  function goToSlide(index) {
    var $slides = $track.find(".js-carousel-slide");
    var total = $slides.length;
    if (total === 0) {
      return;
    }
    currentSlide = (index + total) % total;
    $track.css("transform", "translateX(-" + currentSlide * 100 + "%)");
    $dots.find(".js-carousel-dot").removeClass("carousel__dot--active").eq(currentSlide).addClass("carousel__dot--active");
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    var interval = parseInt($carousel.data("autoplay"), 10) || 5000;
    stopAutoplay();
    autoplayTimer = setInterval(function () {
      goToSlide(currentSlide + 1);
    }, interval);
  }

  $.getJSON("data/portfolio.json")
    .done(function (items) {
      $track.empty();
      items.forEach(function (item) {
        $track.append(renderSlide(item).hide());
      });
      $track.find(".js-carousel-slide").each(function (i) {
        $(this).fadeIn(400);
        var $dot = $('<button type="button" class="carousel__dot js-carousel-dot" aria-label="Слайд ' + (i + 1) + '"></button>');
        $dot.on("click", function () {
          goToSlide(i);
          startAutoplay();
        });
        $dots.append($dot);
      });
      goToSlide(0);
      startAutoplay();
    })
    .fail(function () {
      $track.empty().append('<li class="carousel__slide carousel__message">Не удалось загрузить портфолио.</li>');
    });

  $(".js-carousel-prev").on("click", function () {
    goToSlide(currentSlide - 1);
    startAutoplay();
  });

  $(".js-carousel-next").on("click", function () {
    goToSlide(currentSlide + 1);
    startAutoplay();
  });

  $carousel.on("mouseenter", stopAutoplay).on("mouseleave", startAutoplay);

  var $sections = $("section[id]");
  var $navLinks = $(".js-nav-link");

  function updateActiveNav() {
    var scrollPos = $(window).scrollTop() + 120;
    var currentId = null;
    $sections.each(function () {
      if ($(this).offset().top <= scrollPos) {
        currentId = $(this).attr("id");
      }
    });
    $navLinks.removeClass("nav__link--active");
    if (currentId) {
      $navLinks.filter('[href="#' + currentId + '"]').addClass("nav__link--active");
    }
  }

  $(window).on("scroll", updateActiveNav);
  updateActiveNav();

  var $backToTop = $(".js-back-to-top");

  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 400) {
      $backToTop.addClass("back-to-top--visible");
    } else {
      $backToTop.removeClass("back-to-top--visible");
    }
  });

  $backToTop.on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500);
  });
});
