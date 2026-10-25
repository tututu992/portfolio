import { skills } from '../data/index'
import type { Skill } from '../data/index'
import Reveal from './ui/Reveal'

// 按 category 分组，保持数据中首次出现的顺序
const categories: string[] = [...new Set(skills.map((skill: Skill) => skill.category))]

export default function Skills() {
  return (
    <section id="skills" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            技能
          </h2>
          <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
            以前端为主阵地，边学边练；工具链与 AI 应用能力也在持续补充中。
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {categories.map((category: string, index: number) => (
            <Reveal key={category} delay={index * 0.06} className="h-full">
              <div className="h-full rounded-lg border border-slate-200 bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-blue-400/50">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {category}
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {skills
                    .filter((skill: Skill) => skill.category === category)
                    .map((skill: Skill) => (
                      <li key={skill.name}>
                        <span className="inline-block cursor-default rounded-lg bg-slate-100 px-3 py-1.5 text-[13px] text-slate-600 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-400/10 dark:hover:text-blue-400">
                          {skill.name}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
