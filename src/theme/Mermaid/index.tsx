import React, {useEffect, useRef, useState, memo} from 'react';
import OriginalMermaid from '@theme-original/Mermaid';
import type MermaidType from '@theme/Mermaid';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof MermaidType>;

// Memoize the original Mermaid component so it doesn't re-render when zoom
// state changes. Re-rendering replaces the inner SVG and causes flicker.
const MemoMermaid = memo(
  OriginalMermaid as React.ComponentType<Props>,
  (prev, next) =>
    (prev as unknown as {value: string}).value ===
    (next as unknown as {value: string}).value,
);

type ViewBox = {x: number; y: number; w: number; h: number};

type SharedState = {
  svg: SVGSVGElement | null;
  initialVb: ViewBox | null;
  currentVb: ViewBox | null;
  attached: boolean;
  subscribers: Set<() => void>;
  notify: () => void;
};

// Module-level: state shared across React strict-mode remounts of the same container.
const stateMap = new WeakMap<HTMLDivElement, SharedState>();

const MIN_SCALE = 0.3;
const MAX_SCALE = 8;
const WHEEL_STEP = 1.15;
const BUTTON_STEP = 1.4;

function getOrCreateState(container: HTMLDivElement): SharedState {
  let state = stateMap.get(container);
  if (state) return state;
  state = {
    svg: null,
    initialVb: null,
    currentVb: null,
    attached: false,
    subscribers: new Set<() => void>(),
    notify: () => {
      state!.subscribers.forEach((cb) => cb());
    },
  };
  stateMap.set(container, state);
  return state;
}

function applyViewBox(state: SharedState) {
  if (!state.svg || !state.currentVb) return;
  const vb = state.currentVb;
  state.svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
}

function refreshSvgRef(container: HTMLDivElement, state: SharedState) {
  const fresh = container.querySelector<SVGSVGElement>('svg');
  if (!fresh) return;
  if (fresh === state.svg) {
    // Same reference but maybe rect is 0 — could mean it was just remounted
    return;
  }
  // SVG was replaced (hot reload / re-render). Re-bind + re-apply style + re-apply current viewBox.
  // eslint-disable-next-line no-console
  console.log('[mermaid-zoom] SVG changed, refreshing reference');
  state.svg = fresh;
  fresh.removeAttribute('width');
  fresh.removeAttribute('height');
  fresh.style.width = '100%';
  fresh.style.height = '100%';
  fresh.style.maxWidth = 'none';
  fresh.style.maxHeight = 'none';
  fresh.style.display = 'block';
  if (state.currentVb) {
    fresh.setAttribute(
      'viewBox',
      `${state.currentVb.x} ${state.currentVb.y} ${state.currentVb.w} ${state.currentVb.h}`,
    );
  }
}

function tryInitSvg(container: HTMLDivElement, state: SharedState): boolean {
  if (state.svg && state.initialVb) return true;
  const svg = container.querySelector<SVGSVGElement>('svg');
  if (!svg) return false;

  let init: ViewBox | null = null;
  const vb = svg.viewBox?.baseVal;
  if (vb && vb.width > 0 && vb.height > 0) {
    init = {x: vb.x, y: vb.y, w: vb.width, h: vb.height};
  }
  if (!init) {
    const w = svg.width?.baseVal?.value;
    const h = svg.height?.baseVal?.value;
    if (w && h && w > 0 && h > 0) init = {x: 0, y: 0, w, h};
  }
  if (!init) {
    try {
      const bbox = svg.getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        init = {x: bbox.x, y: bbox.y, w: bbox.width, h: bbox.height};
      }
    } catch {
      /* ignore */
    }
  }
  if (!init) return false;

  svg.setAttribute('viewBox', `${init.x} ${init.y} ${init.w} ${init.h}`);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.maxWidth = 'none';
  svg.style.maxHeight = 'none';
  svg.style.display = 'block';

  state.svg = svg;
  state.initialVb = init;
  state.currentVb = {...init};
  // eslint-disable-next-line no-console
  console.log('[mermaid-zoom] svg attached', init);
  state.notify();
  return true;
}

function zoomAt(
  state: SharedState,
  container: HTMLDivElement,
  clientX: number,
  clientY: number,
  factor: number,
) {
  refreshSvgRef(container, state);
  const {svg, initialVb, currentVb} = state;
  // eslint-disable-next-line no-console
  console.log('[mermaid-zoom] zoomAt', {clientX, clientY, factor, hasSvg: !!svg, hasInit: !!initialVb, hasVb: !!currentVb});
  if (!svg || !initialVb || !currentVb) return;
  let svgRect = svg.getBoundingClientRect();
  // If SVG rect is empty, fall back to container rect
  if (svgRect.width === 0 || svgRect.height === 0) {
    // eslint-disable-next-line no-console
    console.log('[mermaid-zoom] SVG rect empty, falling back to container rect');
    svgRect = container.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) {
      // eslint-disable-next-line no-console
      console.log('[mermaid-zoom] zoomAt skipped — container rect also empty');
      return;
    }
  }

  const lx = (clientX - svgRect.left) / svgRect.width;
  const ly = (clientY - svgRect.top) / svgRect.height;
  const pointX = currentVb.x + currentVb.w * lx;
  const pointY = currentVb.y + currentVb.h * ly;

  let newW = currentVb.w / factor;
  let newH = currentVb.h / factor;
  const projected = initialVb.w / newW;
  if (projected > MAX_SCALE) {
    newW = initialVb.w / MAX_SCALE;
    newH = initialVb.h / MAX_SCALE;
  } else if (projected < MIN_SCALE) {
    newW = initialVb.w / MIN_SCALE;
    newH = initialVb.h / MIN_SCALE;
  }

  state.currentVb = {
    x: pointX - newW * lx,
    y: pointY - newH * ly,
    w: newW,
    h: newH,
  };
  applyViewBox(state);
  state.notify();
}

