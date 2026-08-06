"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationSwitcher, UserButton, useClerk } from "@clerk/nextjs";
import {
  type LucideIcon,
  Home,
  LayoutGrid,
  AudioLines,
  Volume2,
  Settings,
  Headphones,
} from "lucide-react";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  onClick?: () => void;
}

interface NavSectionProps {
  label?: string;
  items: MenuItem[];
  pathname: string;
}

function NavSection({ label, items, pathname }: NavSectionProps) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[13px] uppercase text-muted-foreground">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!!item.url}
                isActive={
                  item.url
                    ? item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url)
                    : false
                }
                onClick={item.onClick}
                tooltip={item.title}
                className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium border border-transparent data-[active=true]:border-border data-[active=true]:shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]"
              >
                {item.url ? (
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <>
                    <item.icon />
                    <span>{item.title}</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const clerk = useClerk();
  const mounted = useIsMounted();

  const mainMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Explore voices",
      url: "/voices",
      icon: LayoutGrid,
    },
    {
      title: "Text to speech",
      url: "/text-to-speech",
      icon: AudioLines,
    },
    {
      title: "Voice cloning",
      icon: Volume2,
    },
  ];

  const othersMenuItems: MenuItem[] = [
    {
      title: "Settings",
      icon: Settings,
      onClick: () => clerk.openOrganizationProfile(),
    },
    {
      title: "Help and support",
      icon: Headphones,
      url: "mailto:parayushkanphade@gmail.com",
    },
  ];

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-3 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
            <Image
              src="/logo.svg"
              alt="Resonance"
              width={24}
              height={24}
              className="rounded-sm"
            />
            <span className="group-data-[collapsible=icon]:hidden font-semibold text-lg tracking-tighter text-foreground">
              Resonance
            </span>
            <SidebarTrigger className="ml-auto lg:hidden" />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              {mounted ? (
                <OrganizationSwitcher
                  hidePersonal
                  fallback={
                    <Skeleton className="h-8.5 w-full group-data-[collapsible=icon]:size-8 rounded-md border bg-white" />
                  }
                  appearance={{
                    elements: {
                      rootBox:
                        "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center!",
                      organizationSwitcherTrigger:
                        "w-full! justify-between! bg-transparent! border! border-white/10! hover:bg-white/5! rounded-md! pl-1! pr-2! py-1! gap-3! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1! shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]!",
                      organizationPreview: "gap-2!",
                      organizationPreviewAvatarBox: "size-6! rounded-sm!",
                      organizationPreviewTextContainer:
                        "text-xs! tracking-tight! font-medium! text-foreground! group-data-[collapsible=icon]:hidden!",
                      organizationPreviewMainIdentifier: "text-[13px]!",
                      organizationSwitcherTriggerIcon:
                        "size-4! text-sidebar-foreground! group-data-[collapsible=icon]:hidden!",
                    },
                  }}
                />
              ) : (
                <Skeleton className="h-8.5 w-full group-data-[collapsible=icon]:size-8 rounded-md border bg-white" />
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        {/*  */}
        <div className="border-b border-dashed border-border" />
        <SidebarContent>
          <NavSection items={mainMenuItems} pathname={pathname} />
          <NavSection
            label="Others"
            items={othersMenuItems}
            pathname={pathname}
          />
        </SidebarContent>
        <div className="border-b border-dashed border-border" />
        <SidebarRail />
        <SidebarFooter className="gap-3 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              {mounted ? (
                <UserButton
                  showName
                  fallback={
                    <Skeleton className="h-8.5 w-full group-data-[collapsible=icon]:size-8 rounded-md border border-border bg-white" />
                  }
                  appearance={{
                    elements: {
                      rootBox:
                        "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center!",
                      userButtonTrigger:
                        "w-full! justify-between! bg-transparent! hover:bg-white/5! border! border-white/10! rounded-md! pl-1! pr-2! py-1! shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1! group-data-[collapsible=icon]:after:hidden! [--border:color-mix(in_srgb,transparent,var(--clerk-color-neutral)_15%)]!",
                      userButtonBox: "flex-row-reverse! gap-2!",
                      userButtonOuterIdentifier:
                        "text-[13px]! tracking-tight! font-medium! text-foreground! pl-0! group-data-[collapsible=icon]:hidden!",
                      userButtonAvatarBox: "size-6!",
                    },
                  }}
                />
              ) : (
                <Skeleton className="h-8.5 w-full group-data-[collapsible=icon]:size-8 rounded-md border border-border bg-white" />
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
