"use client"

import { motion } from "framer-motion"
import { FaArrowDown } from "react-icons/fa"

export default function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-4 right-4 bg-blue-500 rounded-full p-2 text-white"
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      }}
    >
      <FaArrowDown size={20} />
    </motion.div>
  )
}

