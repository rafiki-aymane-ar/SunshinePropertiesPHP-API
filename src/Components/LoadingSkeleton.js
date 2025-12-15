import React from 'react';
import '../style/LoadingSkeleton.css';

export const PropertyCardSkeleton = () => (
  <div className="property-card-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
      <div className="skeleton-line shorter"></div>
    </div>
  </div>
);

export const AgentCardSkeleton = () => (
  <div className="agent-card-skeleton">
    <div className="skeleton-avatar"></div>
    <div className="skeleton-content">
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
      <div className="skeleton-line shorter"></div>
    </div>
  </div>
);

export const LoadingGrid = ({ type = 'property', count = 6 }) => {
  const SkeletonComponent = type === 'property' ? PropertyCardSkeleton : AgentCardSkeleton;
  const gridClass = type === 'property' ? 'loading-grid' : 'loading-grid agents-loading';

  return (
    <div className={gridClass}>
      {[...Array(count)].map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

