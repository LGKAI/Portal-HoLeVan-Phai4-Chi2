import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image as ImageIcon,
  Loader2,
  Heading2,
  Heading3,
} from 'lucide-react';
import { newsService } from '../../services/newsService';

interface RichDocEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Chuyển đổi văn bản thô (có xuống dòng \n hoặc \n\n) thành cấu trúc HTML <p>...</p> chuẩn,
 * hoặc giữ nguyên nếu nội dung đã là HTML phong phú.
 */
export const toHtmlFormat = (raw: string): string => {
  if (!raw) return '';
  // Kiểm tra xem nội dung đã chứa các thẻ khối HTML hay chưa
  const hasHtml = /<(p|div|br|h[1-6]|ul|ol|li|img|blockquote)[\s\S]*>/i.test(raw);
  if (hasHtml) {
    return raw;
  }

  // Nếu là plain text có dấu xuống dòng: tách thành các đoạn theo \n\n hoặc \n
  const paragraphs = raw.split(/\r?\n\s*\r?\n/);
  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      // Thay thế các dòng đơn lẻ bên trong đoạn bằng <br>
      const withBr = trimmed.replace(/\r?\n/g, '<br>');
      return `<p>${withBr}</p>`;
    })
    .filter(Boolean)
    .join('');
};

const RichDocEditor: React.FC<RichDocEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung bài viết... Bạn có thể copy ảnh và dán (Ctrl+V) trực tiếp vào đây như Word/Google Docs.',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isInternalChangeRef = useRef(false);

  // Thiết lập mặc định khi Enter sẽ tạo thẻ <p>
  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch (_) {}
  }, []);

  // Đồng bộ giá trị khởi tạo hoặc khi value thay đổi từ ngoài (ví dụ bấm Sửa bài viết)
  useEffect(() => {
    if (editorRef.current) {
      if (isInternalChangeRef.current) {
        isInternalChangeRef.current = false;
        return;
      }
      const formattedHtml = toHtmlFormat(value || '');
      if (editorRef.current.innerHTML !== formattedHtml) {
        editorRef.current.innerHTML = formattedHtml;
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Thực thi lệnh định dạng văn bản (Bold, Italic, Align, List...)
  const execCmd = (cmd: string, arg: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, arg);
    handleInput();
  };

  // Chèn thẻ ảnh HTML vào vị trí con trỏ trong bài viết
  const insertImageHtml = (url: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const imgHtml = `<p class="my-3 text-center"><img src="${url}" alt="Ảnh bài viết" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px auto; display: block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" /></p><p><br></p>`;
    document.execCommand('insertHTML', false, imgHtml);
    handleInput();
  };

  // Upload file ảnh lên server và chèn vào bài viết
  const uploadAndInsertImage = async (file: File) => {
    setIsUploading(true);
    try {
      // Tải lên server qua API
      const uploadedUrl = await newsService.uploadImage(file);
      insertImageHtml(uploadedUrl);
    } catch (err) {
      console.warn('Không thể tải ảnh lên server, dùng định dạng base64 fallback:', err);
      // Fallback lưu dạng Base64 để người dùng không bao giờ bị mất ảnh
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          insertImageHtml(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Xử lý sự kiện dán (Ctrl + V)
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            await uploadAndInsertImage(file);
          }
          return;
        }
      }
    }

    // Nếu dán văn bản thuần túy có các đoạn xuống dòng:
    const text = e.clipboardData?.getData('text/plain');
    const html = e.clipboardData?.getData('text/html');
    if (text && !html && text.includes('\n')) {
      e.preventDefault();
      const formatted = toHtmlFormat(text);
      document.execCommand('insertHTML', false, formatted);
      handleInput();
    }
  };

  // Xử lý sự kiện kéo thả ảnh vào khung soạn thảo
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          e.preventDefault();
          await uploadAndInsertImage(files[i]);
          return;
        }
      }
    }
  };

  // Khi người dùng chọn file ảnh từ nút bấm "Chèn ảnh"
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      await uploadAndInsertImage(selectedFile);
      e.target.value = '';
    }
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
      {/* Thanh công cụ định dạng (Toolbar) */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 select-none">
        {/* Đoạn văn / Tiêu đề */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('formatBlock', '<h2>');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded flex items-center gap-1 text-xs font-semibold"
          title="Tiêu đề lớn (H2)"
        >
          <Heading2 size={16} /> Tiêu đề lớn
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('formatBlock', '<h3>');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded flex items-center gap-1 text-xs font-semibold"
          title="Tiêu đề vừa (H3)"
        >
          <Heading3 size={16} /> Tiêu đề vừa
        </button>

        <div className="h-5 w-[1px] bg-gray-300 mx-1" />

        {/* Định dạng cơ bản: In đậm, In nghiêng, Gạch chân */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('bold');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
          title="In đậm (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('italic');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
          title="In nghiêng (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('underline');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
          title="Gạch chân (Ctrl+U)"
        >
          <Underline size={16} />
        </button>

        <div className="h-5 w-[1px] bg-gray-300 mx-1" />

        {/* Căn lề */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('justifyLeft');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
          title="Căn trái"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('justifyCenter');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
          title="Căn giữa"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('justifyRight');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
          title="Căn phải"
        >
          <AlignRight size={16} />
        </button>

        <div className="h-5 w-[1px] bg-gray-300 mx-1" />

        {/* Danh sách */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('insertUnorderedList');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
          title="Danh sách gạch đầu dòng"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('insertOrderedList');
          }}
          className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
          title="Danh sách số"
        >
          <ListOrdered size={16} />
        </button>

        <div className="h-5 w-[1px] bg-gray-300 mx-1" />

        {/* Nút chèn ảnh từ máy */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded flex items-center gap-1 text-xs font-bold border border-blue-200 transition-colors"
          title="Tải ảnh từ máy tính để chèn vào nội dung bài viết"
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin text-blue-600" />
              Đang tải ảnh...
            </>
          ) : (
            <>
              <ImageIcon size={16} />
              + Chèn ảnh
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Dòng hướng dẫn ngắn gọn cho người dùng */}
      <div className="px-3 py-1 bg-amber-50/70 border-b border-amber-100 text-[11px] text-amber-800 flex items-center justify-between">
        <span>
          💡 <strong>Mẹo:</strong> Bạn có thể copy ảnh từ bất kỳ đâu rồi nhấn <strong>Ctrl + V</strong> trực tiếp vào khung dưới để dán ảnh vào bài viết như Word/Google Docs.
        </span>
      </div>

      {/* Vùng soạn thảo contentEditable */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        className="p-4 min-h-[260px] max-h-[500px] overflow-y-auto outline-none prose max-w-none text-gray-800 text-[15px] leading-relaxed [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:mb-4 [&_p]:leading-relaxed [&_div]:mb-4"
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichDocEditor;
