import { EventHandler } from '@create-figma-plugin/utilities'

interface WindowSize {
  width: number;
  height: number;
}

export interface CreateRectanglesHandler extends EventHandler {
  name: 'CREATE_RECTANGLES'
  handler: (count: number) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}

export interface ChangeModeHandler extends EventHandler {
  name: "CHANGE_MODE",
  handler: (mode: string) => void
}

export interface ResizeWindowHandler extends EventHandler {
  name: "RESIZE_WINDOW",
  handler: (windowSize: WindowSize) => void;
}

export interface Mode {
  collection: VariableCollection;
  id: string;
}

export interface Plugin {
  selection: SceneNode[];
}

export interface Group {
  title: string;
  modes: string[]
}
