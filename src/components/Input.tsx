import { InputHTMLAttributes, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  maxWords?: number;
  value?: string | number;
}

export function Input({maxWords, ...props }: InputProps) {
  const [value, setValue] = useState(props.value?.toString() || "");

  const getWordCount = (text: string) => text.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const wordCount = getWordCount(inputValue);

    if (!maxWords || wordCount <= maxWords) {
      setValue(inputValue);
      props.onChange?.(e);
    }
  };

  // Aseguramos que siempre contamos la longitud del string, no el valor numérico
  const currentWordCount = getWordCount(value.toString());

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="relative">
        <input
          {...props}
          value={value}
          onChange={handleChange}
          className="w-full pl-4 pr-4 py-2 rounded-xl border border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 transition-all bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
        {maxWords && (
          <div className="absolute bottom-1 right-3 text-[10px] text-neutral-500 pointer-events-none">
            {currentWordCount}/{maxWords}
          </div>
        )}
      </div>
    </div>
  );
}