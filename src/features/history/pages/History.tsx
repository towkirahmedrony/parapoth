import React, { useState, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { TabType } from '../types/history';
import { useHistory } from '../hooks/useHistory';

// Components
import { HistoryTabs } from '../components/HistoryTabs';
import { HistoryCard } from '../components/HistoryCard';
import { MistakeCard } from '../components/MistakeCard';
import { BookmarkCard } from '../components/BookmarkCard';
import { DeleteModal } from '../components/DeleteModal';
import { EmptyState } from '../components/EmptyState';

// Types
type DeleteTargetType = Extract<TabType, 'mistakes' | 'bookmarks'>;

interface DeleteModalState {
  isOpen: boolean;
  id: string | null;
  type: DeleteTargetType | null;
}

const History: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('history');
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    id: null,
    type: null
  });

  const { 
    isLoading, 
    historyData, 
    mistakeData, 
    bookmarkData, 
    deleteMistake, 
    deleteBookmark 
  } = useHistory(activeTab);

  // Memoized Handlers for Modal
  const handleOpenDeleteModal = useCallback((id: string, type: DeleteTargetType) => {
    setDeleteModal({ isOpen: true, id, type });
  }, []);

  const handleCloseModal = useCallback(() => {
    setDeleteModal({ isOpen: false, id: null, type: null });
  }, []);

  // Stable references for child component props to prevent React.memo breakage
  const handleDeleteMistake = useCallback((id: string) => {
    handleOpenDeleteModal(id, 'mistakes');
  }, [handleOpenDeleteModal]);

  const handleDeleteBookmark = useCallback((id: string) => {
    handleOpenDeleteModal(id, 'bookmarks');
  }, [handleOpenDeleteModal]);

  // Cleaned up confirmation logic without redundant try-catch
  const confirmDelete = useCallback(async () => {
    const { id, type } = deleteModal;
    if (!id || !type) return;

    let success = false;
    
    // Mutation calls (they safely return boolean directly from useHistory hook)
    if (type === 'mistakes') {
      success = await deleteMistake(id);
    } else if (type === 'bookmarks') {
      success = await deleteBookmark(id);
    }

    if (success) {
      handleCloseModal();
    } else {
      console.error(`Failed to delete ${type} with id ${id}`);
    }
  }, [deleteModal, deleteMistake, deleteBookmark, handleCloseModal]);

  // Early return fallback
  if (!user) return null;

  // Render Helper
  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return historyData && historyData.length > 0 ? (
          historyData.map((item) => <HistoryCard key={item.id} item={item} />)
        ) : (
          <EmptyState type="history" />
        );

      case 'mistakes':
        return mistakeData && mistakeData.length > 0 ? (
          mistakeData.map((item) => (
            <MistakeCard 
              key={item.id} 
              item={item} 
              onDelete={handleDeleteMistake} 
            />
          ))
        ) : (
          <EmptyState type="mistakes" />
        );

      case 'bookmarks':
        return bookmarkData && bookmarkData.length > 0 ? (
          bookmarkData.map((item) => (
            <BookmarkCard 
              key={item.id} 
              item={item} 
              onDelete={handleDeleteBookmark} 
            />
          ))
        ) : (
          <EmptyState type="bookmarks" />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-app text-text-primary max-w-4xl mx-auto p-4 md:p-6 min-h-screen font-['Hind_Siliguri']">
      <HistoryTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {isLoading ? (
        <div className="space-y-4 mt-4 animate-pulse" aria-label="Loading content">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="bg-surface border border-border-color h-24 rounded-xl"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderTabContent()}
        </div>
      )}

      <DeleteModal 
        isOpen={deleteModal.isOpen} 
        onClose={handleCloseModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default History;
