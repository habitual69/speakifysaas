import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1c3144] border-t border-[#1c3144]/20 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-[#ffba08] mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#converter"
                  className="text-white/80 hover:text-[#ffba08]"
                >
                  Try It Free
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-white/80 hover:text-[#ffba08]"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-white/80 hover:text-[#ffba08]"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-[#ffba08] mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  About Speakify
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-[#ffba08] mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Voice Samples
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-[#ffba08] mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Security
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-[#ffba08]">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/20">
          <div className="text-white/80 mb-4 md:mb-0">
            © {currentYear} Speakify. All rights reserved.
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-white/60 hover:text-[#ffba08]">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-white/60 hover:text-[#ffba08]">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="#" className="text-white/60 hover:text-[#ffba08]">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
