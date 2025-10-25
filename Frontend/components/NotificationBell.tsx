import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConnectionCounts } from '../hooks/useConnectionCounts';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const router = useRouter();
  const { counts, loading, refetch } = useConnectionCounts();

  // Check for new notifications only when we have loaded data
  useEffect(() => {
    if (!loading && counts.pendingApprovals > 0) {
      setHasNewNotifications(true);
    } else if (!loading) {
      setHasNewNotifications(false);
    }
  }, [counts.pendingApprovals, loading]);

  const handleNotificationClick = () => {
    // Close notification dropdown
    setIsOpen(false);
    // Redirect to My Connections page with received requests tab
    router.push('/my-connections?tab=received');
  };

  const handleBellClick = () => {
    if (!isOpen) {
      // Fetch counts when opening the notification dropdown
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50"
      >
        <Bell className="w-5 h-5" />
        
        {/* Notification Badge */}
        {hasNewNotifications && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notification Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading notifications...</span>
              </div>
            ) : counts.pendingApprovals > 0 ? (
              <div className="space-y-3">
                {/* Main Notification */}
                <div
                  onClick={handleNotificationClick}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          Connection Requests
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 animate-pulse">
                          {counts.pendingApprovals}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        You have {counts.pendingApprovals} pending connection request{counts.pendingApprovals > 1 ? 's' : ''} waiting for your approval.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs text-blue-600 font-medium hover:underline">
                          Click to review →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-xs text-gray-500 text-center">
                  Click to go to Received Requests tab
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No new notifications</p>
                <p className="text-sm text-gray-500 mt-1">You&apos;re all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {counts.pendingApprovals > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={handleNotificationClick}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 transform hover:scale-[1.02]"
              >
                View All Requests
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
