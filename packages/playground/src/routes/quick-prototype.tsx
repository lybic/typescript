import { createFileRoute } from '@tanstack/react-router'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'
import { useSnapshot } from 'valtio'
import { sessionStore } from '@/stores/session'

export const Route = createFileRoute('/quick-prototype')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = useSnapshot(sessionStore)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/bff/chat',
      headers: {
        'X-Trial-Session-Token': session.trialSessionToken,
      },
    }),
  })
  const [input, setInput] = useState('')

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, index) => (part.type === 'text' ? <span key={index}>{part.text}</span> : null))}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (input.trim()) {
            sendMessage({ text: input })
            setInput('')
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Say something..."
        />
        <button type="submit" disabled={status !== 'ready'}>
          Submit
        </button>
      </form>
    </>
  )
}
