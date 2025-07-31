/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import icon from '../assets/icon.svg'

import appCss from '@/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=960, initial-scale=1, user-scalable=yes',
      },
      {
        title: 'Lybic Playground',
      },
    ],
    links: [
      { rel: 'icon', href: icon },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="h-full w-full">
      <head>
        <HeadContent />
      </head>
      <body className="h-full w-full overflow-x-hidden">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
