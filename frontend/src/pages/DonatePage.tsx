import React, { useState, useEffect } from 'react';
import { CreditCard, Info, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { donationService } from '../services/donationService';
import { Donation } from '../types';
import { format } from 'date-fns';

const DonatePage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [donations, setDonations] = useState<Donation[]>([]);
  
  const [formData, setFormData] = useState({
    donor_name: '',
    amount: '',
    message: ''
  });

  const fetchDonations = async () => {
    try {
      const data = isAdmin ? await donationService.getAdminDonations() : await donationService.getDonations();
      setDonations(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách donate", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDonations();
    }
  }, [isAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerify = async (id: number) => {
    if (window.confirm("Xác nhận đã nhận được tiền ủng hộ này?")) {
      try {
        await donationService.verifyDonation(id);
        fetchDonations();
      } catch (error) {
        alert("Lỗi khi xác nhận.");
      }
    }
  };

  const handleDeleteDonation = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      try {
        await donationService.deleteDonation(id);
        fetchDonations();
      } catch (error) {
        alert("Lỗi khi xóa.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await donationService.createDonation({
        donor_name: formData.donor_name,
        amount: Number(formData.amount),
        message: formData.message
      });
      alert('Cảm ơn bạn đã đóng góp! Thông tin của bạn đang chờ xác nhận.');
      setFormData({ donor_name: '', amount: '', message: '' });
      if (isAdmin) fetchDonations();
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi thông tin.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">Ủng hộ phát triển Portal Dòng họ</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mọi sự đóng góp của quý vị đều được trân trọng và sử dụng minh bạch cho việc duy trì hệ thống máy chủ, lưu trữ tư liệu và phát triển các tính năng mới phục vụ con cháu dòng họ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16">
        {/* Bank Info & QR code */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 h-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <CreditCard className="text-primary" size={28} />
            <h2 className="text-2xl font-bold text-dark">Thông tin chuyển khoản</h2>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Ngân hàng</p>
              <p className="font-semibold text-lg">BIDV (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam)</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Số tài khoản</p>
              <p className="font-semibold text-xl tracking-wider text-primary">5401128886</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Chủ tài khoản</p>
              <p className="font-semibold text-lg uppercase">HO LE VAN PHAI 4 CHI 2</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <img src="/qr.jpg" alt="QR Code" className="w-64 h-auto object-contain border mb-4 rounded-md shadow-sm" />
            <p className="text-sm text-gray-500 text-center flex items-center gap-1">
              <Info size={16} /> Quét mã QR để chuyển khoản nhanh
            </p>
          </div>
        </div>

        {/* Donation Form */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-dark mb-6">Đăng ký thông tin ủng hộ</h2>
          <p className="text-sm text-gray-600 mb-6">
            Sau khi chuyển khoản, quý vị vui lòng điền thông tin vào form dưới đây để Ban quản trị xác nhận và cập nhật lên danh sách vàng.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên người ủng hộ <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                name="donor_name"
                value={formData.donor_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary focus:outline-none"
                placeholder="VD: Lê Văn A"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền ủng hộ (VNĐ) <span className="text-red-500">*</span></label>
              <input
                required
                type="number"
                min="10000"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary focus:outline-none"
                placeholder="VD: 500000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lời nhắn (Tùy chọn)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary focus:outline-none"
                placeholder="VD: Ủng hộ chi phí duy trì server năm 2026..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors font-semibold shadow-md"
            >
              Gửi thông tin xác nhận
            </button>
          </form>
        </div>
      </div>

      {/* Admin Donation List */}
      {isAdmin && (
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-dark mb-6 border-b pb-4">Danh sách đã ủng hộ (Dành cho Quản trị viên)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người ủng hộ</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lời nhắn</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.donor_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={d.message}>{d.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {d.donated_at ? format(new Date(d.donated_at), 'dd/MM/yyyy HH:mm') : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {d.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                          <CheckCircle size={14} /> Đã xác nhận
                        </span>
                      ) : (
                        <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium">
                          Chờ xác nhận
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        {!d.is_verified && (
                          <button
                            onClick={() => handleVerify(d.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                          >
                            Xác nhận
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDonation(d.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {donations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonatePage;
