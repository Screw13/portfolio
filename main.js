(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GH = "https://github.com/Screw13/";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Real public repos on github.com/Screw13, checked against READMEs and imports.
  const REPOS = [
    { repo: "zoom-bot---2022", year: "2022", tags: ["automation", "zoom"],
      sum: "joins zoom meetings automatically during covid",
      does: "Joined Zoom meetings for him during covid, clicking through the join window automatically.",
      stack: ["Python", "pyautogui"] },
    { repo: "zoom-bot---2023-the-second", year: "2023", tags: ["automation", "zoom"],
      sum: "faster and better than the 2022 version",
      does: "A rewrite of the 2022 Zoom bot. In his words: faster and better than the first.",
      stack: ["Python", "pyautogui", "subprocess"] },
    { repo: "sfs-rocket-earth-to-lower-earth-orbit-2023", year: "2023", tags: ["game", "automation"],
      sum: "flies a Spaceflight Simulator rocket to low earth orbit",
      does: "Launches a rocket in Spaceflight Simulator and flies it to low Earth orbit, above the Kármán line, with no hands on the keys.",
      stack: ["Python", "pyautogui", "keyboard"] },
    { repo: "temp-files-del-2-2023", year: "2023", tags: ["automation", "windows"],
      sum: "deletes temp files",
      does: "Deletes temp files for him, automating every click with pyautogui.",
      stack: ["Python", "pyautogui"] },
    { repo: "fnaf-bot-2024", year: "2024", tags: ["game", "vision"],
      sum: "plays FNAF 1 on its own",
      does: "Plays Five Nights at Freddy's 1 by itself, watching the screen for Bonnie, Chica and Foxy and reacting before they get in.",
      stack: ["Python", "pyautogui", "keyboard", "image matching"] },
    { repo: "ideal-gear-bot-2024", year: "2024", tags: ["game", "vision"],
      sum: "plays ideal gear by itself",
      does: "Plays Ideal Gear by itself, finding the gear, upgrade and reset buttons on screen.",
      stack: ["Python", "pyautogui", "keyboard"] },
    { repo: "alfred-personal-pc-agent-basic-2024", year: "2024", tags: ["discord", "automation", "agent"],
      sum: "discord-controlled PC agent",
      does: "A Discord bot that controls his PC: launches and ends programs in the background on command, with secrets kept in a .env file. Screen recording and photos are next on his list.",
      stack: ["Python", "discord.py", "psutil", "subprocess", "dotenv"] },
    { repo: "piano-game-bot", year: null, tags: ["game"],
      sum: "plays piano tiles by itself",
      does: "Plays the online Piano Tiles game on its own: start the bot, open the game, and it taps the tiles.",
      stack: ["Python", "pyautogui", "pydirectinput"] },
    { repo: "temp-files-del-3-2025", year: "2025", tags: ["automation", "windows"],
      sum: "temp file cleaner, improved",
      does: "The improved version of his temp file cleaner, two years on from v2.",
      stack: ["Python", "pyautogui"] }
  ];

  /* ---------- toast ---------- */
  const toast = Object.assign(document.createElement("div"), { className: "toast" });
  toast.setAttribute("role", "status"); document.body.append(toast);
  let tT; const say = m => { toast.textContent = m; toast.classList.add("show"); clearTimeout(tT); tT = setTimeout(() => toast.classList.remove("show"), 1800); };
  const copy = async text => { try { await navigator.clipboard.writeText(text); say("Copied"); } catch { say("Copy blocked. Select the text instead."); } };

  /* ---------- glitch reveal: every letter glitches, then they lock in one by one ---------- */
  // the glitch only ever shows the text's own characters, shuffled
  const escChar = c => c === "<" ? "&lt;" : c === "&" ? "&amp;" : c === ">" ? "&gt;" : c;
  const TIMING = {
    title: { hold: 520, per: 130 },  // headings: all glitch, then H... r... i...
    text: { hold: 260, per: 16 }     // paragraphs: same idea, faster so they stay readable
  };
  function glitch(el) {
    const final = el.dataset.text || el.textContent.trim();
    const { hold, per } = TIMING[el.dataset.glitch] || TIMING.text;
    const chars = [...final];
    const pool = chars.filter(c => c !== " ");
    const rnd = () => escChar(pool[(Math.random() * pool.length) | 0]);
    // screen readers get the real text once, never the noise
    const sr = document.createElement("span"); sr.className = "sr-only"; sr.textContent = final;
    el.before(sr); el.setAttribute("aria-hidden", "true");
    el.classList.add("g-live");
    const t0 = performance.now(); let lastPaint = 0;
    const frame = t => {
      if (t - lastPaint >= 40) {              // glyphs flicker ~22 times a second
        lastPaint = t;
        const locked = Math.max(0, Math.floor((t - t0 - hold) / per));
        let html = "";
        for (let i = 0; i < chars.length; i++) {
          const c = chars[i];
          if (c === " ") html += " ";
          else if (i < locked) html += escChar(c);
          else if (i === locked) html += `<span class="g-hot">${rnd()}</span>`;
          else html += rnd();
        }
        el.innerHTML = html;
        if (locked >= chars.length) { el.textContent = final; el.classList.remove("g-live"); el.classList.add("g-done"); return; }
      }
      setTimeout(() => frame(performance.now()), 45);
    };
    frame(performance.now());
  }
  const glitchEls = document.querySelectorAll("[data-glitch]");
  if (reduce || !("IntersectionObserver" in window)) glitchEls.forEach(el => el.classList.add("g-done"));
  else {
    let ioFired = false;
    const gio = new IntersectionObserver(es => es.forEach(e => {
      ioFired = true;
      if (!e.isIntersecting) return;
      gio.unobserve(e.target);
      // stagger a heading and the paragraph under it so they read top to bottom
      const delay = e.target.dataset.glitch === "text" ? 380 : 0;
      setTimeout(() => glitch(e.target), delay);
    }), { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
    glitchEls.forEach(el => gio.observe(el));
    // failsafe: never leave words hidden if the observer is throttled (background tab, odd browser)
    setTimeout(() => glitchEls.forEach(el => { if (!el.classList.contains("g-live") && !el.classList.contains("g-done") && el.getBoundingClientRect().top < innerHeight) { gio.unobserve(el); glitch(el); } }), 1200);
    setTimeout(() => { if (!ioFired) glitchEls.forEach(el => { if (!el.classList.contains("g-live")) el.classList.add("g-done"); }); }, 2500);
  }

  /* ---------- emblem ring decode ---------- */
  const MSG = "DEV HRISHIKESH ";
  const NB = " ";
  const bytes = [...MSG].map(c => c.charCodeAt(0).toString(2).padStart(8, "0"));
  const tp = $(".ring-text textPath");
  const spans = bytes.map(b => { const t = document.createElementNS("http://www.w3.org/2000/svg", "tspan"); t.textContent = b + NB; tp.append(t); return t; });
  const emblem = $(".emblem");
  const pad = ch => NB.repeat(3) + (ch === " " ? "·" : ch) + NB.repeat(5);
  let decT;
  function setRing(on) {
    emblem.classList.toggle("decoded", on);
    clearInterval(decT);
    if (reduce) { spans.forEach((t, i) => t.textContent = on ? pad(MSG[i]) : bytes[i] + NB); return; }
    let f = 0;
    decT = setInterval(() => {
      f++;
      spans.forEach((t, i) => {
        t.textContent = f >= 2 + i ? (on ? pad(MSG[i]) : bytes[i] + NB) : [...bytes[i]].map(() => (Math.random() < 0.5 ? "0" : "1")).join("") + NB;
      });
      if (f > 2 + spans.length) clearInterval(decT);
    }, 40);
  }
  let hover = false;
  emblem.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") { hover = true; setRing(true); } });
  emblem.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { hover = false; if (emblem.getAttribute("aria-pressed") !== "true") setRing(false); } });
  emblem.addEventListener("click", () => {
    const on = emblem.getAttribute("aria-pressed") !== "true";
    emblem.setAttribute("aria-pressed", String(on));
    setRing(on || hover);
    say(on ? "Ring decoded: DEV HRISHIKESH" : "Back to binary");
  });

  /* ---------- projects: live grep + tags + expandable rows ---------- */
  const list = $(".repos"), grep = $(".grep"), tagBox = $(".tags"), empty = $(".grep-empty"), count = $(".grep-count");
  const allTags = [...new Set(REPOS.flatMap(r => r.tags))];
  let activeTag = null;
  const tagBtns = allTags.map(t => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "tag"; b.textContent = t; b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => { activeTag = activeTag === t ? null : t; tagBtns.forEach(x => x.setAttribute("aria-pressed", String(x.textContent === activeTag))); render(); });
    tagBox.append(b); return b;
  });

  const items = REPOS.map((r, i) => {
    const li = document.createElement("li"); li.className = "repo";
    const id = "repo-d-" + i;
    const cmd = `git clone ${GH}${r.repo}.git`;
    li.innerHTML = `
      <button class="repo-row" type="button" aria-expanded="false" aria-controls="${id}">
        <span class="perm">drwxr-xr-x</span><span class="yr">${r.year || "----"}</span><span class="rname"></span><span class="chev" aria-hidden="true">›</span>
        <span class="repo-sum"># ${esc(r.sum)}</span>
      </button>
      <div class="repo-detail" id="${id}"><div><div class="detail-in">
        <p>${esc(r.does)}</p>
        <ul class="stack">${r.stack.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
        <div class="clone"><code tabindex="0">${esc(cmd)}</code><button type="button">Copy</button></div>
        <a class="gh-link" href="${GH}${r.repo}">Read the code on GitHub</a>
      </div></div></div>`;
    const row = $(".repo-row", li);
    row.addEventListener("click", () => toggle(i));
    $(".clone button", li).addEventListener("click", () => copy(cmd));
    list.append(li);
    return { li, row, name: $(".rname", li), r };
  });

  function toggle(i, force) {
    const it = items[i];
    const open = force ?? !it.li.classList.contains("open");
    it.li.classList.toggle("open", open);
    it.row.setAttribute("aria-expanded", String(open));
    $(".repo-detail", it.li).inert = !open;
  }
  items.forEach((_, i) => toggle(i, false));

  function render() {
    const q = grep.value.trim().toLowerCase();
    let n = 0;
    items.forEach(it => {
      const hay = [it.r.repo, it.r.sum, it.r.does, ...it.r.stack, ...it.r.tags].join(" ").toLowerCase();
      const show = (!q || hay.includes(q)) && (!activeTag || it.r.tags.includes(activeTag));
      it.li.hidden = !show;
      if (show) n++;
      const name = it.r.repo + "/";
      if (q && name.toLowerCase().includes(q)) {
        const s = name.toLowerCase().indexOf(q);
        it.name.innerHTML = esc(name.slice(0, s)) + "<mark>" + esc(name.slice(s, s + q.length)) + "</mark>" + esc(name.slice(s + q.length));
      } else it.name.textContent = name;
    });
    empty.hidden = n > 0;
    count.textContent = `${n} of ${REPOS.length} repos`;
  }
  grep.addEventListener("input", render);
  $("[data-clear]").addEventListener("click", () => { grep.value = ""; activeTag = null; tagBtns.forEach(x => x.setAttribute("aria-pressed", "false")); render(); grep.focus(); });
  render();

  /* ---------- nmap skills scan ---------- */
  const PORTS = [
    ["22/tcp", "open", "python", "primary language: 9 public repos"],
    ["80/tcp", "open", "javascript", "web basics, small web apps"],
    ["443/tcp", "open", "c", "learning systems basics"],
    ["2222/tcp", "open", "bash", "shell scripting"],
    ["8080/tcp", "open", "linux", "daily driver: kali"],
    ["9001/tcp", "open", "nmap", "recon"],
    ["9002/tcp", "open", "wireshark", "packet analysis"],
    ["1337/tcp", "open", "ctf", "beginner CTFs, writing up what he learns"],
    ["3000/tcp", "open", "git", "git, github, vs code"],
    ["2375/tcp", "filtered", "docker", "learning next"],
    ["179/tcp", "filtered", "networking", "learning next"],
    ["8443/tcp", "filtered", "secure-coding", "learning next"]
  ];
  const scanOut = $(".scan-out"), runBtn = $(".run");
  const row = (a, b, c, d, cls = "") => `<div class="row ${cls}"><span>${a}</span><span class="${b === "open" ? "st-open" : b === "filtered" ? "st-filt" : ""}">${b}</span><span class="svc">${c}</span><span class="ver">${d}</span></div>`;
  function scan() {
    runBtn.disabled = true; runBtn.textContent = "Scanning";
    const head = `<div class="dim">Starting Nmap scan of hrishikesh\nHost is up.\n</div>` + row("PORT", "STATE", "SERVICE", "VERSION", "hd");
    scanOut.innerHTML = head;
    let i = 0;
    const step = () => {
      if (i < PORTS.length) { scanOut.insertAdjacentHTML("beforeend", row(...PORTS[i++])); setTimeout(step, reduce ? 0 : 90); }
      else {
        scanOut.insertAdjacentHTML("beforeend", `<div class="dim">\n${PORTS.filter(p => p[1] === "open").length} open, ${PORTS.filter(p => p[1] === "filtered").length} filtered (learning next). Scan done.</div>`);
        runBtn.disabled = false; runBtn.textContent = "Scan again";
      }
    };
    step();
  }
  runBtn.addEventListener("click", scan);
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { so.disconnect(); if (!scanOut.textContent) scan(); } }, { threshold: 0.5 });
    so.observe(scanOut);
  }

  /* ---------- latest push, live from github ---------- */
  const latest = $(".latest");
  const showLatest = (name, when, desc, url) => {
    $(".latest-name", latest).textContent = name;
    $(".latest-meta", latest).textContent = when;
    $(".latest-desc", latest).textContent = desc || "No description yet.";
    latest.href = url;
  };
  fetch("https://api.github.com/users/Screw13/repos?sort=pushed&per_page=1", { headers: { Accept: "application/vnd.github+json" } })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(([r]) => {
      const d = new Date(r.pushed_at);
      showLatest(r.name, `pushed ${d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} · ${r.language || "mixed"}`, r.description, r.html_url);
    })
    .catch(() => showLatest("portfolio", "couldn't reach GitHub, showing the last known repo", "This site's own repo.", GH + "portfolio"));

  /* ---------- the shell ---------- */
  const out = $(".shell-out"), form = $(".shell-in"), input = $("#shell-cmd");
  const hist = []; let hp = 0;
  const print = (html, cls) => { const d = document.createElement("div"); if (cls) d.className = cls; d.innerHTML = html; out.append(d); out.scrollTop = out.scrollHeight; };
  const prompt = cmd => `<span class="ps-a">┌──(</span><span class="ps-b">hrishikesh㉿kali</span><span class="ps-a">)-[</span>~<span class="ps-a">]</span>\n<span class="ps-a">└─$</span> <span class="cmdline">${esc(cmd)}</span>`;
  const findRepo = a => { const n = parseInt(a, 10); if (n >= 1 && n <= REPOS.length) return n - 1; a = (a || "").toLowerCase(); return a ? REPOS.findIndex(r => r.repo.toLowerCase().includes(a)) : -1; };
  const goTo = sel => $(sel).scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const CMDS = {
    help: () => print(`<span class="steel">commands</span>
  whoami          who this is
  cat now.txt     what he's doing right now
  ls              list his repos
  cd &lt;n|name&gt;     open a repo (try: cd 7, cd fnaf)
  grep &lt;word&gt;     filter the project list
  nmap            scan his skills
  decode          decode the emblem's ring
  contact         how to reach him
  clear           clear the screen`),
    whoami: () => print(`hrishikesh: software dev, security learner, 1st-year uni student`),
    cat: a => {
      if (/now/.test(a)) return print(`learning C and systems basics, playing beginner CTFs, building small web apps.`);
      if (/skill/.test(a)) return CMDS.nmap();
      print(`cat: ${esc(a || "")}: No such file. Try <span class="steel">cat now.txt</span>`, "red");
    },
    ls: () => print(REPOS.map((r, i) => `<span class="steel">drwxr-xr-x</span> ${String(i + 1).padStart(2)}  ${(r.year || "----")}  ${esc(r.repo)}/`).join("\n")),
    cd: a => {
      const i = findRepo(a);
      if (i < 0) return print(`cd: ${esc(a || "")}: No such repo. Run <span class="steel">ls</span>.`, "red");
      print(`<span class="ok">opening</span> ~/projects/${esc(REPOS[i].repo)}`);
      grep.value = ""; activeTag = null; tagBtns.forEach(x => x.setAttribute("aria-pressed", "false")); render();
      toggle(i, true); goTo("#projects");
    },
    grep: a => { grep.value = a || ""; render(); print(`<span class="ok">filtered</span> ${count.textContent}`); goTo("#projects"); },
    nmap: () => { print(`<span class="ok">running</span> nmap -sV hrishikesh`); goTo("#skills"); setTimeout(scan, reduce ? 0 : 400); },
    decode: () => { print(bytes.join(" ") + `\n<span class="ok">→ DEV HRISHIKESH</span>`); if (emblem.getAttribute("aria-pressed") !== "true") emblem.click(); },
    contact: () => print(`github: <a href="${GH}">github.com/Screw13</a>`),
    clear: () => out.replaceChildren(),
    sudo: () => print(`hrishikesh is not in the sudoers file. This incident will be reported.`, "red"),
    exit: () => print(`nice try.`, "warn")
  };
  const names = Object.keys(CMDS).filter(n => !["sudo", "exit"].includes(n));

  function run(raw) {
    const v = raw.trim();
    print(prompt(v));
    if (!v) return;
    hist.push(v); hp = hist.length;
    const [c, ...rest] = v.split(/\s+/);
    const fn = CMDS[c.toLowerCase()];
    fn ? fn(rest.join(" ")) : print(`${esc(c)}: command not found. Type <span class="steel">help</span>.`, "red");
  }
  form.addEventListener("submit", e => { e.preventDefault(); run(input.value); input.value = ""; });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") { e.preventDefault(); if (hp > 0) input.value = hist[--hp]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); hp = Math.min(hist.length, hp + 1); input.value = hist[hp] || ""; }
    else if (e.key === "Tab" && input.value && !input.value.includes(" ")) {
      const m = names.filter(n => n.startsWith(input.value.toLowerCase()));
      if (m.length) { e.preventDefault(); m.length === 1 ? input.value = m[0] + " " : print(m.join("  "), "steel"); }
    }
  });
  $(".win-shell").addEventListener("click", e => { if (!e.target.closest("a") && !String(getSelection())) input.focus({ preventScroll: true }); });
  addEventListener("keydown", e => {
    if (e.key === "/" && !e.target.closest?.("input, textarea")) { e.preventDefault(); input.focus(); input.scrollIntoView({ block: "center", behavior: "auto" }); }
  });

  // boot: type the same three commands his site opens with
  const boot = ["whoami", "cat now.txt", "help"];
  if (reduce) boot.forEach(run);
  else {
    let b = 0;
    const next = () => {
      if (b >= boot.length) return;
      const cmd = boot[b++]; let c = 0;
      const line = document.createElement("div"); out.append(line);
      const tick = setInterval(() => {
        line.innerHTML = prompt(cmd.slice(0, ++c));
        if (c >= cmd.length) { clearInterval(tick); line.remove(); run(cmd); setTimeout(next, 260); }
      }, 55);
    };
    setTimeout(next, 700);
  }

  /* ---------- binary column: bits flip faster as you scroll ---------- */
  const cv = $(".bits"), ctx = cv.getContext("2d");
  let W = 0, H = 0, cols = [], energy = 0, raf = 0, lastY = scrollY, running = false;
  const CELL = 18;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = cv.clientWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rows = Math.ceil(H / CELL) + 1;
    cols = Array.from({ length: rows }, () => (Math.random() < 0.5 ? 0 : 1));
    draw(true);
  }
  function draw(all) {
    ctx.font = `500 13px "JetBrains Mono", monospace`;
    ctx.textAlign = "center";
    const flips = all ? cols.length : Math.max(1, Math.round(energy * 6));
    for (let k = 0; k < flips; k++) {
      const i = all ? k : (Math.random() * cols.length) | 0;
      if (!all) cols[i] ^= 1;
      ctx.clearRect(0, i * CELL, W, CELL);
      ctx.fillStyle = cols[i] ? "#e0323e" : "#5b6672";
      ctx.fillText(String(cols[i]), W / 2, i * CELL + 13);
    }
  }
  function loop() {
    draw(false);
    energy *= 0.92;
    if (energy > 0.05) raf = requestAnimationFrame(loop); else running = false;
  }
  function kick(amount) {
    if (reduce) return;
    energy = Math.min(4, energy + amount);
    if (!running) { running = true; raf = requestAnimationFrame(loop); }
  }
  addEventListener("scroll", () => { const d = Math.abs(scrollY - lastY); lastY = scrollY; kick(d / 60); }, { passive: true });
  addEventListener("pointermove", e => { if (e.clientX > innerWidth - 80) kick(0.6); }, { passive: true });
  addEventListener("resize", size);
  document.fonts?.ready.then(size); size();
})();
