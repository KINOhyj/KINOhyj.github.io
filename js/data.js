/**
 * data.js —— 站点内容数据源（唯一正式数据源）
 * ---------------------------------------------------------------------------
 * 本文件就是这个网站的全部内容。想改作品集、经历、联系方式，
 * 改这里就够了，不需要动 HTML / CSS / 业务 JS。
 *
 * 纯静态站点，没有后端、没有数据库、没有网络请求 —— 数据在浏览器里直接读取。
 * 修改后刷新页面即可生效（若浏览器有缓存，按 Ctrl+F5 强刷）。
 *
 * 各字段的详细含义见项目根目录《README.md》的「内容维护指南」。
 */

window.SITE_DATA = {

    /* ======================================================================
       站主信息（驱动 Hero 区 + 联系方式区块）
       ====================================================================== */
    owner: {
        /* 姓名 / 昵称 */
        name: "胡英杰",
        /* 一句话简介，建议 40–80 字 */
        bio: "热爱把想法变成能跑起来的东西。习惯从零把一个项目从设计稿推到上线。",
        /* 头像路径（相对 static/ 目录） */
        avatar: "./src/profilePhoto.jpg",
        /* 打字机轮播的角色，建议 2–4 项，每项 ≤ 8 字 */
        roles: ["全栈开发者", "AI 狂热者", "终身学习者"],

        /* 接收留言的邮箱（留言表单的 mailto 目标） */
        contactEmail: "486689805@qq.com",

        /* 联系方式卡片。icon 可选：github | mail | chat | link */
        contacts: [
            {
                icon: "github",
                label: "GitHub",
                value: "github.com/KINOhyj",
                url: "https://github.com/KINOhyj"
            },
            {
                icon: "mail",
                label: "Email",
                value: "486689805@qq.com",
                url: "mailto:486689805@qq.com"
            },
            {
                icon: "chat",
                label: "QQ",
                value: "486689805",
                url: "https://wpa.qq.com/msgrd?v=3&uin=486689805&site=qq&menu=yes"
            }
        ]
    },

    /* ======================================================================
       个人经历（时间轴，建议按时间倒序：最新的放最前面）
       ====================================================================== */
    experiences: [
        {
            start: "2023-09",
            end: "至今",              /* 进行中填 "至今" */
            role: "本科在读 · 计算机相关专业",
            org: "某大学",             /* ← 换成你的真实学校 */
            desc: "系统学习数据结构、算法、计算机网络与操作系统，课余时间投入 Web 开发与 3D 可视化实践。"
        },
        {
            start: "2024-03",
            end: "2024-09",
            role: "前端开发实习生",
            org: "某互联网公司",        /* ← 换成你的真实公司 */
            desc: "参与企业后台管理系统的组件库开发，负责表格、表单等通用组件的封装与文档维护，沉淀了一套可复用样式规范。"
        },
        {
            start: "2025-01",
            end: "2025-06",
            role: "个人项目 · 3D 可视化方向",
            org: "独立开发",
            desc: "基于 Blender + Three.js 搭建在线模型预览方案，跑通了从建模、导出 GLB 到 Web 端渲染的完整链路。"
        }
    ],

    /* ======================================================================
       作品集
       category 会自动生成顶部的分类筛选按钮（只有一类时自动隐藏筛选栏）
       link 为空则该卡片不显示「查看详情」
       ====================================================================== */
    projects: [
        {
            title: "个人网站",
            category: "Web",
            techStack: ["HTML", "CSS", "JavaScript"],
            overview: "你正在看的这个页面。玻璃拟态风格，纯手写无框架，包含作品集动态渲染与留言表单校验。",
            link: "https://github.com/KINOhyj",
            updatedAt: "2026-10-04"
        },
        {
            title: "Blender 批量导出工具",
            category: "3D",
            techStack: ["Blender", "Python"],
            overview: "为 Blender 编写的批处理插件，支持按场景集合批量导出 GLB/FBX 并自动规范命名，减少重复劳动。",
            link: "https://github.com/KINOhyj",
            updatedAt: "2026-08-21"
        },
        {
            title: "在线模型预览器",
            category: "Web",
            techStack: ["Three.js", "Vite"],
            overview: "浏览器端 GLB 模型预览方案，支持轨道控制、材质切换与环境光预设，用于快速检查导出结果。",
            link: "https://github.com/KINOhyj",
            updatedAt: "2026-06-15"
        },
        {
            title: "数据看板组件库",
            category: "Web",
            techStack: ["Vue", "ECharts"],
            overview: "面向后台系统的图表组件集合，统一了主题变量与响应式规则，支持暗色模式一键切换。",
            link: "https://github.com/KINOhyj",
            updatedAt: "2026-03-02"
        },
        {
            title: "桌面端小工具集",
            category: "Tool",
            techStack: ["Python", "PyQt"],
            overview: "把日常重复操作打包成桌面小工具：文件批量重命名、图片压缩、剪贴板历史，一把梭。",
            link: "https://github.com/KINOhyj",
            updatedAt: "2025-12-11"
        }
    ]
};
