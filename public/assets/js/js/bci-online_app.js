/*
==========================================================================
BCI - Online
==========================================================================
Copyright 2023 MV1
Website: https://mv1.ecash-guinee.com
Contact: contact@mv1.ecash-guinee.com

==========================================================================
File: Main Js File
==========================================================================
*/

(function ($) {
  "use strict";

  var language = localStorage.getItem("minia-language");
  var default_lang = "fr";

  function initMetisMenu() {
    if ($("#side-menu").length) {
      $("#side-menu").metisMenu();
    } else {
      console.warn("L'élément #side-menu est introuvable.");
    }
  }

  function initCounterNumber() {
    var counters = document.querySelectorAll(".counter-value");
    counters.forEach(function (counter) {
      if (counter) {
        var target = parseFloat(counter.getAttribute("data-target"));
        if (!isNaN(target)) {
          var count = parseFloat(counter.innerText) || 0;
          var speed = 250;
          var increment = target / speed;

          function updateCount() {
            if (count < target) {
              count += increment;
              counter.innerText = Math.min(count, target).toFixed(0);
              setTimeout(updateCount, 20);
            } else {
              counter.innerText = target;
            }
          }
          updateCount();
        } else {
          console.error(
            "L'attribut 'data-target' est manquant ou invalide pour cet élément."
          );
        }
      }
    });
  }

  function initCurrencyCounters() {
    var counters = document.querySelectorAll(".currencycounter");
    counters.forEach(function (counter) {
      if (counter) {
        var target = +counter.getAttribute("data-target");
        var count = +counter.innerText.replace(/ GNF$/, "").replace(/\s/g, "");
        var speed = 50;
        var increment = target / speed;

        function updateCount() {
          if (count < target) {
            count += increment;
            counter.innerText =
              Math.ceil(count)
                .toLocaleString("fr-GN", {
                  style: "currency",
                  currency: "GNF",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                .replace("FG", "") + " GNF";
            requestAnimationFrame(updateCount);
          } else {
            counter.innerText =
              target
                .toLocaleString("fr-GN", {
                  style: "currency",
                  currency: "GNF",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                .replace("FG", "") + " GNF";
          }
        }
        requestAnimationFrame(updateCount);
      } else {
        console.warn("L'élément '.currencycounter' est introuvable.");
      }
    });
  }

  function initLeftMenuCollapse() {
    $(window).on("load", function () {
      $(".switch").on("switch-change", function () {
        toggleWeather();
      });

      if (window.innerWidth >= 1024 && window.innerWidth <= 1366) {
        document.body.setAttribute("data-sidebar-size", "sm");
        updateRadio("sidebar-size-small");
      }
    });

    $("#vertical-menu-btn").on("click", function (event) {
      event.preventDefault();
      $("body").toggleClass("sidebar-enable");
      if ($(window).width() >= 992) {
        var currentSidebarSize =
          document.body.getAttribute("data-sidebar-size");

        if (currentSidebarSize == null || currentSidebarSize === "lg") {
          document.body.setAttribute("data-sidebar-size", "sm");
        } else {
          document.body.setAttribute("data-sidebar-size", "lg");
        }
      }
    });
  }

  // function initLeftMenuCollapse() {
  //     var currentSidebarSize = document.body.getAttribute('data-sidebar-size');
  //     $(window).on('load', function () {
  //         $('.switch').on('switch-change', function () {
  //             toggleWeather();
  //         });

  //         if (window.innerWidth >= 1024 && window.innerWidth <= 1366) {
  //             document.body.setAttribute('data-sidebar-size', 'sm');
  //             updateRadio('sidebar-size-small');
  //         }
  //     });

  //     $('#vertical-menu-btn').on('click', function (event) {
  //         event.preventDefault();
  //         $('body').toggleClass('sidebar-enable');
  //         if ($(window).width() >= 992) {
  //             if (currentSidebarSize == null || currentSidebarSize === "lg") {
  //                 document.body.setAttribute('data-sidebar-size', 'sm');
  //             } else {
  //                 document.body.setAttribute('data-sidebar-size', 'lg');
  //             }
  //         }
  //     });
  // }

  function initActiveMenu() {
    $("#sidebar-menu a").each(function () {
      var pageUrl = window.location.href.split(/[?#]/)[0];
      if (this.href == pageUrl) {
        $(this).addClass("active");
        $(this).parent().addClass("mm-active");
        $(this).parent().parent().addClass("mm-show");
        $(this).parent().parent().prev().addClass("mm-active");
        $(this).parent().parent().parent().addClass("mm-active");
        $(this).parent().parent().parent().parent().addClass("mm-show");
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("mm-active");
      }
    });
  }

  function initMenuItemScroll() {
    $(document).ready(function () {
      if (
        $("#sidebar-menu").length > 0 &&
        $("#sidebar-menu .mm-active .active").length > 0
      ) {
        var activeMenu = $("#sidebar-menu .mm-active .active").offset().top;
        if (activeMenu > 300) {
          activeMenu = activeMenu - 300;
          $(".vertical-menu .simplebar-content-wrapper").animate(
            {
              scrollTop: activeMenu,
            },
            "slow"
          );
        }
      }
    });
  }

  function initHoriMenuActive() {
    $(".navbar-nav a").each(function () {
      var pageUrl = window.location.href.split(/[?#]/)[0];
      if (this.href == pageUrl) {
        $(this).addClass("active");
        $(this).parent().addClass("active");
        $(this).parent().parent().addClass("active");
        $(this).parent().parent().parent().addClass("active");
        $(this).parent().parent().parent().parent().addClass("active");
        $(this).parent().parent().parent().parent().parent().addClass("active");
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("active");
      }
    });
  }

  function initFullScreen() {
    $('[data-toggle="fullscreen"]').on("click", function (e) {
      e.preventDefault();
      $("body").toggleClass("fullscreen-enable");
      if (
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    });
    document.addEventListener("fullscreenchange", exitHandler);
    document.addEventListener("webkitfullscreenchange", exitHandler);
    document.addEventListener("mozfullscreenchange", exitHandler);

    function exitHandler() {
      if (
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        $("body").removeClass("fullscreen-enable");
      }
    }
  }

  function initDropdownMenu() {
    if (document.getElementById("topnav-menu-content")) {
      var elements = document
        .getElementById("topnav-menu-content")
        .getElementsByTagName("a");
      for (var i = 0, len = elements.length; i < len; i++) {
        elements[i].onclick = function (elem) {
          if (elem && elem.target && elem.target.getAttribute("href") === "#") {
            elem.target.parentElement.classList.toggle("active");
            if (elem.target.nextElementSibling)
              elem.target.nextElementSibling.classList.toggle("show");
          }
        };
      }
      window.addEventListener("resize", updateMenu);
    }
  }

  function updateMenu() {
    var elements = document
      .getElementById("topnav-menu-content")
      .getElementsByTagName("a");
    for (var i = 0, len = elements.length; i < len; i++) {
      if (
        elements[i] &&
        elements[i].parentElement &&
        elements[i].parentElement.getAttribute("class") ===
          "nav-item dropdown active"
      ) {
        elements[i].parentElement.classList.remove("active");
        if (elements[i].nextElementSibling)
          elements[i].nextElementSibling.classList.remove("show");
      }
    }
  }

  function initComponents() {
    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    var popoverTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="popover"]')
    );
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });

    var toastElList = [].slice.call(document.querySelectorAll(".toast"));
    toastElList.map(function (toastEl) {
      return new bootstrap.Toast(toastEl);
    });
  }

  function initPreloader() {
    $(window).on("load", function () {
      $("#status").fadeOut();
      $("#preloader").delay(350).fadeOut("slow");
    });
  }

  function initSettings() {
    if (window.sessionStorage) {
      var alreadyVisited = sessionStorage.getItem("is_visited");
      if (!alreadyVisited) {
        sessionStorage.setItem("is_visited", "layout-ltr");
      } else {
        $("#" + alreadyVisited).prop("checked", true);
      }
    }
  }

  function initLanguage() {
    if (language && language != "null" && language !== default_lang)
      setLanguage(language);
    $(".language").on("click", function (e) {
      setLanguage($(this).attr("data-lang"));
    });
  }

  function initCheckAll() {
    $("#checkAll").on("change", function () {
      $(".table-check .form-check-input").prop(
        "checked",
        $(this).prop("checked")
      );
    });
    $(".table-check .form-check-input").change(function () {
      if (
        $(".table-check .form-check-input:checked").length ==
        $(".table-check .form-check-input").length
      ) {
        $("#checkAll").prop("checked", true);
      } else {
        $("#checkAll").prop("checked", false);
      }
    });
  }

  function updateRadio(radioId) {
    const radio = document.getElementById(radioId);
    if (radio) {
      radio.checked = true;
    } else {
      console.warn(`L'élément #${radioId} est introuvable.`);
    }
  }

  function layoutSetting() {
    var body = document.getElementsByTagName("body")[0];
    $(".right-bar-toggle").on("click", function (e) {
      $("body").toggleClass("right-bar-enabled");
    });

    $("#mode-setting-btn").on("click", function (e) {
      if (
        body.hasAttribute("data-bs-theme") &&
        body.getAttribute("data-bs-theme") == "dark"
      ) {
        document.body.setAttribute("data-bs-theme", "light");
        document.body.setAttribute("data-topbar", "brand");
        document.body.setAttribute("data-sidebar", "brand");
        updateRadio("topbar-color-light");
        updateRadio("sidebar-color-light");
      } else {
        document.body.setAttribute("data-bs-theme", "dark");
        document.body.setAttribute("data-topbar", "dark");
        document.body.setAttribute("data-sidebar", "dark");
        updateRadio("layout-mode-dark");
        updateRadio("sidebar-color-dark");
        updateRadio("topbar-color-dark");
      }
    });

    $(document).on("click", "body", function (e) {
      if ($(e.target).closest(".right-bar-toggle, .right-bar").length > 0) {
        return;
      }
      $("body").removeClass("right-bar-enabled");
    });

    if (
      body.hasAttribute("data-layout") &&
      body.getAttribute("data-layout") == "horizontal"
    ) {
      updateRadio("layout-horizontal");
      $(".sidebar-setting").hide();
    } else {
      updateRadio("layout-vertical");
    }
    body.hasAttribute("data-bs-theme") &&
    body.getAttribute("data-bs-theme") == "dark"
      ? updateRadio("layout-mode-dark")
      : updateRadio("layout-mode-light");
    body.hasAttribute("data-layout-size") &&
    body.getAttribute("data-layout-size") == "boxed"
      ? updateRadio("layout-width-boxed")
      : updateRadio("layout-width-fuild");
    body.hasAttribute("data-layout-scrollable") &&
    body.getAttribute("data-layout-scrollable") == "true"
      ? updateRadio("layout-position-scrollable")
      : updateRadio("layout-position-fixed");
    body.hasAttribute("data-topbar") &&
    body.getAttribute("data-topbar") == "dark"
      ? updateRadio("topbar-color-dark")
      : updateRadio("topbar-color-light");
    body.hasAttribute("data-sidebar-size") &&
    body.getAttribute("data-sidebar-size") == "sm"
      ? updateRadio("sidebar-size-small")
      : body.hasAttribute("data-sidebar-size") &&
        body.getAttribute("data-sidebar-size") == "md"
      ? updateRadio("sidebar-size-compact")
      : updateRadio("sidebar-size-default");
    body.hasAttribute("data-sidebar") &&
    body.getAttribute("data-sidebar") == "brand"
      ? updateRadio("sidebar-color-brand")
      : body.hasAttribute("data-sidebar") &&
        body.getAttribute("data-sidebar") == "dark"
      ? updateRadio("sidebar-color-dark")
      : updateRadio("sidebar-color-light");
    document.getElementsByTagName("html")[0].hasAttribute("dir") &&
    document.getElementsByTagName("html")[0].getAttribute("dir") == "rtl"
      ? updateRadio("layout-direction-rtl")
      : updateRadio("layout-direction-ltr");

    $("input[name='layout']").on("change", function () {
      window.location.href =
        $(this).val() == "vertical" ? "index.html" : "layouts-horizontal.html";
    });

    $("input[name='layout-mode']").on("change", function () {
      if ($(this).val() == "light") {
        document.body.setAttribute("data-bs-theme", "light");
        document.body.setAttribute("data-topbar", "dark");
        document.body.setAttribute("data-sidebar", "brand");
        updateRadio("topbar-color-light");
        updateRadio("sidebar-color-light");
      } else {
        document.body.setAttribute("data-bs-theme", "dark");
        document.body.setAttribute("data-topbar", "dark");
        document.body.setAttribute("data-sidebar", "dark");
        updateRadio("topbar-color-dark");
        updateRadio("sidebar-color-dark");
      }
    });
  }

  function init() {
    try {
      initMetisMenu();
      initCounterNumber();
      initCurrencyCounters();
      initLeftMenuCollapse();
      initActiveMenu();
      initMenuItemScroll();
      initHoriMenuActive();
      initFullScreen();
      initDropdownMenu();
      initComponents();
      initSettings();
      initLanguage();
      initPreloader();
      layoutSetting();
      Waves.init();
      initCheckAll();
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation de l'application :",
        error
      );
    }
  }

  $(document).ready(init);
})(jQuery);

feather.replace();
