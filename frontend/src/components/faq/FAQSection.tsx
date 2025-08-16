import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What makes NyxUSD different from Djed?",
    answer: "NyxUSD offers 125% collateralization vs Djed's 400-800%, providing 3x more capital efficiency. We also feature user-defined interest rates, allowing you to set your own borrowing terms based on risk tolerance."
  },
  {
    question: "How does the three-phase architecture work?",
    answer: "Phase 1: Cardano mainnet for security and CDP creation. Phase 2: Vector L2 for performance enhancements. Phase 3: Nexus EVM for cross-chain yield access. Each phase builds progressively on the previous one."
  },
  {
    question: "What is the TEE Oracle and why is it important?",
    answer: "Our Trusted Execution Environment (TEE) oracle uses Intel SGX hardware to provide cryptographically secured price feeds. This makes price manipulation virtually impossible, with Charli3/Orcfax as fallback oracles."
  },
  {
    question: "How does the community launch work?",
    answer: "We're launching NYX tokens via SundaeSwap TasteTest for maximum fairness. 70% of tokens go directly to the community, with no VC allocations or special deals. This ensures true decentralization from day one."
  },
  {
    question: "When will AI features be available?",
    answer: "AI features including natural language CDP management and automated strategies are planned for Phase 4, post-launch. Our immediate focus is delivering a robust, secure CDP protocol first."
  },
  {
    question: "What are the risks of using NyxUSD CDPs?",
    answer: "Main risks include liquidation if your collateral falls below 125%, smart contract risks (mitigated by IOG formal verification), and oracle risks (minimized by TEE hardware security). Always manage your collateralization ratio carefully."
  },
  {
    question: "How much funding is being requested from Catalyst?",
    answer: "We're requesting ₳50,000 from Catalyst Fund 14. This covers smart contract development, TEE oracle implementation, security audits, and community launch infrastructure."
  },
  {
    question: "What yields can I expect?",
    answer: "Cross-chain yields typically range from 5-100%+ APY depending on risk tier. Safe strategies offer 5-10%, medium risk 10-25%, and high risk 25-100%+. Your capital stays secure on Cardano while accessing these opportunities."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Everything you need to know about Cardano's most capital-efficient CDP protocol
        </p>
      </motion.div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {faqData.map((faq, index) => (
          <Card key={index} variant="elevated" padding="none" className="overflow-hidden">
            <motion.button
              className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/20 transition-colors"
              onClick={() => toggleFAQ(index)}
              whileHover={{ backgroundColor: "rgba(107, 114, 128, 0.1)" }}
            >
              <h3 className="text-lg font-semibold text-white pr-4">
                {faq.question}
              </h3>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-0">
                    <div className="border-t border-gray-700/50 pt-4">
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Card variant="gradient" padding="lg" className="inline-block">
          <p className="text-lg text-gray-300 mb-4">
            Still have questions about NyxUSD?
          </p>
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/contact'}
          >
            Contact Our Team
          </motion.button>
        </Card>
      </motion.div>
    </section>
  );
};

export default FAQSection;