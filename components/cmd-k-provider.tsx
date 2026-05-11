'use client';

import { useEffect, useState } from 'react';
import { CommandPalette } from './cmd-k';

export function CmdKProvider() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return <CommandPalette open={open} onClose={() => setOpen(false)} />;
}
