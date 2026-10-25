import { motion } from 'framer-motion'
import { ArrowDown, Mail } from 'lucide-react'
import { profile } from '../data/index'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden">
      {/* 柔和渐变背景，轻微浮动 */}
      <motion.div
        aria-hidden
        className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-blue-500/25 blur-3xl dark:bg-blue-400/20"
        animate={{ y: [0, 24, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[-20%] left-[-10%] h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl dark:bg-indigo-400/10"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto w-full max-w-6xl px-6 pt-16"
      >
        <motion.p
          variants={item}
          className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400"
        >
          {profile.slogan}
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-5 text-5xl font-semibold tracking-tight text-slate-900 md:text-7xl dark:text-slate-100"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300"
        >
          {profile.bio}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors duration-300 ease-out hover:bg-blue-500 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300"
          >
            查看项目
            <ArrowDown size={16} />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm text-slate-700 transition-colors duration-300 ease-out hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
          >
            <Mail size={16} />
            联系我
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
