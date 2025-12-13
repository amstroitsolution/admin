import React from 'react';
import { motion } from 'framer-motion';
import yashperLogo from '../assets/yashper.png';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'linear-gradient(to bottom right, rgb(15, 23, 42), #de3cad, rgb(15, 23, 42))' }}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow" style={{ background: 'rgba(222, 60, 173, 0.2)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow" style={{ background: 'rgba(232, 84, 193, 0.2)', animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white flex items-center justify-center shadow-2xl overflow-hidden"
        >
          <img 
            src={yashperLogo} 
            alt="Yashper Logo" 
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Loading Animation */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ background: 'linear-gradient(to right, #de3cad, #e854c1)' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-2xl font-bold gradient-text-animated mb-2"
        >
          Yashper Admin
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-white/70"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;