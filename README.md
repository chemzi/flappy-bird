# Flappy Bird 🐤

一个用原生 HTML5 Canvas + JavaScript 实现的 Flappy Bird 小游戏，无需任何依赖，直接用浏览器打开即可游玩。

## 玩法

- 点击鼠标 / 触摸屏幕 / 按 `空格` 或 `↑` 让小鸟向上拍翅膀
- 穿过管道之间的缝隙得分
- 撞到管道或地面即游戏结束
- 最高分记录保存在浏览器 `localStorage` 中

## 运行

直接用浏览器打开 `index.html` 即可：

```bash
# 方式一：直接双击 index.html

# 方式二：本地起一个静态服务器
npx serve .
```

## 文件说明

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面结构与入口 |
| `style.css` | 样式 |
| `game.js` | 游戏逻辑（物理、碰撞、渲染） |

## 许可证

MIT
