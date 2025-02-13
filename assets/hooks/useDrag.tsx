import { useDragContext } from "@/contexts/drag";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function getNextPrev(index: number, positions: Map<HTMLElement, number>) {
    const sortedPositions = [...positions.entries()].sort(([, a], [, b]) => a - b);
    const prev = sortedPositions[index - 1];
    const next = sortedPositions[index + 1];
    return { prevRef: prev?.[0], prevPosition: prev?.[1], nextRef: next?.[0], nextPosition: next?.[1] };
}

export function useDrag(updateItems: (from: number, to: number) => void) {
    const [dragIndex, setDragIndex] = useState(-1);
    const refs = useRef<HTMLElement[]>([]);

    const register = useCallback((ref: HTMLElement) => {
        if (!refs.current.includes(ref)) {
            refs.current.push(ref);
            return () => refs.current.splice(refs.current.indexOf(ref), 1);
        }
    }, []);

    const startDrag = useCallback(
        (event: MouseEvent, index: number) => {
            const ref = refs.current[index];
            if (!ref) {
                return;
            }

            const startIndex = index;
            setDragIndex(index);
            const startY = event.pageY;
            const positions = new Map(
                refs.current.map((ref) => {
                    const { height, top } = ref.getBoundingClientRect();
                    return [ref, top + height / 2];
                }) as [HTMLElement, number][]
            );
            const deltas = new Map(refs.current.map((ref) => [ref, 0]));
            const { height, top } = ref.getBoundingClientRect();
            const position = top + height / 2;
            let { nextPosition, nextRef, prevPosition, prevRef } = getNextPrev(index, positions);

            function onDrag(event) {
                const deltaY = event.pageY - startY;
                ref.style.transform = `translateY(${deltaY}px)`;
                const newPosition = position + deltaY;
                positions.set(ref, position + deltaY);
                // Swap with above item
                if (prevPosition !== undefined && newPosition < prevPosition) {
                    if (deltas.get(prevRef) === 0) {
                        prevRef.style.translate = `0 ${height}px`;
                        deltas.set(prevRef, height);
                    } else {
                        prevRef.style.translate = "0 0";
                        deltas.set(prevRef, 0);
                    }
                    positions.set(prevRef, prevPosition + height);
                    index--;
                    ({ nextPosition, nextRef, prevPosition, prevRef } = getNextPrev(index, positions));
                }
                // Swap with below item
                if (nextPosition !== undefined && newPosition > nextPosition) {
                    if (deltas.get(nextRef) === 0) {
                        nextRef.style.translate = `0 ${-height}px`;
                        deltas.set(nextRef, -height);
                    } else {
                        nextRef.style.translate = "0 0";
                        deltas.set(nextRef, 0);
                    }
                    positions.set(nextRef, nextPosition - height);
                    index++;
                    ({ nextPosition, nextRef, prevPosition, prevRef } = getNextPrev(index, positions));
                }
            }

            function endDrag() {
                window.removeEventListener("mousemove", onDrag);
                ref.style.transform = "translateY(0)";
                for (const [ref, delta] of deltas.entries()) {
                    if (delta) {
                        ref.style.translate = "0 0";
                    }
                }
                setDragIndex(-1);
                updateItems(startIndex, index);
            }

            window.addEventListener("mousemove", onDrag);
            window.addEventListener("mouseup", endDrag, { once: true });
        },
        [updateItems]
    );

    return useMemo(() => ({ dragIndex, register, startDrag }), [dragIndex, register, startDrag]);
}

export function useDragItem() {
    const { dragIndex, register, startDrag } = useDragContext();
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) {
            return register(ref.current);
        }
    }, [register]);
    return { dragIndex, ref, startDrag };
}
