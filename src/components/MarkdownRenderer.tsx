import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';

interface MarkdownRendererProps {
  text: string;
}

const MarkdownRenderer = ({ text }: MarkdownRendererProps) => (
  <ReactMarkdown
    components={{
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
);

export default MarkdownRenderer;
