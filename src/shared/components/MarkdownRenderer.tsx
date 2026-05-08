import { useMemo } from 'react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import InteractiveRenderer from '@/shared/components/interactive/InteractiveRenderer';
import {
  InteractiveSpec,
  parseInteractiveSpec,
} from '@/shared/components/interactive/interactive-spec';

interface MarkdownRendererProps {
  text: string;
}

type RenderBlock =
  | {
      kind: 'markdown';
      content: string;
    }
  | {
      kind: 'interactive';
      spec: InteractiveSpec;
    };

const INTERACTIVE_BLOCK_RE = /```interactive\s*([\s\S]*?)```/gi;
const HIDDEN_BLOCK_RE = /```(?:suggestions|geometry)\s*[\s\S]*?```/gi;

const normalizeMathDelimiters = (input: string) => {
  let output = input;

  output = output.replace(
    /\[\s*(\\begin\{cases\}[\s\S]*?\\end\{cases\})\s*\]/g,
    (_, block: string) => `$$${block}$$`
  );

  output = output.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_, expr: string) => {
    return `$$${expr}$$`;
  });

  output = output.replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_, expr: string) => {
    return `$${expr}$`;
  });

  return output;
};

const markdownUrlTransform = (url: string, key: string) => {
  if (
    key === 'src' &&
    /^data:image\/(svg\+xml|png|jpeg|jpg|webp)(;|,)/i.test(url)
  ) {
    return url;
  }
  return defaultUrlTransform(url);
};

const splitRenderBlocks = (content: string): RenderBlock[] => {
  const blocks: RenderBlock[] = [];
  const preparedContent = content.replace(HIDDEN_BLOCK_RE, '');
  let cursor = 0;

  const matches = preparedContent.matchAll(INTERACTIVE_BLOCK_RE);
  for (const match of matches) {
    const fullMatch = match[0];
    const jsonBody = match[1];
    const start = match.index ?? 0;
    const end = start + fullMatch.length;

    if (start > cursor) {
      const before = preparedContent.slice(cursor, start);
      if (before.trim()) {
        blocks.push({ kind: 'markdown', content: before });
      }
    }

    if (jsonBody) {
      const spec = parseInteractiveSpec(jsonBody);
      if (spec) {
        blocks.push({ kind: 'interactive', spec });
      } else {
        blocks.push({ kind: 'markdown', content: fullMatch });
      }
    } else {
      blocks.push({ kind: 'markdown', content: fullMatch });
    }

    cursor = end;
  }

  if (cursor < preparedContent.length) {
    const tail = preparedContent.slice(cursor);
    if (tail.trim()) {
      blocks.push({ kind: 'markdown', content: tail });
    }
  }

  if (!blocks.length) {
    const rawSpec = parseInteractiveSpec(preparedContent.trim());
    if (rawSpec) {
      return [{ kind: 'interactive', spec: rawSpec }];
    }
    return [{ kind: 'markdown', content: preparedContent }];
  }

  return blocks;
};

const MarkdownBlock = ({ text }: { text: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}
    urlTransform={markdownUrlTransform}
    components={{
      p({ children, ...props }) {
        if (String(children).trim().length === 0) {
          return null;
        }
        return (
          <p className="leading-snug" {...props}>
            {children}
          </p>
        );
      },
      h1({ children, ...props }) {
        return (
          <h1 className="text-lg font-semibold" {...props}>
            {children}
          </h1>
        );
      },
      h2({ children, ...props }) {
        return (
          <h2 className="text-base font-semibold" {...props}>
            {children}
          </h2>
        );
      },
      h3({ children, ...props }) {
        return (
          <h3 className="text-sm font-semibold" {...props}>
            {children}
          </h3>
        );
      },
      ul({ children, ...props }) {
        return (
          <ul className="ml-4 list-disc space-y-1" {...props}>
            {children}
          </ul>
        );
      },
      ol({ children, ...props }) {
        return (
          <ol className="ml-4 list-decimal space-y-1" {...props}>
            {children}
          </ol>
        );
      },
      li({ children, ...props }) {
        return (
          <li className="leading-snug" {...props}>
            {children}
          </li>
        );
      },
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return match ? (
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                backgroundColor: '#333',
                color: '#ccc',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '4px',
                zIndex: 1,
              }}
            >
              {match[1]}
            </div>
            <SyntaxHighlighter
              style={atomDark}
              language={match[1]}
              PreTag="div"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }}
  >
    {normalizeMathDelimiters(text)}
  </ReactMarkdown>
);

const MarkdownRenderer = ({ text }: MarkdownRendererProps) => {
  const blocks = useMemo(() => splitRenderBlocks(text), [text]);

  return (
    <div className="space-y-3 [&_.katex-display]:my-2 [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-1 [&_.katex-display>span]:inline-block [&_.katex-display>span]:min-w-max">
      {blocks.map((block, index) => {
        if (block.kind === 'interactive') {
          return <InteractiveRenderer key={`interactive-${index}`} spec={block.spec} />;
        }

        return <MarkdownBlock key={`markdown-${index}`} text={block.content} />;
      })}
    </div>
  );
};

export default MarkdownRenderer;
