"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MapPin, Heart, Clock, Sparkles, Stars } from "lucide-react";

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.8, delay }}
  >
    {children}
  </motion.div>
);

function ScratchReveal({ children, coverClassName }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawCover = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const context = canvas.getContext("2d");
      context.scale(ratio, ratio);
      context.fillStyle = "#881337";
      context.fillRect(0, 0, rect.width, rect.height);
      context.fillStyle = "rgba(255, 255, 255, 0.18)";
      context.font = "bold italic 20px serif";
      context.textAlign = "center";
      context.fillText("Scratch to reveal", rect.width / 2, rect.height / 2);
    };

    drawCover();
    window.addEventListener("resize", drawCover);
    return () => window.removeEventListener("resize", drawCover);
  }, []);

  const scratch = (event) => {
    if (!drawingRef.current || revealed) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 24, 0, Math.PI * 2);
    context.fill();

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let index = 3; index < pixels.length; index += 64) {
      if (pixels[index] === 0) cleared += 1;
    }
    if (cleared / (pixels.length / 64) > 0.45) setRevealed(true);
  };

  return (
    <div className="relative h-full overflow-hidden rounded-2xl">
      {children}
      <canvas
        ref={canvasRef}
        aria-label="Scratch this card to reveal the event details"
        className={`absolute inset-0 h-full w-full touch-none cursor-crosshair transition-opacity duration-700 ${coverClassName} ${revealed ? "pointer-events-none opacity-0" : ""}`}
        onPointerDown={(event) => {
          drawingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          scratch(event);
        }}
        onPointerMove={scratch}
        onPointerUp={() => {
          drawingRef.current = false;
        }}
        onPointerCancel={() => {
          drawingRef.current = false;
        }}
      />
    </div>
  );
}

const littleThings = [
  {
    title: "Nine years of us",
    text: "A thousand ordinary moments, made extraordinary together.",
  },
  {
    title: "Our favourite place",
    text: "Anywhere life feels a little lighter because we are side by side.",
  },
  {
    title: "The next chapter",
    text: "More laughter, more adventures, and a forever full of home.",
  },
];

