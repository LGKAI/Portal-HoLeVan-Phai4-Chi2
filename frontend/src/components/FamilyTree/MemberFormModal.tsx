import React, { useState, useEffect, useCallback } from 'react';
import { X, Crop as CropIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';
import { Member } from '../../types';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Member>) => void;
  initialData?: Partial<Member>;
  mode: 'add' | 'edit';
  parentId?: number;
  spouseId?: number;
  availableMothers?: Member[];
}

const MemberFormModal: React.FC<MemberFormModalProps> = ({ 
  isOpen, onClose, onSubmit, initialData, mode, parentId, spouseId, availableMothers 
}) => {
  const [formData, setFormData] = useState<Partial<Member> & { avatarFile?: File | null }>({
    full_name: '',
    birth_name: '',
    gender: 'male',
    is_deceased: false,
    birth_date: '',
    death_date: '',
    occupation: '',
    burial_place: '',
    bio: '',
    generation_in_branch: 1,
  });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        setFormData(prev => ({ ...prev, avatarFile: croppedImage }));
        setIsCropping(false);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          full_name: '',
          birth_name: '',
          gender: 'male',
          is_deceased: false,
          birth_date: '',
          death_date: '',
          occupation: '',
          burial_place: '',
          bio: '',
          generation_in_branch: 1,
          father_id: parentId,
          spouse_id: spouseId,
          spouse_type: spouseId ? 'Chánh phối' : undefined,
        });
      }
    }
  }, [isOpen, initialData, parentId, spouseId]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const showSpouseTypeField = !!(spouseId || formData.spouse_id || formData.spouse_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-primary">
            {mode === 'add' ? 'Thêm thành viên mới' : 'Cập nhật thông tin'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <form id="member-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                <input required type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <select name="gender" value={formData.gender || 'male'} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary">
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="unknown">Không rõ</option>
                </select>
              </div>
              {showSpouseTypeField && (
                <div className="col-span-1 md:col-span-2 bg-pink-50/60 p-3 rounded-md border border-pink-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Vai vế hôn phối (Tự động theo thứ tự)
                  </label>
                  <input
                    type="text"
                    name="spouse_type"
                    value={formData.spouse_type || 'Chánh phối'}
                    readOnly
                    className="w-full px-3 py-2 border border-pink-300 rounded-md bg-white text-gray-800 font-bold text-sm focus:outline-none cursor-default shadow-xs"
                  />
                </div>
              )}


              {parentId && availableMothers && availableMothers.length > 0 && (
                <div className="col-span-1 md:col-span-2 bg-blue-50/50 p-3 rounded-md border border-blue-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mẹ (Người sinh thành)</label>
                  <select 
                    name="mother_id" 
                    value={formData.mother_id || ''} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary bg-white text-sm"
                  >
                    <option value="">-- Chưa xác định / Chọn mẹ sau --</option>
                    {availableMothers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} {m.spouse_type ? `(${m.spouse_type})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {mode === 'add' && !parentId && !spouseId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đời thứ (theo Phái) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    min="9" 
                    max="16" 
                    name="generation_in_branch" 
                    value={Number(formData.generation_in_branch || 1) + 8} 
                    onChange={(e) => setFormData(prev => ({ ...prev, generation_in_branch: Number(e.target.value) - 8 }))} 
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                  />
                </div>
              )}

              <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_deceased" name="is_deceased" checked={formData.is_deceased || false} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded" />
                <label htmlFor="is_deceased" className="text-sm font-medium text-gray-700">Đã mất</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                <input type="text" name="birth_date" value={formData.birth_date || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" />
              </div>
              
              {formData.is_deceased && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mất</label>
                    <input type="text" name="death_date" value={formData.death_date || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nơi an táng (Mộ)</label>
                    <input type="text" name="burial_place" value={formData.burial_place || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quê quán</label>
                <input type="text" name="hometown" value={formData.hometown || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nghề nghiệp</label>
                <input type="text" name="occupation" value={formData.occupation || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                {formData.avatar_url && !formData.avatarFile && (
                  <div className="flex items-center gap-4 mb-2">
                    <img src={formData.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, avatar_url: '', avatarFile: null }))}
                      className="text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded"
                    >
                      Xóa ảnh hiện tại
                    </button>
                  </div>
                )}
                {formData.avatarFile && (
                  <div className="flex items-center gap-4 mb-2">
                    <img src={URL.createObjectURL(formData.avatarFile)} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, avatarFile: null }))}
                      className="text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded"
                    >
                      Bỏ chọn ảnh này
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={onFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer border rounded-md" 
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử / Ghi chú</label>
                <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"></textarea>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100">
            Hủy
          </button>
          <button type="submit" form="member-form" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Lưu thông tin
          </button>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl flex flex-col h-[500px]">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CropIcon size={20} /> Cắt ảnh đại diện
              </h2>
              <button onClick={() => { setIsCropping(false); setImageSrc(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="relative flex-1 bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button type="button" onClick={() => { setIsCropping(false); setImageSrc(null); }} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100">
                Hủy
              </button>
              <button type="button" onClick={showCroppedImage} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                Áp dụng ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberFormModal;
