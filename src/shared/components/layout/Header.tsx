"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

interface HeaderBreadcrumbProps {
  title: string;
  parents?: { label: string; href: string }[];
}

export default function HeaderBreadcrumb({ title, parents = [] }: HeaderBreadcrumbProps) {
  return (
    <header className="sticky z-10 top-0 flex items-center gap-2 border-b bg-background p-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {parents.map((parent, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={parent.href}>{parent.label}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </React.Fragment>
          ))}
          <BreadcrumbPage className="hidden md:block">
            <BreadcrumbLink href="#">{title}</BreadcrumbLink>
          </BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
