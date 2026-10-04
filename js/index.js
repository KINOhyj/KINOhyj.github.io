/**
 * index.js —— 首页交互逻辑
 * ---------------------------------------------------------------------------
 * 纯静态站点，无后端、无网络请求。所有内容来自 js/data.js 的 window.SITE_DATA。
 *
 * 模块划分：
 *   1) 工具函数（含内联 SVG 图标表）
 *   2) 内容渲染（个人经历 / 技能栈 / 作品集 / 联系方式 / Hero）
 *   3) 页面交互（导航、滚动高亮、进场动画、打字机、返回顶部、一键复制）
 *   4) 初始化
 *
 * 要改网站内容，请编辑 js/data.js，而不是本文件。
 */
(function () {
    "use strict";

    /* ======================================================================
       1. 工具函数
       ====================================================================== */

    /** 创建元素并批量设置属性 */
    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (key) {
                if (key === "class") node.className = attrs[key];
                else if (key === "text") node.textContent = attrs[key];
                else if (key === "html") node.innerHTML = attrs[key];
                else node.setAttribute(key, attrs[key]);
            });
        }
        (children || []).forEach(function (child) {
            node.appendChild(child);
        });
        return node;
    }

    /** 取元素，找不到时安全返回 null */
    function $(id) {
        return document.getElementById(id);
    }

    /** 将 "2024-03" 格式化为 "2024 年 3 月" */
    function formatMonth(value) {
        if (!value) return "";
        if (value === "至今" || value === "present") return "至今";
        var m = /^(\d{4})-(\d{1,2})$/.exec(value);
        if (!m) return value;
        return m[1] + " 年 " + parseInt(m[2], 10) + " 月";
    }

    /** 格式化日期为 YYYY-MM-DD */
    function formatDate(value) {
        if (!value) return "";
        var d = new Date(value);
        if (isNaN(d.getTime())) return value;
        var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
        return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    /* ----------------------------------------------------------------------
       内联 SVG 图标表（避免依赖字体导致缺字或语义错位）
       ---------------------------------------------------------------------- */
    var ICONS = {
        github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/></svg>',
        mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 9 6 9-6"/></svg>',
        chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.7L3.5 20.5l1.4-4.9A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>',
        code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 6-5 6 5 6M16 6l5 6-5 6"/></svg>',
        server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3.5" width="18" height="7" rx="2"/><rect x="3" y="13.5" width="18" height="7" rx="2"/><path d="M7 7h.01M7 17h.01"/></svg>',
        cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5 21 7v10l-9 4.5L3 17V7z"/><path d="M3 7l9 4.5L21 7M12 21.5v-10"/></svg>',
        link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 3l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21l1.5-1.5"/></svg>',
        copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 12.5 5.5 5.5L20 6.5"/></svg>'
    };

    /** 取图标 HTML；未知名称时回退为链接图标 */
    function iconHTML(name) {
        return ICONS[name] || ICONS.link;
    }

    /* ======================================================================
       2. 全局提示（Toast）
       ====================================================================== */
    var toastTimer = null;

    function showToast(text, type) {
        var box = $("toast");
        if (!box) return;

        box.textContent = text;
        box.className = "toast is-show" + (type === "error" ? " is-error" : "");

        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            box.className = "toast";
        }, 2000);
    }

    /** 复制文本到剪贴板，成功后提示 */
    function copyText(text, successTip) {
        var done = function () {
            showToast(successTip || ("已复制：" + text));
        };
        var fail = function () {
            showToast("复制失败，请手动选择文本", "error");
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done).catch(fail);
            return;
        }

        // 兜底：file:// 或非安全上下文下 Clipboard API 不可用
        try {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            var ok = document.execCommand("copy");
            document.body.removeChild(ta);
            if (ok) done();
            else fail();
        } catch (e) {
            fail();
        }
    }

    /* ======================================================================
       3. 内容渲染
       ====================================================================== */

    /* ---------- 3.1 个人经历（时间轴） ---------- */
    function renderExperiences(container, list) {
        if (!container) return;
        container.innerHTML = "";

        if (!list || !list.length) {
            container.appendChild(el("div", { class: "stateBox", text: "暂无经历记录" }));
            return;
        }

        list.forEach(function (item, index) {
            var period = formatMonth(item.start) +
                (item.end ? " — " + formatMonth(item.end) : "");

            var card = el("article", {
                class: "timelineItem reveal",
                id: "experience-" + (index + 1),
                style: "transition-delay:" + (index * 70) + "ms"
            }, [
                el("span", { class: "timelineDate", text: period }),
                el("h3", { class: "timelineRole", text: item.role || "" }),
                item.org ? el("div", { class: "timelineOrg", text: item.org }) : null,
                item.desc ? el("p", { class: "timelineDesc", text: item.desc }) : null
            ].filter(Boolean));

            container.appendChild(card);
        });

        observeReveal(container.querySelectorAll(".reveal"));
    }

    /* ---------- 3.2 技能栈 ---------- */
    function renderSkills(container, groups) {
        if (!container) return;
        container.innerHTML = "";

        if (!groups || !groups.length) {
            container.appendChild(el("div", { class: "stateBox", text: "暂无技能数据" }));
            return;
        }

        groups.forEach(function (group, gi) {
            var card = el("section", {
                class: "skillCard reveal",
                style: "transition-delay:" + (gi * 80) + "ms"
            });

            card.appendChild(el("h3", { class: "skillCardHead" }, [
                el("span", { class: "skillIcon", html: iconHTML(group.icon) }),
                el("span", { text: group.group || "" })
            ]));

            (group.items || []).forEach(function (skill) {
                var level = Math.max(0, Math.min(100, Number(skill.level) || 0));
                var fill = el("div", { class: "skillFill", "data-level": level });
                var bar = el("div", { class: "skillBar" }, [
                    el("div", { class: "skillBarTop" }, [
                        el("span", { text: skill.name || "" }),
                        el("span", { text: level + "%" })
                    ]),
                    el("div", { class: "skillTrack" }, [fill])
                ]);
                card.appendChild(bar);
            });

            container.appendChild(card);
        });

        observeReveal(container.querySelectorAll(".reveal"));
        observeSkillBars(container.querySelectorAll(".skillFill"));

        // 渲染完成后立即补一次，避免兜底定时器早于渲染
        revealInViewport();
        fillSkillBarsInViewport();
    }

    /* ---------- 3.3 作品集 ---------- */
    var allProjects = [];
    var activeCategory = "全部";

    function renderProjects(container, projects) {
        if (!container) return;

        allProjects = projects || [];
        container.innerHTML = "";

        if (!allProjects.length) {
            container.appendChild(el("div", { class: "stateBox", text: "暂无作品，敬请期待" }));
            return;
        }

        var visible = activeCategory === "全部"
            ? allProjects
            : allProjects.filter(function (p) { return p.category === activeCategory; });

        if (!visible.length) {
            container.appendChild(el("div", { class: "stateBox", text: "该分类下暂无作品" }));
            return;
        }

        visible.forEach(function (project, index) {
            // 保持原有 id 约定：portfolio-序号-字段
            var no = index + 1;

            var techNodes = (project.techStack || []).map(function (tech) {
                return el("span", { text: tech });
            });

            var meta = el("div", { class: "portfolioMeta" }, [
                el("span", { text: project.category || "未分类" }),
                project.updatedAt
                    ? el("span", { text: "更新于 " + formatDate(project.updatedAt) })
                    : el("span", { text: "" })
            ]);

            var card = el("article", {
                class: "portfolioSubDiv reveal",
                id: "portfolioSubDiv" + no,
                style: "transition-delay:" + (index * 70) + "ms"
            });

            card.appendChild(el("h3", { class: "portfolioTitle", id: "portfolio-" + no + "-Title" }, [
                el("a", {
                    href: project.link || "#",
                    target: project.link ? "_blank" : "_self",
                    rel: "noopener",
                    text: project.title || "未命名项目"
                })
            ]));

            card.appendChild(el("div", {
                class: "portfolioTechStack",
                id: "portfolio-" + no + "-TechStack"
            }, techNodes));

            card.appendChild(el("p", {
                class: "portfolioOverView",
                id: "portfolio-" + no + "-OverView",
                text: project.overview || ""
            }));

            if (project.link) {
                meta.appendChild(el("a", {
                    class: "portfolioLink",
                    href: project.link,
                    target: "_blank",
                    rel: "noopener",
                    html: "查看详情 <span aria-hidden=\"true\">→</span>"
                }));
            }

            card.appendChild(meta);
            container.appendChild(card);
        });

        observeReveal(container.querySelectorAll(".reveal"));
    }

    /** 依据作品分类生成筛选按钮 */
    function renderFilters(bar, projects) {
        if (!bar) return;
        bar.innerHTML = "";

        var categories = ["全部"];
        (projects || []).forEach(function (p) {
            if (p.category && categories.indexOf(p.category) === -1) {
                categories.push(p.category);
            }
        });

        if (categories.length <= 2) return; // 只有一类时不必显示筛选

        categories.forEach(function (name) {
            var chip = el("button", {
                class: "filterChip" + (name === activeCategory ? " is-active" : ""),
                type: "button",
                text: name
            });
            chip.addEventListener("click", function () {
                activeCategory = name;
                bar.querySelectorAll(".filterChip").forEach(function (c) {
                    c.classList.toggle("is-active", c === chip);
                });
                renderProjects($("portfolioDiv"), allProjects);
            });
            bar.appendChild(chip);
        });
    }

    /* ---------- 3.4 联系方式（含一键复制） ---------- */
    function renderContacts(container, contacts) {
        if (!container) return;
        container.innerHTML = "";

        if (!contacts || !contacts.length) {
            container.appendChild(el("div", { class: "stateBox", text: "暂无联系方式" }));
            return;
        }

        contacts.forEach(function (item, index) {
            // 外层用 div 承载卡片样式，内层 a 负责跳转，复制按钮作为兄弟节点
            // （避免 <button> 嵌套在 <a> 内造成无效的交互元素嵌套）
            var link = el("a", {
                class: "contactCardMain",
                href: item.url || "#",
                target: item.url && item.url.indexOf("mailto:") === 0 ? "_self" : "_blank",
                rel: "noopener"
            }, [
                el("span", { class: "contactIcon", html: iconHTML(item.icon) }),
                el("span", { class: "contactLabel", text: item.label || "" }),
                el("span", { class: "contactValue", text: item.value || "" })
            ]);

            var card = el("div", {
                class: "contactCard reveal",
                style: "transition-delay:" + (index * 70) + "ms"
            }, [link]);

            // 右上角「复制」按钮
            var copyBtn = el("button", {
                class: "contactCopy",
                type: "button",
                title: "复制 " + (item.value || ""),
                "aria-label": "复制 " + (item.label || "") + " 到剪贴板",
                html: iconHTML("copy")
            });
            copyBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                copyText(item.value, "已复制：" + item.value);
            });
            card.appendChild(copyBtn);

            container.appendChild(card);
        });

        observeReveal(container.querySelectorAll(".reveal"));
    }

    /** 用 owner 数据回填 Hero 区 */
    function fillHero(owner) {
        if (!owner) return;

        var name = $("heroName");
        if (name && owner.name) name.textContent = owner.name;

        var desc = $("heroDesc");
        if (desc && owner.bio) desc.textContent = owner.bio;

        var role = $("heroRole");
        if (role && owner.roles && owner.roles.length) {
            role.setAttribute("data-roles", owner.roles.join(","));
        }

        var img = document.querySelector(".profilePhotoImg");
        if (img && owner.avatar) img.setAttribute("src", owner.avatar);
        if (img && owner.name) img.setAttribute("alt", owner.name + " 的头像");

        var contact = $("personalContact");
        if (contact && owner.contacts) {
            contact.innerHTML = "";
            owner.contacts.slice(0, 3).forEach(function (item) {
                contact.appendChild(el("a", {
                    href: item.url || "#",
                    target: "_blank",
                    rel: "noopener",
                    html: "<span aria-hidden=\"true\">" + iconHTML(item.icon) + "</span> " + (item.value || "")
                }));
            });
        }
    }

    /* ======================================================================
       4. 页面交互
       ====================================================================== */

    var revealObserver = null;

    /**
     * 兜底揭示：把当前落在视口内的 .reveal 直接置为可见。
     * IntersectionObserver 在部分环境（无头浏览器、虚拟时间、预渲染）下可能不派发回调，
     * 若只依赖它，内容会永久保持 opacity:0 —— 这里作为保险，保证内容一定能显示出来。
     */
    function revealInViewport() {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var nodes = document.querySelectorAll(".reveal:not(.is-visible)");

        Array.prototype.forEach.call(nodes, function (node) {
            var rect = node.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0) {
                node.classList.add("is-visible");
            }
        });
    }

    /** 兜底填充：把当前落在视口内的技能条直接填到目标宽度。 */
    function fillSkillBarsInViewport() {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var nodes = document.querySelectorAll(".skillFill:not([data-filled])");

        Array.prototype.forEach.call(nodes, function (node) {
            var rect = node.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0) {
                node.setAttribute("data-filled", "1");
                node.style.width = (node.getAttribute("data-level") || 0) + "%";
            }
        });
    }

    /** 注册滚动进场观察器 */
    function observeReveal(nodes) {
        if (!nodes || !nodes.length) return;

        if (!("IntersectionObserver" in window)) {
            Array.prototype.forEach.call(nodes, function (n) { n.classList.add("is-visible"); });
            return;
        }

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
        }

        Array.prototype.forEach.call(nodes, function (n) { revealObserver.observe(n); });
    }

    /** 技能条进入视口后再播放填充动画 */
    function observeSkillBars(nodes) {
        if (!nodes || !nodes.length) return;

        var fill = function (node) {
            if (node.getAttribute("data-filled")) return;
            node.setAttribute("data-filled", "1");
            node.style.width = (node.getAttribute("data-level") || 0) + "%";
        };

        if (!("IntersectionObserver" in window)) {
            Array.prototype.forEach.call(nodes, fill);
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    fill(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.35 });

        Array.prototype.forEach.call(nodes, function (n) { observer.observe(n); });
    }

    /** 绑定兜底：加载后与滚动时各跑一次（时间戳节流，不用 rAF） */
    function initRevealFallback() {
        var last = 0;

        var run = function () {
            var now = Date.now();
            if (now - last < 80) return;
            last = now;
            revealInViewport();
            fillSkillBarsInViewport();
        };

        window.addEventListener("scroll", run, { passive: true });
        window.addEventListener("resize", run, { passive: true });
        window.addEventListener("load", run);

        run();
        window.setTimeout(run, 400);
        window.setTimeout(run, 1200);
    }

    /** 导航条：滚动加重 + 移动端菜单 + 当前区块高亮 */
    function initNavigation() {
        var bar = $("navigationBar");
        var toggle = $("navToggle");
        var menu = $("navigationUl");
        if (!bar) return;

        var onScroll = function () {
            bar.classList.toggle("is-scrolled", window.scrollY > 40);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                var open = menu.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });

            menu.addEventListener("click", function (e) {
                if (e.target.closest("a")) {
                    menu.classList.remove("is-open");
                    toggle.setAttribute("aria-expanded", "false");
                }
            });
        }

        var links = menu ? Array.prototype.slice.call(menu.querySelectorAll("a.navigation")) : [];
        var sections = links
            .map(function (a) {
                var href = a.getAttribute("href") || "";
                return href.charAt(0) === "#" ? document.querySelector(href) : null;
            })
            .filter(Boolean);

        if (!sections.length || !("IntersectionObserver" in window)) return;

        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a) {
                    var active = a.getAttribute("href") === "#" + entry.target.id;
                    a.classList.toggle("is-active", active);
                });
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

        sections.forEach(function (s) { spy.observe(s); });
    }

    /** Hero 打字机效果 */
    function initTypewriter() {
        var node = $("heroRole");
        if (!node) return;

        var roles = (node.getAttribute("data-roles") || "").split(",").filter(Boolean);
        if (!roles.length) return;

        node.textContent = "";
        var caret = el("span", { class: "caret", "aria-hidden": "true" });
        var textSpan = el("span");
        node.appendChild(textSpan);
        node.appendChild(caret);

        var roleIndex = 0;
        var charIndex = 0;
        var deleting = false;

        var tick = function () {
            var current = roles[roleIndex];

            if (deleting) {
                charIndex--;
            } else {
                charIndex++;
            }
            textSpan.textContent = current.slice(0, charIndex);

            var delay = deleting ? 55 : 120;

            if (!deleting && charIndex === current.length) {
                deleting = true;
                delay = 1600;
            } else if (deleting && charIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                delay = 320;
            }

            window.setTimeout(tick, delay);
        };

        window.setTimeout(tick, 500);
    }

    /** 返回顶部按钮 + 首屏滚动提示 */
    function initScrollButtons() {
        var topBtn = $("backToTop");
        if (topBtn) {
            var onScroll = function () {
                topBtn.classList.toggle("is-visible", window.scrollY > 480);
            };
            onScroll();
            window.addEventListener("scroll", onScroll, { passive: true });
            topBtn.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        var hint = $("scrollHint");
        if (hint) {
            hint.addEventListener("click", function () {
                var target = document.getElementById("experience");
                if (target) target.scrollIntoView({ behavior: "smooth" });
            });
        }
    }

    /** 页脚年份 */
    function initFooter() {
        var year = $("footerYear");
        if (year) year.textContent = String(new Date().getFullYear());
    }

    /* ======================================================================
       5. 初始化
       ====================================================================== */

    function init() {
        var data = window.SITE_DATA;

        if (!data) {
            console.error("[site] 未找到 window.SITE_DATA，请确认已引入 js/data.js");
            return;
        }

        initNavigation();
        initTypewriter();
        initScrollButtons();
        initFooter();
        initRevealFallback();

        // 首屏静态元素先注册进场动画
        observeReveal(document.querySelectorAll(".reveal"));

        var owner = data.owner || {};
        fillHero(owner);
        renderContacts($("contactGrid"), owner.contacts);

        renderExperiences($("experienceTimeline"), data.experiences);
        renderSkills($("skillGroups"), data.skills);
        renderFilters($("filterBar"), data.projects);
        renderProjects($("portfolioDiv"), data.projects);

        // 渲染完毕后统一兜一次，保证首屏内容一定可见
        revealInViewport();
        fillSkillBarsInViewport();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
