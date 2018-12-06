var PRODUCT_PAGE_TYPE = "product";
var startDoubleClick = false;
var zoomInitialised = false;
var isProductSheetPage = true;
var isHotstampable = false;
var hsDeactivate = false;
var isMomPage = false;
var topPosition = 0;
var leftPosition = 0;
var fontSize = 0;
var ihsMediaUrl = "";
var maxProductToSave = 16;
var zoomModal;
var SEE_MORE_STATUS = true,
SEE_LESS_STATUS = false;
var THREE_DOTS = "...",
FULL_STOP = ".";
var viewedArticleMomUrl = "";
var countSkusForIeHistory = 0;
var origine;
var product_data = {};
$(function() {
    if ($("#checkStockLevel").length > 0) {
        checkStockLevel($("body").data("size-skus"), $("#checkStockLevel").attr("data-index"))
    }
});
function loadDom() {
    CURRENT_SKU = getSkuHash();
    if (CURRENT_SKU !== DEFAULT_SKU) {
        getAjax(false, "product.jsp", callbackDomSpecificSkuLoad, {
            id: CURRENT_SKU,
            requestingURL: window.location.href
        });
        DEFAULT_SKU = CURRENT_SKU
    } else {
        domIsLoaded()
    }
    $.jStorage.set("lastPageVisited", window.location.href);
    var b = $("#productSheetSlideshow"),
    a = b.find("li").length;
    if (a === 1) {
        b.css({
            "margin-right": "auto",
            "margin-left": "auto",
            "float": "none"
        })
    }
    $(".skiplinks").attr("href", "#" + getSkuHash());
    $("#skiplink").attr("id", getSkuHash())
}
$(document).ready(loadDom);
function getSkuHash() {
    tmpSkuHash = window.location.hash ? window.location.hash.substring(1) : DEFAULT_SKU;
    tmpSkuHash = tmpSkuHash.replace("?", "&");
    return tmpSkuHash
}
function callbackDomSpecificSkuLoad(a) {
    $("#contentWrapper").html(a);
    domIsLoaded();
    fireEvent("specificSkuLoaded", {
        sku: DEFAULT_SKU
    });
    if ($("#productSheetSlideshow.onlyAS").length > 0) {
        loadingImgs("#productSheetSlideshow")
    }
    loadingImgs("#productSheetSlideshow");
    loadingImgs("#productPictures");
    loadingImgs(".navigationSlideshow");
    loadingImgs(".mobileVersion")
}
function domIsLoaded() {
    if (Boolean($.jStorage.get(localStorageUserHasSelectedSize)) === false) {
        $("#size .selected").removeClass("selected")
    }
    DOM_LOADED = true;
    LOADED_DONE = false;
    loaded();
    orangeRightArrowHandler();
    $("body").attr("data-sku", DEFAULT_SKU);
    if ($("#checkStockLevel").length > 0 && $("#size").length == 0) {
        $("body").attr("data-size-skus", DEFAULT_SKU)
    }
    product_data.product_sku = DEFAULT_SKU;
    if ($("#checkStockLevel").length > 0) {
        if ($("#size").length > 0) {
            checkStockLevel($("body").data("size-skus"), $("#checkStockLevel").attr("data-index"))
        } else {
            checkStockLevel(DEFAULT_SKU, $("#checkStockLevel").attr("data-index"))
        }
    }
}
function specificLoadingEventProduct() {
    loadAjaxDom("#helpPopin", "helpPopin.jsp", callbackHelpPopinLoaded);
    handlesImagesClasses();
    if (ihsMediaUrl != "" && ihsMediaUrl != null) {
        getOriginalWidthOfImg()
    }
    if (isMomPage) {
        launchMom()
    }
    $(".slideshow img").show();
    loadingImgs();
    endImageLoadedCallback();
    registerEvent("endImagesLoad", endImageLoadedCallback);
    share();
    addListenerOpener();
    sizeContentPopupImg();
    if ($("#checkStockLevel").length > 0) {
        $(window).on("getStockSuccess.forbuild",
        function(l, k) {
            if ($("ul#size").length > 0) {
                buildSizeSelect(k);
                $(window).off("getStockSuccess.forbuild")
            }
        })
    }
    if ($(".toBeHide.showroom").length > 0) {
        $(".toBeHide.showroom").show();
        var f = $('<select class="showroomSize"></select>');
        var j = $("#size li");
        var b = $("#size").attr("data-selectedvalue");
        var c = $('<option value="sizeNoChoice" selected="selected" disabled="disabled">' + CONFIGURATION.SIZE_SELECT_DEFAULT_TEXT + "</option>");
        f.append(c);
        var d = false;
        j.each(function() {
            var k = $(this).attr("data-sku");
            if (!d && $(this).attr("data-skuSubType") === "perfume") {
                d = true
            }
            var l = $("<option>" + $(this).find("span").text() + "</option>");
            l.text(l.text());
            l.addClass("sizeOutOfStock");
            $.each(this.attributes,
            function() {
                if (this.specified && this.name != b) {
                    l.attr(this.name, this.value)
                }
            });
            l.attr("value", k);
            f.append(l).attr("id", "size").addClass(CONFIGURATION.tagChangeClass)
        });
        $("#size").after(f);
        $("#size").remove();
        if (d && j.length < 2) {
            $("#size").css("display", "none");
            $("#sizeAvailableList").css("display", "none")
        }
        if (d) {}
    }
    $("#sizeAvailableList select").change(function() {
        var l = $(this);
        var k = l.find("option:selected").attr("value");
        var m = l.find("option:selected").attr("data-skuSubType");
        $(".sku").text(k);
        if (m === "perfume") {
            gotoOtherSku(k);
            $("#skuIdAddToCart").attr("value", k);
            $("#addToCartSubmit").attr("data-sku", k);
            $("#addToWishListFormSkuId").attr("value", k);
            $("#addToGiftListSubmit").attr("data-sku", k)
        }
    });
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        $("#allImagesCompleteTheLook").addClass("contentPanel")
    }
    bindDoubleTap();
    document.addEventListener("keyup",
    function(k) {
        if (k.keyCode == 27) {
            $("#closeButtonIMZoomer").click();
            $("#" + origine).focus()
        }
    });
    buildModelSizeSelect();
    if (is_touch_device()) {
        $(".zoomInIcon").show()
    }
    bindModelSizeSelector();
    registerEvent("windowResize", productSheetResizeHandler);
    registerEvent("leave-MediumLarge-breakpoint", productSheetHandleEnterAS);
    registerEvent("leave-AllSmall-breakpoint", productSheetHandleEnterML);
    expandProductDesc();
    handlePaletteRollOver();
    buildProductViewedArticles();
    var h = $.jStorage.get("viewedProductArray"),
    e = h ? h.length: 0,
    a = e > 0 ? h[e - 1].sku: -1;
    if (product_data.product_sku !== a) {
        saveProductViewedArticles()
    } else {
        var g = setInterval(function() {
            if (product_data.product_sku !== a) {
                saveProductViewedArticles();
                clearInterval(g)
            }
        },
        100)
    }
    openMoreChoicePanel();
    initSliders();
    viewedArticlesTagManagement("viewedArticles");
    initMoreChoicesPanelEvent();
    handleMoreChoicesPanel();
    handleMoreChoicesBtnArrow();
    handleModalResizing();
    goTopProductPage()
}
function isPageReloaded() {
    return window.location.href === ($.jStorage.get(localStorageCurrentUrl))
}
function specificResizeEvent() {
    $(".imageContainer img").addClass("postLoaderResponsive");
    if (RESPONSIVE_MANAGER.isMediumLargeMode()) {
        showPriceButton()
    }
    handlesImagesClasses()
}
function sizeContentPopupImg() {
    if ($("#sizeGuidePopupContent, #sizeCompareViewPopupContent").length > 0) {
        var a = $("#sizeGuidePopupContent, #sizeCompareViewPopupContent").find(".postLoaderResponsive");
        a.attr("src", a.attr("data-src")).removeClass("postLoadImage").removeAttr("data-src")
    }
}
function addOutOfStockLabel(a) {
    $("#size option").each(function() {
        if ($(this).attr("data-sku") == a) {
            $(this).addClass("sizeOutOfStock").attr("disabled", "disabled");
            $(this).text($(this).text() + " - " + CONFIGURATION.SIZE_OUT_OF_STOCK_LABEL)
        }
    })
}
function buildModelSizeSelect() {
    var b = $("<select></select>");
    var a = $("#modelSize li");
    var c = $("#modelSize").attr("data-selectedvalue");
    a.each(function() {
        var d = $("<option>" + $(this).find("span").text() + "</option>");
        $.each(this.attributes,
        function() {
            if (this.specified && (this.name !== c || this.name == c && this.value == c)) {
                d.attr(this.name, this.value)
            }
        });
        b.append(d).attr("id", "modelSize").addClass(CONFIGURATION.tagChangeClass)
    });
    $("#modelSize").after(b);
    $("#modelSize").remove()
}
var selectedOpt = "";
function buildSizeSelect(a) {
    var h = $("<select></select>");
    var j = $("#size li");
    var e = $("#size").attr("data-selectedvalue");
    var f = $('<option value="sizeNoChoice" selected="selected" disabled="disabled">' + CONFIGURATION.SIZE_SELECT_DEFAULT_TEXT + "</option>");
    var b = false;
    h.append(f);
    var g = false;
    j.each(function() {
        b = false;
        if (!g && $(this).attr("data-skuSubType") === "perfume") {
            g = true
        }
        var m = $(this).attr("data-sku");
        var l = $("li.selected");
        var k = l.index(l);
        var n = $("<option>" + $(this).find("span").text() + "</option>");
        if (typeof a[m] !== "undefined") {
            if (a[m]["inStock"]) {
                b = true
            }
        }
        if (!b) {
            n.text(n.text() + " - " + CONFIGURATION.SIZE_OUT_OF_STOCK_LABEL);
            n.addClass("sizeOutOfStock")
        }
        $.each(this.attributes,
        function() {
            if (this.specified && this.name != e) {
                n.attr(this.name, this.value)
            }
        });
        n.attr("value", m);
        h.append(n).attr("id", "size").addClass(CONFIGURATION.tagChangeClass)
    });
    $("#size").after(h);
    $("#size").remove();
    if (g && j.length < 2) {
        $("#size").css("display", "none");
        $("#sizeAvailableList").css("display", "none")
    }
    $("#skuIdAddToCart").attr("value", "sizeNoChoice");
    if (window.location.hash || $("#size option.selected").length > 0) {
        var c = $("#size"),
        d = $("option.selected", c);
        if (d.length > 0) {
            d.prop("selected", true)
        } else {
            c.val(DEFAULT_SKU)
        }
        $("#skuIdAddToCart").val(c.val())
    } else {
        if (g) {}
    }
    $("#sizeAvailableList select").change(function(m) {
        var l = $(this);
        var k = l.find("option:selected").attr("value");
        $(".sku").text(k);
        if (DEFAULT_SKU === k && $("#skuIdAddToCart").attr("value") === k) {
            return
        }
        gotoOtherSku(k);
        $("#skuIdAddToCart").attr("value", k);
        $("#addToCartSubmit").attr("data-sku", k);
        $("#addToWishListFormSkuId").attr("value", k);
        $("#addToGiftListSubmit").attr("data-sku", k)
    })
}
function bindDoubleTap() {
    var b = /android|iphone|ipad/i.test(navigator.userAgent.toLowerCase()),
    a = b ? "touchstart": "click";
    window.eventScrollEvent = false;
    $(window).on("iscroll:Scroll",
    function() {
        if (window.eventScrollEvent !== false) {
            clearTimeout(window.eventScrollEvent)
        }
    });
    $("#productSheetSlideshow img, #productPictures img").on(a,
    function(d) {
        origine = $(this).prev(".zoomInIcon").attr("id");
        var c = this;
        if (window.eventScrollEvent !== false) {
            clearTimeout(window.eventScrollEvent)
        }
        if ($(d.target).closest("ul").hasClass("scene-enabled")) {
            window.eventScrollEvent = setTimeout(function() {
                handleDoubleTap(a, $(c).attr("data-src").match(/--(.+)\./)[1])
            },
            500)
        } else {
            window.eventScrollEvent = setTimeout(function() {
                IMZoomer($("#akamaiViewer")[0], d)
            },
            500)
        }
    });
    $("#productSheetSlideshow .zoomInIcon, #productPictures .zoomInIcon").on(a,
    function(d) {
        origine = $(this).attr("id");
        var c = this;
        if (window.eventScrollEvent !== false) {
            clearTimeout(window.eventScrollEvent)
        }
        if ($(d.target).closest("ul").hasClass("scene-enabled")) {
            window.eventScrollEvent = setTimeout(function() {
                handleDoubleTap(a, $(c).attr("data-src"))
            },
            500)
        } else {
            window.eventScrollEvent = setTimeout(function() {
                IMZoomer($("#akamaiViewer")[0], d)
            },
            500)
        }
    });
    $("#productSheetSlideshow .displayOnFocus").on("click",
    function(d) {
        var c = $(this).closest("li").children("img").attr("data-src").match(/--(.+)\./)[1];
        launchZoomModal(c);
        $(".zoomProductSheet").find(".closeButton").focus();
        closeZoomModal()
    })
}
function extractHostname(b) {
    var a;
    if (b.indexOf("://") > -1) {
        a = b.split("/")[2]
    } else {
        a = b.split("/")[0]
    }
    a = a.split(":")[0];
    a = a.split("?")[0];
    return a
}
function changeDimensions(a) {
    a = a.split("?")[0];
    return a
}
function IMZoomer(k, a) {
    $(".page").hide();
    var o = document.body.clientHeight;
    var c = document.body.clientWidth;
    var d = o * 100 / c;
    var n = extractHostname(SCENE7_URL);
    var m = [];
    if ($(a.target).closest("li").length) {
        var b = changeDimensions($(a.target).closest("li").find("img").attr("src")).replace(/\s/g, "%20")
    } else {
        var b = changeDimensions($(a.target).attr("src")).replace(/\s/g, "%20")
    }
    m.push({
        type: "image",
        url: b,
        tags: ["default"]
    });
    var j = new Akamai.Viewer(k, {
        carousel: {
            arrows: false,
            aspectratio: d,
            thumbnail: {
                placement: "bottom",
                type: "images"
            }
        },
        magnifier: {
            mode: "animatedzoom",
            incrementalZoomFactor: 2,
            magnification: 2.6,
            animationDuration: 800
        },
        items: {
            data: m,
            hostnames: [n]
        }
    });
    $(".scroller-zoom-in, .scroller-zoom-out").attr("role", "button");
    $(".snapper_pane.enlarge_pane").removeAttr("tabindex");
    var q = '<button type="button" aria-label="' + CONFIGURATION.CLOSE_LABEL + '" class="close-button" id="closeButtonIMZoomer">';
    q += '<svg aria-hidden="true" focusable="false" width="22px" height="22px" viewBox="0 0 12.48 12" role="img">';
    q += '<path style="fill-rule:evenodd;clip-rule:evenodd;fill:#464646;" d="M8.641,3.345H9.12V2.88H8.641V3.345z M8.625,3.36H8.16v0.465			h0.465V3.36z M7.681,4.305h0.465V3.84H7.681V4.305z M7.2,4.785h0.465V4.32H7.2V4.785z M7.186,4.8H6.721v0.465h0.465V4.8z			 M6.705,5.28h-0.93v0.465h0.93V5.28z M9.135,2.865h0.466V2.4H9.135V2.865z M12,0h-0.465v0.465H12V0z M10.559,1.441h-0.465v0.465			h0.465V1.441z M11.037,0.963h-0.465v0.465h0.465V0.963z M11.521,0.481h-0.465v0.465h0.465V0.481z M9.615,2.385h0.465V1.92H9.615			V2.385z M5.276,6.709h0.465V6.244H5.276V6.709z M3.855,8.145H4.32V7.68H3.855V8.145z M3.36,8.625h0.465V8.16H3.36V8.625z			 M2.88,9.105h0.465V8.64H2.88V9.105z M2.4,9.585h0.465V9.12H2.4V9.585z M1.92,10.065h0.465V9.6H1.92V10.065z M1.44,10.545h0.465			V10.08H1.44V10.545z M0.96,11.025h0.465V10.56H0.96V11.025z M4.335,7.665H4.8V7.2H4.335V7.665z M4.815,7.185H5.28V6.72H4.815			V7.185z M2.88,3.345h0.465V2.88H2.88V3.345z M3.375,3.825H3.84V3.36H3.375V3.825z M3.855,4.305H4.32V3.84H3.855V4.305z			 M4.335,4.785H4.8V4.32H4.335V4.785z M5.28,4.8H4.815v0.465H5.28V4.8z M5.76,5.28H5.295v0.465H5.76V5.28z M2.4,2.865h0.465V2.4			H2.4V2.865z M0.465,0H0v0.465h0.465V0z M1.442,1.906h0.465V1.441H1.442V1.906z M0.963,1.428h0.465V0.963H0.963V1.428z			 M0.945,0.481H0.48v0.465h0.465V0.481z M1.92,2.385h0.465V1.92H1.92V2.385z M6.725,6.244H6.259v0.465h0.466V6.244z M7.681,8.145			h0.465V7.68H7.681V8.145z M8.175,8.625h0.466V8.16H8.175V8.625z M8.655,9.105H9.12V8.64H8.655V9.105z M9.135,9.585h0.466V9.12			H9.135V9.585z M9.615,10.065h0.465V9.6H9.615V10.065z M10.096,10.545h0.465V10.08h-0.465V10.545z M10.575,11.025h0.465V10.56			h-0.465V11.025z M7.2,7.665h0.465V7.2H7.2V7.665z M6.721,7.185h0.465V6.72H6.721V7.185z M5.76,6.225h0.945V5.76H5.76V6.225z			 M3.825,2.88H3.36v0.465h0.465V2.88z M3.855,3.825H4.32V3.36H3.855V3.825z M4.335,4.305H4.8V3.84H4.335V4.305z M5.28,4.32H4.815			v0.465H5.28V4.32z M5.76,4.8H5.295v0.465H5.76V4.8z M2.88,2.865h0.465V2.4H2.88V2.865z M0.945,0H0.48v0.465h0.465V0z M1.922,1.906			h0.465V1.441H1.922V1.906z M1.444,1.428h0.465V0.963H1.444V1.428z M1.425,0.481H0.96v0.465h0.465V0.481z M2.4,2.385h0.465V1.92			H2.4V2.385z M6.739,6.709h0.465V6.244H6.739V6.709z M8.625,7.68H8.16v0.465h0.465V7.68z M8.655,8.625H9.12V8.16H8.655V8.625z			 M9.136,9.105h0.465V8.64H9.136V9.105z M9.615,9.585h0.465V9.12H9.615V9.585z M10.096,10.065h0.465V9.6h-0.465V10.065z			 M10.575,10.545h0.465V10.08h-0.465V10.545z M11.521,10.56h-0.465v0.466h0.465V10.56z M7.681,7.665h0.465V7.2H7.681V7.665z			 M7.2,7.185h0.465V6.72H7.2V7.185z M12.005,11.044h-0.466v0.461h-0.015v-0.461H11.06v0.465h0.461v0.461h0.465v-0.461h0.016v0.461			h0.465v-0.465h-0.461V11.044z M9.136,3.345h0.465V2.88H9.136V3.345z M9.105,3.36H8.641v0.465h0.465V3.36z M8.625,3.84H8.16v0.465			h0.465V3.84z M7.681,4.785h0.465V4.32H7.681V4.785z M7.2,5.265h0.465V4.8H7.2V5.265z M7.186,5.28H6.721v0.465h0.465V5.28z			 M9.615,2.865h0.465V2.4H9.615V2.865z M12.016,0v0.465h0.465V0H12.016z M11.039,1.441h-0.465v0.465h0.465V1.441z M11.517,0.963			h-0.465v0.465h0.465V0.963z M12,0.481h-0.465v0.465H12V0.481z M10.096,2.385h0.465V1.92h-0.465V2.385z M5.756,6.709h0.465V6.244			H5.756V6.709z M4.335,8.145H4.8V7.68H4.335V8.145z M3.84,8.625h0.465V8.16H3.84V8.625z M3.36,9.105h0.465V8.64H3.36V9.105z			 M2.88,9.585h0.465V9.12H2.88V9.585z M2.4,10.065h0.465V9.6H2.4V10.065z M1.92,10.545h0.465V10.08H1.92V10.545z M1.44,11.025			h0.465V10.56H1.44V11.025z M4.815,7.665H5.28V7.2H4.815V7.665z M5.295,7.185H5.76V6.72H5.295V7.185z M0.956,11.505H0.941v-0.461			H0.476v0.461H0.015v0.465H0.48v-0.461h0.015v0.461H0.96v-0.461h0.461v-0.465H0.956V11.505z"></path>';
    q += "</svg>";
    q += "</button>";
    $("#akamaiViewer").prepend(q);
    var p = '<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 512 512"  preserveAspectRatio="xMidYMid meet" class="currentColor" role="img">';
    p += '<path d="M484.824 224.797v62.406q0 13.002-9.1 22.103-9.102 9.1-22.103 9.1H318.407v135.215q0 13.001-9.101 22.102t-22.103 9.101h-62.406q-13.002 0-22.103-9.1-9.1-9.102-9.1-22.103V318.407H58.378q-13.001 0-22.102-9.101t-9.101-22.103v-62.406q0-13.002 9.1-22.103 9.102-9.1 22.103-9.1h135.214V58.378q0-13.001 9.101-22.102t22.103-9.101h62.406q13.002 0 22.103 9.1 9.1 9.102 9.1 22.103v135.214h135.215q13.001 0 22.102 9.101t9.101 22.103z" fill="#666"/>';
    p += "</svg>";
    $(".scroller-zoom-in").attr("aria-label", CONFIGURATION.ALT_ZOOM_IN).html(p);
    $(".scroller-zoom-in").removeAttr("title");
    var l = '<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 512 512"  preserveAspectRatio="xMidYMid meet" class="currentColor" role="img">';
    l += '<path xmlns="http://www.w3.org/2000/svg" d="M484.824 224.797v62.406q0 13.002-9.1 22.103-9.102 9.1-22.103 9.1H58.379q-13.001 0-22.102-9.1-9.101-9.101-9.101-22.103v-62.406q0-13.002 9.1-22.103 9.102-9.1 22.103-9.1h395.242q13.001 0 22.102 9.1 9.101 9.101 9.101 22.103z"/>';
    l += "</svg>";
    $(".scroller-zoom-out").attr("aria-label", CONFIGURATION.ALT_ZOOM_OUT).html(l);
    $(".scroller-zoom-out").removeAttr("title");
    var f = '<button type="button" aria-label="' + CONFIGURATION.ALT_ZOOM_RESET + '" id="resetZoomButton" class="resetZoomButton">';
    f += '<svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 512 512"  preserveAspectRatio="xMidYMid meet" class="currentColor" role="img">';
    f += '<path xmlns="http://www.w3.org/2000/svg" d="M485.395 256q0 46.624-18.199 89.019t-48.977 73.172q-30.78 30.777-73.174 48.98-42.395 18.202-89.018 18.252-51.386 0-97.69-21.678-46.305-21.677-78.847-61.076-2.088-2.998-1.981-6.744.106-3.747 2.57-6.104l40.896-41.215q2.998-2.679 7.494-2.679 4.763.59 6.85 3.589 21.841 28.37 53.477 43.892 31.635 15.522 67.23 15.524 31.048 0 59.256-12.097 28.209-12.097 48.872-32.707 20.662-20.61 32.706-48.818 12.044-28.209 12.098-59.308.053-31.1-12.098-59.31-12.15-28.21-32.706-48.818-20.556-20.608-48.87-32.707-28.313-12.099-59.257-12.097-29.28 0-56.152 10.6-26.873 10.6-47.8 30.296l40.894 41.216q9.261 8.993 4.176 20.61-5.03 11.99-17.61 11.99H45.713q-7.76 0-13.436-5.674-5.676-5.675-5.673-13.437V64.85q0-12.578 11.936-17.663 11.67-5.086 20.61 4.175l38.86 38.54q31.958-30.137 73.014-46.731t85.003-16.594q46.57 0 89.018 18.254t73.174 48.978q30.725 30.724 48.977 73.174 18.253 42.45 18.2 89.017z" />';
    f += "</svg>";
    f += "</button>";
    $("#akamaiViewer").find(".scroller-zoom-out").after(f);
    $("#resetZoomButton").on("click",
    function() {
        setTimeout(function() {
            $("#akamaiViewer").find(".scroller-zoom-out")[0].click();
            setTimeout(function() {
                $("#akamaiViewer").find(".scroller-zoom-out")[0].click()
            },
            j._options.magnifier.animationDuration + 50)
        },
        50)
    });
    var h = '<div id="deviceTypeIcon" class="deviceTypeIcon"></div>';
    $("#akamaiViewer").prepend(h);
    var e = $("#deviceTypeIcon");
    setTimeout(function() {
        e.addClass("fadeOut");
        e.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
        function(r) {
            e.remove()
        });
        $("#closeButtonIMZoomer").focus()
    },
    2000);
    var g = function() {
        $("#closeButtonIMZoomer").off("click", g);
        $("#akamaiViewer").remove();
        $('<div data-akamai-viewer id="akamaiViewer" role="dialog" aria-label="' + CONFIGURATION.ALT_ZOOM_PRODUCT + '"></div>').insertAfter(".page");
        $(".page").show();
        m = [];
        $("#" + origine).focus();
        rebuildSlidersAfterModalClose()
    };
    $("#closeButtonIMZoomer").on("click", g);
    bigVideoProductWidth = $("#fcplayer").width();
    bigVideoProductHeight = $("#fcplayer").height()
}
function handleDoubleTap(b, a) {
    if (b === "touchstart") {
        startDoubleClick = true;
        if (startDoubleClick) {
            launchZoomModal(a);
            setTimeout(function() {
                startDoubleClick = false
            },
            500)
        }
        setTimeout(function() {
            startDoubleClick = false
        },
        500)
    } else {
        launchZoomModal(a)
    }
}
function launchZoomModal(a) {
    zoomModal = new modal();
    zoomModal.dataId = "s7viewer";
    zoomModal.dataImgId = a;
    zoomModal.dataClass = "zoomProductSheet";
    zoomModal.dataHeight = "100%";
    zoomModal.fullWxfullH = true;
    zoomModal.callbackAfterOpen = callbackAfterOpenZoomModal;
    zoomModal.callbackBeforeClose = callbackBeforeCloseZoomModal;
    zoomModal.callbackBeforeOpen = callbackBeforeOpenZoomModal;
    zoomModal.open();
    $(".page").css("display", "none");
    var b = $("#infoProductBlockTop #productName h1").text();
    setTimeout(function() {
        $("#s7viewer_zoomView div div + div canvas").append("<span class='fallback'>" + b + " - Zoom</span>")
    },
    1000);
    bigVideoProductWidth = $("#fcplayer").width();
    bigVideoProductHeight = $("#fcplayer").height()
}
function callbackBeforeOpenZoomModal() {}
function callbackBeforeCloseZoomModal() {
    resetFullscreen();
    zoomInitialised = false;
    fireEvent("ResetZoom");
    loadingImgs();
    $(".page").css("display", "block")
}
function callbackAfterOpenZoomModal() {
    var a = new s7viewers.BasicZoomViewer();
    a.setContainerId("s7viewer");
    a.setParam("serverurl", SCENE7_URL);
    a.setAsset(SCENE7_ACCOUNT + "/" + zoomModal.dataImgId);
    a.init();
    zoomInitialised = true;
    fireEvent("Zoom");
    window.resetFullscreen = function() { (function(b) {
            b.cancelFullScreen()
        })(a.container);
        restoreBigVideoDimensionsAfterZoomer()
    }
}
function closeZoomModal() {
    if (zoomInitialised) {
        $(".zoomProductSheet").find(".closeButton").click()
    }
}
function productSheetHandleEnterML() {}
function productSheetHandleEnterAS() {
    setTimeout(loadingImgs, 500)
}
function handlesImagesClasses() {
    if (RESPONSIVE_MANAGER.isMediumLargeMode()) {
        $(".imageContainer img").addClass("postLoaderResponsive")
    }
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        $(".slideshow img").addClass("postLoaderResponsive");
        loadingImgs(".slideshow")
    }
}
function endImageLoadedCallback(a) {
    buildSlideshow()
}
function buildSlideshow() {
    var a = $(".slideshow");
    if (a.find("li").length > 1) {
        var c = a.attr("id");
        var a = new Slideshow();
        a.callBackEndScroll = function() {
            fireEvent("slideshowNavigateEvent")
        };
        var b = new SlideshowOption();
        b.navigMode = "bullets";
        b.displayArrows = false;
        b.allowVerticalScroll = true;
        a.initSlideshow("#" + c, b);
        if (isBeforeIE10) {
            if (typeof addCallBackEndScrollHotStamping == "function") {
                addCallBackEndScrollHotStamping()
            }
        } else {
            fireEvent("slideshowInitialized")
        }
    }
}
var NAVIGATION_HEIGHT;
function getNavigationHeigt() {
    if (NAVIGATION_HEIGHT) {
        return NAVIGATION_HEIGHT
    }
    var a = Slideshow.getBulletNavigationElement(1, null);
    a.css("visibility", "hidden").css("position", "absolute").css("top", "-999px");
    $("body").append(a);
    NAVIGATION_HEIGHT = a.height() + parseInt(a.css("margin-top"));
    a.remove();
    return NAVIGATION_HEIGHT
}
function setProductSheetSlideshowMaxWidth() {
    if ($("#productSheetSlideshow").length != 0) {
        var b = Math.min($(window).height() - $("#productSheetSlideshow").offset().top - getNavigationHeigt(), $(window).width());
        var a = Math.min($(window).height() - getNavigationHeigt(), $(window).width());
        if (isAndroid) {
            $(".bigs img").css("max-width", a);
            $("#productSheetSlideshow").css("max-width", a)
        } else {
            $(".bigs img").css("max-width", b);
            $("#productSheetSlideshow").css("max-width", b)
        }
    }
}
function openPanel() {
    var a = $(this);
    var b = a.next(".contentPanel");
    changeArrowPanelOpener(a, b);
    b.slideToggle()
}
function changeArrowPanelOpener(a, c) {
    var b = a.find(".arrowPanelWrapper img");
    if (c.css("display") == "block") {
        b.attr("src", CONFIGURATION.TECH_ASSETS_PATH + "store/arrow_right.png")
    } else {
        b.attr("src", CONFIGURATION.TECH_ASSETS_PATH + "store/arrow_bottom.png")
    }
}
function showPriceButton() {
    $(".priceButton").css("visibility", "visible");
    orangeRightArrowHandler()
}
function addListenerOpener() {
    $("#shareButton button").not(".shareBinded").click(openSharingBubbleProductSheet).addClass("shareBinded")
}
function openSharingBubbleProductSheet() {
    getUrlBitly();
    SharingBubble.openSharingBubble("#sharingBubble")
}
function share() {
    shareListener();
    $(".share-mail").on("click",
    function() {
        shareByMail()
    })
}
function retrieveImageData(a) {
    return $("#informations").attr("data-src-" + a)
}
function handleContentAfterFullscreen() {
    setTimeout(function() {
        $("body, html").css("overflow", "hidden")
    },
    100)
}
function HsOptionsFunctionWishlist() {
    $("#addPersonalizedItemToGiftlist").attr("disabled", true);
    $("#addItemToGiftlist").attr("disabled", true);
    var a = $("#HSOptionsFormId").serializeObject();
    if (a.initials == "" && a.dateLib == "") {
        $("#addItemToGiftlist").attr("disabled", false);
        $("#tableHsOptionsWishlist").attr("value", "")
    } else {
        $("#addPersonalizedItemToGiftlist").attr("disabled", false);
        var b = JSON.stringify(a);
        $("#tableHsOptionsWishlist").attr("value", b)
    }
}
function MomOptionsFunctionWishlist() {
    $("#addPersonalizedItemToGiftlist").attr("disabled", true);
    $("#addItemToGiftlist").attr("disabled", true);
    var c = $("#ruleId").val();
    if (c != null && c.length > 0) {
        $("#addPersonalizedItemToGiftlist").attr("disabled", false);
        var b = $("#momOptionsFormId").serializeObject();
        var a = JSON.stringify(b);
        $("#tableMomOptionsWishlist").attr("value", a)
    } else {
        $("#addItemToGiftlist").attr("disabled", false);
        $("#tableMomOptionsWishlist").attr("value", "")
    }
}
function adaptWishlistModalPosition(a) {
    if (isSmartphoneMode()) {
        var b = $(a).offset().top
    }
}
var BACK_BUTTON_PRESSED = false;
function redirectBackButton() {
    $.jStorage.set(localStorageSkuToScroll, DEFAULT_SKU);
    $.jStorage.set(localStorageShouldScrollToSku, "true");
    localStorage.setItem(localStorageSkuToScroll, DEFAULT_SKU);
    localStorage.setItem(localStorageShouldScrollToSku, true);
    setTimeout(function() {
        goBack()
    },
    100)
}
function bindModelSizeSelector() {
    $("#modelSizeList select").change(function() {
        var b = $(this);
        var a = b.find("option:selected").val();
        a = $.trim(a);
        if (a != null) {
            window.location = a
        }
    })
}
function preValidationSkuSize() {
    if ($("#skuIdAddToCart").attr("value") == "sizeNoChoice") {
        return "error error"
    }
}
function preValidationSkuSizeWishlist() {
    if ($("#skuIdAddToWishlist").attr("value") == "sizeNoChoice") {
        return "error error"
    }
}
function gotoOtherSku(a, b) {
    if ($("#size").length > 0) {
        $.jStorage.set(localStorageUserHasSelectedSize, document.getElementById("size").value !== "sizeNoChoice")
    }
    changesku = true;
    window.location.hash = a;
    loadDom();
    setTimeout(function() {
        loadCarouselProductPage();
        centerVertical();
        if (b === undefined && $(".loadVideo").length > 0) {
            loadVideos()
        }
    },
    850)
}
function viewedArticlesTagManagement(b) {
    var a = $("#viewedArticlesContainer li a.visualContainer");
    a.each(function(c) {
        tagID = b + "_" + c;
        $(this).attr("id", tagID);
        $(this).attr("data-detail", c);
        $(this).attr("data-evt-position-number", c)
    })
}
Array.prototype.insert = function(a, b) {
    this.splice(a, 0, b)
};
Array.prototype.remove = function(a) {
    return this.splice(a, 1)[0]
};
Array.prototype.move = function(b, a) {
    this.insert(a, this.remove(b))
};
function saveProductViewedArticles() {
    var c, h, g, f, e;
    c = product_data.product_sku;
    h = $.trim($("#infoProductBlockTop .productName :first-child").text());
    g = $.trim($(".priceValue").text());
    f = $(location).attr("href");
    if (isMomPage) {
        e = viewedArticleMomUrl
    } else {
        e = packshotPictureUrl
    }
    var k = {
        name: h,
        price: g,
        url: f,
        imageUrl: e,
        sku: c
    };
    var a = $.jStorage.get("viewedProductArray") || [];
    var j = $.jStorage.get("lastViewedProduct") || 0;
    var d = checkProductAlreadyExist(a, k);
    if (d != -1) {
        var b = a.remove(d);
        if (d < j) {
            a.insert(j - 1, b)
        } else {
            a.insert(j, b);
            incrementLastViewedProduct(j)
        }
    } else {
        a[j] = k;
        incrementLastViewedProduct(j)
    }
    $.jStorage.set("viewedProductArray", a)
}
function incrementLastViewedProduct(a) {
    a = (a == maxProductToSave - 1) ? 0 : a + 1;
    $.jStorage.set("lastViewedProduct", a)
}
function checkProductAlreadyExist(c, b) {
    if (typeof c !== "undefined" && c.length > 0) {
        for (var a = 0; a < c.length; a++) {
            if (c[a].sku == b.sku) {
                return a
            }
        }
    }
    return - 1
}
function buildProductViewedArticles() {
    var d = $.jStorage.get("viewedProductArray") || [];
    var e = $.jStorage.get("lastViewedProduct") || 0;
    var g = $("#viewedArticles");
    var a = $("#viewedArticlesWrapper");
    var b = $("#viewedArticlesContainer li");
    if (! (b.length > 0)) {
        var f = $('<ul id="viewedArticlesContainer" class="sliderRespContainer"></ul>');
        if (!d.length > 0) {
            g.addClass("hide");
            return
        }
        g.removeClass("hide");
        if (d[e]) {
            for (var c = e; c < d.length; c++) {
                addProductInfo(f, d[c])
            }
        }
        for (var c = 0; c < e; c++) {
            addProductInfo(f, d[c])
        }
        a.append(f)
    }
}
function addProductInfo(a, b) {
    a.prepend($("#viewArticleTemplate").tmpl(b))
}
var slidersReponsive = {
    discoverTheFamilyContainer: {},
    youMayAlsoLikeContainerAS: {},
    viewedArticlesContainer: {}
};
function getResponsiveSliderIds() {
    return Object.keys(slidersReponsive)
}
function getResponsiveSlideFromIndex(a) {
    return slidersReponsive[getResponsiveSliderIds()[a]]
}
for (var i = 0; i < getResponsiveSliderIds().length; i++) {
    getResponsiveSlideFromIndex(i)["sliderObject"] = new SliderResponsive();
    getResponsiveSlideFromIndex(i)["sliderOptions"] = {}
}
slidersReponsive.viewedArticlesContainer["sliderOptions"].specificClass = "viewedArticles";
var wWidth = $(window).width();
if (wWidth < 768) {
    slidersReponsive.viewedArticlesContainer["sliderOptions"].responsiveMode = true
} else {
    slidersReponsive.viewedArticlesContainer["sliderOptions"].responsiveMode = false
}
slidersReponsive.youMayAlsoLikeContainerAS["sliderOptions"].responsiveMode = true;
slidersReponsive.discoverTheFamilyContainer["sliderOptions"].responsiveMode = true;
function buildSlider(c, b, a) {
    c.buildSlider("#" + b, a)
}
function initSliders() {
    for (var a = 0; a < getResponsiveSliderIds().length; a++) {
        buildSlider(getResponsiveSlideFromIndex(a)["sliderObject"], getResponsiveSliderIds()[a], getResponsiveSlideFromIndex(a)["sliderOptions"])
    }
    loadingImgs()
}
function refreshAllSliders() {
    for (var a = 0; a < getResponsiveSliderIds().length; a++) {
        if ($("#" + getResponsiveSliderIds()[a]).length > 0) {
            getResponsiveSlideFromIndex(a)["sliderObject"].refreshSlider("#" + getResponsiveSliderIds()[a], getResponsiveSlideFromIndex(a)["sliderOptions"])
        }
    }
}
function rebuildSlidersAfterModalClose() {
    if (CONFIGURATION.pageType == PRODUCT_PAGE_TYPE && !isIE_InfEq8) {
        refreshAllSliders();
        loadingImgs()
    }
}
function productSheetResizeHandler() {
    handleModalResizing();
    orangeRightArrowHandler();
    refreshAllSliders()
}
String.prototype.countCharOccurence = function(a) {
    return this.split(a).length - 1
};
function expandProductDesc() {
    switch (CONFIGURATION.STORE_LANG) {
    case "jpn-jp":
    case "zht-tw":
    case "kor-kr":
    case "zht-hk":
    case "zhs-cn":
        break;
    default:
        var e = $.trim($("#productDescriptionSeeMore").html());
        var d = e.countCharOccurence(FULL_STOP);
        if (d > 1) {
            var c = SEE_MORE_STATUS;
            var e = $.trim($("#productDescriptionSeeMore").html());
            var d = e.countCharOccurence(FULL_STOP);
            var b = e.indexOf(FULL_STOP);
            var a = $.trim($("#productDescriptionSeeMore").html()).substring(0, b).split(" ").slice(0, -1).join(" ") + THREE_DOTS;
            $("#productDescriptionSeeMore").html(a);
            $("#seeMore").css("display", "block");
            $("#seeMore").on("click",
            function() {
                if (c == SEE_MORE_STATUS) {
                    $("#productDescriptionSeeMore").html(e);
                    c = SEE_LESS_STATUS;
                    $("#seeMore").fadeOut("fast");
                    $("#seeLess").fadeIn("slow")
                }
            });
            $("#seeLess").on("click",
            function() {
                if (c == SEE_LESS_STATUS) {
                    $("#productDescriptionSeeMore").html(a);
                    c = SEE_MORE_STATUS;
                    $("#seeLess").fadeOut("fast");
                    $("#seeMore").fadeIn("slow")
                }
            })
        }
        break
    }
}
function handlePaletteRollOver() {
    if (!is_touch_device()) {
        var c, b, a;
        var e = $(".paletteContainer.Color");
        var d = $(".paletteContainer.Material");
        if (e.length > 0) {
            c = $.trim(e.prev().find(".paletteTitleValue").text())
        }
        if (d.length > 0) {
            b = $.trim(d.prev().find(".paletteTitleValue").text())
        }
        $("#attributePanelOpenedWrapper .palette a").on("mouseover focus",
        function(f) {
            paletteHeader = $(this).parent().parent().prev().find(".paletteTitleValue");
            a = $.trim($(this).find("img").attr("alt"));
            paletteHeader.html(a)
        });
        $("#attributePanelOpenedWrapper .palette a").on("mouseout focusout",
        function(f) {
            paletteHeader = $(this).parent().parent().prev().find(".paletteTitleValue");
            paletteCurrentValue = $(this).parent().parent().find("img.currentPalette").attr("data-alt");
            paletteHeader.html(paletteCurrentValue)
        })
    }
}
function callbackHelpPopinLoaded() {
    $("#helpPopin .helpPopinContent").each(function() {
        var a = $(this).find(".contentText").html();
        var b = $(this).attr("data-detail");
        $('#clientInfo .textClientInfo[data-id="' + b + '"] .innerContent').html(a)
    })
}
function handleMoreChoicesBtnArrow() {
    var a = $(".expand-moreChoices #moreChoicesBtn"); ($(".moreChoicesWrapper").is(":visible")) ? a.addClass("opened") : a.removeClass("opened")
}
function initMoreChoicesPanelEvent() {
    $(".expand-moreChoices").click(function() {
        $("#moreChoicesBtn").toggleClass("opened");
        $(".moreChoicesWrapper").slideToggle("show");
        if ($("#moreChoicesBtn").hasClass("opened")) {
            $(this).children().attr("aria-expanded", "false").focus()
        } else {
            $(this).children().attr("aria-expanded", "true").focus()
        }
    })
}
function openMoreChoicePanel() {
    $.jStorage.set("openMoreChoicePanel", "true")
}
function handleMoreChoicesPanel() {
    var a = $(".moreChoicesWrapper");
    if ($.jStorage.get("openMoreChoicePanel")) {
        a.show();
        $.jStorage.deleteKey("openMoreChoicePanel")
    } else {
        a.hide()
    }
}
function handleProductPopinPositionWishlist() {
    var a;
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        $(".cartModalHeader").css({
            position: "fixed",
            left: "auto",
            right: "0"
        });
        $(".popinArrowSelected ").hide()
    } else {
        if (RESPONSIVE_MANAGER.isMediumLargeMode() && $("#header-wish").is(":visible")) {
            a = ($("#header-wish").offset().left - $(".cartModalHeader").width()) + 30;
            $(".cartModalHeader").css({
                position: "fixed",
                left: a
            });
            $(".popinArrowSelected ").show()
        } else {
            $(".popinArrowSelected ").fadeOut();
            $(".cartModalHeader").css({
                left: "auto",
                right: "0"
            })
        }
    }
}
function handleProductPopinPositionAddCart() {
    var o = !$(".modal").parents(".modal_addToWishlist").length > 0,
    e = $("body").hasClass("isDesktop"),
    f = ".popinCartOnSmartDevice",
    g = ".popinCartOnDesktop",
    m = ".modal",
    c = ".modal_addTocart",
    n = ".cartModalHeader",
    d = ".popinArrowSelected",
    j = ".popinWrapper",
    h = $("body").hasClass("cs-withtopbanner"),
    k = $(window).scrollTop() == 0,
    l = window.matchMedia("(orientation: landscape)").matches,
    b = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    a = ("ontouchstart" in document.documentElement) ? "touchend": "click";
    if (RESPONSIVE_MANAGER.isAllSmallMode() && o) {
        $(f).removeClass("hide");
        $(g).addClass("hide");
        $(m).removeClass("cartModalHeader");
        $(d).hide();
        $(m).animate({
            top: "14%"
        },
        100);
        $(j).css({
            maxHeight: 470
        });
        if (l) {
            $(m).animate({
                top: 0
            },
            100);
            $(j).css({
                maxHeight: b - 34
            })
        }
    } else {
        if (e) {
            $(g).removeClass("hide");
            if (RESPONSIVE_MANAGER.isMediumLargeMode() && $("#header-cart").is(":visible")) {
                leftPosition = ($("#header-cart").offset().left - $(n).width()) + 35;
                $(n).css({
                    position: "fixed",
                    left: leftPosition,
                    marginLeft: "0px"
                });
                $(d).css({
                    right: "19px"
                }).show();
                if (h && k) {
                    var p = $(".cs_topbanner").innerHeight();
                    $(n).css("top", p)
                }
            }
        } else {
            if (!e && o) {
                $(c).addClass("onSmartDevice");
                $(g).addClass("hide");
                $(f).removeClass("hide");
                $(m).removeClass("cartModalHeader")
            }
        }
    }
    $(document).on(a, ".opacityHandler , .continueShoppingButton", closeAddToCartModal)
}
function goTopProductPage() {
    $(document).ready(function() {
        if ($(".page-type-product").length > 0) {
            $("html, body").animate({
                scrollTop: 0
            },
            "slow");
            setTimeout(function() {
                $("html, body").animate({
                    scrollTop: 0
                })
            },
            500)
        }
    })
}
function handleModalResizing() {
    if ($(".modal_addToWishlist").is(":visible")) {
        handleProductPopinPositionWishlist()
    } else {
        handleProductPopinPositionAddCart()
    }
}
$(document).ready(function() {
    if (navigator.userAgent.match(/(iphone|ipad)/gi)) {
        $("body").addClass("iphone")
    }
}); (function(a) {
    a(function() {
        a(document).on("fcplayer.state.playing fcplayer.state.paused", ".fcplayer",
        function(d) {
            var c = a(this).closest(".push_product_video");
            if (c.length) {
                var b = a(".push_product-description", c);
                if (b.length) {
                    if (/playing/.test(d.namespace)) {
                        b.fadeOut()
                    } else {
                        if (/paused/.test(d.namespace)) {
                            b.fadeIn()
                        }
                    }
                }
            }
        })
    })
})(jQuery);
var bigVideoProductWidth = 0;
var bigVideoProductHeight = 0;
function restoreBigVideoDimensionsAfterZoomer() {
    $("#fcplayer").width(bigVideoProductWidth);
    $("#fcplayer").height(bigVideoProductHeight)
}
correspondingStoreInList = "";
onlyStockAvailable = false;
isStoreStockPopinClosed = false;
usingCurrentLocation = false;
storeStockPopin = true;
var map;
function displayStoresList() {
    $(".locate-results, .locate-filter-availability").show();
    $(".sr-update").append(CONFIGURATION.STORE_LIST_UPDATED);
    setTimeout(function() {
        removeAccessibilityTextUpdate()
    },
    3000)
}
function removeAccessibilityTextUpdate() {
    $(".sr-update").empty()
}
$(document).one("focus", "#locateStoreSearchInput",
function() {
    if ($("head").find("#loadAllStores").length == 0) {
        getAjax(false, "../ajaxsecure/storeLocatorListAllStores.jsp",
        function(a) {
            $("head").append(a)
        })
    }
});
$(document).on("keyup", "#locateStoreSearchInput",
function() {
    if ($(this).val() != "") {
        $("#locateStoreSearchSubmit").removeAttr("disabled")
    } else {
        $("#locateStoreSearchSubmit").attr("disabled", "disabled")
    }
});
$(document).on("click", "#locateCurrentPosition",
function(a) {
    storeStockPopin = true;
    usingCurrentLocation = true;
    $(".locate-map-loader").removeClass("hide");
    handleTargetClick(storeStockPopin)
});
$(document).on("change", "#locateOnlyStoresWithProductAvailable",
function(a) {
    if (this.checked) {
        onlyStockAvailable = true
    } else {
        onlyStockAvailable = false
    }
    $(".locate-map-loader").removeClass("hide");
    displayMapAndListOfStoresFromInput($("#locateStoreSearchInput"), onlyStockAvailable);
    $(".sr-update").append(CONFIGURATION.STORE_LIST_UPDATED);
    setTimeout(function() {
        removeAccessibilityTextUpdate()
    },
    3000)
});
$(document).on("click", ".locate-bubbleStore-more-details",
function(a) {
    a.preventDefault();
    correspondingStoreInList = $(this).attr("href").substring(1);
    if ($(".gm-style").height() == window.innerHeight && $(".gm-style").width() == window.innerWidth) {
        $('button[title="Toggle fullscreen view"]').trigger("click")
    } else {
        scrollToCorrespondingStoreInList(correspondingStoreInList)
    }
});
function scrollToCorrespondingStoreInList(a) {
    var b = $("#" + a).find(".exp_title");
    if (b.attr("aria-expanded") === "false") {
        b.attr("aria-expanded", "true");
        b.next().slideDown()
    }
    $(".locate-popin .popinContent").animate({
        scrollTop: ($("#" + a).offset().top + $(".locate-popin .popinContent").scrollTop()) - $(".locate-popin .popinContent").offset().top
    });
    correspondingStoreInList = ""
}
$(document).on("click", "#locateStoreSearchSubmit",
function(a) {
    a.preventDefault();
    usingCurrentLocation = false;
    if ($(".storeList").length > 0) {
        $(".storeList").remove()
    }
    $(".locate-map-loader").removeClass("hide");
    displayMapAndListOfStoresFromInput($("#locateStoreSearchInput"), onlyStockAvailable)
});
function displayMapAndListOfStoresFromInput(e, f, d) {
    var a = e.val();
    var b = $(".locate-product-info").find(".sku").text().trim();
    $(window).trigger("searchOccur", {
        keyword: a
    });
    var c = new google.maps.Geocoder();
    c.geocode({
        address: a
    },
    function(h, g) {
        if (g === google.maps.GeocoderStatus.OK) {
            $("#locateNoResults").hide();
            if (h[0]) {
                var j = new StoreMapOption();
                j.positionResult = h[0];
                j.isUpdatedBySearch = true;
                displayMapAndListOfStores(j, b, f)
            }
        } else {
            $(window).trigger("searchResults", {
                results: "0"
            });
            $(".locate-map-loader").addClass("hide");
            $("#locateNoResults").show();
            $(".locate-results").hide();
            $(".locate-map-wrapper").removeClass("visible")
        }
    });
    e.blur()
}
function displayMapAndListOfStores(b, a, c) {
    storeMap = new StoreMap();
    storeMap.displayMap(b, a, c);
    displayStoresList()
}
function locateStoreSearchInputFocus() {
    $("#locateStoreSearchInput").focus()
}
function manageSizeSelect() {
    var c = $("#infoProductBlockTop").find(".sku").text().trim();
    var b = $("#infoProductBlockTop").find(".productName").find("h1").text().trim();
    $(".locate-product-info").find("h2").text(b);
    $(".locate-product-info").find(".sku").text(c);
    if ($(".sizesPanel").find("select").length != 0) {
        $(".locate-product-size").find("span").removeClass("hide");
        $(".sizesPanel").find("select").clone().appendTo(".locate-product-size").attr("id", "locateSizeSelect");
        if ($(".sizesPanel").find("select").find(".selected").length != 0) {
            var a = $(".sizesPanel").find("select").find(".selected").attr("data-ona")
        } else {
            if ($(".sizesPanel").find("select").find('[selected][value="sizeNoChoice"]').length != 0) {
                var a = $(".sizesPanel").find("select").find("option[data-sku=" + c + "]").attr("data-ona")
            } else {
                var a = $(".sizesPanel").find("select").find("[selected]").text().trim().toUpperCase();
                a = "Size/" + a
            }
        }
        var d = $("#locateSizeSelect");
        d.find('option[value="sizeNoChoice"]').remove();
        d.find("option[selected]").addClass("selected");
        d.find("option.selected").attr({
            selected: "selected",
            "data-ona": a,
            "data-sku": c
        });
        d.find("option[data-sku=" + c + "]").addClass("selected").attr({
            selected: "selected",
            "data-ona": a,
            "data-sku": c
        });
        d.find("option").each(function() {
            $(this).text($(this).attr("data-ona").split("Size/")[1])
        });
        $(document).on("change.locateSize", "#locateSizeSelect",
        function(f) {
            f.preventDefault();
            var e = d.find("option:selected").attr("data-sku");
            d.parent().prev().find(".sku").text(e);
            if ($("#storeList").find(".storeList").length > 0) {
                displayMapAndListOfStoresFromInput($("#locateStoreSearchInput"), onlyStockAvailable, true)
            }
        })
    }
    locateStoreSearchInputFocus();
    initMap()
}
function initMap() {
    map = new google.maps.Map(document.getElementById("map_canvas"), {
        center: {
            lat: 40,
            lng: -15
        },
        zoom: 2,
        mapTypeControl: false,
        gestureHandling: "cooperative"
    })
}
function beginTimerUpdateStoreMap() {
    isStoreStockPopinClosed = false;
    onlyStockAvailable = false
}
function endTimerUpdateStoreMap() {
    isStoreStockPopinClosed = true;
    $(document).off("change.locateSize", "#locateSizeSelect")
};