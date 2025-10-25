import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMobile } from './MobileOptimized';

// Хук для дебаунса
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Хук для троттлинга
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [lastRun, setLastRun] = useState(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun >= delay) {
        callback(...args);
        setLastRun(Date.now());
      }
    }) as T,
    [callback, delay, lastRun]
  );
}

// Компонент для ленивой загрузки изображений
export function LazyImage({ 
  src, 
  alt, 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==',
  style = {},
  ...props 
}: {
  src: string;
  alt: string;
  placeholder?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      style={{
        transition: 'opacity 0.3s ease',
        opacity: isLoaded ? 1 : 0.7,
        ...style
      }}
      {...props}
    />
  );
}

// Компонент для виртуализации списков
export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const isMobile = useMobile();

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                padding: isMobile ? '10px' : '8px',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Компонент для мемоизации
export function MemoizedComponent<T extends Record<string, any>>({
  children,
  dependencies
}: {
  children: React.ReactNode;
  dependencies: T;
}) {
  return useMemo(() => children, Object.values(dependencies));
}

// Хук для оптимизации ре-рендеров
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Компонент для предзагрузки ресурсов
export function ResourcePreloader({ 
  resources, 
  onComplete 
}: {
  resources: string[];
  onComplete?: () => void;
}) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (resources.length === 0) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let completed = 0;
    const total = resources.length;

    const handleLoad = () => {
      completed++;
      setLoadedCount(completed);
      
      if (completed === total) {
        setIsComplete(true);
        onComplete?.();
      }
    };

    resources.forEach((resource) => {
      if (resource.endsWith('.css')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = resource;
        link.onload = handleLoad;
        link.onerror = handleLoad;
        document.head.appendChild(link);
      } else if (resource.endsWith('.js')) {
        const script = document.createElement('script');
        script.src = resource;
        script.onload = handleLoad;
        script.onerror = handleLoad;
        document.head.appendChild(script);
      } else {
        // Для изображений
        const img = new Image();
        img.onload = handleLoad;
        img.onerror = handleLoad;
        img.src = resource;
      }
    });
  }, [resources, onComplete]);

  return (
    <div style={{ display: 'none' }}>
      {isComplete ? '✅' : `⏳ ${loadedCount}/${resources.length}`}
    </div>
  );
}

// Хук для мониторинга производительности
export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        averageRenderTime: (prev.averageRenderTime + renderTime) / 2
      }));

      // Логирование в development
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render:`, {
          time: `${renderTime.toFixed(2)}ms`,
          count: metrics.renderCount + 1
        });
      }
    };
  });

  return metrics;
}

// Компонент для отложенной загрузки
export function LazyComponent({ 
  children, 
  fallback = <div>⏳ Загрузка...</div>,
  threshold = 0.1 
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return (
    <div ref={setRef}>
      {isVisible ? children : fallback}
    </div>
  );
}
