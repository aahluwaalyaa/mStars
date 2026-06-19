/*!
 * mStars
 * Demo @ https://mBlocksForBloggers.blogspot.com/
 * Documentation @ m
 * Agency @ https://CIA.RealHappinessCenter.com
 * Copyright (c) 2022-26, Mohanjeet Singh (https://Mohanjeet.blogspot.com/)
 * Released under the MIT license
 */

//Covert path into identifier
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";

//console.log({ initializeApp, getDatabase });

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
            background: rgba(255, 215, 0, 100%);
            padding: 5px;
            text-align: center;
            opacity: 0;
            transition: opacity 1s;
            width: 200px;
            box-sizing: border-box;
            z-index: 9999999;
        }
        .mStars-tooltip--visible { opacity: 1; }
    `;
    document.head.appendChild(style);
}

function pathFormat(p, host) {
    let e = p.split("?")[0].split("#")[0].replace("https:", "").replace("http:", "").replace("file:", "").replace("ftp:", "").replace("mailto:", "");
    for (; "/" == e[0];)e = e.substring(1);
    for (0 === e.indexOf("www.") && (e = e.replace("www.", "")); "/" == e[e.length - 1];)e = e.substring(0, e.length - 1);
    //      console.log({e});
    e = e.replace(/\./g, "_").replace(/\//g, "__").replace(/\,/g, "___").replace(/\s/g, "").replace(/\#/g, "-").replace(/\@/g, "-").replace(/\!/g, "-").replace(/\$/g, "-").replace(/\%/g, "-").replace(/\&/g, "-").replace(/\(/g, "-").replace(/\)/g, "-");
    return e = e.replace(host, "");
}


//mStars Render
function sRender(e, S, isD, isV, R, p, tTop) {
    const w = document.createElement("div"), n = S["sNo"];
    w.classList.add("mStars-wrapper");
    w.style.width = `${(S["sSize"] + 0.1 * 2) * n}rem`; // dynamic: kept inline
    !isD && w.classList.add("mStars-wrapper--interactive");
    isV && w.classList.add("mStars-wrapper--votes");
    e.insertBefore(w, e.lastChild);

    for (let i = 1; i <= n; i++) {
        w.insertAdjacentHTML("beforeend", `<svg xmlns="http://www.w3.org/2000/svg" width="${S["sSize"]}rem" height="${S["sSize"]}rem" fill="gold" class="bi bi-star-fill" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" /></svg>`);
        const s = w.lastChild;
        s.classList.add("mStars-star");
        s.classList.add(!R && !isD ? "mStars-star--clickable" : "mStars-star--readonly");

        !isD && (s.onmouseenter = function () {
            if (!localStorage["mSR_" + p]) {
                let s = e.getElementsByTagName("svg");
                for (let j = 0; j < s.length; j++) {
                    s[j].style.fill = "gold", s[j].style.opacity = j < i ? 1 : .25;
                }
                (S["tTop"] != "") && (tTop.innerHTML = `${i}/${n}`);
            }
        });
    }
    return w;
}

//Star Renderer
function sUpdate(e, rating) {
    //        console.log({ e, rating });
    const s = e.getElementsByTagName("svg"), r = Math.floor(rating), f = rating - r;
    //    console.log({s,r,f});
    for (let i = 1; i <= s.length; i++) {
        let m = s[i - 1];
        i > r
            ? i == r + 1 && f > 0
                ? m.style.opacity = f
                : (m.style.fill = "silver", m.style.opacity = .1)
            : (m.style.fill = "gold", m.style.opacity = 1);
    }
}

