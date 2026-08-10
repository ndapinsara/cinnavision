"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ScanLine, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@public/hero-cinnamon.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const HeroSection = () => {
  return (
    <section
      id="home"
      className="leaf-pattern relative overflow-hidden pt-28 pb-16 lg:pt-36"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-primary sm:text-sm"
          >
            <Sparkles className="size-4 text-accent" aria-hidden="true" />
            AI-Powered Cinnamon Agriculture
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            className="mt-6 text-4xl leading-[1.05] text-balance sm:text-5xl lg:text-6xl"
          >
            Grow Smarter.
            <br />
            Sell Better.
            <br />
            <span className="text-accent">With CinnaVision.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
            className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            AI-powered disease detection and a direct cinnamon marketplace built
            for Sri Lankan farmers and buyers. Identify crop diseases, get
            practical treatment guidance, discover live market prices, and
            connect directly with trusted buyers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="h-13 rounded-full px-7 text-base"
            >
              <a href="/register">
                Get Started
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-13 rounded-full border-primary/25 bg-card px-7 text-base"
            >
              <a href="#detection">Explore the Platform</a>
            </Button>
          </motion.div>

          <p className="mt-6 text-sm text-muted-foreground">
            Built for Sri Lankan Cinnamon Farmers &amp; Buyers
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[2rem] shadow-(--shadow-lift)">
            <Image
              src={heroImage}
              alt="Fresh Ceylon cinnamon leaves beside rolled cinnamon bark quills"
              width={1280}
              height={1600}
              loading="eager"
              className="aspect-4/5 w-full object-cover sm:aspect-square lg:aspect-4/5"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary-deep/45 via-transparent to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="glass-card absolute -left-2 top-8 w-56 rounded-2xl p-4 sm:-left-6 sm:w-64"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <ScanLine className="size-4 text-accent" aria-hidden="true" />
              AI Disease Detection
            </div>
            <p className="mt-2.5 font-display text-lg">Leaf Spot Disease</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "94.8%" }}
                transition={{ duration: 1.1, delay: 0.8, ease }}
                className="h-full rounded-full bg-accent"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              94.8% Confidence
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease }}
            className="glass-card absolute right-3 bottom-8 w-52 rounded-2xl p-4 sm:right-0 lg:-right-5 sm:w-60"
          >
            <p className="text-xs font-semibold text-primary">
              Today&apos;s Cinnamon Price
            </p>
            <p className="mt-2 font-display text-lg">Alba — LKR 4,200/kg</p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
              <TrendingUp className="size-3.5" aria-hidden="true" />
              Updated today
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
