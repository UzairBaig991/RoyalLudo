import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve as pathResolve, dirname } from 'node:path';

const ZUSTAND_MOCK_URL = 'data:text/javascript,' + encodeURIComponent(`
export const create = (fn) => {
  let state;
  const listeners = new Set();
  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = Object.assign({}, state, nextState);
    listeners.forEach((l) => l(state));
  };
  const getState = () => state;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, subscribe };
  state = fn(setState, getState, api);
  const useStore = (selector = (s) => s) => selector(state);
  Object.assign(useStore, api);
  return useStore;
};
export default create;
`);

export async function resolve(specifier, context, nextResolve) {
  const { parentURL } = context;

  // Intercept zustand for zero-dependency test runner execution
  if (specifier === 'zustand') {
    return {
      url: ZUSTAND_MOCK_URL,
      shortCircuit: true,
    };
  }

  // Intercept @royal-ludo/shared to point directly to source/index.ts
  if (specifier === '@royal-ludo/shared') {
    const sharedSource = pathResolve(process.cwd(), 'shared/src/index.ts');
    return nextResolve(pathToFileURL(sharedSource).href, context);
  }

  if (parentURL && (specifier.startsWith('./') || specifier.startsWith('../'))) {
    const parentPath = fileURLToPath(parentURL);
    const parentDir = dirname(parentPath);
    const candidatePath = pathResolve(parentDir, specifier + '.ts');

    if (existsSync(candidatePath)) {
      return nextResolve(pathToFileURL(candidatePath).href, context);
    }

    const indexCandidate = pathResolve(parentDir, specifier, 'index.ts');
    if (existsSync(indexCandidate)) {
      return nextResolve(pathToFileURL(indexCandidate).href, context);
    }
  }

  return nextResolve(specifier, context);
}
