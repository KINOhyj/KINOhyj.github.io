/**
 * email.js —— 留言页交互逻辑
 * ---------------------------------------------------------------------------
 * 纯静态站点，没有后端。留言通过 mailto: 协议唤起访客的邮件客户端发送，
 * 也就是说：访客填完表单点「发送」，会打开他自己的邮件软件，收件人、主题、
 * 正文都已经自动填好，他只需点一下「发送」。
 *
 * 这样零后端、零注册、零第三方依赖，留言也能真正送达。
 *
 * 职责：表单实时校验、字数统计、mailto 拼装与唤起、复制邮箱、移动端导航菜单。
 */
(function () {
    "use strict";

    function $(id) {
        return document.getElementById(id);
    }

    /* 全局提示 */
    var toastTimer = null;
    function showToast(text, type) {
        var box = $("toast");
        if (!box) return;
        box.textContent = text;
        box.className = "toast is-show" + (type === "error" ? " is-error" : "");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () { box.className = "toast"; }, 2000);
    }

    function copyText(text) {
        var done = function () { showToast("已复制：" + text); };
        var fail = function () { showToast("复制失败，请手动选择文本", "error"); };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done).catch(fail);
            return;
        }
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
            if (ok) done(); else fail();
        } catch (e) {
            fail();
        }
    }

    /* 收件邮箱：优先读 js/data.js 里的 owner.contactEmail */
    function getOwnerEmail() {
        var data = window.SITE_DATA;
        if (data && data.owner && data.owner.contactEmail) return data.owner.contactEmail;
        return "486689805@qq.com";
    }

    /* ======================================================================
       1. 校验规则
       ====================================================================== */
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = {
        name: function (v) {
            if (!v.trim()) return "请填写你的称呼";
            if (v.trim().length > 30) return "称呼不能超过 30 个字";
            return "";
        },
        email: function (v) {
            if (!v.trim()) return "请填写邮箱";
            if (!EMAIL_RE.test(v.trim())) return "邮箱格式不正确，请检查";
            return "";
        },
        subject: function (v) {
            if (!v.trim()) return "请填写主题";
            if (v.trim().length > 60) return "主题不能超过 60 个字";
            return "";
        },
        message: function (v) {
            if (!v.trim()) return "请填写留言内容";
            if (v.trim().length < 10) return "留言内容不少于 10 个字";
            if (v.trim().length > 500) return "留言内容不能超过 500 个字";
            return "";
        }
    };

    var fieldMap = {
        name: { input: "inputName", field: "fieldName", error: "errorName" },
        email: { input: "inputEmail", field: "fieldEmail", error: "errorEmail" },
        subject: { input: "inputSubject", field: "fieldSubject", error: "errorSubject" },
        message: { input: "inputMessage", field: "fieldMessage", error: "errorMessage" }
    };

    function validateField(key) {
        var map = fieldMap[key];
        var input = $(map.input);
        var wrap = $(map.field);
        var errBox = $(map.error);
        if (!input || !wrap) return true;

        var msg = rules[key](input.value);
        wrap.classList.toggle("has-error", !!msg);
        if (errBox && msg) errBox.textContent = msg;
        return !msg;
    }

    function validateAll() {
        return Object.keys(rules).map(validateField).every(Boolean);
    }

    /* ======================================================================
       2. 提示条
       ====================================================================== */
    function showAlert(type, text) {
        var box = $("formAlert");
        if (!box) return;
        box.className = "formAlert is-show " + (type === "success" ? "is-success" : "is-error");
        box.textContent = (type === "success" ? "✓ " : "! ") + text;
    }

    function hideAlert() {
        var box = $("formAlert");
        if (box) box.className = "formAlert";
    }

    /* ======================================================================
       3. 提交：拼装 mailto 并唤起邮件客户端
       ====================================================================== */
    function collectData() {
        return {
            name: $("inputName").value.trim(),
            email: $("inputEmail").value.trim(),
            subject: $("inputSubject").value.trim(),
            message: $("inputMessage").value.trim()
        };
    }

    /** 把表单内容拼成 mailto: 链接 */
    function buildMailto(to, data) {
        var subject = "[网站留言] " + data.subject;
        var body = [
            "称呼：" + data.name,
            "邮箱：" + data.email,
            "",
            "留言内容：",
            data.message,
            "",
            "—— 来自个人网站留言页"
        ].join("\n");

        return "mailto:" + to +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body);
    }

    function initForm() {
        var form = $("messageForm");
        if (!form) return;

        var textarea = $("inputMessage");
        var counter = $("charCount");

        /* —— 实时字数统计 —— */
        function updateCount() {
            if (!textarea || !counter) return;
            var len = textarea.value.length;
            counter.textContent = len + " / 500";
            counter.classList.toggle("is-warn", len > 450);
        }
        if (textarea) {
            textarea.addEventListener("input", updateCount);
            updateCount();
        }

        /* —— 失焦时校验，输入时清除错误 —— */
        Object.keys(fieldMap).forEach(function (key) {
            var input = $(fieldMap[key].input);
            if (!input) return;

            input.addEventListener("blur", function () {
                if (input.value.trim()) validateField(key);
            });

            input.addEventListener("input", function () {
                var wrap = $(fieldMap[key].field);
                if (wrap && wrap.classList.contains("has-error")) validateField(key);
                hideAlert();
            });
        });

        /* —— 提交 —— */
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            hideAlert();

            if (!validateAll()) {
                showAlert("error", "表单还有几处需要修正，请检查标红的字段。");
                var firstError = form.querySelector(".field.has-error input, .field.has-error textarea");
                if (firstError) firstError.focus();
                return;
            }

            var data = collectData();
            var to = getOwnerEmail();
            var href = buildMailto(to, data);

            // 唤起系统默认邮件客户端
            window.location.href = href;

            showAlert("success",
                "已为你打开邮件客户端，收件人 " + to + "，内容已自动填好，点一下「发送」即可。");

            // 兜底提示：若设备没有配置邮件客户端，mailto 会静默失败
            window.setTimeout(function () {
                showToast("没弹出邮件窗口？点下方链接复制邮箱直接联系我", "error");
            }, 2500);
        });
    }

    /* ======================================================================
       4. 复制邮箱 / 移动端导航
       ====================================================================== */
    function initCopyEmail() {
        var btn = $("copyEmailBtn");
        if (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                copyText(getOwnerEmail());
            });
        }
    }

    function initNavigation() {
        var bar = $("navigationBar");
        var toggle = $("navToggle");
        var menu = $("navigationUl");

        if (bar) {
            var onScroll = function () {
                bar.classList.toggle("is-scrolled", window.scrollY > 40);
            };
            onScroll();
            window.addEventListener("scroll", onScroll, { passive: true });
        }

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                var open = menu.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }
    }

    /* ======================================================================
       5. 初始化
       ====================================================================== */
    function init() {
        initNavigation();
        initForm();
        initCopyEmail();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
