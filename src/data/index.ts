// 站点数据统一入口：修改本文件即可更新全站内容，无需改动组件代码

export interface Profile {
  name: string
  slogan: string
  bio: string
  avatar: string
  email: string
  github: string
}

export interface Skill {
  name: string
  category: string
}

export interface Project {
  id: string
  title: string
  desc: string
  image: string
  tags: string[]
  githubUrl?: string
  previewUrl?: string
}

export const profile: Profile = {
  name: '张士扬',
  slogan: '大学生作品集',
  bio: '我是张士扬，一名在校大学生，喜欢前端开发与 AI 技术。正在系统学习中，喜欢把学到的知识做成看得见的小东西，项目会陆续整理上传到这里。',
  avatar: 'https://picsum.photos/seed/zhangshiyang/400/400',
  email: 'zhangshiyang@example.com',
  github: 'https://github.com/zhangshiyang',
}

// About 模块标签
export const aboutTags: string[] = ['前端', 'AI开发爱好者', '在校大学生']

// 技能为扁平列表：组件按 category 自动分组，新增技能只需追加一行
export const skills: Skill[] = [
  { name: 'HTML / CSS', category: '前端技术' },
  { name: 'JavaScript', category: '前端技术' },
  { name: 'TypeScript', category: '前端技术' },
  { name: 'React', category: '前端技术' },
  { name: 'Vue', category: '前端技术' },
  { name: 'Tailwind CSS', category: '前端技术' },
  { name: 'Vite', category: '前端技术' },

  { name: 'Git', category: '工具' },
  { name: 'VS Code', category: '工具' },
  { name: 'Figma', category: '工具' },

  { name: 'Node.js', category: '其他技能' },
  { name: 'AI 应用开发', category: '其他技能' },
]

// 当前暂无项目：在下方数组中新增项目对象即可，组件判空后展示占位提示
// 示例：
// {
//   id: 'my-first-project',
//   title: '我的第一个项目',
//   desc: '一句话介绍这个项目做了什么。',
//   image: 'https://picsum.photos/seed/project1/800/500',
//   tags: ['React', 'Vite'],
//   githubUrl: 'https://...',   // 可选，留空则不显示按钮
//   previewUrl: 'https://...',  // 可选，留空则不显示按钮
// },
export const projects: Project[] = []