function LittleThings() {
  const [activeThing, setActiveThing] = useState(0);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-amber-50 to-pink-100 px-6 py-24 text-center text-stone-800">
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-300/45 blur-3xl"
        animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative mx-auto max-w-3xl">
        <FadeIn>
          <Sparkles className="mx-auto mb-5 h-7 w-7 text-rose-300" />
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-rose-500">
            A little note from us
          </p>
          <h2 className="text-4xl text-rose-950 md:text-5xl">
            The little things
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-stone-600">
            Tap a memory to uncover another piece of our story.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {littleThings.map((thing, index) => (
              <motion.button
                key={thing.title}
                type="button"
                onClick={() => setActiveThing(index)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-2xl border px-4 py-5 text-left transition-colors ${
                  activeThing === index
                    ? "border-rose-400 bg-rose-900 text-rose-50 shadow-lg shadow-rose-200"
                    : "border-rose-200 bg-white/75 text-rose-950 shadow-sm hover:bg-white"
                }`}
              >
                <span className="block text-sm italic">0{index + 1}</span>
                <span className="mt-2 block text-lg">{thing.title}</span>
              </motion.button>
            ))}
          </div>
          <motion.div
            key={activeThing}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-7 max-w-2xl text-xl italic leading-relaxed text-rose-900"
          >
            “{littleThings[activeThing].text}”
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function WeddingInvitation() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [hasRsvped, setHasRsvped] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const updateScrollPrompt = () => setIsAtTop(window.scrollY < 10);

    updateScrollPrompt();
    window.addEventListener("scroll", updateScrollPrompt, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollPrompt);
  }, []);

  const enterInvitation = () => {
    setHasEntered(true);
    audioRef.current?.play().catch(() => undefined);
  };

  return (
    <div className="bg-stone-50 text-stone-800 font-serif overflow-hidden">
      <audio ref={audioRef} loop preload="auto">
        <source src="/wedding-song.mp3" type="audio/mpeg" />
      </audio>

      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex min-h-[100svh] items-center justify-center bg-gradient-to-br from-rose-100 via-stone-50 to-amber-100 px-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Heart className="mx-auto mb-6 h-10 w-10 fill-rose-400 text-rose-400" />
              </motion.div>
              {/* <p className="mb-3 text-xs uppercase tracking-[0.35em] text-rose-600">
              Shweta & Kushal
            </p> */}
              <h2 className="text-4xl text-rose-950 md:text-5xl">
                A celebration of love
              </h2>
              {/* <p className="mt-5 text-stone-600">Tap to enter with music</p> */}
              <motion.button
                type="button"
                onClick={enterInvitation}
                animate={{ y: [0, -3, 0] }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                transition={{
                  y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                }}
                className="mt-8 min-h-12 rounded-full bg-rose-900 px-8 py-3 text-sm font-semibold tracking-wide text-rose-50 shadow-lg shadow-rose-200"
              >
                Enter our story
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <motion.div
          aria-hidden="true"
          className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl"
          animate={{ x: [0, 45, 0], y: [0, 35, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute -bottom-20 -right-16 h-80 w-80 rounded-full bg-amber-100/70 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -30, 0], scale: [1.1, 0.95, 1.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="z-10"
        >
          <p className="text-sm md:text-lg tracking-widest uppercase mb-4 text-stone-500">
            9 Years in the Making
          </p>
          <h1 className="text-6xl md:text-8xl font-light text-rose-900 mb-6 leading-[0.9] md:leading-normal">
            <span className="block md:inline">Shweta</span>
            <span className="block my-2 text-4xl italic text-rose-400 md:mx-3 md:inline md:text-6xl">
              &
            </span>
            <span className="block md:inline">Kushal</span>
          </h1>
          <motion.p
            className="text-lg md:text-xl italic text-stone-600 mb-8"
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Are tying the knot!
          </motion.p>
          <motion.div
            animate={{ opacity: isAtTop ? 1 : 0, y: isAtTop ? [0, 10, 0] : 10 }}
            transition={{
              opacity: { duration: 0.25 },
              y: { repeat: isAtTop ? Infinity : 0, duration: 2 },
            }}
            className={`mt-12 text-stone-400 ${isAtTop ? "" : "pointer-events-none"}`}
            aria-hidden={!isAtTop}
          >
            Scroll to begin
            <br />↓
          </motion.div>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-rose-50 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <motion.div
              animate={{ scale: [1, 1.16, 1] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="mx-auto text-rose-400 w-8 h-8 mb-6" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl text-rose-900 mb-8">
              Our Journey
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-stone-700">
              It started nine years ago, and every day since has been an
              adventure. Through all the seasons of life, our love has only
              grown deeper. Now, we are ready to step into our forever. We
              cannot wait to celebrate the beginning of our new chapter with the
              people who mean the most to us.
            </p>
          </FadeIn>
        </div>
      </section>

      <LittleThings />

      {/* Event Details Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <motion.h2
              className="text-4xl md:text-5xl text-center text-rose-900 mb-16"
              animate={{ letterSpacing: ["0em", "0.035em", "0em"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              The Celebration
            </motion.h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Wedding Ceremony */}
            <FadeIn delay={0.2}>
              <motion.div
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <ScratchReveal>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 text-center h-full">
                    <Calendar className="w-8 h-8 mx-auto text-rose-400 mb-4" />
                    <h3 className="text-2xl text-rose-900 mb-2">The Wedding</h3>
                    <p className="text-stone-500 mb-6">
                      Wednesday, 2nd December 2026
                    </p>
                    <div className="flex items-center justify-center text-stone-700 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>11:00 AM Onwards</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-stone-700 mt-6">
                      <MapPin className="w-4 h-4 mb-2 text-rose-400" />
                      <span className="font-medium">Larang Villa</span>
                      <span className="text-sm mt-1">Daladili Rd, Gutuwa</span>
                      <span className="text-sm">Ranchi, Jharkhand 834005</span>
                    </div>
                  </div>
                </ScratchReveal>
              </motion.div>
            </FadeIn>

            {/* Reception */}
            <FadeIn delay={0.4}>
              <motion.div
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <ScratchReveal>
                  <div className="bg-rose-900 text-rose-50 p-8 rounded-2xl shadow-sm text-center h-full">
                    <Calendar className="w-8 h-8 mx-auto text-rose-300 mb-4" />
                    <h3 className="text-2xl mb-2">The Reception</h3>
                    <p className="text-rose-200 mb-6">
                      Wednesday, 2nd December 2026
                    </p>
                    <div className="flex items-center justify-center text-rose-50 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Evening Follows</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-rose-50 mt-6">
                      <MapPin className="w-4 h-4 mb-2 text-rose-300" />
                      <span className="font-medium">Larang Villa</span>
                      <span className="text-sm text-rose-200 mt-1">
                        Daladili Rd, Gutuwa
                      </span>
                      <span className="text-sm text-rose-200">
                        Ranchi, Jharkhand 834005
                      </span>
                    </div>
                  </div>
                </ScratchReveal>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* RSVP / Footer Section */}
      <section className="py-24 bg-stone-100 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <FadeIn>
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Stars className="mx-auto mb-6 h-8 w-8 text-rose-400" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl text-stone-800 mb-4">
              Join Us in the Celebration
            </h2>
            <p className="text-lg leading-relaxed text-stone-600">
              Your presence is the loveliest gift. We cannot wait to make this
              day memorable with you.
            </p>
            <motion.button
              type="button"
              onClick={() => setHasRsvped(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`mt-8 rounded-full px-8 py-3 text-sm font-semibold tracking-wide shadow-sm transition-colors ${
                hasRsvped
                  ? "bg-emerald-700 text-white"
                  : "bg-rose-900 text-rose-50 hover:bg-rose-800"
              }`}
            >
              {hasRsvped
                ? "We are delighted you’ll be there!"
                : "Save our date"}
            </motion.button>
            {hasRsvped && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm italic text-stone-500"
              >
                2 December 2026 · Larang Villa, Ranchi
              </motion.p>
            )}
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
