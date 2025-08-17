// components/motion-wrapper.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";

// Create a generic type for props to make the component reusable for different HTML elements.
// It combines the specific element's props with Framer Motion's props.
type MotionComponentProps<T extends keyof JSX.IntrinsicElements> =
  HTMLMotionProps<T>;

// Create a reusable factory function to generate motion components.
function createMotionComponent<T extends keyof JSX.IntrinsicElements>(tag: T) {
  const Component = React.forwardRef<HTMLElement, MotionComponentProps<T>>(
    (props, ref) => {
      // The 'as any' is a concession to TypeScript's complexity with dynamic tags.
      // This is a common and accepted pattern for this use case.
      const MotionTag = motion[tag] as any;
      return <MotionTag ref={ref} {...props} />;
    }
  );

  // Set a display name for better debugging in React DevTools.
  Component.displayName = `Motion${tag.charAt(0).toUpperCase() + tag.slice(1)}`;
  return Component;
}

// Export specific motion components that you need for your page.
export const MotionDiv = createMotionComponent("div");
export const MotionH2 = createMotionComponent("h2");
export const MotionP = createMotionComponent("p");

// You can easily add more here as needed, for example:
// export const MotionButton = createMotionComponent("button");
