/*!
 * Copyright 2024 Cognite AS
 */
import {
  type InstanceFilter,
  type NodeItem,
  type Source,
  type DmsUniqueIdentifier,
  type ViewItem
} from './FdmSDK';
import { type AddModelOptions } from '@cognite/reveal';
import { type InstancesWithView } from '../query/useSearchMappedEquipmentFDM';
import { type FdmCadConnection } from '../components/CacheProvider/types';
import { type TaggedAddResourceOptions } from '../components/Reveal3DResources/types';

export type Fdm3dDataProvider = {
  is3dView: (view: ViewItem) => boolean;

  getDMSModels: (modelId: number) => Promise<DmsUniqueIdentifier[]>;

  getEdgeConnected3dInstances: (instance: DmsUniqueIdentifier) => Promise<DmsUniqueIdentifier[]>;

  getFdmConnectionsForNodeIds: (
    models: DmsUniqueIdentifier[],
    revisionId: number,
    nodeIds: number[]
  ) => Promise<FdmCadConnection[]>;

  listMappedFdmNodes: (
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instancesFilter: InstanceFilter | undefined,
    limit: number
  ) => Promise<NodeItem[]>;

  listAllMappedFdmNodes: (
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined
  ) => Promise<NodeItem[]>;

  filterNodesByMappedTo3d: (
    nodes: InstancesWithView[],
    models: AddModelOptions[],
    spacesToSearch: string[]
  ) => Promise<InstancesWithView[]>;

  getCadModelsForInstance: (instance: DmsUniqueIdentifier) => Promise<TaggedAddResourceOptions[]>;

  getCadConnectionsForRevisions: (revisions: number[]) => Promise<FdmCadConnection[]>;
};
