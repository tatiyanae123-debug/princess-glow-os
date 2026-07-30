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
    text: 'I can help you plan the day, turn notes into tasks, suggest rituals, and keep your life feeling calm and intentional.',
    meta: 'Daily briefing ready',
  },
];

function buildReply(input: string) {
  const prompt = input.toLowerCase();

  if (prompt.includes('plan') || prompt.includes('schedule')) {
    return {
      role: 'assistant' as const,
      text: 'I’ve protected your highest-focus block and shifted lighter tasks to the end of the day. Your evening remains open for rest and preparation.',
      meta: 'Planning support',
    };
  }

  if (prompt.includes('task') || prompt.includes('todo')) {
    return {
      role: 'assistant' as const,
      text: 'I pulled three important actions from your note and turned them into next steps. The most valuable move is to finish the top-priority task before lunch.',
      meta: 'Task extraction',
    };
  }

  if (prompt.includes('beauty') || prompt.includes('routine')) {
    return {
      role: 'assistant' as const,
      text: 'Your beauty routine is already aligned with your energy. I recommend a short reset, one polished outfit, and a little extra rest tonight.',
      meta: 'Routine guidance',
    };
  }

  if (prompt.includes('budget') || prompt.includes('money')) {
    return {
      role: 'assistant' as const,
      text: 'Your spending is staying within a healthy range. I’d keep discretionary purchases light this week and review subscriptions before the weekend.',
      meta: 'Finance note',
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
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your quiet executive assistant</p>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/70">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Sparkles size={16} className="text-amber-500" />
            <span>Daily briefing</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" /> Protect your morning focus block.</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" /> Move one beauty task into the afternoon.</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" /> Leave room for a slow evening reset.</li>
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
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Natural language support</p>
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
