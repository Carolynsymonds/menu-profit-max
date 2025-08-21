import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  ShoppingCart, 
  Package2, 
  Truck, 
  BarChart3, 
  UtensilsCrossed, 
  AlertTriangle,
  Eye,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { siteContent } from "@/config/site-content";

const navigationItems = [
  { title: "Dashboard", url: "/app", icon: Home },
  { title: "Schedules", url: "/app/schedules", icon: UtensilsCrossed },
  { title: "Staff", url: "/app/staff", icon: Package2 },
  { title: "Time Tracking", url: "/app/time-tracking", icon: BarChart3 },
  { title: "Compliance", url: "/app/compliance", icon: ShoppingCart },
  { title: "Reports", url: "/app/reports", icon: Truck },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/app") {
      return currentPath === "/app";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className="w-64 border-none bg-neutral-100">
      {/* Branding Section with Avatar */}
      <SidebarHeader className="p-6 relative">
        <div className="flex items-center justify-center">
          <img 
            src={siteContent.brand.logoUrl} 
            alt={`${siteContent.brand.name} Logo`} 
            className="h-14 w-auto"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6 py-6">

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {navigationItems.map((item) => {
                const isItemActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton asChild>
                       <NavLink 
                         to={item.url} 
                         className={`group/item flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                           isItemActive
                             ? "bg-neutral-200 text-neutral-900 font-semibold" 
                             : "text-neutral-600 hover:bg-neutral-150 hover:text-neutral-800"
                         }`}
                       >
                        <item.icon className={`h-5 w-5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-12 ${
                          isItemActive ? "text-neutral-700" : "text-neutral-500 group-hover/item:text-neutral-700"
                        }`} />
                        <span>{item.title}</span>
                       </NavLink>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Settings Section */}
      <SidebarFooter className="p-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/app/settings"
                className={({ isActive }) => 
                  `group/settings flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? "bg-neutral-200 text-neutral-900 font-semibold" 
                      : "text-neutral-600 hover:bg-neutral-150 hover:text-neutral-800"
                  }`
                }
              >
                <Settings className="h-5 w-5 text-neutral-500 transition-all duration-300 group-hover/settings:scale-110 group-hover/settings:rotate-12 group-hover/settings:text-neutral-700" />
                <span>Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}