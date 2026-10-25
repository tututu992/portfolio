import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { profile } from '../data/index'
import { useTheme } from '../hooks/useTheme'

interface NavLink {
  id: string
  label: string
}

const navLinks: NavLink[] = [
  { id: 'home', label: '首页' },
  { id: 'about', label: '关于' },
  { id: 'skills', label: '技能' },
  { id: 'projects', label: '项目' },
  { id: 'contact', label: '联系' },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [scrolled, setScrolled] = useState<boolean>(false)

  useEffect((): (() => void) => {
    const onScroll = (): void => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return (): void => window.removeEventListener('scroll', onScroll)
  }, [])

  // 移动端菜单展开时锁定页面滚动
  useEffect((): (() => void) => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return (): void => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = (): void => setMenuOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        scrolled || menuOpen
          ? 'border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#home"
          onClick={closeMenu}
          className="flex items-baseline gap-1.5 text-[15px] font-semibold tracking-tight text-slate-900 transition-colors duration-200 dark:text-slate-100"
        >
          {profile.name}
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
        </a>

        {/* 桌面端导航 */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="主导航">
          {navLinks.map((link: NavLink) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-sm text-slate-600 transition-colors duration-200 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
            >
              {link.label}
            </a>
          ))}
          <ThemeButton theme={theme} onToggle={toggleTheme} />
        </nav>

        {/* 移动端操作区 */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeButton theme={theme} onToggle={toggleTheme} />
          <button
            type="button"
            onClick={(): void => setMenuOpen((open: boolean) => !open)}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors duration-200 hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 移动端折叠菜单 */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            key="mobile-menu"
            aria-label="移动端导航"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-900"
          >
            <ul className="mx-auto flex max-w-6xl flex-col px-6 py-3">
              {navLinks.map((link: NavLink) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={closeMenu}
                    className="block rounded-lg px-3 py-3 text-[15px] text-slate-700 transition-colors duration-200 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

interface ThemeButtonProps {
  theme: 'dark' | 'light'
  onToggle: () => void
}

function ThemeButton({ theme, onToggle }: ThemeButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors duration-200 hover:bg-slate-200/60 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="inline-flex"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
