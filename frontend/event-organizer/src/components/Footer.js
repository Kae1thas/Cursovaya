import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 z-50 shadow-md"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-sm">
          © {new Date().getFullYear()} Event Manager. Все права защищены.
        </div>
        <div className="flex space-x-6">
          <a
            href="mailto:oleg.sanamyan_84@mail.ru"
            className="hover:text-gray-300 transition-colors"
          >
            oleg.sanamyan_84@mail.ru
          </a>
          <a
            href="tel:+79282209343"
            className="hover:text-gray-300 transition-colors"
          >
            +7 (928) 220-93-43
          </a>
        </div>
        <div className="flex space-x-4">
          <a
            href="https://t.me/kael_thaas"
            className="hover:text-gray-300 transition-colors"
          >
            Telegram
          </a>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;