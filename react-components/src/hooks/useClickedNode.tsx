/*!
 * Copyright 2023 Cognite AS
 */

import { type CadIntersection, type PointerEventData } from '@cognite/reveal';
import { type DmsUniqueIdentifier, type Source, useReveal } from '../';
import { useEffect, useState } from 'react';
import { useFdm3dNodeData } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type Node3D } from '@cognite/sdk';

export type NodeDataResult = {
  fdmNode: DmsUniqueIdentifier;
  view: Source;
  cadNode: Node3D;
};

export type ClickedNodeData = Partial<NodeDataResult> & {
  intersection: CadIntersection;
};

export const useClickedNodeData = (): ClickedNodeData | undefined => {
  const viewer = useReveal();

  const [cadIntersection, setCadIntersection] = useState<CadIntersection | undefined>(undefined);
  const [clickedNodeData, setClickedNodeData] = useState<ClickedNodeData | undefined>(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      void (async () => {
        const intersection = await viewer.getIntersectionFromPixel(event.offsetX, event.offsetY);

        if (intersection?.type === 'cad') {
          setCadIntersection(intersection);
        } else {
          setCadIntersection(undefined);
        }
      })();
    };

    viewer.on('click', callback);

    return () => {
      viewer.off('click', callback);
    };
  }, [viewer]);

  const nodeData = useFdm3dNodeData(
    cadIntersection?.model.modelId,
    cadIntersection?.model.revisionId,
    cadIntersection?.treeIndex
  ).data;

  useEffect(() => {
    if (isWaitingForQueryResult()) {
      return;
    }

    const nodeDataList = nodeData ?? [];

    if (cadIntersection === undefined) {
      setClickedNodeData(undefined);
      return;
    }

    if (nodeDataList.length === 0) {
      setClickedNodeData({
        intersection: cadIntersection
      });
      return;
    }

    const chosenNode = nodeDataList[0];

    setClickedNodeData({
      intersection: cadIntersection,
      fdmNode: chosenNode.edge.startNode,
      view: chosenNode.view,
      cadNode: chosenNode.node
    });

    function isWaitingForQueryResult(): boolean {
      return nodeData === undefined && cadIntersection !== undefined;
    }
  }, [nodeData]);

  return clickedNodeData;
};
