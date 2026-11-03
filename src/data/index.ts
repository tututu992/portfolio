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

// 在下方数组中新增项目对象即可，组件判空后展示占位提示
// 静态站点类项目放入 public/<目录>/，previewUrl 使用相对路径 ./<目录>/index.html，
// 这样在 Vercel（根路径）与 GitHub Pages（/portfolio/ 子路径）下都能正常访问
export const projects: Project[] = [
  {
    id: 'tongling-travel',
    title: '铜陵旅游指导网',
    desc: '安徽铜陵城市旅游指导网站，含首页、15 处景点大全（分类筛选 + 详情弹层）、美食特产与出行攻略四个页面，响应式布局适配移动端。',
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_16_9&prompt=panoramic%20view%20of%20Tongling%20city%20along%20the%20Yangtze%20River%20at%20golden%20sunset%2C%20bronze%20culture%20sculpture%2C%20green%20mountains%20and%20misty%20river%2C%20cinematic%20aerial%20photography',
    tags: ['HTML', 'CSS', 'JavaScript', '响应式'],
    githubUrl: 'https://github.com/tututu992/portfolio',
    previewUrl: './tongling/index.html',
  },
]
