import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { MotionDiv, MotionH2, MotionP } from "@/components/motion-wrapper";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ease: "easeOut",
      staggerChildren: 0.2,
    },
  },
} as const;

export default function SubmitForReviewPage() {
  return (
    <MotionDiv
      className="max-w-xl mx-auto flex flex-col place-items-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <MotionDiv variants={pageVariants}>
        <CheckCircleIcon className="size-8 text-green-600" />
      </MotionDiv>

      <MotionH2
        variants={pageVariants}
        className="text-2xl font-semibold tracking-tight text-neutral-900 text-center mt-6"
      >
        Tool Submitted for Review
      </MotionH2>

      <MotionP
        variants={pageVariants}
        className="text-neutral-700 text-pretty mt-4"
      >
        Thank you for your submission! Your tool will be reviewed by our team
        within 24 hours. Once approved, it will appear in our tool directory.
      </MotionP>

      <MotionP
        variants={pageVariants}
        className="text-cenutral-700 mt-4 text-pretty"
      >
        We&apos;ll notify you via email once the review is complete. If your
        submission doesn&apos;t meet our guidelines, we&apos;ll provide feedback
        on what needs to be changed.
      </MotionP>
    </MotionDiv>
  );
}
