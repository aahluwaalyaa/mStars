/*!
 * mStars
 * Demo @ https://mBlocksForBloggers.blogspot.com/
 * Documentation @ tbd
 * Agency @ https://CIA.RealHappinessCenter.com
 * Copyright (c) 2022, Aahluwaalyaa (https://msa.RealHappinessCenter.com/)
 * Released under the MIT license
 */
//Settings and variable/const defintions
var mSettings = {
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

//first instance - create scripts and animation
if (!document.getElementById("fbdb")) {
    const fApp = document.createElement("script"); fApp.src = "https://www.gstatic.com/firebasejs/8.1.1/firebase-app.js", fApp.id = ("fbdb"), document["head"].appendChild(fApp), fApp.onload = function () {
        const fDB = document.createElement("script"); fDB.src = "https://www.gstatic.com/firebasejs/8.1.1/firebase-database.js", document.head.appendChild(fDB);
    };
    const sAnimate = document.createElement("style"); sAnimate.innerHTML = "@keyframes mAnimate {0% {transform: rotate(0deg);} 100% {transform:rotate(360deg);}} .mSpinny ~ div{visibility:hidden;}", document.head.appendChild(sAnimate);
}

//Check if DB is ready
function init() {
    //    console.log({ i },document.getElementsByClassName("mStars"));
    if (typeof firebase == "object" && typeof firebase.database == "function" && typeof firebase.initializeApp == "function") {
        let db = document.getElementById("mStars").dataset.db,
            a = firebase.initializeApp({ "databaseURL": db }, "mStars");
        Array.from(document.getElementsByClassName("mStars")).forEach((e) => { mStars(e, db, a) });
    } else { setTimeout(function () { init(); }, 50); }
}

//Covert path into identifier
function pathFormat(p, host) {
    let e = p.split("?")[0].split("#")[0].replace("https:", "").replace("http:", "").replace("file:", "").replace("ftp:", "").replace("mailto:", "");
    for (; "/" == e[0];)e = e.substring(1);
    for (0 === e.indexOf("www.") && (e = e.replace("www.", "")); "/" == e[e.length - 1];)e = e.substring(0, e.length - 1);
    //      console.log({e});
    e = e.replace(/\./g, "_").replace(/\//g, "__").replace(/\,/g, "___").replace(/\s/g, "");
    return e = e.replace(host, "");
}

//mStars Render
function sRender(e, S, isD, isV, R, p, tTop) {
    const w = document.createElement("div"), n = S["sNo"]; w.style.width = (S["sSize"] + 0.1 * 2) * n + "rem", w.style = "display:inline-block;", e.insertBefore(w, e.lastChild);
    !isD && (w.style.margin = "1rem");
    isV && (w.style.lineHeight = 0);

    for (let i = 1; i <= n; i++) {
        w.insertAdjacentHTML("beforeend", '<svg xmlns="http://www.w3.org/2000/svg" width="' + S["sSize"] + 'rem" height="' + S["sSize"] + 'rem" fill="gold" class="bi bi-star-fill" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" /></svg >');
        const s = w.lastChild;
        s.style = "display:inline-block;margin:0.1rem",
            s.style.cursor = !R && !isD ? "pointer" : "inherit";

        !isD && (s.onmouseenter = function () {
            if (!localStorage["mSR_" + p]) {
                let s = e.getElementsByTagName("svg");
                for (let j = 0; j < s.length; j++) {
                    s[j].style.fill = "gold", s[j].style.opacity = j < i ? 1 : .25;
                }
                (S["tTop"] != "") && (tTop.innerHTML = i + "/" + n);
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

//mStars - Schema for Google Search Rich Reviews Snippet
function sSchema(e, r, c) {
    let b = (e.closest(".post") || e.closest(".Blog")),
        t = b.getElementsByClassName("ratingJSON"),
        n = (e.dataset.title == "" ? document.title : e.dataset.title),
        type = e.dataset.schema,
        j = t[0] || document.createElement("script");
    t.length == 0 && (b.append(j), j.type = 'application/ld+json');
    j.text = '{"@context": "https://schema.org/","@type": "' + type + '","name": "' + n + '","aggregateRating": {"@type": "AggregateRating","ratingValue": "' + r + '","worstRating": "1","bestRating": "5","ratingCount": "' + c + '"}}';
    //            console.log({ b, r, j }, j.textContent);
}

//onclick tooltip renderer
function tTip(t, e, r, f) {
    const T = document.createElement("div"); T.innerHTML = t.replace(/\$userRating\$/g, r), T.style = "border-radius:7px;position:absolute;background:rgba(255,215,0,100%);padding:5px;text-align:center;opacity:0;transition:opacity 1s;width:200px;boxSizing:border-box;zIndex:9999999", T.style.fontSize = f; document.body.appendChild(T);
    //    console.log({t:T.style.fontSize,f});
    let b = e.getBoundingClientRect();
    //            console.log({eCoordinates});
    setTimeout(function () {
        T.style.opacity = "1";
        T.style.left = e.style.textAlign === "right" ? (window.scrollX + b.left + e.offsetWidth - 200 + "px") : e.style.textAlign === "center" ? (window.scrollX + b.left + e.offsetWidth / 2 - 100 + "px") : window.scrollX + b.left + "px";
        T.style.top = window.scrollY + b.top + 44 + "px";
        //        console.log(T.style.top, b.top, T.offsetHeight, window.scrollY);
    }, 10),
        setTimeout(function () { T.style.opacity = 0, setTimeout(function () { document.body.removeChild(T); }, 1e3); }, 3500);
}

function mStars(m, dbPath, app) {
    //        console.log({ m, i});
    const h = location.host.replace("www.", "").replace(/\./g, "_").replace(/\//g, "__"),
        t = m.dataset.pagetype,
        s = m.dataset.size || "lg",
        isD = (m.dataset.display == "true"),//Display only
        isV = (m.dataset.votes == "true"),
        S = mSettings[t],
        D = mSettings.default;
    let p = pathFormat(m.dataset.url, h);
    for (let i in D) (typeof (S[i]) == "undefined") && (S[i] = D[i]); //Assign settings by type of current page (for Blogger)
    // console.log({sSet,dSet,m,pType,sType: isM}, m.dataset.display, location.href, location.host);
    S["sSize"] = D["sSize"] * (s == "sm" ? .4 : s == "md" ? .6 : 1);
    S["tSize"] = D["tSize"] * (s == "sm" ? .7 : s == "md" ? .75 : 1) + "rem";
    S["tBottom"] = D["tBottom-" + s];
    //    console.log(sSet["tBottomD-lg"]);
    //console.log(sSize,m.dataset);
    m.style.textAlign = S["sAlign"], m.style.position = "relative";
    p = p.replace(/\s/g, "_").replace(/\#/g, "-").replace(/\./g, "-").replace(/\@/g, "-").replace(/\!/g, "-").replace(/\$/g, "-").replace(/\%/g, "-").replace(/\&/g, "-").replace(/\(/g, "-").replace(/\)/g, "-");

    let R = localStorage["mSR_" + p];
    //console.log(sSet["sSize"],isM);

    //Add Loading Spinner
    let spinny = document.createElement("div"); spinny.classList.add("mSpinny"), spinny.style = "border:3px solid #f3f3f3;border-top:5px solid #002233;border-radius:0.5;width:30px;height:30px;animation:mAnimate 1s linear infinite;border-radius:15px;";
    if (S["sAlign"] === "center") spinny.style.margin = "auto"; else S["sAlign"] === "right" && (spinny.style.marginLeft = "calc(100% - " + S["sSize"] * S["sNo"] + "rem)");
    m.appendChild(spinny);

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

    //db
    switch (dbPath) {
        case null: case "": dbPath = "Error! Missing Firebase DB URL >> 'https://YOUR-FIREBASE.firebaseio.com'."; break;
        default:
            if ((dbPath.indexOf("https://") !== 0) || (dbPath.lastIndexOf("firebaseio.com") < 5)) dbPath = "Error! Invalid Firebase URL.";
            else { dbPath.lastIndexOf("/") !== dbPath.length - 1 && (dbPath = dbPath + "/"); }
    }

    let w = sRender(m, S, isD, isV, R, p, tTop);

    if (dbPath.indexOf("Error!") < 0) {
        let db = app.database().ref("mStars/" + h + "/" + p);
        //        console.log({ db });
        db.on("value", dbVal => {
            //            console.log({ db, dbVal },dbVal.val());
            let rArr = dbVal.val() || { "r": 0, "c": 0 },
                rating = (rArr.r * S["sNo"]).toFixed(2);
            //                    console.log({ rArr });

            //Render stars and remove Spinny
            sUpdate(m, rating);
            (typeof m.dataset.schema != "undefined") && sSchema(m, rating, rArr.c);
            m.contains(spinny) && spinny.remove();
            isV && (
                m.getElementsByClassName("mStars-average")[0].textContent = rating,
                m.getElementsByClassName("mStars-votes")[0].textContent = rArr.c);
            //                console.log(m.getElementsByClassName("mStars-average"), m.getElementsByClassName("mStars-votes"));
            if (!isD) {
                w.onmouseleave = function () {
                    sUpdate(m, rating),
                        tTop.innerHTML = !R ? S["tTop"] : S["tDone"].replace(/\$userRating\$/g, R);
                },
                    (!isV) && (m.getElementsByClassName("mStars-average")[0].textContent = rating,
                        m.getElementsByClassName("mStars-votes")[0].textContent = rArr.c),
                    Array.from(m.getElementsByTagName("svg")).forEach((e, i) => {
                        e.onclick = function () {
                            if (!R) {
                                //rating update
                                const c = rArr.c + 1,
                                    r = Math.round((rArr.r * rArr.c + (i + 1) / S["sNo"]) / c * 1000000) / 1000000;
                                //                            console.log({ "r": r, "c": c,i });
                                db.set({ "r": r, "c": c });
                                R = localStorage["mSR_" + p] = i + 1;
                                m.querySelectorAll("svg").forEach(e => e.style.cursor = "inherit");

                                i >= 3 && tTip(S["tThanks"], m, i + 1, D["tSize"]);
                                tTop.innerHTML = S["tTop"] + (i > 3 ? " Thanks!" : '');
                            } else tTip(S["tDone"], m, R, D["tSize"]);
                            //console.log(R);
                        };
                    });
            }
        });
    } else m.innerHTML = dbPath;
}
init();