import { toast } from "sonner";

interface MutationTrigger<Arg, Result> {
  (arg: Arg): { unwrap: () => Promise<Result> };
}

interface RunMutationOptions<Result> {
  /** Called with the unwrapped result only once the mutation actually succeeds. */
  onSuccess?: (result: Result) => void;
  /** Shown as an error toast if the mutation rejects. */
  errorMessage?: string;
}

/**
 * Wraps an RTK Query mutation trigger so success is only reported once the
 * server has actually confirmed it (via .unwrap()), instead of toasting
 * unconditionally right after firing the request.
 */
export async function runMutation<Arg, Result>(
  trigger: MutationTrigger<Arg, Result>,
  arg: Arg,
  { onSuccess, errorMessage = "Something went wrong" }: RunMutationOptions<Result> = {},
): Promise<Result | undefined> {
  try {
    const result = await trigger(arg).unwrap();
    onSuccess?.(result);
    return result;
  } catch {
    toast.error(errorMessage);
    return undefined;
  }
}
