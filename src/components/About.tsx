import { aboutTags, profile } from '../data/index'
import Reveal from './ui/Reveal'

export default function About() {
  return (
    <section id="about" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            关于我
          </h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-10 md:grid-cols-[240px_1fr]">
          <Reveal delay={0.05}>
            <img
              src={profile.avatar}
              alt={`${profile.name}的头像`}
              width={240}
              height={240}
              loading="lazy"
              className="aspect-square w-full max-w-60 rounded-lg border border-slate-200 object-cover shadow-sm dark:border-slate-800"
            />
          </Reveal>

          <Reveal delay={0.1}>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {profile.bio}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {aboutTags.map((tag: string) => (
                <li key={tag}>
                  <span className="inline-block cursor-default rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