function attachListeners(container: HTMLDivElement, state: SharedState) {
  if (state.attached) {
    // eslint-disable-next-line no-console
    console.log('[mermaid-zoom] attachListeners — already attached, skip');
    return;
  }
  state.attached = true;
  // eslint-disable-next-line no-console
  console.log('[mermaid-zoom] attachListeners — attaching');

  let dragStartX = 0;
  let dragStartY = 0;
  let dragOrigVb: ViewBox | null = null;

  const handleWheel = (e: WheelEvent) => {
    // eslint-disable-next-line no-console
    console.log('[mermaid-zoom] WHEEL event', {deltaY: e.deltaY, hasSvg: !!state.svg});
    if (!state.svg) return;
    e.preventDefault();
    e.stopPropagation();
    const factor = e.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP;
    zoomAt(state, container, e.clientX, e.clientY, factor);
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || !state.currentVb) return;
    e.preventDefault();
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOrigVb = {...state.currentVb};
    container.style.cursor = 'grabbing';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragOrigVb || !state.svg) return;
    const rect = state.svg.getBoundingClientRect();
    if (rect.width === 0) return;
    const dx = -(e.clientX - dragStartX) * dragOrigVb.w / rect.width;
    const dy = -(e.clientY - dragStartY) * dragOrigVb.h / rect.height;
    state.currentVb = {
      x: dragOrigVb.x + dx,
      y: dragOrigVb.y + dy,
      w: dragOrigVb.w,
      h: dragOrigVb.h,
    };
    applyViewBox(state);
    state.notify();
  };

  const onMouseUp = () => {
    if (dragOrigVb) {
      dragOrigVb = null;
      container.style.cursor = 'grab';
    }
  };

  container.addEventListener('wheel', handleWheel, {passive: false});
  container.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // No cleanup — listeners persist for the lifetime of the container DOM element.
}

export default function MermaidWrapper(props: Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    const state = getOrCreateState(container);

    const refreshUi = () => {
      if (state.initialVb && state.currentVb) {
        setScale(state.initialVb.w / state.currentVb.w);
        setReady(true);
      }
    };

    state.subscribers.add(refreshUi);

    // Try to find SVG. If already inited from a previous mount, skip.
    if (!tryInitSvg(container, state)) {
      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (tryInitSvg(container, state) || attempts > 150) {
          window.clearInterval(timer);
        }
      }, 80);

      const observer = new MutationObserver(() => {
        if (tryInitSvg(container, state)) {
          observer.disconnect();
          window.clearInterval(timer);
        }
      });
      observer.observe(container, {childList: true, subtree: true});
    }

    attachListeners(container, state);
    refreshUi();

    return () => {
      state.subscribers.delete(refreshUi);
    };
  }, []);

  const handleButtonZoom = (factor: number) => {
    // eslint-disable-next-line no-console
    console.log('[mermaid-zoom] BUTTON click', {factor, hasContainer: !!containerRef.current});
    const container = containerRef.current;
    if (!container) return;
    const state = stateMap.get(container);
    // eslint-disable-next-line no-console
    console.log('[mermaid-zoom] BUTTON state', {hasState: !!state, hasSvg: !!state?.svg});
    if (!state || !state.svg) return;
    const svgRect = state.svg.getBoundingClientRect();
    zoomAt(
      state,
      container,
      svgRect.left + svgRect.width / 2,
      svgRect.top + svgRect.height / 2,
      factor,
    );
  };

  const handleReset = () => {
    const container = containerRef.current;
    if (!container) return;
    const state = stateMap.get(container);
    if (!state || !state.initialVb) return;
    state.currentVb = {...state.initialVb};
    applyViewBox(state);
    state.notify();
  };

  const toggleFullscreen = () => setFullscreen((v) => !v);

  return (
    <div
      className={`mermaid-zoom${fullscreen ? ' mermaid-zoom--fullscreen' : ''}`}
    >
      <div
        className="mermaid-zoom__container"
        ref={containerRef}
        style={{cursor: 'grab'}}
      >
        <div className="mermaid-zoom__inner">
          <MemoMermaid {...props} />
        </div>
      </div>
      <div className="mermaid-zoom__controls" aria-label="Zoom controls">
        <button
          type="button"
          onClick={() => handleButtonZoom(BUTTON_STEP)}
          disabled={!ready}
          title="Phóng to"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => handleButtonZoom(1 / BUTTON_STEP)}
          disabled={!ready}
          title="Thu nhỏ"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!ready}
          title="Đặt lại"
          aria-label="Reset"
        >
          ⟲
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          title={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          aria-label="Toggle fullscreen"
        >
          {fullscreen ? '✕' : '⛶'}
        </button>
      </div>
      <div className="mermaid-zoom__hint">
        {ready
          ? `${Math.round(scale * 100)}% · Kéo · Cuộn để zoom · ⛶ toàn màn hình`
          : 'Đang khởi tạo zoom...'}
      </div>
    </div>
  );
}
