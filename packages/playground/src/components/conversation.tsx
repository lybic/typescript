import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { IconBlockquote, IconDots, IconPointer, IconScreenshot, IconSend, IconSettings } from '@tabler/icons-react'

export function Conversation() {
  return (
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
        <Textarea placeholder="Use the computer to ..." className="resize-none" />
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
  )
}