//onclick tooltip renderer
function tTip(t, e, r, f) {
    const T = document.createElement("div");
    T.innerHTML = t.replace(/\$userRating\$/g, r);
    T.classList.add("mStars-tooltip");
    T.style.fontSize = f; // dynamic: kept inline
    document.body.appendChild(T);
    //    console.log({t:T.style.fontSize,f});
    let b = e.getBoundingClientRect();
    //            console.log({eCoordinates});
    setTimeout(function () {
        T.classList.add("mStars-tooltip--visible");
        T.style.left = e.style.textAlign === "right"
            ? `${window.scrollX + b.left + e.offsetWidth - 200}px`
            : e.style.textAlign === "center"
                ? `${window.scrollX + b.left + e.offsetWidth / 2 - 100}px`
                : `${window.scrollX + b.left}px`;
        T.style.top = `${window.scrollY + b.top + 44}px`;
        //        console.log(T.style.top, b.top, T.offsetHeight, window.scrollY);
    }, 10),
        setTimeout(function () { T.classList.remove("mStars-tooltip--visible"), setTimeout(function () { document.body.removeChild(T); }, 1e3); }, 3500);
}

function mStars(m, p, db) {
    //        console.log({ m, i});
    //Settings and variable/const defintions
    const mSettings = {
        "default": {
            "sNo": 5,//Number > 0
            "sSize": 2.5,//in rem, Number > 0
            "tSize": 1,//in rem, Number > 0
            "tColor": '',
            "sAlign": "center",
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

    //console.log({ m });
    const t = m.dataset.pagetype,
        s = m.dataset.size || "lg",
        isD = (m.dataset.display == "true"),//Display only
        isV = (m.dataset.votes == "true"),
        S = mSettings[t],
        D = mSettings.default;

    for (let i in D) (typeof (S[i]) == "undefined") && (S[i] = D[i]); //Assign settings by type of current page (for Blogger)
    // console.log({sSet,dSet,m,pType,sType: isM}, m.dataset.display, location.href, location.host);
    S["sSize"] = D["sSize"] * (s == "sm" ? .4 : s == "md" ? .6 : 1);
    S["tSize"] = `${D["tSize"] * (s == "sm" ? .7 : s == "md" ? .75 : 1)}rem`;
    S["tBottom"] = D[`tBottom-${s}`];
    //    console.log(sSet["tBottomD-lg"]);
    //console.log(sSize,m.dataset);
    m.style.textAlign = S["sAlign"]; // dynamic: kept inline
    // position: relative is now applied via .mStars CSS class

    let R = localStorage["mSR_" + p];
    //console.log(sSet["sSize"],isM);

    //Text above and below the stars
    var tTop = document.createElement("div"), tBottom = document.createElement("div");
    S["tBottom"] = S["tBottom"].replace(/\$average\$/g, "<span class='mStars-average'>0</span>").replace(/\$votes\$/g, '<span class="mStars-votes">0</span>').replace(/\$max\$/g, S["sNo"]),
        tTop.innerHTML = !R ? S["tTop"] : S["tDone"].replace(/\$userRating\$/g, R);
    tBottom.innerHTML = S["tBottom"],
        tTop.style.fontSize = tBottom.style.fontSize = S["tSize"],
        tTop.style.color = tBottom.style.color = S["tColor"],
        !isD && m.appendChild(tTop);
    (!isD || isV) && m.appendChild(tBottom);

    //    console.log(S["tSize"]);

    let w = sRender(m, S, isD, isV, R, p, tTop);

    //        console.log({ db });
    onValue(db, s => {
        var rArr = s.val() || { "r": 0, "c": 0 },
            rating = (rArr.r * S["sNo"]).toFixed(2);
        //                    console.log({ rArr });
        if (rArr.c == 0) {
            rArr = { "r": 1, "c": 1 }; //set to 1 to avoid search console error
            set(db, rArr);
        }

        sUpdate(m, rating);         //Render stars

        (!isD || isV) && (
            m.getElementsByClassName("mStars-average")[0].textContent = rating,
            m.getElementsByClassName("mStars-votes")[0].textContent = rArr.c);
        //                console.log(m.getElementsByClassName("mStars-average"), m.getElementsByClassName("mStars-votes"));
        if (!isD) {
            w.onmouseleave = function () {
                sUpdate(m, rating),
                    tTop.innerHTML = !R ? S["tTop"] : S["tDone"].replace(/\$userRating\$/g, R);
            },
                Array.from(m.getElementsByTagName("svg")).forEach((e, i) => {
                    e.onclick = function () {
                        if (!R) {
                            //rating update
                            const c = rArr.c + 1,
                                r = Math.round((rArr.r * rArr.c + (i + 1) / S["sNo"]) / c * 1000000) / 1000000;
                            //                            console.log({ "r": r, "c": c,i });
                            set(db, { "r": r, "c": c }).then(() => {
                                R = localStorage["mSR_" + p] = i + 1;
                                m.querySelectorAll("svg").forEach(e => e.style.cursor = "inherit");
                                i >= 3 && tTip(S["tThanks"], m, i + 1, D["tSize"]);
                                tTop.innerHTML = S["tTop"] + (i > 3 ? " Thanks!" : '');
                                location.reload();
                            });
                        } else tTip(S["tDone"], m, R, D["tSize"]);
                        //console.log(R);
                    };
                });
        }
    }, { onlyOnce: true });
}

//mStars - Schema for Google Search Rich Reviews Snippet
function sSchema(m, h, a) {
    //        console.log({ m, db });
    const p = pathFormat(m.dataset.url, h),
        db = ref(getDatabase(a), `mStars/${h}/${p}`);

    onValue(db, s => {
        const rArr = s.val() || { "r": 1, "c": 1 },//set to 1 to avoid search console error
            r = (rArr.r * 5).toFixed(2);
        let b = m.closest(".post") || m.closest(".Blog"),
            t = b.getElementsByClassName("ratingJSON"),
            n = m.dataset.title == "" ? document.title : m.dataset.title,
            type = m.dataset.schema,
            j = t[0] || document.createElement("script");
        t.length == 0 && (b.append(j), j.type = 'application/ld+json');
        j.text = `{"@context": "https://schema.org/","@type": "${type}","name": "${n}","aggregateRating": {"@type": "AggregateRating","ratingValue": "${r}","worstRating": "1","bestRating": "5","ratingCount": "${rArr.c}"}}`;
        //            console.log({ b, r, j }, j.textContent);
    }, { onlyOnce: true });
}

//Check if DB is ready
function i(m) {
    const h = location.host.replace("www.", "").replace(/\./g, "_").replace(/\//g, "__"),
        d = document.getElementById("mStars").dataset.db || null,//db Path
        a = !getApps.length ? initializeApp({ "databaseURL": d }, "mStars") : getApp("mStars"),
        p = pathFormat(m.dataset.url, h),
        db = ref(getDatabase(a), `mStars/${h}/${p}`);
    //  console.log({ h, p, db });

    switch (d) {
        case null: case "":
            m.innerHTML = "Error! Missing Firebase DB URL >> 'https://YOUR-FIREBASE.firebaseio.com'."; break;
        default:
            if (d.indexOf("https://") !== 0 || d.lastIndexOf("firebaseio.com") < 5)
                m.innerHTML = "Error! Invalid Firebase URL.";
            else {
                d.lastIndexOf("/") !== d.length - 1 && (d = `${d}/`);
                //                        console.log({ f });
                f && (f = !1, Array.from(document.getElementsByClassName("mStars")).forEach(m => typeof m.dataset.schema != "undefined" && sSchema(m, h, a)));
                mStars(m, p, db);
            }
    }
}

function mStarsCB(entries, observer) {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            i(entry.target);
        }
    });
}

injectStyles();
const options = { rootMargin: '500px', threshold: 0.0 };
let f = !0,
    observer = new IntersectionObserver(mStarsCB, options);
Array.from(document.getElementsByClassName("mStars")).forEach(e => observer.observe(e));