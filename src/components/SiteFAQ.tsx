'use client';

import { useState } from 'react';
import { FAQ } from '../types/site';
import { Card, CardContent, CardHeader } from './ui/card';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface FAQProps {
  faqs: FAQ[];
  variant?: 'default' | 'redesign';
}

export default function SiteFAQ({ faqs, variant = 'default' }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const contentVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.25,
          delay: 0.15
        }
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: {
          duration: 0.3
        },
        opacity: {
          duration: 0.25
        }
      }
    }
  };

  const processAnswer = (answer: string) => {
    return answer.replace(/\\n/g, '\n');
  };

  // Redesign variant - accordion cards
  if (variant === 'redesign') {
    return (
      <motion.div
        className="max-w-3xl space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={cn(
              "bg-[#ffffff] rounded-xl border transition-all duration-200",
              openIndex === index
                ? "border-[#003b93] shadow-md"
                : "border-[#c3c6d6]/20 hover:shadow-lg"
            )}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex justify-between items-start gap-4 p-5 text-left"
            >
              <span className={cn(
                "font-label font-semibold transition-colors duration-200",
                openIndex === index ? "text-[#003b93]" : "text-[#1b1c1c]"
              )}>
                {faq.question}
              </span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  openIndex === index ? "text-[#003b93]" : "text-[#737785]"
                )} />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0">
                    <div className="prose max-w-none font-body text-[#434653]">
                      <ReactMarkdown
                        className="[&>p]:mb-4 [&>p]:leading-relaxed [&>h1]:mb-4 [&>h2]:mb-3 [&>h3]:mb-3 [&>ul]:mb-4 [&>ol]:mb-4 [&>ul]:space-y-2 [&>ol]:space-y-2"
                      >
                        {processAnswer(faq.answer)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <Card className="overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm border border-border">
      <CardHeader className="space-y-1 pb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="text-sm text-muted-foreground"
        >
          Discover key insights about this historical site&apos;s significance, excavation history, and archaeological findings
        </motion.p>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={cn(
                "rounded-xl border border-border",
                "transition-all duration-200",
                "hover:bg-accent/50 hover:border-accent",
                openIndex === index && "bg-accent/30 border-accent"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <span className={cn(
                  "font-medium transition-colors duration-200",
                  openIndex === index ? "text-primary" : "text-foreground",
                  "hover:text-primary"
                )}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-full p-1 transition-colors duration-200",
                    openIndex === index ? "bg-secondary" : "bg-secondary/50",
                    "hover:bg-secondary"
                  )}
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    openIndex === index ? "text-primary" : "text-muted-foreground"
                  )} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 prose max-w-none">
                      <ReactMarkdown
                        className="text-muted-foreground [&>p]:mb-6 [&>p]:leading-relaxed [&>h1]:mb-6 [&>h2]:mb-4 [&>h3]:mb-4 [&>ul]:mb-6 [&>ol]:mb-6 [&>ul]:space-y-2 [&>ol]:space-y-2"
                      >
                        {processAnswer(faq.answer)}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}