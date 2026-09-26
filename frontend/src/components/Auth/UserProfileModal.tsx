import React, { useState } from 'react';
import { X, Award, ShieldCheck, Phone, User as UserIcon, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Sparkles, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
  };
  correctAnswer: 'A' | 'B';
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Ngài Thủy tổ của Chi 2 - Phái 4 - Họ Lê Văn là vị tiền nhân nào?',
    options: {
      A: 'Cụ Lê Văn Khôi',
      B: 'Cụ Lê Văn Tán'
    },
    correctAnswer: 'A'
  },
  {
    id: 2,
    question: 'Chánh phối của Ngài Thủy tổ là cụ bà nào?',
    options: {
      A: 'Cụ bà Nguyễn Thị Cẩn',
      B: 'Cụ bà Phan Thị Mưu'
    },
    correctAnswer: 'B'
  },
  {
    id: 3,
    question: 'Địa bàn cư trú gốc của Chi 2 - Phái 4 - Họ Lê Văn là ở đâu?',
    options: {
      A: 'Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị',
      B: 'Thôn Trung Yên, Xã Triệu Bình, Tỉnh Quảng Trị'
    },
    correctAnswer: 'A'
  },
  {
    id: 4,
    question: 'Theo phong tục truyền thống của dòng họ, ngày cúng giỗ kỵ được quy ước như thế nào so với ngày mất âm lịch?',
    options: {
      A: 'Là ngày ngay trước ngày mất âm lịch',
      B: 'Chính là ngày mất âm lịch'
    },
    correctAnswer: 'A'
  },
  {
    id: 5,
    question: 'Khu nghĩa trang tập trung an táng nhiều thành viên nhất của dòng họ là địa điểm nào?',
    options: {
      A: 'Cồn Giữa, Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị',
      B: 'Lấp Lổ, Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị'
    },
    correctAnswer: 'A'
  },
  {
    id: 6,
    question: 'Đời thứ nhất của Chi 2 là đời thứ mấy của Phái 4 - Họ Lê Văn?',
    options: {
      A: 'Đời thứ 8 của Phái 4',
      B: 'Đời thứ 9 của Phái 4'
    },
    correctAnswer: 'B'
  },
  {
    id: 7,
    question: 'Hiện nay gia phả Chi 2 - Phái 4 - Họ Lê Văn đã ghi nhận truyền thừa đến đời thứ mấy?',
    options: {
      A: 'Đời thứ 8 của Chi 2',
      B: 'Đời thứ 7 của Chi 2'
    },
    correctAnswer: 'A'
  },
  {
    id: 8,
    question: 'Ngày giỗ của ngài Thuỷ tổ Chi 2 - Phái 4 - Họ Lê Văn rơi vào tháng mấy âm lịch?',
    options: {
      A: 'Tháng 10 âm lịch',
      B: 'Tháng 8 âm lịch'
    },
    correctAnswer: 'B'
  },
  {
    id: 9,
    question: 'Dự án Cổng thông tin Chi 2 - Phái 4 - Họ Lê Văn được bắt đầu triển khai vào tháng mấy năm 2026?',
    options: {
      A: 'Tháng 8/2026',
      B: 'Tháng 9/2026'
    },
    correctAnswer: 'A'
  },
  {
    id: 10,
    question: 'Thành viên sau khi được nâng cấp lên "Thành viên ưu tú" sẽ có thêm đặc quyền gì trên Cổng thông tin dòng họ?',
    options: {
      A: 'Được quyền đăng bài tư liệu - sự kiện, không được sửa cây gia phả',
      B: 'Được quyền đăng bài tư liệu - sự kiện, được sửa cây gia phả'
    },
    correctAnswer: 'A'
  }
];

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, setAuth } = useAuthStore();
  const [view, setView] = useState<'profile' | 'test' | 'result'>('profile');
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [score, setScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen || !user) return null;

  const isAdmin = user.role === 'admin';
  const isElite = user.role === 'elite';

  const getRoleLabel = () => {
    if (isAdmin) return 'Trùm cuối';
    if (isElite) return 'Thành viên ưu tú';
    return 'Thành viên tiêu chuẩn';
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 via-amber-600 to-red-700 text-white shadow-sm border border-amber-300/40">
          <Award size={14} className="text-yellow-300" />
          👑 Trùm cuối
        </span>
      );
    }
    if (isElite) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm border border-purple-300/40">
          <Sparkles size={14} className="text-yellow-300" />
          ⭐ Thành viên ưu tú
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
        <UserIcon size={14} className="text-gray-500" />
        Thành viên tiêu chuẩn
      </span>
    );
  };

  const handleStartTest = () => {
    setAnswers({});
    setSubmitError('');
    setView('test');
  };

  const handleSelectOption = (questionId: number, option: 'A' | 'B') => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < QUIZ_QUESTIONS.length) {
      const confirmSubmit = window.confirm(
        `Bạn mới trả lời ${answeredCount}/10 câu hỏi. Những câu chưa chọn sẽ tính là sai. Bạn có chắc chắn muốn nộp bài ngay không?`
      );
      if (!confirmSubmit) return;
    }

    // Tính điểm
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setIsSubmitting(true);
    setSubmitError('');

    if (correctCount >= 5) {
      try {
        const upgradeRes = await authService.upgradeRole(correctCount);
        if (upgradeRes && upgradeRes.user && upgradeRes.token) {
          setAuth(upgradeRes.user, upgradeRes.token);
        }
      } catch (err: any) {
        console.error('Lỗi khi cập nhật role:', err);
        setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu vai trò lên hệ thống.');
      }
    }

    setIsSubmitting(false);
    setView('result');
  };

  const handleResetModal = () => {
    setView('profile');
    setAnswers({});
    setSubmitError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary via-primary-dark to-primary px-6 py-4 text-white flex justify-between items-center relative shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
              <ShieldCheck size={22} className="text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Hồ sơ người dùng</h2>
              <p className="text-xs text-white/80">Cổng thông tin Họ Lê Văn - Phái 4 - Chi 2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {view === 'profile' && (
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 rounded-xl p-5 border border-amber-100 shadow-sm relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0 overflow-hidden shadow-inner">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {user.full_name || (isAdmin ? 'Quản trị viên' : 'Thành viên')}
                      </h3>
                      {getRoleBadge()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Phone size={14} className="text-primary" />
                      <span className="font-mono text-gray-800">{user.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Detail List */}
                <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/80 p-3 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-0.5">Họ và tên:</span>
                    <span className="font-semibold text-gray-800">{user.full_name || 'Chưa thiết lập'}</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-0.5">Số điện thoại:</span>
                    <span className="font-semibold text-gray-800 font-mono">{user.phone}</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                    <span className="text-xs text-gray-400 block mb-0.5">Vai trò hệ thống:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-primary">{getRoleLabel()}</span>
                      {isAdmin ? (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">Toàn quyền hệ thống</span>
                      ) : isElite ? (
                        <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">Quyền đăng bài mới Tư liệu - Sự kiện</span>
                      ) : (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded font-medium">Quyền tra cứu cơ bản</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Section */}
              {!isAdmin && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <BookOpen size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 text-base">
                          {isElite ? 'Bài test kiến thức dòng họ' : 'Làm bài test để nâng cấp vai trò'}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                        {isElite ? (
                          <>
                            Bạn hiện đang là <strong className="text-purple-700">Thành viên ưu tú</strong> và có quyền đăng bài mới trong mục <strong>Tư liệu - Sự kiện</strong>. Bạn có thể làm lại bài test bất kỳ lúc nào để trau dồi kiến thức phả hệ.
                          </>
                        ) : (
                          <>
                            Trả lời đúng từ <strong>5/10 câu</strong> để nâng cấp lên <strong className="text-primary font-bold">Thành viên ưu tú</strong> và mở quyền đăng bài Tư liệu - Sự kiện.
                          </>
                        )}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          onClick={handleStartTest}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                          <Award size={16} />
                          <span>{isElite ? 'Làm lại bài test ôn tập' : 'Bắt đầu làm bài test'}</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
                  <Award size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Tài khoản Quản trị viên (Trùm cuối):</strong> Bạn có toàn quyền quản trị cao nhất, bao gồm chỉnh sửa Cây gia phả, thêm bớt thành viên, quản trị Lịch giỗ kỵ và đăng bài viết Tư liệu - Sự kiện.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test View */}
          {view === 'test' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Bài Test Chi 2 - Phái 4 - Họ Lê Văn</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Đúng từ <strong>5/10 câu</strong> trở lên để trở thành Thành viên ưu tú
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    Đã chọn: {Object.keys(answers).length}/10 câu
                  </span>
                </div>
              </div>

              {/* Question List */}
              <div className="space-y-4">
                {QUIZ_QUESTIONS.map((q, idx) => {
                  const selectedOpt = answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${selectedOpt ? 'border-primary/40 bg-white shadow-sm' : 'border-gray-200 bg-gray-50/50'
                        }`}
                    >
                      <div className="flex items-start gap-2.5 mb-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 leading-snug">
                          {q.question}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {(['A', 'B'] as const).map((optKey) => {
                          const isSelected = selectedOpt === optKey;
                          return (
                            <button
                              key={optKey}
                              type="button"
                              onClick={() => handleSelectOption(q.id, optKey)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-3 border ${isSelected
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${isSelected ? 'border-white bg-white/20 text-white' : 'border-gray-300 text-gray-500'
                                  }`}
                              >
                                {optKey}
                              </span>
                              <span className="flex-1">{q.options[optKey]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setView('profile')}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Quay lại hồ sơ
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang chấm điểm...' : 'Nộp bài test'}
                </button>
              </div>
            </div>
          )}

          {/* Result View */}
          {view === 'result' && (
            <div className="text-center py-4 px-2 space-y-5 animate-fade-in">
              {score >= 5 ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-white flex items-center justify-center shadow-lg border-4 border-white animate-bounce-short">
                    <Sparkles size={40} className="text-white drop-shadow-md" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 mb-2">
                      ĐẠT YÊU CẦU: {score}/10 CÂU ĐÚNG
                    </span>
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      Xin chúc mừng, bạn đã trở thành Thành viên ưu tú!
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                      Bạn đã hoàn thành xuất sắc bài trắc nghiệm kiến thức dòng họ với kết quả <strong>{score}/10 câu đúng</strong>. Vai trò của bạn đã được nâng cấp thành <strong>Thành viên ưu tú</strong>.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs sm:text-sm text-purple-900 space-y-1.5 shadow-sm">
                    <div className="font-bold flex items-center gap-2 text-purple-800">
                      <CheckCircle2 size={16} className="text-purple-600" />
                      Quyền lợi đặc quyền mới:
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-purple-800/90 text-xs">
                      <li>Được cấp quyền viết và đăng bài trong mục <strong>Tư liệu - Sự kiện</strong>.</li>
                      <li>Hiển thị danh hiệu <strong>⭐ Thành viên ưu tú</strong> trên toàn cổng thông tin.</li>
                    </ul>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                      {submitError}
                    </div>
                  )}

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetModal}
                      className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                    >
                      Xem lại hồ sơ tài khoản
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-500 flex items-center justify-center border-4 border-red-50">
                    <AlertCircle size={36} />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 mb-2">
                      KẾT QUẢ: {score}/10 CÂU ĐÚNG
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      Xin chia buồn, lần sau cố gắng hơn nhé!
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                      Bạn đã trả lời đúng <strong>{score}/10</strong> câu. Để đạt danh hiệu Thành viên ưu tú, bạn cần trả lời đúng tối thiểu <strong>5/10</strong> câu. Hãy tìm hiểu thêm kiến thức trong mục Gia phả số và Lịch giỗ kỵ rồi thử lại nhé!
                    </p>
                  </div>

                  <div className="pt-3 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setView('profile')}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Quay lại hồ sơ
                    </button>
                    <button
                      type="button"
                      onClick={handleStartTest}
                      className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <RotateCcw size={16} />
                      <span>Làm lại bài test</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
