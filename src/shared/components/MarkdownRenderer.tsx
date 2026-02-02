import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';

interface MarkdownRendererProps {
  text: string;
}

const MarkdownRenderer = ({ text }: MarkdownRendererProps) => (
  <div className="space-y-2">
    <ReactMarkdown
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
      {text}
    </ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
