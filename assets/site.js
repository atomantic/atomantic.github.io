/* Adam Eivy portfolio: renders data/videos.json into the page and plays videos inline. */
(function () {
  "use strict";

  var CATALOG_URL = "data/videos.json";

  // Platform metadata for link pills, in display order.
  var PLATFORMS = [
    { key: "youtube", label: "YouTube", icon: "i-youtube", brand: "#ff0033" },
    { key: "x", label: "X post", icon: "i-x", brand: "#f2efe9" },
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

  function buildMedia(v, opts) {
    var media = el("div", { class: "media" + (opts && opts.large ? " media--large" : "") });
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
      } else {
        media.appendChild(
          el("div", { class: "media__soon mono" }, [el("span", { text: "Coming soon" })])
        );
      }
      media.appendChild(posterNode(v));
      if (v.runtime) {
        media.appendChild(el("span", { class: "media__runtime mono", text: v.runtime }));
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
      if (history.replaceState) history.replaceState(null, "", "#" + slugOf(v));
      if (player.tagName === "IFRAME") player.focus();
    }

    renderPoster();
    media._play = play;
    return media;
  }

  // ---------- Links ----------

  function buildLinks(v) {
    var links = v.links || {};
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
    if (v.artist) bits.push(v.artist);
    if (v.year) bits.push(String(v.year));
    else if (v.date) bits.push(String(v.date).slice(0, 4));
    if (v.runtime) bits.push(v.runtime);
    return bits.join("  ·  ");
  }

  // ---------- Cards ----------

  function buildCard(v, i, total, kind) {
    var slug = slugOf(v);
    var media = buildMedia(v);
    var label = kind === "short-film" ? "Film" : "MV";

    var head = el("div", null, [
      el("p", { class: "card__index mono" }, [
        el("b", { text: pad(total - i) }),
        el("span", { text: label + " / " + pad(total) }),
        metaLine(v) ? el("span", { text: metaLine(v) }) : null,
        v.placeholder ? el("span", { class: "placeholder-tag", text: "Placeholder" }) : null
      ]),
      el("h3", { class: "card__title" }, [el("a", { href: "#" + slug, text: v.title })])
    ]);

    var detail = el("div", null, [
      v.description ? el("p", { class: "card__desc", text: v.description }) : null,
      v.credits ? el("p", { class: "card__credits mono", text: v.credits }) : null,
      buildLinks(v)
    ]);

    var card = el("li", { class: "card", id: slug }, [media, el("div", { class: "card__body" }, [head, detail])]);
    card._play = media._play;
    return card;
  }

  function buildFeature(v) {
    var wrap = document.getElementById("feature");
    if (!wrap || !v) return;
    var media = buildMedia(v, { large: true });
    var featureLink = el("a", { href: "#" + slugOf(v), text: v.title });
    featureLink.addEventListener("click", function (e) {
      e.preventDefault();
      media._play();
    });
    wrap.appendChild(media);
    wrap.appendChild(
      el("div", { class: "feature__meta" }, [
        el("div", null, [
          el("p", { class: "feature__label mono", text: "Latest release" }),
          el("h2", { class: "feature__title" }, [featureLink])
        ]),
        buildLinks(v)
      ])
    );
  }

  function renderGrid(gridId, countId, items, kind) {
    var grid = document.getElementById(gridId);
    var count = document.getElementById(countId);
    if (!grid) return [];
    grid.textContent = "";
    var cards = [];

    if (!items.length) {
      if (count) count.textContent = "In production";
      grid.appendChild(
        el("li", { class: "empty" }, [
          el("div", null, [
            el("p", { class: "empty__title", text: kind === "short-film" ? "Short films are coming." : "Videos are coming." }),
            el("p", { text: "Subscribe on YouTube to catch the first one when it drops." })
          ])
        ])
      );
      return cards;
    }

    if (count) count.textContent = items.length + (items.length === 1 ? " title" : " titles");
    items.forEach(function (v, i) {
      var card = buildCard(v, i, items.length, kind);
      grid.appendChild(card);
      cards.push(card);
    });
    return cards;
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

  function reveal(cards) {
    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) {
        c.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    cards.forEach(function (c) {
      io.observe(c);
    });
  }

  function openFromHash(cards) {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var card = cards.filter(function (c) {
      return c.id === id;
    })[0];
    if (!card) return;
    card.classList.add("is-in");
    card.scrollIntoView({ block: "start" });
  }

  function init(data) {
    var videos = (data && data.videos) || [];
    var music = videos.filter(function (v) {
      return (v.type || "music-video") === "music-video";
    });
    var films = videos.filter(function (v) {
      return v.type === "short-film";
    });

    wireChannel(data.channel);

    var featured =
      videos.filter(function (v) {
        return v.featured;
      })[0] || videos[0];
    buildFeature(featured);

    var cards = renderGrid("work-grid", "work-count", music, "music-video").concat(
      renderGrid("films-grid", "films-count", films, "short-film")
    );
    reveal(cards);
    openFromHash(cards);

    // Clicking a title link plays that card.
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest(".card__title a");
      if (!a) return;
      var id = a.getAttribute("href").slice(1);
      var card = document.getElementById(id);
      if (card && card._play) {
        e.preventDefault();
        card.scrollIntoView({ block: "start", behavior: "smooth" });
        card._play();
      }
    });

    // Escape stops the current video.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") stopPlaying();
    });
  }

  // Phone dock: slide in once the hero buttons scroll away, hide while another CTA block is on screen.
  (function dock() {
    var bar = document.querySelector(".dock");
    var blocks = document.querySelectorAll("main [data-cta]");
    if (!bar || !blocks.length || !("IntersectionObserver" in window)) return;
    var visible = new Set();
    var heroPassed = false;
    var hero = blocks[0];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
        if (e.target === hero && !e.isIntersecting) heroPassed = e.boundingClientRect.top < 0;
      });
      bar.classList.toggle("is-on", heroPassed && visible.size === 0);
    });
    blocks.forEach(function (b) {
      io.observe(b);
    });
  })();

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  fetch(CATALOG_URL, { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(init)
    .catch(function (err) {
      var grid = document.getElementById("work-grid");
      if (grid) {
        grid.appendChild(
          el("li", { class: "empty" }, [
            el("div", null, [
              el("p", { class: "empty__title", text: "Couldn't load the videos." }),
              el("p", null, [
                "Watch them on ",
                el("a", { href: "https://www.youtube.com/@atomantic", text: "YouTube" }),
                " instead."
              ])
            ])
          ])
        );
      }
      if (window.console) console.error("Catalog failed to load:", err);
    });
})();
