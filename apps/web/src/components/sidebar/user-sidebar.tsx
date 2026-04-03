"use client";

import * as React from "react";
import {
  LayoutDashboard,
  User,
  Fan,
} from "lucide-react";
import { siteConfig } from "@/config/site";

import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@coco-kit/ui/components/ui/sidebar";
import type { Route } from "next";
import Link from "next/link";

const data = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard" as Route,
        icon: LayoutDashboard,
      },
      {
        title: "Account",
        url: "/account" as Route,
        icon: User,
        children: [
          {
            title: "Profile",
            url: "/account" as Route,
          },
          {
            title: "Security",
            url: "/account/security" as Route,
          },
        ],
      },
    ],
  },
];

export function UserSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-1.5">
              <Link href="/" className="flex items-center gap-2">
                <Fan className="size-5 animate-spin" />
                <span className="text-base font-semibold">{siteConfig.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {data.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
