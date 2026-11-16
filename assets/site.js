/* Adam Eivy portfolio: renders data/videos.json into the page and plays videos inline. */
(function () {
  "use strict";

  var CATALOG_URL = "data/videos.json";

  // Platform metadata for link pills, in display order.
  var PLATFORMS = [
    { key: "youtube", label: "YouTube", icon: "i-youtube", brand: "#ff0033" },
    { key: "x", label: "X post", icon: "i-x", brand: "var(--ink)" },
    { key: "spotify", label: "Spotify", icon: "i-spotify", brand: "#1ed760" },
    { key: "appleMusic", label: "Apple Music", icon: "i-apple", brand: "#fa2d48" },
    { key: "suno", label: "Suno", icon: "i-suno", brand: "#f5c542" },
    { key: "bandcamp", label: "Bandcamp", icon: "i-link", brand: "#1da0c3" },
    { key: "soundcloud", label: "SoundCloud", icon: "i-link", brand: "#ff5500" },
    { key: "tiktok", label: "TikTok", icon: "i-link", brand: "#25f4ee" },
    { key: "instagram", label: "Instagram", icon: "i-link", brand: "#e1306c" },
    { key: "vimeo", label: "Vimeo", icon: "i-link", brand: "#1ab7ea" }
  ];

  var playing = null; // { media, restore }
  var channel = {};
  var showcase = null;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "style") node.setAttribute("style", v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function icon(id) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(ns, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function hashHue(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return h;
  }

  function slugOf(v) {
    return (
      v.slug ||
      String(v.title || "video")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }

  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      t.classList.remove("is-on");
    }, 2200);
  }

  // ---------- Media ----------

  function posterNode(v) {
    if (v.poster) {
      return el("img", { src: v.poster, alt: "", loading: "lazy", decoding: "async" });
    }
    if (v.youtube) {
      var img = el("img", {
        src: "https://i.ytimg.com/vi/" + v.youtube + "/maxresdefault.jpg",
        alt: "",
        loading: "lazy",
        decoding: "async"
      });
      img.addEventListener("load", function () {
        // YouTube serves a 120px grey placeholder when maxres doesn't exist.
        if (img.naturalWidth > 0 && img.naturalWidth < 200 && !img.dataset.fallback) {
          img.dataset.fallback = "1";
          img.src = "https://i.ytimg.com/vi/" + v.youtube + "/hqdefault.jpg";
        }
      });
      img.addEventListener("error", function () {
        if (img.dataset.fallback) {
          img.style.visibility = "hidden";
          return;
        }
        img.dataset.fallback = "1";
        img.src = "https://i.ytimg.com/vi/" + v.youtube + "/hqdefault.jpg";
      });
      return img;
    }
    var gen = el("div", { class: "poster-gen", style: "--h:" + hashHue(v.title || "") }, [
      el("span", { text: v.title || "" })
    ]);
    return gen;
  }

  function playerNode(v) {
    if (v.youtube) {
      var params = "autoplay=1&rel=0&playsinline=1&modestbranding=1";
      return el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.youtube) + "?" + params,
        title: v.title + " (video)",
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowfullscreen: true,
        referrerpolicy: "strict-origin-when-cross-origin"
      });
    }
    if (v.video) {
      return el("video", {
        src: v.video,
        poster: v.poster || null,
        controls: true,
        autoplay: true,
        playsinline: true,
        preload: "metadata"
      });
    }
    return null;
  }

  function stopPlaying() {
    if (!playing) return;
    playing.restore();
    playing = null;
  }

  function buildMedia(v) {
    var media = el("div", { class: "media" });
    var canPlay = !!(v.youtube || v.video);

    function renderPoster() {
      media.textContent = "";
      media.classList.remove("is-playing");
      if (canPlay) {
        var btn = el("button", { type: "button", class: "media__play", "aria-label": "Play " + v.title }, [
          el("span", { class: "play-badge" }, [icon("i-play"), el("span", { text: "Play" })])
        ]);
        btn.addEventListener("click", play);
        media.appendChild(btn);
      } else if (v.links && v.links.x) {
        media.appendChild(
          el("a", { class: "media__play", href: v.links.x, target: "_blank", rel: "noopener", "aria-label": "Watch " + v.title + " on X" }, [
            el("span", { class: "play-badge" }, [icon("i-x"), el("span", { text: "Watch on X" })])
          ])
        );
      } else {
        media.appendChild(
          el("div", { class: "media__soon label" }, [el("span", { text: "Coming soon" })])
        );
      }
      media.appendChild(posterNode(v));
      if (v.runtime) {
        media.appendChild(el("span", { class: "media__runtime label", text: v.runtime }));
      }
    }

    function play() {
      stopPlaying();
      var player = playerNode(v);
      if (!player) return;
      media.textContent = "";
      media.classList.add("is-playing");
      media.appendChild(player);
      playing = { media: media, restore: renderPoster };
      if (player.tagName === "IFRAME") player.focus();
    }

    renderPoster();
    media._play = play;
    return media;
  }

  // ---------- Links ----------

  function linksFor(v) {
    var links = Object.assign({}, v.links || {});
    if (!links.spotify && channel.spotify) links.spotify = channel.spotify;
    return links;
  }

  function buildLinks(v) {
    var links = linksFor(v);
    var list = el("ul", { class: "links", "aria-label": "Listen and share " + v.title });

    PLATFORMS.forEach(function (p) {
      var url = links[p.key];
      if (!url) return;
      list.appendChild(
        el("li", null, [
          el(
            "a",
            {
              href: url,
              target: "_blank",
              rel: "noopener",
              style: "--brand:" + p.brand,
              "data-platform": p.key
            },
            [icon(p.icon), el("span", { text: p.label })]
          )
        ])
      );
    });

    (links.other || []).forEach(function (o) {
      if (!o || !o.url) return;
      list.appendChild(
        el("li", null, [
          el("a", { href: o.url, target: "_blank", rel: "noopener" }, [icon("i-link"), el("span", { text: o.label || "Link" })])
        ])
      );
    });

    var share = el("button", { type: "button", class: "copy" }, [icon("i-share"), el("span", { text: "Share" })]);
    share.addEventListener("click", function () {
      var url = location.origin + location.pathname + "#" + slugOf(v);
      if (navigator.share) {
        navigator.share({ title: v.title + " by Adam Eivy", url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(
          function () {
            toast("Link copied");
          },
          function () {
            toast(url);
          }
        );
      } else {
        toast(url);
      }
    });
    list.appendChild(el("li", null, [share]));
    return list;
  }

  function metaLine(v) {
    var bits = [];
    if (v.year) bits.push(String(v.year));
    else if (v.date) bits.push(String(v.date).slice(0, 4));
    if (v.runtime) bits.push(v.runtime);
    if (v.credits) bits.push(v.credits);
    return bits.join("  ·  ");
  }

  function kindLabel(v) {
    return v.type === "short-film" ? "Short film" : "Music video";
  }

  // Release number: oldest video in each type is No. 01.
  function numberAll(list) {
    var counts = {};
    for (var i = list.length - 1; i >= 0; i--) {
      var t = list[i].type || "music-video";
      counts[t] = (counts[t] || 0) + 1;
      list[i]._no = counts[t];
    }
  }

  // ---------- Showcase: player, details and a strip of every project ----------

  function buildShowcase(videos, startIndex) {
    var root = document.getElementById("stage");
    if (!root || !videos.length) return null;
    var total = videos.length;
    var current = -1;
    var thumbs = [];

    var mediaSlot = el("div", { class: "stage__media" });
    var no = el("span", { class: "stage__no label" });
    var kind = el("span", { class: "stage__kind label" });
    var title = el("h2", { class: "stage__title", id: "stage-title" });
    var prev = el("button", { type: "button", class: "nav-btn", "aria-label": "Previous project" }, [icon("i-prev")]);
    var next = el("button", { type: "button", class: "nav-btn", "aria-label": "Next project" }, [icon("i-next")]);
    var meta = el("p", { class: "stage__meta label" });
    var desc = el("p", { class: "stage__desc" });
    var linksSlot = el("div", { class: "stage__links" });
    var strip = el("ol", { class: "strip", "aria-label": "All projects" });

    var head = el("div", { class: "stage__head" }, [
      el("div", { class: "stage__eyebrow" }, [no, kind]),
      el("div", { class: "stage__titlerow" }, [title, el("div", { class: "stage__arrows" }, [prev, next])])
    ]);
    var detail = el("div", { class: "stage__detail", "aria-live": "polite" }, [meta, desc, linksSlot]);
    var rail = el("div", { class: "stage__rail" }, [strip]);

    root.appendChild(mediaSlot);
    root.appendChild(head);
    root.appendChild(rail);
    root.appendChild(detail);

    videos.forEach(function (v, i) {
      var btn = el("button", { type: "button", class: "thumb", "aria-label": "Show " + v.title }, [
        el("span", { class: "thumb__img" }, [posterNode(v)]),
        el("span", { class: "thumb__no label", text: "No. " + pad(v._no) + (v.year ? "  ·  " + v.year : "") }),
        el("span", { class: "thumb__title", text: v.title })
      ]);
      btn.addEventListener("click", function () {
        select(i);
      });
      thumbs.push(btn);
      strip.appendChild(el("li", null, [btn]));
    });

    function select(i, opts) {
      i = (i + total) % total;
      if (i === current) {
        if (opts && opts.play) mediaSlot.firstChild._play();
        return;
      }
      current = i;
      var v = videos[i];
      if (playing && root.contains(playing.media)) playing = null;

      var media = buildMedia(v);
      mediaSlot.textContent = "";
      mediaSlot.appendChild(media);
      mediaSlot.classList.remove("is-swap");
      void mediaSlot.offsetWidth;
      mediaSlot.classList.add("is-swap");

      no.textContent = "No. " + pad(v._no);
      kind.textContent = kindLabel(v);
      title.textContent = v.title;
      var m = metaLine(v);
      meta.textContent = m;
      meta.hidden = !m;
      desc.textContent = v.description || "";
      desc.hidden = !v.description;
      linksSlot.textContent = "";
      linksSlot.appendChild(buildLinks(v));

      thumbs.forEach(function (t, j) {
        t.classList.toggle("is-active", j === i);
        if (j === i) t.setAttribute("aria-current", "true");
        else t.removeAttribute("aria-current");
      });
      var t = thumbs[i];
      if (rail.scrollWidth > rail.clientWidth) {
        var left = t.parentNode.offsetLeft - (rail.clientWidth - t.offsetWidth) / 2;
        rail.scrollTo({ left: Math.max(0, left), behavior: opts && opts.instant ? "auto" : "smooth" });
      }
      if (!(opts && opts.instant) && history.replaceState) history.replaceState(null, "", "#" + slugOf(v));
      if (opts && opts.play) media._play();
    }

    prev.addEventListener("click", function () {
      select(current - 1);
    });
    next.addEventListener("click", function () {
      select(current + 1);
    });

    root.addEventListener("keydown", function (e) {
      if (e.target.tagName === "IFRAME") return;
      if (e.key === "ArrowLeft") {
        select(current - 1);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        select(current + 1);
        e.preventDefault();
      }
    });

    var x0 = null;
    mediaSlot.addEventListener("touchstart", function (e) {
      x0 = e.touches[0].clientX;
    }, { passive: true });
    mediaSlot.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50 && !mediaSlot.querySelector(".is-playing")) select(current + (dx < 0 ? 1 : -1));
    });

    select(startIndex || 0, { instant: true });
    return {
      select: select,
      indexOf: function (slug) {
        for (var k = 0; k < total; k++) if (slugOf(videos[k]) === slug) return k;
        return -1;
      }
    };
  }

  // ---------- Index: one line per project ----------

  function compactLinks(v) {
    var links = linksFor(v);
    var list = el("ul", { class: "mini-links", "aria-label": "Links for " + v.title });
    PLATFORMS.forEach(function (p) {
      if (!links[p.key]) return;
      list.appendChild(
        el("li", null, [
          el("a", { href: links[p.key], target: "_blank", rel: "noopener", title: p.label, "aria-label": v.title + " on " + p.label }, [icon(p.icon)])
        ])
      );
    });
    return list;
  }

  function renderIndex(music, films) {
    var body = document.getElementById("index-list");
    if (!body) return;
    body.textContent = "";

    function group(name, items, emptyText) {
      body.appendChild(el("li", { class: "index__group label" }, [
        el("span", { text: name }),
        el("span", { text: items.length ? items.length + (items.length === 1 ? " title" : " titles") : "In production" })
      ]));
      if (!items.length) {
        body.appendChild(el("li", { class: "index__row index__row--empty" }, [
          el("span", { class: "index__no label", text: "—" }),
          el("span", { class: "index__title index__title--empty", text: emptyText })
        ]));
        return;
      }
      items.forEach(function (v) {
        var a = el("a", { href: "#" + slugOf(v), class: "index__title" }, [v.title]);
        a.addEventListener("click", function (e) {
          if (!showcase) return;
          var i = showcase.indexOf(slugOf(v));
          if (i < 0) return;
          e.preventDefault();
          document.getElementById("work").scrollIntoView({ behavior: "smooth", block: "start" });
          showcase.select(i, { play: true });
        });
        body.appendChild(el("li", { class: "index__row" }, [
          el("span", { class: "index__no label", text: pad(v._no) }),
          a,
          el("span", { class: "index__year label", text: v.year ? String(v.year) : "" }),
          compactLinks(v)
        ]));
      });
    }

    group("Music videos", music);
    group("Short films", films, "First short film in production");
  }

  function wireChannel(channel) {
    if (!channel) return;
    var yt = channel.youtubeSubscribe || channel.youtube;
    var x = channel.xFollow || channel.x;
    document.querySelectorAll("[data-cta-yt]").forEach(function (a) {
      if (yt) a.href = yt;
    });
    document.querySelectorAll("[data-cta-x]").forEach(function (a) {
      if (x) a.href = x;
    });
  }

  function init(data) {
    var videos = (data && data.videos) || [];
    var music = videos.filter(function (v) {
      return (v.type || "music-video") === "music-video";
    });
    var films = videos.filter(function (v) {
      return v.type === "short-film";
    });
    numberAll(music);
    numberAll(films);
    channel = data.channel || {};
    wireChannel(channel);

    var list = videos.slice();
    var featuredIdx = list.findIndex(function (v) {
      return v.featured;
    });
    var hashIdx = list.findIndex(function (v) {
      return "#" + slugOf(v) === location.hash;
    });
    showcase = buildShowcase(list, hashIdx >= 0 ? hashIdx : Math.max(0, featuredIdx));
    renderIndex(music, films);

    window.addEventListener("hashchange", function () {
      if (!showcase) return;
      var i = showcase.indexOf(location.hash.slice(1));
      if (i >= 0) showcase.select(i);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") stopPlaying();
    });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  fetch(CATALOG_URL, { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(init)
    .catch(function (err) {
      var stage = document.getElementById("stage");
      if (stage) {
        stage.appendChild(
          el("p", { class: "load-error" }, [
            "The videos didn't load. You can watch them all on ",
            el("a", { href: "https://www.youtube.com/@atomantic", target: "_blank", rel: "noopener", text: "YouTube" }),
            "."
          ])
        );
      }
      if (window.console) console.error("Catalog failed to load:", err);
    });
})();
