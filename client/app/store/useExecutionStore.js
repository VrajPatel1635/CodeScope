import { create } from 'zustand';

const useExecutionStore = create((set) => ({
  result: null,
  input: "",
  code: "",
  activeLine: null,

  setExecutionData: (result, input, code) => set({
    result,
    input,
    code,
    activeLine: null
  }),

  setActiveLine: (line) => set({ activeLine: line }),

  clearExecution: () => set({
    result: null,
    input: "",
    code: "",
    activeLine: null
  })
}));

export default useExecutionStore;
