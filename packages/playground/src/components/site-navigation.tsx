import logo from '@/assets/lybic.svg'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { IconLogout, IconUser } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export function SiteNavigation() {
  return (
    <div className="site-nav w-full mt-2 px-6 pb-3">
      <NavigationMenu className="flex justify-between w-full max-w-full">
        <NavigationMenuList>
          <NavigationMenuLink asChild>
            <a href="https://lybic.ai" target="_blank" className={navigationMenuTriggerStyle()}>
              <img src={logo} alt="Lybic" className="h-7 -mb-2" />
            </a>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <a href="https://dashboard.lybic.cn" target="_blank" className={navigationMenuTriggerStyle()}>
              Dashboard
            </a>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              to="/"
              className={cn(
                navigationMenuTriggerStyle(),
                'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
              )}
            >
              Playground
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <a href="https://lybic.ai/docs" target="_blank" className={navigationMenuTriggerStyle()}>
              Docs
            </a>
          </NavigationMenuLink>
        </NavigationMenuList>
        <NavigationMenuList>
          <NavigationMenuLink asChild>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className={cn(navigationMenuTriggerStyle(), 'flex items-center gap-2')}>
                  <IconUser className="size-4" />
                  Trial User
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <IconLogout className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuLink>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
