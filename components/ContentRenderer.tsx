
import React, { useEffect, useRef, useMemo } from 'react';

interface ContentRendererProps {
  content: string;
  className?: string;
}

declare global {
  interface Window {
    renderMathInElement: any;
    DOMPurify: any;
  }
}

type BlockType = 'text' | 'math_inline' | 'math_block' | 'svg' | 'chem';

interface ContentBlock {
  type: BlockType;
  content: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parser logic: Tách văn bản thành các khối chuyên biệt
  const blocks = useMemo(() => {
    if (!content) return [];
    
    const result: ContentBlock[] = [];
    
    // Regex hỗ trợ lồng nhau và các trường hợp đặc biệt
    const figureRegex = /\[FIGURE\s+type="svg"\]([\s\S]*?)\[\/FIGURE\]/gi;
    const mathBlockRegex = /\\\[([\s\S]*?)\\\]/g;
    const mathInlineRegex = /\\\(([\s\S]*?)\\\)/g;
    const chemRegex = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g;

    const placeholders: { id: string, block: ContentBlock }[] = [];
    
    let processed = content.replace(figureRegex, (_match, p1) => {
      const id = `##FIG${placeholders.length}##`;
      placeholders.push({ id, block: { type: 'svg', content: p1.trim() } });
      return id;
    });

    processed = processed.replace(mathBlockRegex, (_match, p1) => {
      const id = `##MBL${placeholders.length}##`;
      placeholders.push({ id, block: { type: 'math_block', content: p1.trim() } });
      return id;
    });

    processed = processed.replace(mathInlineRegex, (_match, p1) => {
      const id = `##MIN${placeholders.length}##`;
      placeholders.push({ id, block: { type: 'math_inline', content: p1.trim() } });
      return id;
    });

    processed = processed.replace(chemRegex, (_match, p1) => {
      const id = `##CHM${placeholders.length}##`;
      placeholders.push({ id, block: { type: 'chem', content: p1.trim() } });
      return id;
    });

    const parts = processed.split(/(##(?:FIG|MBL|MIN|CHM)\d+##)/);
    
    parts.forEach(part => {
      if (!part) return;
      const found = placeholders.find(p => p.id === part);
      if (found) result.push(found.block);
      else result.push({ type: 'text', content: part });
    });

    return result;
  }, [content]);

  // Sử dụng KaTeX để render
  useEffect(() => {
    const renderMath = () => {
      if (containerRef.current && window.renderMathInElement) {
        window.renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false,
          trust: true
        });
      }
    };

    // Debounce nhẹ để tránh render liên tục khi dữ liệu đang stream
    const timeout = setTimeout(renderMath, 50);
    return () => clearTimeout(timeout);
  }, [blocks]);

  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'svg':
        const sanitizeConfig = {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_ATTR: ['viewBox', 'preserveAspectRatio', 'vector-effect'],
        };
        let cleanSvg = window.DOMPurify ? window.DOMPurify.sanitize(block.content, sanitizeConfig) : block.content;
        return (
          <div key={index} className="figure-wrapper my-8 group relative">
            <div className="figure-container flex justify-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
              dangerouslySetInnerHTML={{ __html: cleanSvg }}
            />
          </div>
        );
      case 'math_block':
        return <div key={index} className="math-block-wrapper my-4">{"\\[" + block.content + "\\]"}</div>;
      case 'math_inline':
        return <span key={index} className="math-inline-wrapper">{"\\(" + block.content + "\\)"}</span>;
      case 'chem':
        return <span key={index} className="math-inline-wrapper text-indigo-700">{"\\(\\ce{" + block.content + "}\\)"}</span>;
      default:
        return <span key={index} className="whitespace-pre-wrap">{block.content}</span>;
    }
  };

  return (
    <div ref={containerRef} className={`latex-container select-text ${className}`}>
      {blocks.map((block, idx) => renderBlock(block, idx))}
    </div>
  );
};

export default ContentRenderer;
