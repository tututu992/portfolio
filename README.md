# 个人作品集网站

在校大学生单页作品集，暗色为默认主题，支持明暗切换、平滑锚点滚动、滚动渐入动画。

## 技术栈

React 18 · TypeScript · Vite · Tailwind CSS v3 · Framer Motion · lucide-react · Inter（本地字体）

## 本地运行

```bash
npm install
npm run dev
```

生产构建：`npm run build`，预览构建产物：`npm run preview`。

## 修改内容

个人信息、技能分组、项目列表全部在 `src/data/index.ts`，修改数据即可，无需改动任何组件代码。

### 新增项目

当前项目区为占位状态（暂未上传项目，敬请期待）。在 `src/data/index.ts` 的 `projects` 数组中追加项目对象即可，卡片布局与 hover 样式会自动生效：

```ts
export const projects: Project[] = [
  {
    id: 'my-first-project',        // 唯一标识，用于 React key
    title: '我的第一个项目',
    desc: '一句话项目简介',
    image: '/images/cover.jpg',    // 封面图放 public/images 下，加载失败自动回退占位
    tags: ['React', 'Vite'],       // 技术栈标签
    githubUrl: 'https://...',      // 可选，留空则不显示按钮
    previewUrl: 'https://...',     // 可选，留空则不显示按钮
  },
]
```

## 目录结构

```
public/
  favicon.svg            站点图标
src/
  components/            Navbar / Hero / About / Skills / Projects / Contact / Footer（.tsx）
  data/index.ts          个人信息、技能与项目数据（唯一内容入口）
  hooks/useTheme.ts      主题切换与持久化
```
