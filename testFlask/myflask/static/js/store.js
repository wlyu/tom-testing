var storeStockPopin;(function(f){function b(){setContentSize();if(LANDING_PAGE){var m={};m.fromSearch=true;m.positionCenter=true;m.isUpdatedBySearch=true;if(!storeMap){storeMap=new StoreMap();storeMap.displayMap(m);google.maps.event.addListenerOnce(storeMap.mapStoreLocator,"idle",function(){storeMap.updateStoreFromJsonObject(homeStoreJson);google.maps.event.trigger(storeMap.mapStoreLocator,"resize")})}}else{if(!storeMap){storeMap=new StoreMap();storeMap.displayMap()}}i();bindRemovePage("a");if(storeMap){storeMap.initCountryFilter();storeMap.initCategoryFilter()}}function i(){var m=getInputTextElement();if(m.val()!==""){h(getInputTextElement())}m.keypress(function(n){if(n.which===13){h(m)}});f("#buttonSearch").on("click",function(){h(getInputTextElement())})}function e(){f("#errorMessageSearchLabel").hide()}function h(o){var m=o.val();f(window).trigger("searchOccur",{keyword:m});e();var n=new google.maps.Geocoder();n.geocode({address:m},function(q,p){if(p===google.maps.GeocoderStatus.OK){if(q[0]){var r=new StoreMapOption();r.positionResult=q[0];r.isUpdatedBySearch=true;c(r)}}else{f(window).trigger("searchResults",{results:"0"});f("#errorMessageSearchLabel").show()}});o.blur();autoDataSend({actionPosition:"stores_list",actionType:"search",actionId:"store_search",internalSearchKeywords:m,})}function c(n,m,o){storeMap=new StoreMap();storeMap.displayMap(n,m,o)}function j(){if(navigator.geolocation){navigator.geolocation.getCurrentPosition(g,d)}else{d()}}function g(m){if(storeStockPopin!=undefined){f(".locate-results, .locate-filter-availability").show()}m=new google.maps.LatLng(m.coords.latitude,m.coords.longitude);l(m)}function l(m,n){var o=new google.maps.Geocoder();o.geocode({latLng:m},function(s,p){if(p===google.maps.GeocoderStatus.OK){if(s[0]){for(var r=0;r<s[0].address_components.length;r++){for(var q=0;q<s[0].address_components[r].types.length;q++){if(s[0].address_components[r].types[q]=="locality"){var v=s[0].address_components[r].short_name;break}}}f("#searchStoreInput").val(s[0]["formatted_address"]);e();var u=new StoreMapOption();u.positionResult=s[0];u.cgiPosition=m;u.isUpdatedBySearch=true;if(onlyStockAvailable!=undefined){f("#locateStoreSearchInput").val(v);f("#locateStoreSearchSubmit").prop("disabled",false);var t=f("#infoProductBlockTop").find(".sku").text().trim();c(u,t,onlyStockAvailable)}else{c(u)}}}else{if(n){k()}f("#errorMessageSearch").show();f(window).trigger("searchOccur",{adress:adresse})}})}function d(){alert(f("#geolocationMsg").html())}function k(){j()}function a(){setContentSize();if(storeMap){storeMap.handleWindowResize()}}window.OURFLAGSHIPSTORES="ourFlagshipStores";window.OURSTORES="ourStores";window.STORE_LI_PADDING=5;window.NUMBER_LI_VISIBLE_LANDSCAPE=3;window.ID_MAP_CANVAS="map_canvas";window.TOP_BLOCK_ID="searchSectionWrapper";window.BOTTOM_BLOCK_ID="filterCategoriesWrapper";window.specificLoadingEvent=b;window.hideErrorMessageSearch=e;window.handleTargetClick=j;window.specificResizeEvent=a})(jQuery);