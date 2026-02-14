const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'skills-data.json');
const HTML_FILE = path.join(__dirname, 'index.html');
const HISTORY_FILE = path.join(__dirname, 'history.jsonl');

// 读取数据
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// 读取历史记录
let history = [];
if (fs.existsSync(HISTORY_FILE)) {
    try {
        history = fs.readFileSync(HISTORY_FILE, 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    console.warn('跳过无效的历史记录行:', line);
                    return null;
                }
            })
            .filter(item => item !== null)
            .slice(-30); // 保留最近30条
    } catch (e) {
        console.warn('读取历史记录失败:', e.message);
        history = [];
    }
}

// 统计新增数量
const newSkillsCount = data.skills.filter(s => s.is_new).length;

// 生成 HTML
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClawHub 热门 Skills 追踪器 🔥</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header .subtitle {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9em;
            color: #7f8c8d;
        }
        
        .update-time {
            text-align: center;
            padding: 15px;
            background: #fff3cd;
            color: #856404;
            font-size: 0.95em;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            padding: 30px;
        }
        
        .skill-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
        }
        
        .skill-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
            border-color: #667eea;
        }
        
        .skill-card.new {
            border-left: 5px solid #27ae60;
            background: linear-gradient(to right, #e8f5e9 0%, white 10%);
        }
        
        .new-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #27ae60;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: bold;
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .skill-name {
            font-size: 1.3em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
            word-break: break-word;
        }
        
        .skill-version {
            font-size: 0.9em;
            color: #7f8c8d;
            margin-bottom: 12px;
        }
        
        .skill-heat {
            display: inline-block;
            background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        
        .skill-link {
            display: inline-block;
            margin-top: 10px;
            color: #667eea;
            text-decoration: none;
            font-size: 0.85em;
            transition: color 0.3s;
        }
        
        .skill-link:hover {
            color: #764ba2;
            text-decoration: underline;
        }
        
        .chart-container {
            padding: 30px;
            background: #f8f9fa;
        }
        
        .chart-title {
            font-size: 1.5em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .history-chart {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .refresh-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 1em;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        }
        
        .refresh-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 24px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔥 ClawHub 热门 Skills 追踪器</h1>
            <div class="subtitle">实时追踪最热门的 Agent Skills</div>
        </div>
        
        <div class="update-time">
            ⏰ 最后更新: ${data.updated_at} | 🆕 今日新增: ${newSkillsCount} 个
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${data.skills.length}</div>
                <div class="stat-label">热门 Skills</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${newSkillsCount}</div>
                <div class="stat-label">今日新增</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${history.length}</div>
                <div class="stat-label">历史记录</div>
            </div>
        </div>
        
        <div class="skills-grid">
            ${data.skills.map((skill, index) => `
                <div class="skill-card ${skill.is_new ? 'new' : ''}" onclick="window.open('${skill.url}', '_blank')">
                    ${skill.is_new ? '<div class="new-badge">🆕 NEW</div>' : ''}
                    <div class="skill-name">#${index + 1} ${skill.name}</div>
                    <div class="skill-version">${skill.version}</div>
                    <div class="skill-heat">🔥 热度: ${skill.heat_score}</div>
                    <a href="${skill.url}" class="skill-link" target="_blank" onclick="event.stopPropagation()">
                        查看详情 →
                    </a>
                </div>
            `).join('')}
        </div>
        
        ${history.length > 0 ? `
        <div class="chart-container">
            <div class="chart-title">📈 历史趋势</div>
            <div class="history-chart">
                ${history.map(h => `
                    <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                        <strong>${h.date}</strong> - 追踪了 ${h.count} 个 skills
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </div>
    
    <button class="refresh-btn" onclick="location.reload()">🔄 刷新数据</button>
    
    <script>
        // 自动刷新（每5分钟）
        setTimeout(() => location.reload(), 5 * 60 * 1000);
        
        console.log('ClawHub Skills Tracker loaded!');
        console.log('Total skills:', ${data.skills.length});
        console.log('New skills:', ${newSkillsCount});
    </script>
</body>
</html>`;

fs.writeFileSync(HTML_FILE, html, 'utf8');
console.log('✅ HTML 已生成:', HTML_FILE);
