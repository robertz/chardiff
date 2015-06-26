/*
    Battle.net/Diablo III Tooltip Script

    Changelog:
    v1.2 by Beornhelm
        -Added support for skill and rune combination display
        (usage : [skill link]#[rune.type]+)
        (ex: <a href='http://eu.battle.net/d3/en/class/monk/active/serenity#c+'>Ascension</a> )

    v1.1
        - Added support for follower skills

    ChangedByAsmira:
        - Added support for runes
        (usage : [skill link]#[rune.type])
        (ex: <a href='http://eu.battle.net/d3/en/class/monk/active/serenity#c'>Ascension</a> )

*/
if(typeof Bnet == 'undefined') var Bnet = {};
if(typeof Bnet.D3 == 'undefined') Bnet.D3 = {};

if(typeof Bnet.D3.Tooltips == 'undefined') Bnet.D3.Tooltips = new function() { // Reminder: Keep in sync with the equivalent code in d3.js

    var URL_CSS = 'http://{region}.battle.net/d3/static/css/';
    var URL_QUERY_BASE = 'http://{region}.battle.net/d3/{locale}/tooltip/';

    var TYPES = {
        item: {
            type: 'item',
            url: 'item/{key}'
        },
        recipe: {
            type: 'recipe',
            url: 'recipe/{key}'
        },
        skill: {
            type: 'skill',
            url: 'skill/{folder}/{key}'
        },
        calculator: {
            type: 'calculator',
            url: 'calculator/{folder}/{key}'
        },
        //added by asmira
        rune: {
            type: 'rune',
            url: 'rune/{folder}/{key}'
        },
        //added by Beornhelm
        skillAndRune: {
            type: 'skillAndRune'
            //url will be generated later using the urls for skill and rune, respectively
        }
    };

    /*
        Extract (region), (locale), and (rest) of the URL

        {region}.battle.net/d3/{locale}/{rest}
    */
    var URL_PATTERN_BASE = new RegExp('^http://([a-z]{2})\\.battle\\.net/d3/([a-z]{2})/(.+)');
    var URL_PATTERN_SELF = new RegExp('([a-z]{2})\\.battle\\.net/d3/static/js/tooltips\\.js'); // Used to get region from the <script> tag

    /*
        Each regex below extracts a (folder) and (key).
    */
    var URL_PATTERNS = [
        /*
        Notes:
            - Using [^#\\?]+ below to ignore URL parameters or hashes
        */

        // item/{itemSlug}
        {
            regex: new RegExp('^item/()([^#\\?]+)$'),
            params: {
                type: 'item'
            }
        },
        // artisan/{artisanSlug}/recipe/{recipeSlug}
        {
            regex: new RegExp('^artisan/([^/]+)/recipe/([^#\\?]+)$'),
            params: {
                type: 'recipe'
            }
        },
        // class/{classSlug}/active/{skillSlug}
        {
            regex: new RegExp('^class/([^/]+)/active/([^#\\?]+)$'),
            params: {
                type: 'skill'
            }
        },

        // class/{classSlug}/passive/{skillSlug}
        {
            regex: new RegExp('^class/([^/]+)/passive/([^#\\?]+)$'),
            params: {
                type: 'skill'
            }
        },
        // follower/{followerSlug}/skill/{skillSlug}
        {
            regex: new RegExp('^follower/([^/]+)/skill/([^#]+)'),
            params: {
                type: 'skill'
            }
        },
        // calculator/{classSlug}#{build}
        {
            regex: new RegExp('^calculator/([^#]+)[#/](.+)'),
            params: {
                type: 'calculator'
            }
        },
        // class/{classSlug}/active/{skillSlug}/{rune.type} : added by asmira
        {
            regex: new RegExp('^class/([^/]+)/active/([^#\\?]+)#([a-zA-Z])$'),
            params: {
                type: 'rune'
            }
        },
        // class/{classSlug}/active/{skillSlug}/{rune.type}+ : added by Beornhelm
        {
            regex: new RegExp('^class/([^/]+)/active/([^#\\?]+)#([a-zA-Z])\\+$'),
            params: {
                type: 'skillAndRune'
            }

        }

    ];

    var DELAY_LOADING = 500; // ms
    var dataCache = {};

    // State
    var loadingTimer;
    var currentLink;
    var currentParams;



    function construct() {
        $.documentReady(initialize);
    }

    function initialize() {
        setTimeout(getCss, 1);
        setTimeout(bindEvents, 1);
    }

    function getCss() {

        // Grab the region from the script URL
        var scripts = document.getElementsByTagName('script');
        var currentScript = scripts[scripts.length - 1];
        var scriptRegion;

        if(currentScript && currentScript.src.match(URL_PATTERN_SELF)) {
            scriptRegion = RegExp.$1;
        }

        var cssUrl = URL_CSS.replace('{region}', scriptRegion || 'us');

        $.getStyle(cssUrl + 'tooltips.css');
        if($.Browser.ie6) {
            $.getStyle(cssUrl + 'tooltips-ie6.css');
        }
    }

    function bindEvents() {

        $.bindEvent(document, 'mouseover', function(e) {

            var link = getLinkFromEvent(e);
            if(link) {
                linkMouseOver(link);
            }
        });

        $.bindEvent(document, 'mouseout', function(e) {

            var link = getLinkFromEvent(e);
            if(link) {
                linkMouseOut(link);
            }
        });
    }

    function getLinkFromEvent(e) {

        e = $.normalizeEvent(e);

        var target = e.target;
        var tries = 0;

        while(target && ++tries <= 5) {

            if(target.nodeName.toUpperCase() == 'A') {
                return target;
            }
            target = target.parentNode;
        }

        return null;
    }

    function linkMouseOver(link) {

        var params = {};

        parseUrl(link, params);
        parseOptions(link, params);

        if(!params.key || currentLink == link) {
            return;
        }

        currentLink = link;
        currentParams = params;

        //added by Beornhelm, branch of here for multiple request if type is skillAndRune
        if (params.type == 'skillAndRune'){
            getRuneAndSkillTooltip(params);

        }else{

            var data = getTooltip(params);

            if(data != null) {
                showTooltip(data);
            }
        }
    }

    //added by Beornhelm
    function getRuneAndSkillTooltip(params){
        //reformat our params params object into two separate and appropriate params objects, 1 skill and 1 rune
        var skillParams = {
                folder : params.heroClass,
                key: params.folder,
                type: "skill",
                tooltipType: {
                        type: "skill",
                        url: "skill/{folder}/{key}"
                },
                locale: params.locale,
                region: params.region
        };

        var runeParams = {
                folder : params.folder,
                key: params.key,
                type: "rune",
                tooltipType: {
                        type: "rune",
                        url: "rune/{folder}/{key}"
                },
                locale: params.locale,
                region: params.region
        };

        //Try to get data from cache, if not in cache JSONP request will fire, and registerData() will handle the callback
        //registerData() will pass control to handleSkillAndRuneRequestResponse(), if at that time we are still making a "skillAndRune" request
        var skillData = getTooltip(skillParams);
        var runeData = getTooltip(runeParams);

        //if it was in cache, show it
        if (skillData != null && runeData!= null){

            generateSkillAndRuneHTML(runeData.tooltipHtml, skillData.tooltipHtml)

        //If both weren't in cache, check them individually, and save to currentParams.
        //Need to do this since only when both are set will the tooltip show; checked in handleSkillAndRuneRequestResponse().
        //If at this point one is set and the other is not, only one request will go to Blizzard, resulting in
        //only one call to handleSkillAndRuneRequestResponse(), so only one chance for both to be set.
        }else if (skillData != null){
            currentParams.skillData = skillData;
        }else if (runeData != null){
            currentParams.runeData = runeData;
        }
    }

    function linkMouseOut(link) {

        if(link != currentLink) {
            return;
        }

        Tooltip.hide();

        currentLink = null;
        currentParams = null;
    }

    function parseUrl(link, params) {

        if(!link.href.match(URL_PATTERN_BASE)) {
            return;
        }

        var region = RegExp.$1;
        var locale = RegExp.$2;

        var rest = RegExp.$3;
        for(var i = 0; i < URL_PATTERNS.length; ++i) {

            var urlPattern = URL_PATTERNS[i];

            if(!rest.match(urlPattern.regex)) {
                continue;
            }

            var folder = RegExp.$1;
            var key = RegExp.$2;
            var rest2 = RegExp.$3;

            if(folder.indexOf('/') != -1 || key.indexOf('/') != -1) { // Folder and key shouldn't contain any slashes
                continue;
            }

            params.region = region;
            params.locale = locale;
            //changed by asmira: only rune gets rest2 value.
            if(!rest2){
                params.folder = folder;
                params.key = key;
            }else{
                params.folder = key;
                params.key = key + "-" + rest2;
                //added by Beornhelm
                params.heroClass = folder;
            }

            // Copy pattern's params
            for(var i in urlPattern.params) {
                params[i] = urlPattern.params[i];
            }
            params.tooltipType = getTooltipType(params.type);
            return;
        }
    }

    function parseOptions(link, params) {

        // TBD

    }

    function requestTooltip(params) {

        var url = (URL_QUERY_BASE + params.tooltipType.url)
            .replace('{region}', params.region)
            .replace('{locale}', params.locale)
            .replace('{folder}', params.folder)
            //changed by asmira
            .replace('{key}',    (params.type == "rune")?params.key.substring(params.key.lastIndexOf("-")+1):params.key);

        $.getScript(url + '?format=jsonp');
    }

    function registerData(data) {

        clearTimeout(loadingTimer);

        var params = data.params;

        saveData(params, data);

        //added by Beornhelm (only added the first decision)
        if(currentParams !=null && currentParams.type == 'skillAndRune') {
            handleSkillAndRuneRequestResponse(data);

        }else if(currentParams != null && getCacheKeyFromParams(params) == getCacheKeyFromParams(currentParams)) {
            showTooltip(data);
        }

    }

    //added by Beornhelm
    function handleSkillAndRuneRequestResponse(data){
        //first determine if handling skill or rune response
        //then make sure the params of the return response match the params of the request
        //if they do, save the data to the currentParams, in case we still need to wait for second response
        if(data.params.type == 'skill') {
            if(data.params.key == currentParams.folder){
                currentParams.skillData = data;
            }
        }else if (data.params.type == 'rune'){
            if (data.params.key == currentParams.key){
                currentParams.runeData = data;
            }
        }

        if (currentParams.runeData != null && currentParams.skillData != null){
            generateSkillAndRuneHTML(currentParams.runeData.tooltipHtml, currentParams.skillData.tooltipHtml)
        }
    }

    //Merge the HTML of the skill and rune
    function generateSkillAndRuneHTML(runeHTML, skillHTML){
        //First pull data from our rune, namely the rune's name, description, level unlock, and rune letter
        var runeName, runeDescription, runeLevel, runeLetter, newRuneHTML, mergedHTML;

        runeHTML.match('<h3 class="">(.+?)</h3>');
        runeName = RegExp.$1;

        runeHTML.match('<div class="description">([^]+?)<p');
        runeDescription = RegExp.$1.replace(/[\r\n]/g, '');

        runeHTML.match('<em>([0-9]+)</em>');
        runeLevel = RegExp.$1;

        runeHTML.match('class="rune-([a-z])"');
        runeLetter = RegExp.$1;

        //Next lets create our proper rune markup, the markup for the rune retruned to us by Blizzard
        //is for a stand-alone tooltip of a rune, not a combination of rune and skill.
        //We can mimick the same format they use for combination tooltips though.
        newRuneHTML =     '<div class="tooltip-extension rune-extension">' +
                            '<span class="d3-icon d3-icon-rune d3-icon-rune-large">' +
                                '<span class="rune-' + runeLetter + '"></span>' +
                            '</span>' +
                            '<h3 class="header-3" >' + runeName + '</h3>' +
                            runeDescription +
                            '<p class="subtle">Unlocked at level <em>' + runeLevel + '</em></p>' +
                        '</div>';

        //Finally, put it all together. slice the skill html, insert the new rune html, and close it up with a div tag
        mergedHTML = skillHTML.slice(0, -6);
        mergedHTML += newRuneHTML + '</div>';

        showTooltip({tooltipHtml: mergedHTML});
    }


    function getTooltip(params) {

        var data = loadData(params);

        if(data == null) { // Fetch data if not already cached

            clearTimeout(loadingTimer);
            loadingTimer = setTimeout(showLoading, DELAY_LOADING);
            requestTooltip(params);
            return null;
        }

        return data;
    }

    function showLoading() {

        if(currentLink != null) {
            Tooltip.show(currentLink, '<div class="d3-tooltip"><div class="loading"></div></div>');
        }
    }

    function showTooltip(data) {

        if(currentLink != null) {
            Tooltip.show(currentLink, data.tooltipHtml);
        }
    }

    // Utilities
    function getTooltipType(type) {
        return TYPES[type];
    }

    function saveData(params, data) {

        var cacheKey = getCacheKeyFromParams(params);
        dataCache[cacheKey] = data;
    }

    function loadData(params) {

        var cacheKey = getCacheKeyFromParams(params);

        return dataCache[cacheKey];
    }

    function getCacheKeyFromParams(params) {
        return [
            params.region,
            params.locale,
            params.type,
            params.key
        ].join('-');
    }

    // Public methods
    this.registerData = registerData;



    // HTML Helpers
    var $ = {

        create: function(nodeName) {
            return document.createElement(nodeName);
        },

        getScript: function(url) {

            var script = $.create('script');
            script.type = 'text/javascript';
            script.src = url;
            document.body.appendChild(script);
        },

        getStyle: function(url) {

            var link = $.create('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;

            document.body.appendChild(link);
        },

        documentReady: function(callback) {

            if(document.readyState == 'complete') {
                callback();
                return;
            }

            var occurred = false;

            $.bindEvent(document, 'DOMContentLoaded', function() {

                if(!occurred) {
                    occurred = true;
                    callback();
                }
            });

            $.bindEvent(document, 'readystatechange', function() {

                if(document.readyState == 'complete' && !occurred) {
                    occurred = true;
                    callback();
                }
            });

        },

        bindEvent: function(node, eventType, callback) {
            if(node.addEventListener) {
                node.addEventListener(eventType, callback, true); // Must be true to work in Opera
            } else {
                node.attachEvent('on' + eventType, callback);
            }
        },

        normalizeEvent: function(e) {
            var ev = {};
            ev.target = (e.target ? e.target : e.srcElement);
            ev.which = (e.which ? e.which : e.button);
            return ev;
        },

        getWindowSize: function() {

            var w = 0;
            var h = 0;

            if(document.documentElement && document.documentElement.clientHeight) {
                w = document.documentElement.clientWidth;
                h = document.documentElement.clientHeight;
            } else if (document.body && document.body.clientHeight) {
                w = document.body.clientWidth;
                h = document.body.clientHeight;
            } else if(window.innerHeight) {
                w = window.innerWidth;
                h = window.innerHeight;
            }

            return {
                w: w,
                h: h
            };
        },

        getScrollPosition: function () {

            var x = 0;
            var y = 0;

            if(window.pageXOffset || window.pageYOffset) {
                x = window.pageXOffset;
                y = window.pageYOffset;
            } else if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
                x = document.body.scrollLeft;
                y = document.body.scrollTop;
            } else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
                x = document.documentElement.scrollLeft;
                y = document.documentElement.scrollTop;
            }

            return {
                x: x,
                y: y
            };
        },

        getOffset: function(node) {

            var x = 0;
            var y = 0;

            while(node) {
                x += node.offsetLeft;
                y += node.offsetTop;

                var p = node.parentNode;

                while(p && p != node.offsetParent && p.offsetParent) {
                    if(p.scrollLeft || p.scrollTop) {
                        x -= (p.scrollLeft | 0);
                        y -= (p.scrollTop | 0);
                        break;
                    }
                    p = p.parentNode;
                }
                node = node.offsetParent;
            }

            return {
                x: x,
                y: y
            };
        },

        getViewport: function() {
            var windowSize = $.getWindowSize();
            var scroll = $.getScrollPosition();

            return {
                l: scroll.x,
                t: scroll.y,
                r: scroll.x + windowSize.w,
                b: scroll.y + windowSize.h
            };
        }
    };

    $.Browser = {};
    $.Browser.ie = !!(window.attachEvent && !window.opera);
    $.Browser.ie6 = $.Browser.ie && navigator.userAgent.indexOf("MSIE 6.0") != -1;



    // Helper class that handles displaying tooltips
    var Tooltip = new function() {

        var PADDING = 5;

        var tooltipWrapper;
        var tooltipContent;

        function initialize() {

            tooltipWrapper = $.create('div');
            tooltipWrapper.className = 'd3-tooltip-wrapper';

            tooltipContent = $.create('div');
            tooltipContent.className = 'd3-tooltip-wrapper-inner';

            tooltipWrapper.appendChild(tooltipContent);
            document.body.appendChild(tooltipWrapper);

            hide();
        }

        function show(node, html) {

            if(tooltipWrapper == null) {
                initialize();
            }

            tooltipWrapper.style.visibility = 'hidden';
            tooltipWrapper.style.display = 'block';
            tooltipContent.innerHTML = html;

            var viewport = $.getViewport();
            var offset = $.getOffset(node);

            var x = offset.x + node.offsetWidth + PADDING;
            var y = offset.y - tooltipWrapper.offsetHeight - PADDING;

            if(y < viewport.t) {
                y = viewport.t;
            }

            if(x + tooltipWrapper.offsetWidth > viewport.r) {
                x = offset.x - tooltipWrapper.offsetWidth - PADDING;
            }

            reveal(x, y);
        }

        function hide() {

            if(tooltipWrapper == null) {
                return;
            }

            tooltipWrapper.style.display = 'none';
        }

        function reveal(x, y) {

            tooltipWrapper.style.left = x + 'px';
            tooltipWrapper.style.top  = y + 'px';

            tooltipWrapper.style.visibility = 'visible';
        }

        // Public methods
        this.show = show;
        this.hide = hide;

    };

    construct();

};
