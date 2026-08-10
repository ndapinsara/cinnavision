import { ArrowRight, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

const quickQuestions = [
  "How often should I fertilize?",
  "How can I control pests?",
  "When should I prune cinnamon?",
  "How can I improve soil health?",
];

const AIAssistantPreview = () => {
  return (
    <section
      id="assistant"
      className="relative scroll-mt-20 overflow-hidden bg-primary-deep py-20 text-primary-foreground sm:py-24"
    >
      <div className="leaf-pattern pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-accent-soft uppercase">
            AI Assistant
          </p>
          <h2 className="text-3xl leading-[1.1] text-balance sm:text-4xl lg:text-[2.75rem]">
            Your AI Agriculture Assistant
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
            Get instant guidance for everyday cinnamon farming challenges.
          </p>

          <ul className="mt-7 flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <li
                key={q}
                className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-2 text-sm text-primary-foreground/85"
              >
                {q}
              </li>
            ))}
          </ul>

          <Button
            asChild
            size="lg"
            className="mt-8 h-13 rounded-full bg-accent px-7 text-base text-accent-foreground hover:bg-accent/90"
          >
            <a href="/register">
              Ask the AI Assistant
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-[2rem] border border-primary-foreground/15 bg-primary-foreground/8 p-4 backdrop-blur-md sm:p-6">
            <div className="flex items-center gap-2 border-b border-primary-foreground/15 pb-4">
              <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold">
                CinnaVision Assistant
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="flex items-start justify-end gap-2.5">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary-foreground px-4 py-3 text-sm leading-relaxed text-primary-deep">
                  My cinnamon leaves have small dark spots. What should I do?
                </p>
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-primary-foreground/15">
                  <User className="size-4" aria-hidden="true" />
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Bot className="size-4" aria-hidden="true" />
                </span>
                <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-primary-foreground/12 px-4 py-3 text-sm leading-relaxed text-primary-foreground/90">
                  This may be related to leaf spot disease. Check affected
                  leaves and improve air circulation. You can also review the
                  recommended organic and chemical treatment options in the
                  disease detection report.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AIAssistantPreview;
