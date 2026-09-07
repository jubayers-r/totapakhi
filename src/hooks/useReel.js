import { useEffect, useRef, useState } from 'react';
import { playLand, playTick } from '@/lib/sounds';

function getItemHeight() {
  if (typeof window === 'undefined') return 130;
  if (window.innerWidth <= 480) return 100;
  if (window.innerWidth <= 768) return 120;
  return 130;
}

function shuffleArray(array) {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function splitAtSpace(text, pos) {
  for (let j = pos; j >= 0; j--) {
    if (text[j] === ' ') return j;
  }
  for (let j = pos; j < text.length; j++) {
    if (text[j] === ' ') return j;
  }
  return -1;
}

function fitTextToWidth(items, containerWidth) {
  const w = typeof window === 'undefined' ? 1440 : window.innerWidth;
  const maxFontSize = w <= 480 ? 1.6 : w <= 768 ? 2.0 : 3.5;
  const minFontSize = w <= 480 ? 0.75 : w <= 768 ? 0.95 : 1.15;
  const wrapThreshold = w <= 480 ? 10 : w <= 768 ? 12 : 15;

  for (const item of items) {
    const text = item.textContent;
    if (!text) continue;
    const wordCount = text.trim().split(/\s+/).length;

    if (text.length > wrapThreshold) {
      const mid = Math.floor(text.length / 2);
      const bestBreak = splitAtSpace(text, mid);

      if (wordCount > 8 && bestBreak > 0) {
        const third1 = Math.floor(text.length / 3);
        const third2 = Math.floor(2 * text.length / 3);
        const break1 = splitAtSpace(text, third1);
        const break2 = splitAtSpace(text, Math.max(third2, break1 + 1));

        if (break1 > 0 && break2 > break1) {
          item.innerHTML =
            text.substring(0, break1) +
            '<br>' +
            text.substring(break1 + 1, break2) +
            '<br>' +
            text.substring(break2 + 1);
        } else if (bestBreak > 0) {
          item.innerHTML =
            text.substring(0, bestBreak) +
            '<br>' +
            text.substring(bestBreak + 1);
        } else {
          item.textContent = text;
        }
      } else if (bestBreak > 0) {
        item.innerHTML =
          text.substring(0, bestBreak) +
          '<br>' +
          text.substring(bestBreak + 1);
      }

      const sizeMultiplier = wordCount > 8 ? 0.38 : 0.55;
      item.style.fontSize = maxFontSize * sizeMultiplier + 'rem';
      item.style.lineHeight = '1.15';
    } else {
      item.style.fontSize = maxFontSize + 'rem';
    }

    if (item.scrollWidth > containerWidth) {
      let size = parseFloat(item.style.fontSize);
      while (size > minFontSize && item.scrollWidth > containerWidth) {
        size -= 0.1;
        item.style.fontSize = size + 'rem';
      }
    }
  }
}

/**
 * Slot-machine reel for topic selection.
 * Drives the DOM strip imperatively (rAF physics + spring settle), exactly like
 * the original site. `topics` is an array of topic objects ({ topic, hints, ... }).
 * Calls `onLanded(topicObject)` when the reel settles on a topic.
 */
export function useReel({ topics, onLanded, disabled }) {
  const windowRef = useRef(null);
  const stripRef = useRef(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [lastLanded, setLastLanded] = useState(null);

  const stateRef = useRef({
    isSpinning: false,
    lastTopicId: null,
    animFrameId: null,
  });

  const topicsRef = useRef(topics);
  const onLandedRef = useRef(onLanded);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    topicsRef.current = topics;
    onLandedRef.current = onLanded;
    disabledRef.current = disabled;
  }, [topics, onLanded, disabled]);

  useEffect(() => {
    const state = stateRef.current;
    return () => {
      state.animFrameId && cancelAnimationFrame(state.animFrameId);
    };
  }, []);

  function buildReel(reelTopics, landingIndex, itemHeight) {
    const strip = stripRef.current;
    const windowEl = windowRef.current;
    if (!strip || !windowEl) return;

    strip.classList.remove('settled');
    strip.style.transition = '';
    strip.style.transform = 'translateY(0px)';
    strip.innerHTML = '';

    reelTopics.forEach((topic, i) => {
      const div = document.createElement('div');
      div.className = 'tp-reel-item';
      div.style.height = itemHeight + 'px';
      div.textContent = topic;
      if (i === landingIndex) div.setAttribute('data-landing', 'true');
      strip.appendChild(div);
    });

    fitTextToWidth(strip.children, windowEl.offsetWidth - 32);
  }

  function styleItemsByPosition(currentY, itemHeight, windowHeight) {
    const strip = stripRef.current;
    if (!strip) return;
    const viewportCenter = windowHeight / 2;
    const items = strip.children;
    for (let i = 0; i < items.length; i++) {
      const itemCenter = i * itemHeight + itemHeight / 2 + currentY;
      const dist = Math.abs(itemCenter - viewportCenter);
      const norm = Math.min(dist / itemHeight, 1);
      const scale = 1.6 - norm * 0.6;
      const opacity = 1 - norm * 0.7;
      items[i].style.transform = 'scale(' + scale + ')';
      items[i].style.opacity = opacity;
    }
  }

  function reinitReel() {
    const strip = stripRef.current;
    const windowEl = windowRef.current;
    if (!strip || !windowEl) return;
    const list = topicsRef.current;
    if (!list.length) return;

    const itemHeight = getItemHeight();
    const windowHeight = windowEl.offsetHeight || itemHeight * 3;
    const visibleCount = 3;
    const initialTopics = shuffleArray(list).slice(0, visibleCount).map((t) => t.topic);

    strip.classList.remove('settled');
    strip.style.transition = '';
    strip.innerHTML = '';

    initialTopics.forEach((topic) => {
      const div = document.createElement('div');
      div.className = 'tp-reel-item';
      div.style.height = itemHeight + 'px';
      div.textContent = topic;
      strip.appendChild(div);
    });

    fitTextToWidth(strip.children, windowEl.offsetWidth - 32);

    const middleIndex = 1;
    const offsetY = -(middleIndex * itemHeight + itemHeight / 2 - windowHeight / 2);
    strip.style.transform = 'translateY(' + offsetY + 'px)';
    strip.classList.add('settled');
    const centerItem = strip.children[middleIndex];
    if (centerItem) centerItem.classList.add('landed');
  }

  // Rebuild the reel whenever the topic pool changes (category/gender switch).
  useEffect(() => {
    const state = stateRef.current;
    if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
    state.isSpinning = false;
    state.lastTopicId = null;
    const raf = requestAnimationFrame(() => setIsSpinning(false));
    reinitReel();
    return () => cancelAnimationFrame(raf);
  }, [topics]);

  function generateTopic(initialVelocity) {
    const strip = stripRef.current;
    const windowEl = windowRef.current;
    const list = topicsRef.current;
    const state = stateRef.current;
    if (!strip || !windowEl || !list.length) return;
    if (state.isSpinning || disabledRef.current) return;
    state.isSpinning = true;
    setIsSpinning(true);
    if (state.animFrameId) cancelAnimationFrame(state.animFrameId);

    const itemHeight = getItemHeight();
    const windowHeight = windowEl.offsetHeight || itemHeight * 3;

    const INITIAL_VELOCITY = initialVelocity || 40;
    const FRICTION = 0.985;
    const STOP_THRESHOLD = 1.5;

    let simVel = INITIAL_VELOCITY;
    let simDist = 0;
    while (simVel >= STOP_THRESHOLD) {
      simDist += simVel;
      simVel *= FRICTION;
    }

    const centerAtStop = simDist + windowHeight / 2;
    const naturalIndex = Math.max(0, Math.round((centerAtStop - itemHeight / 2) / itemHeight));
    const LANDING_INDEX = naturalIndex + 1;
    const REEL_COUNT = LANDING_INDEX + 3;

    const finalIndex = (() => {
      let idx;
      let safety = 0;
      do {
        idx = Math.floor(Math.random() * list.length);
        safety++;
      } while (state.lastTopicId !== null && list[idx].id === state.lastTopicId && list.length > 1 && safety < 50);
      return idx;
    })();
    state.lastTopicId = list[finalIndex].id;
    const finalTopic = list[finalIndex];

    let reelTopics = [];
    const textPool = list.map((t) => t.topic);
    while (reelTopics.length < REEL_COUNT) {
      reelTopics = reelTopics.concat(shuffleArray(textPool));
    }
    reelTopics = reelTopics.slice(0, REEL_COUNT);
    reelTopics[LANDING_INDEX] = finalTopic.topic;

    buildReel(reelTopics, LANDING_INDEX, itemHeight);

    const TARGET_Y = -(LANDING_INDEX * itemHeight + itemHeight / 2 - windowHeight / 2);

    let position = 0;
    let velocity = INITIAL_VELOCITY;
    let lastBoundaryIndex = 0;
    let lastFrameTime = null;

    function snapToTarget() {
      const startY = -position;
      const distance = TARGET_Y - startY;
      const startTime = performance.now();
      const duration = 650;

      function springAnimate(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const spring = 1 - Math.exp(-7 * t) * Math.cos(5 * t);
        const y = startY + distance * spring;
        strip.style.transform = 'translateY(' + y + 'px)';
        styleItemsByPosition(y, itemHeight, windowHeight);
        if (t < 1) {
          state.animFrameId = requestAnimationFrame(springAnimate);
        } else {
          strip.style.transform = 'translateY(' + TARGET_Y + 'px)';
          strip.classList.add('settled');
          const landingItem = strip.querySelector('[data-landing="true"]');
          if (landingItem) landingItem.classList.add('landed');
          playLand();
          state.isSpinning = false;
          setIsSpinning(false);
          setLastLanded(finalTopic);
          onLandedRef.current?.(finalTopic);
        }
      }

      state.animFrameId = requestAnimationFrame(springAnimate);
    }

    function animate(timestamp) {
      if (lastFrameTime === null) lastFrameTime = timestamp;
      const rawDt = (timestamp - lastFrameTime) / 16.667;
      const dt = Math.min(rawDt, 3);
      lastFrameTime = timestamp;

      if (dt === 0) {
        state.animFrameId = requestAnimationFrame(animate);
        return;
      }

      position += velocity * dt;
      velocity *= Math.pow(FRICTION, dt);

      strip.style.transform = 'translateY(' + -position + 'px)';
      styleItemsByPosition(-position, itemHeight, windowHeight);

      const currentBoundaryIndex = Math.floor(position / itemHeight);
      if (currentBoundaryIndex > lastBoundaryIndex) {
        const progress = 1 - velocity / INITIAL_VELOCITY;
        playTick(Math.min(progress, 0.95));
        lastBoundaryIndex = currentBoundaryIndex;
      }

      if (velocity < STOP_THRESHOLD) {
        snapToTarget();
        return;
      }
      state.animFrameId = requestAnimationFrame(animate);
    }

    state.animFrameId = requestAnimationFrame(animate);
  }

  return {
    windowRef,
    stripRef,
    spin: generateTopic,
    isSpinning,
    lastLanded,
  };
}