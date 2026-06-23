
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GuideModal from './components/GuideModal';
import Onboarding from './pages/Onboarding';
import QuestionBank from './pages/QuestionBank';
import BlueprintBuilder from './pages/BlueprintBuilder';
import ExamGenerator from './pages/ExamGenerator';
import ExportCenter from './pages/ExportCenter';
import { ViewState } from './types';
import { db } from './db';
import { MOCK_QUESTIONS } from './constants';
import { Layout, DownloadCloud, Settings, Database, Trash2, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('M0');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Show guide on first visit (optional logic)
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('qbank_seen_guide');
    if (!hasSeenGuide) {
      setIsGuideOpen(true);
      localStorage.setItem('qbank_seen_guide', 'true');
    }
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const count = await db.questions.count();
      if (count === 0) {
        const fullMocks = MOCK_QUESTIONS.map(q => ({
          ...q,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timesUsed: 0,
          tags: q.tags || []
        }));
        await db.questions.bulkAdd(fullMocks);
        alert(`Đã nạp thành công ${fullMocks.length} câu hỏi mẫu!`);
      } else {
        alert("Hệ thống đã có dữ liệu. Không cần nạp lại.");
      }
      setCurrentView('M2');
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi nạp dữ liệu mẫu.");
    } finally {
      setIsSeeding(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'M0': return <Onboarding onNavigate={setCurrentView} onSeedData={handleSeedData} />;
      case 'M2': return <QuestionBank />;
      case 'M3': return <BlueprintBuilder onBlueprintSaved={() => setCurrentView('M4')} />;
      case 'M4': return <ExamGenerator onExamGenerated={() => setCurrentView('M5')} />;
      case 'M5': return <ExportCenter />;
      case 'M6': return <BackupRestore />;
      case 'M7': return <div className="p-8"><h1 className="text-2xl font-bold">Cài đặt</h1><p className="mt-4">Chức năng đang được phát triển...</p></div>;
      default: return <div className="p-8 text-center text-slate-400">Màn hình "{currentView}" chưa được xây dựng.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onOpenGuide={() => setIsGuideOpen(true)}
      />
      
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden transition-all duration-300">
        {renderContent()}
      </main>

      <GuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />
      
      {isSeeding && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-bold">Đang nạp dữ liệu mẫu...</p>
          <p className="text-sm opacity-60">Vui lòng không đóng trình duyệt</p>
        </div>
      )}
    </div>
  );
};

const BackupRestore: React.FC = () => {
  const handleExportAll = async () => {
    const questions = await db.questions.toArray();
    const blueprints = await db.blueprints.toArray();
    const exams = await db.exams.toArray();
    
    const fullData = { questions, blueprints, exams, version: '1.0', exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QBankVN_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ xóa sạch TOÀN BỘ dữ liệu của bạn trên trình duyệt này. Bạn có chắc chắn?')) {
      await db.questions.clear();
      await db.blueprints.clear();
      await db.exams.clear();
      alert('Đã xóa sạch dữ liệu.');
      window.location.reload();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <DownloadCloud size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Sao lưu & Phục hồi</h1>
          <p className="text-sm text-slate-500 font-medium">Đảm bảo dữ liệu của bạn luôn an toàn</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <DownloadCloud size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Xuất dữ liệu dự phòng</h3>
          <p className="text-slate-500 mb-8 flex-1">Tải toàn bộ ngân hàng câu hỏi, ma trận và đề thi của bạn về máy tính dưới dạng file .json.</p>
          <button 
            onClick={handleExportAll}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 group"
          >
            Tải xuống ngay <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
            <Trash2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Xóa sạch dữ liệu</h3>
          <p className="text-slate-500 mb-8 flex-1">Xóa toàn bộ dữ liệu hiện có để làm lại từ đầu. Hãy cẩn thận vì hành động này không thể hoàn tác.</p>
          <button 
            onClick={handleClearData}
            className="w-full py-4 border-2 border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all"
          >
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
