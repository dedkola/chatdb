import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  if (!content) {
    return (
      <div className="text-zinc-500 dark:text-zinc-400 italic">No content</div>
    );
  }

  const components: Components = {
    h1: ({ ...props }) => (
      <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
    ),
    h2: ({ ...props }) => (
      <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
    ),
    h3: ({ ...props }) => (
      <h3 className="text-lg font-bold mt-3 mb-2" {...props} />
    ),
    p: ({ ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
    ul: ({ ...props }) => (
      <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
    ),
    ol: ({ ...props }) => (
      <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
    ),
    li: ({ ...props }) => <li className="ml-4" {...props} />,
    code: ({ className, children, ...props }) => {
      // Check if it's inline code by looking at the props or parent context
      const isInline = !className?.includes("language-");

      return !isInline ? (
        <code
          className={`block bg-zinc-800 dark:bg-zinc-900 text-zinc-100 p-3 rounded-lg overflow-x-auto mb-3 text-sm ${
            className || ""
          }`}
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ ...props }) => <pre className="mb-3 overflow-x-auto" {...props} />,
    blockquote: ({ ...props }) => (
      <blockquote
        className="border-l-4 border-zinc-300 dark:border-zinc-600 pl-4 italic my-3"
        {...props}
      />
    ),
    a: ({ ...props }) => (
      <a
        className="text-blue-600 dark:text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    table: ({ ...props }) => (
      <div className="overflow-x-auto mb-3">
        <table
          className="min-w-full border-collapse border border-zinc-300 dark:border-zinc-600"
          {...props}
        />
      </div>
    ),
    thead: ({ ...props }) => (
      <thead className="bg-zinc-100 dark:bg-zinc-700" {...props} />
    ),
    th: ({ ...props }) => (
      <th
        className="border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-left font-semibold"
        {...props}
      />
    ),
    td: ({ ...props }) => (
      <td
        className="border border-zinc-300 dark:border-zinc-600 px-3 py-2"
        {...props}
      />
    ),
    hr: ({ ...props }) => (
      <hr className="my-4 border-zinc-300 dark:border-zinc-600" {...props} />
    ),
    strong: ({ ...props }) => <strong className="font-bold" {...props} />,
    em: ({ ...props }) => <em className="italic" {...props} />,
  };

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
