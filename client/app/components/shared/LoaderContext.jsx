"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import PageLoader from "./PageLoader";

const LoaderContext = createContext({});

export const LoaderProvider = ({ children }) => {
  // Cold boot loader is true by default
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // When the path changes (or on initial load), guarantee the loader 
    // stays visible for a short duration to complete its animation cycle.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, [pathname]);

  const triggerLoader = () => {
    setIsLoading(true);
  };

  return (
    <LoaderContext.Provider value={{ triggerLoader }}>
      <PageLoader isVisible={isLoading} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
