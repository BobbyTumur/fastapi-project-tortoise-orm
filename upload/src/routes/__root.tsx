import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import NotFound from "../components/NotFound";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Suspense></Suspense>
    </>
  ),
  notFoundComponent: () => <NotFound />,
});
