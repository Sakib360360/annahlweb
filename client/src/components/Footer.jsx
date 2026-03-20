export default function Footer() {
  return (
    <footer className="border-t border-white/20 bg-brand-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold">Al Nahal Academy</p>
            <p className="mt-2 text-sm text-white/70">
              A modern school rooted in Islamic values. Join our community and explore your potential.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">Quick links</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <a className="hover:text-white" href="/">
                  Home
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="/about">
                  About
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="/gallery">
                  Gallery
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="/contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">Contact</p>
            <p className="mt-3 text-sm text-white/70">140 Outer ByPass Road, Kolabagan Mor</p>
            <p className="text-sm text-white/70">Choto Boira, Khulna 9000</p>
            <p className="text-sm text-white/70">Admission: 01905-592130</p>
            <p className="text-sm text-white/70">Office: 01905-592125</p>
            <p className="text-sm text-white/70">official.annahlacademy@gmail.com</p>
          </div>
        </div>
        <div className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Al Nahal Academy.
        </div>
      </div>
    </footer>
  )
}
