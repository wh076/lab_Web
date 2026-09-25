$(function () {
  "use strict";

  /* ---------- Dropdown navigation ---------- */
  var $navToggle = $("#navToggle");
  var $navList = $("#mainNavList");

  $navToggle.on("click", function () {
    var isOpen = $navList.toggleClass("nav-open").hasClass("nav-open");
    $(this).attr("aria-expanded", isOpen);
  });

  $navList.on("click", "a", function () {
    if ($navToggle.is(":visible")) {
      $navList.removeClass("nav-open");
      $navToggle.attr("aria-expanded", "false");
    }
  });

  /* ---------- Modal ---------- */
  function openModal($modal) {
    $modal.attr("aria-hidden", "false").addClass("open");
    $("body").addClass("modal-lock");
  }

  function closeModal($modal) {
    $modal.attr("aria-hidden", "true").removeClass("open");
    $("body").removeClass("modal-lock");
  }

  $(".js-open-modal").on("click", function () {
    var target = $(this).data("modal-target");
    openModal($(target));
  });

  $(".modal-overlay").on("click", function (e) {
    if (e.target === this) {
      closeModal($(this));
    }
  });

  $(".modal-close").on("click", function () {
    closeModal($(this).closest(".modal-overlay"));
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $(".modal-overlay.open").each(function () {
        closeModal($(this));
      });
    }
  });

  /* ---------- Feedback form: validation + simulated ajax ---------- */
  var $form = $("#feedbackForm");
  var $status = $("#fbStatus");
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(fieldId, message) {
    $("#" + fieldId).closest(".form-field").addClass("invalid");
    $('[data-error-for="' + fieldId + '"]').text(message);
  }

  function clearError(fieldId) {
    $("#" + fieldId).closest(".form-field").removeClass("invalid");
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
      $status.text("Проверьте правильность заполнения полей.").removeClass("success").addClass("error");
      return;
    }

    var $submitBtn = $("#fbSubmit");
    $submitBtn.prop("disabled", true).text("Отправка...");
    $status.text("").removeClass("success error");

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
        $status.text("Сообщение отправлено! Спасибо, я скоро отвечу.").removeClass("error").addClass("success");
        $form[0].reset();
      })
      .fail(function () {
        $status.text("Не удалось отправить сообщение. Попробуйте позже.").removeClass("success").addClass("error");
      })
      .always(function () {
        $submitBtn.prop("disabled", false).text("Отправить");
      });
  });

  /* ---------- Portfolio carousel rendered from JSON ---------- */
  var $carousel = $("#portfolioCarousel");
  var $track = $("#portfolioTrack");
  var $dots = $("#portfolioDots");
  var currentSlide = 0;
  var autoplayTimer = null;

  function renderSlide(item) {
    return $(
      '<li class="carousel-slide">' +
        '<article class="portfolio-card">' +
        '<img src="' + item.image + '" alt="Превью проекта ' + item.title + '" loading="lazy">' +
        '<div class="portfolio-card-body">' +
        "<p>" + item.description + "</p>" +
        '<a href="' + item.repo + '" target="_blank" rel="noopener noreferrer" class="portfolio-link">Репозиторий на GitHub →</a>' +
        "</div>" +
        "</article>" +
        "</li>"
    );
  }

  function goToSlide(index) {
    var $slides = $track.find(".carousel-slide");
    var total = $slides.length;
    if (total === 0) {
      return;
    }
    currentSlide = (index + total) % total;
    $track.css("transform", "translateX(-" + currentSlide * 100 + "%)");
    $dots.find(".carousel-dot").removeClass("active").eq(currentSlide).addClass("active");
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
      $track.find(".carousel-slide").each(function (i) {
        $(this).fadeIn(400);
        var $dot = $('<button type="button" class="carousel-dot" aria-label="Слайд ' + (i + 1) + '"></button>');
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
      $track.empty().append('<li class="carousel-slide"><p>Не удалось загрузить портфолио.</p></li>');
    });

  $(".carousel-prev").on("click", function () {
    goToSlide(currentSlide - 1);
    startAutoplay();
  });

  $(".carousel-next").on("click", function () {
    goToSlide(currentSlide + 1);
    startAutoplay();
  });

  $carousel.on("mouseenter", stopAutoplay).on("mouseleave", startAutoplay);

  /* ---------- Active nav link on scroll ---------- */
  var $sections = $("section[id]");
  var $navLinks = $("#mainNavList a");

  function updateActiveNav() {
    var scrollPos = $(window).scrollTop() + 120;
    var currentId = null;
    $sections.each(function () {
      if ($(this).offset().top <= scrollPos) {
        currentId = $(this).attr("id");
      }
    });
    $navLinks.removeClass("active");
    if (currentId) {
      $navLinks.filter('[href="#' + currentId + '"]').addClass("active");
    }
  }

  $(window).on("scroll", updateActiveNav);
  updateActiveNav();

  /* ---------- Back to top ---------- */
  var $backToTop = $("#backToTop");

  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 400) {
      $backToTop.addClass("visible");
    } else {
      $backToTop.removeClass("visible");
    }
  });

  $backToTop.on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500);
  });
});
