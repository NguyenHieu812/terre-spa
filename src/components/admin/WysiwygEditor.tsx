import React, { useState, useRef, useEffect } from "react";
import { compressImageFile } from "../../utils/imageUtils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Code,
  Eye,
  RotateCcw,
  RotateCw,
  Sparkles,
  Check,
  X,
  Type,
  Upload,
} from "lucide-react";

interface WysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "Bắt đầu viết nội dung bài viết chuyên nghiệp tại đây...",
  minHeight = "360px",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  
  // Word and reading time stats
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Sync initial content
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    updateStats(value || "");
  }, [value, isHtmlMode]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const updateStats = (html: string) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateStats(html);
      saveSelection();
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
      if (savedRangeRef.current && editorRef.current.contains(savedRangeRef.current.commonAncestorContainer)) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        }
      }
    }
    document.execCommand(command, false, value);
    saveSelection();
    handleEditorInput();
  };

  const applyHeading = (tag: "h1" | "h2" | "h3" | "p") => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
      if (savedRangeRef.current && editorRef.current.contains(savedRangeRef.current.commonAncestorContainer)) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        }
      }
    }
    document.execCommand("formatBlock", false, tag);
    saveSelection();
    handleEditorInput();
  };

  const insertCustomHtml = (htmlString: string) => {
    if (isHtmlMode) {
      onChange(value + "\n" + htmlString);
      return;
    }
    if (!editorRef.current) return;

    editorRef.current.focus();

    const sel = window.getSelection();
    let targetRange: Range | null = null;

    if (savedRangeRef.current && editorRef.current.contains(savedRangeRef.current.commonAncestorContainer)) {
      targetRange = savedRangeRef.current;
    } else if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      targetRange = sel.getRangeAt(0);
    }

    if (targetRange) {
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(targetRange);
      }

      targetRange.deleteContents();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlString;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      let lastNode: ChildNode | null = null;
      while ((node = tempDiv.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      targetRange.insertNode(frag);

      if (lastNode) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        savedRangeRef.current = newRange.cloneRange();
      }
    } else {
      // If no selection exists inside editor, append to end instead of jumping to top
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlString;
      while (tempDiv.firstChild) {
        editorRef.current.appendChild(tempDiv.firstChild);
      }
    }

    handleEditorInput();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await compressImageFile(file);
      setImageUrl(result);
    } catch (err) {
      alert("Không thể tải file ảnh này. Vui lòng thử lại!");
    }
  };

  const handleAddImage = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!imageUrl.trim()) {
      alert("Vui lòng tải ảnh lên hoặc nhập đường dẫn ảnh (URL)!");
      return;
    }

    let imgHtml = `<figure class="my-6 text-center">
      <img src="${imageUrl}" alt="${imageAlt || "Hình ảnh bài viết Terre Spa"}" class="rounded-xl mx-auto shadow-md max-h-[500px] object-cover w-full" />`;
    if (imageCaption) {
      imgHtml += `<figcaption class="text-xs text-brand-600 mt-2 italic">${imageCaption}</figcaption>`;
    }
    imgHtml += `</figure><p><br/></p>`;

    insertCustomHtml(imgHtml);
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
    setShowImageModal(false);
  };

  const handleAddLink = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!linkUrl.trim()) return;

    const url = linkUrl.startsWith("http") || linkUrl.startsWith("/") ? linkUrl : `https://${linkUrl}`;
    const text = linkText || url;
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-brand-700 underline font-medium hover:text-brand-900">${text}</a> `;

    insertCustomHtml(linkHtml);
    setLinkUrl("");
    setLinkText("");
    setShowLinkModal(false);
  };

  const insertCalloutBox = () => {
    const calloutHtml = `
      <div class="my-6 p-5 bg-brand-100/70 border-l-4 border-brand-700 rounded-r-xl text-brand-900">
        <p class="font-serif font-semibold text-brand-950 mb-1">🌿 Lời khuyên từ chuyên gia Terre:</p>
        <p class="text-sm italic">Hãy dành ít nhất 15 phút mỗi ngày để thả lỏng cơ thể và hít thở sâu với tinh dầu tự nhiên.</p>
      </div>
      <p><br/></p>
    `;
    insertCustomHtml(calloutHtml);
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-brand-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
      {/* Top Toolbar */}
      <div className="bg-brand-50/80 border-b border-brand-200 p-2 flex flex-wrap items-center justify-between gap-1 select-none">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Headings */}
          <div className="flex items-center border-r border-brand-200 pr-1.5 mr-1.5 gap-0.5">
            <button
              type="button"
              onClick={() => applyHeading("h2")}
              title="Tiêu đề lớn (H2)"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyHeading("h3")}
              title="Tiêu đề vừa (H3)"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyHeading("p")}
              title="Đoạn văn (Paragraph)"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors text-xs font-semibold px-2"
            >
              <Type className="w-4 h-4" />
            </button>
          </div>

          {/* Text Styles */}
          <div className="flex items-center border-r border-brand-200 pr-1.5 mr-1.5 gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              title="In đậm (Ctrl+B)"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              title="In nghiêng (Ctrl+I)"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              title="Gạch chân (Ctrl+U)"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("strikeThrough")}
              title="Gạch ngang"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Lists & Alignment */}
          <div className="flex items-center border-r border-brand-200 pr-1.5 mr-1.5 gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              title="Danh sách gạch đầu dòng"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              title="Danh sách số thứ tự"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyHeading("p")} // fallback or blockquote
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("formatBlock", "blockquote");
              }}
              title="Khối trích dẫn (Blockquote)"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r border-brand-200 pr-1.5 mr-1.5 gap-0.5">
            <button
              type="button"
              onClick={() => executeCommand("justifyLeft")}
              title="Căn trái"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyCenter")}
              title="Căn giữa"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyRight")}
              title="Căn phải"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyFull")}
              title="Căn đều 2 bên"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Media & Inserts */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={saveSelection}
              onClick={() => {
                saveSelection();
                setShowImageModal(true);
              }}
              title="Chèn hình ảnh"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <ImageIcon className="w-4 h-4 text-brand-700" />
              <span className="hidden sm:inline">Chèn ảnh</span>
            </button>
            <button
              type="button"
              onMouseDown={saveSelection}
              onClick={() => {
                saveSelection();
                setShowLinkModal(true);
              }}
              title="Chèn liên kết"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <LinkIcon className="w-4 h-4 text-brand-700" />
              <span className="hidden sm:inline">Link</span>
            </button>
            <button
              type="button"
              onMouseDown={saveSelection}
              onClick={() => {
                saveSelection();
                insertCalloutBox();
              }}
              title="Khung ghi chú nổi bật Spa"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors flex items-center gap-1 text-xs font-medium bg-brand-100/60"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="hidden md:inline">Khung Mẹo</span>
            </button>
            <button
              type="button"
              onMouseDown={saveSelection}
              onClick={() => executeCommand("insertHorizontalRule")}
              title="Đường phân cách ngang"
              className="p-1.5 text-brand-800 hover:bg-brand-200/70 rounded transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Switches & History */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => executeCommand("undo")}
            title="Hoàn tác (Undo)"
            className="p-1.5 text-brand-700 hover:bg-brand-200/70 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("redo")}
            title="Làm lại (Redo)"
            className="p-1.5 text-brand-700 hover:bg-brand-200/70 rounded transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-brand-300 mx-1" />
          <button
            type="button"
            onClick={() => {
              setIsHtmlMode(!isHtmlMode);
              setIsPreviewMode(false);
            }}
            title={isHtmlMode ? "Chuyển sang soạn thảo trực quan" : "Xem/Sửa mã nguồn HTML"}
            className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
              isHtmlMode ? "bg-brand-800 text-white" : "text-brand-800 hover:bg-brand-200/70"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPreviewMode(!isPreviewMode);
              setIsHtmlMode(false);
            }}
            title={isPreviewMode ? "Tắt xem trước" : "Xem trước bài viết"}
            className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
              isPreviewMode ? "bg-brand-800 text-white" : "text-brand-800 hover:bg-brand-200/70"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative">
        {isHtmlMode ? (
          <textarea
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              updateStats(e.target.value);
            }}
            placeholder="<div>Nhập mã HTML tại đây...</div>"
            style={{ minHeight }}
            className="w-full p-4 font-mono text-sm bg-brand-950 text-brand-50 focus:outline-none leading-relaxed resize-y"
          />
        ) : isPreviewMode ? (
          <div
            style={{ minHeight }}
            className="p-6 md:p-8 bg-brand-50/50 prose prose-brand max-w-none text-brand-950 leading-relaxed overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: value || "<p class='text-brand-400 italic'>Chưa có nội dung xem trước...</p>" }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onSelect={saveSelection}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="wysiwyg-content p-6 focus:outline-none leading-relaxed text-brand-950 prose prose-brand max-w-none overflow-y-auto"
          />
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="bg-brand-50/60 border-t border-brand-100 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-brand-600">
        <div className="flex items-center gap-4">
          <span>
            Số từ: <strong className="text-brand-800 font-semibold">{wordCount}</strong>
          </span>
          <span>
            Ký tự: <strong className="text-brand-800 font-semibold">{charCount}</strong>
          </span>
          <span>
            Thời gian đọc ước tính: <strong className="text-brand-800 font-semibold">{readingTime} phút</strong>
          </span>
        </div>
        <div className="text-brand-400 font-serif italic">
          Terre Spa WYSIWYG Editor
        </div>
      </div>

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-brand-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100 mb-4">
              <h4 className="text-base font-serif font-bold text-brand-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-600" /> Chèn hình ảnh vào bài viết
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-brand-400 hover:text-brand-700 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload file from device */}
              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                  1. Tải ảnh từ thiết bị
                </label>
                <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold border border-brand-200 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-brand-700" />
                  <span>Chọn tệp ảnh từ máy tính / điện thoại</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Or URL input */}
              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                  2. Hoặc dán đường dẫn ảnh (URL)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... hoặc link ảnh"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddImage();
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                  Mô tả ảnh (Alt text)
                </label>
                <input
                  type="text"
                  placeholder="Vd: Không gian gội đầu dưỡng sinh Terre Spa"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddImage();
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                  Chú thích hiển thị dưới ảnh (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Vd: Ảnh 1: Không gian phòng trị liệu thảo dược"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddImage();
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {imageUrl && (
                <div className="p-2 bg-brand-50 rounded-lg border border-brand-200 text-center">
                  <p className="text-[10px] text-brand-600 mb-1">Xem trước ảnh:</p>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-32 rounded object-cover mx-auto"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-100">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleAddImage()}
                  className="px-5 py-2 text-xs font-medium bg-brand-800 hover:bg-brand-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Chèn ảnh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insert Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-brand-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100 mb-4">
              <h4 className="text-base font-serif font-bold text-brand-900 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-brand-600" /> Chèn liên kết (Hyperlink)
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-brand-400 hover:text-brand-700 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                  Đường dẫn đích (URL) *
                </label>
                <input
                  type="text"
                  placeholder="https://terrespa.vn hoặc /#book"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddLink();
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                  Văn bản hiển thị
                </label>
                <input
                  type="text"
                  placeholder="Vd: Đặt lịch hẹn trải nghiệm tại Terre Spa"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddLink();
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-100">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLink()}
                  className="px-5 py-2 text-xs font-medium bg-brand-800 hover:bg-brand-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Chèn link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
