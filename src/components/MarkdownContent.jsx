import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

function MarkdownContent({ children }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: (props) => <h1 className="mb-5 text-4xl font-bold text-slate-950" {...props} />,
        h2: (props) => <h2 className="mb-4 mt-10 text-2xl font-bold text-slate-950" {...props} />,
        h3: (props) => <h3 className="mb-3 mt-8 text-xl font-bold text-slate-950" {...props} />,
        h4: (props) => <h4 className="mb-2 mt-6 text-sm font-bold uppercase tracking-widest text-primary" {...props} />,
        p: (props) => <p className="mb-4 leading-7 text-slate-700" {...props} />,
        ul: (props) => <ul className="mb-5 list-disc space-y-2 pl-6 text-slate-700" {...props} />,
        ol: (props) => <ol className="mb-5 list-decimal space-y-2 pl-6 text-slate-700" {...props} />,
        a: (props) => <a className="font-semibold text-primary hover:text-blue-800" target="_blank" rel="noreferrer" {...props} />,
        div: ({ ...props }) => {
          return <div {...props} />;
        },
        script: ({ ...props}) =>{
          return <script {...props} />;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export default MarkdownContent;
