import { Github, Mail } from 'lucide-react'
import { profile } from '../data/index'
import Reveal from './ui/Reveal'

export default function Contact() {
  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center md:py-20 dark:border-slate-800 dark:bg-slate-800/50">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              欢迎交流学习
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              无论是前端学习、AI 应用，还是一起做点有趣的小项目，都欢迎随时联系我。
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors duration-300 ease-out hover:bg-blue-500 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300"
              >
                <Mail size={16} />
                {profile.email}
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm text-slate-700 transition-colors duration-300 ease-out hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                <Github size={16} />
                GitHub
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
