import { once, on, showUI } from '@create-figma-plugin/utilities'

import { CloseHandler, ChangeModeHandler, Mode, Plugin } from './types'

export default function () {
  once<CloseHandler>('CLOSE', () => figma.closePlugin());
  on<ChangeModeHandler>("CHANGE_MODE", changeMode); 
  on('RESIZE_WINDOW', function (windowSize: { width: number; height: number }) {
    const { width, height } = windowSize
    figma.ui.resize(width, height)
  })

  function changeMode(mode: string) {
    figma.variables.getLocalVariableCollectionsAsync()
        .then(result => result.reduce((modeMap: { [key: string]: Mode[] }, collection) => {
          const modesInCollection = collection.modes.map(mode => mode);
          modesInCollection.forEach(mode => {
            if (!(mode.name in modeMap)) {
              modeMap[mode.name] = Array.of({ collection, id: mode.modeId });
            } else {
              modeMap[mode.name].push({ collection, id: mode.modeId});
            }
          })
          return modeMap;
        }, {}))
        .then(result => {
          result[`${mode}`].forEach(collection => {
            const selection = figma.currentPage.selection.filter(node => node.type === "FRAME") || [] as SceneNode[];
            selection.forEach(selection => {
              selection.setExplicitVariableModeForCollection(collection.collection, collection.id);
            })
        })
      });
  
  }

  figma.variables.getLocalVariableCollectionsAsync()
    .then(result => result.reduce((modeMap: { [key: string]: Mode[] }, collection) => {
      const modesInCollection = collection.modes.map(mode => mode);
      if (modesInCollection.length === 0) {
        return modeMap;
      }
      modesInCollection.forEach(mode => {
        if (!(mode.name in modeMap)) {
          modeMap[mode.name] = Array.of({ collection, id: mode.modeId });
        } else {
          modeMap[mode.name].push({ collection, id: mode.modeId});
        }
      })
      return modeMap;
    }, {}))
    .then(result => {
      showUI({
        width: 240
      }, { modes: Object.keys(result), selected: figma.currentPage.selection.filter(node => node.type === "FRAME").length});
      const plugin = init();
      checkSelection();

      figma.on("selectionchange", () => {
        plugin.selection = getSelection();
        checkSelection();
        figma.ui.postMessage({
          type: 'UPDATE_SELECTED',
          data: plugin.selection.length
        });
      });

      function getSelection(): SceneNode[] {
        return figma.currentPage.selection.filter(node => node.type === "FRAME") || [] as SceneNode[];
      }
    
      function postSelectionError() {
          figma.ui.postMessage({ type: "error", message: "No Frame selected"})
      }
    
      function postSelectionOk() {
        figma.ui.postMessage({ type: "success", message: "No Frame selected"})
      }
    
      function init(): Plugin {
        return {
          selection: getSelection()
        }
      }
    
      function checkSelection() {
        plugin.selection.length === 0
          ? postSelectionError()
          : postSelectionOk()
      }
})}

