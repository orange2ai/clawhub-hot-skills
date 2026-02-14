#!/bin/bash
# ClawHub 热门 Skills 抓取脚本

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR"
HTML_FILE="$DATA_DIR/index.html"
DATA_FILE="$DATA_DIR/skills-data.json"
HISTORY_FILE="$DATA_DIR/history.jsonl"

# 创建数据目录
mkdir -p "$DATA_DIR"

# 获取当前时间戳
TIMESTAMP=$(date +%s)
DATE=$(date "+%Y-%m-%d %H:%M:%S")

echo "🔍 正在抓取 ClawHub 热门 Skills..."

# 使用 clawhub CLI 搜索（获取热门）
SEARCH_TERMS=("automation" "productivity" "ai" "coding" "discord" "telegram" "github" "notion" "obsidian" "calendar")

# 临时文件存储所有结果
TEMP_RESULTS="/tmp/clawhub_results_$TIMESTAMP.txt"
> "$TEMP_RESULTS"

for term in "${SEARCH_TERMS[@]}"; do
    echo "  搜索: $term"
    clawhub search "$term" 2>/dev/null | grep -E "^[a-z0-9-]+ v[0-9]" >> "$TEMP_RESULTS" || true
done

# 去重并统计
sort "$TEMP_RESULTS" | uniq -c | sort -rn > "$TEMP_RESULTS.sorted"

# 提取前20个热门 skills
echo "📊 提取热门 Skills..."

# 读取历史数据
if [ -f "$DATA_FILE" ]; then
    PREVIOUS_SKILLS=$(cat "$DATA_FILE")
else
    PREVIOUS_SKILLS="[]"
fi

# 生成新的 JSON 数据（使用 jq 或纯 bash）
echo "{" > "$DATA_FILE"
echo "  \"updated_at\": \"$DATE\"," >> "$DATA_FILE"
echo "  \"timestamp\": $TIMESTAMP," >> "$DATA_FILE"
echo "  \"skills\": [" >> "$DATA_FILE"

FIRST=true
while IFS= read -r line; do
    if [ -z "$line" ]; then continue; fi
    
    # 提取计数和 skill 信息
    COUNT=$(echo "$line" | awk '{print $1}')
    SKILL_NAME=$(echo "$line" | awk '{print $2}')
    VERSION=$(echo "$line" | awk '{print $3}')
    
    if [ -z "$SKILL_NAME" ]; then continue; fi
    
    # 检查是否是新增
    IS_NEW="false"
    if ! echo "$PREVIOUS_SKILLS" | grep -q "\"name\": \"$SKILL_NAME\""; then
        IS_NEW="true"
    fi
    
    # 写入 JSON
    if [ "$FIRST" = false ]; then
        echo "," >> "$DATA_FILE"
    fi
    FIRST=false
    
    echo -n "    {\"name\": \"$SKILL_NAME\", \"version\": \"$VERSION\", \"heat_score\": $COUNT, \"is_new\": $IS_NEW, \"url\": \"https://clawhub.ai/$SKILL_NAME\"}" >> "$DATA_FILE"

done < <(head -20 "$TEMP_RESULTS.sorted")

echo "" >> "$DATA_FILE"
echo "  ]" >> "$DATA_FILE"
echo "}" >> "$DATA_FILE"

# 记录到历史
SKILL_COUNT=$(grep -c "\"name\":" "$DATA_FILE" || echo "0")
echo "{\"timestamp\": $TIMESTAMP, \"date\": \"$DATE\", \"count\": $SKILL_COUNT}" >> "$HISTORY_FILE"

# 清理临时文件
rm -f "$TEMP_RESULTS" "$TEMP_RESULTS.sorted"

echo "✅ 数据已更新: $DATA_FILE"
echo "📝 历史记录: $HISTORY_FILE"

# 生成 HTML
echo "🎨 生成 HTML 页面..."
cd "$SCRIPT_DIR" && node generate-html.js

echo "🎉 完成！访问: file://$HTML_FILE"
