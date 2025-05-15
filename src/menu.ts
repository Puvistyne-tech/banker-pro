import { Menu, MenuItem, PredefinedMenuItem } from '@tauri-apps/api/menu';

export async function setupAppMenu({
  pdfDoc,
  handleFileUpload,
  closePdf,
  handleSaveAnnotationsToFile,
  handleLoadAnnotationsFromFile,
  handleExport,
  undo,
  redo,
  canUndo,
  canRedo,
  toggleOverlays,
  handleZoom,
  currentAnnotations
}: {
  pdfDoc: any,
  handleFileUpload: () => void,
  closePdf: () => void,
  handleSaveAnnotationsToFile: () => void,
  handleLoadAnnotationsFromFile: () => void,
  handleExport: (type: 'json' | 'csv') => void,
  undo: () => void,
  redo: () => void,
  canUndo: () => boolean,
  canRedo: () => boolean,
  toggleOverlays: () => void,
  handleZoom: (delta: number) => void,
  currentAnnotations: any[]
}) {
  // App menu (banker-pro)
  const about = await MenuItem.new({
    id: 'about',
    text: 'About Banker Pro',
    action: () => console.log('About clicked'),
  });
  const settings = await MenuItem.new({
    id: 'settings',
    text: 'Settings...',
    action: () => console.log('Settings clicked'),
  });
  const separator = await PredefinedMenuItem.new({
    text: 'separator',
    item: 'Separator',
  });
  const quit = await PredefinedMenuItem.new({
    text: 'Quit',
    item: 'Quit',
  });

  const appMenu = {
    id: 'app',
    text: 'Banker Pro',
    items: [about, settings, separator, quit],
  };

  // File menu
  const open = await MenuItem.new({
    id: 'open',
    text: 'Open PDF...',
    accelerator: 'CmdOrCtrl+O',
    action: handleFileUpload,
  });
  const close = await MenuItem.new({
    id: 'close',
    text: 'Close',
    accelerator: 'CmdOrCtrl+W',
    enabled: !!pdfDoc,
    action: closePdf,
  });
  const save = await MenuItem.new({
    id: 'save',
    text: 'Save Annotations...',
    accelerator: 'CmdOrCtrl+S',
    enabled: !!pdfDoc && currentAnnotations.length > 0,
    action: handleSaveAnnotationsToFile,
  });
  const load = await MenuItem.new({
    id: 'load',
    text: 'Load Annotations...',
    accelerator: 'CmdOrCtrl+L',
    enabled: !!pdfDoc,
    action: handleLoadAnnotationsFromFile,
  });
  const exportJson = await MenuItem.new({
    id: 'export-json',
    text: 'Export as JSON...',
    enabled: !!pdfDoc && currentAnnotations.length > 0,
    action: () => handleExport('json'),
  });
  const exportCsv = await MenuItem.new({
    id: 'export-csv',
    text: 'Export as CSV...',
    enabled: !!pdfDoc && currentAnnotations.length > 0,
    action: () => handleExport('csv'),
  });

  const fileMenu = {
    id: 'file',
    text: 'File',
    items: [open, close, save, load, exportJson, exportCsv],
  };

  // Edit menu
  const undoItem = await MenuItem.new({
    id: 'undo',
    text: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    enabled: canUndo(),
    action: undo,
  });
  const redoItem = await MenuItem.new({
    id: 'redo',
    text: 'Redo',
    accelerator: 'CmdOrCtrl+Shift+Z',
    enabled: canRedo(),
    action: redo,
  });
  const toggleOverlaysItem = await MenuItem.new({
    id: 'toggle-overlays',
    text: 'Toggle Overlays',
    accelerator: 'CmdOrCtrl+T',
    enabled: !!pdfDoc,
    action: toggleOverlays,
  });
  const editMenu = {
    id: 'edit',
    text: 'Edit',
    items: [undoItem, redoItem, toggleOverlaysItem],
  };

  // View menu
  const zoomIn = await MenuItem.new({
    id: 'zoom-in',
    text: 'Zoom In',
    accelerator: 'CmdOrCtrl+Plus',
    enabled: !!pdfDoc,
    action: () => handleZoom(0.1),
  });
  const zoomOut = await MenuItem.new({
    id: 'zoom-out',
    text: 'Zoom Out',
    accelerator: 'CmdOrCtrl+Minus',
    enabled: !!pdfDoc,
    action: () => handleZoom(-0.1),
  });
  const resetZoom = await MenuItem.new({
    id: 'reset-zoom',
    text: 'Reset Zoom',
    accelerator: 'CmdOrCtrl+0',
    enabled: !!pdfDoc,
    action: () => handleZoom(0),
  });
  const viewMenu = {
    id: 'view',
    text: 'View',
    items: [zoomIn, zoomOut, resetZoom],
  };

  // Create the menu with all items in one go
  const menu = await Menu.new({
    items: [appMenu, fileMenu, editMenu, viewMenu],
  });
  await menu.setAsAppMenu();
} 