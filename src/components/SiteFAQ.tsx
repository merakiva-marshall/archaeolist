'use client';

import { useState } from 'react';
import { FAQ } from '../types/site';
import { Card, CardContent, CardHeader } from './ui/card';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FAQProps {
  faqs: FAQ[];
}

export default function SiteFAQ({ faqs }: FAQProps) {
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

  return (
    <Card className="overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm border border-border">
      <CardHeader className="space-y-1 pb-8">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-primary"
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
                      {faq.answer.split('\\n').map((paragraph, i) => (
                        <motion.p 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-muted-foreground leading-relaxed mb-3 last:mb-0"
                        >
                          {paragraph}
                        </motion.p>
                      ))}
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
