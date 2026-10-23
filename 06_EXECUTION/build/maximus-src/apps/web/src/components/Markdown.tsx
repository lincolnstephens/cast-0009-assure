import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

/**
 * The only way policy markdown is rendered, in both workspaces. Bodies are
 * officer-authored but treated as untrusted input: rehype-sanitize strips
 * raw HTML, scripts and unsafe attributes.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{children}</ReactMarkdown>
    </div>
  );
}
