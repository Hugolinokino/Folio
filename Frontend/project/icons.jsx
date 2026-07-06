/* Shared SVG icons — minimal stroke style, no emojis */
const Icon = ({ name, size = 16, stroke = 1.5, style }) => {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round', style,
  };
  switch (name) {
    case 'arrow-left':  return <svg {...props}><path d="M15 18l-6-6 6-6"/></svg>;
    case 'arrow-right': return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'arrow-up-right': return <svg {...props}><path d="M7 17L17 7M9 7h8v8"/></svg>;
    case 'plus':        return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'search':      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case 'filter':      return <svg {...props}><path d="M4 5h16M7 12h10M10 19h4"/></svg>;
    case 'check':       return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
    case 'close':       return <svg {...props}><path d="M6 6l12 12M6 18L18 6"/></svg>;
    case 'book':        return <svg {...props}><path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4V4z"/><path d="M4 16h14"/></svg>;
    case 'folder':      return <svg {...props}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>;
    case 'doc':         return <svg {...props}><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>;
    case 'note':        return <svg {...props}><path d="M5 4h11l3 3v13H5z"/><path d="M9 11h8M9 15h6"/></svg>;
    case 'globe':       return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>;
    case 'scales':      return <svg {...props}><path d="M12 4v16M5 4h14M5 9l-2 6h6l-2-6M19 9l-2 6h6l-2-6"/></svg>;
    case 'sparkle':     return <svg {...props}><path d="M12 3l1.6 4.6L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.4L12 3z"/><path d="M19 16l.7 1.6L21 18l-1.3.6L19 20l-.7-1.4L17 18l1.3-.6L19 16z"/></svg>;
    case 'quote':       return <svg {...props}><path d="M7 9c-2 0-3 1-3 3v5h5v-5H6c0-1 1-2 2-2zM18 9c-2 0-3 1-3 3v5h5v-5h-3c0-1 1-2 2-2z"/></svg>;
    case 'pen':         return <svg {...props}><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/></svg>;
    case 'download':    return <svg {...props}><path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14"/></svg>;
    case 'menu-dots':   return <svg {...props}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>;
    case 'tag':         return <svg {...props}><path d="M3 12V5a2 2 0 012-2h7l9 9-9 9-9-9z"/><circle cx="8" cy="8" r="1.2"/></svg>;
    case 'sort':        return <svg {...props}><path d="M8 6v12m0 0l-3-3m3 3l3-3M16 18V6m0 0l-3 3m3-3l3 3"/></svg>;
    case 'columns':     return <svg {...props}><rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/></svg>;
    case 'list':        return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case 'grid':        return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case 'time':        return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'pin':         return <svg {...props}><path d="M12 2l3 6 6 .9-4.4 4.3 1 6.1L12 16.7 6.4 19.3l1-6.1L3 9l6-.9L12 2z"/></svg>;
    case 'link':        return <svg {...props}><path d="M10 13a4 4 0 005.66 0l3-3a4 4 0 10-5.66-5.66l-1 1"/><path d="M14 11a4 4 0 00-5.66 0l-3 3a4 4 0 105.66 5.66l1-1"/></svg>;
    case 'export':      return <svg {...props}><path d="M12 4v12m0-12l4 4m-4-4l-4 4M5 20h14"/></svg>;
    case 'mic':         return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 19v3"/></svg>;
    case 'flag':        return <svg {...props}><path d="M5 21V4M5 4h11l-1.5 4L17 12H5"/></svg>;
    case 'star':        return <svg {...props}><path d="M12 3l2.6 6 6.4.5-4.9 4.2 1.5 6.3L12 16.7 6.4 20l1.5-6.3L3 9.5l6.4-.5L12 3z"/></svg>;
    case 'archive':     return <svg {...props}><path d="M3 5h18v4H3zM5 9v11h14V9M10 13h4"/></svg>;
    case 'home':        return <svg {...props}><path d="M4 11l8-7 8 7M6 10v9h12v-9"/></svg>;
    case 'chevron-down':return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'edit':        return <svg {...props}><path d="M4 20h4L18 10l-4-4L4 16v4z"/><path d="M13 7l4 4"/></svg>;
    case 'upload':      return <svg {...props}><path d="M12 16V4m0 0l-5 5m5-5l5 5M5 20h14"/></svg>;
    case 'chat':        return <svg {...props}><path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 10h8M8 13h5"/></svg>;
    case 'sun':         return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case 'moon':        return <svg {...props}><path d="M20 14.5A8 8 0 119.5 4a6.5 6.5 0 0010.5 10.5z"/></svg>;
    case 'graph':       return <svg {...props}><circle cx="6" cy="7" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="16" cy="17" r="2.4"/><circle cx="8" cy="16" r="2.4"/><path d="M8.2 8.3l6 6M8 7.4l8-1M16 8.3L9 15"/></svg>;
    case 'mail':        return <svg {...props}><path d="M4 5h16v14H4z"/><path d="M4 6l8 7 8-7"/></svg>;
    case 'lock':         return <svg {...props}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>;
    case 'eye':          return <svg {...props}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="2.6"/></svg>;
    default: return null;
  }
};

window.Icon = Icon;
