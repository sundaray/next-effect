"use client";

import { useRouter } from "nextjs-toploader/app";
import { RouterProvider as ReactAriaRouterProvider } from "react-aria-components";

// declare module "react-aria-components" {
//   interface RouterConfig {
//     routerOptions: NonNullable<
//       Parameters<ReturnType<typeof useRouter>["push"]>[1]
//     >;
//   }
// }

type ClientProvidersProps = {
  children: React.ReactNode;
};

export function RouterProvider({ children }: ClientProvidersProps) {
  const router = useRouter();

  return (
    <ReactAriaRouterProvider navigate={router.push}>
      {children}
    </ReactAriaRouterProvider>
  );
}
