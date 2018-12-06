(function(a, c) {
    var b = {
        item: 3,
        autoWidth: false,
        slideMove: 1,
        slideMargin: 10,
        addClass: "",
        mode: "slide",
        useCSS: true,
        cssEasing: "ease",
        easing: "linear",
        speed: 400,
        auto: false,
        pauseOnHover: false,
        loop: false,
        slideEndAnimation: true,
        pause: 2000,
        keyPress: false,
        controls: true,
        prevHtml: "",
        nextHtml: "",
        rtl: false,
        adaptiveHeight: false,
        vertical: false,
        verticalHeight: 500,
        vThumbWidth: 100,
        thumbItem: 10,
        pager: true,
        gallery: false,
        galleryMargin: 5,
        thumbMargin: 5,
        currentPagerPosition: "middle",
        enableTouch: true,
        enableDrag: true,
        freeMove: true,
        swipeThreshold: 40,
        responsive: [],
        onBeforeStart: function(d) {},
        onSliderLoad: function(d) {},
        onBeforeSlide: function(d, e) {},
        onAfterSlide: function(d, e) {},
        onBeforeNextSlide: function(d, e) {},
        onBeforePrevSlide: function(d, e) {}
    };
    a.fn.lightSlider = function(d) {
        if (this.length === 0) {
            return this
        }
        if (this.length > 1) {
            this.each(function() {
                a(this).lightSlider(d)
            });
            return this
        }
        var e = {},
        x = a.extend(true, {},
        b, d),
        n = {},
        B = this;
        e.$el = this;
        if (x.mode === "fade") {
            x.vertical = false
        }
        var t = B.children(),
        s = a(window).width(),
        A = null,
        p = null,
        g = 0,
        r = 0,
        q = false,
        v = 0,
        u = "",
        z = 0,
        m = (x.vertical === true) ? "height": "width",
        f = (x.vertical === true) ? "margin-bottom": "margin-right",
        k = 0,
        l = 0,
        j = 0,
        i = 0,
        y = null,
        o = ("ontouchstart" in document.documentElement);
        var h = {};
        h.chbreakpoint = function() {
            s = a(window).width();
            if (x.responsive.length) {
                var E;
                if (x.autoWidth === false) {
                    E = x.item
                }
                if (s < x.responsive[0].breakpoint) {
                    for (var D = 0; D < x.responsive.length; D++) {
                        if (s < x.responsive[D].breakpoint) {
                            A = x.responsive[D].breakpoint;
                            p = x.responsive[D]
                        }
                    }
                }
                if (typeof p !== "undefined" && p !== null) {
                    for (var C in p.settings) {
                        if (p.settings.hasOwnProperty(C)) {
                            if (typeof n[C] === "undefined" || n[C] === null) {
                                n[C] = x[C]
                            }
                            x[C] = p.settings[C]
                        }
                    }
                }
                if (!a.isEmptyObject(n) && s > x.responsive[0].breakpoint) {
                    for (var w in n) {
                        if (n.hasOwnProperty(w)) {
                            x[w] = n[w]
                        }
                    }
                }
                if (x.autoWidth === false) {
                    if (k > 0 && j > 0) {
                        if (E !== x.item) {
                            z = Math.round(k / ((j + x.slideMargin) * x.slideMove))
                        }
                    }
                }
            }
        };
        h.calSW = function() {
            if (x.autoWidth === false) {
                j = (v - ((x.item * (x.slideMargin)) - x.slideMargin)) / x.item
            }
        };
        h.calWidth = function(D) {
            var C = D === true ? u.find(".lslide").length: t.length;
            C = C - 2;
            if (x.autoWidth === false) {
                r = C * (j + x.slideMargin)
            } else {
                r = 0;
                for (var w = 0; w < C; w++) {
                    r += (parseInt(t.eq(w).width()) + x.slideMargin)
                }
            }
            return r
        };
        e = {
            doCss: function() {
                var w = function() {
                    var E = ["transition", "MozTransition", "WebkitTransition", "OTransition", "msTransition", "KhtmlTransition"];
                    var C = document.documentElement;
                    for (var D = 0; D < E.length; D++) {
                        if (E[D] in C.style) {
                            return true
                        }
                    }
                };
                if (x.useCSS && w()) {
                    return true
                }
                return false
            },
            keyPress: function() {
                if (x.keyPress) {
                    a(document).on("keyup.lightslider",
                    function(w) {
                        if (!a(":focus").is("input, textarea")) {
                            if (w.preventDefault) {
                                w.preventDefault()
                            } else {
                                w.returnValue = false
                            }
                            if (w.keyCode === 37) {
                                B.goToPrevSlide()
                            } else {
                                if (w.keyCode === 39) {
                                    B.goToNextSlide()
                                }
                            }
                        }
                    })
                }
            },
            controls: function() {
                if (x.controls) {
                    B.after('<div class="lSAction"><button class="lSPrev disabled ppArrowLeft arrowLeft navigationBtn left" aria-label="' + CONFIGURATION.ALT_PREV + '"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="33" focusable="false" aria-hidden="true" role="img" viewBox="0 0 18 33" preserveAspectRatio="xMidYMid meet"><path stroke-width="1.3" stroke="#767676" fill="none" d="M 18 0 L 0 16.5 L 18 33"/></svg></button><button class="lSNext disabled ppArrowRight arrowRight navigationBtn right" aria-label="' + CONFIGURATION.ALT_NEXT + '"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="33" focusable="false" aria-hidden="true" role="img" viewBox="0 0 18 33" preserveAspectRatio="xMidYMid meet"><path stroke-width="1.3" stroke="#767676" fill="none" d="M 0 0 L 18 16.5 L 0 33"/></svg></button></div>');
                    if (!x.autoWidth) {
                        if (g <= x.item) {
                            u.find(".lSAction").hide()
                        }
                    } else {
                        if (h.calWidth(false) < v) {
                            u.find(".lSAction").hide()
                        }
                    }
                    u.find(".lSAction button").on("click",
                    function(w) {
                        if (w.preventDefault) {
                            w.preventDefault()
                        } else {
                            w.returnValue = false
                        }
                        if (a(this).attr("class") === "lSPrev") {
                            B.goToPrevSlide()
                        } else {
                            B.goToNextSlide()
                        }
                        return false
                    })
                }
            },
            initialStyle: function() {
                var w = this;
                if (x.mode === "fade") {
                    x.autoWidth = false;
                    x.slideEndAnimation = false
                }
                if (x.auto) {
                    x.slideEndAnimation = false
                }
                if (x.autoWidth) {
                    x.slideMove = 1;
                    x.item = 1
                }
                if (x.loop) {
                    x.slideMove = 1;
                    x.freeMove = false
                }
                x.onBeforeStart.call(this, B);
                h.chbreakpoint();
                B.addClass("lightSlider").wrap('<div class="lSSlideOuter ' + x.addClass + '"><div class="lSSlideWrapper"></div></div>');
                u = B.parent(".lSSlideWrapper");
                if (x.rtl === true) {
                    u.parent().addClass("lSrtl")
                }
                if (x.vertical) {
                    u.parent().addClass("vertical");
                    v = x.verticalHeight;
                    u.css("height", v + "px")
                } else {
                    v = B.outerWidth()
                }
                t.addClass("lslide");
                if (x.loop === true && x.mode === "slide") {
                    h.calSW();
                    h.clone = function() {
                        if (h.calWidth(true) > v) {
                            var E = 0,
                            H = 0;
                            for (var D = 0; D < t.length; D++) {
                                E += (parseInt(B.find(".lslide").eq(D).width()) + x.slideMargin);
                                H++;
                                if (E >= (v + x.slideMargin)) {
                                    break
                                }
                            }
                            var I = x.autoWidth === true ? H: x.item;
                            if (I < B.find(".clone.left").length) {
                                for (var G = 0; G < B.find(".clone.left").length - I; G++) {
                                    t.eq(G).remove()
                                }
                            }
                            if (I < B.find(".clone.right").length) {
                                for (var F = t.length - 1; F > (t.length - 1 - B.find(".clone.right").length); F--) {
                                    z--;
                                    t.eq(F).remove()
                                }
                            }
                            for (var J = B.find(".clone.right").length; J < I; J++) {
                                B.find(".lslide").eq(J).clone().removeClass("lslide").addClass("clone right").appendTo(B);
                                z++
                            }
                            for (var C = B.find(".lslide").length - B.find(".clone.left").length; C > (B.find(".lslide").length - I); C--) {
                                B.find(".lslide").eq(C - 1).clone().removeClass("lslide").addClass("clone left").prependTo(B)
                            }
                            t = B.children()
                        } else {
                            if (t.hasClass("clone")) {
                                B.find(".clone").remove();
                                w.move(B, 0)
                            }
                        }
                    };
                    h.clone()
                }
                h.sSW = function() {
                    g = t.length;
                    if (x.rtl === true && x.vertical === false) {
                        f = "margin-left"
                    }
                    if (x.autoWidth === false) {
                        t.css(m, j + "px")
                    }
                    t.css(f, x.slideMargin + "px");
                    r = h.calWidth(false);
                    B.css(m, r + "px");
                    if (x.loop === true && x.mode === "slide") {
                        if (q === false) {
                            z = B.find(".clone.left").length
                        }
                    }
                };
                h.calL = function() {
                    t = B.children();
                    g = t.length
                };
                if (this.doCss()) {
                    u.addClass("usingCss")
                }
                h.calL();
                if (x.mode === "slide") {
                    h.calSW();
                    h.sSW();
                    if (x.loop === true) {
                        k = w.slideValue();
                        this.move(B, k)
                    }
                    if (x.vertical === false) {
                        this.setHeight(B, false)
                    }
                } else {
                    this.setHeight(B, true);
                    B.addClass("lSFade");
                    if (!this.doCss()) {
                        t.fadeOut(0);
                        t.eq(z).fadeIn(0)
                    }
                }
                if (x.loop === true && x.mode === "slide") {
                    t.eq(z).addClass("active")
                } else {
                    t.first().addClass("active")
                }
            },
            pager: function() {
                var C = this;
                h.createPager = function() {
                    i = (v - ((x.thumbItem * (x.thumbMargin)) - x.thumbMargin)) / x.thumbItem;
                    var L = u.find(".lslide");
                    var F = u.find(".lslide").length;
                    var J = 0,
                    I = "",
                    M = 0;
                    for (J = 0; J < F; J++) {
                        if (x.mode === "slide") {
                            if (!x.autoWidth) {
                                M = J * ((j + x.slideMargin) * x.slideMove)
                            } else {
                                M += ((parseInt(L.eq(J).width()) + x.slideMargin) * x.slideMove)
                            }
                        }
                        var E = L.eq(J * x.slideMove).attr("data-thumb");
                        if (x.gallery === true) {
                            I += '<li style="width:100%;' + m + ":" + i + "px;" + f + ":" + x.thumbMargin + 'px"><a href="#"><img src="' + E + '" /></a></li>'
                        } else {
                            I += '<li><a href="#">' + (J + 1) + "</a></li>"
                        }
                        if (x.mode === "slide") {
                            if ((M) >= r - v - x.slideMargin) {
                                J = J + 1;
                                var H = 2;
                                if (x.autoWidth) {
                                    I += '<li><a href="#">' + (J + 1) + "</a></li>";
                                    H = 1
                                }
                                if (J < H) {
                                    I = null;
                                    u.parent().addClass("noPager")
                                } else {
                                    u.parent().removeClass("noPager")
                                }
                                break
                            }
                        }
                    }
                    var K = u.parent();
                    K.find(".lSPager").html(I);
                    if (x.gallery === true) {
                        if (x.vertical === true) {
                            K.find(".lSPager").css("width", x.vThumbWidth + "px")
                        }
                        l = (J * (x.thumbMargin + i)) + 0.5;
                        K.find(".lSPager").css({
                            property: l + "px",
                            "transition-duration": x.speed + "ms"
                        });
                        if (x.vertical === true) {
                            u.parent().css("padding-right", (x.vThumbWidth + x.galleryMargin) + "px")
                        }
                        K.find(".lSPager").css(m, l + "px")
                    }
                    var G = K.find(".lSPager").find("li");
                    G.first().addClass("active");
                    G.on("click",
                    function() {
                        if (x.loop === true && x.mode === "slide") {
                            z = z + (G.index(this) - K.find(".lSPager").find("li.active").index())
                        } else {
                            z = G.index(this)
                        }
                        B.mode(false);
                        if (x.gallery === true) {
                            C.slideThumb()
                        }
                        return false
                    })
                };
                if (x.pager) {
                    var w = "lSpg";
                    if (x.gallery) {
                        w = "lSGallery"
                    }
                    u.after('<ul class="lSPager ' + w + '"></ul>');
                    var D = (x.vertical) ? "margin-left": "margin-top";
                    u.parent().find(".lSPager").css(D, x.galleryMargin + "px");
                    h.createPager()
                }
                setTimeout(function() {
                    h.init()
                },
                0)
            },
            setHeight: function(C, F) {
                var E = null,
                D = this;
                if (x.loop) {
                    E = C.children(".lslide ").first()
                } else {
                    E = C.children().first()
                }
                var w = function() {
                    var H = E.outerHeight(),
                    I = 0,
                    G = H;
                    if (F) {
                        H = 0;
                        I = ((G) * 100) / v
                    }
                    C.css({
                        height: H + "px",
                        "padding-bottom": I + "%"
                    })
                };
                w();
                if (E.find("img").length) {
                    if (E.find("img")[0].complete) {
                        w();
                        if (!y) {
                            D.auto()
                        }
                    } else {
                        E.find("img").on("load",
                        function() {
                            setTimeout(function() {
                                w();
                                if (!y) {
                                    D.auto()
                                }
                            },
                            100)
                        })
                    }
                } else {
                    if (!y) {
                        D.auto()
                    }
                }
            },
            active: function(D, E) {
                if (this.doCss() && x.mode === "fade") {
                    u.addClass("on")
                }
                var F = 0;
                if (z * x.slideMove < g) {
                    D.removeClass("active");
                    if (!this.doCss() && x.mode === "fade" && E === false) {
                        D.fadeOut(x.speed)
                    }
                    if (E === true) {
                        F = z
                    } else {
                        F = z * x.slideMove
                    }
                    var C, w;
                    if (E === true) {
                        C = D.length;
                        w = C - 1;
                        if (F + 1 >= C) {
                            F = w
                        }
                    }
                    if (x.loop === true && x.mode === "slide") {
                        if (E === true) {
                            F = z - B.find(".clone.left").length
                        } else {
                            F = z * x.slideMove
                        }
                        if (E === true) {
                            C = D.length;
                            w = C - 1;
                            if (F + 1 === C) {
                                F = w
                            } else {
                                if (F + 1 > C) {
                                    F = 0
                                }
                            }
                        }
                    }
                    if (!this.doCss() && x.mode === "fade" && E === false) {
                        D.eq(F).fadeIn(x.speed)
                    }
                    D.eq(F).addClass("active")
                } else {
                    D.removeClass("active");
                    D.eq(D.length - 1).addClass("active");
                    if (!this.doCss() && x.mode === "fade" && E === false) {
                        D.fadeOut(x.speed);
                        D.eq(F).fadeIn(x.speed)
                    }
                }
            },
            move: function(C, w) {
                if (x.rtl === true) {
                    w = -w
                }
                if (this.doCss()) {
                    if (x.vertical === true) {
                        C.css({
                            transform: "translate3d(0px, " + ( - w) + "px, 0px)",
                            "-webkit-transform": "translate3d(0px, " + ( - w) + "px, 0px)"
                        })
                    } else {
                        C.css({
                            transform: "translate3d(" + ( - w) + "px, 0px, 0px)",
                            "-webkit-transform": "translate3d(" + ( - w) + "px, 0px, 0px)",
                        })
                    }
                } else {
                    if (x.vertical === true) {
                        C.css("position", "relative").animate({
                            top: -w + "px"
                        },
                        x.speed, x.easing)
                    } else {
                        C.css("position", "relative").animate({
                            left: -w + "px"
                        },
                        x.speed, x.easing)
                    }
                }
                var D = u.parent().find(".lSPager").find("li");
                this.active(D, true)
            },
            fade: function() {
                this.active(t, false);
                var w = u.parent().find(".lSPager").find("li");
                this.active(w, true)
            },
            slide: function() {
                var w = this;
                h.calSlide = function() {
                    if (r > v) {
                        k = w.slideValue();
                        w.active(t, false);
                        if ((k) > r - v - x.slideMargin) {
                            k = r - v - x.slideMargin
                        } else {
                            if (k < 0) {
                                k = 0
                            }
                        }
                        w.move(B, k);
                        if (x.loop === true && x.mode === "slide") {
                            if (z >= (g - (B.find(".clone.left").length / x.slideMove))) {
                                w.resetSlide(B.find(".clone.left").length)
                            }
                            if (z === 0) {
                                w.resetSlide(u.find(".lslide").length)
                            }
                        }
                        if (x.loop === false) {
                            if (B.getCurrentSlideCount() === 1) {
                                u.parent().find(".lSAction .lSPrev").addClass("disabled")
                            } else {
                                u.parent().find(".lSAction .lSPrev").removeClass("disabled")
                            }
                            if (k === (r - v - x.slideMargin)) {
                                u.parent().find(".lSAction .lSNext").addClass("disabled")
                            } else {
                                u.parent().find(".lSAction .lSNext").removeClass("disabled")
                            }
                        }
                    }
                };
                h.calSlide()
            },
            resetSlide: function(w) {
                var C = this;
                u.find(".lSAction button").addClass("disabled");
                setTimeout(function() {
                    z = w;
                    u.css("transition-duration", "0ms");
                    k = C.slideValue();
                    C.active(t, false);
                    e.move(B, k);
                    setTimeout(function() {
                        u.css("transition-duration", x.speed + "ms");
                        u.find(".lSAction button").removeClass("disabled")
                    },
                    50)
                },
                x.speed + 100)
            },
            slideValue: function() {
                var C = 0;
                if (x.autoWidth === false) {
                    C = z * ((j + x.slideMargin) * x.slideMove)
                } else {
                    C = 0;
                    for (var w = 0; w < z; w++) {
                        C += (parseInt(t.eq(w).width()) + x.slideMargin)
                    }
                }
                return C
            },
            slideThumb: function() {
                var C;
                switch (x.currentPagerPosition) {
                case "left":
                    C = 0;
                    break;
                case "middle":
                    C = (v / 2) - (i / 2);
                    break;
                case "right":
                    C = v - i
                }
                var E = z - B.find(".clone.left").length;
                var D = u.parent().find(".lSPager");
                if (x.mode === "slide" && x.loop === true) {
                    if (E >= D.children().length) {
                        E = 0
                    } else {
                        if (E < 0) {
                            E = D.children().length
                        }
                    }
                }
                var w = E * ((i + x.thumbMargin)) - (C);
                if ((w + v) > l) {
                    w = l - v - x.thumbMargin
                }
                if (w < 0) {
                    w = 0
                }
                this.move(D, w)
            },
            auto: function() {
                if (x.auto) {
                    clearInterval(y);
                    y = setInterval(function() {
                        B.goToNextSlide()
                    },
                    x.pause)
                }
            },
            pauseOnHover: function() {
                var w = this;
                if (x.auto && x.pauseOnHover) {
                    u.on("mouseenter",
                    function() {
                        a(this).addClass("ls-hover");
                        B.pause();
                        x.auto = true
                    });
                    u.on("mouseleave",
                    function() {
                        a(this).removeClass("ls-hover");
                        if (!u.find(".lightSlider").hasClass("lsGrabbing")) {
                            w.auto()
                        }
                    })
                }
            },
            touchMove: function(C, E) {
                u.css("transition-duration", "0ms");
                if (x.mode === "slide") {
                    var F = C - E;
                    var D = k - F;
                    if ((D) >= r - v - x.slideMargin) {
                        if (x.freeMove === false) {
                            D = r - v - x.slideMargin
                        } else {
                            var w = r - v - x.slideMargin;
                            D = w + ((D - w) / 5)
                        }
                    } else {
                        if (D < 0) {
                            if (x.freeMove === false) {
                                D = 0
                            } else {
                                D = D / 5
                            }
                        }
                    }
                    this.move(B, D)
                }
            },
            touchEnd: function(E) {
                u.css("transition-duration", x.speed + "ms");
                if (x.mode === "slide") {
                    var w = false;
                    var C = true;
                    k = k - E;
                    if ((k) > r - v - x.slideMargin) {
                        k = r - v - x.slideMargin;
                        if (x.autoWidth === false) {
                            w = true
                        }
                    } else {
                        if (k < 0) {
                            k = 0
                        }
                    }
                    var D = function(J) {
                        var I = 0;
                        if (!w) {
                            if (J) {
                                I = 1
                            }
                        }
                        if (!x.autoWidth) {
                            var G = k / ((j + x.slideMargin) * x.slideMove);
                            z = parseInt(G) + I;
                            if (k >= (r - v - x.slideMargin)) {
                                if (G % 1 !== 0) {
                                    z++
                                }
                            }
                        } else {
                            var F = 0;
                            for (var H = 0; H < t.length; H++) {
                                F += (parseInt(t.eq(H).width()) + x.slideMargin);
                                z = H + I;
                                if (F >= k) {
                                    break
                                }
                            }
                        }
                    };
                    if (E >= x.swipeThreshold) {
                        D(false);
                        C = false
                    } else {
                        if (E <= -x.swipeThreshold) {
                            D(true);
                            C = false
                        }
                    }
                    B.mode(C);
                    this.slideThumb()
                } else {
                    if (E >= x.swipeThreshold) {
                        B.goToPrevSlide()
                    } else {
                        if (E <= -x.swipeThreshold) {
                            B.goToNextSlide()
                        }
                    }
                }
            },
            enableDrag: function() {
                var E = this;
                if (!o) {
                    var D = 0,
                    C = 0,
                    w = false;
                    u.find(".lightSlider").addClass("lsGrab");
                    u.on("mousedown",
                    function(F) {
                        if (r < v) {
                            if (r !== 0) {
                                return false
                            }
                        }
                        if (a(F.target).attr("class") !== ("lSPrev") && a(F.target).attr("class") !== ("lSNext")) {
                            D = (x.vertical === true) ? F.pageY: F.pageX;
                            w = true;
                            if (F.preventDefault) {
                                F.preventDefault()
                            } else {
                                F.returnValue = false
                            }
                            u.scrollLeft += 1;
                            u.scrollLeft -= 1;
                            u.find(".lightSlider").removeClass("lsGrab").addClass("lsGrabbing");
                            clearInterval(y)
                        }
                    });
                    a(window).on("mousemove",
                    function(F) {
                        if (w) {
                            C = (x.vertical === true) ? F.pageY: F.pageX;
                            E.touchMove(C, D)
                        }
                    });
                    a(window).on("mouseup",
                    function(F) {
                        if (w) {
                            u.find(".lightSlider").removeClass("lsGrabbing").addClass("lsGrab");
                            w = false;
                            C = (x.vertical === true) ? F.pageY: F.pageX;
                            var G = C - D;
                            if (Math.abs(G) >= x.swipeThreshold) {
                                a(window).on("click.ls",
                                function(H) {
                                    if (H.preventDefault) {
                                        H.preventDefault()
                                    } else {
                                        H.returnValue = false
                                    }
                                    H.stopImmediatePropagation();
                                    H.stopPropagation();
                                    a(window).off("click.ls")
                                })
                            }
                            E.touchEnd(G)
                        }
                    })
                }
            },
            enableTouch: function() {
                var D = this;
                if (o) {
                    var C = {},
                    w = {};
                    u.on("touchstart",
                    function(E) {
                        w = E.originalEvent.targetTouches[0];
                        C.pageX = E.originalEvent.targetTouches[0].pageX;
                        C.pageY = E.originalEvent.targetTouches[0].pageY;
                        clearInterval(y)
                    });
                    u.on("touchmove",
                    function(E) {
                        if (r < v) {
                            if (r !== 0) {
                                return false
                            }
                        }
                        var H = E.originalEvent;
                        w = H.targetTouches[0];
                        var F = Math.abs(w.pageX - C.pageX);
                        var G = Math.abs(w.pageY - C.pageY);
                        if (x.vertical === true) {
                            if ((G * 3) > F) {
                                E.preventDefault()
                            }
                            D.touchMove(w.pageY, C.pageY)
                        } else {
                            if ((F * 3) > G) {
                                E.preventDefault()
                            }
                            D.touchMove(w.pageX, C.pageX)
                        }
                    });
                    u.on("touchend",
                    function() {
                        if (r < v) {
                            if (r !== 0) {
                                return false
                            }
                        }
                        var E;
                        if (x.vertical === true) {
                            E = w.pageY - C.pageY
                        } else {
                            E = w.pageX - C.pageX
                        }
                        D.touchEnd(E)
                    })
                }
            },
            build: function() {
                var w = this;
                w.initialStyle();
                if (this.doCss()) {
                    if (x.enableTouch === true) {
                        w.enableTouch()
                    }
                    if (x.enableDrag === true) {
                        w.enableDrag()
                    }
                }
                a(window).on("focus",
                function() {
                    w.auto()
                });
                a(window).on("blur",
                function() {
                    clearInterval(y)
                });
                w.pager();
                w.pauseOnHover();
                w.controls();
                w.keyPress()
            }
        };
        e.build();
        h.init = function() {
            h.chbreakpoint();
            if (x.vertical === true) {
                if (x.item > 1) {
                    v = x.verticalHeight
                } else {
                    v = t.outerHeight()
                }
                u.css("height", v + "px")
            } else {
                v = u.outerWidth()
            }
            if (x.loop === true && x.mode === "slide") {
                h.clone()
            }
            h.calL();
            if (x.mode === "slide") {
                B.removeClass("lSSlide")
            }
            if (x.mode === "slide") {
                h.calSW();
                h.sSW()
            }
            setTimeout(function() {
                if (x.mode === "slide") {
                    B.addClass("lSSlide")
                }
            },
            1000);
            if (x.pager) {
                h.createPager()
            }
            if (x.adaptiveHeight === true && x.vertical === false) {
                B.css("height", t.eq(z).outerHeight(true))
            }
            if (x.adaptiveHeight === false) {
                if (x.mode === "slide") {
                    if (x.vertical === false) {
                        e.setHeight(B, false)
                    } else {
                        e.auto()
                    }
                } else {
                    e.setHeight(B, true)
                }
            }
            if (x.gallery === true) {
                e.slideThumb()
            }
            if (x.mode === "slide") {
                e.slide()
            }
            if (x.autoWidth === false) {
                if (t.length <= x.item) {
                    u.find(".lSAction").hide()
                } else {
                    u.find(".lSAction").show()
                }
            } else {
                if ((h.calWidth(false) < v) && (r !== 0)) {
                    u.find(".lSAction").hide()
                } else {
                    u.find(".lSAction").show()
                }
            }
        };
        B.goToPrevSlide = function() {
            if (z > 0) {
                x.onBeforePrevSlide.call(this, B, z);
                z--;
                B.mode(false);
                if (x.gallery === true) {
                    e.slideThumb()
                }
            } else {
                if (x.loop === true) {
                    x.onBeforePrevSlide.call(this, B, z);
                    if (x.mode === "fade") {
                        var w = (g - 1);
                        z = parseInt(w / x.slideMove)
                    }
                    B.mode(false);
                    if (x.gallery === true) {
                        e.slideThumb()
                    }
                } else {
                    if (x.slideEndAnimation === true) {
                        B.addClass("leftEnd");
                        setTimeout(function() {
                            B.removeClass("leftEnd")
                        },
                        400)
                    }
                }
            }
        };
        B.goToNextSlide = function() {
            var w = true;
            if (x.mode === "slide") {
                var C = e.slideValue();
                w = C < r - v - x.slideMargin
            }
            if (((z * x.slideMove) < g - x.slideMove) && w) {
                x.onBeforeNextSlide.call(this, B, z);
                z++;
                B.mode(false);
                if (x.gallery === true) {
                    e.slideThumb()
                }
            } else {
                if (x.loop === true) {
                    x.onBeforeNextSlide.call(this, B, z);
                    z = 0;
                    B.mode(false);
                    if (x.gallery === true) {
                        e.slideThumb()
                    }
                } else {
                    if (x.slideEndAnimation === true) {
                        B.addClass("rightEnd");
                        setTimeout(function() {
                            B.removeClass("rightEnd")
                        },
                        400)
                    }
                }
            }
        };
        B.mode = function(w) {
            if (x.adaptiveHeight === true && x.vertical === false) {
                B.css("height", t.eq(z).outerHeight(true))
            }
            if (q === false) {
                if (x.mode === "slide") {
                    if (e.doCss()) {
                        B.addClass("lSSlide");
                        if (x.speed !== "") {
                            u.css("transition-duration", x.speed + "ms")
                        }
                        if (x.cssEasing !== "") {
                            u.css("transition-timing-function", x.cssEasing)
                        }
                    }
                } else {
                    if (e.doCss()) {
                        if (x.speed !== "") {
                            B.css("transition-duration", x.speed + "ms")
                        }
                        if (x.cssEasing !== "") {
                            B.css("transition-timing-function", x.cssEasing)
                        }
                    }
                }
            }
            if (!w) {
                x.onBeforeSlide.call(this, B, z)
            }
            if (x.mode === "slide") {
                e.slide()
            } else {
                e.fade()
            }
            if (!u.hasClass("ls-hover")) {
                e.auto()
            }
            setTimeout(function() {
                if (!w) {
                    x.onAfterSlide.call(this, B, z)
                }
            },
            x.speed);
            q = true
        };
        B.play = function() {
            B.goToNextSlide();
            x.auto = true;
            e.auto()
        };
        B.pause = function() {
            x.auto = false;
            clearInterval(y)
        };
        B.refresh = function() {
            h.init()
        };
        B.getCurrentSlideCount = function() {
            var D = z;
            if (x.loop) {
                var C = u.find(".lslide").length,
                w = B.find(".clone.left").length;
                if (z <= w - 1) {
                    D = C + (z - w)
                } else {
                    if (z >= (C + w)) {
                        D = z - C - w
                    } else {
                        D = z - w
                    }
                }
            }
            return D + 1
        };
        B.getTotalSlideCount = function() {
            return u.find(".lslide").length
        };
        B.goToSlide = function(w) {
            if (x.loop) {
                z = (w + B.find(".clone.left").length - 1)
            } else {
                z = w
            }
            B.mode(false);
            if (x.gallery === true) {
                e.slideThumb()
            }
        };
        B.destroy = function() {
            if (B.lightSlider) {
                B.goToPrevSlide = function() {};
                B.goToNextSlide = function() {};
                B.mode = function() {};
                B.play = function() {};
                B.pause = function() {};
                B.refresh = function() {};
                B.getCurrentSlideCount = function() {};
                B.getTotalSlideCount = function() {};
                B.goToSlide = function() {};
                B.lightSlider = null;
                h = {
                    init: function() {}
                };
                B.parent().parent().find(".lSAction, .lSPager").remove();
                B.removeClass("lightSlider lSFade lSSlide lsGrab lsGrabbing leftEnd right").removeAttr("style").unwrap().unwrap();
                B.children().removeAttr("style");
                t.removeClass("lslide active");
                B.find(".clone").remove();
                t = null;
                y = null;
                q = false;
                z = 0
            }
        };
        setTimeout(function() {
            x.onSliderLoad.call(this, B)
        },
        10);
        a(window).on("resize orientationchange",
        function(w) {
            setTimeout(function() {
                if (w.preventDefault) {
                    w.preventDefault()
                } else {
                    w.returnValue = false
                }
                h.init()
            },
            200)
        });
        return this
    }
} (jQuery));