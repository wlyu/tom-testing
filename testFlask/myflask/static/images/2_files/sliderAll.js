function Slideshow() {
    this.slideshowContainer;
    this.listBigs;
    this.listThumbs;
    this.listBigsWrapper;
    this.listThumbsWrapper;
    this.arrowLeft;
    this.arrowRight;
    this.myThumbsScroll;
    this.myBigScroll;
    this.itemClicked = -1;
    this.thumbsWidth = 0;
    this.mediaWidth;
    this.thumbsHeight;
    this.bigsHeight;
    this.bigsWidth;
    this.paginationEl;
    this.heightMode;
    this.scrollDuration = 500;
    this.slideCount;
    this.currentPosition = 0;
    this.arrowBulletRight;
    this.arrowBulletLeft;
    this.maxNumberOfBullets;
    this.numberOfBullet;
    this.callBackEndScroll;
    this.options;
    this.slideshowSelector;
    this.isSwiping = false;
    this.initSlideshow = function(d, f) {
        var e = this;
        this.slideshowSelector = d;
        this.options = (f === undefined) ? new SlideshowOption() : f;
        this.slideshowContainer = $(d);
        if (this.slideshowContainer.attr("data-loaded") || this.slideshowContainer.is(":hidden")) {
            return false
        }
        this.slideshowContainer.attr("data-loaded", "true");
        this.buildArchitecture();
        this.initializeScroll();
        this.resizeContainer();
        if (this.isThumbsUsed() || this.options.navigMode === "thumbsAndBullets") {
            this.linkThumbsToBig()
        }
        this.initSizeWatcher()
    };
    this.initSizeWatcher = function(g) {
        g = g || this.slideshowContainer;
        var h = g instanceof jQuery ? g: $(g),
        f = h.parent(),
        e = h.width(),
        d = this;
        setInterval(function() {
            var i = h.width(),
            j = f.is(":visible");
            if (e !== i && j) {
                e = i;
                d.refresh()
            }
        },
        500)
    };
    this.scrollEndCallback = function() {
        this.currentPosition = Math.abs(Math.round(this.myBigScroll.x / this.myBigScroll.wrapperW));
        if (this.itemClicked >= 0) {
            this.myThumbsScroll.scrollToElement("li:nth-child(" + this.itemClicked + ")", this.scrollDuration);
            this.myBigScroll.currPageX = this.itemClicked;
            this.itemClicked = -1
        } else {
            if (this.isThumbsUsed() || this.options.navigMode === "thumbsAndBullets") {
                this.listThumbs.find(".focus").removeClass("focus")
            }
            this.listBigs.find(".focus").removeClass("focus");
            if (this.isThumbsUsed() || this.options.navigMode === "thumbsAndBullets") {
                this.myThumbsScroll.scrollToElement("li:nth-child(" + (this.myBigScroll.currPageX + 1) + ")", this.scrollDuration);
                this.listThumbs.find("li:nth-child(" + (this.myBigScroll.currPageX + 1) + ")").addClass("focus")
            }
            this.listBigs.find(">li:nth-child(" + (this.myBigScroll.currPageX + 1) + ")").addClass("focus")
        }
        if (this.options.displayArrows) {
            this.handleMainArrowsDisplay()
        }
        if (this.options.navigMode === "bullets" || this.options.navigMode === "thumbsAndBullets") {
            if (this.slideCount > 1) {
                this.updateBullets();
                this.updateBulletsArrows()
            }
        }
        this.calculateMainHeight();
        if (this.paginationEl) {
            this.paginationEl.html((this.myBigScroll.currPageX + 1) + "/" + this.myBigScroll.pagesX.length)
        }
        if (typeof(this.callBackEndScroll) === "function") {
            this.callBackEndScroll.call()
        }
        if (this.isSwiping) {
            fireEvent("NavigateSlideshow", {
                type: "Swipe",
                selector: this.slideshowSelector,
                isearch_rank: this.itemClicked
            });
            this.isSwiping = false;
            if (window.matchMedia("only screen and (max-width: 767px)").matches) {
                if ($(".rtw-slideshow").length > 0) {
                    if (slideCount() > 3) {
                        b(this.currentPosition)
                    }
                } else {
                    if (slideCount() > 4) {
                        b(this.currentPosition)
                    }
                }
            } else {
                if ($(".rtw-slideshow").length > 0) {
                    if (slideCount() > 3) {
                        var d = $(".bulletPointDark").index(".bulletPoint");
                        if ((this.lastindex < d) && d >= 2) {
                            slider1.goToNextSlide()
                        } else {
                            if ((this.lastindex > d) && (d <= slideCount() - 3)) {
                                slider1.goToPrevSlide()
                            }
                        }
                        this.lastindex = d
                    }
                }
            }
        }
    };
    function a() {
        var d = $(".bulletPointDark").index(".bulletPoint");
        if (d > 2) {
            slider1.goToNextSlide()
        } else {
            if (d < slideCount() - 3) {
                slider1.goToPrevSlide()
            }
        }
    }
    function c() {
        var e = $(".bulletPointDark").index(".bulletPoint");
        if ((e >= 2) && (e < 4)) {
            slider1.goToNextSlide()
        } else {
            if (e > 2) {
                for (var d = 0; d < slideCount() - 3; d++) {
                    slider1.goToPrevSlide()
                }
            }
        }
    }
    function b(d) {
        if (d >= 3) {
            slider2.goToNextSlide()
        } else {
            if ((d < slideCount() - 3)) {
                slider2.goToPrevSlide()
            }
        }
    }
    this.updateBulletsArrows = function() {
        if (this.currentPosition < this.slideCount - 1) {
            this.arrowBulletRight.addClass("arrowBulletRight")
        } else {
            this.arrowBulletRight.removeClass("arrowBulletRight")
        }
        if (this.currentPosition > 0) {
            this.arrowBulletLeft.addClass("arrowBulletLeft")
        } else {
            this.arrowBulletLeft.removeClass("arrowBulletLeft")
        }
    };
    this.handleMainArrowsDisplay = function() {
        if (this.currentPosition !== 0) {
            this.arrowLeft.fadeIn("slow")
        } else {
            this.arrowLeft.fadeOut("slow")
        }
        if (this.currentPosition != this.listBigs.find(">li").length - 1) {
            this.arrowRight.fadeIn("slow")
        } else {
            this.arrowRight.fadeOut("fast")
        }
    };
    this.calculateMainHeight = function() {
        if (this.options.heightMode === "parent") {
            if (! (this.isThumbsUsed() || this.options.navigMode === "thumbsAndBullets")) {
                this.listBigsWrapper.height(this.slideshowContainer.outerHeight() + "px")
            }
        }
        if (this.options.isAnalyticCalledAtInit) {
            this.options.lastPageX = 0
        }
        if (this.options.isAnalyticCalled && this.lastPageX >= 0) {
            var d = (this.myBigScroll.currPageX + 1);
            fireEvent("SlideshowInit")
        }
        this.options.lastPageX = 0
    };
    this.resizeContainer = function() {
        this.mediaWidth = this.slideshowContainer.width();
        if (this.isThumbsUsed() || this.options.navigMode === "thumbsAndBullets") {
            this.thumbsHeight = this.listThumbsWrapper.outerHeight();
            this.drawThumbScroller();
            this.myThumbsScroll.refresh()
        }
        this.listBigs.find("li img").css("width", "");
        var f = this.listBigsWrapper.find("li");
        f.width(this.mediaWidth);
        if (this.options.forceRatio) {
            var d = typeof this.options.forceRatio === "function" ? this.options.forceRatio() : this.options.forceRatio;
            f.height(d ? this.mediaWidth / d: "")
        }
        this.bigsHeight = this.listBigsWrapper.outerHeight();
        this.bigsWidth = this.listBigsWrapper.outerWidth();
        var e = this;
        this.listBigsScroller.css("width", this.listBigs.find(">li").length * this.mediaWidth);
        $(window).trigger("lv.slideshow.resized", [this]);
        this.myBigScroll.refresh();
        this.scrollToSlide(this.currentPosition)
    };
    this.refresh = function() {
        this.resizeContainer();
        this.reloadS7()
    };
    this.drawThumbScroller = function() {
        if (this.listThumbs.css("display") === "none" || this.listThumbsScroller.css("display") === "none" || this.listThumbsWrapper.css("display") === "none") {
            return
        }
        this.listThumbs.find("li").css("width", "");
        this.listThumbs.find("li img").css("width", "");
        this.listThumbsScroller.css("width", "");
        var e = this.listThumbs.find("li img");
        var d = e.length;
        this.thumbsWidth = 0;
        var f = this;
        e.each(function(h) {
            var i = $(this);
            var g = Math.round(i.outerWidth());
            i.width(g + "px");
            i.parent().width(i.width());
            g = i.parent().outerWidth();
            f.thumbsWidth += g;
            if (h === (d - 1)) {
                f.listThumbsScroller.width(f.thumbsWidth + "px");
                f.myThumbsScroll.refresh()
            }
        })
    };
    this.linkThumbsToBig = function() {
        this.listThumbs.find("li:first-child").addClass("focus");
        if (this.options.displayArrows) {
            this.arrowLeft.hide()
        }
        if (this.listThumbsWrapper.attr("data-clickable") === "true") {
            this.listThumbsWrapper.on("click", "li", this.callbackClickThumbs.bind(this))
        }
    };
    this.callbackClickThumbs = function(f) {
        var d = $(f.currentTarget);
        this.listThumbs.find(".focus").removeClass("focus");
        d.addClass("focus");
        this.itemClicked = d.prevAll().length;
        this.scrollToSlide(this.itemClicked);
        fireEvent("NavigateSlideshow", {
            type: "ThumbsClick",
            selector: this.slideshowSelector,
            isearch_rank: this.itemClicked
        })
    };
    this.sizeAndPlaceImgs = function(d) {
        d.css("top", parseInt((this.bigsHeight - d.outerHeight()) / 2, 10) + "px");
        d.css("left", parseInt((this.bigsWidth - d.outerWidth()) / 2, 10) + "px");
        this.myBigScroll.refresh()
    };
    this.buildArchitecture = function() {
        this.wrapBigList();
        if (this.options.navigMode === "thumbs") {
            this.wrapThumbList()
        } else {
            if (this.options.navigMode === "bullets") {
                this.buildBulletsNavigation()
            } else {
                if (this.options.navigMode === "thumbsAndBullets") {
                    this.wrapThumbList();
                    this.buildBulletsNavigation()
                } else {
                    if (this.options.navigMode === "pagination") {
                        this.buildPagination()
                    }
                }
            }
        }
        if (this.options.displayArrows) {
            this.buildArrows()
        }
    };
    this.buildBulletsNavigation = function() {
        this.slideCount = this.listBigs.find(">li").length;
        if (this.slideCount > 1) {
            this.buildBullets();
            this.buildArrowsBullets()
        }
    };
    this.buildBullets = function() {
        this.maxNumberOfBullets = Math.floor((this.slideshowContainer.outerWidth() - this.getElementWidth("arrow") * 2) / this.getElementWidth("bulletPoint"));
        this.numberOfBullet = Math.min(this.maxNumberOfBullets, this.slideCount);
        this.bulletsWrapper = Slideshow.getBulletNavigationElement(this.numberOfBullet, this);
        if (this.options.navigMode === "thumbsAndBullets") {
            this.bulletsWrapper.addClass("onlyAS")
        }
        this.slideshowContainer.after(this.bulletsWrapper)
    };
    this.handleBulletClick = function(d) {
        this.scrollToSlide(this.bulletToSlide(d));
        fireEvent("NavigateSlideshow", {
            type: "BulletClick",
            selector: this.slideshowSelector,
            isearch_rank: d
        })
    };
    this.bulletToSlide = function(d) {
        if (d === this.numberOfBullet - 1) {
            return this.slideCount - 1
        }
        return Math.round(d * this.slideCount / (this.numberOfBullet))
    };
    this.slideToBullet = function(d) {
        var e = (this.slideCount <= this.maxNumberOfBullets) ? d: Math.min(Math.floor((d + 1) * (this.numberOfBullet) / this.slideCount), this.numberOfBullet - 1);
        return e
    };
    this.buildArrowsBullets = function() {
        this.arrowBulletLeft = $("<div/>");
        this.arrowBulletLeft.addClass("arrowBulletLeft");
        this.arrowBulletLeft.addClass("arrow");
        this.bulletsWrapper.prepend(this.arrowBulletLeft);
        this.arrowBulletLeft.click(this.leftArrowClick.bind(this));
        this.arrowBulletRight = $("<div/>");
        this.arrowBulletRight.addClass("arrowBulletRight");
        this.arrowBulletRight.addClass("arrow");
        this.bulletsWrapper.append(this.arrowBulletRight);
        this.arrowBulletRight.click(this.rightArrowClick.bind(this))
    };
    this.getElementWidth = function(f) {
        var d = $("<div/>");
        d.addClass(f);
        d.css({
            visibility: "hidden"
        });
        $("body").append(d);
        var e = d.outerWidth();
        d.remove();
        return e
    };
    this.scrollToSlide = function(d, e) {
        e = (e === undefined) ? 500 : e;
        this.myBigScroll.scrollToElement(this.listBigs.find(">li:nth-child(" + (d + 1) + ")").get(0), e);
        this.myBigScroll.currPageX = d
    };
    this.updateBullets = function() {
        if (this.bulletsWrapper !== undefined) {
            var d = this.bulletsWrapper.find(".bulletPointDark");
            d.removeClass("bulletPointDark");
            d.addClass("bulletPointClear");
            $(this.bulletsWrapper.find(".bulletPoint").get(this.slideToBullet(this.currentPosition))).addClass("bulletPointDark")
        }
    };
    this.wrapBigList = function() {
        this.listBigs = this.slideshowContainer.find(".bigs");
        this.listBigsScroller = this.listBigs.wrap("<div/>").parent();
        this.listBigsScroller.addClass("scroller scollerBigs");
        this.listBigsWrapper = this.listBigsScroller.wrap("<div/>").parent();
        this.listBigsWrapper.addClass("wrapper wrapperBigs");
        this.listBigsWrapper.wrap("<div/>").parent().addClass("wrapper containerWrapperBigs")
    };
    this.wrapThumbList = function() {
        this.listThumbs = this.slideshowContainer.find(".thumbs");
        this.listThumbs.find("li img").css("max-width", "100%").css("margin", "auto").css("width", "");
        this.listThumbs.find("li").append('<div class="shadow"></div>');
        this.listThumbsScroller = this.listThumbs.wrap("<div/>").parent();
        this.listThumbsScroller.addClass("scroller scollerThumbs");
        this.listThumbsWrapper = this.listThumbsScroller.wrap("<div/>").parent();
        this.listThumbsWrapper.addClass("wrapper wrapperThumbs").attr("data-clickable", "true");
        if (this.options.navigMode === "thumbsAndBullets") {
            this.listThumbsWrapper.addClass("onlyML")
        }
    };
    this.buildArrows = function() {
        var d = this.listBigsWrapper.parent();
        this.arrowRight = d.find(".rightArrowSlideshow");
        this.arrowLeft = d.find(".leftArrowSlideshow");
        if (!this.arrowRight.length) {
            this.arrowRight = $('<button><span class="mask">').addClass("rightArrowSlideshow");
            d.append(this.arrowRight);
            $(".rightArrowSlideshow .mask").append(CONFIGURATION.ALT_NEXT)
        }
        if (!this.arrowLeft.length) {
            this.arrowLeft = $('<button><span class="mask">').addClass("leftArrowSlideshow");
            d.append(this.arrowLeft);
            $(".leftArrowSlideshow .mask").append(CONFIGURATION.ALT_PREV)
        }
        if (this.options.navigMode === "thumbsAndBullets") {
            this.arrowRight.addClass("onlyML");
            this.arrowLeft.addClass("onlyML")
        }
        this.buildMainArrowEvents()
    };
    this.buildMainArrowEvents = function() {
        this.arrowLeft.click(this.leftArrowClick.bind(this));
        this.arrowRight.click(this.rightArrowClick.bind(this))
    };
    this.leftArrowClick = function() {
        this.myBigScroll.scrollToPage("prev");
        fireEvent("NavigateSlideshow", {
            type: "ArrowClick",
            isearch_rank: this.currentPosition,
            selector: this.slideshowSelector,
            arrowType: "Previous"
        })
    };
    this.rightArrowClick = function() {
        this.myBigScroll.scrollToPage("next");
        fireEvent("NavigateSlideshow", {
            type: "ArrowClick",
            isearch_rank: this.currentPosition,
            selector: this.slideshowSelector,
            arrowType: "next"
        })
    };
    this.buildPagination = function() {
        this.paginationEl = $("<span>").addClass("position");
        this.slideshowContainer.append(this.paginationEl)
    };
    this.initializeScroll = function() {
        var g = this;
        window.leftbtn = d;
        window.rightbtn = f;
        function d() {
            g.myBigScroll.scrollToPage(slideCount() - 1)
        }
        function f() {
            g.myBigScroll.scrollToPage(0)
        }
        var e = this.options.allowVerticalScroll;
        this.myBigScroll = new iScroll(this.listBigsWrapper.get(0), {
            snap: true,
            momentum: false,
            vScroll: false,
            mouseWheel: false,
            wheelAction: "none",
            onBeforeScrollStart: function(h) {
                if (this.absDistX > (this.absDistY + 5) || !e) {
                    h.preventDefault()
                }
            },
            hScrollbar: false,
            onScrollEnd: this.scrollEndCallback.bind(this),
            onScrollMove: this.onScrollMoveCallback.bind(this)
        });
        if (this.isThumbsUsed() || this.options.navigMode === "thumbsAndBullets") {
            this.myThumbsScroll = new iScroll(this.listThumbsWrapper.get(0), {
                snap: true,
                hScrollbar: false,
                vScroll: false
            })
        }
    };
    this.reloadS7 = function() {
        if (isBeforeIE10 || RESPONSIVE_MANAGER.isAllSmallMode()) {
            this.listBigs.find("img").css("width", "1px").each(function() {
                $(this).attr("data-currentcategory", "")
            });
            this.listBigs.find("li img").css("width", "")
        }
    };
    this.onScrollMoveCallback = function() {
        this.isSwiping = true
    };
    this.isThumbsUsed = function() {
        return this.options.navigMode === "thumbs"
    }
}
Slideshow.getBulletNavigationElement = function(e, d) {
    bulletsWrapper = $("<ul/>");
    bulletsWrapper.addClass("navigationSlideshow");
    for (var c = 0; c < e; c++) {
        var b = $("<li/>");
        b.addClass((c === 0) ? "bulletPointDark": "bulletPointClear");
        b.addClass("bulletPoint");
        var a = (function(f, g) {
            return function() {
                g.handleBulletClick(f);
                setTimeout(function() {
                    updateVideoPlayback()
                },
                650)
            }
        })(c, d);
        b.click(a);
        bulletsWrapper.append(b)
    }
    return bulletsWrapper
}; (function(g) {
    var f = 0,
    o = ".slideshow",
    a = ".mobile-slideshow",
    b, k;
    var n = {
        navigMode: "bullets",
        heightMode: "default",
        displayArrows: true,
        isAnalyticCalled: false,
        AnalyticSection: "",
        lastPageX: -1,
        isAnalyticCalledAtInit: true,
        allowVerticalScroll: true
    };
    var l = [{
        selector: ".mini-news-visual " + o,
        ratio: false
    },
    {
        selector: o + ".s7_VISUAL9",
        ratio: {
            All: 16 / 9,
            AllSmall: false
        }
    },
    {
        selector: o + ".s7_DI1",
        ratio: 256 / 119
    },
    {
        selector: o + ".s7_mixed",
        ratio: {
            All: 16 / 9,
            AllSmall: 89 / 65
        }
    },
    {
        selector: ".lvnow-wrapper .lvnow-news-visual " + o,
        ratio: 16 / 9
    }];
    function i(p) {
        if (typeof p !== "object") {
            return false
        }
        return function() {
            return RESPONSIVE_MANAGER.getValueFromModeMap(p)
        }
    }
    function e(p) {
        var q = p.attr("id");
        if (!q) {
            f++;
            q = "slideshow-" + f;
            p.attr("id", q)
        }
        return q
    }
    function d(q, p) {
        if (!g(document).data("restore-slider-" + q)) {
            g(document).data("restore-slider-" + q, p[0].outerHTML)
        }
    }
    function c(q, p) {
        if (g(document).data("restore-slider-" + q)) {
            p.next(".navigationSlideshow").remove().end().replaceWith(g(document).data("restore-slider-" + q));
            p = g("#" + q)
        }
        return p
    }
    function m() {
        k = b;
        b = RESPONSIVE_MANAGER.isAllSmallMode() ? "on": "off";
        if (k === b) {
            return
        }
        j(a, b)
    }
    function j(p, q) {
        g(p).each(function() {
            var r = g(this),
            s = e(r);
            if (typeof q === "undefined" || q === "on") {
                d(s, r);
                r.find(".img").css("width", "100%").css("float", "left");
                h(s, r)
            } else {
                r = c(s, r)
            }
        })
    }
    function h(s, p) {
        if (!p.find("ul").length || !p.find("ul:first li").length) {
            return
        }
        if (p.find("ul:first li").length === 1) {
            p.find(".thumbs").remove()
        }
        if (p.data("loaded")) {
            return
        }
        if (!p.find(".bigs").length) {
            p.find("ul").addClass("bigs")
        }
        var r = g.extend({},
        n);
        if (p.find(".thumbs").length) {
            r.navigMode = "thumbsAndBullets"
        }
        g(l).each(function(u, t) {
            if (p.is(t.selector)) {
                r.forceRatio = typeof t.ratio === "object" ? i(t.ratio) : t.ratio;
                return false
            }
        });
        var q = new window.Slideshow();
        q.initSlideshow("#" + s, r)
    }
    g(function() {
        var p = g.debounce(150,
        function(s, r) {
            j(typeof r === "string" ? r + " " + o: o, "on")
        });
        p();
        window.registerEvent("ajaxContent", p);
        var q = g.debounce(150, m);
        q();
        g(window).on("resize", q);
        window.registerEvent("ajaxContent", q)
    })
})(jQuery);