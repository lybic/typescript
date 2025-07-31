import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import logo from '@/assets/lybic.svg'
import { createFileRoute, Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import {
  IconBlockquote,
  IconCast,
  IconDots,
  IconLogout,
  IconPointer,
  IconScreenshot,
  IconSend,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="homepage flex flex-col w-full h-full">
      <div className="top-nav w-full mt-2 px-6 pb-3">
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
      <div className="playground-body flex-1 flex gap-4 h-1 px-4 border-t-1 border-border/50">
        <div className="agent-desktop flex-1">
          <div
            className="live-stream relative h-full w-full flex flex-col items-center justify-center p-4"
            style={{ containerType: 'size' }}
          >
            <div className="live-stream-title flex w-full justify-between px-2 mb-2">
              <div className="flex gap-2 items-center">
                <IconCast className="size-4" />
                <div className="text-sm">Live Stream</div>
              </div>
              <div className="flex gap-2 text-sm text-muted-foreground items-center">
                <div className="font-mono">00:10:00</div>
                <Button size="sm" variant="outline" className="text-xs h-7 text-destructive hover:text-destructive">
                  Terminate
                </Button>
              </div>
            </div>
            <canvas
              className="aspect-[16/9] w-[min(100%,177cqh)] border-1 rounded-lg shadow-sm overflow-hidden"
              tabIndex={0}
            ></canvas>
            <div className="agent-dock top-4 w-full px-2 py-4">
              <div className="flex gap-2">
                <div className="bg-blue-400 size-3 mt-1 rounded-full">
                  <div className="bg-blue-400 animate-[ping_2s_ease-in-out_infinite] size-3 rounded-full"></div>
                </div>
                <div className="text-sm text-muted-foreground">Thinking...</div>
              </div>
            </div>
          </div>
        </div>
        <div className="conversation w-96 py-4 text-sm flex flex-col">
          <div className="messages flex-1 overflow-y-auto">
            <div className="message-user-input mx-2">
              <div className="w-4/5 ml-auto rounded-lg bg-accent text-accent-foreground p-2 px-4 break-words whitespace-pre-wrap">
                打开浏览器抓取现在百度热榜（ https://top.baidu.com/board?tab=realtime
                ）上第一名的热点，把排名、标题写入WPS表格。
              </div>
              <div className="message-footer text-xs text-muted-foreground text-right my-1">22:34</div>
            </div>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="message-assistant mx-2 hover:bg-accent rounded-lg p-2">
                <div className="p-2 break-words whitespace-pre-wrap">
                  任务是打开浏览器抓取百度热榜第一名热点并写入WPS表格。首先需要打开浏览器，桌面上有Google
                  Chrome图标，所以第一步应该双击打开Google Chrome。这样才能访问目标网址获取信息。{'\n'}
                  总结：双击桌面上的Google Chrome图标以打开浏览器。
                </div>
                <div className="message-footer text-xs text-muted-foreground text-left ml-2 flex flex-wrap gap-2 items-center">
                  <div>23:45</div>
                  <div className="flex gap-1 items-center">
                    <IconPointer className="size-3" />
                    click
                  </div>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button size="icon" variant="ghost" className="size-4">
                          <IconDots className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <IconBlockquote className="size-4" />
                          Original
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconScreenshot className="size-4" />
                          Screenshot
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="message-input p-2">
            <Textarea placeholder="Use computer to ..." className="resize-none" />
            <div className="flex gap-2 mt-2 justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {/* <div>Planning: doubao-seed-1.6-flash</div> */}
                <div>Model: doubao-seed-1.6-flash</div>
              </div>
              <div>
                <Button variant="outline" size="icon">
                  <IconSettings />
                </Button>
                <Button size="icon" className="ml-2">
                  <IconSend />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
