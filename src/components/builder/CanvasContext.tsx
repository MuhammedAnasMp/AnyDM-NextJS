import * as React from 'react';

export const CanvasContext = React.createContext({
  pan: { x: 0, y: 0 },
  scale: 1,
});

export function useCanvas() {
  return React.useContext(CanvasContext);
}
