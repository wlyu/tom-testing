function registerEvent(a, b) {
    if (!a || !b) {
        return
    }
    $(window).on(a, b)
}
function fireEvent(a, b) {
    try {
        $(window).trigger(a, b)
    } catch(c) {}
}
function BuildScroll() {
    this.zonescroll;
    this.contener;
    this.contenerheight;
    this.iscroll;
    this.iscroll;
    this.init = function(a, b, c) {
        this.zonescroll = a;
        this.contener = b;
        this.contenerheight = c;
        if (this.contener.length == 0) {
            return
        }
        if (this.contenerheight === undefined && this.contener.get(0)) {
            this.contenerheight = this.contener.get(0).getBoundingClientRect().height
        } else {
            this.contenerheight = heightContener
        }
        this.scrollzoneheight = this.zonescroll.get(0).getBoundingClientRect().height;
        if (this.contenerheight < this.scrollzoneheight) {
            this.iscroll = new iScroll(this.contener.get(0), {
                hScroll: false,
                hScrollbar: false,
                onBeforeScrollStart: function(d) {
                    var e = d.target;
                    while (e.nodeType != 1) {
                        e = e.parentNode
                    }
                    if (e.tagName != "SELECT" && e.tagName != "INPUT" && e.tagName != "TEXTAREA") {
                        d.preventDefault()
                    }
                }
            })
        }
    }
}
var apiKeyword = "";
var apiCurrentPage = 1;
var apiNoOfPages = 1;
var dataObjAddressAPI = "";
var addressApiJsonData = "";
var postalCodeInstance = null;
function initAddressApiModalActions() {
    var instance = null;
    $(document).on("click", ".addressSearchKR",
    function() {
        instance = $(this);
        postalCodeInstance = instance;
        var $modal = $(".address-search-modal");
        var addressModal;
        addressModal = new modal($("#address-search-modal"));
        addressModal.open = function() {
            if (this.dataCallbackBeforeBuild) {
                eval(this.dataCallbackBeforeBuild)
            }
            this.buildArchitecture();
            $(".address-search-modal").closest(".blackWrapper").removeClass("changeModalDisplay");
            if (this.dataPath) {
                var that = this;
                getAjax(this.dataAjaxIsSecure, this.dataPath,
                function(data) {
                    that.afterAddContent(data)
                },
                undefined, this.dataParams)
            } else {
                if (this.dataDom) {
                    this.buildScroll();
                    this.afterAddContent($(this.dataDom).clone(true).show())
                } else {
                    if (this.dataId) {
                        this.afterAddContent($("<div></div>").attr("id", this.dataId))
                    }
                }
            }
            this.handlePageVisibility();
            $(".page").attr("aria-hidden", "true");
            return true
        };
        addressModal.open();
        $modal.find(".list").show();
        $modal.find(".list tbody").html("");
        $modal.find(".pagination-holder").html("");
        $modal.find(".error-display").html("");
        $modal.find(".modalKeyword").val("")
    });
    $(document).on("click", ".address-search-modal .submitModalButtonKR",
    function() {
        apiKeyword = $(this).closest(".address-search-modal").find(".modalKeyword").val();
        apiNoOfPages = 1;
        var apiKey = $(".apiKey").val();
        var apiUrl = $(".apiUrl").val();
        var countPerPage = $(".resultCount").val();
        var apiErrorMsg = $(".apiErrorMsg").val();
        getAddressFromApi(1, apiKey, apiUrl, countPerPage, apiErrorMsg, instance)
    })
}
function getAddressFromApi(c, g, f, d, e, a) {
    if (c <= apiNoOfPages && checkSearchedWord(apiKeyword)) {
        var b = {
            currentPage: 1,
            countPerPage: d,
            resultType: "json",
            confmKey: g,
            keyword: ""
        };
        b.keyword = apiKeyword;
        if (c) {
            b.currentPage = c
        }
        $.ajax({
            url: f,
            type: "post",
            data: $.param(b),
            dataType: "jsonp",
            crossDomain: true,
            success: function(h) {
                addressApiJsonData = h;
                $(".address-search-modal").find(".list tbody").html("");
                var l = h.results.common.errorMessage;
                var k = h.results.common.errorCode;
                if (Number(h.results.common.totalCount) == 0) {
                    displayApiErrorModal(window.LVMKR.address_api_error_no_result)
                } else {
                    if (k != "0") {
                        displayApiErrorModal(l)
                    } else {
                        if (h != null) {
                            updateAddressList(h, a)
                        }
                    }
                }
            },
            error: function(l, h, k) {
                if (h == "timeout") {
                    displayApiErrorModal(e)
                } else {
                    displayApiErrorModal(window.LVMKR.address_api_error_global)
                }
            },
            timeout: 15000
        })
    }
    return false
}
function updateAddressList(b, a) {
    var e = "";
    var d = "";
    var c = $(".address-search-modal");
    $(b.results.juso).each(function(g, h) {
        var f = g + 1;
        e += "<tr data-obj='" + JSON.stringify(h) + "' class='selectLink'>";
        e += "<td><input type='radio' name='selectAddress'></td>";
        e += "<td>" + this.jibunAddr + "<br><b>" + this.roadAddrPart1 + "</b></td>";
        e += "<td>" + this.zipNo + "</td>";
        e += "</tr>"
    });
    c.find(".subTitle").show();
    c.find(".pagination-holder").css("display", "inline-block");
    generateApiPagination(b, a);
    c.find(".pagination-holder").show();
    c.find(".modal-Search-section").find("h1").show();
    c.find(".list").show();
    c.find(".error-display").hide();
    c.find(".modal-footer").show();
    c.find(".list").find("tbody").first().html(e);
    c.find(".selectLink").off().on("click",
    function(f) {
        $(this).find('input[type="radio"]').prop("checked", true);
        $(this).css("background-color", "#f1f0ec").siblings().css("background-color", "transparent");
        dataObjAddressAPI = $(this).attr("data-obj")
    });
    c.find(".button-footer").off().on("click",
    function() {
        c.find(".error-display").hide();
        if (!$("input:radio[name='selectAddress']").is(":checked")) {
            c.find(".error-display").html(window.LVMKR.address_api_error_no_address);
            c.find(".error-display").show()
        } else {
            populateAddressFromApi(dataObjAddressAPI, a)
        }
    })
}
function populateAddressFromApi(g, a) {
    var b = $(".address-search-modal");
    var e = JSON.parse(g);
    var d = e.buldSlno;
    var b = $(".address-search-modal");
    var c = a.closest(".formPattern1");
    var f = "";
    if (! (d == "" || d == "0")) {
        f = e.rn + e.buldMnnm + "-" + e.buldSlno
    } else {
        f = e.rn + e.buldMnnm
    }
    closeModal();
    c.find('input[id*="state"]').val(e.siNm);
    c.find('input[id*="city"]').val(e.sggNm);
    c.find('input[id*="address1"]').val(e.emdNm);
    c.find('input[id*="address2"]').val(f);
    c.find('input[id*="postalCode"]').val(e.zipNo);
    dataObjAddressAPI = null;
    if ($("body").hasClass("page-type-checkout-shipping")) {
        c.find("#postalCode").trigger("change")
    }
}
function updatePageDataFromApi(b, a) {
    var f = $(".apiKey").val();
    var e = $(".apiUrl").val();
    var c = $(".resultCount").val();
    var d = $(".apiErrorMsg").val();
    getAddressFromApi(b, f, e, c, d, a)
}
function checkSearchedWord(c) {
    if (c.length > 0) {
        var f = /[%=><]/;
        if (f.test(c) == true) {
            c = c.split(f).join("");
            return false
        }
        var e = new Array("OR", "SELECT", "INSERT", "DELETE", "UPDATE", "CREATE", "DROP", "EXEC", "UNION", "FETCH", "DECLARE", "TRUNCATE");
        var b;
        var d;
        for (var a = 0; a < e.length; a++) {
            b = new RegExp("\\s" + e[a] + "\\s", "gi");
            if (b.test(c)) {
                c = c.replace(b, "");
                return false
            }
            d = new RegExp("\\+" + e[a] + "\\+", "gi");
            if (d.test(c)) {
                c = c.replace(d, "");
                return false
            }
        }
    }
    return true
}
function generateApiPagination(b, k) {
    var a = $(".address-search-modal");
    var d = "";
    var m = Number(b.results.common.totalCount);
    apiCurrentPage = Number(b.results.common.currentPage);
    var l = Number(b.results.common.countPerPage);
    apiNoOfPages = Math.ceil(m / l);
    var g = apiNoOfPages - apiCurrentPage;
    var f = (apiCurrentPage == 1) ? 1 : apiCurrentPage - 1;
    var h = apiCurrentPage + 1;
    var e, c;
    if ($(window).width() > 550) {
        d += '<li> <a data-page="1">' + window.LVMKR.address_api_text_first + "</a></li>";
        d += '<li> <a id="prevPage" data-page="' + f + '">' + window.LVMKR.address_api_text_previous + "</a></li>";
        if (g < 3 && g >= 0) {
            for (e = apiNoOfPages - 4 < 0 ? 1 : apiNoOfPages - 4; e <= apiNoOfPages; e++) {
                if (e == apiCurrentPage) {
                    d += '<li class="active"><a data-page="' + e + '">' + e + "</a></li>"
                } else {
                    d += '<li><a data-page="' + e + '">' + e + "</a></li>"
                }
            }
        } else {
            for (e = apiCurrentPage - 2 < 1 ? 1 : apiCurrentPage - 2, c = 0; e <= apiNoOfPages && c < 5; e++, c++) {
                if (e == apiCurrentPage) {
                    d += '<li class="active"><a data-page="' + e + '">' + e + "</a></li>"
                } else {
                    d += '<li><a data-page="' + e + '">' + e + "</a></li>"
                }
            }
        }
        d += '<li> <a id="nextPage" data-page="' + h + '">' + window.LVMKR.address_api_text_next + "</a></li>";
        d += '<li> <a data-page="' + apiNoOfPages + '">' + window.LVMKR.address_api_text_last + "</a></li>"
    } else {
        d += '<li> <a id="prevPage" data-page="' + f + '">' + window.LVMKR.address_api_text_previous + "</a></li>";
        if (g < 3 && g >= 0) {
            for (e = apiNoOfPages - 4 < 0 ? 1 : apiNoOfPages - 4; e <= apiNoOfPages; e++) {
                if (e == apiCurrentPage) {
                    d += '<li class="active"><a data-page="' + e + '">' + e + "</a></li>"
                } else {
                    d += '<li><a data-page="' + e + '">' + e + "</a></li>"
                }
            }
        } else {
            for (e = apiCurrentPage - 2 < 1 ? 1 : apiCurrentPage - 2, c = 0; e <= apiNoOfPages && c < 3; e++, c++) {
                if (e == apiCurrentPage) {
                    d += '<li class="active"><a data-page="' + e + '">' + e + "</a></li>"
                } else {
                    d += '<li><a data-page="' + e + '">' + e + "</a></li>"
                }
            }
        }
        d += '<li> <a id="nextPage" data-page="' + h + '">' + window.LVMKR.address_api_text_next + "</a></li>"
    }
    a.find(".pagination-holder").html(d);
    a.find(".pagination-holder li a").off().on("click",
    function(n) {
        updatePageDataFromApi(($(this).attr("data-page")), k)
    })
}
function displayApiErrorModal(b) {
    var a = $(".address-search-modal");
    a.find(".list").hide();
    a.find(".subTitle").hide();
    a.find(".pagination-holder").hide();
    a.find(".modal-footer").hide();
    a.find(".error-display").show();
    a.find(".error-display").html(b)
}
$(window).on("resize",
function(b) {
    var a = $(".address-search-modal");
    var c = a.find(".pagination-holder");
    if (a.length && c.is(":visible")) {
        generateApiPagination(addressApiJsonData, postalCodeInstance)
    }
});
var xhrAutocompleteSearch;
findSuggestions = function() {
    var d = this;
    var a = $(".bgSearchForm .autoSuggestEnabled").val() === "true";
    var c = $(".bgSearchForm .minAutoSuggestInputLength").val();
    var b = $(".bgSearchForm .autoSuggestcontentPaths").val().replace("[", "").replace("]", "");
    if (a && d.currentInputFieldValue.trim().length >= c) {
        returnSuggestions = function(g) {
            var f = endecaJsonResultToArray(g, d.currentInputFieldValue);
            if (f[0] == "") {
                f = new Array()
            }
            d.suggestionsCache[d.currentInputFieldValue.toLowerCase()] = f;
            if (f.length > 0) {
                d.showSuggestions(f)
            } else {
                d.suggestionsDiv.style.display = "none"
            }
        };
        var e = this.currentInputFieldValue.toLowerCase();
        if (xhrAutocompleteSearch) {
            xhrAutocompleteSearch.abort()
        }
        xhrAutocompleteSearch = ajaxRequestEndecaData(d.currentInputFieldValue.trim().toLowerCase(), returnSuggestions, b)
    } else {
        d.suggestionsDiv.style.display = "none"
    }
};
function endecaJsonResultToArray(c, g) {
    var f = new Array();
    var e = c.contents[0].autoSuggest[0].dimensionSearchGroups;
    var d = "";
    if (typeof e !== "undefined") {
        for (i = 0; i < e.length; i++) {
            for (j = 0; j < e[i].dimensionSearchValues.length; j++) {
                var b = e[i].dimensionSearchValues[j];
                var d = b.label;
                var a = b.properties["category.displayNameForSearch"];
                if (typeof a == "undefined") {
                    a = b.properties["attribute.displayNameForSearch"]
                }
                if (d.toLowerCase().indexOf(g.toLowerCase()) == -1 || a.toLowerCase().indexOf(g.toLowerCase()) != -1) {
                    d = a
                }
                f.push(d.toUpperCase())
            }
        }
    }
    return f
}
function callbackErrorAutocompleteSearch() {
    logError("erreur autocomplete")
}
autocompletion = function(c, d, a, b) {
    try {
        var g = document.getElementById(c);
        if (g === null) {
            return
        }
        if (!document.autocompletion) {
            document.autocompletion = new Array()
        }
        document.autocompletion.push(g);
        g.autocompletionId = document.autocompletion.length - 1;
        g.MAX_SUGGESTIONS = a;
        g.findSuggestions = b;
        g.suggestionsDiv = document.getElementById(d);
        g.eventKeyCode = null;
        g.currentInputFieldValue = strip_tags(g.value);
        g.oldInputFieldValue = strip_tags(g.value);
        g.suggestionsCache = new Array();
        g.suggestionsCache[""] = "";
        g.selectedSuggestion = -1;
        g.lastKeyCode = -1;
        g.onkeydown = autocompletionKeyDownHandler;
        g.onkeyup = autocompletionKeyUpHandler;
        g.onblur = autocompletionBlurHandler;
        g.showSuggestions = showSuggestions;
        g.highlightNewValue = highlightNewValue;
        g.rangeSize = rangeSize;
        g.beforeRangeSize = beforeRangeSize;
        g.autocompletionLoop = function() {
            if (this.currentInputFieldValue != this.oldInputFieldValue) {
                var e = this.suggestionsCache[this.currentInputFieldValue];
                if (e) {
                    if (e.length > 0) {
                        this.showSuggestions(e)
                    } else {
                        this.suggestionsDiv.style.display = "none"
                    }
                } else {
                    this.findSuggestions()
                }
            }
            this.oldInputFieldValue = this.currentInputFieldValue
        }
    } catch(f) {
        logError("autocompletion : " + f.message)
    }
};
function showSuggestions(c) {
    var e = "";
    var a = [];
    this.selectedSuggestion = -1;
    for (var h = 0; h < c.length; h++) {
        if ($.inArray(c[h], a) === -1) {
            a.push(c[h]);
            e += '<div id="autocompletionSearchItem_' + h + '" role="option">' + c[h] + "</div>"
        }
    }
    this.suggestionsDiv.innerHTML = e;
    var g = document.getElementById("searchHeaderInput");
    var b = document.getElementById("total");
    if (g.value != "") {
        b.innerHTML = a.length + " " + CONFIGURATION.SEARCH_SUGGESTION_LABEL
    }
    for (var d = 0; d < a.length; d++) {
        this.suggestionsDiv.childNodes[d].autocompletionField = this;
        this.suggestionsDiv.childNodes[d].index = d;
        this.suggestionsDiv.childNodes[d].onmousedown = autocompletionSuggestionMouseDownHandler;
        this.suggestionsDiv.childNodes[d].onmouseover = autocompletionSuggestionMouseOverHandler;
        this.suggestionsDiv.childNodes[d].onmouseout = autocompletionSuggestionMouseOutHandler
    }
    this.suggestionsDiv.style.display = "block";
    if (this.selectedSuggestion !== -1) {
        autocompletionSuggestionSelect(this.suggestionsDiv.childNodes[this.selectedSuggestion], true)
    }
}
var autocompletionKeyDownHandler = function(a) {
    if (!a && window.event) {
        a = window.event
    }
    if (a) {
        this.lastKeyCode = a.keyCode
    }
};
var autocompletionKeyUpHandler = function(a) {
    if (!a && window.event) {
        a = window.event
    }
    var b = a.keyCode;
    switch (b) {
    case 38:
        if (this.value != "") {
            this.highlightNewValue(this.selectedSuggestion - 1)
        }
        break;
    case 40:
        if (this.value != "") {
            this.highlightNewValue(this.selectedSuggestion + 1)
        }
        break;
    case 8:
        autocompletionReset(this);
        this.findSuggestions();
        break;
    default:
        this.currentInputFieldValue = this.value.substr(0, this.beforeRangeSize());
        this.findSuggestions();
        break
    }
};
var autocompletionBlurHandler = function() {
    if (this.selectedSuggestion !== -1) {
        var a = this.suggestionsDiv.childNodes;
        this.value = a[this.selectedSuggestion].innerText
    }
    autocompletionReset(this);
    this.suggestionsDiv.style.display = "none"
};
var autocompletionSuggestionMouseDownHandler = function() {
    this.autocompletionField.value = this.innerText;
    $(this).parents("form").submit()
};
var autocompletionSuggestionMouseOverHandler = function() {
    if ((this.autocompletionField.selectedSuggestion != -1) && (this.index != this.autocompletionField.selectedSuggestion)) {
        autocompletionSuggestionSelect(this.autocompletionField.suggestionsDiv.childNodes[this.autocompletionField.selectedSuggestion], false)
    }
    autocompletionSuggestionSelect(this, true);
    this.autocompletionField.selectedSuggestion = this.index
};
var autocompletionSuggestionSelect = function(a, b) {
    a[b ? "setAttribute": "removeAttribute"]("aria-selected", true);
    a.autocompletionField[b ? "setAttribute": "removeAttribute"]("aria-activedescendant", a.id)
};
var autocompletionReset = function(a) {
    a.currentInputFieldValue = a.value;
    if (a.selectedSuggestion !== -1) {
        autocompletionSuggestionSelect(a.suggestionsDiv.childNodes[a.selectedSuggestion], false)
    }
    a.selectedSuggestion = -1;
    a.removeAttribute("aria-activedescendant")
};
var autocompletionSuggestionMouseOutHandler = function() {
    autocompletionSuggestionSelect(this, false);
    this.autocompletionField.selectedSuggestion = -1
};
function highlightNewValue(c) {
    var a = this.suggestionsDiv.childNodes;
    var b = a.length;
    if (!a || (b <= 0) || ((b == 1) && (this.suggestionsDiv.innerHTML.indexOf("<") == -1))) {
        return
    }
    if (c >= b) {
        c = b - 1
    }
    if ((this.selectedSuggestion != -1) && (c != this.selectedSuggestion)) {
        autocompletionSuggestionSelect(a[this.selectedSuggestion], false)
    }
    if (c < 0) {
        this.value = this.oldInputFieldValue;
        autocompletionReset(this);
        return
    }
    this.selectedSuggestion = c;
    autocompletionSuggestionSelect(a[c], true)
}
function rangeSize() {
    var a = 0;
    if (this.createTextRange) {
        if (typeof document.selection !== "undefined") {
            a = document.selection.createRange().duplicate().text.length
        } else {
            var b = document.getSelection();
            a = b.focusOffset - b.anchorOffset
        }
    } else {
        if (this.setSelectionRange) {
            a = this.selectionEnd - this.selectionStart
        }
    }
    return a
}
function beforeRangeSize() {
    return this.value.length - this.rangeSize()
}
function setSuggestionsDivSize() {
    var b = 0,
    a = 0;
    var c = this;
    while (c) {
        b += c.offsetLeft;
        a += c.offsetTop;
        c = c.offsetParent
    }
    this.suggestionsDiv.style.left = b + "px";
    this.suggestionsDiv.style.top = (a + this.offsetHeight - 1) + "px";
    this.suggestionsDiv.style.width = this.offsetWidth - 2 + "px"
}
function ajaxRequestEndecaData(a, c, b) {
    var d = "endeca/assembler";
    var e = "Ntt=" + a + "*&format=json&Dy=1&assemblerContentCollection=" + b;
    return getAjax(false, d, c, null, e,
    function(g, f) {
        var h = "";
        if (g.status === 0) {
            h = "Not connect.\n Verify Network."
        } else {
            if (g.status == 404) {
                h = "Requested page not found. [404]"
            } else {
                if (g.status == 500) {
                    h = "Internal Server Error [500]."
                } else {
                    if (f === "parsererror") {
                        h = "Requested JSON parse failed."
                    } else {
                        if (f === "timeout") {
                            h = "Time out error."
                        } else {
                            if (f === "abort") {
                                h = "Ajax request aborted."
                            } else {
                                h = "Uncaught Error.\n" + g.responseText
                            }
                        }
                    }
                }
            }
        }
    },
    {
        headers: {
            Accept: "application/json"
        },
        mimeType: "application/json",
        dataType: "json",
        contentType: "application/json; charset=UTF-8"
    })
}
function retry(c, f) {
    var e = 0,
    d = 50,
    b = 10,
    a = false;
    var g = window.setInterval(function() {
        if (c()) {
            window.clearInterval(g);
            f(a)
        }
        if (e++>d) {
            window.clearInterval(g);
            a = true;
            f(a)
        }
    },
    10)
}
function isIE10OrLater(b) {
    var c = b.toLowerCase();
    if (c.indexOf("msie") === 0 && c.indexOf("trident") === 0) {
        return false
    }
    var a = /(?:msie|rv:)\s?([\d\.]+)/.exec(c);
    if (a && parseInt(a[1], 10) >= 10) {
        return true
    }
    return false
}
function detectPrivateMode(g) {
    var d;
    try {
        if (window.webkitRequestFileSystem) {
            window.webkitRequestFileSystem(window.TEMPORARY, 1,
            function() {
                d = false
            },
            function(h) {
                console.log(h);
                d = true
            })
        } else {
            if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
                var b;
                try {
                    b = window.indexedDB.open("test")
                } catch(f) {
                    d = true
                }
                if (typeof d === "undefined") {
                    retry(function a() {
                        return b.readyState === "done" ? true: false
                    },
                    function c(e) {
                        if (!e) {
                            d = b.result ? false: true
                        }
                    })
                }
            } else {
                if (isIE10OrLater(window.navigator.userAgent)) {
                    d = false;
                    try {
                        if (!window.indexedDB) {
                            d = true
                        }
                    } catch(f) {
                        d = true
                    }
                } else {
                    if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
                        try {
                            window.localStorage.setItem("test", 1)
                        } catch(f) {
                            d = true
                        }
                        if (typeof d === "undefined") {
                            d = false;
                            window.localStorage.removeItem("test")
                        }
                    }
                }
            }
        }
    } catch(f) {
        d = true
    }
    retry(function a() {
        return typeof d !== "undefined" ? true: false
    },
    function c(e) {
        g(d)
    })
} (function(c) {
    var b = 4000,
    d = ["LouisVuitton-N", "LouisVuitton-N-Light"];
    var a = new FontLoader(d, {
        fontsLoaded: function(e) {
            var f = c(document);
            if (e !== null) {
                f.trigger("fonts.error", [e])
            } else {
                f.trigger("fonts.success")
            }
            f.trigger("fonts.complete")
        }
    },
    b);
    c(function() {
        a.loadFonts()
    })
})(jQuery);
var curtainCountMap = {
    Main: 0
};
var chainNextLink = null;
var formularChain = {};
var errorCodes = {};
var formChanged = false;
var chainHasError = false;
var chainStarted = false;
var paypalKey = "";
var standardPaymentKey = "";
var fiscalCodeMandatoryMinimalAmmount = {};
function updateInformation() {
    var c = $("#titleupdateProfileForm option:selected").text(),
    a = $("#firstNameupdateProfileForm").val(),
    b = $("#lastNameupdateProfileForm").val();
    $(".userTitle").each(function() {
        $(this).html(c)
    });
    $(".firstName").each(function() {
        $(this).html(a)
    });
    $(".lastName").each(function() {
        $(this).html(b)
    })
}
function initForm(c, a, b) {
    if (c.hasClass("bindable")) {
        c.click(function() {
            submitForm(c);
            idFormParent = c.parents("form").attr("id");
            if (typeof c.attr("data-honeypot") !== typeof undefined && c.attr("data-honeypot") !== false) {
                if ($("body").hasClass("page-type-mylv-newsletter")) {
                    setTimeout(function() {
                        addNewField("newsletter")
                    },
                    3000)
                }
                if ($("body").hasClass("page-type-mylv-registration")) {
                    setTimeout(function() {
                        addNewField("registration")
                    },
                    3000)
                }
            }
        });
        var e = c.attr("data-formId");
        var d = $("#" + e);
        d.find("input").keypress(function(f) {
            if (f.keyCode == 13) {
                submitForm(c)
            }
        });
        if (b) {
            d.find("select").change(function() {
                submitForm(c)
            })
        }
        c.removeClass("bindable")
    }
}
function initAddressEditorForm(a) {
    logError("deprecated method - use initForm instead")
}
function selectAddress(c, a, b) {
    logDebug("selectAddress : " + c + " , " + a + " , " + b);
    showCurtain();
    $("#" + b).val(a);
    logDebug("selectAddress : targetId" + b);
    var d = $("#currentAddressFormHolder").attr("data-isMultiShip") != null;
    logDebug("selectAddress : isMultiShip " + d);
    getAjax(true, "address/address.jsp",
    function(f) {
        var e = $("#" + b + "_display");
        e.html(f);
        hideCurtain();
        $("#cancelEditAddress").click()
    },
    {
        addressName: a,
        isSelected: true,
        isBilling: false,
        descriptionOnly: d
    });
    updateSelector(c, a, b, d)
}
function updateSelector(c, b, a, d) {
    $("#selector_" + c).attr("data-params", "select=true&index=" + c + "&targetInput=" + a + "&addressName=" + b + "&isMultiShip=" + d)
}
function submitForm(submitButton) {
    var formId = submitButton.attr("data-formId");
    logDebug("submit form : " + submitButton.attr("id"));
    if (submitButton.length < 1) {
        logError("This submitButton does not exist in page : " + submitButton.selector);
        return
    }
    var disabled = submitButton.hasClass("disabled");
    if (!disabled) {
        var formId = submitButton.attr("data-formId");
        var form = $("#" + formId);
        var target = submitButton.attr("data-target");
        var action = form.attr("action");
        var callback = submitButton.attr("data-callback");
        var welcomePage = submitButton.attr("data-welcome-page");
        var errorCallback = submitButton.attr("data-errorCallback");
        var beforeCall = submitButton.attr("data-beforeCall");
        var preValidation = submitButton.attr("data-preValidationFc");
        var dataparams = submitButton.attr("data-params");
        var params = null;
        if (dataparams != undefined) {
            eval("params = " + dataparams)
        }
        var append = submitButton.attr("data-append") != null;
        var secure = submitButton.attr("data-secure") != null;
        var curtain = submitButton.attr("data-curtain") != null;
        var fromIframe = submitButton.attr("data-fromIframe") != null;
        var options = {
            staticParams: submitButton.attr("data-static-params"),
            isEndeca: submitButton.attr("data-is-endeca")
        };
        if (curtain) {
            showCurtain()
        }
        var errMsg = null;
        if (preValidation != undefined) {
            var fn = window[preValidation];
            if (typeof fn === "function") {
                errMsg = fn()
            }
        }
        if (errMsg != undefined && errMsg != null && errMsg != "") {
            catchError(errMsg);
            hideCurtain()
        } else {
            hideError();
            if (beforeCall != undefined) {
                eval(beforeCall)
            }
            postAjax(form.serialize(), secure, formId,
            function(data, callbackSuccessParams) {
                if (target != undefined) {
                    console.log("target :" + target);
                    if (fromIframe) {
                        $("#" + target, parent.document.body).html(data)
                    } else {
                        if (append) {
                            $("#" + target).append(data)
                        } else {
                            $("#" + target).html(data);
                            if (window.LVMCN) {
                                handleCallBackForChina(submitButton)
                            }
                            if (window.LVMKR) {
                                handleCallBackForKorea(submitButton)
                            }
                        }
                    }
                    if ($(".wrongIdentifier").length > 0) {
                        $(".globalErrorsMessage").attr("tabindex", "-1");
                        $(".globalErrorsMessage").focus()
                    }
                }
                if (callback != undefined) {
                    eval(callback)
                }
                if ((welcomePage != undefined) && ($(".wrongIdentifier").length == 0)) {
                    window.location.replace(welcomePage)
                }
                if (curtain) {
                    hideCurtain()
                }
            },
            null, params,
            function(data, callbackErrorParams) {
                if (errorCallback != undefined) {
                    eval(errorCallback)
                }
                $("<div class='techErr'></div>").attr("id", "techErr").html(CONFIGURATION.TECHNICAL_ERROR_MSG).appendTo("body");
                notifyError("#techErr");
                if (curtain) {
                    hideCurtain()
                }
            },
            options)
        }
    }
}
function catchError(a) {
    $("#selectSizeError").removeClass("hide")
}
function hideError() {
    $("#selectSizeError").addClass("hide")
}
function submitNextChainLink() {
    chainNextLink++;
    var nextLinkCall = formularChain[chainNextLink];
    if (nextLinkCall != undefined) {
        eval(nextLinkCall)
    }
}
function startChain(a) {
    logDebug("startChain");
    if (!chainStarted) {
        if (a) {
            chainStarted = true
        }
        chainHasError = false;
        chainNextLink = 0;
        submitNextChainLink()
    }
}
function resetChain(a) {
    if (a) {
        chainHasError = true;
        setupValidateOnly(true)
    } else {
        chainStarted = false;
        chainNextLink = -1;
        if ($("body").hasClass("page-type-checkout-shipping")) {
            if (! ($("input.privacyPolicyCheck").length)) {
                enableShippingSubmitButton()
            }
        }
    }
}
function validateChain() {
    logDebug("chainHasError : " + chainHasError);
    if (chainHasError) {
        resetChain();
        scrollToError();
        bindAddressModals()
    } else {
        submitNextChainLink()
    }
}
function notifyFieldErrorById(a, c, b) {
    notifyFieldError($("#" + a), c, b)
}
function notifyFieldError(e, f, c) {
    var a = e.attr("id");
    var b = e.parents("form");
    var d = b.find("#fl_" + a);
    d.addClass("error");
    d.find(".errorMsg").html(f + '<span class="errorCode hide">' + c + "</span>");
    if (f == "" && c == "") {
        d.removeClass("error")
    }
}
function notifyFieldErrorMyLvForm(e, f, c) {
    var a = e.attr("id");
    var b = e.parents("form");
    var d = b.find("#fl_postalCode");
    d.addClass("error");
    d.find(".errorMsg").html(f + '<span class="errorCode hide">' + c + "</span>");
    if (f == "" && c == "") {
        d.removeClass("error")
    }
}
function setupValidateOnly(a) {
    logDebug("setupValidateOnly : " + a);
    $(".validateOnly").val(a)
}
function bindAddressSelector() {
    $(".pick").each(function() {
        bindPick($(this))
    })
}
function bindPick(a) {
    if (a.hasClass("bindable")) {
        a.click(function() {
            selectPick($(this))
        });
        a.removeClass("bindable")
    }
}
function selectPick(c) {
    if (!c.hasClass("selected")) {
        $(".pick").each(function() {
            unselectPick($(this))
        });
        c.addClass("selected");
        c.find($("input")).attr("checked", true);
        var b = c.attr("id");
        var a = c.attr("data-locale");
        loadAddressForm({
            addressName: b,
            localStoreLang: a
        })
    }
}
function unselectPick(a) {
    a.removeClass("selected");
    a.find($("input")).attr("checked", false)
}
function bindAddressSelectorList() {
    $(".addressSelectorList").each(function() {
        bindSingleAddressSelectorList($(this));
        $(this).removeClass("addressSelectorList")
    })
}
function bindSingleAddressSelectorList(b) {
    var a = b.attr("data-index");
    logDebug("index = " + a);
    b.change(function() {
        var d = b.attr("isBillingAddress");
        var c = $(this).find("option:selected").val();
        logDebug("selector change : addName = " + c + " index = " + a);
        if (!d) {
            previewShipping()
        }
        updateAddressSelectorDisplay(c, a, false, false, changeAddressCallback)
    });
    changeAddressCallback($("#addressDisplay_" + a).clone())
}
function changeAddressCallback(b) {
    var a = $("#currentCountryCode").val();
    if (a == "ES") {
        spanish_displayFiscalRegulation()
    } else {
        checkCompanyName(b)
    }
    checkClickAndCollectPhone(b)
}
function checkClickAndCollectPhone(d) {
    try {
        if ((".ccMobilePhoneMessage").length > 0) {
            var b = $("<div></div>");
            b.html(d);
            var a = b.find("span.phoneNumber[data-type='mobile']");
            if (a.length > 0) {
                $(".ccMobilePhoneMessage").addClass("hide")
            } else {
                $(".ccMobilePhoneMessage").removeClass("hide")
            }
        }
    } catch(c) {
        logError(c)
    }
}
function checkCompanyName(c) {
    if ($("#existCompanyName").length != 0 && $("#billingAddressFormHolder").length != 0) {
        var a = $("<div></div>");
        a.html(c);
        var b = a.find(".companyName");
        if (b.html() != "") {
            $("#existCompanyName").val("true")
        } else {
            $("#existCompanyName").val("false")
        }
    }
    displayStarFct()
}
function spanish_displayFiscalRegulation() {
    var c;
    if (($(".companyName").length > 0)) {
        c = $(".companyName").html()
    } else {
        c = $("#companyName").val()
    }
    $("#updateFiscalCodeFormHolder").hide();
    if (c != "") {
        $("#updateFiscalCodeFormHolder").show();
        $("#existCompanyName").val("true");
        $("#receipt").hide();
        $("#needReceipt").val("false")
    } else {
        $("#existCompanyName").val("false");
        var d = parseFloat($("#currentOrdertotal").val());
        var b = parseFloat($("#orderTotal").val());
        var a = $("#isValuable").val();
        if ((d >= b) || (a == "true")) {
            $("#updateFiscalCodeFormHolder").show();
            $("#needReceipt").val("true");
            $("#receipt").hide()
        } else {
            $("#receipt").show()
        }
    }
    $("#paymentReceipt").unbind("change");
    $("#paymentReceipt").change(function() {
        $("#updateFiscalCodeFormHolder").toggle();
        if (!$("#paymentReceipt").is(":checked")) {
            $("#needReceipt").val("false")
        } else {
            $("#needReceipt").val("true")
        }
        displayStarFct()
    });
    $("#companyName").change(function() {
        if ($("#companyName").val() == "" && ($("#currentOrdertotal").val() < $("#orderTotal").val()) && ($("#isValuable").val() == "false")) {
            $("#updateFiscalCodeFormHolder").hide();
            $("#existCompanyName").val("false");
            $("#receipt").show()
        } else {
            $("#updateFiscalCodeFormHolder").show();
            $("#existCompanyName").val("true");
            $("#receipt").hide()
        }
        displayStarFct()
    });
    displayStarFct()
}
function updateAddressSelectorDisplay(a, b, f, d, h, e) {
    var g = $("#addressName_" + b).attr("isBillingAddress");
    if (g == "null") {
        g = false
    }
    if (d) {
        $(".addressSelectorDropbox").append("<option value=" + a + "></option>");
        $('.addressSelectorDropbox option[value="' + a + '"]').html(e);
        if (isIdevice) {
            $("#addressName_" + b).val([]);
            setTimeout(function() {
                $("#addressName_" + b + ' option[value="' + a + '"]').prop("selected", true)
            },
            200)
        } else {
            $("#addressName_" + b + " option").removeAttr("selected");
            $("#addressName_" + b + ' option[value="' + a + '"]').attr("selected", "selected")
        }
    }
    if (f) {
        $('.addressSelectorDropbox option[value="' + a + '"]').html(e)
    }
    showCurtain();
    var c = $("#addressDisplay_" + b);
    if (c != undefined) {
        getAjax(true, "address/address.jsp",
        function(k) {
            c.html(k);
            if (h) {
                h(k)
            }
            hideCurtain()
        },
        {
            addressName: a,
            isSelected: true,
            isBilling: g,
            showDescription: false,
            descriptionOnly: false
        })
    } else {
        if (h) {
            h()
        }
    }
}
function loadCurrentAddressForm() {
    var b = $(".pick.selected").attr("id");
    var a = $(".pick.selected").attr("data-locale");
    loadAddressForm({
        addressName: b,
        localStoreLang: a
    })
}
function loadLeadTimeDisplay(b, a) {
    getAjax(true, "leadTimeDisplay.jsp",
    function(c) {
        console.log(c);
        a.closest(".shippingAddress").find(".lead-time-display").html(c)
    },
    b)
}
var origineAdress;
function loadAddressForm(d, e) {
    showCurtain();
    var b = d.index;
    var a = $("#euMultiShippingParam").val();
    if (a) {
        d.isMultiEU = "true"
    }
    if ($("#shippingAddressFormHolder:visible").length == 0) {
        var c = "#commerceItemShippingRelation_"
    } else {
        var c = "#addressDisplayMode_"
    }
    origineAdress = ".changeAddress[data-holderid='" + $(c + "" + b + " .changeAddress").attr("data-holderid") + "']";
    getAjax(true, "address/updateAddressForm.jsp",
    function(g) {
        $("#currentAddressFormHolder_" + b).html(g);
        if ($("#updateAddressForm_mylv #country").length > 0) {
            var f = $("#updateAddressForm_mylv #country").val();
            $("#updateAddressForm_mylv").addClass("form" + f);
            zipCodeFormatCA($(".formCA #postalCode"))
        }
        if (typeof(e) == "function") {
            e()
        }
        hideCurtain()
    },
    d)
}
function loadCreateAddressForm(e, a) {
    showCurtain();
    deselectAddress();
    var c = e.index;
    var b = $("#euMultiShippingParam").val();
    if (b) {
        e.isMultiEU = "true"
    }
    if ($("#shippingAddressFormHolder:visible").length == 0) {
        var d = "#commerceItemShippingRelation_"
    } else {
        var d = "#addressDisplayMode_"
    }
    origineAdress = ".create-address[data-holderid='" + $(d + "" + c + " .create-address").attr("data-holderid") + "']";
    getAjax(true, "address/createAddressForm.jsp",
    function(g) {
        $("#currentAddressFormHolder_" + c).html(g);
        hideCurtain();
        if ($("#createAddressForm_mylv #country").length > 0) {
            var f = $("#createAddressForm_mylv #country").val();
            $("#createAddressForm_mylv").addClass("form" + f);
            zipCodeFormatCA($(".formCA #postalCode"))
        }
        if (typeof(a) == "function") {
            a()
        }
    },
    e)
}
function updateAddressPick(a, c, b) {
    showCurtain();
    getAjax(true, "address/addressPick.jsp",
    function(e) {
        var d = $("#" + a + "_holder");
        d.html(e);
        bindPick(d.find(".pick.bindable"));
        hideCurtain()
    },
    {
        addressName: a,
        isSelected: b,
        isBilling: c
    })
}
function updateAddressDisplay(a, b) {
    showCurtain();
    getAjax(true, "address/address.jsp",
    function(d) {
        var c = $("#" + a + "_display").find(".adresseContainer");
        c.html($($.trim(d)).html());
        hideCurtain()
    },
    {
        addressName: a,
        isSelected: true,
        isBilling: b
    })
}
function createAddressPick(a, b) {
    showCurtain();
    getAjax(true, "address/addressPick.jsp",
    function(d) {
        var c = $("<div id='" + a + "'_holder'/>");
        c.html(d);
        $("#billingAddressPickSeparator").after(c);
        bindPick(c.find(".pick.bindable"));
        hideCurtain()
    },
    {
        addressName: a,
        isSelected: true,
        isBilling: b
    })
}
function createAddressDisplay(a, b) {
    showCurtain();
    getAjax(true, "address/address.jsp",
    function(d) {
        var c = $("<div id='" + a + "_display'/>").addClass("address");
        c.html(d);
        $("#billingAddressDisplaySeparator").after(c);
        hideCurtain()
    },
    {
        addressName: a,
        isSelected: true,
        isBilling: b
    })
}
function deleteAddressPick(a) {
    $("#" + a + "_holder").remove()
}
function deleteAddressDisplay(a) {
    $("#" + a + "_display").remove()
}
function showOtherPhone(a) {
    $(a).closest("form").find(".toggleThirdPhone").removeClass("hide");
    $(a).closest("form").find(".toggleOtherPhone").hide().parents(".form-line").hide();
    $(a).closest("form").find(".otherPhoneHolder").removeClass("hide");
    $("#otherPhoneNumberType:visible").focus()
}
function showThirdPhone(a) {
    $(a).closest("form").find(".toggleThirdPhone").hide().parents(".form-line").hide();
    $(a).closest("form").find(".thirdPhoneHolder").removeClass("hide");
    $("#thirdPhoneNumberType:visible").focus()
}
function bindCompleteAddress_old(b) {
    var a;
    if ($("#postalCode").hasClass("completeAddress")) {
        $("#postalCode").change(function() {
            completeAddress($(this), b)
        });
        $("#postalCode").removeClass("completeAddress")
    }
}
function bindCompleteAddress(b) {
    var a;
    $(".completeAddress").each(function() {
        var c = $(this);
        c.change(function() {
            completeAddress($(this), b)
        })
    });
    $(".completeAddress").removeClass("completeAddress")
}
function deleteCreditCardPick(a) {
    $("#" + a + "_holder").remove();
    checkCBSelected()
}
function checkCBSelected() {
    if ($(".creditCard").length) {
        $(".creditCard").find(".creditCardDisplay").first().click()
    }
    if ($(".creditCard.selected").hasClass("create")) {
        $("#creditCardForm .credit-card-form-actions").hide()
    }
}
function completeAddress(l, m) {
    showCurtain();
    var f = window.navigator.userAgent.indexOf("MSIE") > 0 ? true: false,
    n = !!window.MSInputMethodContext && !!document.documentMode;
    var c = l.parents("form"),
    a = l.val(),
    e = c.find("#country").val(),
    g = ["US", "CA", "BR", "UK", "GB", "FR", "DE", "IT", "ES", "EU", "JP", "AU", "CN", "KR", "NL"],
    k = $("#country").val(),
    d = f || n ? true: g.includes(k),
    h = $("body").hasClass("page-type-checkout-payment"),
    b = $("body").hasClass("page-type-checkout-shipping");
    if (d || b) {
        getAjax(false, "completeAddress.jsp",
        function(w) {
            var t = $.parseJSON(w);
            var v = t.city;
            if (v != undefined && v != "") {
                c.find("#city").val(v);
                c.find("#cityupdateProfileForm").val(v)
            }
            var q = t.state;
            if (q != undefined && q != "") {
                c.find("#state").val(q);
                c.find("#stateupdateProfileForm").val(q)
            }
            var o = t.postalCode;
            if (o != undefined && o != "") {
                c.find("#postalCode").val(o);
                c.find("#postalCodeupdateProfileForm").val(o)
            }
            var s = t.address1;
            if (s != undefined && s != "") {
                c.find("#address1").val(s);
                c.find("#street").val(s)
            }
            var r = t.address2;
            if (r != undefined && r != "") {
                c.find("#address2").val(r)
            }
            var p = t.address3;
            if (p != undefined && p != "") {
                c.find("#address3").val(p)
            }
            var x = t.errMsg;
            var u = t.errCode;
            if (x != undefined && x != "") {
                notifyFieldError(l, x, u);
                if ($("#updateProfileForm").length > 0) {
                    notifyFieldErrorMyLvForm(l, x, u)
                }
            } else {
                notifyFieldError(l, "", "");
                if ($("#updateProfileForm").length > 0) {
                    notifyFieldErrorMyLvForm(l, "", "")
                }
            }
            if (m != undefined) {
                m(l)
            }
            hideCurtain()
        },
        {
            postalCode: a,
            otherCountry: e
        },
        null,
        function(o) {
            $("<div class='techErr'></div>").attr("id", "techErr").html(CONFIGURATION.TECHNICAL_ERROR_MSG).appendTo("body");
            notifyError($("#techErr"));
            hideCurtain()
        })
    }
}
function checkSessionTimeout(a, b) {
    showCurtain();
    if (a) {
        getAjax(true, "userprofiling/isLoggedIn.jsp",
        function(e) {
            var d = $.parseJSON(e);
            var f = d.isLoggedIn;
            if (!f) {
                resetChain();
                var c = htmlDecode(d.redirectionPopin);
                $("#tempErrorContainer").html(c)
            } else {
                submitNextChainLink()
            }
            hideCurtain()
        },
        null)
    } else {
        submitNextChainLink();
        hideCurtain()
    }
}
function checkStepsProgression(a) {
    showCurtain();
    getAjax(true, "commerce/salessteps/checkSalesStepsProgressionJson.jsp",
    function(d) {
        var c = $.parseJSON(d);
        var b = c.error;
        var e = htmlDecode(c.url);
        if (b != undefined && b) {
            resetChain();
            window.location = e
        } else {
            submitNextChainLink()
        }
        hideCurtain()
    },
    {
        pageType: a
    })
}
function saveGiftMessageInLocalStorage(a, b) {
    $.jStorage.set("giftMessage" + a, b)
}
function saveGiftMessage(a) {
    callGiftMsgValidator(a,
    function(d) {
        var c = $.parseJSON(d);
        var b = c.error;
        if (b != undefined) {
            $("#gift-msg-error-" + a).html(b)
        } else {
            saveGiftMessageInLocalStorage(a, c.lines[0]);
            $("#giftCardButton_" + a).attr("data-params", "index=" + a + "&mode=edit");
            $("#giftCard_" + a).val(true);
            $("#gift-message-container-" + a).slideToggle("ease",
            function() {
                $("#gift-card-preview-" + a).removeClass("preview-gift-not-hidden");
                $("#gift-message-editor-" + a).removeClass("edit-gift-hidden");
                $("#commerceItemShippingRelation_" + a).toggleClass("gift-message-on-mode");
                addDisplayTableMultiShip()
            });
            $("#gift-msg-error-" + a).html("")
        }
    })
}
function deleteGiftMessageFromLocalStorage(a) {
    if ($.jStorage.get("giftMessage" + a) != "") {
        $.jStorage.deleteKey("giftMessage" + a)
    }
}
function deleteGiftMessage(b, a) {
    $("#giftCardButton_" + b).attr("data-params", "index=" + b + "&mode=create");
    $("#giftCardMessage_" + b).val("");
    $("#giftCard_" + b).val(false);
    $("#giftCard_" + b).attr("checked", false);
    $("#giftCardButton_" + b).addClass("hide");
    $("#gift-msg-error-" + b).html("");
    if (a == undefined) {
        $("#gift-message-container-" + b).slideToggle("ease",
        function() {
            $("#commerceItemShippingRelation_" + b).toggleClass("gift-message-on-mode")
        })
    }
    deleteGiftMessageFromLocalStorage(b)
}
function previewGiftMessage(a) {
    callGiftMsgValidator(a,
    function(h) {
        var g = $.parseJSON(h);
        var d = g.error;
        var b = g.lines;
        var c = $("#gift-message-container-" + a);
        if (d != undefined) {
            $("#gift-msg-error-" + a).html(d)
        } else {
            if (b != undefined) {
                var f = [];
                for (var e = 0; e < b.length; e++) {
                    f.push("<span>" + b[e] + "</span>")
                }
                $("#gift-card-text-preview-" + a).html(f.join("</br>"));
                c.slideToggle("ease",
                function() {
                    $("#gift-card-preview-" + a).addClass("preview-gift-not-hidden");
                    $("#gift-message-editor-" + a).addClass("edit-gift-hidden");
                    c.slideToggle("ease")
                });
                $("#gift-msg-error-" + a).html("")
            }
        }
        $(document).scrollTop($(document).scrollTop());
        $("#gift-card-preview-" + a + " h2").focus()
    })
}
function callGiftMsgValidator(a, c) {
    var b = encodeURIComponent($("#giftCardMessage_" + a).val());
    getAjax(true, "commerce/giftMessagePreview.jsp", c, {
        text: b
    })
}
function editGiftMessage(b) {
    var a = $("#gift-message-container-" + b);
    a.slideToggle("ease",
    function() {
        $("#gift-card-preview-" + b).removeClass("preview-gift-not-hidden");
        $("#gift-message-editor-" + b).removeClass("edit-gift-hidden");
        a.slideToggle("ease")
    })
}
function loadGiftMessageInEditor(a) {
    loadGiftMessageFromLocalStorage(a)
}
function bindGiftMessages() {
    $(".giftCardCheckbox.bindable").each(function() {
        bindGiftMessage($(this));
        $(this).removeClass("bindable")
    })
}
function loadGiftMessageFromLocalStorage(a) {
    var b = $.jStorage.get("giftMessage" + a);
    if (b != "") {
        $(".giftCardMessageTA").html(b);
        $("#giftCardMessage_" + a).focus()
    }
}
function bindGiftMessage(a) {
    var d = a.attr("data-index");
    var c = "giftCardButton_" + d;
    var b = $("#gift-message-container-" + d);
    var e = 0;
    if ($("#giftMessage").length != 0) {
        e = $("#giftMessage").offset().top
    }
    $("#" + c).click(function() {
        if (!$("#gift-message-container-" + d).is(":visible")) {
            removeDisplayTableMultiShip();
            if ($("#gift-message-editor-" + d).hasClass("edit-gift-hidden")) {
                $("#gift-message-editor-" + d).removeClass("edit-gift-hidden");
                $("#gift-card-preview-" + d).removeClass("preview-gift-not-hidden")
            }
        }
        if ($(".gift-message-container").not("#gift-message-container-" + d).is(":visible")) {
            $(".gift-message-container:visible").not("#gift-message-container-" + d).slideToggle("ease")
        }
        if ($(".address-edit-mode").is(":visible")) {
            var g = $(".address-edit-mode:visible").find(".cancelEditAddress").attr("data-index");
            var f = $(".address-edit-mode:visible").find(".cancelEditAddress").attr("data-holderid");
            addressEditorSlideCancel(g, f)
        }
        if (RESPONSIVE_MANAGER.isAllSmallMode() || RESPONSIVE_MANAGER.isMediumMode()) {
            var h = $(".gift-message-on-mode").not("#commerceItemShippingRelation_" + d);
            h.find(".shippingAddress").slideToggle("ease",
            function() {
                h.removeClass("gift-message-on-mode");
                h.find(".shippingAddress").css("display", "")
            });
            $("#commerceItemShippingRelation_" + d + " .shippingAddress").slideToggle("ease",
            function() {
                $("#commerceItemShippingRelation_" + d).toggleClass("gift-message-on-mode");
                $("#commerceItemShippingRelation_" + d + " .shippingAddress").css("display", "")
            })
        }
        b.slideToggle("ease",
        function() {
            if (RESPONSIVE_MANAGER.isLargeMode()) {
                $("#commerceItemShippingRelation_" + d).toggleClass("gift-message-on-mode")
            }
            $("#giftCardMessage_" + d).focus()
        })
    });
    a.find("input:checkbox").click(function() {
        if ($(this).is(":checked")) {
            $("#" + c).removeClass("hide");
            setSizeTdTableMultiShip();
            removeDisplayTableMultiShip();
            if ($(".gift-message-container").is(":visible")) {
                $(".gift-message-container:visible").not("#gift-message-container-" + d).slideToggle("ease")
            }
            if ($(".address-edit-mode").is(":visible")) {
                var g = $(".address-edit-mode:visible").find(".cancelEditAddress").attr("data-index");
                var f = $(".address-edit-mode:visible").find(".cancelEditAddress").attr("data-holderid");
                addressEditorSlideCancel(g, f)
            }
            if (RESPONSIVE_MANAGER.isAllSmallMode() || RESPONSIVE_MANAGER.isMediumMode()) {
                var h = $(".gift-message-on-mode").not("#commerceItemShippingRelation_" + d);
                h.find(".shippingAddress").slideToggle("ease",
                function() {
                    h.removeClass("gift-message-on-mode");
                    h.find(".shippingAddress").css("display", "")
                });
                $("#commerceItemShippingRelation_" + d + " .shippingAddress").slideToggle("ease",
                function() {
                    $("#commerceItemShippingRelation_" + d).addClass("gift-message-on-mode");
                    $("#commerceItemShippingRelation_" + d + " .shippingAddress").css("display", "")
                })
            }
            b.slideToggle("ease",
            function() {
                if (RESPONSIVE_MANAGER.isLargeMode()) {
                    $("#commerceItemShippingRelation_" + d).toggleClass("gift-message-on-mode")
                }
            });
            if (RESPONSIVE_MANAGER.isAllSmallMode() && $("#giftMessage").length != 0) {
                setTimeout(function() {
                    var l = $("#commerceItemShippingRelation_" + d),
                    k = $(".productDescription:first", l);
                    e = l.offset().top + k.outerHeight();
                    $("html, body").animate({
                        scrollTop: e
                    },
                    900)
                },
                410)
            }
            $("#giftCardMessage_" + d).focus()
        } else {
            deleteGiftMessage(d, "noClose");
            if ($("#gift-message-container-" + d).is(":visible")) {
                if (RESPONSIVE_MANAGER.isAllSmallMode() || RESPONSIVE_MANAGER.isMediumMode()) {
                    $("#commerceItemShippingRelation_" + d + " .shippingAddress").slideToggle("ease",
                    function() {
                        $("#commerceItemShippingRelation_" + d).removeClass("gift-message-on-mode");
                        $("#commerceItemShippingRelation_" + d + " .shippingAddress").css("display", "")
                    })
                }
                b.slideToggle("ease",
                function() {
                    addDisplayTableMultiShip();
                    $("#gift-card-preview-" + d).removeClass("preview-gift-not-hidden");
                    $("#gift-message-editor-" + d).removeClass("edit-gift-hidden");
                    $("#commerceItemShippingRelation_" + d).removeClass("gift-message-on-mode")
                })
            }
        }
    })
}
function beforeCloseGiftMessagePopin(a) {
    var b = $("#giftCardEditor").attr("data-mode");
    logDebug("le mode est " + b);
    if (b == "create") {
        deleteGiftMessage(a, "noClose");
        logDebug("message deleted")
    } else {
        logDebug("message saved")
    }
}
function bindDeliveryMethodSelect(b, a) {
    $(".shippingMethodSelect").each(function() {
        if ($(this).hasClass("bindable")) {
            bindSingleDeliveryMethodSelect($(this), b, a);
            $(this).removeClass("bindable");
            bindShareCartByMail()
        }
    });
    $(".shippingMethodRadio").each(function() {
        if ($(this).hasClass("bindable")) {
            bindSingleDeliveryMethodRadio($(this), b);
            $(this).removeClass("bindable")
        }
    });
    if ($(".shippingMethodSelect").length == 0) {
        $(".changeCommerceItemInput:first").each(function() {
            bindShareCartByMail()
        })
    }
}
function bindSingleDeliveryMethodSelect(a, c, b) {
    a.change(function() {
        var f = $(this).find("option:selected").attr("data-description");
        var e = $(this).attr("data-target");
        var d = $(this).attr("data-stdValue");
        if (!b) {
            if ($(this).val() == d) {
                $(".shippingConstraintsStandard").removeClass("hide");
                $(".shippingConstraintsOther").addClass("hide")
            } else {
                $(".shippingConstraintsStandard").addClass("hide");
                $(".shippingConstraintsOther").removeClass("hide")
            }
        }
        $("#" + e).html(f);
        previewShipping(c)
    });
    a.each(function() {
        var e = $(this).find("option:selected").attr("data-description");
        var d = $(this).attr("data-target");
        $("#" + d).html(e)
    })
}
function bindSingleDeliveryMethodRadio(a, b) {
    logDebug("bindSingleDeliveryMethodRadio");
    a.change(function() {
        previewShipping(b)
    });
    if (a.hasClass("standard")) {
        logDebug("bindSingleDeliveryMethodRadio - selector has class standard");
        logDebug(a);
        a.click(function() {
            $(".shippingConstraintsStandard").removeClass("hide");
            $(".shippingConstraintsOther").addClass("hide")
        })
    }
    if (a.hasClass("other")) {
        logDebug("bindSingleDeliveryMethodRadio - selector has class other");
        logDebug(a);
        a.click(function() {
            $(".shippingConstraintsStandard").addClass("hide");
            $(".shippingConstraintsOther").removeClass("hide")
        })
    }
    if (a.attr("id") == "shippingMethodsRadio_") {
        $(document).ready(function() {
            addClassToRadioChecked()
        })
    }
    if ($("#" + radioButtonSelectedId) != "") {
        setTimeout(function() {
            $("#" + radioButtonSelectedId).focus();
            HandleFocusSelectedRadioButton()
        },
        500)
    }
    setLinksInLabelAttributs()
}
function callbackBeforeInput() {
    return true
}
accentsTidy = function(d) {
    var c = d.toLowerCase();
    c = c.replace(new RegExp(/[Ã Ã¡Ã¢Ã£Ã¤Ã¥]/g), "a");
    c = c.replace(new RegExp(/Ã¦/g), "ae");
    c = c.replace(new RegExp(/Ã§/g), "c");
    c = c.replace(new RegExp(/[Ã¨Ã©ÃªÃ«]/g), "e");
    c = c.replace(new RegExp(/[Ã¬ÃÃ®Ã¯]/g), "i");
    c = c.replace(new RegExp(/Ã±/g), "n");
    c = c.replace(new RegExp(/[Ã²Ã³Ã´ÃµÃ¶]/g), "o");
    c = c.replace(new RegExp(/Å“/g), "oe");
    c = c.replace(new RegExp(/[Ã¹ÃºÃ»Ã¼]/g), "u");
    c = c.replace(new RegExp(/[Ã½Ã¿]/g), "y");
    return c
};
function deselectAddress() {
    $(".pick").each(function() {
        $(this).removeClass("selected")
    })
}
var googleMapAPILoadedEvent = false;
var getCurrentLocationEvent = false;
var currentGeoPosition;
function setAddressFromCurrentLocation() {
    if (!googleMapAPILoadedEvent) {
        loadGoogleMaps()
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(a) {
            currentGeoPosition = a;
            getCurrentLocationEvent = true;
            if (googleMapAPILoadedEvent) {
                decodeLocationToSetAddress()
            }
        },
        function() {
            alert("Couldn't get your position.")
        })
    }
}
function loadGoogleMaps() {
    var a = document.createElement("script");
    a.setAttribute("type", "text/javascript");
    a.setAttribute("src", "http://maps.google.com/maps/api/js?sensor=false&callback=gMapsCallback"); (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(a)
}
function gMapsCallback() {
    googleMapAPILoadedEvent = true;
    if (getCurrentLocationEvent) {
        decodeLocationToSetAddress()
    }
}
function decodeLocationToSetAddress() {
    var a = new google.maps.LatLng(currentGeoPosition.coords.latitude, currentGeoPosition.coords.longitude);
    var b = new google.maps.Geocoder();
    b.geocode({
        latLng: a
    },
    function(g, c) {
        if (c == google.maps.GeocoderStatus.OK) {
            var l = g[0];
            if (l) {
                var e = l.address_components;
                var d = "";
                var h = "";
                for (var f = 0; f < e.length; f++) {
                    var k = e[f]["types"];
                    if ($.inArray("route", k) != -1) {
                        d = e[f]["long_name"]
                    } else {
                        if ($.inArray("street_number", k) != -1) {
                            h = e[f]["long_name"]
                        } else {
                            if ($.inArray("postal_code", k) != -1) {
                                $("#postalCode").val(e[f]["long_name"])
                            } else {
                                if ($.inArray("locality", k) != -1) {
                                    $("#city").val(e[f]["long_name"])
                                }
                            }
                        }
                    }
                }
                $("#address1").val(h + ", " + d)
            }
        }
    })
}
$.fn.serializeObject = function() {
    var c = {};
    var b = this.serializeArray();
    $.each(b,
    function() {
        if (c[this.name] !== undefined) {
            if (!c[this.name].push) {
                c[this.name] = [c[this.name]]
            }
            c[this.name].push(this.value || "")
        } else {
            c[this.name] = this.value || ""
        }
    });
    return c
};
function updateAddressBookDisplay(a, h, f, g, c, e) {
    logDebug("updateAddressBookDisplay");
    showCurtain();
    var b = (f != undefined) && f;
    if (h) {
        $(".delete-address-button").removeClass("hide");
        $(".isMainAddress").remove()
    }
    var d = a;
    if (e != null && e != undefined) {
        d += ":" + e
    }
    getAjax(true, "address/address.jsp",
    function(l) {
        logDebug("updateAddressBookDisplay - ajax callback");
        if (f) {
            $(".addressSelectorDropbox").append("<option value=" + d + "></option>");
            $('.addressSelectorDropbox option[value="' + d + '"]').html(c);
            $("#addressName_mylv option").removeAttr("selected");
            $('#addressName_mylv option[value="' + d + '"]').attr("selected", "selected");
            $("#billingAddressDisplaySeparator").after(l);
            $("#noAddressYet").hide();
            bindAddressModals();
            initEditAddressButtons()
        } else {
            var k = $("#" + a + "_display .adresseContainer");
            k.html(l);
            if (h) {
                $("#" + a + "_display .delete-address-button ").addClass("hide")
            }
            $('.addressSelectorDropbox option[value="' + d + '"]').html(c)
        }
        if (g) {
            g()
        }
        hideCurtain();
        $("#cancelEditAddress").click()
    },
    {
        addressName: a,
        isSelected: true,
        isBilling: h,
        showDescription: true,
        descriptionOnly: false,
        fullWrapper: f
    })
}
function loadNewsletterSuccessFrame() {
    $("#newsletterRegistrationHolder").html($("#newsletterSuccessWrapper").html())
}
function billingSameAsShippingEvent() {
    if ($("#billingSameAsShipping[type='checkbox']").is(":checked")) {
        $(".purchaser").css("display", "none")
    } else {
        $(".purchaser").css("display", "block")
    }
}
function buttonDisableFunction(b) {
    var a = b.closest("form").find(".addressErr");
    $.each(a,
    function() {
        if ($(this).is(":visible")) {
            buttonDisableFlag = true;
            return false
        } else {
            buttonDisableFlag = false
        }
    });
    if (buttonDisableFlag) {
        return
    } else {
        buttonDisableFlag = false
    }
}
function redirectToSFIdendtityForm() {
    var a = $("#redirectSFIdentityForm");
    if (a !== undefined) {
        a.submit()
    }
}
$(document).ready(function() {
    if ($("#createShippingGroupForm").length > 0) {
        var a = $("#country").val();
        $("#phoneNumberCountry").val(a)
    }
});
function addNewField(b) {
    var a = '<input id="mobileNo" name="mobileNo" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" aria-label="Do not fill this field"/>';
    if (b == "registration") {
        $("form#createProfileForm").find(".profileAccount").append(a)
    } else {
        if (b == "newsletter") {
            $("form#newsletterRegistrationForm").find(".subscriber").after(a)
        } else {
            $("form#contactUsForm").find(".sendMail").before(a)
        }
    }
}
window.onload = function() {
    if ($("body").hasClass("page-type-mylv-newsletter")) {
        setTimeout(function() {
            addNewField("newsletter")
        },
        3000)
    }
    if ($("body").hasClass("page-type-mylv-registration")) {
        setTimeout(function() {
            addNewField("registration")
        },
        3000)
    }
};
function countryOnChange() {
    if (window.LVMEU) {
        $(document).on("change", "#country",
        function() {
            var c = $(this);
            var a = c.closest("form");
            var b = c.val();
            a.find('input[id*="city"]').val("");
            a.find('input[id*="address1"]').val("");
            a.find('input[id*="address2"]').val("");
            a.find('input[id*="postalCode"]').val("");
            a.find('input[id*="phoneNumber"]').val("");
            a.find('input[id*="otherPhoneNumber"]').val("");
            a.find('input[id*="thirdPhoneNumber"]').val("");
            if ($("body").hasClass("page-type-checkout-shipping")) {
                resetShippingMethods(c)
            }
        })
    }
}
function resetShippingMethods(a) {
    var b = a.closest("form");
    var g = a.parents(".currentAddressFormHolder");
    var c = g.attr("data-index");
    var f = g.attr("data-isMultiShip") != null;
    var e = "Radio";
    if (f) {
        e = ""
    }
    var d = b.find('input[id*="postalCode"]').val();
    logDebug("resetShippingMethods for this : index= " + c + "type= " + e + "  data-isMultiShip=" + f);
    if (c != undefined) {
        updateShippingMethods(d, e, c, f)
    } else {
        updateShippingMethods(d, e, 0, f)
    }
}
var kisaAccepted = true;
function limitkoreanChar(f, b, d) {
    var c = new RegExp("[\u1100-\u11FF|\u3130-\u318F|\uA960-\uA97F|\uAC00-\uD7AF|\uD7B0-\uD7FF]");
    var e = d.val();
    var a = b;
    if (c.test(e)) {
        a = f
    }
    if (d.val() && d.val().length > a) {
        d.val(d.val().substring(0, a))
    }
    d.attr("maxlength", a)
}
function setKoreanCharLimit() {
    var n = 14;
    var d = 6;
    var g = 19;
    var c = 9;
    var m = 7;
    var k = 30;
    var a = 30;
    var b = 12;
    var l = 40;
    var e = 18;
    var h = 14;
    var f = 60;
    $(document).on("input", ".firstName-kor,.lastName-kor",
    function() {
        limitkoreanChar(n, a, $(this))
    });
    $(document).on("input", ".address1-kor",
    function() {
        limitkoreanChar(d, b, $(this))
    });
    $(document).on("input", ".address2-kor, .address3-kor",
    function() {
        limitkoreanChar(g, l, $(this))
    });
    $(document).on("input", ".city-kor",
    function() {
        limitkoreanChar(c, e, $(this))
    });
    $(document).on("input", ".state-kor",
    function() {
        limitkoreanChar(m, h, $(this))
    });
    $(document).on("input", ".deliveryNote-kor",
    function() {
        limitkoreanChar(k, f, $(this))
    })
}
function kisaCallback() {
    var a = $("#kisaAccepted");
    if (a.val() == "true") {
        $("#kisaForm").slideUp("ease");
        $("#leftColumn").slideDown("ease")
    } else {
        showErrorMessage()
    }
}
function validateKisaForm() {
    kisaAccepted = true;
    for (var a = 1; a < 5; a++) {
        if (!$(".kisa-consent-" + a).is(":checked")) {
            $("#kisaErrorFirstMandatory").show();
            kisaAccepted = false;
            return "missing requried fields"
        }
    }
}
function initKisaForm() {
    kisaSelectAll();
    kisaCheckBoxOnChange()
}
function kisaCheckBoxOnChange() {
    $(".kisa-check, #kisaMultiselectCheckbox").change(function() {
        enableSubmitButton()
    })
}
function enableSubmitButton() {
    if ($(".kisa-check:checked").length === $(".kisa-check").length) {
        $("#submitKisaForm").removeAttr("disabled")
    } else {
        $("#submitKisaForm").prop("disabled", true)
    }
}
function kisaSelectAll() {
    $("#kisaMultiselectCheckbox").on("change",
    function() {
        $(".kisaLine:lt(3)").find("input:checkbox").prop("checked", this.checked);
        enableSubmitButton()
    })
}
function showErrorMessage() {
    $("#kisaErrorFirstMandatory").show()
}
function kisaPopinCallback() {
    var a = $("#kisaAccepted");
    if (a.val() == "true") {
        closeModal()
    } else {
        showErrorMessage()
    }
}
function scrollToKisaInfo(a) {
    var b = 10;
    if ($(".header").css("position") == "fixed") {
        b += $(".header").height()
    }
    $("html, body").animate({
        scrollTop: $("#kisaInfo" + a).offset().top - b
    },
    500)
}
function scrollKisaModalToKisaInfo(a) {
    var b = 10;
    $(".kisa-popin-modal").animate({
        scrollTop: $("#kisaInfo" + a).offset().top - b
    },
    500)
}
function bindKoreaShippingMethodsChange() {
    logDebug("bindShippingMethodsChange-Korea");
    $(".postalCodeField.updateShippingMethods").change(function() {
        if ($(this).hasClass("updateShippingMethods")) {
            var l = $(this).parents(".currentAddressFormHolder");
            var g = l.attr("data-index");
            var k = l.attr("data-isMultiShip") != null;
            var h = "Radio";
            if (k) {
                h = ""
            }
            logDebug("bindShippingMethodsChange -Korea for this : index= " + g + "type= " + h + "  data-isMultiShip=" + k);
            if (g != undefined) {
                updateShippingMethods($(this).val(), h, g, k)
            } else {
                updateShippingMethods($(this).val(), h, 0, k)
            }
        }
    });
    var e = null;
    var d = null;
    if ($(".postalCodeField.updateShippingMethods").val() != undefined) {
        e = $(".postalCodeField.updateShippingMethods").val();
        d = $(".postalCodeField.updateShippingMethods")
    } else {
        e = $("#shippingAddressFormHolder .addressDisplay .clientAddress .clientAddressPostalCode").text();
        d = $("#shippingAddressFormHolder .addressDisplay .clientAddress .clientAddressPostalCode")
    }
    if (e != "") {
        var f = d.parents(".currentAddressFormHolder");
        var a = f.attr("data-index");
        var c = f.attr("data-isMultiShip") != null;
        var b = "Radio";
        if (c) {
            b = ""
        }
        logDebug("bindShippingMethodsChange-korea for endless for this : index= " + a + "type= " + b + "  data-isMultiShip=" + c);
        if (a == undefined) {
            a = 0
        }
        updateShippingMethods(e, b, a, c)
    }
}
function koreaShippingMethodEdit() {
    $(document).on("click", ".page-type-checkout-shipping #shippingAddressFormHolder .save-information span",
    function() {
        var d = $("#shippingAddressFormHolder #postalCode").parents(".currentAddressFormHolder");
        var a = d.attr("data-index");
        var c = d.attr("data-isMultiShip") != null;
        var b = "Radio";
        if (c) {
            b = ""
        }
        if (a != undefined) {
            updateShippingMethods($("#shippingAddressFormHolder #postalCode").val(), b, a, c)
        } else {
            updateShippingMethods($("#shippingAddressFormHolder #postalCode").val(), b, 0, c)
        }
        newValPostalCode = $("#shippingAddressFormHolder #postalCode").val();
        $(".page").addClass("tempShipping");
        $.ajax({
            success: function() {
                setTimeout(function() {
                    $("[id^=commerceItemShippingRelation_]").each(function(e, f) {
                        updateShippingMethods(newValPostalCode, b, e, c)
                    })
                },
                1800)
            }
        }).success()
    })
}
function unbindKoreaShippingMethods() {
    $(".purchaser #postalCode").removeClass("updateShippingMethods");
    $("#createClickAndCollectForm #postalCode").removeClass("updateShippingMethods")
}
function handleCallBackForKorea(a) {
    if ($("#billingSameAsShipping").length) {
        billingSameAsShippingEvent()
    }
    errorMessageExistence(a)
}
function errorMessageExistence(b) {
    var c = b.closest("form").attr("id");
    var a = $("#" + c).find(".errorMsg");
    a.each(function(d, e) {
        if ($("#" + c).find(".errorMsg").eq(d).is(":visible") && $("#" + c).find(".errorMsg").eq(d).html().trim().length) {
            flag = true
        }
    })
} (function(b) {
    var a = {
        duration: 3000,
        startPosition: "90%",
        endPosition: "95%"
    };
    b.fn.scrollArrow = function(c) {
        c = b.extend({},
        a, c);
        window.setTimeout(function() {
            if (b(window).scrollTop() < 5) {
                b(".scroll-arrow-container").animate({
                    opacity: 1,
                    top: c.startPosition
                },
                "linear").animate({
                    top: c.endPosition
                },
                "ease")
            }
        },
        c.duration)
    }
})(jQuery);
var TRUE_STRING_VALUE = "true";
$.prototype.modalize = function() {
    this.on("click",
    function(b) {
        b.preventDefault();
        $("body").focus();
        var a;
        a = new modal($(this));
        a.open()
    });
    return this
};
function modal(a) {
    this.id = +new Date;
    this.origine;
    this.url;
    this.dataId;
    this.dataPath;
    this.dataOrigine;
    this.dataAjaxIsSecure = true;
    this.dataDom;
    this.dataClass;
    this.dataWidth;
    this.dataCallbackBeforeBuild;
    this.callbackBeforeOpen;
    this.dataCallbackBeforeOpen;
    this.callbackAfterOpen;
    this.dataCallbackAfterOpen;
    this.callbackBeforeClose;
    this.dataCallbackBeforeClose;
    this.callbackAfterClose;
    this.dataCallbackAfterClose;
    this.scrollTop;
    this.dataParams;
    this.modalPositionedContainer;
    this.modalPositionedContainerClass;
    this.modalPositionType = "tc";
    this.wrapper;
    this.modal;
    this.container;
    this.displayCloseButton = true;
    this.closeButton;
    this.closeWhenClickOutside;
    this.timeInterval = 180;
    this.keepPage;
    this.opacity;
    this.handleOpacityIE;
    this.wrapperFixed;
    this.preventScroll = false;
    this.topPositionBeforeOpen = 0;
    this.init = function(b) {
        if (!b) {
            return
        }
        if (typeof b.attr("data-close") === "undefined") {
            this.closeWhenClickOutside = true
        } else {
            this.closeWhenClickOutside = (b.attr("data-close") === TRUE_STRING_VALUE)
        }
        if (typeof b.attr("data-origine") === "undefined") {
            this.origine = b.attr("id")
        } else {
            this.origine = b.attr("data-origine")
        }
        this.dataWidth = b.attr("data-width");
        this.dataId = b.attr("data-id");
        this.dataPath = b.attr("data-path");
        this.dataDom = b.attr("data-dom");
        this.keepPage = b.attr("data-keepPage");
        this.opacity = b.attr("data-opacity");
        this.scrollTop = b.attr("data-scrollTop");
        this.preventScroll = b.attr("data-preventScroll");
        this.wrapperFixed = b.attr("data-wrapperFixed");
        this.fullWxfullH = b.attr("data-fullWxfullH");
        if (b.attr("data-isSecure")) {
            this.dataAjaxIsSecure = b.attr("data-isSecure") == "true"
        }
        this.dataClass = b.attr("data-class");
        this.dataCallbackBeforeBuild = b.attr("data-callbackbeforebuild");
        this.dataCallbackBeforeOpen = b.attr("data-callbackbeforeopen");
        this.dataCallbackAfterOpen = b.attr("data-callbackafteropen");
        this.dataCallbackBeforeClose = b.attr("data-callbackbeforeclose");
        this.dataCallbackAfterClose = b.attr("data-callbackafterclose");
        this.dataParams = b.attr("data-params");
        this.modalPositionType = !b.attr("data-modalPositionType") ? this.modalPositionType: b.attr("data-modalPositionType")
    };
    this.init(a);
    this.modalPositionedContainerClass = "modal_" + this.modalPositionType;
    $(window).resize(this.resizeWindowHandler.bind(this))
}
modal.prototype.buildArchitecture = function() {
    if (this.preventScroll == "true") {
        $("body").bind("touchmove", preventBrowserScroll)
    }
    this.wrapper = $("<div/>").addClass("blackWrapper").addClass((this.wrapperFixed ? "blackWrapperFixed": "")).css("opacity", "0").css("background-color", (this.opacity ? "rgba(0,0,0," + this.opacity + ")": ""));
    this.container = $("<div class='container'/>");
    this.handleOpacityIE = $("<div class='opacityHandler'/>");
    this.modal = $("<div class='modal' role='dialog' aria-labelledby='" + this.origine + "MainTitle'/>").addClass(this.dataClass);
    if (this.fullWxfullH) {
        this.modal.css({
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        })
    }
    this.closeButton = $("<button/>").attr("aria-label", CONFIGURATION.CLOSE_LABEL).addClass("closeButton " + CONFIGURATION.tagClickClass).attr("id", "closeButtonModal");
    this.closeButton.html('<svg aria-hidden="true" focusable="false" width="17px" height="17px" viewBox="0 0 12.48 12" class="currentColor" role="img"><path style="fill-rule:evenodd;clip-rule:evenodd;fill:#464646;" d="M8.641,3.345H9.12V2.88H8.641V3.345z M8.625,3.36H8.16v0.465			h0.465V3.36z M7.681,4.305h0.465V3.84H7.681V4.305z M7.2,4.785h0.465V4.32H7.2V4.785z M7.186,4.8H6.721v0.465h0.465V4.8z			 M6.705,5.28h-0.93v0.465h0.93V5.28z M9.135,2.865h0.466V2.4H9.135V2.865z M12,0h-0.465v0.465H12V0z M10.559,1.441h-0.465v0.465			h0.465V1.441z M11.037,0.963h-0.465v0.465h0.465V0.963z M11.521,0.481h-0.465v0.465h0.465V0.481z M9.615,2.385h0.465V1.92H9.615			V2.385z M5.276,6.709h0.465V6.244H5.276V6.709z M3.855,8.145H4.32V7.68H3.855V8.145z M3.36,8.625h0.465V8.16H3.36V8.625z			 M2.88,9.105h0.465V8.64H2.88V9.105z M2.4,9.585h0.465V9.12H2.4V9.585z M1.92,10.065h0.465V9.6H1.92V10.065z M1.44,10.545h0.465			V10.08H1.44V10.545z M0.96,11.025h0.465V10.56H0.96V11.025z M4.335,7.665H4.8V7.2H4.335V7.665z M4.815,7.185H5.28V6.72H4.815			V7.185z M2.88,3.345h0.465V2.88H2.88V3.345z M3.375,3.825H3.84V3.36H3.375V3.825z M3.855,4.305H4.32V3.84H3.855V4.305z			 M4.335,4.785H4.8V4.32H4.335V4.785z M5.28,4.8H4.815v0.465H5.28V4.8z M5.76,5.28H5.295v0.465H5.76V5.28z M2.4,2.865h0.465V2.4			H2.4V2.865z M0.465,0H0v0.465h0.465V0z M1.442,1.906h0.465V1.441H1.442V1.906z M0.963,1.428h0.465V0.963H0.963V1.428z			 M0.945,0.481H0.48v0.465h0.465V0.481z M1.92,2.385h0.465V1.92H1.92V2.385z M6.725,6.244H6.259v0.465h0.466V6.244z M7.681,8.145			h0.465V7.68H7.681V8.145z M8.175,8.625h0.466V8.16H8.175V8.625z M8.655,9.105H9.12V8.64H8.655V9.105z M9.135,9.585h0.466V9.12			H9.135V9.585z M9.615,10.065h0.465V9.6H9.615V10.065z M10.096,10.545h0.465V10.08h-0.465V10.545z M10.575,11.025h0.465V10.56			h-0.465V11.025z M7.2,7.665h0.465V7.2H7.2V7.665z M6.721,7.185h0.465V6.72H6.721V7.185z M5.76,6.225h0.945V5.76H5.76V6.225z			 M3.825,2.88H3.36v0.465h0.465V2.88z M3.855,3.825H4.32V3.36H3.855V3.825z M4.335,4.305H4.8V3.84H4.335V4.305z M5.28,4.32H4.815			v0.465H5.28V4.32z M5.76,4.8H5.295v0.465H5.76V4.8z M2.88,2.865h0.465V2.4H2.88V2.865z M0.945,0H0.48v0.465h0.465V0z M1.922,1.906			h0.465V1.441H1.922V1.906z M1.444,1.428h0.465V0.963H1.444V1.428z M1.425,0.481H0.96v0.465h0.465V0.481z M2.4,2.385h0.465V1.92			H2.4V2.385z M6.739,6.709h0.465V6.244H6.739V6.709z M8.625,7.68H8.16v0.465h0.465V7.68z M8.655,8.625H9.12V8.16H8.655V8.625z			 M9.136,9.105h0.465V8.64H9.136V9.105z M9.615,9.585h0.465V9.12H9.615V9.585z M10.096,10.065h0.465V9.6h-0.465V10.065z			 M10.575,10.545h0.465V10.08h-0.465V10.545z M11.521,10.56h-0.465v0.466h0.465V10.56z M7.681,7.665h0.465V7.2H7.681V7.665z			 M7.2,7.185h0.465V6.72H7.2V7.185z M12.005,11.044h-0.466v0.461h-0.015v-0.461H11.06v0.465h0.461v0.461h0.465v-0.461h0.016v0.461			h0.465v-0.465h-0.461V11.044z M9.136,3.345h0.465V2.88H9.136V3.345z M9.105,3.36H8.641v0.465h0.465V3.36z M8.625,3.84H8.16v0.465			h0.465V3.84z M7.681,4.785h0.465V4.32H7.681V4.785z M7.2,5.265h0.465V4.8H7.2V5.265z M7.186,5.28H6.721v0.465h0.465V5.28z			 M9.615,2.865h0.465V2.4H9.615V2.865z M12.016,0v0.465h0.465V0H12.016z M11.039,1.441h-0.465v0.465h0.465V1.441z M11.517,0.963			h-0.465v0.465h0.465V0.963z M12,0.481h-0.465v0.465H12V0.481z M10.096,2.385h0.465V1.92h-0.465V2.385z M5.756,6.709h0.465V6.244			H5.756V6.709z M4.335,8.145H4.8V7.68H4.335V8.145z M3.84,8.625h0.465V8.16H3.84V8.625z M3.36,9.105h0.465V8.64H3.36V9.105z			 M2.88,9.585h0.465V9.12H2.88V9.585z M2.4,10.065h0.465V9.6H2.4V10.065z M1.92,10.545h0.465V10.08H1.92V10.545z M1.44,11.025			h0.465V10.56H1.44V11.025z M4.815,7.665H5.28V7.2H4.815V7.665z M5.295,7.185H5.76V6.72H5.295V7.185z M0.956,11.505H0.941v-0.461			H0.476v0.461H0.015v0.465H0.48v-0.461h0.015v0.461H0.96v-0.461h0.461v-0.465H0.956V11.505z"/></svg>');
    this.modal.append(this.container);
    this.wrapper.append(this.handleOpacityIE);
    this.closeButton.insertBefore(this.container);
    this.modalPositionedContainer = $("<div/>").addClass(this.modalPositionedContainerClass).css("opacity", "1");
    this.modalPositionedContainer.append(this.modal);
    this.wrapper.append(this.modalPositionedContainer);
    $("body").append(this.wrapper);
    this.hackForAndroidMobile();
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        this.modal.css("maxWidth", "100%")
    } else {
        var a = this.dataWidth;
        this.modal.css("width", a)
    }
    if (this.closeWhenClickOutside) {
        var b = this;
        this.wrapper.click(function(d) {
            var c = $(".modal", this);
            if (!c.is(d.target) && c.has(d.target).length === 0) {
                b.close()
            }
        })
    }
    this.closeButton.click(this.close.bind(this))
};
modal.prototype.open = function() {
    preventBackgroundFromScrolling();
    this.topPositionBeforeOpen = $(window).scrollTop();
    if (this.dataCallbackBeforeBuild) {
        eval(this.dataCallbackBeforeBuild)
    }
    this.buildArchitecture();
    if (this.dataPath) {
        var that = this;
        getAjax(this.dataAjaxIsSecure, this.dataPath,
        function(data) {
            that.afterAddContent(data)
        },
        undefined, this.dataParams)
    } else {
        if (this.dataDom) {
            this.buildScroll();
            this.afterAddContent($(this.dataDom).clone(true).show())
        } else {
            if (this.dataId) {
                this.afterAddContent($("<div></div>").attr("id", this.dataId))
            }
        }
    }
    this.handlePageVisibility();
    $(".page").attr("aria-hidden", "true");
    return true
};
modal.prototype.initKeyboardNavigation = function() {
    if ($(".modal .popinHeader h1:first:visible").length > 0) {
        var c = $(".modal .popinHeader h1:visible")
    } else {
        if ($(".modal .popinTitle").length > 0) {
            $(".modal .popinTitle").replaceWith("<h1 class='popinTitle' tabindex='-1'>" + $(".modal .popinTitle").html() + "</h1>");
            var c = $(".modal h1:first")
        } else {
            if ($(".modal .hotStampingTitle").length > 0) {
                $(".modal .hotStampingTitle").wrapInner("<h1 tabindex='-1' id='" + this.origine + "MainTitle'></h1>");
                var c = $(".modal h1:visible")
            } else {
                var c = $("button.closeButton")
            }
        }
    }
    c.focus();
    if ($(".modal h1").text().length == 0) {
        $(".modal h1:first:visible").html("<span class='mask'>" + $("#" + this.origine).text() + "</span>")
    }
    $(".modal h1:first:visible").attr("id", this.origine + "MainTitle");
    var e = $(".modal .container a:visible, .modal .container button:visible, .modal .container input:visible");
    var d = e.length;
    var b = $(".modal button.closeButton");
    var f = b;
    if (d > 0) {
        e.addClass("focusable");
        f = $(".modal .focusable:visible:last")
    } else {
        c.keydown(function(g) {
            if (!g.shiftKey && g.keyCode == 9) {
                g.preventDefault();
                b.focus()
            }
        })
    }
    var a = $("#" + this.origine);
    b.keydown(function(g) {
        if (g.shiftKey && g.keyCode == 9) {
            g.preventDefault();
            f.focus()
        }
        if (g.keyCode == 13 || g.keyCode == 32) {
            g.preventDefault();
            this.click();
            a.focus()
        }
    });
    f.keydown(function(g) {
        if (!g.shiftKey && g.keyCode == 9) {
            g.preventDefault();
            b.focus()
        }
    });
    document.addEventListener("keyup",
    function(g) {
        if (g.keyCode == 27) {
            b.click();
            a.focus()
        }
    })
};
modal.prototype.afterAddContent = function(data) {
    this.container.html(data);
    this.hackForAndroidTabletAfterAddContent();
    var that = this;
    if (this.dataCallbackBeforeOpen) {
        eval(this.dataCallbackBeforeOpen)
    }
    if (this.callbackBeforeOpen) {
        this.callbackBeforeOpen.call()
    }
    this.wrapper.animate({
        opacity: "1"
    },
    that.timeInterval * 2,
    function() {
        if (that.dataCallbackAfterOpen) {
            eval(that.dataCallbackAfterOpen)
        }
        if (that.callbackAfterOpen) {
            that.callbackAfterOpen.call()
        }
    });
    this.modalPositionedContainer.animate({
        opacity: "1"
    },
    that.timeInterval);
    var replacingModalInterval;
    that.container.find("input, textarea, select").blur(function() {
        replacingModalInterval = setInterval(function() {
            if (this.scrollTop) {
                $("body").animate({
                    scrollTop: 0
                },
                300)
            }
            clearInterval(replacingModalInterval)
        },
        20)
    });
    if (RESPONSIVE_MANAGER.isAllSmallMode() && !this.wrapperFixed) {
        $("body").animate({
            scrollTop: 0
        },
        300)
    }
    that.container.find("input, textarea, select").focus(function() {
        clearInterval(replacingModalInterval)
    });
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {}
    LOADING_IMAGE_MANAGER.loadResponsiveImages(".modal");
    that.container.find(".openModal").modalize();
    that.buildScroll();
    this.initKeyboardNavigation()
};
modal.prototype.closeAllModals = function() {
    $("body").removeClass("noscroll");
    $(".blackWrapper").each(function() {
        $(this).animate({
            opacity: "0"
        },
        100,
        function() {
            $(this).remove()
        })
    });
    CONFIGURATION.closeAll = false
};
modal.prototype.close = function(e) {
    this.hackForAndroidTabletBeforeClose();
    if (this.dataCallbackBeforeClose) {
        eval(this.dataCallbackBeforeClose)
    }
    if (this.callbackBeforeClose) {
        this.callbackBeforeClose.call()
    }
    if (CONFIGURATION.closeAll && $(".blackWrapper").length > 1) {
        this.closeAllModals();
        this.endModalClosing();
        if (typeof rebuildSlidersAfterModalClose == "function") {
            rebuildSlidersAfterModalClose()
        }
    } else {
        var that = this;
        this.modal.animate({
            opacity: "0"
        },
        this.timeInterval,
        function() {
            $(this).remove();
            that.handlePageVisibility();
            that.wrapper.animate({
                opacity: "0"
            },
            that.timeInterval,
            function() {
                $(this).remove();
                that.endModalClosing();
                if (typeof rebuildSlidersAfterModalClose == "function") {
                    rebuildSlidersAfterModalClose()
                }
            })
        })
    }
    $(".page").attr("aria-hidden", "false");
    activeBackgroundScrolling();
    if ($(this.modal).find(".returnPopupProductBlock").length) {
        fireEvent("closeReturnPopupProduct")
    }
};
modal.prototype.endModalClosing = function() {
    $(window).scrollTop($(window).scrollTop() + 1);
    $(window).scrollTop($(window).scrollTop() - 1);
    if (this.dataCallbackAfterClose) {
        eval(this.dataCallbackAfterClose)
    }
    if (this.callbackAfterClose) {
        this.callbackAfterClose.call()
    }
    if ($(".blackWrapper").length < 1) {
        $("body").unbind("touchmove", preventBrowserScroll)
    }
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        $("body").animate({
            scrollTop: this.topPositionBeforeOpen
        })
    }
};
modal.prototype.resizeWindowHandler = function() {
    if (!isIE_InfEq8) {
        var a = this["dataWidth"];
        this.modal.width(a)
    }
    this.handlePageVisibility()
};
modal.prototype.handlePageVisibility = function() {
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        if ($(".modal").length > 0 && !this.keepPage) {
            $(".page, .blackWrapper").hide();
            if ($(".modal").length == 1) {
                $(".blackWrapper").show()
            } else {
                $(".blackWrapper:last-child").show()
            }
        } else {
            if ($(".modal").length < 1) {
                $(".page").show();
                loadingImgs()
            }
        }
        if ($(".blackWrapper1").length) {
            $(".page").show()
        }
    }
};
modal.prototype.buildScroll = function() {
    var c = this.modal.find(".scrollbox");
    var a = this.modal.find(".scrollable");
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        return false
    }
    if (a.get(0) === undefined || c.get(0) === undefined) {
        return false
    }
    var b = new BuildScroll();
    b.init(a.eq(0), c.eq(0))
};
modal.prototype.containInput = function() {
    return this.container.find("input, textarea").not('input[type="hidden"],input[type="submit"]').length > 0
};
modal.prototype.hackModalPosition = function() {
    return this.containInput() && isAndroidTablet()
};
modal.prototype.hackForAndroidTabletAfterAddContent = function() {
    if (!this.hackModalPosition()) {
        return
    }
    $(".page").hide();
    this.updateHeight();
    $(window).resize(this.updateHeight.bind(this));
    this.wrapper.css("position", "absolute")
};
modal.prototype.hackForAndroidMobile = function() {
    if (RESPONSIVE_MANAGER.isAllSmallMode() && isAndroid) {
        $(".blackWrapper").addClass("changeModalDisplay")
    }
};
modal.prototype.updateHeight = function() {
    this.wrapper.height($(window).height())
};
modal.prototype.hackForAndroidTabletBeforeClose = function() {
    if (this.isLastModal()) {
        $(".page").show()
    }
    if (!this.hackModalPosition()) {
        return
    }
    $("body").animate({
        scrollTop: this.topPositionBeforeOpen
    })
};
modal.prototype.isLastModal = function() {
    return $(".modal").length == 1
};
var errMsg = "";
var errCode = "";
function notifySuccess(a) {}
function notifyError(d, c, b) {
    var a;
    a = new modal();
    a.dataDom = d;
    a.dataWidth = "60%";
    a.dataCallbackBeforeBuild = c;
    a.dataCallbackBeforeClose = b;
    a.open()
} (function(e) {
    var b = ".infinite-scroll",
    k = 500,
    c = 500,
    f, a, h = (window !== window.top);
    e(document).ready(function() {
        if (e(b).length) {
            d.init();
            g.init()
        }
    });
    var d = {
        init: function() {
            console.log("Log pagination: registering listener");
            if (h) {
                e(document).on("click", ".pl-next",
                function() {
                    d.loadNext();
                    e(this).addClass("is-loading")
                })
            } else {
                e(".pl-next").addClass("is-loading");
                e(window).on("scroll touchmove", jQuery.throttle(k,
                function() {
                    console.log("Log pagination: running listener");
                    var t = e(b);
                    var q = e("a.product-item:last, li.listing:last, li.look-item-li:last, a.item:last", t);
                    if (!q.length || q.offset().top == 0) {
                        return
                    }
                    var u = 520;
                    var s = 100,
                    r = q.offset().top,
                    p = window.pageYOffset + window.innerHeight;
                    if (p >= r) {
                        console.log(Math.round(p) + ">" + Math.round(r));
                        if (e("#productsSearchTab").length) {
                            if (e("#productsSearchTab").hasClass("active")) {
                                d.loadNext()
                            }
                        } else {
                            d.loadNext()
                        }
                    }
                }))
            }
            var l = e(".pl-page:first .toPage").val();
            if (l) {
                var o = e(".pl-page input.endecaRecsPerPage").val();
                console.log("starting [previous] pagination for LOAD page (when url ending with TO-PAGE)");
                var n = o * (l - 1);
                var m = e.jStorage.get("historyDisplay");
                if (m === "carousel") {
                    e.jStorage.set("historyDisplay", "grid");
                    e.jStorage.set("historyDisplayPrev", "grid")
                }
                window.showCurtain();
                ajaxRequestEndecaMoreProductsOrServices(null, o, d.handleNextLoading, fragmentType.PRODUCTLISTING, n)
            }
        },
        loadNext: function() {
            var n = e(".pl-page:last .pl-next"),
            l,
            m,
            s = e(b),
            r = s.data("pageLoaded"),
            o = s.data("lastPageLoaded");
            if (r === undefined) {
                r = {};
                s.data("pageLoaded", r)
            }
            if (n.length > 0) {
                l = n.attr("data-next");
                console.log("Log pagination: next=" + l);
                m = n.attr("data-detail");
                o = false
            } else {
                o = true
            }
            if (o === false && typeof r[l] === "undefined") {
                var q = n.data("formid");
                var p = {
                    next: l,
                    detail: m
                };
                e(window).trigger("scrollToMoreProduct", p);
                if (e(".pl-page input.endecaCurrentPage").val() != l) {
                    e(".pl-page input.endecaCurrentPage").val(l);
                    if (q) {
                        d.search(l, q)
                    } else {
                        d.load(l)
                    }
                    r[l] = true;
                    s.data("pageLoaded", r);
                    window.MORE_PRODUCTS_LOADED = true
                }
            }
            s.data("lastPageLoaded", o)
        },
        load: function(m) {
            var p = e("#findProducts");
            var l = e(".pl-page:last .pl-next").attr("data-next");
            var n = e("div.products-grid").attr("ref");
            var o = {
                internalname: n
            };
            e("#productFinderPageNumber").val(l);
            var q = e(".pl-page:last .endecaLastRecNum").val();
            console.log("starting pagination for LOAD page / Last rank :" + q);
            ajaxRequestEndecaMoreProductsOrServices(null, q, d.handleNextLoading, fragmentType.PRODUCTLISTING);
            fireEvent("categoryLoadNewPage", m)
        },
        handleNextLoading: function(q) {
            console.log("handleNextLoading");
            var n = e(e.parseHTML(q)).find(".pl-page");
            var r = e(e.parseHTML(q)).find(".pl-page input.endecaCurrentPage").val();
            var p = e(e.parseHTML(q)).find(".pl-page input.endecaTotalPages").val();
            var o = e(e.parseHTML(q)).find(".pl-page input.endecaLastRecNum").val();
            var l = Number(r) + 1;
            if (r === p) {
                e(".pl-page:last .pl-next").remove()
            } else {
                e(".pl-page:last .pl-next").attr("data-next", l);
                e(".pl-page:last .pl-next").attr("data-detail", r)
            }
            e(".pl-page input.navigationState").remove();
            e(".pl-page input.endecaCurrentPage").remove();
            e(".pl-page input.endecaTotalPages").remove();
            e(".pl-page input.endecaLastRecNum").remove();
            e(".pl-page").append(n.html());
            loadingImgs();
            buildNotCrawlableContent();
            arrangePushes();
            heightOfItems();
            minimizeProductsName();
            d.toPageCallback();
            var m = e(".pl-next")[0].outerHTML;
            e(".pl-next").remove();
            e(".pl-page").append(m);
            e(document).trigger("lv.content.received", [e(n)]);
            if (!h) {
                e(".pl-next").addClass("is-loading")
            } else {
                e(".pl-next").removeClass("is-loading")
            }
        },
        toPageCallback: function() {
            if (e(".toPage").length > 0) {
                var m = e(".toPage").attr("value");
                var l = e('.productItem[data-detail="' + m + '"]:first').offset();
                e("html, body").scrollTop(l.top)
            }
            window.hideCurtain()
        },
        search: function(l, o) {
            var m = e("#resultPageSearchInput").val();
            var n = e(".pl-page:last .endecaLastRecNum").val();
            console.log("starting pagination for SEARCH page / Last rank :" + n);
            ajaxRequestEndecaMoreProductsOrServices(m, n, d.handleNextSearch, fragmentType.SEARCHPRODUCT);
            fireEvent("searchLoadNewPage", l)
        },
        handleNextSearch: function(l) {
            console.log("handleNextSearch");
            e(".pl-page input.navigationState").remove();
            e(".pl-page input.endecaCurrentPage").remove();
            e(".pl-page input.endecaTotalPages").remove();
            e(".pl-page input.endecaLastRecNum").remove();
            e("div.pl-next").slideUp();
            e("div.pl-page").last().after(l);
            loadingImgs("#products-grid");
            buildNotCrawlableContent();
            minimizeProductsName();
            setContentSize();
            if (!h) {
                e(".pl-next").addClass("is-loading")
            }
        }
    };
    var g = {
        init: function() {
            f = e(".back-to-top-wrapper");
            a = e(".pl-back-to-top");
            if (!f.length) {
                return
            }
            f.remove().hide().appendTo("body");
            a.text(a.data("text"));
            var l = e(".footer-menu-wrapper");
            e(window).on("scroll touchmove resize", jQuery.throttle(c,
            function() {
                if (e("#look-products-grid").length > 0) {
                    var m = e("#look-products-grid")
                } else {
                    var m = e("#products-grid")
                }
                var o = l.offset().top;
                var r = m.offset().top + m.outerHeight(true);
                var n = window.pageYOffset + window.innerHeight;
                if (window.pageYOffset > 50) {
                    g.show()
                } else {
                    g.hide()
                }
                if (RESPONSIVE_MANAGER.isAllSmallMode()) {
                    e("#products-grid .product-item:odd").css("border-right", "none");
                    var q = e(document).height() - r;
                    if (n > (r - 60) && e(b).data("lastPageLoaded") === true) {
                        f.addClass("is-sticky").css({
                            bottom: "auto",
                            top: (r - 60)
                        })
                    } else {
                        f.removeClass("is-sticky").css({
                            bottom: "",
                            top: ""
                        })
                    }
                    var p = e(".editorial, .push-immersive").height() + 30;
                    if (e(".editorial").length > 0 || e(".editorial").length > 0) {
                        if (e(window).scrollTop() + e(window).height() > e(document).height() - p) {
                            e("#BackToTop").hide()
                        } else {
                            e("#BackToTop").show()
                        }
                    }
                } else {
                    if (n > o) {
                        f.removeClass("is-sticky").css({
                            bottom: "",
                            top: ""
                        });
                        g.hide();
                        return
                    }
                }
            }))
        },
        visible: false,
        show: function() {
            if (!g.visible) {
                f.stop().fadeTo(300, 1);
                g.visible = true
            }
        },
        hide: function() {
            if (g.visible) {
                f.stop().fadeOut(300);
                g.visible = false
            }
        }
    }
} (jQuery));
function getPath(a) {
    var b = $("<a/>").attr("href", a)[0].pathname;
    if (!b.startsWith("/")) {
        b = "/" + b
    }
    return b
}
function ajaxRequestEndecaMoreProductsOrServices(d, f, l, o, a) {
    if (o != fragmentType.SEARCHSERVICE && !validateNextLoadOrSearch()) {
        $(".pl-next:last").removeClass("is-loading");
        return
    }
    if (o != fragmentType.SEARCHARTICLE && !validateNextLoadOrSearch()) {
        $(".pl-next:last").removeClass("is-loading");
        return
    }
    var g = "";
    var n = "";
    var m = {};
    var b = $("#isColorDisplayEnabled").attr("value");
    if (o == fragmentType.SEARCHPRODUCT) {
        page = "search-frag";
        var k = $(".pl-page:last .navigationState").val();
        var c = urlParam(k, "N");
        if (c !== null) {
            m.N = c
        }
        var c = urlParam(k, "Nrpp");
        if (c !== null) {
            m.Nrpp = c
        }
        if (b) {
            m.showColor = b
        }
    } else {
        if (o == fragmentType.PRODUCTLISTING) {
            page = "browse-frag";
            var p = getPath(window.location.href.split("?")[0]);
            var h = new RegExp("/[a-z]{3}-[a-z1]{2}/", "g");
            var e = p.split(h);
            if (e.length > 1) {
                g += "/";
                g += e[e.length - 1].split("/page-")[0].split("/to-")[0]
            }
            var k = $(".pl-page:last .navigationState").val();
            var c = urlParam(k, "N");
            if (c !== null) {
                m.N = c
            }
            if (a !== undefined) {
                m.Nrpp = a;
                m.originalNrpp = f
            } else {
                var c = urlParam(k, "Nrpp");
                if (c !== null) {
                    m.Nrpp = c
                }
            }
            if (b) {
                m.showColor = b
            }
        } else {
            if (o == fragmentType.SEARCHSERVICE) {
                page = "search-svc-frag"
            } else {
                if (o == fragmentType.SEARCHARTICLE) {
                    page = "search-svc-frag"
                }
            }
        }
    }
    m.No = f;
    if (d) {
        m.Ntt = d
    }
    return getAjax(false, "endeca/" + page + g, l, m, undefined,
    function(r, q) {
        var s = "";
        if (r.status === 0) {
            s = "Not connect.\n Verify Network."
        } else {
            if (r.status == 404) {
                s = "Requested page not found. [404]"
            } else {
                if (r.status == 500) {
                    s = "Internal Server Error [500]."
                } else {
                    if (q === "parsererror") {
                        s = "Requested JSON parse failed."
                    } else {
                        if (q === "timeout") {
                            s = "Time out error."
                        } else {
                            if (q === "abort") {
                                s = "Ajax request aborted."
                            } else {
                                s = "Uncaught Error.\n" + r.responseText
                            }
                        }
                    }
                }
            }
        }
    },
    {
        headers: {
            Accept: "text/html"
        },
        mimeType: "text/html",
        dataType: "html",
        contentType: "text/html; charset=UTF-8"
    })
}
function validateNextLoadOrSearch() {
    var a = $(".pl-page:last .pl-next").attr("data-next");
    var c = a - 1;
    var d = $(".pl-page:last .endecaTotalPages").val();
    var b = $(".pl-page:last .endecaCurrentPage").val();
    if (c < d) {
        return true
    }
    return false
}
function urlParam(b, c) {
    var a = new RegExp("[?&]" + c + "=([^&#]*)").exec(b);
    if (a == null) {
        return null
    } else {
        return a[1] || 0
    }
}
var fragmentType = {
    SEARCHPRODUCT: 0,
    PRODUCTLISTING: 1,
    SEARCHSERVICE: 2,
    SEARCHARTICLE: 3
};
function disableSubmitSearchHeader() {
    if ($("#searchHeaderInput").val() == "") {
        $("#searchOkButton").attr("disabled", "disabled")
    }
    $("#searchHeaderInput").keyup(function() {
        var a = $("#autocompletionSearchHeader").children().length;
        if ($(this).val() != "") {
            $("#searchOkButton").removeAttr("disabled");
            $(this).attr("aria-expanded", "true")
        } else {
            $("#searchOkButton").attr("disabled", "disabled");
            $(this).attr("aria-expanded", "false");
            $("#total").html("")
        }
        if (! ($("#autocompletionSearchHeader").css("display") !== "none" && $(this).val() != "")) {
            $("#total").html("")
        }
    });
    $("#searchHeaderInput").on("paste",
    function() {
        var a = this;
        setTimeout(function() {
            var b = $(a).val();
            if (b != "") {
                $("#searchOkButton").removeAttr("disabled")
            } else {
                $("#searchOkButton").attr("disabled", "disabled")
            }
        },
        100)
    })
}
function initSearchHeaderAutocomplete() {
    autocompletion("searchHeaderInput", "autocompletionSearchHeader", 5, findSuggestions)
}
function validHeaderSearch(b) {
    $("#searchHeaderInput").blur();
    b.preventDefault();
    b.stopPropagation();
    var a = CONFIGURATION.SEARCH_URL + "/" + strip_tags($("#searchHeaderInput").val().toLowerCase());
    window.location = a
}
var hackPositionForArtWall = function() {
    if ($(".search").hasClass("target-on")) {
        $(".artWallWraper").animate({
            top: $("#searchHeaderFormulaire").height() + "px"
        })
    } else {
        $(".artWallWraper").animate({
            top: "0px"
        })
    }
};
function focusSearchInput() {
    if (RESPONSIVE_MANAGER.isAllSmallMode() && $("#header").hasClass("headerLeftOn")) {
        $(".headerLevel1").slideToggle(200,
        function() {
            $("#header").removeClass("headerLeftOn");
            $("html, body").animate({
                scrollTop: 0
            },
            "slow")
        })
    }
    if (window.location.href.indexOf("art-wall") > -1) {
        hackPositionForArtWall()
    }
    $("#searchHeaderInput").focus()
}
var networkName, addToCardBubbleTimer = 5000,
DOM_LOADED = (typeof(DOM_LOADED) !== "undefined") ? DOM_LOADED: true,
DOM_READY = false,
IS_LOADING_DEVICE_TYPE = false,
IS_DEVICE_TYPE_LOADED = true,
IFRAME_READY = $.support.cors,
IFRAME_COUNT = 0,
LOADED_DONE = false,
LANDING_PAGE = false,
ADD_TO_WISHLIST = false,
SCROLL_TO_TOP_GAP_AS = 25,
SCROLL_TO_TOP_GAP_ML = 10,
DEFAULT_BACK_BTN_PROCESS = 0,
CHECKOUT_BACK_BTN_PROCESS = 1,
LOCAL_FORCE_RELOAD_HEADER = false;
var backBtnProcessFlag = DEFAULT_BACK_BTN_PROCESS;
var checkoutPageTypePosition = -1;
var captchaUrl = null;
var mom_domain_name = "";
var mom_renditions = "";
var mom_init_path_array = new Array();
var mom_destination_path_array = new Array();
var sessionStorageTest = {
    setItem: function(a, b) {
        try {
            sessionStorage.setItem(a, b)
        } catch(c) {}
    },
    getItem: function(a) {
        var b;
        try {
            b = sessionStorage.getItem(a)
        } catch(c) {}
        return b
    }
};
var orientationEvent = "resize";
var IE = (navigator.userAgent.indexOf("MSIE") > 0) || (navigator.userAgent.indexOf("Trident/7.0") > 0);
var isIE_InfEq8 = !($.support.leadingWhitespace);
var prefixes = ["", "-webkit-", "-moz-", "-o-"];
function getDeviceTypeEventCallback() {
    IS_DEVICE_TYPE_LOADED = true;
    loaded()
}
registerEvent("pageChanged", haveToScroll);
$.support.transition = (function() {
    var b = document.body || document.documentElement,
    c = b.style,
    a = c.transition !== undefined || c.WebkitTransition !== undefined || c.MozTransition !== undefined || c.MsTransition !== undefined || c.OTransition !== undefined;
    return a
})();
var isBeforeIE10 = !$.support.transition;
function getAjaxRoot(a) {
    return (a) ? CONFIGURATION.SECURE_AJAX_ROOT: CONFIGURATION.AJAX_ROOT
}
var createsIFrame = (function() {
    if ($.support.cors) {
        return function() {
            return $.Deferred().reject("cors-is-supported").promise()
        }
    }
    var a;
    return function() {
        if (!a) {
            var b = $.Deferred();
            $("<iframe/>", {
                src: getAjaxRoot(false) + CONFIGURATION.xdrproxyJsp + "?storeLang=" + CONFIGURATION.STORE_LANG,
                id: getIframeId(false)
            }).css("display", "none").appendTo(".page");
            $("<iframe/>", {
                src: getAjaxRoot(true) + CONFIGURATION.xdrproxySecureJsp + "?storeLang=" + CONFIGURATION.STORE_LANG,
                id: getIframeId(true)
            }).css("display", "none").appendTo(".page");
            $(window).on("message",
            function(f) {
                var g = "";
                try {
                    if (!f.originalEvent.data || f.originalEvent.data.indexOf("{") === -1) {
                        return
                    }
                    g = JSON.parse(f.originalEvent.data)
                } catch(c) {
                    logError("can't parse : " + f.originalEvent.data)
                }
                if (g.state) {
                    IFRAME_COUNT++;
                    if (IFRAME_COUNT === 2 && !IFRAME_READY) {
                        IFRAME_READY = true;
                        b.resolve();
                        loaded()
                    }
                }
                if ($.isFunction(CONFIGURATION.XDR_CALLBACKS[g.id])) {
                    CONFIGURATION.XDR_CALLBACKS[g.id].call(this, g.data);
                    fireEvent("ajaxSucessViaIFrame", {
                        url: g.url,
                        data: g.data
                    })
                }
            });
            a = b.promise()
        }
        return a
    }
})();
function getIframeId(a) {
    return a ? "xdrps": "xdrp"
}
String.prototype.endsWith = function(a) {
    return this.indexOf(a, this.length - a.length) !== -1
};
if (typeof String.prototype.startsWith != "function") {
    String.prototype.startsWith = function(a) {
        return this.slice(0, a.length) == a
    }
}
var devicePlatform, resolutionWidth, resolutionHeight, orientation;
var absoluteContentHeight = 0,
relativeContentHeight = 0;
var ua = navigator.userAgent.toLowerCase();
var isAndroid = ua.indexOf("android") > -1;
var isIdevice = navigator.userAgent.match(/(iPhone|iPod|iPad)/i) || false;
var isNexus = /^.*Android.*Nexus(((?:(?!Mobile))|(?:(\s(7).+))).)*$/i;
var isInIframe = (window.location != window.parent.location) ? true: false;
var isBrowser_IE_9 = navigator.appVersion.indexOf("MSIE 9.") != -1;
function isIE() {
    var a = navigator.userAgent.toLowerCase();
    return (a.indexOf("msie") != -1) ? parseInt(a.split("msie")[1]) : false
}
function isAndroidTablet() {
    return ! RESPONSIVE_MANAGER.isAllSmallMode() && isAndroid
}
function isTouchScreenDevice() {
    try {
        document.createEvent("TouchEvent");
        return true
    } catch(a) {
        return false
    }
}
function isElementInViewport(c, b) {
    var f = c.offsetTop;
    var e = c.offsetLeft;
    var d = c.offsetWidth;
    var a = c.offsetHeight;
    while (c.offsetParent) {
        c = c.offsetParent;
        f += c.offsetTop;
        e += c.offsetLeft
    }
    switch (b) {
    case "horizontal":
        return ((e + d) < (window.pageXOffset + window.innerWidth) && e > window.pageXOffset);
    case "vertical":
        return ((f + a) < (window.pageYOffset + window.innerHeight) && f > window.pageYOffset);
    default:
        return ((f + a) < (window.pageYOffset + window.innerHeight) && (e + d) < (window.pageXOffset + window.innerWidth) && f > window.pageYOffset && e > window.pageXOffset)
    }
}
function isDeprecatedFirefox() {
    if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        var a = new Number(RegExp.$1);
        if (a <= 18) {
            $("body").addClass("isDeprecatedFirefox")
        } else {
            $("body").removeClass("isDeprecatedFirefox")
        }
    }
}
function tabsKeyboardNavigationHandler(e) {
    var d = $(e.data.container).find(e.data.item);
    var b = d.index($(this));
    var a = d.length;
    if (a > 1) {
        var c;
        if (e.keyCode == 40 || e.keyCode == 39) {
            c = d.eq(b + 1);
            if (b == a - 1) {
                c = d.eq(0)
            }
        }
        if (e.keyCode == 38 || e.keyCode == 37) {
            c = d.eq(b - 1);
            if (b == 0) {
                c = d.eq(a - 1)
            }
        }
        c.focus();
        c.click()
    }
}
function customMainPushHP() {
    $(".push1 .box-wrapper").each(function() {
        var b = $(this).attr("attr-mainpushcolor-hp"),
        c = $(this).attr("attr-mainpushposition-hp"),
        a = $(this).attr("attr-mainpushsize-hp");
        mainpushopacity = $(this).attr("attr-mainpushopacity-hp");
        if (typeof b !== typeof undefined && b !== false) {
            if (b != "") {
                if (typeof mainpushopacity !== "") {
                    mainpushopacity = $(this).attr("attr-mainpushopacity-hp")
                } else {
                    mainpushopacity = 0.6
                }
                $(this).css("background-color", "rgba(" + b + ", " + mainpushopacity + ")")
            }
        }
        if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
            if (typeof a !== typeof undefined && a !== false) {
                if (a != "") {
                    if (a < 15) {
                        $(this).css("width", 15 + "%")
                    } else {
                        if (a <= 98) {
                            $(this).css("width", a + "%")
                        } else {
                            $(this).css("width", 98 + "%")
                        }
                    }
                }
            }
        }
        if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
            if (typeof c !== typeof undefined && c !== false) {
                if (c !== "") {
                    if (c == "center-left") {
                        $(this).css({
                            left: "1%",
                            right: "auto",
                            bottom: "auto",
                            top: "0",
                            "margin-left": "auto",
                            "margin-right": "auto",
                            "margin-top": "23%",
                            transform: "translateY(-50%)"
                        });
                        $(this).addClass("top-position0")
                    } else {
                        if (c == "center-right") {
                            $(this).css({
                                bottom: "auto",
                                left: "auto",
                                right: "1%",
                                top: "0",
                                "margin-left": "auto",
                                "margin-right": "auto",
                                "margin-top": "23%",
                                transform: "translateY(-50%)"
                            });
                            $(this).addClass("top-position0")
                        } else {
                            if (c == "top") {
                                $(this).removeClass("centerDivBackImg");
                                $(this).css({
                                    bottom: "auto",
                                    left: "0",
                                    right: "0",
                                    top: "1%",
                                    "margin-left": "auto",
                                    "margin-right": "auto"
                                })
                            } else {
                                if (c == "top-left") {
                                    $(this).removeClass("centerDivBackImg");
                                    $(this).css({
                                        bottom: "auto",
                                        left: "1%",
                                        right: "auto",
                                        "margin-left": "auto",
                                        "margin-right": "auto",
                                        top: "1%"
                                    })
                                } else {
                                    if (c == "top-right") {
                                        $(this).removeClass("centerDivBackImg");
                                        $(this).css({
                                            bottom: "auto",
                                            left: "auto",
                                            right: "1%",
                                            "margin-left": "auto",
                                            "margin-right": "auto",
                                            top: "1%"
                                        })
                                    } else {
                                        if (c == "bottom") {
                                            $(this).removeClass("centerDivBackImg");
                                            $(this).css({
                                                top: "auto",
                                                bottom: "1%",
                                                left: "0",
                                                right: "0",
                                                "margin-left": "auto",
                                                "margin-right": "auto"
                                            })
                                        } else {
                                            if (c == "bottom-left") {
                                                $(this).removeClass("centerDivBackImg");
                                                $(this).css({
                                                    top: "auto",
                                                    bottom: "1%",
                                                    left: "1%",
                                                    right: "auto",
                                                    "margin-left": "auto",
                                                    "margin-right": "auto"
                                                })
                                            } else {
                                                if (c == "bottom-right") {
                                                    $(this).removeClass("centerDivBackImg");
                                                    $(this).css({
                                                        top: "auto",
                                                        bottom: "1%",
                                                        left: "auto",
                                                        right: "1%",
                                                        "margin-left": "auto",
                                                        "margin-right": "auto"
                                                    })
                                                } else {
                                                    $(this).css({
                                                        bottom: "auto",
                                                        left: "0",
                                                        right: "0",
                                                        top: "0",
                                                        "margin-left": "auto",
                                                        "margin-right": "auto",
                                                        "margin-top": "23%",
                                                        transform: "translateY(-50%)"
                                                    });
                                                    $(this).addClass("top-position0")
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    $(".push1 .more").each(function() {
        var a = $(this).attr("attr-titlecolor-hp"),
        b = $(this).attr("attr-titlesize-hp");
        if (typeof a !== typeof undefined && a !== false) {
            if (a !== "") {
                $(this).css("color", "rgba(" + a + ",1)")
            }
        }
        if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
            if (typeof b !== typeof undefined && b !== false) {
                if (b !== "") {
                    $(this).css("font-size", b + "em")
                }
            }
        }
    });
    $(".push1 .description-push-text").each(function() {
        var b = $(this).attr("attr-subtitlecolor-hp"),
        a = $(this).attr("attr-subtitlesize-hp");
        if (typeof b !== typeof undefined && b !== false) {
            if (b !== "") {
                $(this).css("color", "rgba(" + b + ",1)")
            }
        }
        if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
            if (typeof a !== typeof undefined && a !== false) {
                if (a !== "") {
                    $(this).css("font-size", a + "em")
                }
            }
        }
    });
    $(".push1 .callToAction").each(function() {
        var a = $(this).attr("attr-call2actionfontcolor-hp"),
        b = $(this).attr("attr-call2actionsize-hp"),
        c = $(this).attr("attr-call2actionbackgroundcolor-hp");
        if (typeof a !== typeof undefined && a !== false) {
            if (a !== "") {
                $(this).css("color", "rgba(" + a + ",1)")
            }
        }
        if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
            if (typeof b !== typeof undefined && b !== false) {
                if (b !== "") {
                    $(this).css("font-size", b + "em")
                }
            }
        }
        if (typeof c !== typeof undefined && c !== false) {
            if (c !== "") {
                $(this).css("background-color", "rgba(" + c + ",1)")
            }
        }
    })
}
var localStorageUrlsProductKey = "CarouselUrlsProduct",
localStorageUrlsParamSearch = "CarouselParamSearch",
localStorageStartingPage = "CarouselStartingPage",
localStorageFormNamePageNumber = "CarouselFormNamePageNumber",
localStorageCarouselTotalResult = "CarouselTotalResult",
localStorageCarouselTotalPage = "CarouselTotalPage",
localStorageShareBitly = "bitly_share_" + CONFIGURATION.FULL_URL,
localStorageCartReminderShown = "CartReminderShown",
localStorageBackBtn = "BackBtn",
localStorageFromCaroussel = "FromCaroussel",
localStorageCurrentUrl = "currentUrl",
localStorageSkuToScroll = "skuToScroll",
LocalStorageLoggedState = "loggedState",
LocalStorageCommerceHeader = "commerceHeader",
LocalStorageTimeOut = "timeout",
LocalStorageStoreLangMegaMenu = "storeLangMegaMenu",
LocalStorageStoreLangCommerceHeader = "storeLangCommerceHeader",
localStorageFromBackStoreDetailed = "fromBackStoreDetailed",
localStorageShouldScrollToSku = "shouldScrollToSku",
localStorageUserHasSelectedSize = "productSizeSelected",
localStorageInvoicingCountry = "invoicingCountry";
if (CONFIGURATION.currentModule !== "collections") {
    $.jStorage.set(localStorageFromCaroussel, 0)
}
var cookieDispatchLocale = "lv-dispatch";
var cookieDispatchUrl = "lv-dispatch-url";
var cookieUserConsentDatas = "lv-user-consent-datas";
var FROM_DETAILED_STORE_PAGE = false;
function handleBackButtonFromStoreDetailedPage() {
    FROM_DETAILED_STORE_PAGE = $.jStorage.get(localStorageFromBackStoreDetailed);
    $.jStorage.set(localStorageFromBackStoreDetailed, false)
}
handleBackButtonFromStoreDetailedPage();
$(function() {
    if (CONFIGURATION.IS_CVG) {
        DOM_READY = true;
        createsIFrame();
        loadDeviceType();
        loaded()
    } else {
        if (typeof specificLoadingEvent === "function") {
            specificLoadingEvent()
        }
    }
    topBanner()
});
var changesku;
function loaded() {
    if (LOADED_DONE || !(DOM_READY && DOM_LOADED && IFRAME_READY)) {
        return
    }
    if (location.protocol.indexOf("https") > -1) {
        detectPrivateMode(handleSafariPrivateMode)
    }
    if (isIdevice && "true" === getCookie(CONFIGURATION.COOKIE_NAME)) {
        setEndlessWindowSize()
    }
    LOADED_DONE = true;
    hasBeenOnConvergence();
    loadCommerceHeaders(true);
    attachInitEvents();
    RESPONSIVE_MANAGER.checkResizeEvent();
    loadingImgs();
    loadingExpands();
    loadingBubbles();
    buildExternalLink();
    buildNotCrawlableContent();
    RESPONSIVE_MANAGER.keepMasterRatio();
    if (CONFIGURATION.IS_CONTEXT_SET && !changesku) {
        initHeader()
    }
    handleLoggedState();
    RESPONSIVE_MANAGER.initResponsive();
    RESPONSIVE_MANAGER.setModeValue();
    scrollTopButton();
    checkLVPAss();
    orderLinksInFooter();
    isTouchClass();
    isNexusClass();
    isIE9Class();
    isDesktopClass();
    fixIosBadHeight();
    reCallShoppingBagReminder();
    fixIosAppleTag();
    loadPriceButton();
    isDeprecatedFirefox();
    getSkuOnpage();
    shareUrlGooglePLusProductPage();
    shareUrlTwitterProductPage();
    shareUrlFBProductPage();
    shareUrlLineProductPage();
    shareUrlKakao();
    var a = "";
    shippingMethodEdit();
    setParamsPreviewButtonForIE();
    localyseForm();
    zipCodeFormatCA($(".formCA #postalCodeupdateProfileForm"));
    initPageTypeInfos();
    customMainPushHP();
    if (typeof specificLoadingEventProduct === "function") {
        specificLoadingEventProduct()
    } else {
        if (typeof specificLoadingEvent === "function") {
            specificLoadingEvent()
        }
    }
    window.scrollTo(0, 1);
    $("body").addClass("page-type-" + this.CONFIGURATION.pageType);
    if (navigator.userAgent.match(/iPad/i) != null) {
        $("body").addClass("iPad")
    }
    if (CONFIGURATION.LOGIN_SUCCESS) {
        handleDataCommerceUpdate(true)
    }
    if (CONFIGURATION.LOGOUT_SUCCESS) {
        handleDataCommerceUpdate(false)
    }
    handleUserConsentDatasCookie();
    handleScrollDownAnimation();
    delegateClickScrollDownArrow();
    initRightMenuActiveItem();
    openProductDetailsAccordian();
    setFooterDropUpPosition();
    isKeyboardUsed();
    topBannerGeolocAkamaiCookieHandler();
    topBannerGeolocAkamaiHandler()
}
function loadDeviceType() {
    registerEvent("getDeviceTypeEvent", getDeviceTypeEventCallback);
    if (!$.jStorage.get("deviceType")) {
        getDeviceTypeFromAkamaiHeader()
    }
}
function setEndlessWindowSize() {
    var e = document.body.style,
    d = getCookie("EndlessIFrameParentWidth") + "px",
    b = getCookie("EndlessIFrameParentHeight") + "px",
    c = getCookie("EndlessIFrameParentOrientation"),
    a = "";
    switch (c) {
    case "90":
    case "-90":
        if (e.width !== b) {
            a = b
        }
        break;
    default:
        if (e.width !== d) {
            a = d
        }
    }
    if (a !== "") {
        e.width = a;
        loadingImgs();
        if (CONFIGURATION.pageType !== "product") {
            $(window).trigger("resize")
        }
    }
    setTimeout(setEndlessWindowSize, 1000)
}
function loadAjaxDom(f, c, b) {
    var d = "DomAjaxStorage-";
    var g = $(f);
    var a = function(h) {
        sessionStorageTest.setItem(d + c, h);
        g.html(h);
        if (b && typeof(b) === "function") {
            b.call()
        }
    };
    var e = sessionStorageTest.getItem(d + c);
    if (e) {
        a(e)
    } else {
        getAjax(false, c, a)
    }
}
function scrollTopButton() {
    $("body").on("click", "#returnTop, .back-to-top",
    function() {
        if (isIdevice && "true" === getCookie(CONFIGURATION.COOKIE_NAME)) {
            window.parent.$("body").animate({
                scrollTop: 0
            },
            500)
        } else {
            $("html, body").animate({
                scrollTop: 0
            },
            500)
        }
    })
}
function scrollToElement(b, a) {
    if (!a || a == "undefined") {
        a = 500
    }
    $("html, body").animate({
        scrollTop: b.offset().top
    },
    a)
}
function initHeader() {
    loadMegaMenu();
    initLeftMenuToggler();
    initRightMenuToggler();
    bindsMegaMenuClosingEvents();
    bindsMegaMenuOpeningEvents();
    initSearch();
    readCookieSubMegaMenuTitles();
    actionCookieSubMegaMenuTitles()
}
function loadMegaMenu() {
    if (CONFIGURATION.currentModule !== "home") {
        var a = sessionStorageTest.getItem("megaMenu");
        var b = $.jStorage.get(LocalStorageStoreLangMegaMenu);
        if (sessionStorageTest.getItem("megaMenu") == null || b !== CONFIGURATION.STORE_LANG) {
            getAjax(false, "megaMenuJson.jsp", storeMegaMenuJson)
        } else {
            buildMegaMenuJson(a)
        }
    } else {
        megaMenuHasBeenLoaded()
    }
}
function checkLocaleChangeForMegaMenu() {
    var a = $.jStorage.get(LocalStorageStoreLangMegaMenu);
    if (a == null) {
        $.jStorage.set("localeChange", 0);
        return 0
    } else {
        if (a !== CONFIGURATION.STORE_LANG) {
            $.jStorage.set("localeChange", 1);
            return 1
        } else {
            return parseInt($.jStorage.get("localeChange"))
        }
    }
}
function megaMenuHasBeenLoaded() {
    bindSubMegaMenuTitles();
    $(document).trigger("megaMenuOpened", {})
}
function storeMegaMenuJson(b) {
    try {
        sessionStorageTest.setItem("megaMenu", b);
        $.jStorage.set(LocalStorageStoreLangMegaMenu, CONFIGURATION.STORE_LANG);
        buildMegaMenuJson(b)
    } catch(a) {
        if (a === QUOTA_EXCEEDED_ERR) {
            buildMegaMenuJson(b)
        }
    }
}
var buildMegaMenuJson = function(a) {
    jsonHeader = $.parseJSON(a);
    for (key in jsonHeader) {
        var b = $("#hm-" + key);
        if (!b.find(".mega-menu-container").length) {
            b.append(htmlDecode(jsonHeader[key]))
        }
    }
    megaMenuHasBeenLoaded()
};
function initLeftMenuToggler() {
    var a = $("#togglerLeftMenu");
    a.on("click",
    function(b) {
        if ($("body").hasClass("page-type-category") && $(window).scrollTop() > 1) {
            $(window).scrollTop(0, 0)
        }
        $("body").toggleClass("headerOn");
        $(".mega-menu-container").css("display", "");
        $("#products-grid").css("display", "");
        $(".mega-menu-on").removeClass("mega-menu-on");
        $(".headerLevel1").slideToggle(200,
        function() {
            $("#header").toggleClass("headerLeftOn");
            $(this).css("display", "");
            toggleARIA(a, "aria-expanded")
        });
        b.stopImmediatePropagation()
    })
}
function initRightMenuToggler() {
    $("#togglerRightMenu").on("click",
    function(a) {
        $(this).toggleClass("toggled");
        toggleARIA($(this), "aria-expanded");
        $(".header-right").toggleClass("toggled");
        a.stopImmediatePropagation()
    })
}
function initRightMenuActiveItem() {
    var a = function() {
        $(this).attr("aria-label", $(this).attr("data-label-active"))
    };
    setTimeout(function() {
        $("#header-wish.active [data-label-active]").each(a);
        $("#header-cart.active [data-label-active]").each(a);
        $("#header-mylv.active [data-label-active]").each(a)
    },
    1000)
}
function getCookie(b) {
    var a = document.cookie.match("\\s*" + b + "\\s*=\\s*([^;]*?)\\s*(?:;|$)\\s*");
    return a && a[1]
}
var levelNav1 = "";
var levelNav2 = "";
function readCookieSubMegaMenuTitles() {
    var c = "memorized";
    var a = "";
    var b = "";
    if (document.cookie.indexOf(c + "=") != -1) {
        a = getCookie(c);
        b = a.split(",");
        levelNav1 = b[0];
        levelNav2 = b[1]
    }
}
function actionCookieSubMegaMenuTitles() {
    var c = $(".headerLevel1").find("li.level1").eq(levelNav1);
    var a = c.find("li.mega-menu-item").eq(levelNav2);
    a.addClass("mega-menu-content-on");
    a.find(".mm-push-img").addClass("postLoaderResponsive");
    try {
        if (typeof(Storage) != "undefined") {
            localStorage.setItem("levelnav2", levelNav2)
        }
    } catch(b) {
        logDebug("[INFO] current browser does not allow localStorage to be used (private mode)")
    }
}
function toggleARIA(b, a) {
    if (b.attr(a) === "false") {
        b.attr(a, "true")
    } else {
        if (b.attr(a) === "true") {
            b.attr(a, "false")
        }
    }
}
function toggletabStatus(b, a) {
    if (a === "open") {
        b.attr("aria-selected", "true");
        b.attr("tabindex", "0")
    } else {
        if (a === "close") {
            b.attr("aria-selected", "false");
            b.attr("tabindex", "-1")
        }
    }
}
function bindsMegaMenuOpeningEvents() {
    var a = $('[data-navigation="open-submenu"]');
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        a.on("click", openCloseNavigation_AS)
    } else {
        if (RESPONSIVE_MANAGER.isMediumMode()) {
            a.on("click", megaMenuMouseHandler)
        } else {
            a.on("mouseenter", megaMenuMouseHandler).on("click", megaMenuKeyboardHandler)
        }
    }
}
var timeoutID;
function megaMenuMouseHandler(d) {
    var b = $(d.target);
    var c = b.closest('[data-navigation="mega-menu"]');
    var e = $(".mega-menu-item", c).hasClass("mega-menu-content-on") ? null: c.find('[role="tab"]:first');
    var a = false;
    initResetMegaMenu();
    timeoutID = window.setTimeout(function() {
        openMegaMenu(b, a)
    },
    300);
    openSubMenuTabpanel(e)
}
function megaMenuKeyboardHandler(d) {
    var b = $(d.target);
    var c = b.closest('[data-navigation="mega-menu"]');
    var e = $(".mega-menu-item", c).hasClass("mega-menu-content-on") ? null: c.find('[role="tab"]:first');
    var a = true;
    d.preventDefault();
    initResetMegaMenu();
    openMegaMenu(b, a);
    openSubMenuTabpanel(e);
    b.focus()
}
function openCloseNavigation_AS(g) {
    initResetMegaMenu();
    var c = $(g.target);
    var b = c.parent();
    var d = b.parent('[data-navigation="mega-menu"]');
    var a = b.closest('[data-navigation="mega-menu"]').index();
    var f = $(".headerLevel1").find("li").eq(levelNav1);
    var e = f.find(".mega-menu-item").eq(levelNav2);
    if (!b.parent("li").is(".mega-menu-on")) {
        $(".mega-menu-on>div.mega-menu-container").slideToggle(300,
        function() {
            $(this).parent(".mega-menu").removeClass("mega-menu-on");
            $(this).css("display", "")
        })
    }
    $('[data-navigation="mega-menu"].mega-menu-on').not(d,
    function() {
        $('[aria-expanded="true"]', $(this)).attr("aria-expanded", "false");
        $('[role="tab"]', $(this)).attr("tabindex", "-1")
    });
    b.find(".arrow-selected").css("display", "block");
    b.siblings(".mega-menu-container").find(".mega-menu-AS-picture").addClass("postLoaderResponsive").attr("data-currentCategory", "reload");
    if (a != levelNav1) {
        e.removeClass("mega-menu-content-on").css("display", "")
    }
    b.siblings(".mega-menu-container").slideToggle(350,
    function() {
        d.toggleClass("mega-menu-on");
        b.siblings(".mega-menu-container").css("display", "");
        b.find(".arrow-selected").css("display", "");
        var h = d.hasClass("mega-menu-on");
        $('[role="tab"]', $(this)).attr("tabindex", h ? "0": "-1");
        toggleARIA(c, "aria-expanded");
        loadingImgs()
    });
    setTimeout(function() {
        if (!d.hasClass("mega-menu-on")) {
            var h = d.offset().top;
            $("html, body").animate({
                scrollTop: h
            },
            500)
        }
    },
    300);
    return false
}
function initResetMegaMenu() {
    $(".mega-menu-container, .arrow-selected").stop(true, true);
    readCookieSubMegaMenuTitles()
}
function openMegaMenu(c, a) {
    if (typeof limitedToViewport === "undefined") {
        limitedToViewport = false
    }
    var b = c.parent();
    c.closest('[data-navigation="mega-menu"]').addClass("mega-menu-on");
    if (a != true) {
        c.closest('[data-navigation="mega-menu"]').addClass("timerProtection")
    }
    c.attr("aria-expanded", "true");
    setTimeout(function() {
        c.closest('[data-navigation="mega-menu"]').removeClass("timerProtection")
    },
    1000);
    megaMenuState(b);
    loadingImgs()
}
function megaMenuState(b) {
    var a = b.closest(".mega-menu").index();
    var e = $(".headerLevel1").find("li").eq(levelNav1);
    var d = e.find(".mega-menu-item").first();
    var c = e.find(".mega-menu-item").eq(levelNav2);
    if (a != levelNav1) {
        d.addClass("mega-menu-content-on");
        d.find(".mm-push-img").addClass("postLoaderResponsive");
        c.removeClass("mega-menu-content-on")
    }
}
function bindsMegaMenuClosingEvents() {
    var a = $('[data-navigation="mega-menu"]');
    if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
        $(".mega-menu-close", a).on("click", closeMegaMenu);
        a.on("mouseleave",
        function() {
            window.clearTimeout(timeoutID);
            closeMegaMenu();
            $('[data-navigation="open-submenu"]', $(this)).blur()
        });
        $(".mega-menu-close", a).keydown(function(b) {
            if ((!b.shiftKey && b.keyCode == 9) || b.keyCode == 13 || b.keyCode == 32) {
                closeMegaMenu();
                closeSubMenuTabpanel()
            }
            if (b.keyCode == 13 || b.keyCode == 32) {
                $(b.target).closest(a).find('[data-navigation="open-submenu"]').focus()
            }
        });
        $('[role="tab"]', a).keydown(function(b) {
            if (b.shiftKey && b.keyCode == 9) {
                b.preventDefault();
                $(b.target).closest(a).find('[data-navigation="open-submenu"]').focus();
                closeMegaMenu();
                closeSubMenuTabpanel()
            }
        });
        document.addEventListener("keyup",
        function(b) {
            if (b.keyCode == 27) {
                $('.mega-menu-on [data-navigation="open-submenu"]').focus();
                closeMegaMenu();
                closeSubMenuTabpanel()
            }
        })
    } else {
        $(".mega-menu-close", a).on("click", closeMegaMenu)
    }
}
function closeMegaMenu() {
    window.setTimeout(function() {
        var a = $('[data-navigation="mega-menu"].mega-menu-on');
        $(".mega-menu-container", a).each(function() {
            $(this).fadeOut(200,
            function() {
                a.removeClass("mega-menu-on");
                $(this).removeAttr("style").removeClass("verticalViewportHandler").removeClass("horizontalViewportHandler")
            });
            $(this).siblings(".header-title").find(".arrow-selected").fadeOut(200,
            function() {
                $(this).css("display", "")
            })
        });
        $('[data-navigation="open-submenu"]', a).attr("aria-expanded", "false")
    },
    300)
}
function bindSubMegaMenuTitles() {
    megaMenuStorage();
    var a = $('[data-navigation="mega-menu"]').find('[role="tab"]');
    a.off("click keydown");
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        a.on("click", submenuHandler_AS)
    } else {
        a.on("click", submenuMouseHandler).on("keydown", submenuKeyboardHandler)
    }
}
function submenuMouseHandler(b) {
    var c = $(b.target);
    var a = c.closest(".mega-menu-item");
    submenuCookies(c);
    if (!a.hasClass("mega-menu-content-on")) {
        closeSubMenuTabpanel();
        openSubMenuTabpanel(c)
    }
}
function submenuKeyboardHandler(c) {
    var e = $(c.target);
    var b = e.closest(".mega-menu-item");
    var f = b.siblings().length;
    if (f > 0) {
        submenuCookies(e);
        if (c.keyCode == 13 || c.keyCode == 32) {
            if (!b.hasClass("mega-menu-content-on")) {
                closeSubMenuTabpanel();
                openSubMenuTabpanel(e)
            }
        } else {
            if (c.keyCode == 40 || c.keyCode == 39) {
                c.preventDefault();
                var d = (!b.is(":last-child")) ? b.next().find('[role="tab"]') : b.siblings().first().find('[role="tab"]');
                d.focus();
                closeSubMenuTabpanel();
                openSubMenuTabpanel(d)
            } else {
                if (c.keyCode == 38 || c.keyCode == 37) {
                    c.preventDefault();
                    var a = (!b.is(":first-child")) ? b.prev().find('[role="tab"]') : b.siblings().last().find('[role="tab"]');
                    a.focus();
                    closeSubMenuTabpanel();
                    openSubMenuTabpanel(a)
                }
            }
        }
    }
}
function submenuHandler_AS() {
    var b = $(this);
    var a = b.closest(".mega-menu-item");
    submenuCookies(b);
    if (!a.hasClass("mega-menu-content-on")) {
        b.closest(".relative").find("img").addClass("postLoaderResponsive");
        $(".mega-menu-on").find(".mega-menu-container").find(".mega-menu-content-on").find(".mega-menu-content").slideToggle(200,
        function() {
            $(this).closest(".mega-menu-item").removeClass("mega-menu-content-on");
            b.closest(".mega-menu-container").find('[aria-expanded="true"]').attr({
                "aria-expanded": "false",
                "aria-selected": "false"
            })
        })
    }
    b.siblings(".mega-menu-content").slideToggle(200,
    function() {
        a.toggleClass("mega-menu-content-on");
        $(this).css("display", "");
        toggleARIA(b, "aria-expanded");
        toggleARIA(b, "aria-selected")
    });
    loadingImgs()
}
function openSubMenuTabpanel(a) {
    if (typeof a === "undefined") {
        a = null
    }
    if (a != null) {
        a.closest(".relative").find("img").addClass("postLoaderResponsive");
        a.closest(".mega-menu-item").addClass("mega-menu-content-on");
        a.attr({
            "aria-selected": "true",
            tabindex: "0"
        })
    }
    loadingImgs()
}
function closeSubMenuTabpanel() {
    var a = $('[data-navigation="mega-menu"].mega-menu-on');
    var b = $(".mega-menu-content-on", a);
    b.removeClass("mega-menu-content-on");
    b.find('[role="tab"]').attr({
        "aria-selected": "false",
        tabindex: "-1"
    })
}
function submenuCookies(c) {
    var b = c.closest(".mega-menu").index();
    var a = c.closest(".mega-menu-item").index();
    document.cookie = "memorized=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "memorized=" + b + "," + a + ";path=/"
}
function megaMenuStorage() {
    $(".level1.mega-menu").one("click",
    function() {
        sessionStorage.setItem("firedMenuFirstTime", "1");
        if (typeof(Storage) != "undefined") {
            if ("levelnav2" in localStorage) {
                var d = sessionStorage.getItem("firedMenuFirstTime");
                if (d != "1") {
                    var b = localStorage.getItem("levelnav2");
                    var c = $(".headerLevel1").find("li").eq(levelNav1);
                    c.find(".mega-menu-item").removeClass("mega-menu-content-on");
                    var a = c.find(".mega-menu-item").eq(levelNav2);
                    a.addClass("mega-menu-content-on");
                    loadingImgs();
                    localStorage.clear("levelnav2")
                }
            }
        }
    })
}
function initSearch() {
    try {
        if ($("#searchHeaderFormulaire").size() === 0) {
            return
        }
        $("#searchHeaderFormulaire").on("submit", validHeaderSearch);
        initSearchHeaderAutocomplete();
        disableSubmitSearchHeader();
        if (!IE) {
            $("#header-nav form input").focus(function(b) {
                $(document).on("touchmove", preventBrowserScroll);
                return false
            }).mouseup(function() {
                return false
            }).blur(function() {
                $(document).unbind("touchmove", preventBrowserScroll)
            })
        }
    } catch(a) {
        logError("initSearch : " + a.message)
    }
}
var arrayIndexOfIE8 = function() {
    Array.prototype.indexOf = function(b) {
        var a = this.length >>> 0;
        var c = Number(arguments[1]) || 0;
        c = (c < 0) ? Math.ceil(c) : Math.floor(c);
        if (c < 0) {
            c += a
        }
        for (; c < a; c++) {
            if (c in this && this[c] === b) {
                return c
            }
        }
        return - 1
    }
};
var SHOULD_SCROLL_TO_SKU;
function handleScrollToSkuCategoryPage() {
    SHOULD_SCROLL_TO_SKU = ($.jStorage.get(localStorageShouldScrollToSku) == "true") || (localStorage.getItem(localStorageShouldScrollToSku) == "true");
    $.jStorage.set(localStorageShouldScrollToSku, "false");
    localStorage.setItem(localStorageShouldScrollToSku, "false")
}
function callbackSearchHeaderOpened() {
    handleFixedHeader();
    setContentSize()
}
function handleFixedHeader() {
    if ($(".header").css("position") != "fixed") {
        return
    }
    var a = $(".header").height();
    $(".content").css("padding-top", a);
    addCssWithPrefix($(".content"), "transition", "padding-top 0.3s")
}
function addCssWithPrefix(c, a, d) {
    for (var b = 0; b < prefixes.length; b++) {
        c.css(prefixes[b] + "transition", d)
    }
}
function handleCartBubblePosition() {
    var e = $(window);
    var b = $(".page");
    var a = (e.width() - b.width()) / 2;
    var d = (a == 0) ? 0 : a;
    var c = $(".cart");
    if (CONFIGURATION.STORE_TYPE === "shop") {
        $(".shopping-bag").css("right", -1 * ($(window).width() - c.offset().left - c.width()) + 13 + d)
    }
}
function handleCartIconBehaviour() {
    var d = $("#header-cart");
    $(".cart").unbind("click");
    var e = parseInt($("#header .always-displayed-first-menu-item .cart .count").html());
    if (!e) {
        d.addClass("empty-cart")
    } else {
        d.removeClass("empty-cart")
    }
    var b = window.isTablet() ? "click": "mouseover";
    var a = function(f) {
        window.setTimeout(function() {
            $(".shopping-bag, .arrow-selected", d).stop(true, true);
            handleCartBubblePosition();
            var g = parseInt($("#header .always-displayed-first-menu-item .cart .count").html());
            if (!g) {
                return false
            }
            if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
                if (d.length) {
                    if (b.indexOf("click") > -1) {
                        d.toggleClass("shopping-bag-on")
                    } else {
                        d.addClass("shopping-bag-on");
                        $(".header-title", d).attr("aria-expanded", "true")
                    }
                }
                if (!d.attr("data-imgloaded")) {
                    d.find("img").addClass("postLoaderResponsive");
                    loadingImgs();
                    d.attr("data-imgloaded", "true");
                    handleProductDisplayMSB()
                }
            }
        },
        300)
    };
    if (!RESPONSIVE_MANAGER.isMediumMode() && !RESPONSIVE_MANAGER.isAllSmallMode() && !window.isTablet()) {
        $(".cart, .arrow-selected, .shopping-bag", d.parent()).on(b, a);
        $("#header-cart #header-shoppingBag").on("click",
        function() {
            if ($("#header-shoppingBag").is("[aria-expanded=true]")) {
                document.location.href = $(".header-title", d).attr("data-href")
            } else {
                a()
            }
        })
    } else {
        $("#header-cart:not(.empty-cart) #header-shoppingBag").on("click",
        function() {
            document.location.href = $(".header-title", d).attr("data-href")
        })
    }
    var c = function() {
        window.setTimeout(function() {
            $(".shopping-bag", d).fadeOut(200,
            function() {
                $(this).parent(".cart").removeClass("shopping-bag-on");
                $(".header-title", d).attr("aria-expanded", "false");
                $(this).css("display", "")
            });
            $(".arrow-selected", d).fadeOut(200,
            function() {
                $(this).css("display", "")
            })
        },
        300)
    };
    $(".shopping-bag-close").unbind("click");
    $(".shopping-bag-close").on("click", c);
    $(".cart, .arrow-selected, .shopping-bag", d.parent()).on("mouseleave", c);
    $("#header-cart").on("focusout",
    function() {
        var f = $(this);
        setTimeout(function() {
            var g = !!(f.find(":focus").length > 0);
            if (!g) {
                c()
            }
        },
        10)
    });
    bindGoToCheckout()
}
function handleMyLVBubblePosition() {
    var f = $(window);
    var c = $(".page");
    var b = (f.width() - c.width()) / 2;
    var e = (b == 0) ? 0 : b;
    var d = $("#header-mylv");
    var a = d.offset() ? d.offset().left: 0;
    $(".mylv-bubble").css("right", -1 * (f.width() - a - d.width()) + 28 + e)
}
function handleMyLVIconBehaviour() {
    handleMyLVBubblePosition();
    var e = $("#header-mylv");
    var b = $("[aria-expanded]", e);
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {} else {
        if (window.isTablet()) {
            b.on("click", d)
        } else {
            b.on("mouseover", a).on("click", d).on("keydown", c)
        }
    }
    if (window.LVMCN) {
        $(document).on("click", "#forgotPwd_bubble",
        function() {
            $("input[type=email]:visible").first().btOff();
            $(".sign-in-mode").css("display", "none");
            $(".pwd-mode").css("display", "block");
            if (RESPONSIVE_MANAGER.isAllSmallMode()) {
                $("#header").addClass("headerLeftOn");
                $("#mylvAsExpandContent").css("display", "block");
                $(window).scrollTop(0)
            } else {
                if (RESPONSIVE_MANAGER.isXtraMediumMode()) {
                    $(".header-right").addClass("toggled");
                    f(event, limitedToViewport = true)
                } else {
                    f(event, limitedToViewport = true)
                }
            }
            getAjax(true, "getCaptchaAjax.jsp",
            function(h) {
                var g = JSON.parse(h);
                captchaUrl = g.response;
                if (captchaUrl == "Error While Calling Captcha") {
                    $("#forgotPasswordForm_mylv-bubble .form-line.captcha").html(captchaUrl)
                } else {
                    captchaUrl = captchaUrl.replace(/&amp;/g, "&");
                    getForgotCaptcha(captchaUrl)
                }
            });
            $(".send-otp").attr("disabled", true)
        })
    }
    $(".mylv-bubble-close").unbind("click").on("click", closeLoginPopin).on("keydown", closeLoginPopin);
    function a(g) {
        if (!$("body").hasClass("user-logged-in")) {
            window.setTimeout(function() {
                f(g, limitedToViewport = true)
            },
            300)
        }
    }
    function d(g) {
        if ($("body").hasClass("user-logged-in")) {
            window.location.replace(document.getElementsByTagName("body")[0].getAttribute("data-welcomePage"))
        } else {
            window.setTimeout(function() {
                f(g, limitedToViewport = true)
            },
            300)
        }
    }
    function c(g) {
        if (g.keyCode == 13 || g.keyCode == 32) {
            if ($("body").hasClass("user-logged-in")) {
                window.location.replace(document.getElementsByTagName("body")[0].getAttribute("data-welcomePage"))
            } else {
                f(g, limitedToViewport = true)
            }
        }
    }
    function f(k, g) {
        if (typeof g === "undefined") {
            g = false
        }
        handleMyLVBubblePosition();
        var l = $("#header-mylv");
        var h = $("[aria-expanded]", l);
        var m = l.find(".mylv-bubble");
        $(".mylv-bubble, .arrow-selected", l).stop(true, true);
        if (l.length) {
            l.addClass("mylv-bubble-on");
            h.attr("aria-expanded", "true")
        }
        $(".welcomePage").textfill({
            maxFontPixels: 18
        })
    }
}
function closeLoginPopin(a) {
    window.setTimeout(function() {
        var c = $("#header-mylv");
        var b = $("[aria-expanded]", c);
        $(".mylv-bubble", c).fadeOut(200,
        function() {
            c.removeClass("mylv-bubble-on");
            b.attr("aria-expanded", "false");
            $(this).removeAttr("style").removeClass("verticalViewportHandler").removeClass("horizontalViewportHandler")
        });
        $(".arrow-selected", c).fadeOut(200,
        function() {
            $(this).css("display", "")
        });
        if (a && (a.keyCode == 27 || a.keyCode == 13 || a.keyCode == 32)) {
            a.preventDefault();
            b.focus()
        }
    },
    800)
}
function bindReturnExchange() {
    $(".textSample .return-policy").click(function(a) {
        $("#clientInfo [data-id='returnexchange']").click()
    })
}
function bindGoToCheckout() {
    $(".goToCheckout").unbind("click");
    $(".goToCheckout").click(function() {
        if (validatePerfume()) {
            $("#orderCheckout").click();
            $("#orderCheckoutcart").click()
        }
    })
}
function validatePerfume() {
    var b = $(".sampleTable");
    if (b.length != 0) {
        var a = b.find("input:checked");
        if (a.length == 0) {
            $(".alert-sample").show();
            $(document).scrollTop(0);
            return false
        }
    }
    $(".alert-sample").hide();
    return true
}
function handleProductDisplayMSB() {
    var f = $("#msb_product_list li");
    var e = $(".msb-picture-wrapper");
    var a = 0;
    var g;
    var b = 0;
    var d = new Array();
    for (var c = 1; c <= f.size(); c++) {
        g = $("#msb_product_list li:nth-child(" + c + ")");
        d[b++] = g;
        liHeight = g.outerHeight();
        if (liHeight > a) {
            a = liHeight
        }
    }
    $.each(d,
    function(k, h) {
        h.height(a)
    });
    if ($("#product_2").length === 0) {
        e.addClass("momPictureWrapper-default")
    } else {
        e.removeClass("momPictureWrapper-default")
    }
}
function strip_tags(html) {
    if (arguments.length < 3) {
        html = html.replace(/<\/?(?!\!)[^>]*>/gi, "");
        html = html.replace("<", "").replace(">", "").replace('"', "").replace("'", "").replace(".", "").replace(";", "")
    } else {
        var allowed = arguments[1];
        var specified = eval("[" + arguments[2] + "]");
        if (allowed) {
            var regex = "</?(?!(" + specified.join("|") + "))\b[^>]*>";
            html = html.replace(new RegExp(regex, "gi"), "")
        } else {
            var regex = "</?(" + specified.join("|") + ")\b[^>]*>";
            html = html.replace(new RegExp(regex, "gi"), "")
        }
    }
    var clean_string = html;
    return clean_string
}
function loadingExpands() {
    $(".exp_title").each(function() {
        var obj = $(this);
        var scope = obj.attr("data-scope");
        if (obj.attr("data-binded")) {
            return true
        }
        var target = $("#" + obj.attr("data-target"));
        var group = obj.attr("data-group");
        var callback = obj.attr("data-callback");
        var callbackAfterExpand = obj.attr("data-callbackAfterExpand");
        obj.not(".bound").addClass("bound").on("click",
        function() {
            if ($("#searchForm").is(":visible")) {
                return false
            }
            if (scope !== undefined && !RESPONSIVE_MANAGER.isModeNamed(scope)) {
                return false
            }
            if (isIdevice && ($("#filter-news-block").length != 0)) {
                if (target.css("display") == "none") {
                    obj.addClass("target-on")
                } else {
                    obj.removeClass("target-on")
                }
            } else {
                obj.toggleClass("target-on");
                if (utag_data.pageType == "client_services") {
                    if (obj.hasClass("faqTab") && obj.hasClass("target-on")) {
                        var chapterNumber = obj.find(".tagClick").attr("data-detail");
                        chapterNumber++;
                        fireEvent("clientServicesFaqChapterUnfolded", {
                            chapterNumber: chapterNumber
                        })
                    }
                    if (obj.hasClass("faqSubTab") && obj.hasClass("target-on")) {
                        var questionNumber = obj.attr("id").replace("descriptchapter_", "");
                        fireEvent("clientServicesFaqQuestionUnfolded", {
                            questionNumber: questionNumber
                        })
                    }
                }
            }
            toggleARIA(obj, "aria-expanded");
            toggleARIA(obj.find("button"), "aria-expanded");
            $("." + group + ".expand-on").not(target).slideToggle().toggleClass("expand-on");
            if ((obj.hasClass("myLVmobile") && $("body").hasClass("user-logged-in"))) {
                window.location.replace(document.getElementsByTagName("body")[0].getAttribute("data-welcomePage"))
            } else {
                target.slideToggle("ease",
                function() {
                    disableSubmitSearchHeader();
                    if (obj.attr("data-scroll") != undefined) {
                        scrollToElement(obj)
                    }
                    if (callbackAfterExpand) {
                        eval(callbackAfterExpand)
                    }
                })
            }
            if (! (isIdevice && ($("#filter-news-block").length != 0))) {
                target.toggleClass("expand-on");
                target.find(".drop-up-close").focus()
            }
            $(".exp_title[data-group=" + group + "]").not(this).removeClass("target-on").attr("aria-expanded", "false");
            if (target.find(".welcomePage").length) {
                target.find(".welcomePage").textfill({
                    maxFontPixels: 23
                })
            }
            if (callback) {
                eval(callback)
            }
        });
        obj.attr("data-binded", true)
    });
    $(".exp_content").find('[class*="close"]').not(".bound").addClass("bound").click(function() {
        var target = $(this).parent(".exp_content");
        target.slideToggle("ease");
        target.toggleClass("expand-on");
        $('[data-target="' + target.attr("id") + '"]').removeClass("target-on").attr("aria-expanded", "false").focus()
    })
}
function buildExternalLink() {
    $(".externalLink").each(function(c) {
        var d = $(this);
        var b = $.trim(d.text());
        var a = d.attr("data-link");
        d.hasClass("notLink") ? d.attr("data-href", a) : d.attr("href", a);
        d.removeClass("externalLink");
        d.removeAttr("data-link");
        if (isIE_InfEq8) {
            d.text(b)
        }
    })
}
function buildNotCrawlableContent() {
    $(".notCrawlableContent").each(function(a) {
        var c = $(this);
        var b = c.attr("data-htmlContent");
        c.html(b);
        c.removeClass("notCrawlableContent");
        c.removeAttr("data-htmlContent")
    })
}
function preventBrowserScroll(a) {
    if (!$(a.target).parents(".modal_tc").length) {
        a.preventDefault()
    }
}
function resetBrowserScroll() {
    $(document).unbind("touchmove", preventBrowserScroll)
}
function attachInitEvents() {
    initDocumentClickEvent();
    setTimeout(RESPONSIVE_MANAGER.checkResizeEvent.bind(RESPONSIVE_MANAGER), 1000);
    registerEvent("windowResize", loadingImgs.bindOld(RESPONSIVE_MANAGER));
    handleBodyClick();
    handleSubMenuFooter();
    bindAddressModals();
    loadPlaceHolders();
    closePanelsDetail();
    $(".backOnTop").click(function() {
        $("html, body").animate({
            scrollTop: 0
        },
        "ease")
    });
    document.onreadystatechange = function() {
        if (document.readyState == "complete") {
            fireEvent("documentComplete")
        }
    }
}
function handleBodyClick() {
    $("body").click(function(a) {
        if ($(a.target).attr("id") == "undefined") {
            $(".link").removeClass("hover");
            $(".link").find(".level2").hide()
        }
    })
}
function handleSubMenuFooter() {
    $("ul.level1").find("li.link").each(function(a) {
        $(this).click(function(b) {
            if ($(this).attr("class") != "link hover") {
                $("li.link").removeClass("hover").find(".level2").hide()
            }
            $(this).toggleClass("hover");
            $(this).find(".level2").slideToggle("fast")
        })
    })
}
function initDocumentClickEvent() {
    $(document).on("click touchstart", handleDocumentClickDownEvent);
    $(document).on("click touchend", handleDocumentClickEvent);
    $(document).on("scroll touchmove", handleDocumentMoveEvent);
    document.addEventListener("keyup",
    function(a) {
        if (a.keyCode == 27) {
            closeDropUpPanels();
            closeLoginPopin();
            closeSharingBubble()
        }
    })
}
function handleDocumentClickDownEvent(a) {
    CONFIGURATION.SCROLL_DETECTED = false
}
function handleDocumentMoveEvent(a) {
    CONFIGURATION.SCROLL_DETECTED = true
}
function resetSearchHeader() {
    $("#searchHeaderInput").val("")
}
function openProductDetailsAccordian() {
    var a = document.querySelectorAll('[data-id="DefaultOpenAccordian"]');
    if (a.length) {
        $(a).toggleClass("target-on");
        $("#productDescriptionMenu").toggleClass("target-on");
        $("#textClientInfo_productDescription").show().toggleClass("expand-on")
    }
}
function closePanelsDetail() {
    if (window.is_touch_device()) {
        $(".titleClientInfo").on("click",
        function() {
            $(this).addClass("currentPanelOpened");
            var a = $(this).closest(".infoProductBlockBottom").find(".titleClientInfo").not(".currentPanelOpened").next(".expand-on");
            a.each(function() {
                $(this).slideToggle(200);
                $(this).toggleClass("expand-on");
                $(".target-on").not(".openStateReminder").removeClass("target-on").attr("aria-expanded", "false")
            });
            $(this).removeClass("currentPanelOpened")
        })
    }
}
function closeSharingBubble(a) {
    if ($("#sharingBubble").css("display") == "block") {
        $("#sharingBubble .closeButton").click()
    }
}
function closeDropUpPanels() {
    $(".dropUp.expand-on").slideToggle(200).toggleClass("expand-on");
    $(".dropUpTrigger.target-on").removeClass("target-on").attr("aria-expanded", "false").focus()
}
function closeTogglerRightMenu() {
    $("#header .header-right").css("z-index", 101).fadeOut(200,
    function() {
        $(this).css("z-index", "").removeClass("toggled").css("display", "")
    })
}
function closeAddToCartModal() {
    var b = $(".blackWrapper").find("div.modal_addTocart").length > 0,
    a = "#closeButtonModal";
    if (b) {
        $(a).click()
    }
}
function handleDocumentClickEvent(c) {
    if ($(".formCurtain").is(":visible") || CONFIGURATION.SCROLL_DETECTED) {
        CONFIGURATION.SCROLL_DETECTED = false;
        return
    }
    if ($("#dispatchContent").length) {
        return 1
    }
    var b = $(c.target);
    var d = !b.hasClass("exp_title") && !b.parents().hasClass("exp_title") && !b.hasClass("exp_content") && !b.parents().hasClass("exp_content") && !b.hasClass("hotstampingModal") && !b.parents().hasClass("hotstampingModal") && !b.parents().hasClass("blackWrapper") && !(b.prop("id") == "productDescriptionMenu") && !(b.prop("id") == "textClientInfo_productDescription");
    if (!b.parents().hasClass("mega-menu")) {
        if (RESPONSIVE_MANAGER.isAllSmallMode()) {
            $("#header .mega-menu-on>div.mega-menu-container").each(function() {
                $(this).slideToggle(200,
                function() {
                    $(this).parent(".mega-menu").removeClass("mega-menu-on");
                    $(this).css("display", "")
                })
            })
        } else {
            $("#header .mega-menu-on>div.mega-menu-container").each(function() {
                $(this).fadeOut(200,
                function() {
                    $(this).parent(".mega-menu-on").removeClass("mega-menu-on").find(".mega-menu-content-on").removeClass(".mega-menu-content-on");
                    $(this).css("display", "")
                });
                $(this).siblings(".header-title").find(".arrow-selected").fadeOut(200,
                function() {
                    $(this).css("display", "")
                })
            })
        }
    }
    if (d && !isTouchScreenDevice()) {
        $(".target-on").not(".openStateReminder, #productDescriptionMenu").each(function() {
            if ($(this).data("target") != "textClientInfo_productDescription") {
                $(this).removeClass("target-on");
                $(this).attr("aria-expanded", "false")
            }
        })
    }
    var a = $(".dropUp");
    if (!a.is(b) && a.has(b).length === 0 && !b.hasClass("dropUpTrigger") && !b.parents().hasClass("dropUpTrigger")) {
        closeDropUpPanels()
    }
    if (!b.parents().hasClass("cart") && !b.hasClass("cart")) {
        if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
            if ($(".shopping-bag").length > 0) {
                $(".always-displayed-first-menu-item").css("z-index", 100)
            }
            $(".shopping-bag").css("z-index", 101).fadeOut(200,
            function() {
                $(".cart").removeClass("shopping-bag-on");
                $(this).css("display", "");
                $(".always-displayed-first-menu-item").css("z-index", "");
                $(this).css("z-index", "")
            });
            $("#header .always-displayed-first-menu-item .cart .arrow-selected").fadeOut(200,
            function() {
                $(this).css("display", "")
            })
        }
    }
    if (!b.parents().hasClass("myLV") && !b.hasClass("myLV")) {
        if (c.target.id != "forgotPwd_bubble") {
            if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
                if ($(".mylv-bubble").length > 0) {
                    $(".header-right").css("z-index", 100)
                }
                $(".mylv-bubble").css("z-index", 101).fadeOut(200,
                function() {
                    $(".myLV").removeClass("mylv-bubble-on");
                    $(".myLV [aria-expanded]").attr("aria-expanded", "false");
                    $(this).css("display", "");
                    $(".header-right").css("z-index", "");
                    $(this).css("z-index", "")
                });
                $("#header .header-right .myLV .arrow-selected").fadeOut(200,
                function() {
                    $(this).css("display", "")
                })
            }
        }
    }
    if (c.target.id != "forgotPwd_bubble") {
        if (!b.hasClass("togglerRightMenu") && $("#header .togglerRightMenu").is(":visible") && !b.parents().hasClass("header-right") && !b.parents().hasClass("search-form")) {
            closeTogglerRightMenu()
        }
    }
}
function bindAddressModals() {
    $(".openModal").each(function() {
        bindModal($(this))
    })
}
function bindModal(a) {
    if (a.hasClass("openModal")) {
        a.modalize();
        a.removeClass("openModal")
    }
}
function loadPlaceHolders() {
    $(".ajaxPlaceHolder").each(function() {
        loadPlaceHolder($(this))
    })
}
function loadPlaceHolder(placeHolder) {
    var secure = placeHolder.attr("data-secure") != null;
    var url = placeHolder.attr("data-src");
    var paramString = placeHolder.attr("data-parameters");
    var params = {};
    eval("params =" + paramString);
    getAjax(secure, url,
    function(data) {
        placeHolder.html(data)
    },
    params)
}
function checkPageChange() {
    var a = $.jStorage.get("lvCurrentPage");
    if (CONFIGURATION.currentPage != a) {
        $.jStorage.set("lvCurrentPage", CONFIGURATION.currentPage);
        fireEvent("pageChanged")
    }
    setTimeout(checkPageChange, 500)
}
function activeBackgroundScrolling() {
    $("body").removeClass("noscroll");
    $("html").removeClass("noscroll");
    $(".page").unbind("DOMMouseScroll mousewheel")
}
function preventBackgroundFromScrolling() {
    $("body").addClass("noscroll");
    $("html").addClass("noscroll");
    $(".page").bind("DOMMouseScroll mousewheel",
    function(e) {
        var g = $(this),
        f = this.scrollTop,
        d = this.scrollHeight,
        b = g.height(),
        h = (e.type == "DOMMouseScroll" ? e.originalEvent.detail * -40 : e.originalEvent.wheelDelta),
        a = h > 0;
        var c = function() {
            e.stopPropagation();
            e.preventDefault();
            e.returnValue = false;
            return false
        };
        if (!a && -h > d - b - f) {
            g.scrollTop(d);
            return c()
        } else {
            if (a && h > f) {
                g.scrollTop(0);
                return c()
            }
        }
    })
}
var disableFormSubject2 = function() {
    $("#subject2").attr("disabled", true)
};
function closeAllClickableSubDiv() {
    $(".link").removeClass("hover").find(".level2").hide();
    $(".filtersList").hide();
    $("#months").hide();
    $(".level1").find(".level2").hide()
}
function getDeviceTemporaryFunction() {
    return RESPONSIVE_MANAGER.isAllSmallMode() ? "smartphone": "tablet"
}
function setContentSize() {
    var a = $(window);
    ww = a.width();
    wh = a.outerHeight();
    $("body").css({
        height: "100%",
        overflow: "visible"
    });
    $(".page").each(function() {
        var g = $(this),
        d = $("#header", g),
        e = $(".checkout_header", g),
        k = $(".footer", g),
        f = $(".content", g);
        var c = (d.length ? d.height() : 0) + (e.length ? e.height() : 0);
        var h = k.length ? k.height() : 0;
        var l = f.length ? f.height() : 0;
        var m = wh - c - h;
        f.attr("data-relativeHeight", m);
        if (f.attr("data-scrollable") == "false") {
            f.css("height", m + "px")
        } else {
            if ((f.attr("data-resize") === undefined || f.attr("data-resize") != "false") && l < m) {
                f.css("min-height", m + "px")
            }
        }
        var b = navigator.appVersion;
        if (b.indexOf("iPad") != -1 && (b.indexOf("OS 4_") != -1 || b.indexOf("OS 3_") != -1)) {
            k.css("position", "relative");
            g.css({
                position: null,
                "padding-bottom": 0
            })
        }
    });
    $(".page").find(".content").css("opacity", 1);
    a.scrollTop(a.scrollTop() + 1);
    a.scrollTop(a.scrollTop() - 1)
}
function postAjax(c, e, d, h, n, l, f, m) {
    if (m === undefined) {
        m = {}
    }
    var b;
    if (m.isEndeca) {
        b = (e) ? CONFIGURATION.SECURE_AJAX_DOMAIN: CONFIGURATION.AJAX_DOMAIN;
        b += "/" + CONFIGURATION.STORE_LANG + "/"
    } else {
        b = (e) ? CONFIGURATION.SECURE_AJAX_ROOT: CONFIGURATION.AJAX_ROOT
    }
    if (d === undefined || d === null || d === "") {}
    b += d;
    b += "?storeLang=" + CONFIGURATION.STORE_LANG;
    if (m.staticParams != undefined) {
        b += "&" + m.staticParams
    }
    var a = AJAX_CACHE_MAP[d];
    if (!e && a === null) {}
    if (a != null) {
        b += "&cache=" + a
    }
    if (n !== null) {
        logError(n + " is not handled")
    }
    for (var g in l) {
        b += "&" + g + "=" + l[g]
    }
    var k = true;
    if (e && CONFIGURATION.currentPageIsSecure) {
        k = false
    }
    logDebug("postAjax : needCrossDomain: " + k);
    if (!k || $.support.cors) {
        logDebug("postAjax : direct ajax call");
        return $.ajax({
            type: "POST",
            url: b,
            data: c,
            xhrFields: {
                withCredentials: true
            },
            success: function(o) {
                h(o);
                scrollToError()
            },
            error: function(o) {
                f(o)
            }
        })
    } else {
        logDebug("getAjax : using xdr proxy (iframe " + (IFRAME_READY ? "": "not ") + "ready)");
        createsIFrame().done(function() {
            logDebug("postAjax : trigger call (iframe " + (IFRAME_READY ? "": "not ") + "ready)");
            var o = CONFIGURATION.XDR_CALLBACKS.push(h);
            document.getElementById(getIframeId(e)).contentWindow.postMessage(JSON.stringify({
                url: b,
                id: o - 1,
                type: "POST",
                data: c
            }), "*")
        }).fail(function() {
            logError("tryed to use xdr proxies but failed to create iframes")
        });
        return false
    }
}
function getAjax(f, e, k, l, c, g, d) {
    var b = (f) ? CONFIGURATION.SECURE_AJAX_ROOT: CONFIGURATION.AJAX_ROOT;
    if (e === undefined || e === null || e === "") {
        return
    }
    if (e == "/article_search_result") {
        b = CONFIGURATION.HOME_URL;
        b = b.replace("/homepage", "")
    }
    b += e;
    b += "?storeLang=" + CONFIGURATION.STORE_LANG;
    var a = AJAX_CACHE_MAP[e];
    if (!f && a === null) {}
    if (a != null) {
        b += "&cache=" + a
    }
    if (CONFIGURATION.currentModule != null && CONFIGURATION.currentModule !== "") {
        b += "&module=" + CONFIGURATION.currentModule
    }
    if (CONFIGURATION.pageType != null && CONFIGURATION.pageType !== "") {
        b += "&pageType=" + CONFIGURATION.pageType
    }
    if (CONFIGURATION.categoryParam != null && CONFIGURATION.categoryParam !== "") {
        b += "&category=" + CONFIGURATION.categoryParam
    }
    for (var h in l) {
        b += "&" + h + "=" + l[h]
    }
    if (c !== undefined) {
        b += "&" + c
    }
    var m;
    if ($.support.cors) {
        m = $.ajax($.extend({},
        d, {
            type: "GET",
            url: b,
            success: k,
            error: g,
            cache: !f,
            xhrFields: {
                withCredentials: true
            }
        }))
    } else {
        createsIFrame().done(function() {
            var n = CONFIGURATION.XDR_CALLBACKS.push(k);
            document.getElementById(getIframeId(f)).contentWindow.postMessage(JSON.stringify({
                url: b,
                id: n - 1,
                type: "GET"
            }), "*")
        }).fail(function() {
            logError("tryed to use xdr proxies but failed to create iframes")
        })
    }
    return m
}
function getMoMAjax(c, a, b) {
    $.ajax({
        type: "GET",
        url: a,
        success: b,
        xhrFields: {
            withCredentials: true
        }
    })
}
function postMoMAjax(c, a, b, e, d) {
    $.ajax({
        type: "POST",
        url: a,
        data: d,
        success: b,
        error: e,
        xhrFields: {
            withCredentials: true
        }
    })
}
function createMoMRenditions(k, b, h, e) {
    var f = h.split("/");
    var g = "";
    for (var d = 1; d < f.length; d++) {
        g = g + "/";
        g = g + f[d]
    }
    var a = k + "/MoMPicture/masterRendition";
    var c = "initPath=" + b + "&destinationPath=" + g + "&renditions=" + e;
    postMoMAjax(false, a, callbackSuccessMoMGeneration, callbackErrorMoMGeneration, c)
}
function handleMoMRenditions(f) {
    if (mom_init_path_array.length > f) {
        var b = mom_destination_path_array[f];
        var e = b.split("/");
        var a = "";
        for (var d = 1; d < e.length; d++) {
            a = a + "/";
            a = a + e[d]
        }
        var c = mom_domain_name + "/MoMPicture/masterRendition";
        var g = "initPath=" + mom_init_path_array[f] + "&destinationPath=" + a + "&renditions=" + mom_renditions;
        postMoMAjax(false, c,
        function() {
            handleMoMRenditions(f + 1)
        },
        callbackOrderErrorMoMGeneration, g)
    } else {
        callbackOrderErrorMoMGeneration()
    }
}
function callbackSuccessMoMGeneration() {
    logDebug("Generation successfull")
}
function callbackErrorMoMGeneration() {
    logDebug("Generation failed")
}
function callbackOrderErrorMoMGeneration() {
    submitNextChainLink()
}
function getGetParameter(b) {
    var a = location.search.substring(1, location.search.length);
    return getGetParameterFromQueryString(b, a)
}
function getGetHashParameter(b) {
    var a = location.hash.substring(1, location.hash.length);
    return getGetParameterFromQueryString(b, a)
}
function getGetParameterFromQueryString(d, c) {
    var b = "";
    var a = c.split("&");
    for (i = 0; i < a.length; i++) {
        param_name = a[i].substring(0, a[i].indexOf("="));
        if (param_name == d) {
            b = a[i].substring(a[i].indexOf("=") + 1)
        }
    }
    return b
}
function getReferrer() {
    var a = decodeURIComponent(getGetParameter("dr"));
    if (a == null || a == "") {
        a = document.referrer
    }
    return a
}
Function.prototype.bindOld = function(b) {
    var a = this;
    return function() {
        var c = arguments;
        if (c.length > 0) {
            var d = c[0];
            if (jQuery.isFunction(d.preventDefault)) {
                c = c.length > 1 ? c.slice(1) : []
            }
        }
        a.apply(b, c)
    }
};
function replaceAll(a, b, c) {
    return a.replace(new RegExp(b, "g"), c)
}
if (!Object.keys) {
    Object.keys = function(c) {
        var b = [];
        for (var a in c) {
            if (c.hasOwnProperty(a)) {
                b.push(a)
            }
        }
        return b
    }
}
function getIndexInArray(c, b) {
    for (var a = 0; a < c.length; a++) {
        if (b.toLowerCase() == c[a].toLowerCase()) {
            return a
        }
    }
    return - 1
}
function haveToScroll() {
    $(".page").append("<div class='hackIos' style='position:absolute;top:999999px;left:0px;width:100px;height:100px;'></div>");
    setTimeout(function() {
        $(".hackIos").remove()
    },
    50)
}
function setImageModalSize() {
    if (!RESPONSIVE_MANAGER.isAllSmallMode()) {
        $(".modal .container img").width($(window).width() * 0.6)
    } else {
        $(".modal .container img").width($(window).width())
    }
}
function getDeviceTypeFromAkamaiHeader() {
    if (IS_LOADING_DEVICE_TYPE) {
        return
    }
    IS_LOADING_DEVICE_TYPE = true;
    getAjax(false, "getDeviceTypeFromAkamaiHeader.jsp",
    function(a) {
        var b = $.parseJSON(a);
        if (b.device) {
            $.jStorage.set("deviceType", b.device)
        } else {
            $.jStorage.set("deviceType", getDeviceTypeWithBreakpoints())
        }
        fireEvent("getDeviceTypeEvent");
        IS_LOADING_DEVICE_TYPE = false
    },
    {
        userAgent: navigator.userAgent
    })
}
function getDeviceTypeWithBreakpoints() {
    if (RESPONSIVE_MANAGER.isSmallMode()) {
        return "smartphone"
    } else {
        if (RESPONSIVE_MANAGER.isMediumMode()) {
            return "tablet"
        } else {
            return "desktop"
        }
    }
}
function isTablet() {
    return getDeviceType() == "tablet"
}
function isSmartphone() {
    return getDeviceType() == "smartphone"
}
function isDesktop() {
    return getDeviceType() == "desktop"
}
function getDeviceType() {
    return (typeof(Storage) !== "undefined" && typeof $.jStorage !== "undefined") ? $.jStorage.get("deviceType") : getDeviceTypeWithBreakpoints()
}
var pushStateOptions = {
    locationAttribute: "data-filteredUrl"
};
var currentHash;
function pushStateWithHashFallback(a) {
    if (window.history.pushState) {
        window.history.pushState(null, null, a)
    } else {
        currentHash = a;
        window.location.hash = a
    }
}
if (window.history.pushState) {
    window.onpopstate = function() {
        $(window).trigger("lv.pagechanged", [document.location])
    }
} else {
    $(window).on("hashchange",
    function() {
        if (window.location.hash.indexOf("#/") === 0 || window.location.hash === "") {
            var a = window.location.hash.substring(1);
            if (a !== currentHash) {
                $(window).trigger("lv.pagechanged", [a]);
                currentHash = a
            }
        }
    })
}
function updateLocation(g, b) {
    if (pushStateOptions.locationAttribute && b && b.jquery) {
        var a = b.is("[" + pushStateOptions.locationAttribute + "]") ? b.filter("[" + pushStateOptions.locationAttribute + "]") : $("[" + pushStateOptions.locationAttribute + "]:first", b);
        var c = a.attr(pushStateOptions.locationAttribute);
        var f = $(".filteredUrlContainer:first").attr("data-filteredUrl");
        var d = f + c;
        if (f && c) {
            window.pushStateWithHashFallback(d)
        }
    }
}
$(document).on("lv.content.received", updateLocation);
function getUrlBitly(a) {
    if (a != undefined) {
        localStorageShareBitly = "bitly_share_" + encodeURIComponent(a)
    }
    if ($.jStorage.get(localStorageShareBitly)) {} else {
        getAjax(false, "bitly/getBitlyLink.jsp",
        function(b) {
            b = JSON.parse(b);
            $.jStorage.set(localStorageShareBitly, b.short_url)
        },
        {
            longUrl: (a != undefined) ? encodeURIComponent(a) : encodeURIComponent(CONFIGURATION.FULL_URL),
            convertToUTF8: true
        })
    }
}
function sharePinterest(a, c) {
    var b = a.attr("data-href");
    b = encodeURI(b) + "&media=" + c;
    a.attr("href", b)
}
function shareWeibo(a, c) {
    var b = a.attr("data-href");
    b = b + "&pic=" + c;
    a.attr("href", b)
}
function shareByMail(d) {
    if (d == undefined) {
        d = $.jStorage.get(localStorageShareBitly)
    }
    var a = $(".share-mail");
    var e = a.attr("data-msg");
    var b = a.attr("data-subject");
    var c = e.replace("[short_url]", d);
    c = c.replace(/%0A/g, "\n");
    b = b.replace(/%0A/g, "\n");
    window.location = "mailto:?subject=" + encodeURIComponent(b) + "&body=" + encodeURIComponent(c)
}
function shareCartByMail() {
    var a = $(".share-mail");
    var c = a.attr("data-msg");
    var b = a.attr("data-subject");
    c = c.replace(/%0A/g, "\n");
    b = b.replace(/%0A/g, "\n");
    window.location = "mailto:?subject=" + encodeURIComponent(b) + "&body=" + encodeURIComponent(c)
}
function startTestPerf() {
    window.start2 = new Date().getTime();
    $("#TEST_PERF").html("Begin...")
}
function endTestPerf() {
    window.end2 = new Date().getTime();
    $("#TEST_PERF").html("D: " + (start2 - end2) + " ")
}
function centerDiv() {
    $(".centerDivBackImg").each(function() {
        var a = $(this);
        var h = a.attr("data-center");
        var c = a.attr("data-mode");
        var g = a.hasClass("onlyMediumLarge");
        if (g && !RESPONSIVE_MANAGER.isMediumLargeMode() && !isIE_InfEq8) {
            a.css("top", "auto")
        } else {
            var b = (h && (!c || RESPONSIVE_MANAGER.isModeFromSuffix(c))) ? $(h) : a.parent();
            var e = b.height();
            var f = a.height();
            var d = (e - f) / 2;
            a.css("top", d)
        }
    })
}
function switchTab(e) {
    $("#helpPopin .popinTitle").hide();
    $("#helpPopin .horizontalLineTop").hide();
    var b = $(".accordionWrapper");
    var g = $(".accordionPopinHeader");
    var c = $(".popinWrapper .popinContent");
    var f = $("#" + e + "PopinWrapper.accordionWrapper");
    var a = $("#" + e + "PopinWrapper .popinHeader");
    var d = $("#" + e + "PopinWrapper .popinContent");
    b.hide();
    f.show();
    a.show();
    d.show();
    if (!$("#" + e + "PopinWrapper .popinHeader h1").length) {
        $("#" + e + "PopinWrapper .popinHeader").wrapInner("<h1 tabindex='-1'></h1>")
    }
}
function resetActiveTab() {
    var a = $(".accordionPopinHeader");
    a.removeClass("active")
}
function loadCommerceHeaders(c) {
    if (CONFIGURATION.STORE_LANG != "") {
        var d = $.jStorage.get(LocalStorageCommerceHeader);
        var a = getCookie(LocalStorageStoreLangCommerceHeader);
        var b = $.jStorage.get(LocalStorageTimeOut);
        var e = window.location.protocol + window.location.hostname;
        if (window.name == "") {
            window.name = e
        }
        if (d == null || a != CONFIGURATION.STORE_LANG || b === null || (new Date().getTime()) >= b + (600000) || window.name != e || c || LOCAL_FORCE_RELOAD_HEADER) {
            $.jStorage.set(localStorageCartReminderShown, false);
            getCommerceHeader();
            setCvgCookie(LocalStorageStoreLangCommerceHeader, CONFIGURATION.STORE_LANG, 365, CONFIGURATION.DISPATCH_COOKIE_DOMAIN);
            $.jStorage.set(LocalStorageTimeOut, new Date().getTime());
            window.name = e
        } else {
            callbackHtmlInJson(d)
        }
    } else {
        handleCartIconBehaviour()
    }
}
function getCommerceHeader() {
    
}
function microShoppingBagCallback(c) {
    var b = htmlDecode(c);
    $("#header-cart").html(b);
    $("#header-cart").removeAttr("data-imgloaded");
    var a = $("#header-cart").attr("data-status");
    if (a) {
        $("#header-cart-status").text(a);
        $("#header-cart").removeAttr("data-status", "")
    }
    handleCartIconBehaviour()
}
function callbackHtmlInJson(data) {
    var parseData = JSON.parse(data);
    for (var prop in parseData) {
        if (window[prop + "Callback"]) {
            var callbackFunction = eval(prop + "Callback");
            if (typeof callbackFunction == "function") {
                callbackFunction(parseData[prop])
            }
        }
    }
}
function callbackEndlessInJson(b) {
    var a = JSON.parse(b);
    $.each(a,
    function(e, c) {
        var f = c;
        $("body").append('<input type="hidden" id="endlessSession" class="' + f + '" name="country" value="">');
        if ($("#endlessSession.false").length > 0) {
            $("#endlessSession").remove();
            window.parent.postMessage("get refresh parent frame", "*")
        } else {
            $("#endlessSession").remove()
        }
    })
}
function loadMSB() {
    if (CONFIGURATION.STORE_TYPE == "shop" && CONFIGURATION.STORE_LANG != "") {
        getAjax(true, "commerce/microShoppingBag.jsp",
        function(a) {
            $("#header-cart").html(a);
            $("#header-cart").removeAttr("data-imgloaded");
            handleCartIconBehaviour()
        })
    }
    handleCartIconBehaviour()
}
function reloadMSB() {
    if (CONFIGURATION.STORE_TYPE == "shop" && CONFIGURATION.STORE_LANG != "") {
        $("#header-cart").find(".shopping-bag").fadeOut(200,
        function() {
            $(".shopping-bag-on").removeClass("shopping-bag-on");
            $(this).css("display", "");
            loadMSB()
        });
        $("#header-cart").find(".arrow-selected").fadeOut(200,
        function() {
            $(this).css("display", "")
        })
    }
}
function loadWish() {}
function reloadWish() {
    if (CONFIGURATION.STORE_LANG != "") {
        $(".wishlist-on").removeClass("wishlist-on");
        loadWish()
    }
}
function cardHeaderContentCallback(b) {
    var a = htmlDecode(b);
    $(".menu-cart").html(a);
    bindAddressModals()
}
function wishlistHeaderContentCallback(b) {
    var a = htmlDecode(b);
    $("#header-wish").html(a)
}
var testEventPass = true;
function myLvHeaderContentCallback(b) {
    var a = htmlDecode(b);
    $("#header-mylv").html(a);
    handleMyLVIconBehaviour();
    $("#fakemylv-bubbleSignIn").click(function() {
        $(".mylv-bubble").find("*[id*=loginSubmit]").click();
        if ($("#wishListProductsWrapper").length) {
            updateWhishlistCounterLabel()
        }
    });
    $("#fakemylv-bubbleSendPwd").click(function() {
        $(".mylv-bubble").find("*[id*=forgotPasswordSubmit]").click()
    });
    textfillWidthCount = 0;
    setTextfillWidth();
    handleForgotPwdLinks();
    handleCancelLinks();
    showShoppingBagReminderMessage()
}
function setTextfillWidth() {
    textfillWidthCount++;
    if (textfillWidthCount >= 10) {
        return
    }
    try {
        $(".onlyAS .welcomePage.textfill").css("width", $(".onlyAS .mylv_left_menu-content:first").innerWidth());
        $(".welcomePage").textfill({
            maxFontPixels: 23
        })
    } catch(a) {
        setTimeout(function() {
            setTextfillWidth()
        },
        200)
    }
}
function myLvLeftMenuContentCallback(c) {
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        var b = htmlDecode(c);
        $("#mylvAsExpandContent").html(b);
        handleMyLVIconBehaviour();
        $("#fakemylv_left_menuSignIn").click(function() {
            $(".mylv_left_menu").find("*[id*=loginSubmit]").click()
        });
        $("#fakemylv_left_menuSendPwd").click(function() {
            $(".mylv_left_menu").find("*[id*=forgotPasswordSubmit]").click()
        });
        handleForgotPwdLinks();
        handleCancelLinks()
    }
    function a(e) {
        var d = htmlDecode(e);
        if (CONFIGURATION.STORE_LANG != "") {
            $("#submitLogout").click(function() {
                $(".mylv #logoutSubmit").click()
            })
        }
    }
}
function handleForgotPwdLinks() {
    if (window.LVMCN) {
        $(".forgot-pwd-link").not(".bound").addClass("bound").click(function() {
            if ($(this).closest("#loginFormmylv-bubble").length || $(this).closest("#loginFormmylv_left_menu").length) {
                var a = $(this).parents(".authentication-wrapper");
                a.find(".sign-in-mode").slideToggle(200);
                setTimeout(function() {
                    a.find(".pwd-mode").slideToggle(200);
                    $("#toggleViewIdent h2:visible").focus();
                    $("#toggleViewIdent h2:visible").css("display", "block")
                },
                300);
                getAjax(true, "getCaptchaAjax.jsp",
                function(d) {
                    var b = JSON.parse(d);
                    captchaUrl = b.response;
                    var c = b.key;
                    if (captchaUrl == "Error While Calling Captcha") {
                        $("#forgotPasswordForm_mylv-bubble .form-line.captcha").html(captchaUrl)
                    } else {
                        captchaUrl = captchaUrl.replace(/&amp;/g, "&");
                        $("#forgotPasswordForm_mylv-bubble .form-line.captcha #captchaValue").val(c);
                        getForgotCaptcha(captchaUrl)
                    }
                })
            } else {
                var a = $(this).parents(".authentication-wrapper");
                a.find(".sign-in-mode").slideToggle(200);
                setTimeout(function() {
                    a.find(".pwd-mode").slideToggle(200);
                    $("#toggleViewIdent h2:visible").focus();
                    $("#toggleViewIdent h2:visible").css("display", "block")
                },
                300)
            }
        })
    } else {
        $(".forgot-pwd-link").not(".bound").addClass("bound").click(function() {
            var a = $(this).parents(".authentication-wrapper");
            a.find(".sign-in-mode").slideToggle(200);
            setTimeout(function() {
                a.find(".pwd-mode").slideToggle(200);
                a.find("h1.pwd-mode:visible,h2.pwd-mode:visible").css("display", "block");
                $("#toggleViewIdent h2:visible").focus();
                $("#toggleViewIdent h2:visible").css("display", "block")
            },
            300)
        })
    }
}
function getForgotCaptcha(a) {
    $.getScript(a,
    function() {
        if ($(window).width() < 767) {
            var c = {
                callback: b,
                showHeader: true,
                themeColor: "aaabbb",
                type: "embed"
            };
            capInit($(".mylv_left_menu #forgotTCaptcha").get(0), c);
            function b(d) {
                if (d.ret == 0) {
                    $(".mylv_left_menu #forgotVerificationCode").attr("value", d.ticket);
                    $(".mylv_left_menu #forgotCaptchaSuccess").css("display", "block");
                    $(".send-otp").attr("disabled", false)
                } else {
                    console.log("error while calling captcha")
                }
            }
        } else {
            var c = {
                callback: b,
                showHeader: true,
                themeColor: "aaabbb",
                type: "embed"
            };
            capInit($("#forgotPasswordForm_mylv-bubble #forgotTCaptcha").get(0), c);
            function b(d) {
                if (d.ret == 0) {
                    $("#forgotPasswordForm_mylv-bubble #forgotVerificationCode").attr("value", d.ticket);
                    $("#forgotPasswordForm_mylv-bubble #forgotCaptchaSuccess").css("display", "block");
                    $(".send-otp").attr("disabled", false)
                } else {
                    console.log("error while calling captcha")
                }
            }
        }
    })
}
function handleCancelLinks() {
    $(".cancelMyLVSendPwd").not(".bound").addClass("bound").click(function() {
        var a = $(this).parents(".authentication-wrapper");
        a.find(".pwd-mode").slideToggle(200);
        setTimeout(function() {
            a.find(".sign-in-mode").slideToggle(200);
            $("#toggleViewIdent h2:visible").focus()
        },
        300)
    })
}
function showShoppingBagReminderBubble() {
    handleSBRBubblePosition();
    this.showPopin = function() {
        if (!$(".mylv-bubble").is(":visible")) {
            setTimeout(function() {
                $("#sb-reminder-bubble, .shoppingBagReminderWrapper").fadeIn();
                $("#sb-reminder-arrow-selected").fadeIn();
                this.handleClosePopinClick()
            },
            800)
        }
    };
    this.hidePopin = function() {
        setTimeout(function() {
            $("#sb-reminder-bubble, #sb-reminder-arrow-selected").fadeOut()
        },
        4000)
    };
    this.handleClosePopinClick = function() {
        $("#sb-reminder-bubble .shopping-bag-close").click(function() {
            $("#sb-reminder-bubble, #sb-reminder-arrow-selected").fadeOut()
        })
    };
    showPopin();
    hidePopin();
    handleClosePopinClick();
    $(window).resize(function() {
        handleSBRBubblePosition()
    })
}
function getShoppingCartHeader() {
    if (!$("#dispatchContent")[0] && CONFIGURATION.STORE_TYPE != "showroom" && !RESPONSIVE_MANAGER.isAllSmallMode() && !$("#header-cart.empty-cart")[0] && window.location.protocol != "https:") {
        getAjax(true, "shoppingBag/bubbleShoppingBagReminder.jsp",
        function(b) {
            $("#header-sb-reminder").html(b);
            sessionStorage.setItem("fired", "1");
            setTimeout(function() {
                showShoppingBagReminderBubble();
                setTimeout(function() {
                    handleSBRBubblePosition()
                },
                800)
            },
            1000)
        },
        {
            logout: CONFIGURATION.LOGOUT
        })
    }
}
function reCallShoppingBagReminder() {
    var a = sessionStorage.getItem("fired");
    if (navigator.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > 0) {
        return
    } else {
        if (a != "1") {
            getShoppingCartHeader()
        }
    }
}
function handleSBRBubblePosition() {
    var g = $(window),
    d = $(".page"),
    c = (g.width() - d.width()) / 2,
    f = (c == 0) ? 0 : c,
    e = $("#header-shoppingBag"),
    b = e.offset() ? e.offset().left: 0,
    h = $("#header-shoppingBag").position(),
    a = $(".sb-reminder-bubble");
    $("#sb-reminder-bubble").css("right", -1 * (g.width() - b - e.width()) + 28 + f)
}
function displayCartReminderCallback(c) {
    var b = htmlDecode(c);
    $("#header-sb-reminder").html(b);
    var a = $.jStorage.get(localStorageCartReminderShown);
    logDebug("displayCartReminderCallback : shown = " + a);
    if (!a && !RESPONSIVE_MANAGER.isAllSmallMode()) {
        showShoppingBagReminderBubble()
    }
    logDebug("setting localStorageCartReminderShown to true anyway to avoid repetition");
    $.jStorage.set(localStorageCartReminderShown, true)
}
function toggleCreateProfileForm() {
    $(".globalErrors li").html("");
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        $("#createNewProfile").toggleClass("hide");
        $("#loadCreateProfileSubmit").hide();
        $("html, body").animate({
            scrollTop: ($("#createNewProfile").offset().top)
        },
        1000)
    } else {
        $("#createNewProfile").toggleClass("hide");
        $("#toggleViewIdent").toggleClass("hide");
        if (!$(".modal").size()) {
            setContentSize()
        }
    }
}
function arrangeSelector(a) {
    var b = a.split(".").join("");
    b = b.split("#").join("");
    b = b.split(" ").join("");
    return b
}
function adaptCartModalPosition(a) {
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        var c = $(a).offset().top
    } else {
        var b = $(".header").height() - $(window).scrollTop();
        var c = (b >= 0 ? b: 0);
        $(".modal_addTocart .modal").css("margin-top", c + 5)
    }
}
function handleModalPlaceIncart() {
    handleProductPopinPositionAddCart();
    loadingImgs();
    closecartModal()
}
function handleModalPlaceIncartFromWishlist() {
    handleProductPopinPositionAddCart();
    loadingImgs();
    closecartModal()
}
function closecartModal() {
    setTimeout(function() {
        $(".cartModalHeader .closeButton").click();
        $("#header-cart-status").text("")
    },
    addToCardBubbleTimer)
}
function closeModal() {
    $(".blackWrapper:last").find(".modal .closeButton").click()
}
function htmlDecode(a) {
    return $("<div/>").html(a).text()
}
function logDebug(a) {
    if (CONFIGURATION.LOGGING && window.console != undefined) {
        console.log(a)
    }
}
function logMobile(a) {
    var c = $("#logMobile");
    if (CONFIGURATION.LOGGING) {
        clearTimeout(CONFIGURATION.mobileConsole);
        CONFIGURATION.mobileConsole = null;
        if (!c.length) {
            var d = $("<div id='logMobile'/>").css({
                "z-index": 999,
                position: "fixed",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                top: "0",
                left: "0",
                right: "0",
                height: "180px",
                overflow: "hidden"
            });
            var b = $("<ul/>");
            $("body").append(d.append(b));
            c = $("#logMobile")
        }
        CONFIGURATION.mobileConsole = setTimeout(function() {
            c.fadeOut(750)
        },
        6000);
        c.find("ul").append($("<li/>").html(a));
        c.fadeIn(200,
        function() {
            $("#logMobile").animate({
                scrollTop: "500000"
            },
            500)
        })
    }
}
function logError(a) {
    if (CONFIGURATION.LOGGING && window.console != undefined) {
        console.log("ERROR: " + a)
    }
}
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
};
var startAnalizeTime;
function startTimeAnalyse() {
    startAnalizeTime = new Date().getTime()
}
function printTimeAnalyse(a) {
    endTime = new Date().getTime()
}
function SlideshowOption() {
    this.navigMode = "thumbs";
    this.heightMode = "default";
    this.displayArrows = true;
    this.isAnalyticCalled = false;
    this.AnalyticSection = "";
    this.lastPageX = -1;
    this.isAnalyticCalledAtInit = true;
    this.allowVerticalScroll = true
}
function addSmartphoneAddress() {
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        $("#currentAddressFormHolder").removeClass("hide");
        $("#addressSelector, #addNewAddr").addClass("hide");
        $("#cancelButtonAddress").toggleClass("showCancel")
    }
}
function handleCreateandEditNewAddress() {
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        $("#addNewAddr").click(function() {
            addSmartphoneAddress()
        });
        $(".addressEdit").each(function() {
            $(this).click(function() {
                handleAddressModalSmartphone()
            })
        });
        $(".validateAddress").each(function() {
            $(this).click(function() {
                $("#updateAddressSubmit").click()
            })
        })
    }
}
function handleAddressModalSmartphone() {
    $("#currentAddressFormHolder").removeClass("hide");
    $("#addressSelector, #addressEditor .title").addClass("hide");
    $("#cancelButtonAddress").toggleClass("showCancel")
}
function editSmartphoneAddress() {
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        $("#currentAddressFormHolder").addClass("hide");
        $("#addressSelector, #addNewAddr, #addressEditor .title").removeClass("hide");
        $("#cancelButtonAddress").toggleClass("showCancel")
    }
}
function copyLoginToResetPasswordForm() {
    var a = $(".login").val();
    $("#forgotPasswordForm .email").val(a)
}
function getCheckoutUrlsKeys() {
    if (typeof CONFIGURATION.CHECKOUT_URLS !== "undefined") {
        return Object.keys(CONFIGURATION.CHECKOUT_URLS)
    }
}
function redirectBackButton() {
    switch (backBtnProcessFlag) {
    case CHECKOUT_BACK_BTN_PROCESS:
        window.location.href = CONFIGURATION.CHECKOUT_URLS[getCheckoutUrlsKeys()[checkoutPageTypePosition]];
        break;
    default:
        goBack()
    }
}
function initPageTypeInfos() {
    var b = sessionStorageTest.getItem("prevPageType");
    if (CONFIGURATION.pageType == b) {
        return
    }
    var a;
    if (b === null) {
        backBtnProcessFlag = DEFAULT_BACK_BTN_PROCESS
    } else {
        a = getCheckoutUrlsKeys();
        checkoutPageTypePosition = $.inArray(b, a);
        if (checkoutPageTypePosition !== -1) {
            backBtnProcessFlag = CHECKOUT_BACK_BTN_PROCESS
        } else {
            backBtnProcessFlag = DEFAULT_BACK_BTN_PROCESS
        }
    }
    sessionStorageTest.setItem("prevPageType", CONFIGURATION.pageType)
}
function goBack(b) {
    var a = b && $(b.target);
    if (a && (a.attr("onClick") || (a.attr("href") && a.attr("href")[0] !== "#"))) {
        return true
    }
    b && b.preventDefault();
    if (!document.referrer && !getCookie("prevURL")) {
        if (BACK_BUTTON.homeURL) {
            window.location = BACK_BUTTON.homeURL;
            return
        }
    }
    $(window).on("hashchange",
    function() {
        window.history.back()
    });
    window.history.back()
}
$(document).on("click", "#back-btn:not(.back-btn-store-detail)", goBack); (function() {
    var b = location.href,
    a = getCookie("prevURL"),
    d = (b.indexOf("https:") === 0),
    c = (a.indexOf("https:") === 0) && !d;
    if (c) {
        getCommerceHeader()
    }
})();
setCvgCookie("prevURL", getCookie("currentURL"), 30, CONFIGURATION.DISPATCH_COOKIE_DOMAIN);
setCvgCookie("currentURL", window.location.href, 30, CONFIGURATION.DISPATCH_COOKIE_DOMAIN);
function hasBeenOnConvergence() {
    if (window.name == "") {
        sessionStorageTest.setItem("inSite", "0")
    } else {
        sessionStorageTest.setItem("inSite", "1")
    }
}
function myLVGenericLogout(a) {
    $("#logoutSubmit_" + a).click()
}
function handlePageTitleFormError() {
    if (window.location == window.parent.location) {
        var b = CONFIGURATION.FORM_ERROR_MSG + " - ";
        var c = window.parent.document.title.indexOf(b);
        var a = b.length;
        if ($(".wrongIdentifier").length > 0 || $(".mandatory.error").length > 0) {
            window.parent.document.title = b + window.parent.document.title
        }
    }
}
function scrollToError() {
    if (!$(".form-line.error:visible").length && !$(".bt-content").length) {
        return false
    }
    var f;
    var b;
    var e = $("#header");
    var d = $(".modal").length;
    var c = $(".form-line.error:visible:first").find("input:visible, select:visible");
    var a = $("html, body");
    if (RESPONSIVE_MANAGER.isAllSmallMode()) {
        f = SCROLL_TO_TOP_GAP_AS
    } else {
        f = SCROLL_TO_TOP_GAP_ML
    }
    if (!c.length && $(".form-line.dateOfBirth.error").length) {
        c = $(".form-line.dateOfBirth.error select:first")
    }
    if (e.css("position") === "fixed") {
        if (c.length) {
            b = c.offset().top - e.height() - f
        }
        if ($(".bt-content").length) {
            b = $(".bt-content").offset().top - e.height() - f
        }
    } else {
        if (c.length) {
            b = c.offset().top - f
        }
        if ($(".bt-content").length) {
            b = $(".bt-content").offset().top - f
        }
    }
    if (d) {
        c = $(".modal .form-line.error:visible:first").find("input:visible");
        b -= $(".modal").offset().top;
        a = c.parents(".scroll-content")
    }
    if (b) {
        a.animate({
            scrollTop: b
        },
        "ease")
    }
    if (c.length) {
        c.focus()
    }
}
function checkLVPAss() {
    if (getGetParameter("lvpass") == "true") {}
}
function loadOverFile(a, b) {
    if (b == "js") {
        var c = document.createElement("script");
        c.setAttribute("type", "text/javascript");
        c.setAttribute("src", a)
    } else {
        if (b == "css") {
            var c = document.createElement("link");
            c.setAttribute("rel", "stylesheet");
            c.setAttribute("type", "text/css");
            c.setAttribute("href", a)
        }
    }
    if (typeof c != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(c)
    }
}
$.fn.serializeObject = function() {
    var c = {};
    var b = this.serializeArray();
    $.each(b,
    function() {
        if (c[this.name] !== undefined) {
            if (!c[this.name].push) {
                c[this.name] = [c[this.name]]
            }
            c[this.name].push(this.value || "")
        } else {
            c[this.name] = this.value || ""
        }
    });
    return c
};
function showShoppingBag() {
    var a;
    a = new modal();
    a.dataPath = "shoppingBag/bubbleShoppingBagReminder.jsp";
    a.dataClass = "cartModalHeader";
    a.modalPositionedContainerClass = "modal_addTocart";
    a.dataCallbackBeforeOpen = "closecartModal()";
    a.dataCallbackAfterOpen = "bindAddressModals()";
    a.opacity = "0.2";
    a.keepPage = "true";
    a.scrollTop = "false";
    a.preventScroll = "true";
    a.open()
}
function showPriceButton() {
    $(".priceButton").css("visibility", "visible")
}
function loadPriceButton() {
    if ($(".priceButton").length > 0) {
        $(".priceButton tbody").fadeTo(300, 1,
        function() {})
    }
}
function checkStockLevel(a, c, d) {
    var b = $("body").data("size-skus");
    if (a.split(",").length > 1) {
        b = a.split(",")
    } else {
        b = [a]
    }
    getAjax(true, "getStockLevel.jsp",
    function(k) {
        var f = $.parseJSON(k);
        if (typeof CURRENT_SKU != "undefined") {
            if (typeof f[CURRENT_SKU] != "undefined") {
                var h = f[CURRENT_SKU]["inStock"]
            } else {
                var h = false
            }
        } else {
            fireEvent("getStockSuccess", f);
            var h = false;
            for (var g = 0; g < b.length; g++) {
                if (typeof f[b[g]] !== "undefined") {
                    if (f[b[g]]["inStock"]) {
                        h = true;
                        break
                    }
                }
            }
        }
        if (d != undefined && typeof d === "function") {
            d(f)
        }
        utag_data.product_stock = h;
        if (typeof product_data != "undefined") {
            product_data.products_list_stock = f;
            product_data.product_stock = h
        }
        setTimeout(function() {
            fireEvent("stockComplete")
        },
        700);
        if (window.stockReadyEvent != undefined) {
            fireEvent(stockReadyEvent, document)
        }
        if (h && !$("#quantity option.selected, #size option.selected").attr("disabled")) {
            $("#addToCartFormHolder" + c).removeClass("hide");
            var e = false;
            for (var g = 0; g < b.length; g++) {
                if (typeof f[b[g]] !== "undefined") {
                    if (f[b[g]]["backOrder"]) {
                        e = true;
                        break
                    }
                }
            }
            $("#addToCartFormHolder" + c + ".inStockButton").removeClass("hide");
            if (e) {
                $("#backOrderFormHolder" + c).removeClass("hide")
            } else {
                $("#pickupShopHolder" + c).removeClass("hide")
            }
        } else {
            if (typeof f[CURRENT_SKU] != "undefined") {
                $("#notInStock" + c).removeClass("hide");
                $("#addToCartFormHolder" + c).addClass("hide")
            }
        }
        if (window.showPriceButton) {
            showPriceButton();
            showPriceButtonMessage()
        }
        fireEvent("getStockSuccess", f)
    },
    {
        skuIdList: b
    },
    null)
}
function orangeRightArrowHandler() {
    $(".arrow-right:visible").each(function() {
        var b = $(this);
        if (!b.prev().html()) {
            b.prev().hide();
            b.hide()
        }
        var a = (b.next().height()) * 0.5;
        if (!b.hasClass("bound")) {
            a = (b.next().height() + 8) / 2;
            b.addClass("bound")
        }
        b.css({
            "border-top-width": a,
            "border-bottom-width": a,
            "border-left-width": a
        });
        if (a > 30) {
            b.css({
                "border-left-width": 30
            });
            a = (b.next().height()) * 0.5;
            b.css({
                "border-top-width": a,
                "border-bottom-width": a
            })
        }
    })
}
function HsOptionsFunctionCart() {
    var a = $("#HSOptionsFormId").serializeObject();
    var b = JSON.stringify(a);
    if (a.initials == "" && a.dateLib == "") {
        $("#tableHsOptionsCart").disabled = true
    } else {
        $("#tableHsOptionsCart").disabled = false;
        $("#tableHsOptionsCart").attr("value", b)
    }
}
function MomOptionsFunctionCart() {
    notifyMoMError("");
    var b = $("#momOptionsFormId").serializeObject();
    var a = JSON.stringify(b);
    $("#tableMomOptionsCart").disabled = false;
    $("#tableMomOptionsCart").attr("value", a)
}
function addDot(b) {
    if (b == null) {
        return null
    }
    b = b.replace(/\./g, "");
    for (var a = "",
    c = 0; c < b.length; c++) {
        a += b[c] + ((c != b.length - 1) ? ".": "")
    }
    return a
}
function handleInitial() {
    $(".ihsOptionsValue").each(function() {
        if ($(this).hasClass("dotClass")) {
            var b = $(this);
            var a = $.trim(b.text());
            b.html(addDot(a))
        }
    })
}
function bindShareCartByMail() {
    $(".share-mail").on("click",
    function() {
        shareCartByMail()
    })
}
function handleShareAnimation(a) {
    if (networkName == "facebook") {
        window.open("https://www.facebook.com/sharer/sharer.php?u=" + a.content.longUrl)
    } else {
        if (networkName == "pinterest") {
            window.open("http://www.pinterest.com/pin/create/button/?url=" + a.content.longUrl + "&description=" + a.content.title + "&media=" + a.content.mediaUrl)
        } else {
            if (networkName == "twitter") {
                window.open("https://twitter.com/intent/tweet?url=" + a.content.shortUrl)
            } else {
                if (networkName == "weibo") {
                    window.open("http://service.weibo.com/share/share.php?title=" + a.content.title + "&url=" + a.content.longUrl + "&pic=" + a.content.mediaUrl)
                } else {
                    if (networkName == "googlePlus") {
                        window.open("https://plus.google.com/share?url=" + a.content.longUrl)
                    }
                }
            }
        }
    }
} (function(a) {
    a.fn.when = function(c) {
        c = c.split(/\s+/);
        var b = [];
        a.each(this,
        function(d, g) {
            var e = a(g),
            f = [];
            a.each(c,
            function(k, l) {
                var h = a.Deferred(),
                m = function(n) {
                    h.resolve();
                    e.unbind(l, m)
                };
                f.push(h);
                e.on(l, m)
            });
            b.push(a.when.apply(null, f))
        });
        return a.when.apply(null, b)
    }
})(jQuery);
function isInArray(c, d) {
    for (var a = 0,
    b = d.length; a < b; a++) {
        if (d[a] == c) {
            return true
        }
    }
    return false
}
function is_touch_device() {
    return "ontouchstart" in window || window.navigator.msMaxTouchPoints
}
function loadingBubbles() {
    $(".bubble-action").each(function() {
        var b = $(this);
        var a = b.attr("data-source");
        b.bt({
            trigger: "hover",
            clickAnywhereToClose: true,
            fill: "#FFFFFF",
            width: 300,
            strokeStyle: "#E2E2E2",
            spikeLength: 0,
            spikeGirth: 0,
            positions: ["top"],
            cornerRadius: 0,
            closeWhenOthersOpen: true,
            contentSelector: "$('." + a + "').html()",
            postShow: function(c) {
                $(c).find("#closeButton").click(function() {
                    b.btOff()
                })
            }
        });
        b.click(function() {
            b.btOn()
        });
        b.removeClass("bubble-action")
    })
}
function isTouchClass() {
    if (isIdevice || isAndroid) {
        $("body").addClass("isTouchDevice")
    } else {
        $("body").removeClass("isTouchDevice")
    }
}
function isNexusClass() {
    if (isNexus.test(navigator.userAgent)) {
        $("body").addClass("isNexusDevice")
    } else {
        $("body").removeClass("isNexusDevice")
    }
}
function isIE9Class() {
    if (isBrowser_IE_9) {
        $("body").addClass("isIE9")
    } else {
        $("body").removeClass("isIE9")
    }
}
function isDesktopClass() {
    var a = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
    if (!a) {
        $("body").addClass("isDesktop")
    } else {
        $("body").removeClass("isDesktop")
    }
}
function handleScrollDownAnimation() {
    $(".scroll-arrow-container").scrollArrow({
        startPosition: "82%",
        endPosition: "87%"
    })
}
function delegateClickScrollDownArrow() {
    $(".scroll-arrow-container").on("click",
    function() {
        if ($("body").hasClass("page-type-apps")) {
            event.preventDefault()
        } else {
            var a = $(this).closest(".push1").find("#push1-link").attr("href");
            if (a !== "") {
                console.log("href", a);
                window.location.href = a
            }
        }
    })
}
function removeJsonItem(b, a) {
    var d = $(".wlii_" + b + " .imageWrapper");
    var c = d.attr("data-index");
    a.list.splice(parseInt(c), 1);
    sortAndDisplayProducts()
}
function showCurtain(c) {
    if (c == undefined) {
        c = "Main"
    }
    var b = $("#formCurtain" + c);
    var a = 0.7;
    if (b.attr("data-opacity") != undefined) {
        a = b.attr("data-opacity")
    }
    if (curtainCountMap[c] == undefined) {
        curtainCountMap[c] = 0
    }
    curtainCountMap[c]++;
    if (curtainCountMap[c] == 1) {
        $(document).on("touchmove", preventBrowserScroll)
    }
}
function addDots() {
    $(".js-with-dots").each(function() {
        var g = $(this).text();
        var b = ".";
        if (g.indexOf(b) == -1) {
            var c = g.length;
            var f = g.substring(0, 1);
            var e = g.substring(1, 2);
            var d = g.substring(2, 3);
            var a = f;
            if (c > 1) {
                a += b + e
            }
            if (c > 2) {
                a += b + d
            }
            $(this).text(a)
        }
    })
}
function hideCurtain(a) {
    if (a == undefined) {
        a = "Main"
    }
    if (curtainCountMap[a] == undefined) {
        curtainCountMap[a] = 0
    }
    if (curtainCountMap[a] > 0) {
        curtainCountMap[a]--
    }
    if (curtainCountMap[a] == 0) {
        resetBrowserScroll();
        $("#formCurtain" + a).animate({
            opacity: "0"
        },
        150).css("display", "none")
    }
}
var currentConfigFullUrl = CONFIGURATION.FULL_URL;
function getSkuOnpage() {
    if ($(".sku").length > 0) {
        var b = $(".sku").text().replace(/[ \n\r]/g, "");
        var a = "#" + b;
        CONFIGURATION.FULL_URL = currentConfigFullUrl + a
    }
}
function fixIosBadHeight() {
    if ($(".page").attr("data-fullHeight") == "true" && navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) && window.innerHeight != document.documentElement.clientHeight) {
        var a = function() {
            document.documentElement.style.height = window.innerHeight + "px";
            if ($(document).scrollTop() !== 0) {
                window.scrollTo(0, 0)
            }
        }.bind(this);
        window.addEventListener("orientationchange", a, false);
        a();
        $("body").css("webkitTransform", "translate3d(0,0,0)")
    }
}
function resizeVideoLoading(a, g) {
    var f = $(".page");
    var c = $("#header");
    var d = $(".checkout_header");
    var l = $(".footer");
    var e = $(".content");
    var b = (c.length ? c.height() : 0) + (d.length ? d.height() : 0);
    var h = l.length ? l.height() : 0;
    var k = e.length ? e.height() : 0;
    relativeContentHeight = g - b - h
}
function fixIosAppleTag() {
    if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
        if (/OS [1-7](.*) like Mac OS X/i.test(navigator.userAgent)) {
            var a = document.createElement("meta");
            a.name = "apple-mobile-web-app-capable";
            a.content = "yes";
            document.getElementsByTagName("head")[0].appendChild(a)
        }
    }
}
function shippingMethodSwitch() {
    $(document).on("change", ".addressSelectorDropbox",
    function() {
        $(".page").removeClass("tempShipping");
        function a() {
            var f = $("#shippingAddressFormHolder .addressDisplay .clientAddress .clientAddressPostalCode");
            var b = f.text();
            var g = $(f).parents(".currentAddressFormHolder");
            var c = g.attr("data-index");
            var e = g.attr("data-isMultiShip") != null;
            var d = "Radio";
            if (e) {
                d = ""
            }
            if (c != undefined) {
                updateShippingMethods(b, d, c, e)
            } else {
                updateShippingMethods(b, d, 0, e)
            }
        }
        $.ajax({
            success: function() {
                setTimeout(function() {
                    a()
                },
                800)
            }
        }).success(a)
    })
}
function shippingMethodEdit() {
    if (!window.LVMKR) {
        $(document).on("click", ".page-type-checkout-shipping .save-information span",
        function() {
            var d = $("#postalCode").parents(".currentAddressFormHolder");
            var a = d.attr("data-index");
            var c = d.attr("data-isMultiShip") != null;
            var b = "Radio";
            if (c) {
                b = ""
            }
            if (a != undefined) {
                updateShippingMethods($("#postalCode").val(), b, a, c)
            } else {
                updateShippingMethods($("#postalCode").val(), b, 0, c)
            }
            newValPostalCode = $("#postalCode").val();
            $(".page").addClass("tempShipping");
            $.ajax({
                success: function() {
                    setTimeout(function() {
                        $("[id^=commerceItemShippingRelation_]").each(function(e, f) {
                            updateShippingMethods(newValPostalCode, b, e, c)
                        })
                    },
                    1800)
                }
            }).success()
        })
    }
}
function setParamsForSubmitForm(submitButton) {
    var disabled = submitButton.hasClass("disabled");
    if (!disabled) {
        var formId = submitButton.attr("data-formId");
        var form = $("#" + formId);
        var target = submitButton.attr("data-target");
        var action = form.attr("action");
        var callback = submitButton.attr("data-callback");
        var errorCallback = submitButton.attr("data-errorCallback");
        var beforeCall = submitButton.attr("data-beforeCall");
        var preValidation = submitButton.attr("data-preValidationFc");
        var dataparams = submitButton.attr("data-params");
        var params = null;
        if (dataparams != undefined) {
            eval("params = " + dataparams)
        }
        var append = submitButton.attr("data-append") != null;
        var secure = submitButton.attr("data-secure") != null;
        var curtain = submitButton.attr("data-curtain") != null;
        var fromIframe = submitButton.attr("data-fromIframe") != null;
        if (beforeCall != undefined) {
            eval(beforeCall)
        }
        postAjax(form.serialize(), secure, formId,
        function(data, callbackSuccessParams) {
            if (target != undefined) {
                if (fromIframe) {
                    $("#" + target, parent.document.body).html(data)
                } else {
                    if (append) {
                        $("#" + target).append(data)
                    } else {
                        $("#" + target).html(data)
                    }
                }
            }
        })
    }
}
function localyseForm() {
    $("#country").each(function() {
        var a = $(this).val();
        $(this).closest("form").addClass("form" + a)
    })
}
$.fn.getCursorPosition = function() {
    var c = $(this).get(0);
    var d = 0;
    if ("selectionStart" in c) {
        d = c.selectionStart
    } else {
        if ("selection" in document) {
            c.focus();
            var a = document.selection.createRange();
            var b = document.selection.createRange().text.length;
            a.moveStart("character", -c.value.length);
            d = a.text.length - b
        }
    }
    return d
};
function zipCodeFormatCA(a) {
    a.attr("maxlength", "7");
    if (isAndroid) {
        a.on("keyup",
        function(g) {
            var d = g.keyCode || g.charCode;
            var f = $(this);
            var c = 7;
            var b = $(this).getCursorPosition();
            if (f.val().length > c) {
                f.val(f.val().substr(0, c))
            } else {
                if (b !== 4 && d == 32) {
                    $(this).val($(this).val().replace(/.$/g, ""));
                    return false
                }
                if (f.val().length === 3 && d !== 32) {
                    if (d == 8 || d == 46) {} else {
                        f.val(f.val() + " ")
                    }
                }
            }
        })
    } else {
        a.on("keypress",
        function(f) {
            var d = $(this);
            var c = (typeof f.which == "number") ? f.which: f.keyCode;
            var b = $(this).getCursorPosition();
            if (b !== 3 && c == 32) {
                return false
            }
            if (d.val().length === 3 && c !== 32) {
                if (c == 8 || c == 46) {} else {
                    d.val(d.val() + " ")
                }
            }
        })
    }
}
function setParamsPreviewButtonForIE() {
    $(document).on("change", ".addressSelectorDropbox",
    function() {
        var a = navigator.appVersion.indexOf("MSIE 9.") != -1;
        if (a) {
            setParamsForSubmitForm($("#previewTotalCreateShippingGroupSubmit"))
        }
    })
}
function shareUrlFBProductPage() {
    $(".share-facebook").on("click",
    function() {
        var c = $(this);
        if ($(".page-type-product .sku").length > 0) {
            var d = c.attr("href"),
            b = "null",
            e = $(".sku").text().replace(/[ \n\r]/g, ""),
            a = "#" + e,
            f = encodeURIComponent(currentConfigFullUrl + a);
            d = encodeURI(d.replace(b, f));
            c.attr("href", d)
        }
    })
}
function shareUrlGooglePLusProductPage() {
    $(".share-googleplus").on("click",
    function() {
        var b = $(this);
        if ($(".page-type-product .sku").length > 0) {
            var c = b.attr("href"),
            a = "null",
            d = currentConfigFullUrl;
            c = encodeURI(c.replace(a, d));
            b.attr("href", c)
        }
    })
}
function shareUrlLineProductPage() {
    $(".share-line").on("click",
    function() {
        var b = $(this);
        if ($(".page-type-product .sku").length > 0) {
            var c = b.attr("href"),
            a = "null",
            d = currentConfigFullUrl;
            c = encodeURI(c.replace(a, d));
            b.attr("href", c)
        }
    })
}
function shareUrlTwitterProductPage() {
    $(".share-twitter").on("click",
    function() {
        var b = $(this);
        if ($(".page-type-product .sku").length > 0 || $(".page-type-mylv-wishlist").length > 0) {
            var d = b.attr("href"),
            a = "null",
            e = $(".sku").text().replace(/[ \n\r]/g, "");
            if ($(".page-type-mylv-wishlist").length > 0) {
                e = b.closest(".productDetails").find(".productSku").text().replace(/[ \n\r]/g, "")
            }
            var c = "#" + e,
            f = encodeURIComponent(currentConfigFullUrl + c);
            d = d.replace(a, f);
            b.attr("href", d)
        }
    })
}
function shareListener() {
    $(".share-pinterest").on("click",
    function() {
        var b = $(this);
        sharePinterest(b, retrieveImageData("pinterest", b));
        if ($(".page-type-mylv-wishlist").length > 0) {
            var c = b.attr("data-href"),
            a = "null",
            d = currentConfigFullUrl;
            c = encodeURI(c.replace(a, d));
            b.attr("href", c)
        }
    });
    $(".share-weibo").on("click",
    function() {
        var a = $(this);
        shareWeibo(a, retrieveImageData("weibo", a))
    })
}
function shareUrlKakao() {
    if (RESPONSIVE_MANAGER.isMediumLargeMode()) {
        $(".share-kakao-list").hide()
    }
    if (typeof Kakao.Auth === "undefined") {
        Kakao.init("e6a3b78fd076c8ec901f7e73d9d8f3e5")
    }
    $(".share-kakao").on("click",
    function() {
        var e, c, d, a, b;
        e = $(this);
        c = e.attr("data-href");
        d = $(e.attr("data-title")).text();
        a = e.attr("data-description");
        b = e.attr("data-imageurl");
        Kakao.Link.sendDefault({
            objectType: "feed",
            content: {
                title: d,
                description: a,
                imageUrl: b,
                link: {
                    mobileWebUrl: c,
                    webUrl: c
                }
            }
        })
    })
}
function orderLinksInFooter() {
    orderContextualSeoLinks();
    orderSitemapLinks();
    bindFooterLinks()
}
function orderContextualSeoLinks() {
    var c = $("#nonOrderedSeoLinks li");
    var b = c.length;
    var a;
    if (b % 3 == 0) {
        a = ((b - b % 3) / 3)
    } else {
        a = ((b - b % 3) / 3) + 1
    }
    for (i = 1; i < 4; i++) {
        for (j = 0; j < a; j++) {
            $("#nonOrderedSeoLinks li:first").remove().appendTo("#columnSeoLinks" + i)
        }
    }
}
function orderSitemapLinks() {
    var a = $("#nonOrderedSitemapLinks li");
    var c = a.length;
    var b;
    if (c % 3 == 0) {
        b = ((c - c % 3) / 3)
    } else {
        b = ((c - c % 3) / 3) + 1
    }
    for (i = 1; i < 4; i++) {
        for (j = 0; j < b; j++) {
            $("#nonOrderedSitemapLinks li:first").remove().appendTo("#columnSitemapLinks" + i)
        }
    }
}
function bindFooterLinks() {
    var b = $([]);
    var c = $("#footer").find(".dropUp");
    var a = 9;
    c.each(function(e) {
        var d = $(this).find("li").last();
        b = b.add(d)
    });
    b.off("click keydown");
    if (RESPONSIVE_MANAGER.isMediumLargeMode()) {
        b.on("keydown",
        function(d) {
            if (!d.shiftKey && d.keyCode == a) {
                d.preventDefault();
                closeDropUpPanels()
            }
        });
        $("#footer").find(".drop-up-close").on("keydown",
        function(d) {
            if (d.shiftKey && d.keyCode == a) {
                d.preventDefault();
                closeDropUpPanels()
            }
        })
    }
}
function setFooterDropUpPosition() {
    if ($(window).width() > 767) {
        $("#footer .dropUp").css("bottom", $(footer).height())
    }
}
function showShoppingBagReminderMessage() {
    var a = $(".shopping-bag-reminder span");
    a.css("opacity", 0);
    setTimeout(function() {
        a.css("opacity", 1)
    },
    500)
}
function handleLoggedState() {
    if ($.jStorage.get(LocalStorageLoggedState) == null) {
        $.jStorage.set(LocalStorageLoggedState, false)
    }
    utag_data.logged_state = $.jStorage.get(LocalStorageLoggedState)
}
function handleDataCommerceUpdate(a) {
    logDebug("handleDataCommerceUpdate : " + a);
    getCommerceHeader();
    $.jStorage.set(LocalStorageLoggedState, a);
    fireEvent("loggedStateChanged", {
        Statut: a ? "logged": "logout"
    });
    handleLoggedState()
}
function showPriceButtonMessage() {
    var a = "";
    if (($(".priceButton").find(".sellable").length) != 0) {
        if (!$("#notInStock").hasClass("hide")) {
            a = $("#notInStock").find("span").attr("data-msg")
        } else {
            a = $("#addToCart").find("span").attr("data-msg")
        }
    } else {
        if (($(".priceButton").find(".notSellable").length) != 0) {
            if (($(".priceButton").find("#cscSellable").length != 0)) {
                a = $("#cscSellable").attr("data-msg")
            } else {
                a = $("#notSellable").attr("data-msg")
            }
        }
    }
    $("#priceBtnMsg").html(a);
    $("#priceBtnMsg").fadeIn()
}
function handleModalPlaceInWishList() {
    handleProductPopinPositionWishlist();
    loadingImgs();
    ADD_TO_WISHLIST = true;
    closecartModal()
}
function handleModalPlaceInWishListUrlMom(a) {
    if (a) {
        var b = $("#productMainImage").attr("src");
        $(".productVisual img:visible").attr("src", b)
    }
}
function adaptWishlistModalPosition(a) {
    if (isSmartphoneMode()) {
        var b = $(a).offset().top
    }
}
function setCvgCookie(c, k, f, g) {
    var h = new Date();
    h.setTime(h.getTime() + (f * 24 * 60 * 60 * 1000));
    var b = "expires=" + h.toGMTString();
    var a = "domain=" + g;
    var e = c + "=" + k + "; path=/;" + b + ";" + a;
    document.cookie = e
}
function getCookie(d) {
    var b = d + "=";
    var a = document.cookie.split(";");
    for (var e = 0; e < a.length; e++) {
        var f = $.trim(a[e]);
        if (f.indexOf(b) == 0) {
            return f.substring(b.length, f.length)
        }
    }
    return ""
}
function handleSafariPrivateMode(a) {
    if (a && /Safari/.test(window.navigator.userAgent) && getCookie("privateModeAlert") !== "true") {
        showPrivateModeMessage();
        setCvgCookie("privateModeAlert", "true", 365, CONFIGURATION.DISPATCH_COOKIE_DOMAIN)
    }
}
function showPrivateModeMessage() {
    privateModal = new modal();
    privateModal.dataDom = "#privateModeMessage";
    privateModal.dataWidth = "50%";
    privateModal.dataHeight = "50%";
    privateModal.open()
}
function handleUserConsentDatasCookie() {
    if (getConsentDatasCookie()) {} else {
        $("#userConsentDatas").addClass("showBanner");
        $("#cookieBannerClose").on("click",
        function(a) {
            setConsentDatasCookie()
        })
    }
}
function getConsentDatasCookiePrefix() {
    return CONFIGURATION.IS_CONTEXT_SET ? CONFIGURATION.STORE_LANG: "dispatch"
}
function getConsentDatasCookie() {
    return getCookie(getConsentDatasCookiePrefix() + cookieUserConsentDatas)
}
function setConsentDatasCookie() {
    setCvgCookie(getConsentDatasCookiePrefix() + cookieUserConsentDatas, "true", 395, CONFIGURATION.DISPATCH_COOKIE_DOMAIN)
}
function resetConsentDatasCookie() {
    setCvgCookie(getConsentDatasCookiePrefix() + cookieUserConsentDatas, "true", -1, CONFIGURATION.DISPATCH_COOKIE_DOMAIN)
}
headerPosition = function(a) {
    a.$header.addClass(a.csHeaderNotFixed);
    if (a.$body.hasClass(a.csPageTypeLvNow) && a.$body.hasClass(a.csWithTopBanner)) {
        a.$lvHeader.addClass(a.csPosFixedTop + " " + a.csHeaderNotFixed)
    }
};
checkScrollTop = function(a) {
    a.$showBanner = $(".showBanner");
    a.windowHeight = 60 + $(window).height();
    if (a.$page.height() > a.windowHeight) {
        if ($(window).scrollTop() >= a.$showBanner.innerHeight()) {
            a.$body.addClass(a.csNotScrollOnTop).removeClass(a.csScrollontop);
            a.$showBanner.slideUp(400,
            function() {
                setTimeout(setArtWallCloseIconPosition(), 0)
            });
            a.$header.removeClass(a.csHeaderNotFixed);
            if (a.$body.hasClass(a.csPageTypeLvNow) && a.$body.hasClass(a.csWithTopBanner)) {
                a.$lvHeader.removeClass(a.csPosFixedTop + " " + a.csHeaderNotFixed)
            }
        } else {
            if ($(window).scrollTop() == 0) {
                a.$body.addClass(a.csScrollontop).removeClass(a.csNotScrollOnTop);
                a.$showBanner.slideDown(400,
                function() {
                    setTimeout(setArtWallCloseIconPosition(), 0)
                });
                headerPosition(a)
            }
        }
    }
};
setArtWallCloseIconPosition = function() {
    var b = $(".cs_banner.showBanner:visible");
    var a = b.outerHeight();
    if (a != null && a != undefined && b.is(":visible")) {
        if (RESPONSIVE_MANAGER.isMediumLargeMode()) {
            $(".pop-art-wrapper").find(".closeIcon").css("top", a + 5)
        } else {
            $(".pop-art-wrapper").find(".closeIcon").css("top", "0")
        }
    } else {
        $(".pop-art-wrapper").find(".closeIcon").css("top", "0")
    }
};
paddingTopMain = 0;
topBanner = function() {
    var a = {
        $body: $("body"),
        $header: $("#header"),
        $cookieBanner: $("#userConsentDatas"),
        $bannerItem: $(".cs_banner"),
        $content: $(".content"),
        $topBanner: $(".cs_topbanner"),
        $closeBtn: $(".cs_closeBtn"),
        $lvHeader: $(".lvnow-header"),
        $showBanner: $(".showBanner"),
        $page: $(".page"),
        $geoLocalizationBanner: $("#geoLocalizationBanner"),
        $topBannerGeoloc: $("#topBannerGeoloc"),
        csScrollontop: "cs-scrollontop",
        csTopBanner: "cs_topbanner",
        csNotScrollOnTop: "cs-notscrollontop",
        csSetCookie: "cs_setCookie",
        csPageTypeLvNow: "page-type-newnow_hp",
        csPageTypeProduct: "page-type-product",
        csWithTopBanner: "cs-withtopbanner",
        csRemoveBanner: "cs_removeBanner",
        csPosFixedTop: "positionFixedTop",
        csPosFixedPad: "positionFixedPadding",
        csShowBanner: "showBanner",
        csHeaderNotFixed: "headernotfixed",
        csPageTypeCat: "page-type-category",
        csHeaderOn: "headerOn",
        csRemoveGeoLocalization: "cs_removeGeoLocalization",
        csRemoveTopBannerGeoloc: "cs_removeTopBannerGeoloc",
        noSetTimeOut: ["page-type-home", "page-type-category", "page-type-search"],
        withSetTimeOut: ["page-type-product"]
    };
    if (a.$geoLocalizationBanner.length == 1 && displayGeoLocalizationBanner()) {
        a.$header.addClass(a.csHeaderNotFixed);
        a.$body.addClass(a.csWithTopBanner);
        a.$geoLocalizationBanner.addClass(a.csShowBanner);
        $("#geolocalization-consent").on("click",
        function(b) {
            closeBanner(a, b)
        });
        $.jStorage.set(localStorageInvoicingCountry, $("#invoicingCountry").val())
    }
    if (a.$topBannerGeoloc.length == 1) {
        a.$header.addClass(a.csHeaderNotFixed);
        a.$body.addClass(a.csWithTopBanner);
        a.$topBannerGeoloc.addClass(a.csShowBanner);
        $(window).resize()
    }
    if (a.$cookieBanner.length == 1 && getConsentDatasCookie() !== "true") {
        a.$header.addClass(a.csHeaderNotFixed);
        a.$body.addClass(a.csWithTopBanner);
        a.$cookieBanner.addClass(a.csShowBanner)
    }
    $.each(a.noSetTimeOut,
    function(b, c) {
        if (a.$body.hasClass(c)) {
            showTopBanner(a);
            window.scrollTo(0, 0)
        }
    });
    $.each(a.withSetTimeOut,
    function(b, c) {
        setTimeout(function() {
            if (a.$body.hasClass(c)) {
                window.scrollTo(0, 0);
                showTopBanner(a)
            }
        },
        500)
    });
    $(window).scroll(function() {
        if (!RESPONSIVE_MANAGER.isAllSmallMode() && a.$body.hasClass(a.csWithTopBanner) || a.$body.hasClass(a.csPageTypeCat) && a.$body.hasClass(a.csWithTopBanner)) {
            if (!a.$body.hasClass(a.csHeaderOn)) {
                checkScrollTop(a)
            }
        }
        if (RESPONSIVE_MANAGER.isAllSmallMode()) {
            if ($(window).scrollTop() >= $("#header").height()) {
                $(".lv-wrapper").addClass("fixed")
            } else {
                $(".lv-wrapper").removeClass("fixed")
            }
        }
    });
    $(window).resize(function() {
        if ($(window).scrollTop() == 0) {
            setTimeout(function() {
                checkScrollTop(a)
            },
            300)
        }
    });
    a.$closeBtn.on("click",
    function(b) {
        closeBanner(a, b);
        if (RESPONSIVE_MANAGER.isMediumLargeMode()) {
            setArtWallCloseIconPosition()
        }
    })
};
showTopBanner = function(a) {
    if (a.$topBannerGeoloc.length == 0 && a.$geoLocalizationBanner.length == 0 && (a.$cookieBanner.length == 0 || getConsentDatasCookie() === "true")) {
        if (a.$topBanner.length == 1 && sessionStorage.topBanner === undefined) {
            a.$body.addClass(a.csWithTopBanner);
            a.$header.addClass(a.csHeaderNotFixed);
            a.$topBanner.slideDown().addClass(a.csShowBanner)
        } else {
            a.$body.removeClass(a.csWithTopBanner)
        }
    }
};
displayGeoLocalizationBanner = function() {
    var a = $("#invoicingCountry").val();
    return a !== $.jStorage.get(localStorageInvoicingCountry)
};
closeBanner = function(c, b) {
    var a = false;
    if ($(b.currentTarget).hasClass(c.csRemoveTopBannerGeoloc)) {
        c.$topBannerGeoloc.removeAttr("style").removeClass(c.csShowBanner);
        handleTopBanner(c)
    } else {
        if ($(b.currentTarget).hasClass(c.csRemoveGeoLocalization)) {
            c.$geoLocalizationBanner.removeAttr("style").removeClass(c.csShowBanner);
            if ($("#topBannerGeoloc").length == 0) {
                handleTopBanner(c)
            }
        } else {
            if ($(b.currentTarget).hasClass(c.csSetCookie)) {
                c.$cookieBanner.removeAttr("style").removeClass(c.csShowBanner);
                handleTopBanner(c)
            } else {
                if ($(b.currentTarget).hasClass(c.csRemoveBanner)) {
                    c.$topBanner.removeClass(c.csShowBanner).removeAttr("style");
                    c.$header.removeClass(c.csHeaderNotFixed);
                    c.$body.removeClass(c.csWithTopBanner);
                    sessionStorage.topBanner = "read"
                }
            }
        }
    }
};
function handleTopBanner(b) {
    var a = false;
    $.each(b.noSetTimeOut,
    function(c, d) {
        if (b.$body.hasClass(d)) {
            a = true
        }
    });
    if (a) {
        if (b.$body.hasClass(b.csWithTopBanner)) {
            b.$topBanner.slideDown().addClass(b.csShowBanner)
        }
    } else {
        $.each(b.withSetTimeOut,
        function(c, d) {
            setTimeout(function() {
                if (b.$body.hasClass(d)) {
                    if (b.$body.hasClass(b.csWithTopBanner)) {
                        b.$topBanner.slideDown().addClass(b.csShowBanner)
                    }
                } else {
                    b.$topBanner.removeClass(b.csShowBanner);
                    b.$header.removeClass(b.csHeaderNotFixed);
                    b.$body.removeClass(b.csWithTopBanner);
                    if (b.$body.hasClass(b.csPageTypeLvNow)) {
                        b.$lvHeader.removeClass(b.csPosFixedTop + " " + b.csHeaderNotFixed)
                    }
                }
            },
            500)
        })
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
function minimizeProductsName(a) {
    $(".productName.toMinimize").each(function(d) {
        var c = clean_tags($(this).text());
        var g = 24;
        var f = 20;
        var e = c.split(" ");
        if (RESPONSIVE_MANAGER.isAllSmallMode()) {
            g = 26;
            f = 15
        }
        if (c.length > g) {
            if (c.indexOf(" ") > 0) {
                if (e[0].length <= g) {
                    var b = splitToSpace(c, g);
                    var h = c.substr(b.length);
                    c = '<span class="line">' + b + "</span> ";
                    c += '<span class="line">' + h + "</span>";
                    $(this).html(c).removeClass("toMinimize")
                } else {
                    c = '<span class="line ellip">' + c + "</span>";
                    $(this).html(c).removeClass("toMinimize")
                }
            } else {
                if (c.indexOf(" ") < 0 && e[0].length >= g) {
                    c = '<span class="line ellip">' + c + "</span>";
                    $(this).html(c).removeClass("toMinimize")
                }
            }
        }
    })
}
function stickersEventsHandler() {
    if ($(".stickersList").length == 0) {
        $("#products-grid, #look-products-grid").addClass("noColorSelection")
    } else {
        $("#products-grid, #look-products-grid").removeClass("noColorSelection")
    }
    var a = function() {
        var k = $(this);
        if (!k.hasClass("selected") && !k.hasClass("stop")) {
            var h = k.attr("data-sticker"),
            e = k.parent(".stickersList"),
            o = k.closest(".stickersList").find(".selected"),
            g = k.closest(".productItemContainer").find("> .productItem .imageWrapper"),
            p = k.closest(".availableMarketingColors").find(".hiddenSkuImages"),
            f = p.find("[data-sticker=" + h + "]"),
            q = f.find("img"),
            n,
            m;
            var l = k.closest(".productItemContainer").find("a");
            n = q.clone().css("display", "none").addClass("new");
            g.append(n);
            m = g.find("img:not(.new)");
            o.removeClass("selected");
            o.addClass("stop");
            k.addClass("selected");
            if (n.hasClass("imageNotLoaded")) {
                n.remove("imageNotLoaded");
                loadingImgs(".productItemContainer")
            }
            m.stop(true, true).fadeOut(400);
            n.stop(true, true).fadeIn(400,
            function() {
                m.remove();
                n.removeClass("new");
                o.removeClass("stop")
            });
            l.attr({
                id: f.attr("id"),
                href: f.attr("data-href"),
                "data-sku": f.attr("data-sku"),
                "data-rank": f.attr("data-rank"),
                "data-index": f.attr("data-index"),
                "data-detail": f.attr("data-detail"),
                "data-productId": f.attr("data-productId"),
                "data-productcategory": f.attr("data-productcategory")
            });
            e.find(".stickersLink").attr("data-href", f.attr("data-href"))
        }
    };
    function d() {
        $(".productItemContainer").each(function() {
            var g = $(this),
            f = g.find("> .productItem").attr("data-index"),
            e = g.find(".stickersList [data-index=" + f + "]");
            e.addClass("selected")
        })
    }
    $(document).on("click", ".stickerItem", a);
    d();
    $(".stickersLink").on("click",
    function() {
        window.location = $(this).attr("data-href")
    });
    function c(e) {
        e.find(".product-img").addClass("postLoaderResponsive");
        loadingImgs(".hiddenSkuImages:not(.fullyLoaded)");
        e.addClass("fullyLoaded")
    }
    function b() {
        var f = 6000;
        var e = 2000;
        setTimeout(function() {
            setInterval(function() {
                $target = $(".hiddenSkuImages:not(.fullyLoaded):eq(0)");
                if ($target.length > 0) {
                    c($target)
                }
            },
            e)
        },
        f)
    }
    $(document).on("mouseenter.cg mouseleave.cg", ".productItemContainer",
    function() {
        $target = $(this).find(".hiddenSkuImages:not(.fullyLoaded)");
        if ($target.length > 0) {
            c($target)
        }
    });
    $(window).load(b)
}
function clean_tags(html) {
    if (arguments.length < 3) {
        html = html.replace(/<\/?(?!\!)[^>]*>/gi, "")
    } else {
        var allowed = arguments[1];
        var specified = eval("[" + arguments[2] + "]");
        if (allowed) {
            var regex = "</?(?!(" + specified.join("|") + "))\b[^>]*>";
            html = html.replace(new RegExp(regex, "gi"), "")
        } else {
            var regex = "</?(" + specified.join("|") + ")\b[^>]*>";
            html = html.replace(new RegExp(regex, "gi"), "")
        }
    }
    var cleaner_string = html;
    return cleaner_string
}
function testEndlessSession() {
    var a = (window.location != window.parent.location);
    var b = Math.floor(Math.random() * 100000);
    var c = true;
    if ($("#check-endless-context").length) {
        c = $("#check-endless-context").val()
    }
    if ((a == true) && (c == true)) {
        getAjax(true, "isEndlessSessionSet.jsp",
        function(f) {
            $.jStorage.set(LocalStorageStoreLangCommerceHeader, CONFIGURATION.STORE_LANG);
            var d = JSON.parse(f);
            var e = d.isEndlessContextSet;
            if (e == "false") {
                var g = d.endlessErrorUrl;
                document.location.href = g
            }
        },
        {
            logout: CONFIGURATION.LOGOUT,
            randomParam: b
        })
    }
}
function setLinksInLabelAttributs() {
    $("label button, label a").each(function() {
        var a = "";
        if ($(this).is("[data-dom]")) {
            a = $(this).attr("data-dom").substr(1)
        } else {
            if ($(this).closest("[data-dom]").is("[data-dom]")) {
                a = $(this).closest("[data-dom]").attr("data-dom").substr(1)
            }
        }
        $(this).attr("id", $(this).parents("label").attr("for") + a + "Btn")
    });
    $("label a").attr("href", "javascript=void(0)");
    $("label a").attr("role", "button")
}
$(document).ready(function() {
    if ($(".wp-push-title").length) {
        titleSameHeight()
    }
    addClassToRadioChecked();
    topBanner();
    if (RESPONSIVE_MANAGER.isMediumLargeMode()) {
        setArtWallCloseIconPosition()
    }
    $(window).on("resize", setArtWallCloseIconPosition);
    var a = JSON.parse(localStorage.getItem("checkboxValues")) || {},
    b = $("#checkEmailForm .subscribeNewsLetterLine :checkbox");
    b.on("change",
    function() {
        b.each(function() {
            a[this.id] = this.checked
        });
        localStorage.setItem("checkboxValues", JSON.stringify(a))
    });
    $.each(a,
    function(c, d) {
        $("#" + c).prop("checked", d)
    });
    handlePageTitleFormError();
    $(".bgSearchForm").on("focusout",
    function() {
        var c = $(this);
        setTimeout(function() {
            if (!c.find(":focus").length) {
                closeDropUpPanels()
            }
        },
        0)
    });
    setTimeout(mylvNavMobile, 100);
    $(".specialOccasionTitle").replaceWith('<h1 class="specialOccasionTitle">' + $(".specialOccasionTitle").html() + "</h1>")
});
function addClassToRadioChecked() {
    $("#orderTotalTable input[type=radio]:checked").closest(".displayTableRow").addClass("taxShippingRadioActive")
}
function notifyMoMError(a) {
    $("#momAddInitialsMenu .errorMessage").html(a);
    $("#momAddInitialsMenu .errorMessage").removeClass("hide")
}
$(function() {
    $("#topBannerTap").attr("data-evt-content-id", $("#topBannerTap").text().trim().replace(/[\t\n]+/g, " "));
    $(document).on("keyup",
    function(b) {
        if (b.keyCode == 27) {
            a()
        }
    });
    $(document).on("click", "#closeBubble_1", a);
    function a() {
        window.setTimeout(function() {
            var c = $("#header-mylv");
            var b = $("[aria-expanded]", c);
            $(".mylv-bubble", c).fadeOut(200,
            function() {
                c.removeClass("mylv-bubble-on");
                $(this).removeAttr("style").removeClass("verticalViewportHandler").removeClass("horizontalViewportHandler");
                $(".myLV [aria-expanded]").attr("aria-expanded", "false")
            });
            $(".arrow-selected", c).fadeOut(200,
            function() {
                $(this).css("display", "")
            })
        },
        800)
    }
});
function isKeyboardUsed() {
    $(document).on("keyup",
    function() {
        if (!$("body").hasClass("keyboard-is-used")) {
            $("body").addClass("keyboard-is-used")
        }
    });
    $(document).on("mousedown",
    function() {
        if ($("body").hasClass("keyboard-is-used")) {
            $("body").removeClass("keyboard-is-used")
        }
    })
}
var mylvNavMobile = function() {
    $(".js-lv-nav-inter").on("click",
    function(a) {
        a.stopPropagation();
        if ($(".lv-header").hasClass("open")) {
            $(".lv-header").removeClass("open");
            $(".lv-nav").slideUp("fast");
            $(".js-lv-nav-inter").attr("aria-expanded", "false")
        } else {
            $(".lv-header").addClass("open");
            $(".lv-nav").slideDown("fast");
            $(".js-lv-nav-inter").attr("aria-expanded", "true")
        }
        return false
    })
};
var titleSameHeight = function() {
    title1 = $(".wp-push-profile .wp-push-title");
    title2 = $(".wp-push-order .wp-push-title");
    $hT1 = title1.height();
    $hT2 = title2.height();
    $hTMax = Math.max($hT1, $hT2);
    $(title1).css("min-height", $hTMax + "px");
    $(title2).css("min-height", $hTMax + "px")
};
$(window).on("resize",
function() {
    if ($(".wp-push-title").length) {
        titleSameHeight()
    }
});
function isCookieExisting(a) {
    return document.cookie.indexOf(a + "=") >= 0
}
function isCookieEmpty(a) {
    return getCookie(a) == ""
}
var geolocUserZoneCookieName = "geolocUserZone",
geolocUserZoneCookiePath = "/",
geolocUserZoneCookieDomain = ".louisvuitton.com",
geolocAkamaiCookieName = "ak_cc",
geolocAkamaiCookieValue, geolocMappingZonesUrl = "/geoloc/mapping_zones.json",
geolocNoZonePattern = "noZone",
geolocTopBannerClosedCookieName = "geolocTopBannerClosed",
geolocZonePattern;
function topBannerGeolocAkamaiCookieHandler() {
    if (!isCookieExisting(geolocUserZoneCookieName) || isCookieEmpty(geolocUserZoneCookieName)) {
        if (isCookieExisting(geolocAkamaiCookieName)) {
            if (isCookieEmpty(geolocAkamaiCookieName)) {
                geolocZonePattern = geolocNoZonePattern;
                document.cookie = geolocUserZoneCookieName + "=" + geolocZonePattern + ";path=" + geolocUserZoneCookiePath + ";domain=" + geolocUserZoneCookieDomain + ";"
            } else {
                geolocAkamaiCookieValue = getCookie(geolocAkamaiCookieName);
                $.ajax({
                    dataType: "json",
                    url: geolocMappingZonesUrl,
                    success: function(a) {
                        if (typeof a[geolocAkamaiCookieValue] != "undefined") {
                            geolocZonePattern = a[geolocAkamaiCookieValue]
                        } else {
                            geolocZonePattern = geolocNoZonePattern
                        }
                        document.cookie = geolocUserZoneCookieName + "=" + geolocZonePattern + ";path=" + geolocUserZoneCookiePath + ";domain=" + geolocUserZoneCookieDomain + ";";
                        topBannerGeolocAkamaiHandler()
                    },
                    error: function(a, c, b) {
                        geolocZonePattern = geolocNoZonePattern;
                        document.cookie = geolocUserZoneCookieName + "=" + geolocZonePattern + ";path=" + geolocUserZoneCookiePath + ";domain=" + geolocUserZoneCookieDomain + ";"
                    }
                })
            }
        }
    }
}
function topBannerGeolocAkamaiHandler() {
    if (isCookieExisting(geolocUserZoneCookieName) && !isCookieEmpty(geolocUserZoneCookieName) && !$("#topBannerGeoloc").length) {
        var g = getCookie(geolocUserZoneCookieName);
        var f = g.split("#")[0];
        var h = window.location.pathname.split("/")[1];
        if (f != h && f != geolocNoZonePattern && f != "" && (!isCookieExisting(geolocTopBannerClosedCookieName) || isCookieEmpty(geolocTopBannerClosedCookieName))) {
            var e = g.split("-")[1].split("#")[0].toUpperCase();
            var b = "&geolocConfiguration=" + e;
            var c = g.split("#")[1];
            var d = "";
            var a;
            if (typeof c != "undefined") {
                d = "&countryContext=" + c;
                a = "geolocZonePattern=" + g.split("#")[0] + "_" + c
            } else {
                a = "geolocZonePattern=" + g
            }
            $.ajax({
                url: "/headerFragments/topbannerGeoloc.jsp?" + a + b + d,
                success: function(k) {
                    if ($(".cs_topbanner.cs_banner").length) {
                        $(".cs_topbanner.cs_banner").before(k)
                    } else {
                        $("#header").before(k)
                    }
                    $("#topBannerGeoloc").addClass("showBanner");
                    topBanner();
                    $("#topBannerGeolocClose").on("click",
                    function() {
                        document.cookie = geolocTopBannerClosedCookieName + "=true;path=" + geolocUserZoneCookiePath + ";domain=" + geolocUserZoneCookieDomain + ";";
                        $("#topBannerGeoloc").remove()
                    })
                },
                error: function(k, m, l) {}
            })
        }
    }
}
function financialNumber(a) {
    return Number.parseFloat(a).toFixed(2)
}
function loadingImgs(b, a) {
    window.LOADING_IMAGE_MANAGER.loadResponsiveImages(b, a);
    window.LOADING_IMAGE_MANAGER.postLoaderImage()
}
function buildOptions(a) {
    a = a || {};
    if (a.carousel) {
        a.carousel = undefined;
        a.height = false;
        a.zoom = window.carousel && window.carousel.enlargementFactor
    }
    return a
}
window.LOADING_IMAGE_MANAGER = new(function(e) {
    var k = ".postLoadImage",
    o = ".postLoaderResponsive",
    d = ".slideshow";
    this.loadResponsiveImages = function(s, C) {
        C = buildOptions(C);
        var D = 0,
        t = 0,
        u = false;
        var y = this;
        function A() {
            D++;
            if (D === t) {
                centerDiv();
                fireEvent("endImagesLoad", s);
                if (u) {
                    loadingImgs()
                }
            }
        }
        function x(E) {
            var F = {
                width: p(E),
                height: f(E)
            };
            return w(F.width, F.height)
        }
        function w(F, E) {
            return F / E
        }
        function B(F, G) {
            var E = F.attr("style") && F.attr("style").match(new RegExp(".*(?:" + G + " *: *)([^; ]*) *;"));
            if (E && E.length >= 2) {
                E = E[1];
                if (E && !/%/.test(E) && !/auto/.test(E)) {
                    E = parseFloat(E.replace("px", "").replace("em", ""), 10);
                    if (E) {
                        return E
                    }
                }
            }
            return F[G]()
        }
        function v(F, J) {
            if (F.height <= 1) {
                return "width"
            } else {
                if (F.width <= 1) {
                    return "height"
                }
            }
            var H = CONFIGURATION.RENDITIONS_CONVERGENCE[J];
            if (!H || !H[0]) {
                return "width"
            }
            var E = n(H[0]);
            var G = x(E);
            var I = F.height * G;
            return I > F.width ? "width": "height"
        }
        var z = s || "";
        e(z + " " + o).each(function() {
            var T = e(this);
            if (!z && T.closest(d).length) {
                return
            }
            var N = m(T),
            R = a(N),
            K = T.data("currentcategory") || R,
            I = T.data("roundingfactor") || 1,
            U = T.attr(RESPONSIVE_MANAGER.getResponsiveAttributeKey(T, "data-use-dimension"));
            if (K === "reload") {
                K = R
            }
            if (["width", "height", "both"].indexOf(U) === -1) {
                U = "width"
            }
            if (!N || !T.parent().is(":visible")) {
                return
            }
            var V = T.css("display");
            T.hide();
            t++;
            var W = "",
            E = T,
            J = E.data("loaded-width") || 0,
            M = E.data("loaded-src-attr"),
            O = T.parent(),
            G = {
                width: B(O, "width") * (C.zoom || 1),
                height: B(O, "height") * (C.zoom || 1),
                use: U
            },
            P = RESPONSIVE_MANAGER.getResponsiveAttributeKey(T, "data-src");
            T.css("display", V);
            if (G.width === 0 && G.height === 0) {
                if (navigator.userAgent.indexOf("Trident/7.0") !== -1) {
                    return
                }
                G.width = B(E, "width") * (C.zoom || 1);
                G.height = B(E, "height") * (C.zoom || 1)
            }
            if (U === "both") {
                G.use = v(G, K)
            }
            G.main = G[G.use];
            N = E.attr(P);
            R = a(N);
            if (R) {
                if ((R === "PM2" || R === "PM1") && G.height <= 0) {
                    var Q = Math.min(screen.height, screen.width);
                    if (Q < G.width) {
                        G.height = Q;
                        G.use = "height";
                        G.main = Q
                    }
                }
                var L = y.getNearestImageConfig(G, R, I);
                var H = P === M || (M && E.attr(P) === E.attr(M));
                if (J >= L.width && H) {
                    E.attr("data-currentcategory", R);
                    return
                }
                W = l(L, E, G, y, N, R, I, C)
            } else {
                W = h(E, y, N);
                E.removeClass(o.replace(".", ""))
            }
            var F = function() {
                var Z = RESPONSIVE_MANAGER.getResponsiveAttributeKey(E, "data-default");
                var Y = RESPONSIVE_MANAGER.getAttributeFromKey(E, Z);
                if (Y !== undefined && Y !== "") {
                    E.attr(P, Y);
                    E.attr("data-currentcategory", "default");
                    E.attr(Z, "");
                    u = true
                }
                c(E, C);
                A()
            };
            var S = function() {
                b(E, W);
                E.attr("data-currentcategory", R);
                c(E, C);
                A();
                E.trigger("imageLoaded")
            };
            var X = new Image();
            if (!N || N === "") {
                F()
            } else {
                E.attr("data-loaded-src-attr", P);
                e(X).load(S).on("error", F).attr("src", W)
            }
        })
    };
    function l(x, v, w, u, s, t, y, A) {
        var z = {
            opacity: 1
        };
        z[w.use] = q(v) ? "": "100%";
        if (A.height !== false) {
            z.height = u.getImageHeight(w.width, x.rendition)
        }
        v.css(z).attr("src", "").data("loaded-width", x.width);
        if (!q(v)) {
            v.addClass("imageNotLoaded")
        }
        return u.buildUrlImageScene7(s, x)
    }
    function h(u, t, w) {
        var v = w.replace(CONFIGURATION.Scene7PresetParam, "");
        var s = v.split("?");
        return s[0] ? s[0] : v
    }
    this.buildUrlImageScene7 = function(t, s) {
        return t.replace(CONFIGURATION.Scene7PresetParam, s.preset).replace(CONFIGURATION.Scene7WidthParam, s.width).replace(CONFIGURATION.Scene7HeightParam, s.height)
    };
    function c(t, s) {
        if (s.height !== false) {
            t.height("")
        }
        t.animate({
            opacity: 1
        },
        500);
        t.removeClass("imageNotLoaded")
    }
    function b(s, t) {
        if (q(s)) {
            s.css("background-image", "url(" + t + ")");
            s.css("width", "")
        } else {
            s.attr("src", t)
        }
    }
    function q(s) {
        return s.attr("data-isBackgroundImage") && s.attr("data-isBackgroundImage") === "true"
    }
    function p(s) {
        s += "";
        return parseInt(s.split("x")[0], 10)
    }
    function f(s) {
        s += "";
        return parseInt(s.split("x")[1], 10)
    }
    this.getNearestRendition = function(s, x) {
        if (typeof(window.devicePixelRatio) !== "undefined" && window.devicePixelRatio > 1) {
            s *= 2
        }
        var w = CONFIGURATION.RENDITIONS_CONVERGENCE[x],
        v = w[0];
        for (var u = 0; u < w.length; u++) {
            var t = w[u];
            if (p(w[u]) >= s) {
                v = t
            } else {
                break
            }
        }
        return v
    };
    this.getNearestImageConfig = function(A, s, C) {
        var v = A.main;
        if (typeof(window.devicePixelRatio) !== "undefined" && window.devicePixelRatio > 1) {
            v *= 2
        }
        var y = CONFIGURATION.RENDITIONS_CONVERGENCE[s],
        B = y[0],
        t = B;
        for (var w = 1; w < y.length; w++) {
            var x = n(y[w]);
            if ((A.use === "height" ? f: p)(x) >= v) {
                B = y[w]
            } else {
                break
            }
        }
        var u = g(B);
        var z = g(t);
        if (A.use === "height") {
            u.height = this.roundToNearestN(v, C);
            u.width = Math.round(this.getImageWidth(u.height, u.rendition))
        } else {
            u.width = this.roundToNearestN(v, C);
            u.height = Math.round(this.getImageHeight(u.width, u.rendition))
        }
        if (z.height < u.height || z.width < u.width) {
            u.width = z.width;
            u.height = z.height
        }
        return u
    };
    function n(s) {
        return Object.keys(s)[0]
    }
    function r(s) {
        return s[n(s)]
    }
    function g(t) {
        var s = n(t);
        return {
            rendition: s,
            preset: r(t),
            width: p(s),
            height: f(s)
        }
    }
    this.roundToNearestN = function(s, t) {
        return t === 1 ? Math.round(s) : t * Math.ceil(s / t)
    };
    this.getImageHeight = function(s, t) {
        return s * f(t) / p(t)
    };
    this.getImageWidth = function(s, t) {
        return s * p(t) / f(t)
    };
    function a(t) {
        for (var s in CONFIGURATION.RENDITIONS_CONVERGENCE) {
            if (t && t.indexOf("_" + s) !== -1) {
                return s
            }
        }
        return undefined
    }
    function m(s) {
        return RESPONSIVE_MANAGER.getResponsiveAttribute(s, "data-src")
    }
    e(window).on("lv.slideshow.resized",
    function(t, s) {
        var v = s.slideshowContainer.attr("id"),
        u = e("#" + v + " img");
        u.hide();
        loadingImgs(v ? "#" + v: "");
        u.show()
    });
    this.postLoaderImage = function() {
        e(k).each(function() {
            var s = e(this);
            s.attr("src", s.attr("data-src")).removeClass("postLoadImage").removeAttr("data-src")
        })
    }
})(jQuery);
var RESPONSIVE_MANAGER = new(function() {
    var m = [];
    var b;
    var n = $(window).width();
    var k = $(window).height();
    var d;
    this.initResponsive = function() {
        this.setModeValue();
        b = getOrientation();
        $("meta[name=orientation]").attr("content", b);
        fireEvent("orientationMetaSetted");
        registerEvent("leave-MediumLarge-breakpoint", this.handleEnterAS.bindOld(this));
        registerEvent("leave-AllSmall-breakpoint", this.handleEnterML.bindOld(this));
        registerEvent("windowResize", this.windowResizeHandler.bindOld(this));
        registerEvent("windowResize", this.keepMasterRatio.bindOld(this));
        $(window).resize(this.handleResize.bind(this))
    };
    this.isXtraSmallMode = function() {
        return this.isModeNamed("XtraSmall")
    };
    this.isSmallMode = function() {
        return this.isModeNamed("Small")
    };
    this.isAllSmallMode = function() {
        return this.isModeNamed("AllSmall")
    };
    this.isMediumMode = function() {
        return this.isModeNamed("Medium")
    };
    this.isMediumLargeMode = function() {
        return this.isModeNamed("MediumLarge")
    };
    this.isXtraMediumMode = function() {
        return this.isModeNamed("XtraMedium")
    };
    this.isLargeMode = function() {
        return this.isModeNamed("Large")
    };
    this.isModeNamed = function(p) {
        if (isIE_InfEq8) {
            return this.handleModeNonResponsiveBrowser(p)
        }
        return this.getMediaQueryFromModeName(p) && window.matchMedia(this.getMediaQueryFromModeName(p)).matches
    };
    this.setModeValue = function() {
        this.updateResponsiveMode()
    };
    if (typeof(window.matchMedia) === "undefined") {
        window.matchMedia = function(t) {
            var p = true;
            var s = t.split("and");
            for (var q = 0; q < s.length && p; q++) {
                var u = s[q];
                if (u.indexOf("max-width") !== -1) {
                    p = $(window).width() <= parseInt(u.split(":")[1])
                } else {
                    if (u.indexOf("min-width") !== -1) {
                        p = $(window).width() >= parseInt(u.split(":")[1])
                    }
                }
            }
            var r = {};
            r.matches = p;
            return r
        }
    }
    this.handleEnterAS = function() {
        this.handleTransitionMegaMenuML_AS();
        loadingImgs()
    };
    this.handleEnterML = function() {
        this.handleTransitionMegaMenuAS_ML();
        loadingImgs()
    };
    this.handleModeNonResponsiveBrowser = function(r) {
        var q = this.getSuffixFromMode(r);
        for (var p = 0; p < CONFIGURATION.suffixesWithoutResponsiveJson.length; p++) {
            if (CONFIGURATION.suffixesWithoutResponsiveJson[p] === q) {
                return true
            }
        }
        return false
    };
    this.isModeFromSuffix = function(p) {
        var q = this.getModeFromSuffix(p);
        return this.isModeNamed(q)
    };
    this.getModeFromSuffix = function(q) {
        for (var p = 0; p < CONFIGURATION.BREAKPOINTS_ARRAY.length; p++) {
            if (CONFIGURATION.BREAKPOINTS_ARRAY[p].suffix.toLowerCase() === q.toLowerCase()) {
                return CONFIGURATION.BREAKPOINTS_ARRAY[p].mode
            }
        }
        return ""
    };
    this.getSuffixFromMode = function(q) {
        for (var p = 0; p < CONFIGURATION.BREAKPOINTS_ARRAY.length; p++) {
            if (CONFIGURATION.BREAKPOINTS_ARRAY[p].mode.toLowerCase() === q.toLowerCase()) {
                return CONFIGURATION.BREAKPOINTS_ARRAY[p].suffix
            }
        }
        return ""
    };
    this.buildModeNameToMediaQuery = function() {
        d = {};
        for (var p = 0; p < CONFIGURATION.BREAKPOINTS_ARRAY.length; p++) {
            d[CONFIGURATION.BREAKPOINTS_ARRAY[p].mode] = CONFIGURATION.BREAKPOINTS_ARRAY[p].mediaQuery
        }
    };
    this.getMediaQueryFromModeName = function(p) {
        if (!d) {
            this.buildModeNameToMediaQuery()
        }
        return d[p]
    };
    function a() {
        var u = $(window).width();
        var q = $(window).height();
        var r = $(document).width();
        var t = $(document).height();
        var p = screen.width;
        var s = screen.height;
        alert("\nWindow: " + u + "x" + q + "\nDocument: " + r + "x" + t + "\nScreen: " + p + "x" + s)
    }
    function e() {
        var p = $(window);
        return n === p.width()
    }
    var f = 0;
    this.handleResize = function() {
        if (e()) {
            return
        }
        fireEvent("windowResize");
        f++;
        var p = this;
        setTimeout((function(q, r) {
            return function() {
                r.checkResize(q)
            }
        })(f, p), 100)
    };
    this.windowResizeHandler = function() {
        this.updateResponsiveMode();
        this.handleBubbles();
        handleMyLVBubblePosition();
        this.handleMegaMenu();
        handleCartIconBehaviour();
        handleCartBubblePosition();
        centerDiv();
        if ($(".hotstampingModal").length > 0) {
            calculateCoordinate()
        }
    };
    this.updateResponsiveMode = function() {
        var q = m;
        var s = h(q);
        m = [];
        for (var p = 0; p < CONFIGURATION.BREAKPOINTS_ARRAY.length; p++) {
            if (this.isModeNamed(CONFIGURATION.BREAKPOINTS_ARRAY[p].mode)) {
                m.push(CONFIGURATION.BREAKPOINTS_ARRAY[p].mode)
            }
        }
        var r = h(m);
        c(r, q, "leave");
        c(s, m, "enter");
        l(q, r)
    };
    function l(p, q) {
        if (o(p, q)) {
            $(".postLoaderResponsive").attr("data-currentcategory", "reload")
        }
    }
    function o(r, q) {
        for (var p = 0; p < r.length; p++) {
            if (!q[r[p]]) {
                return true
            }
        }
        return false
    }
    function h(r) {
        var q = {};
        for (var p = 0; p < r.length; p++) {
            q[r[p]] = true
        }
        return q
    }
    function c(s, r, q) {
        for (var p = 0; p < r.length; p++) {
            if (!s[r[p]]) {
                fireEvent(q + "-" + r[p] + "-breakpoint")
            }
        }
    }
    this.checkResize = function(p) {
        if (p === f) {
            if (e()) {
                return
            }
            loadingImgs();
            this.launchResize()
        }
    };
    this.handleMegaMenu = function() {
        var p = $("#headerLeft .mega-menu-on");
        if (!this.isAllSmallMode()) {
            $(".headerLevel1").css("display", "block");
            if (p.length) {
                if (!$(".mega-menu-content-on", p).length) {
                    $(".mega-menu-container li:first", p).addClass("mega-menu-content-on")
                } else {
                    $("img", p).attr("data-currentcategory", "reload")
                }
            }
        }
    };
    function g() {
        var q = $(".cart"),
        p = $("#header");
        if (CONFIGURATION.STORE_TYPE === "shop") {
            $(".shopping-bag").css("right", -1 * ($(window).width() - q.offset().left - q.width()) + 13)
        }
        if (this.isMediumMode()) {
            if ($(".shopping-bag-on", p).length) {
                $(".header-right", p).addClass("toggled");
                $(".togglerRightMenu", p).addClass("toggled")
            } else {
                $(".header-right", p).removeClass("toggled");
                $(".togglerRightMenu", p).removeClass("toggled")
            }
        }
    }
    this.handleTransitionMegaMenuML_AS = function() {
        if ($("#headerLeft").find(".mega-menu-on").length) {
            $("#header").addClass("headerLeftOn");
            $(".headerLevel1").css("display", "")
        } else {
            $("#header").removeClass("headerLeftOn");
            $(".headerLevel1").css("display", "")
        }
    };
    this.handleTransitionMegaMenuAS_ML = function() {
        if ($("#headerLeft").find(".mega-menu-on").length) {
            setTimeout(function() {
                $(".mega-menu-on").find("li.mega-menu-content-on").find(".mega-menu-title").first().click()
            },
            200)
        }
    };
    this.launchResize = function() {
        n = $(window).width();
        k = $(window).height();
        this.updateOrientation();
        fireEvent("resizeEvent");
        if (typeof specificResizeEvent === "function") {
            specificResizeEvent()
        }
    };
    this.updateOrientation = function() {
        var p = getOrientation();
        if (p !== b) {
            fireEvent("orientationChanged", {
                orientation: p
            });
            b = p;
            utag_data.screenOrientation = b
        }
    };
    this.checkResizeEvent = function() {
        if (n !== $(window).width() || k !== $(window).height()) {
            this.launchResize()
        }
        setTimeout(this.checkResizeEvent.bind(this), 500)
    };
    this.handleBubbles = function() {
        if ($(".bt-active").length && window.innerWidth !== n) {
            $(".bt-active").btOff()
        }
    };
    this.keepMasterRatio = function() {
        var p = this;
        $(".keepMasterRatio").each(function() {
            var t = $(this);
            var r = p.getMasterFromMode(t);
            var s = t.width();
            var q = LOADING_IMAGE_MANAGER.getNearestRendition(s, r);
            t.height(LOADING_IMAGE_MANAGER.getImageHeight(s, q))
        })
    };
    this.getMasterFromMode = function(p) {
        return this.getResponsiveAttribute(p, "data-ratio")
    };
    this.getResponsiveAttributeKey = function(r, w) {
        var q = w + "-";
        for (var u = 0,
        t = r.get(0).attributes, p = t.length; u < p; u++) {
            var s = t.item(u).nodeName;
            if (s.startsWith(q)) {
                var v = "_" + s.replace(q, "");
                if (this.isModeFromSuffix(v)) {
                    return s
                }
            }
        }
        return w
    };
    this.getResponsiveAttribute = function(p, q) {
        return p.attr(this.getResponsiveAttributeKey(p, q))
    };
    this.getAttributeFromKey = function(q, p) {
        return q.attr(p)
    };
    this.getValueFromModeMap = function(r) {
        var p = this,
        q;
        $.each(r,
        function(t, s) {
            if (t !== "All" && p.isModeNamed(t)) {
                q = s;
                return false
            }
        });
        if (typeof q === "undefined") {
            q = r.All
        }
        return q
    }
})();
function getOrientation() {
    return $(window).width() > $(window).height() ? "landscape": "portrait"
}
function getIndexInArray(c, b) {
    for (var a = 0; a < c.length; a++) {
        if (b.toLowerCase() === c[a].toLowerCase()) {
            return a
        }
    }
    return - 1
}
if (("standalone" in window.navigator) && window.navigator.standalone) {
    var noddy, remotes = false;
    document.addEventListener("click",
    function(a) {
        noddy = a.target;
        while (noddy.nodeName !== "A" && noddy.nodeName !== "HTML") {
            noddy = noddy.parentNode
        }
        if ("href" in noddy && noddy.href.indexOf("http") !== -1 && (noddy.href.indexOf(document.location.host) !== -1 || remotes)) {
            a.preventDefault();
            document.location.href = noddy.href
        }
    },
    false)
}
function autoDataSend(a) {
    if (typeof autoData !== "undefined" && typeof utag === "object") {
        console.debug("%c event sending ", "background:#5fba7d;color:#fff");
        autoData.sendEvent(a)
    } else {
        console.debug("%c autoData isn't defined", "background: red;")
    }
}
function autoDataSendView(a) {
    a = (a !== undefined) ? a: {};
    if (typeof autoData !== "undefined" && typeof utag === "object") {
        console.debug("%c event sending ", "background:#5fba7d;color:#fff");
        autoData.sendPageView(a)
    } else {
        console.debug("%c autoData isn't defined", "background: red;")
    }
}
function genderLabel(b) {
    var a;
    switch (b) {
    case 1:
        a = "men";
        break;
    case 2:
        a = "women";
        break;
    case 3:
        a = "unisex";
        break;
    default:
        a = b
    }
    return a
}
function getReturnRequestSelectReason() {
    var b = [];
    var a = $(".returnPopupProductBlock").find(".ReturnRequestSelectReason");
    for (var c = 0; c < a.length; c++) {
        var d = a.eq(c).val();
        b.push(d)
    }
    return b.join()
}
function getReturnRequestProductSku() {
    var a = [];
    var c = $(".returnPopupProductBlock").find(".reference");
    for (var b = 0; b < c.length; b++) {
        var d = $.trim(c[b].innerText);
        a.push(d)
    }
    return a.join()
}
$(function() {
    if (utag_data.pageType == "product_list") {
        $(window).on("categoryLoadNewPage",
        function(f, d) {
            var c = {
                pageRank: "result_list_" + d
            };
            autoDataSend(c)
        })
    }
    if (utag_data.pageType == "search_result_list") {
        $(window).on("searchLoadNewPage",
        function(f, d) {
            var c = {
                contentId: "products",
                pageRank: "result_page_" + d
            };
            autoDataSend(c)
        })
    }
    $("#searchHeaderFormulaire").on("submit",
    function(c) {
        autoDataSend({
            actionPosition: "search_field_page",
            actionType: "search",
            actionId: "internal_search",
            internalSearchKeywords: $("#searchHeaderInput").val()
        })
    });
    $(document).on("click", ".facetgroup-list-item a, .facetgroup-thumblist-item button, .facetgroup-thumblist-item a",
    function(d) {
        var c = {
            actionPosition: "filter_selection",
            actionType: "filter",
            actionId: "select_filter",
            filterId: $(this).data("cf-value"),
            filterCategory: $(this).data("cf-id"),
            filterType: "products"
        };
        if (typeof $(this).attr("data-scf-id") !== typeof undefined && $(this).attr("data-scf-id") !== false) {
            c.filterSubCategory = $(this).attr("data-scf-id")
        }
        if ($(this).parent().hasClass("is-active")) {
            c.actionId = "unselect_filter"
        }
        autoDataSend(c)
    });
    $(document).on("click", ".facetgroup-reset, .filters-summary-reset",
    function(c) {
        autoDataSend({
            actionPosition: "filter_selection",
            actionType: "filter",
            actionId: "reset_filters",
            filterType: "products"
        })
    });
    $(document).on("click", ".filters-body-arrow",
    function() {
        autoDataSend({
            actionPosition: "filter_selection",
            actionType: "navigation",
            actionId: "filter_navigation",
            filterType: "products"
        })
    });
    $(document).on("click", "#FiltersButton, #FiltersZone, .facetgroup-title",
    function(d) {
        if (!$(this).is(".facetgroup-title") || $("#FiltersButton").is(".is-closed")) {
            var c;
            if ($("#FiltersButton").hasClass("is-closed")) {
                c = "show_filters"
            } else {
                c = "hide_filters"
            }
            autoDataSend({
                actionPosition: "filter_selection",
                actionType: "filter",
                actionId: c,
                filterType: "products"
            })
        }
    });
    $(window).on("NavigateSlideshow.tracking",
    function(d, c) {
        if (c.selector == "#productSheetSlideshow") {
            autoDataSend({
                actionPosition: "product_area",
                actionId: "product_image_viewed",
                actionType: "product_interaction"
            })
        }
    });
    $(window).on("addWishListSuccess",
    function(d, c) {
        autoDataSend({
            event: "addWishList",
            actionPosition: "product_area",
            actionId: "add_to_wishlist",
            actionType: "e-commerce_interaction"
        })
    });
    $(window).on("addToCartSuccess",
    function(f, d) {
        if (d.cartIsEmpty == "true") {
            var c = "cartInitialization"
        } else {
            var c = "cartAdditions"
        }
        if (utag_data.pageType == "my_wishlist") {
            autoDataSend({
                event: c,
                quantity: "1",
                actionId: "add_to_cart_succeeded",
                productSku: d.sku,
                productStockStatus: d.productStockStatus ? "instock": "outstock",
                gender: genderLabel(d.gender)
            })
        } else {
            autoDataSend({
                event: c,
                actionPosition: "product_area",
                quantity: "1",
                actionId: "add_to_cart_succeeded",
                actionType: "e-commerce_interaction"
            })
        }
    });
    $(window).on("addToCartFailure",
    function(d, c) {
        autoDataSend({
            event: "addToCartFailure",
            actionPosition: "product_area",
            actionId: "add_to_cart_failed",
            actionType: "e-commerce_interaction"
        })
    });
    $(".titleClientInfo.clientInfoExpand").on("click",
    function() {
        if ($(this).hasClass("target-on")) {
            $(this).attr("data-evt-action-id", "close_menu")
        } else {
            $(this).attr("data-evt-action-id", "open_menu")
        }
    });
    var b;
    $(window).on("specificSkuLoaded.tracking",
    function(d, c) {
        b = c;
        $(window).on("getStockSuccess.skuload",
        function(g, f) {
            utag_data.pageName = "productsheet/" + b.sku;
            utag_data.productSku = b.sku;
            utag_data.gender = product_data.product_gender;
            $("meta[name=page_name]").attr("content", utag_data.pageName);
            $("body").attr("data-pv-product-online-sellable-status", product_data.product_online_sellable);
            $("body").attr("data-pv-cross-sell-status", product_data.product_cross_sell_status);
            autoDataSendView({
                productOnlineSellableStatus: product_data.product_online_sellable,
                crossSellStatus: product_data.product_cross_sell_status,
                productStockStatus: (product_data.product_stock == true) ? "instock": "outstock"
            });
            $(window).off("getStockSuccess.skuload")
        })
    });
    $(window).on("getStockSuccess.tracking",
    function(d, c) {
        if ($("body").attr("data-pv-product-stock-status") !== undefined) {
            $("body").attr("data-pv-product-stock-status", (product_data.product_stock == true) ? "instock": "outstock");
            $("body").attr("data-pv-real-time-stock", true)
        }
    });
    $(window).on("newsletterRegistrationSuccess",
    function(d, c) {
        autoDataSend({
            event: "nlSubscribeSuccess",
            actionId: "subscription_success"
        })
    });
    $(window).on("newsletterRegistrationFailure",
    function(d, c) {
        autoDataSend({
            event: "nlSubscribeFailure",
            errorId: c.errorFields.join("|"),
            actionId: "subscription_failure"
        })
    });
    $(document).on("click", "#suscribedInNewsletter.js-tracking",
    function() {
        var c = ($(this).prop("checked") ? "tick_checkbox": "untick_checkbox");
        $(this).attr("data-evt-action-id", c)
    });
    $(window).on("logInSuccessPage",
    function(d, c) {
        autoDataSend({
            actionPosition: c.position,
            actionId: c.id,
            userLogStatus: "logged_user",
            event: "logInSuccess"
        })
    });
    $(window).on("logInFailurePage",
    function(d, c) {
        autoDataSend({
            actionPosition: c.position,
            actionId: c.id,
            event: "logInFailure"
        })
    });
    $(window).on("logInSuccess",
    function(d, c) {
        autoDataSend({
            actionPosition: c.position,
            actionId: c.id,
            actionType: c.type,
            event: "logInSuccess"
        })
    });
    $(window).on("logInFailure",
    function(d, c) {
        autoDataSend({
            actionPosition: c.position,
            actionId: c.id,
            actionType: c.type,
            event: "logInFailure"
        })
    });
    $(window).on("createAccountSuccess",
    function(d, c) {
        autoDataSend({
            event: "createAccountSuccess",
            actionId: "account_creation_succeeded"
        })
    });
    $(window).on("createAccountFailure",
    function(d, c) {
        autoDataSend({
            event: "createAccountFailure",
            actionId: "account_creation_failed"
        })
    });
    $(document).on("change", ".sizesPanel.js-tracking select",
    function() {
        var c = $(this).find(":selected");
        var d = c.attr("data-ona").split("Size/")[1];
        autoDataSend({
            contentId: d,
            actionPosition: "product_area",
            actionId: "size_selected",
            actionType: "product_configuration"
        })
    });
    $(document).on("change", "#locateSizeSelect",
    function() {
        var c = $(this).find(":selected");
        var d = c.attr("data-sku");
        autoDataSend({
            productSku: d,
            actionPosition: "popin/locate_in_store",
            actionId: "select_size",
            actionType: "e-commerce_interaction"
        });
        $("#locateCurrentPosition, #locateStoreSearchSubmit, .driving-directions").attr("data-evt-product-sku", d)
    });
    $(window).on("shoppingCardRecap",
    function(d, c) {
        getAjax(true, "commerce/order/orderAsJson.jsp",
        function(m) {
            utag_data.orderAsJson = $.parseJSON(m);
            var k = utag_data.orderAsJson.commerceItems.length;
            var o = [];
            var f = [];
            var n = [];
            var g = 0;
            for (i = 0; i < k; i++) {
                var h = utag_data.orderAsJson.commerceItems[i].skuId;
                o.push(h);
                var l = utag_data.orderAsJson.commerceItems[i].qty;
                f.push(l);
                var e = financialNumber(utag_data.orderAsJson.commerceItems[i].unitPrice);
                n.push(e);
                var p = l * e;
                g += p
            }
            utag_data.productSku = o.join();
            utag_data.quantity = f.join();
            utag_data.price = n.join();
            utag_data.totalAmount = financialNumber(g)
        })
    });
    $(document).on("change", ".changeCommerceItemInput.js-tracking",
    function() {
        var e = $(this).find(":selected");
        var c = $.trim($(this).data("sku"));
        var d = e.val();
        autoDataSend({
            actionId: "change_quantity_intention",
            productSku: c,
            quantity: d,
            totalAmount: "",
            price: ""
        })
    });
    if (utag_data.pageName == "buypath/shipping") {
        function a() {
            var c;
            if ($("#clickAndCollectSection").is(":visible")) {
                c = "collect_in_store_presentation"
            } else {
                var d = $("#trueToggleMultiShip").prop("checked");
                c = d ? "multiple_shipping_presentation": "single_shipping_presentation"
            }
            return c
        }
        $("#suscribedInNewsletter").removeAttr("data-evt-action-id");
        $(document).on("click", "#billingSameAsShipping.js-tracking",
        function() {
            var c = ($(this).prop("checked") ? "tick_checkbox": "untick_checkbox");
            $(this).attr("data-evt-action-id", c)
        });
        $(document).on("click", '[id^="giftCard_"].js-tracking',
        function() {
            var c = ($(this).prop("checked") ? "tick_checkbox": "untick_checkbox");
            $(this).attr("data-evt-action-id", c)
        });
        $(document).on("click", '.js-tracking-evt-multiship, [data-with-tracking-multiship="true"]',
        function() {
            var c;
            if ($("#clickAndCollectSection").is(":visible")) {
                c = "collect_in_store_presentation"
            } else {
                var d = $("#trueToggleMultiShip").prop("checked");
                c = d ? "multiple_shipping_presentation": "single_shipping_presentation"
            }
            $(this).attr("data-evt-content-presentation-mode", a())
        });
        $(document).on("click", ".js-tracking-evt-shipping-method",
        function() {
            var c = $(this);
            $(window).on("updateCartTotalCallback.tracking",
            function() {
                var h = c.attr("data-js-evt-content-id");
                var d = c.attr("data-js-evt-action-position");
                var g = c.attr("data-js-evt-action-id");
                var e = c.attr("data-js-evt-action-type");
                var f = $("#shippingBlock").find(".shipping").text();
                f = f.replace(/[^\d,.-]/g, "").replace(/[.,]\d*$/, "");
                autoDataSend({
                    contentPresentationMode: a(),
                    contentId: h,
                    actionPosition: d,
                    actionId: g,
                    actionType: e,
                    shippingCost: f
                });
                $(window).off("updateCartTotalCallback.tracking")
            })
        });
        $(window).off("proceedToBilling.tracking").on("proceedToBilling.tracking",
        function() {
            getAjax(true, "commerce/order/orderAsJson.jsp",
            function(g) {
                var d = $.parseJSON(g);
                var k = d.shipping == "single" ? "single_shipment": "several_shipments";
                var e = d.shippingGroups.length;
                var c = [];
                var n = [];
                var l = [];
                for (var h = 0; h < e; h++) {
                    var f = d.shippingGroups[h].deliveryMethod;
                    c.push(f);
                    var m = d.shippingGroups[h].country;
                    n.push(m);
                    var o = d.shippingGroups[h].state;
                    l.push(o)
                }
                getAjax(true, "commerce/order/orderTotalJson.jsp",
                function(r) {
                    var q = $.parseJSON(r);
                    var p = q.shippingNotFormatted;
                    p = p.replace(/[.,]\d*$/, "");
                    autoDataSend({
                        actionId: "proceed_to_billing",
                        contentPresentationMode: a(),
                        shippingAdressStatus: k,
                        shippingCost: p,
                        shippingMethod: c.join(),
                        shippingCountry: n.join(),
                        shippingState: l.join()
                    })
                })
            })
        });
        $(window).off("searchStoresSubmit.tracking").on("searchStoresSubmit.tracking",
        function() {
            $this = $("#buttonSearch.cc-search-button");
            var d = $this.attr("data-evt-content-presentation-mode");
            var c = $this.attr("data-evt-action-position");
            var e = $this.attr("data-evt-action-id");
            autoDataSend({
                contentPresentationMode: d,
                actionPosition: c,
                actionId: e
            })
        });
        $(window).off("selectStoreOnMap.tracking").on("selectStoreOnMap.tracking",
        function() {
            autoDataSend({
                contentPresentationMode: a(),
                actionPosition: "stores_map",
                actionId: "store_pin_selection"
            })
        });
        $(window).off("enterFullScreenMode.tracking").on("enterFullScreenMode.tracking",
        function() {
            autoDataSend({
                contentPresentationMode: a(),
                actionId: "view_map_in_full_screen"
            })
        })
    }
    if (utag_data.pageName == "buypath/payment") {
        $(document).on("click", '[id^="saveCreditCard"].js-tracking',
        function() {
            var c = ($(this).prop("checked") ? "tick_checkbox": "untick_checkbox");
            $(this).attr("data-evt-action-id", c)
        });
        $(window).on("paymentTypeUpdate",
        function(d, c) {
            $("#globalSubmit").attr("data-evt-payment-method", c.paymentType)
        });
        $(window).on("proceedToReviewSucceed",
        function(d, c) {
            autoDataSend({
                paymentMethod: c.paymentType,
                actionId: "proceed_to_order_review_succeeded",
                shippingMethod: $("body").data("pv-shipping-method"),
                shippingAdressStatus: $("body").data("pv-shipping-adress-status"),
                shippingCountry: $("body").data("pv-shipping-country"),
                shippingState: $("body").data("pv-shipping-state"),
                shippingCost: $("body").data("pv-shipping-cost")
            })
        });
        $(window).on("proceedToReviewFailed",
        function(d, c) {
            autoDataSend({
                paymentMethod: c.paymentType,
                actionId: "proceed_to_order_review_failed",
                shippingMethod: $("body").data("pv-shipping-method"),
                shippingAdressStatus: $("body").data("pv-shipping-adress-status"),
                shippingCountry: $("body").data("pv-shipping-country"),
                shippingState: $("body").data("pv-shipping-state"),
                shippingCost: $("body").data("pv-shipping-cost")
            })
        });
        $("#csBtnMLHolder, #clientInfo .titleClientInfo").attr({
            "data-pv-shipping-method": $("body").data("pv-shipping-method"),
            "data-pv-shipping-adress-status": $("body").data("pv-shipping-adress-status"),
            "data-pv-shipping-country": $("body").data("pv-shipping-country"),
            "data-pv-shipping-state": $("body").data("pv-shipping-state"),
            "data-pv-shipping-cost": $("body").data("pv-shipping-cost")
        })
    }
    if (utag_data.pageName == "buypath/payment" || utag_data.pageName == "buypath/shipping") {
        $(window).off("createAddressFormSuccess.tracking updateAddressFormSuccess.tracking").on("createAddressFormSuccess.tracking updateAddressFormSuccess.tracking",
        function(d, c) {
            if (utag_data.pageName == "buypath/payment") {
                autoDataSend({
                    actionPosition: c.position,
                    actionId: c.id
                })
            }
            if (utag_data.pageName == "buypath/shipping") {
                autoDataSend({
                    actionPosition: c.position,
                    actionId: c.id,
                    contentPresentationMode: a()
                })
            }
        })
    }
    $(document).on("click", "#locateOnlyStoresWithProductAvailable",
    function() {
        var c = $(".locate-product-info").find(".sku").text().trim();
        if (this.checked) {
            autoDataSend({
                productSku: c,
                actionType: "e-commerce_interaction",
                actionPosition: "popin/locate_in_store",
                actionId: "product_available"
            })
        }
    });
    $(document).on("click", ".driving-directions",
    function() {
        var c = $(".locate-product-info").find(".sku").text().trim();
        autoDataSend({
            productSku: c,
            actionType: "e-commerce_interaction",
            actionPosition: "popin/locate_in_store",
            actionId: "driving_directions"
        })
    });
    $(document).on("click", "#acceptTermsTop.js-tracking, #acceptTerms.js-tracking",
    function() {
        var c = ($(this).prop("checked") ? "tick_checkbox": "untick_checkbox");
        $(this).attr("data-evt-action-id", c)
    });
    $(window).off("closeReturnPopupProduct.tracking").on("closeReturnPopupProduct.tracking",
    function(d, c) {
        autoDataSend({
            actionId: "refund_request_canceled",
            contentId: getReturnRequestSelectReason(),
            productSku: getReturnRequestProductSku()
        })
    });
    $(window).off("submitReturnPopupProduct.tracking").on("submitReturnPopupProduct.tracking",
    function(d, c) {
        autoDataSend({
            actionId: c.actionId,
            contentId: c.contentId || sessionStorage.getItem("contentIdReturn"),
            productSku: c.productSku || sessionStorage.getItem("productSkuReturn")
        })
    });
    if (utag_data.pageType == "my_profile") {
        $(document).on("click", "#suscribedInNewsletter",
        function() {
            var c = ($(this).prop("checked") ? "tick_checkbox": "untick_checkbox");
            $(this).attr("data-evt-action-id", c)
        });
        $(window).on("changePasswordSuccess",
        function(d, c) {
            autoDataSend({
                actionPosition: "popin",
                actionId: "change_password_succeeded"
            })
        });
        $(window).on("changePasswordFailure",
        function(d, c) {
            autoDataSend({
                actionPosition: "popin",
                actionId: "change_password_failed"
            })
        })
    }
    $(window).on("clientServicesPageTabOpen",
    function(f, d) {
        var c;
        switch (d.previousPageName) {
        case "contact":
            c = "contact";
            break;
        case "FAQ":
            c = "faq";
            break;
        case "deliveryandreturns":
            c = "delivery_and_returns";
            break;
        case "ProductCare":
            c = "product_care";
            break
        }
        autoDataSendView({
            pageName: "client_services/" + c
        })
    });
    $(window).on("clientServicesFaqChapterUnfolded",
    function(d, c) {
        autoDataSend({
            positionNumber: "chapter_position_" + c.chapterNumber,
            actionPosition: "faq_tab",
            actionId: "chapter_unfolded",
            actionType: "faq_questions"
        })
    });
    $(window).on("clientServicesFaqQuestionUnfolded",
    function(d, c) {
        autoDataSend({
            positionNumber: "question_position_" + c.questionNumber,
            actionPosition: "faq_tab",
            actionId: "question_unfolded",
            actionType: "faq_questions"
        })
    });
    $(window).on("clientServicesEmailUsSuccess",
    function(d, c) {
        autoDataSend({
            event: "sendEmailSuccess",
            actionPosition: "client_services_tab",
            actionId: "send_email_success",
            actionType: "contact"
        })
    });
    $(window).on("clientServicesEmailUsFailure",
    function(d, c) {
        autoDataSend({
            event: "sendEmailFailure",
            actionPosition: "client_services_tab",
            actionId: "send_email_failure",
            actionType: "contact",
            errorId: c.error
        })
    })
});
$(window).on("load",
function() {
    $(".shareWishlist .shareButton.js-tracking").on("click",
    function() {
        var a = $(this).closest("[data-gender]").data("gender");
        var b = $(this).closest("[data-sku]").data("sku");
        autoDataSend({
            actionId: "share_intention",
            productSku: b,
            gender: genderLabel(a)
        })
    });
    $(".shareWishlist").find('[class^="share-"]').on("click",
    function() {
        var a = $(this).closest("[data-gender]").data("gender");
        var b = $(this).closest("[data-sku]").data("sku");
        autoDataSend({
            event: $(this).data("evt-event") || "share",
            actionId: $(this).data("evt-action-id"),
            productSku: b,
            gender: genderLabel(a)
        })
    });
    $(".fullDetailsWishlist .js-tracking").on("click",
    function() {
        var a = $(this).closest("[data-gender]").data("gender");
        var b = $(this).closest("[data-sku]").data("sku");
        autoDataSend({
            actionId: "more_details",
            productSku: b,
            gender: genderLabel(a)
        })
    })
});
function onLogin() {
    showCurtain();
    $(".ajaxPlaceHolder.userprofiling").each(function() {
        loadPlaceHolder($(this))
    });
    hideCurtain()
}
function onLogout() {
    showCurtain();
    $(".ajaxPlaceHolder.userprofiling").each(function() {
        loadPlaceHolder($(this))
    });
    hideCurtain()
}
function onUpdateAddressBook() {} (function(f) {
    var g = 0,
    a = ".loadVideo",
    b = [];
    function h(k, l) {
        var m = k.attr("id");
        if (!m) {
            g++;
            m = "fcplayer" + g + "_container";
            k.attr("id", m)
        }
        if (f.inArray(m, b) !== -1 && !l) {
            k.removeAttr("id");
            return h(k)
        }
        b.push(m);
        return m.replace("_container", "")
    }
    window.loadVideos = function() {
        f(a).each(function() {
            e(this)
        })
    };
    function e(o) {
        var r = f(o);
        var p = r.attr("data-file");
        if (!p) {
            return
        }
        var v = (r.attr("data-fullWidth") === "true" ? true: false);
        p = p.replace(/(\r\n|\n|\r)/gm, "");
        p = p.replace(/ /g, "");
        var s = r.attr("data-ratio") ? parseFloat(r.attr("data-ratio")) : 16 / 9;
        var w = r,
        m = h(w),
        u = r.attr("data-autostart") === "true",
        q = r.attr("data-gif") === "true";
        var k, n;
        if (v) {
            k = w.parent().siblings(".fullWidthPicture").height();
            n = f(window).width();
            if (n / s > k) {
                n = k * s
            }
            w.css("width", n + "px");
            f(window).resize(function() {
                if (!f(".page").hasClass("FC_fullscreen")) {
                    setTimeout(function() {
                        k = w.parent().siblings(".fullWidthPicture").height();
                        n = f(window).width();
                        if (n / s > k) {
                            n = k * s
                        }
                        w.css("width", n + "px");
                        var x = fcplayer(m);
                        x.resize(n, (n * 1 / s))
                    },
                    200)
                }
            })
        } else {
            if (r.attr("data-product-video") === "true") {
                n = f("#productSheetSlideshow").height() * s;
                f(window).on("resize orientationchange",
                function() {
                    var z = fcplayer(m);
                    if (z) {
                        var x = f("#productMainImage").height();
                        var y = x * s;
                        z.resize(y, x);
                        f(window).one("resize",
                        function() {
                            setTimeout(function() {
                                var A = f("#productMainImage").height();
                                var B = A * s;
                                z.resize(B, A)
                            },
                            300)
                        })
                    }
                })
            } else {
                n = w.width();
                f(window).resize(function() {
                    if (window.fcplayer && !f(".page").hasClass("FC_fullscreen")) {
                        n = w.width();
                        var x = fcplayer(m);
                        if (x) {
                            x.resize(n, (n * 1 / s))
                        }
                    }
                })
            }
        }
        var t = {
            file: p,
            width: n,
            loc: CONFIGURATION.STORE_LANG,
            autostart: u.toString(),
            id: m
        };
        if (q) {
            f.extend(t, {
                autostart: "true",
                controlbar: "none",
                dock: "false",
                icons: "false",
                loop: "true",
                repeat: "single",
                mute: "true",
                playerReady: "gifPlayerReady"
            });
            w.css("pointer-events", "none")
        }
        var l = CONFIGURATION.PREFIXE_URL_VIDEO + "?" + f.param(t);
        f.ajax({
            url: l,
            dataType: "script",
            cache: true,
            success: function() {
                w.trigger("fcplayerScriptLoaded")
            }
        });
        r.removeClass("loadVideo")
    }
    var c = (function() {
        var k = (/iphone|ipad|ipod/gi).test(navigator.appVersion);
        return k ? f.noop: function(l, n) {
            if (l && !l.disableAutoPause) {
                l.isOnScreen = n.isOnScreen(0, 0);
                if (l.wasOnScreen === l.isOnScreen) {
                    return
                }
                l.wasOnScreen = l.isOnScreen;
                if (!l.isOnScreen) {
                    l.wasPlaying = l.getState() === "PLAYING";
                    if (!l.wasPlaying) {
                        return
                    }
                } else {
                    if (!l.wasPlaying) {
                        return
                    }
                }
                if (l.isOnScreen && !l.isGif) {
                    return
                }
                try {
                    l.play(l.isOnScreen)
                } catch(m) {
                    l.disableAutoPause = true
                }
            }
        }
    })();
    window.gifPlayerReady = function(l) {
        var k = fcplayer(l.id);
        k.wasPlaying = true;
        k.isGif = true;
        c(k, f(k.container))
    };
    window.playerReady = function(n) {
        var m = fcplayer(n.id);
        var o = "#" + m.id + "_container";
        if (f(o).attr("data-product-video") === "true") {
            var k = f("#productMainImage").height();
            var l = k * f(o).data("ratio");
            m.resize(l, k)
        }
        m.eventListener("jwplayerPlayerState",
        function(p) {
            if (p.newstate) {
                f(m.container).trigger("fcplayer.state." + p.newstate.toLowerCase())
            }
        })
    };
    function d() {
        f(window).on("scroll",
        function() {
            f("[data-gif=true], [data-autopause=true]").each(function() {
                var l = f(this),
                k = h(l, true);
                if (window.fcplayer) {
                    c(fcplayer(k), l)
                }
            })
        })
    }
    f(function() {
        setTimeout(function() {
            loadVideos()
        },
        400);
        window.registerEvent("ajaxContent", loadVideos);
        d();
        f(window).resize(function() {
            var m = f(window);
            var l = f(window).width();
            var k = f(window).outerHeight();
            resizeVideoLoading(l, k)
        })
    })
})(jQuery);