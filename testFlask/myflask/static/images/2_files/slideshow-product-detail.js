var slider1 = "",
slider2 = "";
$(document).ready(function() {
    function a() {
        wrapperCSarrow = function() {
            var d = $("#productSheetSlideshow");
            var c = d.find(".wrapper").first();
            var b = $(".bulletPoint");
            if (d.find(".ppArrowLeft").length === 0) {
                d.prepend('<button class="ppArrowLeft arrowLeft navigationBtn left" aria-label="' + CONFIGURATION.ALT_PREV + '"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="33" focusable="false" aria-hidden="true" role="img" viewBox="0 0 18 33" preserveAspectRatio="xMidYMid meet"><path stroke-width="1.3" stroke="#767676" fill="none" d="M 18 0 L 0 16.5 L 18 33"/></svg></button>')
            }
            if (d.find(".ppArrowRight").length === 0) {
                d.prepend('<button class="ppArrowRight arrowRight navigationBtn right" aria-label="' + CONFIGURATION.ALT_NEXT + '"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="33" focusable="false" aria-hidden="true" role="img" viewBox="0 0 18 33" preserveAspectRatio="xMidYMid meet"><path stroke-width="1.3" stroke="#767676" fill="none" d="M 0 0 L 18 16.5 L 0 33"/></svg></button>')
            }
            d.find(".ppArrowRight , .ppArrowLeft").on("click",
            function() {
                var l, j;
                if ($(this).hasClass("ppArrowLeft")) {
                    var f = $(".arrowBulletLeft");
                    var l = true
                } else {
                    var f = $(".arrowBulletRight");
                    var j = true
                }
                var k = $(".bulletPointDark").index(b);
                var e = b.length;
                if (b.eq(0).hasClass("bulletPointDark") && l) {
                    fireEvent("NavigateSlideshow", {
                        type: "ArrowClick",
                        selector: "#productSheetSlideshow",
                        arrowType: "Previous"
                    });
                    leftbtn();
                    slider1.goToNextSlide()
                } else {
                    if (b.eq(e - 1).hasClass("bulletPointDark") && j) {
                        fireEvent("NavigateSlideshow", {
                            type: "ArrowClick",
                            selector: "#productSheetSlideshow",
                            arrowType: "next"
                        });
                        rightbtn();
                        slider1.goToPrevSlide()
                    }
                }
                f.trigger("click");
                var g = $(".bulletPointDark").index(".bulletPoint");
                if ($(".rtw-slideshow").length > 0) {
                    if (slideCount() > 3) {
                        if ($(this).hasClass("ppArrowLeft")) {
                            if (g == slideCount() - 1) {
                                for (var h = 0; h < slideCount() - 3; h++) {
                                    slider1.goToNextSlide()
                                }
                            } else {
                                if (g == 0) {
                                    for (var h = 0; h < slideCount() - 3; h++) {
                                        slider1.goToNextSlide()
                                    }
                                } else {
                                    if (g <= slideCount() - 2) {
                                        slider1.goToPrevSlide()
                                    }
                                }
                            }
                        }
                        if ($(this).hasClass("ppArrowRight")) {
                            if (g == slideCount() - 1) {
                                for (var h = 0; h < slideCount() - 3; h++) {
                                    slider1.goToPrevSlide()
                                }
                            } else {
                                if (g == 0) {
                                    for (var h = 0; h < slideCount() - 3; h++) {
                                        slider1.goToPrevSlide()
                                    }
                                } else {
                                    if (g == 1) {
                                        slider1.goToNextSlide()
                                    } else {
                                        if (g >= 2) {
                                            slider1.goToNextSlide()
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (slideCount() > 4) {
                        if ($(this).hasClass("ppArrowLeft")) {
                            if (g == 0) {
                                for (var h = 0; h < slideCount() - 4; h++) {
                                    slider1.goToNextSlide()
                                }
                            } else {
                                if (g < slideCount() - 2) {
                                    slider1.goToPrevSlide()
                                } else {
                                    if (g == slideCount() - 1) {
                                        for (var h = 0; h < slideCount() - 4; h++) {
                                            slider1.goToNextSlide()
                                        }
                                    }
                                }
                            }
                        }
                        if ($(this).hasClass("ppArrowRight")) {
                            if (g == 0) {
                                for (var h = 0; h < slideCount() - 4; h++) {
                                    slider1.goToPrevSlide()
                                }
                            } else {
                                if (g == slideCount() - 1) {
                                    for (var h = 0; h < slideCount() - 4; h++) {
                                        slider1.goToPrevSlide()
                                    }
                                } else {
                                    if (g >= 2) {
                                        slider1.goToNextSlide()
                                    }
                                }
                            }
                        }
                    }
                }
                if ($(".scollerBigs").find(".slideshow-video-wrapper").length > 0) {
                    setTimeout(function() {
                        updateVideoPlayback()
                    },
                    400)
                }
            })
        };
        fixFullscreenDimensions = function(c) {
            var b = jwplayer("fcplayerProductVideo").getFullscreen();
            jwplayer("fcplayerProductVideo").on("fullscreen",
            function() {
                fcPoster.css("background-image", c);
                if (!b) {
                    fcPoster.css("background-image", c)
                }
            })
        };
        updateVideoPlayback = function() {
            forceVideoResize();
            if ($(".scollerBigs").find(".slideshow-video-wrapper").hasClass("focus")) {
                fcPoster = $(".scollerBigs").find(".slideshow-video-wrapper").find(".fc-poster"),
                fcPosterBgImageBeforeFS = fcPoster.css("background-image");
                jwplayer("fcplayerProductVideo").play();
                playerWidth = jwplayer("fcplayerProductVideo").getWidth();
                if ($("#js-main-carousel-container").hasClass("rtw-slideshow")) {
                    fixFullscreenDimensions(fcPosterBgImageBeforeFS)
                }
            } else {
                jwplayer("fcplayerProductVideo").stop()
            }
        };
        forceVideoResize = function() {
            if (window.fcplayer) {
                var b = $("#productMainImage").height();
                var c = b * $("#fcplayerProductVideo_container").data("ratio");
                jwplayer("fcplayerProductVideo").resize(c, b)
            }
        };
        waitForDelayedContent = function(g, c, f, h, e) {
            var c = c || 50;
            var f = f || 10000;
            var h = h || false;
            var j = f / c;
            var i = 0;
            var b = 0;
            var d = setInterval(function() {
                if (g()) {
                    if (!h) {
                        clearInterval(d)
                    }
                    if (e && typeof(e) === "function") {
                        e()
                    }
                } else {
                    if (i > j) {
                        clearInterval(d)
                    }
                }
                i++
            },
            c)
        };
        slideShow = function(i) {
            var e = $("#productPictures");
            var t = e.find("li");
            var d = t.length;
            var f = $("#productSheetSlideshow");
            var j = f.find("li");
            var l = j.length;
            var n = $(".navigationSlideshow");
            var g = 4;
            if (l > 1) {
                $("#mainPictureBlock").css({
                    opacity: 0
                });
                var p = setInterval(function() {
                    var b = $(".bigs").find("li").find("img");
                    if (b.css("visibility") == "visible") {
                        setTimeout(function() {
                            $("#mainPictureBlock").css({
                                opacity: 1
                            })
                        },
                        250);
                        clearInterval(p)
                    }
                },
                100);
                $("ul#productPictures").hide();
                f.show();
                if (RESPONSIVE_MANAGER.isMediumLargeMode()) {
                    var h = $("#productPictures").find("li");
                    var r = $("#productSheetSlideshow").find("ul.bigs li");
                    r.remove();
                    $("#productSheetSlideshow").find("ul.bigs").append(h)
                }
                $(".slideshow img").addClass("postLoaderResponsive");
                loadingImgs(".slideshow");
                var o = $(".slideshow");
                if (o.find("li").length > 1) {
                    var k = o.attr("id");
                    var o = new Slideshow();
                    o.callBackEndScroll = function() {
                        fireEvent("slideshowNavigateEvent")
                    };
                    var m = new SlideshowOption();
                    m.navigMode = "bullets";
                    m.displayArrows = false;
                    m.allowVerticalScroll = true;
                    if (isBeforeIE10) {
                        if (typeof addCallBackEndScrollHotStamping == "function") {
                            addCallBackEndScrollHotStamping()
                        }
                    } else {
                        fireEvent("slideshowInitialized")
                    }
                }
                var s = $(".bigs").find("li").find("img");
                if (s.length > 1) {
                    s.css("visibility", "hidden")
                } else {
                    var q = $("#productSheetSlideshow li");
                    $("#mainPictureBlock").attr("style", "opacity: 1 !important");
                    $("#productPictures").append(q).attr("style", "display: block !important")
                }
            } else {
                $("#productPictures").addClass("ppPicturesAjaxReverse");
                $("#productSheetSlideshow").addClass("ppSliderAjaxReverse")
            }
        };
        navigation = function() {
            var e = $(".navigationSlideshow"),
            d = e.find(".bulletPoint"),
            c = [],
            f = "140x140",
            b = [];
            d.addClass("ppBulletPoint");
            e.find(".arrow").addClass("ppArrow");
            $(".bigs li .contentSlideshow").each(function(i) {
                var j = $(this).attr("data-src"),
                h = false;
                $(this).attr("alt", CONFIGURATION.ALT_THUMBNAIL_PRODUCT_VIEW + " " + (i + 1) + " - " + $(this).attr("alt"));
                if (j.indexOf("wid={IMG_WIDTH}&hei={IMG_HEIGHT}") !== -1) {
                    if ($("#js-main-carousel-container").hasClass("rtw-slideshow")) {
                        j = j.replace("wid={IMG_WIDTH}&hei={IMG_HEIGHT}", "wid=140&hei=212")
                    } else {
                        j = j.replace("wid={IMG_WIDTH}&hei={IMG_HEIGHT}", "wid=140&hei=140")
                    }
                }
                if (j.indexOf("/embed/") !== -1) {
                    h = true;
                    var k = j.lastIndexOf("/");
                    var g = j.substring(k + 1);
                    j = j.replace(g, "").replace("embed/", "");
                    resultSmall = g.substring(0, 4);
                    if ($("#js-main-carousel-container").hasClass("rtw-slideshow")) {
                        f = "140x212"
                    }
                    j += "media/img/poster/video/" + f + "/" + resultSmall + "/" + g + ".jpg"
                }
                c.push(j);
                b.push(h)
            });
            d.each(function(g) {
                ariaSelected = $(this).hasClass("bulletPointDark") ? true: false;
                tabIndex = $(this).hasClass("bulletPointDark") ? 0 : -1;
                idProduct = "productSheetSlideshowItem_" + g;
                thumb = "thumbSlideshowItem_" + g;
                $("#" + idProduct).attr("aria-labelledby", thumb);
                $(this).attr({
                    id: thumb,
                    role: "tab",
                    "aria-controls": "productSheetSlideshowItem_" + g,
                    "aria-selected": ariaSelected,
                    tabindex: tabIndex,
                    "data-video-thumbnail": b[g],
                }).append('<img src="' + c[g] + '" alt="' + CONFIGURATION.ALT_THUMBNAIL_PRODUCT_VIEW + " " + (g + 1) + '"/>')
            });
            $(".navigationSlideshow").hide();
            $(".navigationSlideshow").show(0,
            function() {
                reloadThumbs()
            });
            wrapperCSarrow();
            $(".navigationSlideshow").eq(0).attr({
                id: "lightSlider",
                role: "tablist"
            });
            if (window.matchMedia("(max-width: 767px)").matches) {
                $(".navigationSlideshow").addClass("mobileVersion").removeClass("navigationSlideshow");
                $(".mobileVersion .ppArrow").appendTo(".mobileVersion");
                $(".mobileVersion").eq(0).attr("id", "lightSlider")
            }
            if ($(".rtw-slideshow").length > 0) {
                $(".mobileVersion, .desktopVersion").addClass("rtw-slideshow")
            }
            lightSliderLaunch();
            $(".mobileVersion .ppBulletPoint").on("touchstart",
            function() {
                var g = $(this).index();
                var h = $(".mobileVersion").find(".ppBulletPoint");
                $(".bulletPoint").removeClass("bulletPointDark");
                $(".bulletPoint").addClass("bulletPointClear");
                h.eq(g).addClass("bulletPointDark");
                $(".lightSlider").find(".ppBulletPoint").eq(g).trigger("click")
            })
        };
        centerVertical = function() {
            var d = $("#productSheetSlideshow").height(),
            b = $(".containerWrapperBigs");
            if (!$(".rtw-slideshow").length > 0 || d > 400) {
                $(".lSSlideOuter.vertical").addClass("centerThumb")
            }
            if (d === 400) {
                var c = (d - b.height()) / 2;
                b.css("margin-top", c)
            }
        };
        reloadThumbs = function() {
            if ($(".ppLoader").length === 0) {
                return false
            }
            var b = $("#productSheetSlideshow");
            var d = b.find("li").find("img");
            var c = $(".navigationSlideshow");
            c.find(".bulletPoint").each(function(f) {
                var g = $(this).index();
                var i = $(this).find("img");
                var h = i.attr("src");
                if ($(".ppLoader").length !== 0) {
                    var e = d.eq(g - 1).data("src").split("?")[0];
                    i.attr("src", e);
                    i.load(function() {
                        i.removeClass("ppLoader")
                    })
                }
            })
        };
        sliderReady = function() {
            var c = $("#productSheetSlideshow");
            var f = c.find("li").last().find("img");
            var b = c.find("li").last().find("img").attr("src");
            var e = $(".navigationSlideshow .bulletPoint.bulletPointDark").length;
            var d = $(".wrapper").length;
            if (e && b && d) {
                return true
            }
            return false
        };
        thumbnails = function(b) {
            waitForDelayedContent(sliderReady, 200, "", "", navigation)
        };
        newSlider = function() {
            $(window).resize(function() {
                if (RESPONSIVE_MANAGER.isMediumLargeMode()) {
                    blankBox();
                    $("#ppBlank").css({
                        left: "-10px"
                    })
                } else {
                    $("#ppBlank").css({
                        left: "-9999px"
                    })
                }
            });
            $(window).on("orientationchange",
            function(b) {});
            $(document).on("click", ".ppBulletPoint, .ppArrowRight, .ppArrowLeft",
            function(b) {})
        };
        recordCurrentSlide = function() {
            $(document).on("mousedown click", ".navigationSlideshow .ppBulletPoint",
            function() {
                currentSlide = $(this).index(".navigationSlideshow .ppBulletPoint")
            })
        };
        setSlide = function(d) {
            if (d) {
                var b = $(".bigs").find("li");
                var c = $(".navigationSlideshow.cs_nav_fadeV3").find(".ppBulletPoint");
                b.hide();
                b.eq(currentSlide).show();
                c.removeClass("bulletPointDark");
                c.eq(currentSlide).addClass("bulletPointDark")
            }
        };
        waitAjaxListener = function() {
            if (typeof $AjaxListener.addTrackingAjaxServices === "function") {
                return true
            }
            return false
        };
        slideCount = function() {
            var c = $("#productSheetSlideshow");
            var b = c.find("li");
            return b.length
        };
        ajaxReverse = function() {
            $("#productPictures").addClass("ppPicturesAjaxReverse");
            $("#productSheetSlideshow").addClass("ppSliderAjaxReverse");
            loadingImgs.bindOld(RESPONSIVE_MANAGER)()
        };
        ajaxBackToOne = function() {
            if (slideCount() === 1) {
                var c = $("#productSheetSlideshow").find("li");
                var b = c.find("img");
                $("#productPictures").append(c);
                $("#productPictures").addClass("ppPicturesAjaxReverse");
                $("#productSheetSlideshow").addClass("ppSliderAjaxReverse");
                b.css("visibility", "visible");
                $(".lSSlideOuter.vertical").css("visibility", "hidden")
            }
        };
        launchSlideShowProduct = function(b) {
            thumbnails();
            if ($(".momPanelClosed").length) {}
            if (b) {
                ajaxReverse()
            } else {
                if (!b && slideCount() > 1) {
                    $("#productPictures").removeClass("ppPicturesAjaxReverse");
                    $("#productSheetSlideshow").removeClass("ppSliderAjaxReverse")
                }
            }
        };
        lightSliderLaunch = function(d) {
            var b = $("#lightSlider.navigationSlideshow");
            if (!b.hasClass("lightSlider")) {
                var e = 298,
                c = 4;
                if ($(".rtw-slideshow").length > 0) {
                    c = 3;
                    e = 320
                }
                if (window.matchMedia("only screen and (max-width: 767px)").matches) {
                    slider2 = $("#lightSlider.mobileVersion").lightSlider({
                        item: c,
                        vertical: false,
                        vThumbWidth: 50,
                        thumbItem: 0,
                        slideMargin: 6,
                        slideEndAnimation: false,
                        pager: false,
                        gallery: false,
                        controls: false,
                        enableDrag: false,
                        adaptiveHeight: false,
                        onSliderLoad: function() {
                            addThumbMenuNav(c);
                            ThumbMenuNavClick(slider2);
                            if ($(".rtw-slideshow").length > 0) {
                                var k = $(".lSSlideOuter"),
                                f = $(".lSSlideWrapper");
                                if (slideCount() < c) {
                                    var h = $("#lightSlider.mobileVersion").find(".ppBulletPoint").width(),
                                    g = 6,
                                    j = 1,
                                    i = 33;
                                    k.css("width", thumbWrapperWidth + i * 2)
                                }
                            }
                        }
                    })
                } else {
                    if (slideCount() < c) {
                        e = (slideCount() * e) / c;
                        c = slideCount()
                    }
                    slider1 = $("#lightSlider").lightSlider({
                        item: c,
                        slideMargin: 5,
                        slideEndAnimation: false,
                        vertical: true,
                        vThumbWidth: 70,
                        adaptiveHeight: true,
                        thumbItem: 0,
                        pager: false,
                        gallery: false,
                        enableDrag: false,
                        controls: false,
                        verticalHeight: e,
                        onSliderLoad: function() {
                            addThumbMenuNav(c);
                            ThumbMenuNavClick(slider1);
                            var h = 33,
                            i = $(".lSSlideOuter.vertical"),
                            g = $(".lSSlideWrapper"),
                            f = g.height() + (h * 2);
                            i.css("height", f);
                            g.css("margin-top", h)
                        }
                    });
                    centerVertical()
                }
            }
        };
        addThumbMenuNav = function(b) {
            if ($(".lSAction").length === 0) {
                $(".lSSlideOuter").append('<div class="lSAction"><button class="lSPrev disabled ppArrowLeft arrowLeft navigationBtn left" aria-label="' + CONFIGURATION.ALT_PREV + '" data-evt-action-position="product_area" data-evt-action-id="product_image_viewed" data-evt-action-type="product_interaction"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="33" focusable="false" aria-hidden="true" role="img" viewBox="0 0 18 33" preserveAspectRatio="xMidYMid meet"><path stroke-width="1.3" stroke="#767676" fill="none" d="M 18 0 L 0 16.5 L 18 33"/></svg></button><button class="lSNext disabled ppArrowRight arrowRight navigationBtn right" aria-label="' + CONFIGURATION.ALT_NEXT + '" data-evt-action-position="product_area" data-evt-action-id="product_image_viewed" data-evt-action-type="product_interaction"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="33" focusable="false" aria-hidden="true" role="img" viewBox="0 0 18 33" preserveAspectRatio="xMidYMid meet"><path stroke-width="1.3" stroke="#767676" fill="none" d="M 0 0 L 18 16.5 L 0 33"/></svg></button></div>')
            }
            if (slideCount() > b) {
                $(".lSAction .lSNext").removeClass("disabled")
            }
        };
        ThumbMenuNavClick = function(c) {
            $(".lSAction > .lSPrev").click(function() {
                c.goToPrevSlide()
            });
            $(".lSAction > .lSNext").click(function() {
                c.goToNextSlide()
            });
            var b = $("#lightSlider"),
            d = $("#productSheetSlideshow .bigs li .zoomInIcon");
            $("#back-btn").on("keydown",
            function(f) {
                if (f.shiftKey && f.keyCode == 9) {
                    return true
                } else {
                    if (f.keyCode == 9) {
                        f.preventDefault();
                        b.find("li:first-of-type").focus()
                    }
                }
            });
            d.on("keydown",
            function(f) {
                if (f.shiftKey && f.keyCode == 9) {
                    f.preventDefault();
                    setTimeout(function() {
                        b.find("li.bulletPointDark").focus()
                    },
                    500)
                } else {
                    if (!f.shiftKey && f.keyCode == 9) {
                        b.find("li").attr({
                            "aria-selected": false,
                            tabindex: -1
                        });
                        if ($(this).parent().is(":not(:last-of-type)")) {
                            f.preventDefault();
                            $(".ppArrowRight").click();
                            setTimeout(function() {
                                b.find("li.bulletPointDark").attr({
                                    "aria-selected": true,
                                    tabindex: 0
                                }).focus()
                            },
                            500)
                        } else {
                            setTimeout(function() {
                                b.find("li.bulletPointDark").attr({
                                    "aria-selected": true,
                                    tabindex: 0
                                })
                            },
                            500)
                        }
                    }
                }
            });
            b.find("li").on("keydown",
            function(g) {
                g.preventDefault();
                b.find("li").attr({
                    "aria-selected": false,
                    tabindex: -1
                });
                setTimeout(function() {
                    b.find("li.bulletPointDark").attr({
                        "aria-selected": true,
                        tabindex: 0
                    })
                },
                500);
                if (g.shiftKey && g.keyCode == 9) {
                    if ($(this).is(":not(:first-of-type)")) {
                        $(".ppArrowLeft").click();
                        var f = b.find("li.bulletPointDark").prev().attr("aria-controls");
                        $("#" + f).find(".zoomInIcon").focus()
                    } else {
                        $("#back-btn").focus()
                    }
                } else {
                    if (!g.shiftKey && g.keyCode == 9) {
                        var f = b.find("li.bulletPointDark").attr("aria-controls");
                        $("#" + f).find(".zoomInIcon").focus()
                    } else {
                        if (g.keyCode == 40 || g.keyCode == 39) {
                            $(".ppArrowRight").click();
                            setTimeout(function() {
                                b.find("li.bulletPointDark").focus()
                            },
                            500)
                        } else {
                            if (g.keyCode == 38 || g.keyCode == 37) {
                                $(".ppArrowLeft").click();
                                setTimeout(function() {
                                    b.find("li.bulletPointDark").focus()
                                },
                                500)
                            }
                        }
                    }
                }
            });
            var e = b.find("li");
            e.on("click",
            function(f) {
                e.attr({
                    "aria-selected": false,
                    tabindex: -1
                });
                $(this).attr({
                    "aria-selected": true,
                    tabindex: 0
                })
            })
        };
        loadAjaxCase = function(b) {
            $(document).ajaxComplete(function(e, d, g) {
                if (g.url.indexOf("ajax/product.jsp") > -1) {
                    if (slideCount() > 1) {
                        var f = false;
                        setTimeout(ajaxBackToOne, 0)
                    } else {
                        var f = true;
                        setTimeout(newSlider, 0)
                    }
                    setTimeout(function() {
                        centerVertical()
                    },
                    800)
                }
            })
        };
        launchSlideShowProduct();
        loadAjaxCase();
        $(window).on("orientationchange",
        function(b) {
            setTimeout(function() {
                centerVertical()
            },
            500)
        })
    }
    a();
    window.loadCarouselProductPage = a
});