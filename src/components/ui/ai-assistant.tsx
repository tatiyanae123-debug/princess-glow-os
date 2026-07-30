'use client';

import { useState, type FormEvent } from 'react';
import { Bot, CalendarDays, CheckCircle2, SendHorizonal, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Message = {
  role: 'assistant' | 'user';
  text: string;
  meta?: string;
};

const starterMessages: Message[] = [
  {
    role: 'assistant',
    text: 'This concierge is an interface preview. It can demonstrate planning flows with local mock logic, but it does not yet connect to a real AI provider or private accounts.',
    meta: 'Preview only',
  },
];

function buildReply(input: string) {
  const prompt = input.toLowerCase();

  if (prompt.includes('plan') || prompt.includes('schedule')) {
    return {
      role: 'assistant' as const,
      text: 'Preview mode: I would protect your highest-focus block and shift lighter tasks to the end of the day. When a real planner exists, this interface can turn that logic into saved plan changes.',
      meta: 'Planning preview',
    };
  }

  if (prompt.includes('task') || prompt.includes('todo')) {
    return {
      role: 'assistant' as const,
      text: 'Preview mode: I can suggest three likely next steps from a note, but this session still uses local demo logic rather than a saved task system.',
      meta: 'Task preview',
    };
  }

  if (prompt.includes('beauty') || prompt.includes('routine')) {
    return {
      role: 'assistant' as const,
      text: 'Preview mode: I can suggest a lighter beauty routine based on the current mock context, without claiming live product or health intelligence.',
      meta: 'Routine preview',
    };
  }

  if (prompt.includes('budget') || prompt.includes('money')) {
    return {
      role: 'assistant' as const,
      text: 'Preview mode: I can frame a gentle finance observation from structured placeholder data, but this is not connected to real accounts.',
      meta: 'Finance preview',
    };
  }

  return {
    role: 'assistant' as const,
    text: 'I can help you plan your day, organize notes, suggest routines, and keep your priorities clear. Tell me what you want to prepare for next.',
    meta: 'General support',
  };
}

export function AiAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestions = ['Plan my evening', 'Turn this note into tasks', 'Suggest a beauty routine', 'Review my week'];

  function sendPrompt(prompt: string) {
    const trimmed = prompt.trim();

    if (!trimmed) {
      return;
    }

    const userMessage: Message = { role: 'user', text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsThinking(true);

    window.setTimeout(() => {
      setMessages((current) => [...current, buildReply(trimmed)]);
      setIsThinking(false);
    }, 550);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendPrompt(input);
  }

  function handleSuggestionClick(suggestion: string) {
    sendPrompt(suggestion);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300">
            <Bot size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Glow AI</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your quiet executive assistant preview</p>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/70">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Sparkles size={16} className="text-amber-500" />
            <span>AI concierge preview</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" /> Demonstrate natural-language planning without claiming production AI.</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" /> Keep future service boundaries clear for real scheduling and memory features.</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" /> Use supportive wording grounded in the current mock dashboard context.</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Ask Glow</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Natural-language planning preview</p>
          </div>
          <div className="rounded-full bg-rose-50 p-2 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300">
            <CalendarDays size={16} />
          </div>
        </div>

        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`rounded-[20px] px-4 py-3 text-sm ${message.role === 'assistant' ? 'bg-slate-50 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200' : 'bg-slate-900 text-white dark:bg-slate-700'}`}>
              <p>{message.text}</p>
              {message.meta ? <p className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-400">{message.meta}</p> : null}
            </div>
          ))}
          {isThinking ? (
            <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
              <p>Thinking of a calm next step…</p>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Glow to plan, prioritize, or reflect"
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 dark:border-slate-700 dark:bg-slate-800"
          />
          <Button type="submit" className="gap-2">
            <SendHorizonal size={16} /> Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
