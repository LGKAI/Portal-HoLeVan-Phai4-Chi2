import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Search, Filter, Pencil, X, Check, RotateCcw, Lock, AlertCircle } from 'lucide-react';
import { MemorialRecord } from '../types';
import defaultMemorials from '../data/memorials.json';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const MONTH_OPTIONS = [
  { id: 0, label: 'Tất cả 12 tháng', shortLabel: 'Tất cả' },
  { id: 1, label: 'Tháng Giêng (Tháng 1)', shortLabel: 'Tháng 1' },
  { id: 2, label: 'Tháng 2', shortLabel: 'Tháng 2' },
  { id: 3, label: 'Tháng 3', shortLabel: 'Tháng 3' },
  { id: 4, label: 'Tháng 4', shortLabel: 'Tháng 4' },
  { id: 5, label: 'Tháng 5', shortLabel: 'Tháng 5' },
  { id: 6, label: 'Tháng 6', shortLabel: 'Tháng 6' },
  { id: 7, label: 'Tháng 7', shortLabel: 'Tháng 7' },
  { id: 8, label: 'Tháng 8', shortLabel: 'Tháng 8' },
  { id: 9, label: 'Tháng 9', shortLabel: 'Tháng 9' },
  { id: 10, label: 'Tháng 10', shortLabel: 'Tháng 10' },
  { id: 11, label: 'Tháng 11', shortLabel: 'Tháng 11' },
  { id: 12, label: 'Tháng Chạp (Tháng 12)', shortLabel: 'Tháng 12' },
  { id: 99, label: 'Chưa rõ ngày tháng (chỉ có năm mất)', shortLabel: 'Chưa rõ ngày' },
];

function getPhaiGeneration(desc?: string): string {
  if (!desc) return '-';
  const phaiMatch = desc.match(/[Đđ]ời\s*(\d+)\s*Phái/i);
  if (phaiMatch) return phaiMatch[1];
  const phaiMatch2 = desc.match(/Phái[^\d]*[Đđ]ời\s*(\d+)/i);
  if (phaiMatch2) return phaiMatch2[1];
  const allDoi = [...desc.matchAll(/[Đđ]ời\s*(\d+)/gi)];
  if (allDoi.length > 1) return allDoi[allDoi.length - 1][1];
  if (allDoi.length === 1) return allDoi[0][1];
  const numMatch = desc.match(/\d+/);
  return numMatch ? numMatch[0] : desc;
}

const MemorialCalendarPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Khởi tạo sẵn từ dữ liệu hiện có để luôn có đầy đủ ngày giỗ ngay lập tức
  const [memorials, setMemorials] = useState<MemorialRecord[]>(defaultMemorials as MemorialRecord[]);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Trạng thái modal chỉnh sửa ngày giỗ ngoại lệ cho quản trị viên
  const [editingRecord, setEditingRecord] = useState<MemorialRecord | null>(null);
  const [editGioDateInput, setEditGioDateInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tự động đồng bộ với CSDL qua API để khi admin cập nhật/thêm người mất mới sẽ tự động nạp vào
  const fetchMemorials = () => {
    api.get('/memorials')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setMemorials(res.data.data as MemorialRecord[]);
        }
      })
      .catch((err) => {
        console.warn('API /memorials fetch error, sử dụng dữ liệu mặc định:', err);
      });
  };

  useEffect(() => {
    fetchMemorials();
  }, []);

  const handleOpenEdit = (record: MemorialRecord) => {
    setEditingRecord(record);
    setEditGioDateInput(record.gio_date || '');
    setSaveError(null);
  };

  const handleCloseEdit = () => {
    if (isSaving) return;
    setEditingRecord(null);
    setEditGioDateInput('');
    setSaveError(null);
  };

  const handleSaveCustomDate = async (targetDate: string | null) => {
    if (!editingRecord || !editingRecord.id) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await api.put(`/memorials/${editingRecord.id}`, {
        gio_date: targetDate,
      });

      if (res.data?.success && res.data?.data) {
        const updated = res.data.data;
        setMemorials((prev) =>
          prev.map((item) =>
            item.id === editingRecord.id
              ? {
                ...item,
                gio_date: updated.gio_date,
                month: updated.month,
                is_custom: updated.is_custom,
                custom_gio_date: updated.custom_gio_date,
              }
              : item
          )
        );
        setToastMessage(res.data.message || 'Cập nhật ngày giỗ thành công!');
        setTimeout(() => setToastMessage(null), 3500);
        handleCloseEdit();
      } else {
        setSaveError(res.data?.message || 'Có lỗi xảy ra khi lưu ngày giỗ.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error saving custom memorial date:', err);
      setSaveError(err.response?.data?.message || 'Lỗi khi kết nối đến máy chủ.');
    } finally {
      setIsSaving(false);
    }
  };

  // Đếm số lượng theo từng tháng
  const monthCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) counts[m] = 0;
    counts[99] = 0;
    memorials.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        counts[item.month] = (counts[item.month] || 0) + 1;
      } else {
        counts[99] = (counts[99] || 0) + 1;
      }
    });
    return counts;
  }, [memorials]);

  // Lọc dữ liệu theo tháng và từ khóa tìm kiếm
  const filteredRecords = useMemo(() => {
    let list = memorials;
    if (selectedMonth === 99) {
      list = list.filter((m) => m.month === 0);
    } else if (selectedMonth !== 0) {
      list = list.filter((m) => m.month === selectedMonth);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((m) =>
        (m.full_name && m.full_name.toLowerCase().includes(q)) ||
        (m.father_name && m.father_name.toLowerCase().includes(q)) ||
        (m.mother_name && m.mother_name.toLowerCase().includes(q)) ||
        (m.burial_place && m.burial_place.toLowerCase().includes(q)) ||
        (m.generation_desc && m.generation_desc.toLowerCase().includes(q)) ||
        (m.gio_date && m.gio_date.toLowerCase().includes(q)) ||
        (m.death_date && m.death_date.toLowerCase().includes(q))
      );
    }
    return list;
  }, [memorials, selectedMonth, searchTerm]);

  // Danh sách các tháng cần hiển thị
  const displayMonths = useMemo(() => {
    if (selectedMonth === 99) {
      return [0];
    }
    if (selectedMonth !== 0) {
      return [selectedMonth];
    }
    // Hiển thị từ tháng 1 đến tháng 12, và nếu có bản ghi chưa rõ tháng thì hiển thị thêm ở cuối
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (memorials.some((m) => m.month === 0)) {
      months.push(0);
    }
    return months;
  }, [selectedMonth, memorials]);

  return (
    <div className="bg-cream min-h-screen pb-20 relative">
      {/* Toast thông báo thành công */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-medium border border-emerald-500 animate-fade-in">
          <Check size={18} className="text-emerald-200 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-8">
        {/* Bộ lọc tháng & Tìm kiếm */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/80 p-3.5 sm:p-5 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-center mb-4 sm:mb-6">
            <div className="relative w-full sm:w-[450px] md:w-[490px] max-w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo họ tên, thân phụ, thân mẫu, nơi an táng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs sm:text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
                >
                  Xóa
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 self-start md:self-center">
              <Calendar size={16} className="text-primary flex-shrink-0" />
              <span>
                Hiển thị: <strong>{filteredRecords.length}</strong> ngày giỗ
                {selectedMonth !== 0 && ` (${MONTH_OPTIONS.find((m) => m.id === selectedMonth)?.label})`}
              </span>
            </div>
          </div>

          {/* Nút bấm chọn Tháng 1 -> Tháng 12 & Chưa rõ */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-2.5 flex items-center gap-1.5">
              <Filter size={14} className="text-primary" /> CHỌN THÁNG ÂM LỊCH:
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-14 gap-1.5 sm:gap-2">
              {MONTH_OPTIONS.map((m) => {
                const isSelected = selectedMonth === m.id;
                const count = m.id === 0 ? memorials.length : monthCounts[m.id] || 0;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMonth(m.id)}
                    className={`px-1.5 py-1.5 sm:px-2 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 border ${isSelected
                        ? 'bg-primary text-white border-primary shadow-md scale-105'
                        : 'bg-cream-light hover:bg-amber-100 text-gray-800 border-amber-200'
                      }`}
                  >
                    <span>{m.shortLabel}</span>
                    <span
                      className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-secondary text-primary-dark' : 'bg-white/80 text-gray-600'
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Danh sách các tháng và bảng dữ liệu */}
        <div className="space-y-6 sm:space-y-10">
          {displayMonths.map((mNum) => {
            const recordsInMonth = filteredRecords.filter((r) => r.month === mNum);
            const monthInfo =
              mNum === 0
                ? { id: 99, label: 'Chưa rõ ngày tháng giỗ cụ thể (chỉ ghi nhận năm mất)', shortLabel: 'Chưa rõ ngày' }
                : MONTH_OPTIONS.find((m) => m.id === mNum);

            // Nếu người dùng đang tìm kiếm mà tháng này không có kết quả thì ẩn đi (trừ khi đang chọn riêng tháng này)
            if (recordsInMonth.length === 0 && selectedMonth === 0 && searchTerm.trim()) {
              return null;
            }

            return (
              <div
                key={mNum}
                id={`thang-${mNum}`}
                className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden"
              >
                {/* Tiêu đề Tháng */}
                <div className="bg-gradient-to-r from-cream-dark via-amber-100 to-cream-light px-4 sm:px-6 py-3 sm:py-4 border-b border-amber-200 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary text-secondary flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm flex-shrink-0">
                      {mNum === 0 ? '?' : mNum}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-bold text-primary-dark">
                        {monthInfo?.label}
                      </h2>
                      <p className="text-[11px] sm:text-xs text-gray-600">
                        {mNum === 0
                          ? 'Các vị tiền nhân, con cháu có năm mất nhưng chưa ghi nhận ngày tháng Âm lịch cụ thể'
                          : `Tháng ${mNum} Âm lịch hằng năm`}
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary-dark px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border border-primary/20">
                    {recordsInMonth.length} vị tiền nhân / con cháu
                  </div>
                </div>

                {/* Bảng dữ liệu của tháng */}
                {recordsInMonth.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    {searchTerm
                      ? `Không có kết quả nào phù hợp với từ khóa "${searchTerm}" trong ${monthInfo?.label}.`
                      : `Gia phả hiện tại chưa ghi nhận ngày giỗ cụ thể trong ${monthInfo?.label}.`}
                  </div>
                ) : (
                  <div>
                    <div className="text-[11px] text-gray-500 italic px-3 py-1.5 bg-amber-50/70 border-b border-amber-100 sm:hidden flex items-center justify-between">
                      <span>← Vuốt ngang để xem đủ thông tin</span>
                      <span>→</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[13px] table-fixed min-w-[980px]">
                        <colgroup>
                          <col style={{ width: '210px' }} />
                          <col style={{ width: '180px' }} />
                          <col style={{ width: '82px' }} />
                          <col style={{ width: '170px' }} />
                          <col style={{ width: '170px' }} />
                          <col />
                        </colgroup>
                        <thead className="bg-primary text-white text-[11px] sm:text-xs uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3.5 w-[210px]">Ngày giỗ</th>
                            <th className="py-2.5 px-3.5 w-[180px]">Họ và tên</th>
                            <th className="py-2.5 px-2 w-[82px] text-center whitespace-nowrap">Đời thứ</th>
                            <th className="py-2.5 px-3.5 w-[170px]">Thân phụ</th>
                            <th className="py-2.5 px-3.5 w-[170px]">Thân mẫu</th>
                            <th className="py-2.5 px-3.5">Nơi an táng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {recordsInMonth.map((item, idx) => {
                            const isThuyTo =
                              item.notes?.includes('Thuỷ tổ') ||
                              item.notes?.includes('Thủy tổ') ||
                              item.id === 1005 ||
                              item.id === 1006;
                            const isLietSi = item.notes?.includes('Liệt sĩ');

                            return (
                              <tr
                                key={item.id || idx}
                                className={`transition-colors hover:bg-amber-50/70 ${idx % 2 === 0 ? 'bg-white' : 'bg-cream-light/40'
                                  } ${isThuyTo ? 'bg-yellow-50/50' : ''}`}
                              >
                                {/* Ngày giỗ (chữ đỏ) kèm icon ngòi bút cho Quản trị viên */}
                                <td className="py-2.5 px-3.5 align-top break-words">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-primary-dark text-[13px]">
                                      {item.gio_date}
                                    </span>

                                    {item.is_custom && (
                                      <span
                                        className="inline-flex items-center text-[9.5px] bg-amber-100 text-amber-900 font-semibold px-1 py-0.2 rounded border border-amber-300"
                                        title="Ngày giỗ ngoại lệ (do Quản trị viên tùy chỉnh)"
                                      >
                                        Ngoại lệ
                                      </span>
                                    )}

                                    {isAdmin && item.id && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEdit(item)}
                                        className="inline-flex items-center justify-center p-1 text-primary-dark/70 hover:text-primary hover:bg-amber-100/90 rounded transition-colors group cursor-pointer"
                                        title="Chỉnh sửa ngày giỗ ngoại lệ (Quyền Quản trị viên)"
                                      >
                                        <Pencil size={12} className="group-hover:scale-110 transition-transform" />
                                      </button>
                                    )}
                                  </div>
                                  {item.death_date && (
                                    <div className="text-[10.5px] text-gray-500 mt-0.5">
                                      Mất: {item.death_date}
                                    </div>
                                  )}
                                </td>

                                {/* Họ và tên */}
                                <td className="py-2.5 px-3.5 align-top whitespace-nowrap">
                                  <div className="font-bold text-dark text-[13px] uppercase flex items-center gap-1.5 flex-nowrap">
                                    <span className="whitespace-nowrap">{item.full_name}</span>
                                    {isThuyTo && (
                                      <span className="bg-secondary text-primary-dark text-[9.5px] font-extrabold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                                        Thủy tổ
                                      </span>
                                    )}
                                    {isLietSi && (
                                      <span className="bg-red-100 text-red-700 text-[9.5px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                                        Liệt sĩ
                                      </span>
                                    )}
                                  </div>
                                  {item.gender && (
                                    <div className="text-[10.5px] text-gray-500 mt-0.5 whitespace-nowrap">
                                      <span className={item.gender === 'Nữ' ? 'text-pink-600 font-medium' : 'text-blue-600 font-medium'}>
                                        {item.gender}
                                      </span>
                                    </div>
                                  )}
                                </td>

                                {/* Đời thứ */}
                                <td className="py-2.5 px-2 text-center align-top whitespace-nowrap">
                                  <span
                                    className="font-semibold text-gray-700 text-[13px]"
                                    title={item.generation_desc}
                                  >
                                    {getPhaiGeneration(item.generation_desc)}
                                  </span>
                                </td>

                                {/* Thân phụ */}
                                <td className="py-2.5 px-3.5 align-top text-gray-800 text-[13px] whitespace-nowrap">
                                  {item.father_name && item.father_name !== '-' ? (
                                    <span className="font-medium text-gray-900">{item.father_name}</span>
                                  ) : (
                                    <span className="text-gray-400 italic">Không rõ</span>
                                  )}
                                </td>

                                {/* Thân mẫu */}
                                <td className="py-2.5 px-3.5 align-top text-gray-800 text-[13px] whitespace-nowrap">
                                  {item.mother_name && item.mother_name !== '-' ? (
                                    <span className="font-medium text-gray-900">{item.mother_name}</span>
                                  ) : (
                                    <span className="text-gray-400 italic">Không rõ</span>
                                  )}
                                </td>

                                {/* Nơi an táng */}
                                <td className="py-2.5 px-3.5 align-top text-gray-700 text-[11.5px] leading-relaxed break-words">
                                  {item.burial_place && item.burial_place !== 'Không rõ' ? (
                                    <span>{item.burial_place}</span>
                                  ) : (
                                    <span className="text-gray-400 italic">Chưa ghi nhận</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL CHỈNH SỬA NGÀY GIỖ NGOẠI LỆ (Dành riêng cho Quản trị viên) */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-amber-800 via-primary to-primary-dark text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600/40 border border-amber-300/30 flex items-center justify-center text-amber-200">
                  <Pencil size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Chỉnh sửa ngày giỗ ngoại lệ</h3>
                  <p className="text-[11px] text-amber-200/90 font-medium">Quyền Quản trị viên</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={isSaving}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-5 space-y-4">
              {/* Thông tin nhân vật */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                  Thông tin tiền nhân / con cháu
                </div>
                <div className="text-base font-bold text-dark uppercase">
                  {editingRecord.full_name}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {editingRecord.generation_desc}
                </div>
              </div>

              {/* DÒNG NGÀY MẤT: CỐ ĐỊNH, KHÔNG ĐƯỢC PHÉP SỬA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-amber-700" />
                  Ngày mất:
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 flex items-center justify-between">
                  <span>{editingRecord.death_date || 'Chưa ghi nhận'}</span>
                  <span className="text-[10px] text-gray-500 italic bg-gray-200/80 px-2 py-0.5 rounded">
                    Dữ liệu gia phả gốc (không thể sửa)
                  </span>
                </div>
              </div>

              {/* DÒNG NGÀY GIỖ: CHO PHÉP QUẢN TRỊ VIÊN SỬA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-1.5">
                  <Pencil size={13} className="text-primary" />
                  Ngày giỗ Âm lịch:
                </label>
                <input
                  type="text"
                  value={editGioDateInput}
                  onChange={(e) => setEditGioDateInput(e.target.value)}
                  placeholder="Ví dụ: 07/01 Âm lịch"
                  disabled={isSaving}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold text-primary-dark bg-white outline-none"
                />
              </div>

              {/* Thông báo lỗi nếu có */}
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="bg-gray-50 px-5 py-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div>
                {/* Nút khôi phục theo mặc định (tính tự động từ ngày mất) */}
                <button
                  type="button"
                  onClick={() => handleSaveCustomDate(null)}
                  disabled={isSaving}
                  className="text-xs font-semibold text-gray-600 hover:text-amber-800 hover:bg-amber-100/70 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-gray-200"
                  title="Hủy bỏ tùy chỉnh ngoại lệ, quay lại ngày giỗ tính tự động theo ngày mất"
                >
                  <RotateCcw size={13} />
                  <span>Khôi phục mặc định</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                  className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-200/60 rounded-lg transition-colors"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveCustomDate(editGioDateInput)}
                  disabled={isSaving || !editGioDateInput.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={14} />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemorialCalendarPage;
