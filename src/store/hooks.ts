import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

/**
 * Pre-typed versions of the React-Redux hooks. Use these everywhere
 * instead of the plain `useDispatch` / `useSelector` so the store's
 * types flow through automatically (full autocomplete, no manual generics).
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
