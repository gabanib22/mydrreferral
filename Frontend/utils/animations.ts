// Lightweight animation utilities for the website
export const animations = {
  // Fade in animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  // Slide in from top
  slideInFromTop: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  
  // Slide in from bottom
  slideInFromBottom: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  
  // Slide in from left
  slideInFromLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  
  // Slide in from right
  slideInFromRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  
  // Scale in animation
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  // Bounce animation
  bounce: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  
  // Stagger animation for lists
  stagger: {
    container: {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    }
  },
  
  // Hover animations
  hover: {
    scale: "hover:scale-105",
    shadow: "hover:shadow-lg",
    glow: "hover:shadow-blue-500/25"
  },
  
  // Loading animations
  loading: {
    spin: "animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    ping: "animate-ping"
  }
};

// CSS classes for common animations
export const animationClasses = {
  // Fade animations
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-300",
  
  // Slide animations
  slideInFromTop: "animate-in slide-in-from-top-2 duration-300",
  slideInFromBottom: "animate-in slide-in-from-bottom-2 duration-300",
  slideInFromLeft: "animate-in slide-in-from-left-2 duration-300",
  slideInFromRight: "animate-in slide-in-from-right-2 duration-300",
  
  // Scale animations
  scaleIn: "animate-in zoom-in-95 duration-300",
  scaleOut: "animate-out zoom-out-95 duration-300",
  
  // Hover effects
  hoverScale: "transition-transform duration-200 hover:scale-105",
  hoverShadow: "transition-shadow duration-200 hover:shadow-lg",
  hoverGlow: "transition-shadow duration-200 hover:shadow-blue-500/25",
  
  // Loading states
  loadingSpin: "animate-spin",
  loadingPulse: "animate-pulse",
  loadingBounce: "animate-bounce",
  loadingPing: "animate-ping"
};

// Animation variants for different components
export const componentAnimations = {
  // Button animations
  button: {
    hover: "transition-all duration-200 hover:scale-105 hover:shadow-md",
    click: "active:scale-95 transition-transform duration-100"
  },
  
  // Card animations
  card: {
    hover: "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
    stagger: "animate-in slide-in-from-bottom-2 duration-500"
  },
  
  // Modal animations
  modal: {
    backdrop: "animate-in fade-in duration-300",
    content: "animate-in slide-in-from-top-2 duration-300"
  },
  
  // Notification animations
  notification: {
    slideIn: "animate-in slide-in-from-right-2 duration-300",
    slideOut: "animate-out slide-out-to-right-2 duration-300"
  },
  
  // Data grid animations
  dataGrid: {
    rowHover: "transition-colors duration-200 hover:bg-gray-50",
    cellFocus: "transition-all duration-200 focus:ring-2 focus:ring-blue-500"
  }
};
