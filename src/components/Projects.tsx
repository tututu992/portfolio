import { ArrowUpRight, FolderOpen, Github } from 'lucide-react'
import { projects } from '../data/index'
import type { Project } from '../data/index'
import Reveal from './ui/Reveal'

export default function Projects() {
  return (
    <section id="projects" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            项目
          </h2>
        </Reveal>

        {projects.length === 0 ? (
          <Reveal delay={0.05}>
            <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-6 py-24 text-center dark:border-slate-700">
              <FolderOpen size={32} className="text-slate-400 dark:text-slate-500" />
              <p className="mt-4 text-[15px] text-slate-500 dark:text-slate-400">
                暂未上传项目，敬请期待
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {projects.map((project: Project, index: number) => (
              <Reveal key={project.id} delay={index * 0.06} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const { title, desc, image, tags, githubUrl, previewUrl }: Project = project

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-blue-400/50">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{desc}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag: string) => (
            <li
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          {previewUrl ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white transition-colors duration-200 ease-out hover:bg-blue-500 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300"
            >
              在线预览
              <ArrowUpRight size={13} />
            </a>
          ) : null}
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs text-slate-600 transition-colors duration-200 ease-out hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              <Github size={13} />
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
