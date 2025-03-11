import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  CheckCircle2,
  Headphones,
  Mic,
  Shield,
  Volume2,
  Zap,
} from "lucide-react";
import { createClient } from "../../supabase/server";
import TextToSpeechConverter from "@/components/text-to-speech-converter";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Dynamic background with animated elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c3144] via-[#0c1824] to-[#1c3144] dark:from-[#0c1824] dark:via-[#1c3144] dark:to-[#0c1824] -z-10"></div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full mix-blend-screen animate-float"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                background:
                  i % 3 === 0 ? "#ffba08" : i % 3 === 1 ? "#d00000" : "#ffffff",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animationDuration: `${Math.random() * 10 + 15}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Vibrant color orbs */}
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-10 w-96 h-96 bg-[#ffba08] rounded-full filter blur-[100px] opacity-20 animate-pulse"
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-[#d00000] rounded-full filter blur-[100px] opacity-20 animate-pulse"
            style={{ animationDuration: "10s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#3a86ff] rounded-full filter blur-[120px] opacity-10 animate-pulse"
            style={{ animationDuration: "12s" }}
          ></div>
        </div>

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>

        {/* Animated sound waves */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-full max-w-6xl h-40 flex items-center justify-center gap-1">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-1 bg-[#ffba08] rounded-full animate-pulse"
                style={{
                  height: `${Math.sin(i * 0.2) * 50 + 20}px`,
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${0.8 + Math.random() * 1}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#ffba08] to-[#d00000] rounded-full text-sm font-medium mb-6 text-white shadow-lg">
                AI-Powered Text-to-Speech
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8 text-white">
                <div className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#ffba08] via-[#ff9e00] to-[#d00000]">
                    Speakify
                  </span>
                  <div className="absolute -inset-1 blur-xl bg-gradient-to-r from-[#ffba08]/30 to-[#d00000]/30 z-0"></div>
                </div>{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">Your Text</span>
                  <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#ffba08] opacity-70 rounded-full blur-sm"></div>
                  <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-[#ffba08]"></div>
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed drop-shadow-md">
                Transform your text into natural-sounding speech with our
                advanced AI voices. Try it free, no login required.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
                <a
                  href="#converter"
                  className="group px-8 py-4 bg-gradient-to-r from-[#ffba08] to-[#ff9500] text-[#1c3144] rounded-xl font-medium hover:from-[#ffba08] hover:to-[#ffba08] transition-all duration-300 shadow-lg shadow-[#ffba08]/30 flex items-center justify-center relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#ffba08] to-[#ff9500] transition-all duration-300 transform group-hover:scale-[1.05] group-hover:opacity-90"></span>
                  <span className="relative flex items-center z-10">
                    <Volume2 className="w-5 h-5 mr-2" />
                    Try It Free
                  </span>
                </a>
                <a
                  href="/sign-up"
                  className="group px-8 py-4 bg-white/10 text-white border border-white/30 backdrop-blur-md rounded-xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#d00000]/20 to-[#d00000]/10 transition-all duration-500 transform group-hover:w-full"></span>
                  <span className="relative z-10">Sign Up</span>
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-14 flex flex-wrap justify-center md:justify-start gap-6 items-center">
                <div className="text-white/70 text-sm font-medium">
                  Trusted by:
                </div>
                {["Google", "Microsoft", "Adobe", "Spotify"].map((company) => (
                  <div
                    key={company}
                    className="text-white/90 font-semibold text-sm bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10"
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 transform transition-transform hover:scale-[1.02] duration-500">
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#ffba08] to-[#ff9500] text-[#1c3144] text-sm px-4 py-1.5 rounded-full font-medium shadow-lg">
                  Free Trial
                </div>
                <div className="flex items-center justify-center h-64 bg-gradient-to-r from-[#1c3144]/70 via-[#0c1824]/60 to-[#1c3144]/70 rounded-xl mb-6 overflow-hidden relative">
                  {/* Animated waveform */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-20 flex items-end justify-center gap-1">
                      {[...Array(30)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-[#ffba08] to-[#d00000] rounded-full animate-pulse"
                          style={{
                            height: `${Math.sin(i * 0.3) * 40 + 20}px`,
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: `${0.8 + Math.random() * 1}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="relative z-10 bg-[#ffba08] p-6 rounded-full shadow-[0_0_30px_rgba(255,186,8,0.5)] animate-pulse"
                    style={{ animationDuration: "3s" }}
                  >
                    <Volume2 className="w-16 h-16 text-[#1c3144]" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    Natural AI Voices
                  </h3>
                  <p className="text-white/70 mb-6">
                    Convert up to 10,000 tokens for free
                  </p>
                  <div className="flex justify-between items-center bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
                    <div className="text-white/80 text-sm font-medium">
                      Voice samples:
                    </div>
                    <div className="flex gap-2">
                      {["Emma", "Michael", "Olivia"].map((voice, index) => (
                        <button
                          key={voice}
                          className={`px-3 py-1.5 text-xs ${index === 0 ? "bg-gradient-to-r from-[#ffba08]/80 to-[#ffba08]/60" : "bg-white/10 hover:bg-white/20"} text-white rounded-md transition-all duration-300 hover:shadow-md`}
                        >
                          {voice}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Converter Section */}
      <section id="converter" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Try Speakify Now</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Convert your text to speech instantly with our free tool
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <TextToSpeechConverter isLoggedIn={!!user} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Speakify</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're revolutionizing text-to-speech with cutting-edge AI
              technology and natural-sounding voices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Lightning Fast",
                description: "Convert text to speech in seconds",
              },
              {
                icon: <Mic className="w-6 h-6" />,
                title: "Natural Voices",
                description: "Lifelike AI voices in multiple languages",
              },
              {
                icon: <Headphones className="w-6 h-6" />,
                title: "High Quality Audio",
                description: "Crystal clear audio output",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure & Private",
                description: "Your text is never stored or shared",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-secondary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start for free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 max-w-4xl mx-auto gap-8">
            {/* Free Plan */}
            <div className="border border-border rounded-xl p-8 bg-card hover:shadow-md transition-shadow">
              <div className="mb-4">
                <span className="text-sm font-medium text-foreground bg-muted px-3 py-1 rounded-full">
                  Free
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
              <div className="text-4xl font-bold mb-6">
                $0
                <span className="text-muted-foreground text-base font-normal">
                  /month
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>10,000 tokens per month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Standard voice options</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Download MP3 files</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>No credit card required</span>
                </li>
              </ul>
              <a
                href="/sign-up"
                className="block text-center px-6 py-3 border border-secondary text-foreground rounded-lg hover:bg-secondary/10 transition-colors w-full"
              >
                Get Started
              </a>
            </div>

            {/* Premium Plan */}
            <div className="border-2 border-secondary rounded-xl p-8 bg-card shadow-lg relative">
              <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">
                Popular
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-foreground bg-muted px-3 py-1 rounded-full">
                  Premium
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Unlimited</h3>
              <div className="text-4xl font-bold mb-6">
                $5
                <span className="text-muted-foreground text-base font-normal">
                  /month
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>
                    <strong>Unlimited</strong> tokens
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Premium voice options</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Conversion history</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </li>
              </ul>
              <a
                href="/sign-up"
                className="block text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">AI Voices</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10M+</div>
              <div className="text-primary-foreground/80">Words Converted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-primary-foreground/80">
                Uptime Guaranteed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Speakify Your Content?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of content creators, educators, and businesses who
            trust Speakify.
          </p>
          <a
            href="#converter"
            className="inline-flex items-center px-6 py-3 text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try It Free
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
