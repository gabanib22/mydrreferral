import React from 'react';
import { Users, Send, Inbox, Ban } from 'lucide-react';
import { useConnectionCounts } from '../hooks/useConnectionCounts';
import Link from 'next/link';

const ConnectionCounts: React.FC = () => {
  const { counts, loading, error, refetch } = useConnectionCounts();

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="w-16 h-4 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500 text-sm">
        <span>⚠️</span>
        <span className="max-w-32 truncate" title={error}>
          {error.length > 20 ? `${error.substring(0, 20)}...` : error}
        </span>
        <button 
          onClick={refetch} 
          className="text-xs text-blue-500 hover:text-blue-700 underline"
          title="Retry"
        >
          Retry
        </button>
      </div>
    );
  }

  const countItems = [
    {
      label: 'Connections',
      count: counts.totalConnections,
      icon: Users,
      href: '/my-connections',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      label: 'Sent',
      count: counts.sentRequests,
      icon: Send,
      href: '/my-connections?tab=sent',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      label: 'Received',
      count: counts.receivedRequests,
      icon: Inbox,
      href: '/my-connections?tab=received',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      label: 'Blocked',
      count: counts.blockedConnections,
      icon: Ban,
      href: '/my-connections?tab=blocked',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    }
  ];

  return (
    <div className="flex items-center space-x-2">
      {countItems.map((item, index) => {
        const Icon = item.icon;
        const isPending = false; // Removed pending logic since it's redundant
        
        return (
          <Link
            key={index}
            href={item.href}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${item.bgColor} ${item.hoverColor} ${item.color} hover:shadow-sm`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              isPending ? 'bg-red-500 text-white animate-pulse' : 'bg-white/50'
            }`}>
              {item.count}
            </span>
            {isPending && (
              <div className="relative">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            )}
          </Link>
        );
      })}
      
    </div>
  );
};

export default ConnectionCounts;
