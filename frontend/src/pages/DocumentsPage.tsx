import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { documentService } from '../services/documentService';
import { Document as DocType } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Trash2, FileText, Edit } from 'lucide-react';

const DocumentsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocType | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('text');
  const [file, setFile] = useState<File | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await documentService.getDocuments();
      setDocuments(res);
    } catch (error) {
      console.error("Lỗi khi tải tư liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setNewTitle('');
    setNewDesc('');
    setFile(null);
    setNewType('text');
    setIsAddOpen(true);
  };

  const openEdit = (doc: DocType) => {
    setEditingId(doc.id);
    setNewTitle(doc.title);
    setNewDesc(doc.description || '');
    setNewType(doc.doc_type || 'text');
    setIsAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tư liệu này?")) {
      await documentService.deleteDocument(id);
      fetchDocs();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      try {
        await documentService.updateDocument(editingId, { title: newTitle, description: newDesc });
        setIsAddOpen(false);
        setEditingId(null);
        fetchDocs();
        alert("Cập nhật thành công!");
      } catch (error) {
        alert("Lỗi khi cập nhật tư liệu.");
      }
      return;
    }

    if (!file || !newTitle) {
      alert("Vui lòng nhập tên tư liệu và chọn file đính kèm.");
      return;
    }
    const formData = new FormData();
    formData.append('title', newTitle);
    formData.append('description', newDesc);
    formData.append('doc_type', newType);
    formData.append('document', file);

    try {
      await documentService.createDocument(formData);
      setIsAddOpen(false);
      setNewTitle('');
      setNewDesc('');
      setFile(null);
      fetchDocs();
      alert("Đã thêm tư liệu thành công!");
    } catch (error) {
      alert("Lỗi khi tải lên tư liệu.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-cream min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Tư liệu lịch sử</h1>
          <p className="text-gray-600">Danh sách các tài liệu, văn bản, hình ảnh lịch sử của dòng họ.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openAdd}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium shadow transition-colors"
          >
            + Thêm tư liệu
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
              <div className="h-48 bg-gray-200 relative flex items-center justify-center overflow-hidden">
                {doc.doc_type === 'image' && doc.file_url ? (
                  <img src={doc.file_url} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <FileText size={48} className="text-gray-400" />
                )}
                
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button 
                      onClick={() => openEdit(doc)} 
                      className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-sm"
                      title="Sửa tư liệu"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)} 
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-sm"
                      title="Xóa tư liệu"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-dark mb-2 line-clamp-2" title={doc.title}>{doc.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{doc.description}</p>
                <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
                  <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('vi-VN') : ''}</span>
                  <button 
                    onClick={() => setViewingDoc(doc)}
                    className="text-primary font-medium hover:underline bg-red-50 px-3 py-1 rounded"
                  >
                    Xem
                  </button>
                </div>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              Chưa có tư liệu nào.
            </div>
          )}
        </div>
      )}

      {/* Modal Add/Edit Document */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-dark">{editingId ? 'Sửa tư liệu' : 'Thêm tư liệu mới'}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tư liệu *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary h-24"
                />
              </div>
              
              {!editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại tư liệu</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="text">Văn bản / Tài liệu</option>
                      <option value="image">Hình ảnh</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File đính kèm *</label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer border rounded-md" 
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-medium"
                >
                  {editingId ? 'Cập nhật' : 'Tải lên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-4 border-b pb-4">
              <h2 className="text-2xl font-bold text-dark">{viewingDoc.title}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {viewingDoc.file_url && (
                <div className="mb-6 flex justify-center bg-gray-50 rounded-lg p-4">
                  {(viewingDoc.doc_type === 'image' || viewingDoc.file_url.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                    <img src={viewingDoc.file_url} alt={viewingDoc.title} className="max-w-full max-h-[60vh] object-contain rounded shadow-sm" />
                  ) : (
                    <a href={viewingDoc.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                      <FileText size={24} /> Nhấn vào đây để xem toàn bộ tệp ({viewingDoc.doc_type})
                    </a>
                  )}
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Mô tả chi tiết:</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingDoc.description || 'Không có mô tả.'}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t text-right">
              <button 
                onClick={() => setViewingDoc(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
