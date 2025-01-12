import { AnimatePresence, motion } from "framer-motion";

function AnimatedCheckIcon({ initial = true }) {
  return (
    <AnimatePresence initial={initial}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="green"
        className="CheckIcon"
        width="200" // Set the desired width
        height="200"
      >
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          exit={{ pathLength: 0 }}
          transition={{
            type: "tween",
            duration: 0.3,
            ease: "easeIn",
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l6 6 9-13.5"
        />
      </svg>
    </AnimatePresence>
  );
}

export default AnimatedCheckIcon;
