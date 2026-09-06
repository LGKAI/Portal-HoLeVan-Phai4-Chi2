import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import TreeCanvas from '../components/FamilyTree/TreeCanvas';
import MemberFormModal from '../components/FamilyTree/MemberFormModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useFamilyTree } from '../hooks/useFamilyTree';
import { useAuthStore } from '../store/authStore';
import { memberService } from '../services/memberService';
import { Member } from '../types';

const FamilyTreePage: React.FC = () => {
  const { members, loading, error, refetch } = useFamilyTree();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGen, setFilterGen] = useState<string>('all');
  const [showMobileStats, setShowMobileStats] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedMember, setSelectedMember] = useState<Member | undefined>();
  const [parentIdForAdd, setParentIdForAdd] = useState<number | undefined>();
  const [spouseIdForAdd, setSpouseIdForAdd] = useState<number | undefined>();
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleAddChild = (parentId: number) => {
    setFormMode('add');
    setSelectedMember(undefined);
    setParentIdForAdd(parentId);
    setSpouseIdForAdd(undefined);
    setIsFormOpen(true);
  };

  const handleAddSpouse = (memberId: number) => {
    const husbandOrWife = members.find(m => m.id === memberId);
    const existingSpouses = members.filter(m => m.spouse_id === memberId || (husbandOrWife?.spouse_id && m.id === husbandOrWife.spouse_id));
    const spouseCount = existingSpouses.length;
    
    // Quy ước: 0 vợ -> Chánh phối, 1 vợ -> Thứ phối, 2 vợ -> Thứ thứ phối, 3 vợ -> Thứ thứ thứ phối...
    const defaultSpouseType = spouseCount === 0 
      ? 'Chánh phối' 
      : spouseCount === 1 
      ? 'Thứ phối' 
      : `${'Thứ '.repeat(spouseCount - 1)}Thứ phối`;

    setFormMode('add');
    setSelectedMember({
      spouse_id: memberId,
      gender: husbandOrWife?.gender === 'male' ? 'female' : 'male',
      spouse_type: defaultSpouseType,
      generation_in_branch: husbandOrWife?.generation_in_branch || 1,
    } as any);
    setParentIdForAdd(undefined);
    setSpouseIdForAdd(memberId);
    setIsFormOpen(true);
  };

  const handleEdit = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setFormMode('edit');
      setSelectedMember(member);
      setParentIdForAdd(undefined);
      setSpouseIdForAdd(undefined);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    const confirmName = member ? member.full_name : 'thành viên này';
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${confirmName}" khỏi cây gia phả?`)) {
      try {
        await memberService.deleteMember(memberId);
        alert('Đã xóa thành công!');
        await refetch();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa thành viên.');
      }
    }
  };

  const handleClickDetail = (member: Member) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  const handleSubmitForm = async (data: any) => {
    try {
      const { avatarFile, ...memberData } = data;
      
      if (formMode === 'add') {
        const payload: any = { ...memberData };
        if (parentIdForAdd) {
          const parent = members.find(m => m.id === parentIdForAdd);
          if (parent) {
            payload.generation_in_branch = parent.generation_in_branch + 1;
            if (parent.gender === 'male') {
              payload.father_id = parent.id;
              if (memberData.mother_id) {
                payload.mother_id = parseInt(memberData.mother_id, 10);
              }
            } else {
              payload.mother_id = parent.id;
              if (parent.spouse_id) {
                payload.father_id = parent.spouse_id;
              }
            }
          }
        }
        if (spouseIdForAdd) {
          const spouse = members.find(m => m.id === spouseIdForAdd);
          if (spouse) {
            payload.generation_in_branch = spouse.generation_in_branch;
            payload.spouse_id = spouse.id;
          }
        }
        const res = await memberService.createMember(payload);
        const newMemberId = res.data?.id || res.id;
        
        if (newMemberId && avatarFile) {
          const formData = new FormData();
          formData.append('avatar', avatarFile);
          const token = useAuthStore.getState().token;
          await fetch(`/api/members/${newMemberId}/avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
        }
        
        alert('Đã thêm thành viên thành công!');
      } else if (formMode === 'edit' && selectedMember) {
        await memberService.updateMember(selectedMember.id, memberData);
        
        if (avatarFile) {
          const formData = new FormData();
          formData.append('avatar', avatarFile);
          const token = useAuthStore.getState().token;
          await fetch(`/api/members/${selectedMember.id}/avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
        }
        
        alert('Đã cập nhật thông tin thành viên!');
      }
      setIsFormOpen(false);
      await refetch();
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Phiên đăng nhập của bạn đã hết hạn. Vui lòng bấm "Đăng nhập" ở góc trên bên phải để đăng nhập lại bằng tài khoản Quản trị viên!');
        useAuthStore.getState().logout();
      } else {
        alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin.');
      }
    }
  };

  const filteredMembers = React.useMemo(() => {
    let result = members;
    
    if (filterGen !== 'all') {
      const targetGen = parseInt(filterGen, 10);
      result = result.filter(m => {
        const gen = Number(m.generation_in_branch);
        return gen >= targetGen - 1 && gen <= targetGen + 1;
      });
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m => m.full_name.toLowerCase().includes(term));
      
      // Include spouses of matched members for better visualization
      const matchedIds = new Set(result.map(m => m.id));
      const spousesToInclude = members.filter(m => 
        (m.spouse_id && matchedIds.has(m.spouse_id)) || 
        (result.some(r => r.spouse_id === m.id))
      );
      
      spousesToInclude.forEach(spouse => {
        if (!matchedIds.has(spouse.id)) {
          result.push(spouse);
          matchedIds.add(spouse.id);
        }
      });
    }
    
    return result;
  }, [members, filterGen, searchTerm]);

  const memberStats = React.useMemo(() => {
    let total = 0;
    let deceased = 0;
    let living = 0;

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      total++;
      const isDeceased = Boolean(m.is_deceased) || String(m.is_deceased) === '1' || String(m.is_deceased).toLowerCase() === 'true';
      if (isDeceased) {
        deceased++;
      } else {
        living++;
      }
    }

    return { total, deceased, living };
  }, [members]);

  const availableMothers = React.useMemo(() => {
    if (!parentIdForAdd) return [];
    const parent = members.find(m => m.id === parentIdForAdd);
    if (!parent) return [];
    if (parent.gender === 'male') {
      return members.filter(m => m.spouse_id === parent.id && m.gender === 'female');
    }
    return [];
  }, [parentIdForAdd, members]);

  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="h-[calc(100dvh-64px)] min-h-[calc(100vh-64px)] flex flex-col bg-cream relative overflow-hidden">
      {/* Toolbar */}
      <div className="bg-[#FFFDF5] p-3 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3 z-10 border-b border-[#E8D8C3] relative">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-1.5 w-full border border-[#D9C4A6] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filterGen}
              onChange={(e) => setFilterGen(e.target.value)}
              className="py-1.5 px-3 border border-[#D9C4A6] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
            >
              <option value="all">Tất cả các đời</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(gen => (
                <option key={gen} value={gen.toString()}>Đời thứ {gen + 8}</option>
              ))}
            </select>
          </div>
        </div>
      </div>



      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4 z-10">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 w-full relative bg-[#FFFDF5]">
        {/* Thống kê thành viên - Góc trên trái */}
        <div className="absolute top-3 left-3 sm:left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-[#E8D8C3] text-xs sm:text-sm select-none pointer-events-auto transition-all">
          {/* Mobile compact header button */}
          <button
            type="button"
            onClick={() => setShowMobileStats(!showMobileStats)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 font-medium text-gray-800"
          >
            <span className="text-blue-500 font-bold">-</span>
            <span>Tổng số thành viên: <strong className="font-bold text-blue-600">{memberStats.total}</strong></span>
            <span className="text-xs text-gray-400 ml-1">{showMobileStats ? '▲' : '▼'}</span>
          </button>

          {/* Full stats (collapsible on mobile, always visible on sm+) */}
          <div className={`${showMobileStats ? 'flex' : 'hidden'} sm:flex flex-col gap-1.5 text-gray-700 font-medium px-4 py-2.5 sm:py-3 border-t sm:border-t-0 border-[#E8D8C3]/50`}>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-blue-500 font-bold">-</span>
              <span>Tổng số thành viên: <strong className="font-bold text-blue-600">{memberStats.total}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">-</span>
              <span>Số thành viên đã mất: <strong className="font-bold text-red-600">{memberStats.deceased}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">-</span>
              <span>Số thành viên còn sống: <strong className="font-bold text-green-600">{memberStats.living}</strong></span>
            </div>
          </div>
        </div>

        <TreeCanvas 
          members={filteredMembers}
          allMembers={members}
          onAddChild={handleAddChild}
          onAddSpouse={handleAddSpouse}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClickDetail={handleClickDetail}
        />
      </div>

      <MemberFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitForm}
        mode={formMode}
        initialData={selectedMember}
        parentId={parentIdForAdd}
        spouseId={spouseIdForAdd}
        availableMothers={availableMothers}
      />

      {/* Simple Detail Modal */}
      {isDetailOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-primary mb-4 border-b pb-2 flex justify-between items-center">
              <span>Chi tiết thành viên</span>
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleDelete(selectedMember.id);
                  }}
                  className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                >
                  Xóa thành viên
                </button>
              )}
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>Họ và tên:</strong> {selectedMember.full_name}</p>
              <p><strong>Giới tính:</strong> {selectedMember.gender === 'male' ? 'Nam' : 'Nữ'}</p>
              {selectedMember.spouse_type && <p><strong>Vai vế:</strong> {selectedMember.spouse_type}</p>}
              <p><strong>Đời thứ:</strong> {Number(selectedMember.generation_in_branch) + 8}</p>
              <p><strong>Ngày sinh:</strong> {selectedMember.birth_date || 'Không rõ'}</p>
              {selectedMember.is_deceased && (
                <>
                  <p><strong>Ngày mất:</strong> {selectedMember.death_date || 'Không rõ'}</p>
                  <p><strong>Nơi an táng:</strong> {selectedMember.burial_place || 'Chưa cập nhật'}</p>
                </>
              )}
              <p><strong>Quê quán:</strong> {selectedMember.hometown || 'Chưa cập nhật'}</p>
              <p><strong>Nghề nghiệp:</strong> {selectedMember.occupation || 'Chưa cập nhật'}</p>
              <p><strong>Tình trạng:</strong> {selectedMember.is_deceased ? 'Đã mất' : 'Còn sống'}</p>
              {selectedMember.bio && <p><strong>Tiểu sử:</strong> {selectedMember.bio}</p>}
            </div>
            
            {isAdmin && (
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cập nhật ảnh đại diện</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('avatar', file);
                      try {
                        const token = useAuthStore.getState().token;
                        const res = await fetch(`/api/members/${selectedMember.id}/avatar`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                          body: formData
                        });
                        if (res.ok) {
                          alert('Cập nhật ảnh thành công!');
                          setIsDetailOpen(false);
                          await refetch();
                        } else {
                          alert('Có lỗi xảy ra khi tải ảnh lên.');
                        }
                      } catch (error) {
                        alert('Lỗi kết nối.');
                      }
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              {isAdmin && (
                <button 
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleEdit(selectedMember.id);
                  }} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Sửa thông tin
                </button>
              )}
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-medium">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTreePage;
