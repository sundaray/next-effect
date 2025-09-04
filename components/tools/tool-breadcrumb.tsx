import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface ToolBreadcrumbProps {
  toolName: string;
}

export function ToolBreadcrumb({ toolName }: ToolBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* --- Home Link --- */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/"
              className="font-medium text-sky-600 transition-colors hover:text-sky-700"
            >
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* --- Tools (Collection) Link --- */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/"
              className="font-medium text-sky-600 transition-colors hover:text-sky-700"
            >
              Tools
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* --- Current Tool Page (Not a link) --- */}
        <BreadcrumbItem>
          <BreadcrumbPage>{toolName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
