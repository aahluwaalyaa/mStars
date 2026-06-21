/*!
 * mStars
 * Demo @ https://mBlocksForBloggers.blogspot.com/
 * Documentation @ m
 * Agency @ https://CIA.RealHappinessCenter.com
 * Copyright (c) 2022-26, Aahluwaalyaa (https://msa.RealHappinessCenter.com/)
 * Released under the MIT license
 */

// Firebase REST API helpers — replaces the Firebase JS SDK
function dbRead(dbURL, path) {
    return fetch(`${dbURL}${path}.json`).then(res => res.ok ? res.json() : null);
}

function dbWrite(dbURL, path, data) {
    return fetch(`${dbURL}${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

function getCfg(container) {
    let cfg = Object.assign({}, container.dataset);
    const script = container.querySelector("script[type='application/json']");
    if (script) {
        try { Object.assign(cfg, JSON.parse(script.textContent)); } catch (e) { }
    }
    // Normalize specific widget properties
    cfg.url = cfg.url || cfg.URL;
    cfg.pagetype = cfg.pageType || cfg.pagetype;
    cfg.display = String(cfg.display) === "true";
    cfg.votes = String(cfg.votes) === "true";
    cfg.title = cfg.title || "";
    return cfg;
}

// Inject mStars CSS classes once
let stylesInjected = false;
function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement("style");
    style.textContent = `
        .mStars { position: relative; }
        .mStars-wrapper { display: inline-block; }
        .mStars-wrapper--interactive { margin: 1rem; }
        .mStars-wrapper--votes { line-height: 0; }
        .mStars-star { display: inline-block; margin: 0.1rem; }
        .mStars-star--clickable { cursor: pointer; }
        .mStars-star--readonly { cursor: inherit; }
        .mStars-tooltip {
            border-radius: 7px;
            position: absolute;
            background: rgba(255, 215, 0, 100%); /* overridable via sTooltipBg setting */
            padding: 5px;
            text-align: center;
            width: 200px;
            box-sizing: border-box;
            z-index: 9999999;
            bottom: calc(100% + 6px);
            animation: mStars-fadeInOut 3.5s ease forwards;
        }
        @keyframes mStars-fadeInOut {
            0%   { opacity: 0; }
            10%  { opacity: 1; }
            80%  { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Convert URL path into a Firebase-safe identifier string
function pathFormat(url, host) {
    let cleaned;
    try {
        // Use URL API for http/https URLs
        const parsed = new URL(url);
        cleaned = (parsed.hostname + parsed.pathname)
            .replace(/^www\./, "");
    } catch {
        // Fallback for file: / relative URLs — strip protocol and leading slashes
        cleaned = url.split("?")[0].split("#")[0]
            .replace(/^[a-z]+:\/\//i, "")
            .replace(/^www\./, "")
            .replace(/^\/+|\/+$/g, "");
    }
    // Sanitize to Firebase-safe chars
    cleaned = cleaned.replace(/[./]/g, "_").replace(/[,\s#@!$%&()]/g, "-");
    return cleaned.replace(host, "");
}


//mStars Render
function sRender(container, settings, isDisplayOnly, isVotesMode, userRating, pageKey, labelTop) {
    const wrapper = document.createElement("div"), starCount = settings["sNo"];
    wrapper.classList.add("mStars-wrapper");
    wrapper.style.width = `${(settings["sSize"] + 0.1 * 2) * starCount}rem`; // dynamic: kept inline
    !isDisplayOnly && wrapper.classList.add("mStars-wrapper--interactive");
    isVotesMode && wrapper.classList.add("mStars-wrapper--votes");
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-label", `Star rating out of ${starCount}`);
    container.insertBefore(wrapper, container.lastChild);

    for (let i = 1; i <= starCount; i++) {
        wrapper.insertAdjacentHTML("beforeend", `<svg xmlns="http://www.w3.org/2000/svg" width="${settings["sSize"]}rem" height="${settings["sSize"]}rem" fill="${settings["sColorFill"]}" class="bi bi-star-fill" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" /></svg>`);
        const star = wrapper.lastChild;
        const isInteractive = !userRating && !isDisplayOnly;
        star.classList.add("mStars-star");
        star.classList.add(isInteractive ? "mStars-star--clickable" : "mStars-star--readonly");
        star.setAttribute("role", isInteractive ? "button" : "img");
        star.setAttribute("aria-label", isInteractive ? `Rate ${i} of ${starCount} stars` : `${i} out of ${starCount} stars`);
        if (isInteractive) star.setAttribute("tabindex", "0");
    }

    // Delegated hover — single listener on wrapper instead of one per star
    if (!isDisplayOnly) {
        wrapper.addEventListener("mouseover", function (event) {
            const hoveredStar = event.target.closest("svg");
            if (!hoveredStar || localStorage["mSR_" + pageKey]) return;
            const allStars = Array.from(wrapper.querySelectorAll("svg"));
            const hoveredIdx = allStars.indexOf(hoveredStar); // 0-based
            allStars.forEach((star, j) => {
                star.style.fill = settings["sColorFill"];
                star.style.opacity = j <= hoveredIdx ? 1 : settings["sOpacityHover"];
            });
            (settings["tTop"] != "") && (labelTop.innerHTML = `${hoveredIdx + 1}/${starCount}`);
        });
    }

    return wrapper;
}

//Star Renderer
function sUpdate(container, rating, settings) {
    //        console.log({ container, rating });
    const stars = container.getElementsByTagName("svg"), fullStars = Math.floor(rating), fraction = rating - fullStars;
    //    console.log({ stars, fullStars, fraction });
    for (let i = 1; i <= stars.length; i++) {
        let star = stars[i - 1];
        i > fullStars
            ? i == fullStars + 1 && fraction > 0
                ? star.style.opacity = fraction
                : (star.style.fill = settings["sColorEmpty"], star.style.opacity = settings["sOpacityEmpty"])
            : (star.style.fill = settings["sColorFill"], star.style.opacity = 1);
    }
}

//onclick tooltip renderer
function tTip(template, anchorEl, userRating, fontSize, tooltipBg) {
    const tooltip = document.createElement("div");
    tooltip.innerHTML = template.replace(/\$userRating\$/g, userRating);
    tooltip.classList.add("mStars-tooltip");
    tooltip.setAttribute("role", "alert"); // announced by screen readers without needing focus
    tooltip.style.fontSize = fontSize; // dynamic: kept inline
    tooltip.style.background = tooltipBg; // dynamic: overrides CSS default
    // Position relative to the widget container (already has position:relative via .mStars)
    tooltip.style.left = anchorEl.style.textAlign === "right"
        ? `calc(100% - 200px)`
        : anchorEl.style.textAlign === "center"
            ? `calc(50% - 100px)`
            : `0px`;
    anchorEl.appendChild(tooltip);
    // CSS animation (mStars-fadeInOut) handles the fade — remove element when done
    tooltip.addEventListener("animationend", function () {
        anchorEl.removeChild(tooltip);
    });
}

async function mStars(container, pageKey, dbURL, path) {
    //        console.log({ container, pageKey });
    //Settings and variable/const definitions
    const mSettings = {
        "default": {
            "sNo": 5,//Number > 0
            "sSize": 2.5,//in rem, Number > 0
            "tSize": 1,//in rem, Number > 0
            "tColor": '',
            "sAlign": "center",
            "sColorFill": "gold",   //Color of filled/hovered stars
            "sColorEmpty": "silver",//Color of empty stars
            "sOpacityEmpty": 0.1,  //Opacity of empty stars
            "sOpacityHover": 0.25, //Opacity of dimmed stars during hover
            "sTooltipBg": "rgba(255, 215, 0, 100%)",//Tooltip background colour
            "tTop": "Liked it? Rate it:",
            "tBottom-lg": "$average$ average • $votes$ ratings", //$max$
            "tBottom-md": "$average$ • $votes$ ratings", //$max$
            "tBottom-sm": "$average$ • $votes$ ratings", //$max$
            "tThanks": "Thanks for rating!",
            "tDone": "You rated this $userRating$ star!",
        },
        "archive": {},
        "error_page": {},
        "index": {},
        "item": {},
        "static_page": {}
    }

    // Merge site-wide user config over hardcoded defaults — user omissions fall back to defaults above
    if (typeof window.mStarsConfig === "object" && window.mStarsConfig !== null) {
        Object.assign(mSettings.default, window.mStarsConfig);
    }

    const cfg = getCfg(container);
    //console.log({ container });
    const pageType = cfg.pagetype,
        sizeKey = cfg.size || "lg",
        isDisplayOnly = cfg.display,//Display only
        isVotesMode = cfg.votes,
        settings = mSettings[pageType],
        defaults = mSettings.default;

    for (let key in defaults) (typeof (settings[key]) == "undefined") && (settings[key] = defaults[key]); //Assign settings by type of current page (for Blogger)
    Object.assign(settings, cfg); // Allow local widget JSON to override any setting
    
    if (!("sSize" in cfg)) {
        settings["sSize"] = defaults["sSize"] * (sizeKey == "sm" ? .4 : sizeKey == "md" ? .6 : 1);
    }
    if (!("tSize" in cfg)) {
        settings["tSize"] = `${defaults["tSize"] * (sizeKey == "sm" ? .7 : sizeKey == "md" ? .75 : 1)}rem`;
    } else if (typeof settings["tSize"] === "number") {
        settings["tSize"] = `${settings["tSize"]}rem`;
    }
    
    if (!("tBottom" in cfg)) {
        settings["tBottom"] = defaults[`tBottom-${sizeKey}`];
    }
    //    console.log(settings["tBottomD-lg"]);
    //console.log(settings["sSize"], container.dataset);
    container.style.textAlign = settings["sAlign"]; // dynamic: kept inline
    // position: relative is now applied via .mStars CSS class

    let userRating = localStorage["mSR_" + pageKey];
    //console.log(settings["sSize"], isVotesMode);

    //Text above and below the stars
    var labelTop = document.createElement("div"), labelBottom = document.createElement("div");
    labelTop.setAttribute("aria-live", "polite"); // announces hover/confirm text to screen readers
    settings["tBottom"] = settings["tBottom"].replace(/\$average\$/g, "<span class='mStars-average'>0</span>").replace(/\$votes\$/g, '<span class="mStars-votes">0</span>').replace(/\$max\$/g, settings["sNo"]),
        labelTop.innerHTML = !userRating ? settings["tTop"] : settings["tDone"].replace(/\$userRating\$/g, userRating);
    labelBottom.innerHTML = settings["tBottom"],
        labelTop.style.fontSize = labelBottom.style.fontSize = settings["tSize"],
        labelTop.style.color = labelBottom.style.color = settings["tColor"],
        !isDisplayOnly && container.appendChild(labelTop);
    (!isDisplayOnly || isVotesMode) && container.appendChild(labelBottom);

    //    console.log(settings["tSize"]);

    let starsWrapper = sRender(container, settings, isDisplayOnly, isVotesMode, userRating, pageKey, labelTop);

    var ratingData = await dbRead(dbURL, path) || { "r": 0, "c": 0 },
        rating = (ratingData.r * settings["sNo"]).toFixed(2);
    //                    console.log({ ratingData });
    if (ratingData.c == 0) {
        ratingData = { "r": 1, "c": 1 }; //set to 1 to avoid search console error
        dbWrite(dbURL, path, ratingData); // fire-and-forget, same as original
    }

    sUpdate(container, rating, settings);         //Render stars

    (!isDisplayOnly || isVotesMode) && (
        container.getElementsByClassName("mStars-average")[0].textContent = rating,
        container.getElementsByClassName("mStars-votes")[0].textContent = ratingData.c);
    //                console.log(container.getElementsByClassName("mStars-average"), container.getElementsByClassName("mStars-votes"));
    if (!isDisplayOnly) {
        starsWrapper.onmouseleave = function () {
            sUpdate(container, rating, settings),
                labelTop.innerHTML = !userRating ? settings["tTop"] : settings["tDone"].replace(/\$userRating\$/g, userRating);
        };
        // Delegated click + keydown — single pair of listeners on wrapper instead of one per star
        starsWrapper.addEventListener("click", async function (event) {
            const clickedStar = event.target.closest("svg");
            if (!clickedStar) return;
            const allStars = Array.from(starsWrapper.querySelectorAll("svg"));
            const idx = allStars.indexOf(clickedStar);
            if (!userRating) {
                //rating update
                const newCount = ratingData.c + 1,
                    newRating = Math.round((ratingData.r * ratingData.c + (idx + 1) / settings["sNo"]) / newCount * 1000000) / 1000000;
                //console.log({ "newRating": newRating, "newCount": newCount, idx });
                await dbWrite(dbURL, path, { "r": newRating, "c": newCount });
                userRating = localStorage[`mSR_${pageKey}`] = idx + 1;
                container.querySelectorAll("svg").forEach(starEl => starEl.style.cursor = "inherit");
                idx >= 3 && tTip(settings["tThanks"], container, idx + 1, defaults["tSize"], settings["sTooltipBg"]);
                labelTop.innerHTML = settings["tTop"] + (idx > 3 ? " Thanks!" : '');
                location.reload();
            } else tTip(settings["tDone"], container, userRating, defaults["tSize"], settings["sTooltipBg"]);
        });
        starsWrapper.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                if (event.target.closest("svg")) {
                    event.preventDefault(); // prevent page scroll on Space
                    event.target.click();
                }
            }
        });
    }
}

//mStars - Schema for Google Search Rich Reviews Snippet
async function sSchema(container, host, dbURL) {
    //        console.log({ container, dbURL });
    const cfg = getCfg(container);
    const pageKey = pathFormat(cfg.url, host),
        path = `mStars/${host}/${pageKey}`,
        ratingData = await dbRead(dbURL, path) || { "r": 1, "c": 1 },//set to 1 to avoid search console error
        avgRating = (ratingData.r * 5).toFixed(2);
    let postEl = container.closest(".post") || container.closest(".Blog"),
        existingScripts = postEl.getElementsByClassName("ratingJSON"),
        title = cfg.title == "" ? document.title : cfg.title,
        schemaType = cfg.schema,
        schemaScript = existingScripts[0] || document.createElement("script");
    existingScripts.length == 0 && (postEl.append(schemaScript), schemaScript.type = 'application/ld+json');
    schemaScript.text = `{"@context": "https://schema.org/","@type": "${schemaType}","name": "${title}","aggregateRating": {"@type": "AggregateRating","ratingValue": "${avgRating}","worstRating": "1","bestRating": "5","ratingCount": "${ratingData.c}"}}`;
    //            console.log({ postEl, avgRating, schemaScript }, schemaScript.textContent);
}

//Check if DB is ready
function initWidget(container) {
    const cfg = getCfg(container);
    if (!cfg.url) return;
    const host = location.host.replace("www.", "").replace(/\./g, "_").replace(/\//g, "__"),
        dbRawURL = (document.querySelector("mstars") || document.getElementById("mStars"))?.dataset.db || null,//db Path — supports both <mstars> and <div id="mStars">
        pageKey = pathFormat(cfg.url, host);
    //  console.log({ host, pageKey });

    switch (dbRawURL) {
        case null: case "":
            container.innerHTML = "Error! Missing Firebase DB URL >> 'https://YOUR-FIREBASE.firebaseio.com'."; break;
        default:
            if (dbRawURL.indexOf("https://") !== 0 || dbRawURL.lastIndexOf("firebaseio.com") < 5)
                container.innerHTML = "Error! Invalid Firebase URL.";
            else {
                const dbURL = dbRawURL.endsWith("/") ? dbRawURL : `${dbRawURL}/`; // normalize trailing slash
                const path = `mStars/${host}/${pageKey}`;
                //                        console.log({ isFirstWidget });
                isFirstWidget && (isFirstWidget = false, Array.from(document.getElementsByClassName("mStars")).forEach(el => typeof getCfg(el).schema != "undefined" && sSchema(el, host, dbURL)));
                mStars(container, pageKey, dbURL, path);
            }
    }
}

function mStarsCB(entries, observer) {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            initWidget(entry.target);
        }
    });
}

injectStyles();
const options = { rootMargin: '500px', threshold: 0.0 };
let isFirstWidget = true,
    observer = new IntersectionObserver(mStarsCB, options);
Array.from(document.getElementsByClassName("mStars")).forEach(el => observer.observe(el));