# ClawHub 热门 Skills 追踪器 🔥

实时追踪 ClawHub 上最热门的 Agent Skills，每天自动更新。

## 功能特性

- 📊 **实时热度排名** - 基于搜索频率统计
- 🆕 **新增 Skills 高亮** - 自动识别每天新上榜的 skills
- 📈 **历史趋势图表** - 追踪热度变化
- 🔄 **每日自动更新** - 每天早上 9:00 自动抓取
- 🎨 **精美界面** - 响应式设计，支持移动端

## 在线访问

🌐 **[查看实时追踪页面](https://orange-ai.github.io/clawhub-hot-skills/)**

## 本地运行

```bash
# 克隆仓库
git clone https://github.com/orange-ai/clawhub-hot-skills.git
cd clawhub-hot-skills

# 运行抓取脚本
bash fetch-skills.sh

# 打开网页
open index.html
```

## 自动化部署

本项目使用 GitHub Actions 每天自动抓取并更新数据。

## 技术栈

- Shell Script - 数据抓取
- Node.js - HTML 生成
- GitHub Pages - 静态托管
- GitHub Actions - 自动化部署

## 数据来源

数据来自 [ClawHub](https://clawhub.ai/) - OpenClaw Agent Skills 市场

## License

MIT

---

Made with 🍊 by orangebot
