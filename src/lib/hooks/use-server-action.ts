'use client';

import { useState, useTransition } from 'react';

type FieldErrors = Record<string, string[] | undefined>;
type ActionErrorShape = { formErrors?: string[]; fieldErrors?: FieldErrors };
type ActionResult<TResult> = { data?: TResult; error?: ActionErrorShape } | undefined | null;

function extractMessage(error: ActionErrorShape): string {
  if (error.formErrors && error.formErrors.length > 0) return error.formErrors[0];
  const fieldMessage = Object.values(error.fieldErrors ?? {}).flat().find(Boolean);
  return fieldMessage ?? 'Please check the form and try again.';
}

/**
 * Wraps a Next.js server action with client-side pending/error state.
 * Reused by every module's form and manager component so behavior
 * (loading state, validation error surfacing, thrown-error handling)
 * stays consistent across the app instead of being reimplemented per module.
 */
export function useServerAction<TInput, TResult>(action: (input: TInput) => Promise<ActionResult<TResult>>) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(input: TInput, onSuccess?: (result: TResult) => void) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(input);
        if (result?.error) {
          setError(extractMessage(result.error));
          return;
        }
        if (result?.data !== undefined) {
          onSuccess?.(result.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    });
  }

  return { run, isPending, error, setError };
}
